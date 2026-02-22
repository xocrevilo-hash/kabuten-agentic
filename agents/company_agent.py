"""
CompanyCoverageAgent — sub-agent for individual company sweep analysis.

Each SectorLeadAgent fans out to N CompanyCoverageAgents concurrently.
Returns structured JSON findings with web search capability.
Runs at effort="low" for routine sweeps, effort="high" for escalated deep-dives.
"""

import anthropic
import json
from dataclasses import dataclass


@dataclass
class CompanyFinding:
    ticker: str
    company_name: str
    finding_type: str  # "none" | "incremental" | "material"
    headline: str
    detail: str
    signal: str  # "bullish" | "neutral" | "bearish" | "watch" | "risk"
    category: str  # "earnings" | "product" | "regulatory" | "competitive" | "macro"
    requires_escalation: bool
    assessment: str  # max 100 words
    sources: list[str]


class CompanyCoverageAgent:
    """Sub-agent for a single company within a sector."""

    def __init__(self, ticker: str, exchange: str, company_name: str, sector_context: str):
        self.ticker = ticker
        self.exchange = exchange
        self.company_name = company_name
        self.sector_context = sector_context
        self.client = anthropic.Anthropic()

    async def sweep(self, effort: str = "low") -> CompanyFinding:
        """Run a sweep for this company using web search."""
        system_prompt = (
            f"You are a coverage analyst for {self.company_name} ({self.ticker} on {self.exchange}). "
            f"Sector context: {self.sector_context}\n\n"
            "Search for the latest news, filings, and developments for this company. "
            "Return a structured JSON finding with these fields:\n"
            "- finding_type: 'none' | 'incremental' | 'material'\n"
            "- headline: one-line summary\n"
            "- detail: key details (max 150 words)\n"
            "- signal: 'bullish' | 'neutral' | 'bearish' | 'watch' | 'risk'\n"
            "- category: 'earnings' | 'product' | 'regulatory' | 'competitive' | 'macro'\n"
            "- requires_escalation: true if material and warrants deep-dive\n"
            "- assessment: investment assessment (max 100 words)\n"
            "- sources: list of source descriptions\n\n"
            "Be rigorous. Most days there is nothing material. Only flag material when "
            "there is a genuine change to the investment thesis."
        )

        thinking_effort = {"low": "low", "medium": "medium", "high": "high"}.get(effort, "low")

        response = self.client.messages.create(
            model="claude-sonnet-4-6-20250929",
            max_tokens=2048,
            thinking={
                "type": "enabled",
                "budget_tokens": 1024 if thinking_effort == "low" else 4096,
            },
            system=system_prompt,
            messages=[{
                "role": "user",
                "content": f"Run today's sweep for {self.company_name} ({self.ticker}). "
                           f"Search for any news, filings, or developments from the past 24 hours.",
            }],
            tools=[{
                "type": "web_search_20250305",
                "name": "web_search",
                "max_uses": 3,
            }],
        )

        # Extract JSON from response
        text = ""
        for block in response.content:
            if hasattr(block, "text"):
                text += block.text

        try:
            # Try direct JSON parse, then regex fallback
            import re
            json_match = re.search(r"\{[\s\S]*\}", text)
            if json_match:
                data = json.loads(json_match.group())
            else:
                data = {}
        except (json.JSONDecodeError, AttributeError):
            data = {}

        return CompanyFinding(
            ticker=self.ticker,
            company_name=self.company_name,
            finding_type=data.get("finding_type", "none"),
            headline=data.get("headline", "No significant developments"),
            detail=data.get("detail", ""),
            signal=data.get("signal", "neutral"),
            category=data.get("category", "macro"),
            requires_escalation=data.get("requires_escalation", False),
            assessment=data.get("assessment", ""),
            sources=data.get("sources", []),
        )
