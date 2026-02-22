"""
SectorLeadAgent — orchestrates CompanyCoverageAgents, synthesises findings,
maintains persistent conversation thread, and converses with OC.

Uses Sonnet 4.6 with context compaction (beta) and 1M token context window.
"""

import asyncio
import anthropic
import json
from dataclasses import dataclass, field
from agents.config import SectorDef, CompanyDef
from agents.company_agent import CompanyCoverageAgent, CompanyFinding, date_header


SYSTEM_PROMPT_BASE = """You are {designation}, a senior equity research analyst
covering the {sector_name} sector for Kabuten.

You report directly to OC, the portfolio orchestrator and sole user of this platform.
Address OC by name in your responses — for example:
  "OC, the latest sweep data suggests..."
  "In my view, OC, this is a material development..."
  "OC, I'd flag the following risk..."

Your role is to synthesise Daily Sweep data and Investment Views from the individual
Company Analyst Agents covering your sector, identify sector-level patterns, and
maintain a living sector thesis that OC can act on.
"""


@dataclass
class SectorSynthesis:
    sector_key: str
    designation: str
    posture: str  # "bullish" | "neutral" | "bearish"
    conviction: float  # 0-10
    thesis_summary: str
    key_drivers: list[str]
    key_risks: list[str]
    company_signals: list[dict]
    material_findings: list[dict]


class SectorLeadAgent:
    """Lead agent for a sector — orchestrates sub-agents and maintains thread."""

    def __init__(self, sector: SectorDef):
        self.sector = sector
        self.key = sector.key
        self.designation = sector.designation
        self.name = sector.name
        self._thread_history: list[dict] = []
        self.client = anthropic.Anthropic()

    def load_thread_history(self, history: list[dict]) -> None:
        """Load persisted thread history from database."""
        self._thread_history = history or []

    def export_thread(self) -> list[dict]:
        """Export current thread for persistence."""
        return self._thread_history

    def _system_prompt(self) -> str:
        """Build full system prompt with date header + OC identity."""
        return (
            date_header()
            + SYSTEM_PROMPT_BASE.format(
                designation=self.designation,
                sector_name=self.name,
            )
            + f"\nSector context: {self.sector.system_context}\n"
        )

    async def run_daily_sweep(self) -> SectorSynthesis:
        """Run sweep across all companies and synthesise sector view."""
        agents = [
            CompanyCoverageAgent(
                ticker=c.ticker,
                exchange=c.exchange,
                company_name=c.name,
                sector_context=self.sector.system_context,
            )
            for c in self.sector.companies
        ]

        findings: list[CompanyFinding] = await asyncio.gather(
            *[agent.sweep() for agent in agents]
        )

        # Identify escalations for deep-dive
        escalations = [f for f in findings if f.requires_escalation]
        if escalations:
            deep_agents = [
                CompanyCoverageAgent(
                    ticker=f.ticker,
                    exchange="",
                    company_name=f.company_name,
                    sector_context=self.sector.system_context,
                )
                for f in escalations
            ]
            deep_findings = await asyncio.gather(
                *[a.sweep(effort="high") for a in deep_agents]
            )
            deep_map = {f.ticker: f for f in deep_findings}
            findings = [deep_map.get(f.ticker, f) for f in findings]

        synthesis = await self._synthesise(findings)

        # Append sweep to thread history
        sweep_entry = {
            "role": "system",
            "type": "sweep",
            "timestamp": self._now(),
            "findings": [self._finding_to_dict(f) for f in findings],
            "synthesis": {
                "posture": synthesis.posture,
                "conviction": synthesis.conviction,
                "thesis_summary": synthesis.thesis_summary,
            },
        }
        self._thread_history.append(sweep_entry)

        return synthesis

    async def chat(self, message: str) -> str:
        """Handle OC chat message and return agent reply."""
        self._thread_history.append({
            "role": "user",
            "type": "oc_message",
            "timestamp": self._now(),
            "content": message,
        })

        messages = self._build_chat_messages()
        messages.append({"role": "user", "content": message})

        response = self.client.messages.create(
            model="claude-sonnet-4-6-20250929",
            max_tokens=4096,
            betas=["interleaved-thinking-2025-05-14"],
            system=self._system_prompt(),
            messages=messages,
            thinking={
                "type": "enabled",
                "budget_tokens": 4096,
            },
        )

        reply = ""
        for block in response.content:
            if hasattr(block, "text"):
                reply += block.text

        self._thread_history.append({
            "role": "assistant",
            "type": "agent_response",
            "timestamp": self._now(),
            "content": reply,
        })

        return reply

    async def _synthesise(self, findings: list[CompanyFinding]) -> SectorSynthesis:
        """Synthesise individual findings into a sector-level view."""
        findings_text = "\n".join(
            f"- {f.company_name} ({f.ticker}): [{f.finding_type}] {f.headline}"
            for f in findings
        )
        material = [f for f in findings if f.finding_type == "material"]

        prompt = (
            date_header()
            + f"You are {self.designation}, lead analyst for {self.name}.\n\n"
            f"Today's company sweep results:\n{findings_text}\n\n"
            "Synthesise these into a sector-level view for OC. Return JSON:\n"
            '{"posture": "bullish|neutral|bearish", "conviction": 0-10, '
            '"thesis_summary": "...", "key_drivers": ["..."], "key_risks": ["..."]}'
        )

        response = self.client.messages.create(
            model="claude-sonnet-4-6-20250929",
            max_tokens=2048,
            thinking={"type": "enabled", "budget_tokens": 2048},
            messages=[{"role": "user", "content": prompt}],
        )

        text = ""
        for block in response.content:
            if hasattr(block, "text"):
                text += block.text

        import re
        try:
            match = re.search(r"\{[\s\S]*\}", text)
            data = json.loads(match.group()) if match else {}
        except (json.JSONDecodeError, AttributeError):
            data = {}

        return SectorSynthesis(
            sector_key=self.key,
            designation=self.designation,
            posture=data.get("posture", "neutral"),
            conviction=float(data.get("conviction", 5.0)),
            thesis_summary=data.get("thesis_summary", ""),
            key_drivers=data.get("key_drivers", []),
            key_risks=data.get("key_risks", []),
            company_signals=[self._finding_to_dict(f) for f in findings],
            material_findings=[self._finding_to_dict(f) for f in material],
        )

    def _build_chat_messages(self) -> list[dict]:
        """Build Claude-compatible message list from thread history."""
        messages = []
        for entry in self._thread_history[-20:]:
            if entry.get("type") in ("oc_message", "pm_message"):
                messages.append({"role": "user", "content": entry["content"]})
            elif entry.get("type") == "agent_response":
                messages.append({"role": "assistant", "content": entry["content"]})
        return messages

    @staticmethod
    def _finding_to_dict(f: CompanyFinding) -> dict:
        return {
            "ticker": f.ticker,
            "company_name": f.company_name,
            "finding_type": f.finding_type,
            "headline": f.headline,
            "detail": f.detail,
            "signal": f.signal,
            "category": f.category,
            "assessment": f.assessment,
        }

    @staticmethod
    def _now() -> str:
        from datetime import datetime, timezone
        return datetime.now(timezone.utc).isoformat()
