"""
Sector & company definitions — single source of truth for tickers, exchanges,
and sector-specific system prompt context.

All 7 sectors and 48 companies verified against the live database on 22 Feb 2026.
Do not alter tickers or exchanges.
"""

from dataclasses import dataclass, field

@dataclass
class CompanyDef:
    ticker: str
    exchange: str
    name: str

@dataclass
class SectorDef:
    key: str
    designation: str
    name: str
    colour: str
    companies: list[CompanyDef] = field(default_factory=list)
    system_context: str = ""

# ── Agent designations ──
AGENT_DESIGNATIONS = {
    "au_enterprise_software":    "APEX",
    "china_digital_consumption": "ORIENT",
    "dc_power_cooling":          "VOLT",
    "india_it_services":         "INDRA",
    "memory_semis":              "HELIX",
    "networking_optics":         "PHOTON",
    "semi_equipment":            "FORGE",
}

# ── Sector definitions with company rosters ──
SECTORS: dict[str, SectorDef] = {
    "au_enterprise_software": SectorDef(
        key="au_enterprise_software",
        designation="APEX",
        name="AU Enterprise Software",
        colour="#6366f1",
        companies=[
            CompanyDef("WTC", "ASX", "WiseTech Global"),
            CompanyDef("XRO", "ASX", "Xero"),
            CompanyDef("PME", "ASX", "Pro Medicus"),
            CompanyDef("REA", "ASX", "REA Group"),
            CompanyDef("SEK", "ASX", "Seek"),
        ],
        system_context=(
            "Australian enterprise software and digital platforms. "
            "Focus on ASX-listed SaaS companies with global ambitions. "
            "Key themes: cloud migration, AI integration, AUD/USD sensitivity, "
            "valuation premium sustainability, and founder-led culture."
        ),
    ),
    "china_digital_consumption": SectorDef(
        key="china_digital_consumption",
        designation="ORIENT",
        name="China Digital Consumption",
        colour="#f59e0b",
        companies=[
            CompanyDef("9988", "HKEX", "Alibaba Group"),
            CompanyDef("BIDU", "NASDAQ", "Baidu"),
            CompanyDef("NTES", "NASDAQ", "NetEase"),
            CompanyDef("0700", "HKEX", "Tencent Holdings"),
            CompanyDef("TME", "NYSE", "Tencent Music Entertainment"),
            CompanyDef("TCOM", "NASDAQ", "Trip.com Group"),
        ],
        system_context=(
            "Chinese internet and digital consumption platforms. "
            "Focus on regulatory environment, consumer spending recovery, "
            "AI monetisation, gaming approvals, cloud growth, and "
            "US-China geopolitical risk for dual-listed names."
        ),
    ),
    "dc_power_cooling": SectorDef(
        key="dc_power_cooling",
        designation="VOLT",
        name="DC Power & Cooling",
        colour="#ef4444",
        companies=[
            CompanyDef("3324", "TWSE", "Auras Technology"),
            CompanyDef("2308", "TWSE", "Delta Electronics"),
            CompanyDef("6501", "TSE", "Hitachi"),
            CompanyDef("VST", "NYSE", "Vistra Corp"),
        ],
        system_context=(
            "Data-centre power infrastructure and cooling solutions. "
            "Focus on hyperscaler capex cycles, power density per rack, "
            "liquid cooling adoption, nuclear/renewable power sourcing, "
            "and the energy-to-compute cost ratio."
        ),
    ),
    "india_it_services": SectorDef(
        key="india_it_services",
        designation="INDRA",
        name="India IT Services",
        colour="#10b981",
        companies=[
            CompanyDef("INFY", "NSE", "Infosys"),
            CompanyDef("TCS", "NSE", "Tata Consultancy Services"),
            CompanyDef("TECHM", "NSE", "Tech Mahindra"),
            CompanyDef("WIPRO", "NSE", "Wipro"),
        ],
        system_context=(
            "Indian IT services and digital transformation leaders. "
            "Focus on deal pipeline, large deal wins, attrition rates, "
            "margin trajectory, GenAI services adoption, and "
            "discretionary spending recovery in BFSI/retail verticals."
        ),
    ),
    "memory_semis": SectorDef(
        key="memory_semis",
        designation="HELIX",
        name="Memory Semis",
        colour="#8b5cf6",
        companies=[
            CompanyDef("285A", "TSE", "Kioxia Holdings"),
            CompanyDef("MU", "NASDAQ", "Micron Technology"),
            CompanyDef("005930", "KRX", "Samsung Electronics"),
            CompanyDef("SNDK", "NASDAQ", "SanDisk"),
            CompanyDef("STX", "NASDAQ", "Seagate Technology"),
            CompanyDef("000660", "KRX", "SK Hynix"),
        ],
        system_context=(
            "Memory semiconductors and storage. "
            "Focus on DRAM/NAND pricing cycles, HBM capacity build-out, "
            "AI server memory content growth, inventory normalisation, "
            "capex discipline, and technology node transitions."
        ),
    ),
    "networking_optics": SectorDef(
        key="networking_optics",
        designation="PHOTON",
        name="Networking & Optics",
        colour="#06b6d4",
        companies=[
            CompanyDef("2345", "TWSE", "Accton Technology"),
            CompanyDef("CLS", "NYSE", "Celestica"),
            CompanyDef("COHR", "NYSE", "Coherent Corp"),
            CompanyDef("FN", "NYSE", "Fabrinet"),
            CompanyDef("LITE", "NASDAQ", "Lumentum"),
            CompanyDef("300394", "SZSE", "Suzhou TFC Optical"),
            CompanyDef("300308", "SZSE", "Zhongji Innolight"),
        ],
        system_context=(
            "Networking equipment and optical components for AI/data-centre. "
            "Focus on 800G/1.6T transceiver ramp, co-packaged optics timeline, "
            "hyperscaler network architecture shifts, silicon photonics, "
            "and China optical supply chain dynamics."
        ),
    ),
    "semi_equipment": SectorDef(
        key="semi_equipment",
        designation="FORGE",
        name="Semi Equipment",
        colour="#ec4899",
        companies=[
            CompanyDef("688082", "SSE", "ACM Research"),
            CompanyDef("6857", "TSE", "Advantest"),
            CompanyDef("AMAT", "NASDAQ", "Applied Materials"),
            CompanyDef("3711", "TWSE", "ASE Technology"),
            CompanyDef("ASML", "NASDAQ", "ASML"),
            CompanyDef("6146", "TSE", "Disco Corp"),
            CompanyDef("6361", "TSE", "Ebara Corp"),
            CompanyDef("7741", "TSE", "Hoya Corp"),
            CompanyDef("KLAC", "NASDAQ", "KLA Corporation"),
            CompanyDef("6525", "TSE", "Kokusai Electric"),
            CompanyDef("LRCX", "NASDAQ", "Lam Research"),
            CompanyDef("6920", "TSE", "Lasertec"),
            CompanyDef("6323", "TSE", "Rorze Corp"),
            CompanyDef("7735", "TSE", "Screen Holdings"),
            CompanyDef("8035", "TSE", "Tokyo Electron"),
            CompanyDef("7729", "TSE", "Tokyo Seimitsu"),
        ],
        system_context=(
            "Semiconductor production equipment spanning lithography, deposition, "
            "etch, test, packaging, and metrology. Focus on WFE spending cycles, "
            "EUV/High-NA adoption, advanced packaging growth, China export controls, "
            "TSMC/Samsung/Intel capex plans, and equipment intensity per node."
        ),
    ),
}

# ── Convenience lookups ──
def get_sector(key: str) -> SectorDef | None:
    return SECTORS.get(key)

def get_designation(key: str) -> str:
    return AGENT_DESIGNATIONS.get(key, "UNKNOWN")

def get_sector_by_designation(designation: str) -> SectorDef | None:
    for s in SECTORS.values():
        if s.designation == designation:
            return s
    return None

def all_sector_keys() -> list[str]:
    return list(SECTORS.keys())
