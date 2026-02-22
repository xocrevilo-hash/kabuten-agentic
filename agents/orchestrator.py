"""
KabutenOrchestrator — top-level manager for the multi-agent sector system.

Runs all 7 sector sweeps concurrently via asyncio.gather.
Routes PM chat messages to the correct sector thread.
"""

import asyncio
from agents.config import SECTORS, SectorDef
from agents.sector_agent import SectorLeadAgent, SectorSynthesis


class KabutenOrchestrator:
    """Top-level orchestrator managing all 7 sector lead agents."""

    def __init__(self):
        self._agents: dict[str, SectorLeadAgent] = {}
        for key, sector in SECTORS.items():
            self._agents[key] = SectorLeadAgent(sector)

    def load_all_threads(self, threads: dict[str, list[dict]]) -> None:
        """Load persisted thread histories for all agents."""
        for key, history in threads.items():
            if key in self._agents:
                self._agents[key].load_thread_history(history)

    def export_thread(self, sector_key: str) -> list[dict]:
        """Export a sector's thread history for persistence."""
        agent = self._agents.get(sector_key)
        return agent.export_thread() if agent else []

    async def run_all_sweeps(self) -> dict[str, SectorSynthesis]:
        """Run daily sweep across all 7 sectors concurrently."""
        results = await asyncio.gather(
            *[agent.run_daily_sweep() for agent in self._agents.values()],
            return_exceptions=True,
        )

        syntheses: dict[str, SectorSynthesis] = {}
        for key, result in zip(self._agents.keys(), results):
            if isinstance(result, Exception):
                # Log error but continue
                print(f"Error sweeping {key}: {result}")
                continue
            syntheses[key] = result

        return syntheses

    async def run_sector_sweep(self, sector_key: str) -> SectorSynthesis | None:
        """Run sweep for a single sector."""
        agent = self._agents.get(sector_key)
        if not agent:
            return None
        return await agent.run_daily_sweep()

    async def chat(self, sector_key: str, message: str) -> str:
        """Route PM chat message to the correct sector agent."""
        agent = self._agents.get(sector_key)
        if not agent:
            return f"Unknown sector: {sector_key}"
        return await agent.chat(message)

    def get_agent(self, sector_key: str) -> SectorLeadAgent | None:
        """Get a sector lead agent by key."""
        return self._agents.get(sector_key)

    def all_agents(self) -> dict[str, SectorLeadAgent]:
        """Get all sector lead agents."""
        return self._agents
