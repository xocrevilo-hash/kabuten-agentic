"""
Sector & company definitions — single source of truth for tickers, exchanges,
and sector-specific system prompt context.

All 17 sectors and 94 companies verified against the live database on 22 Feb 2026.
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
    "ev_supply_chain":           "SURGE",
    "china_ai_apps":             "SYNTH",
    "china_semis":               "DRAGON",
    "japan_materials":           "TERRA",
    "gaming":                    "PIXEL",
    "pcb_supply_chain":          "LAYER",
    "asean_ecommerce":           "TIDE",
    "ai_semis":                  "NOVA",
    "mlccs":                     "FERRO",
    "server_odms":               "RACK",
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
            CompanyDef("PDD", "NASDAQ", "PDD Holdings"),
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
            CompanyDef("2301", "TWSE", "Lite-On Technology"),
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
            CompanyDef("2408", "TWSE", "Nanya Technology"),
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
            CompanyDef("300502", "SZSE", "Eoptolink Technology"),
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
            CompanyDef("002371", "SZSE", "NAURA Technology"),
        ],
        system_context=(
            "Semiconductor production equipment spanning lithography, deposition, "
            "etch, test, packaging, and metrology. Focus on WFE spending cycles, "
            "EUV/High-NA adoption, advanced packaging growth, China export controls, "
            "TSMC/Samsung/Intel capex plans, and equipment intensity per node."
        ),
    ),
    # ── 10 new sectors ──
    "ev_supply_chain": SectorDef(
        key="ev_supply_chain",
        designation="SURGE",
        name="EV Supply-chain",
        colour="#84cc16",
        companies=[
            CompanyDef("TSLA", "NASDAQ", "Tesla"),
            CompanyDef("1211", "HKEX", "BYD Company"),
            CompanyDef("300750", "SZSE", "CATL"),
            CompanyDef("1810", "HKEX", "Xiaomi"),
            CompanyDef("373220", "KRX", "LG Energy Solution"),
        ],
        system_context=(
            "Electric vehicle supply chain spanning OEMs, battery manufacturers, "
            "and EV component suppliers. Focus on EV adoption curves, battery "
            "chemistry transitions (LFP vs NMC vs solid-state), charging infrastructure "
            "buildout, autonomous driving progress, and regional subsidy policies."
        ),
    ),
    "china_ai_apps": SectorDef(
        key="china_ai_apps",
        designation="SYNTH",
        name="China AI Apps",
        colour="#a855f7",
        companies=[
            CompanyDef("0100", "HKEX", "Camsing International"),
            CompanyDef("2513", "HKEX", "NetDragon Websoft"),
        ],
        system_context=(
            "Chinese AI application companies developing consumer and enterprise "
            "AI products. Focus on large language model deployment, AI-native apps, "
            "regulatory landscape for generative AI in China, monetisation models, "
            "and competitive positioning vs domestic and US rivals."
        ),
    ),
    "china_semis": SectorDef(
        key="china_semis",
        designation="DRAGON",
        name="China Semis",
        colour="#dc2626",
        companies=[
            CompanyDef("688981", "SSE", "CXMT"),
            CompanyDef("688256", "SSE", "Cambricon Technologies"),
            CompanyDef("688041", "SSE", "Hygon Information Technology"),
            CompanyDef("603501", "SSE", "Will Semiconductor"),
            CompanyDef("688008", "SSE", "Montage Technology"),
        ],
        system_context=(
            "Chinese domestic semiconductor companies focused on self-sufficiency. "
            "Focus on import substitution progress, US export control impacts, "
            "domestic fab capacity expansion, EDA tool availability, advanced "
            "node development, and government subsidy support."
        ),
    ),
    "japan_materials": SectorDef(
        key="japan_materials",
        designation="TERRA",
        name="Japan Materials",
        colour="#78716c",
        companies=[
            CompanyDef("4004", "TSE", "Resonac Holdings"),
            CompanyDef("3110", "TSE", "Nitto Denko"),
            CompanyDef("3436", "TSE", "SUMCO Corp"),
            CompanyDef("5016", "TSE", "JX Advanced Metals"),
            CompanyDef("4062", "TSE", "Ibiden"),
        ],
        system_context=(
            "Japanese semiconductor and electronic materials suppliers. "
            "Focus on silicon wafer supply/demand, advanced packaging substrates, "
            "specialty chemicals for chip manufacturing, photoresist technology, "
            "JPY currency sensitivity, and capacity expansion plans."
        ),
    ),
    "gaming": SectorDef(
        key="gaming",
        designation="PIXEL",
        name="Gaming",
        colour="#f97316",
        companies=[
            CompanyDef("7974", "TSE", "Nintendo"),
            CompanyDef("6758", "TSE", "Sony Group"),
            CompanyDef("9697", "TSE", "Capcom"),
            CompanyDef("EA", "NASDAQ", "Electronic Arts"),
            CompanyDef("TTWO", "NASDAQ", "Take-Two Interactive"),
        ],
        system_context=(
            "Global gaming companies spanning console, PC, and mobile platforms. "
            "Focus on hardware cycle timing, first-party title pipelines, "
            "live-service revenue models, mobile gaming monetisation, "
            "IP leverage, and cloud gaming adoption trajectory."
        ),
    ),
    "pcb_supply_chain": SectorDef(
        key="pcb_supply_chain",
        designation="LAYER",
        name="PCB Supply-chain",
        colour="#0ea5e9",
        companies=[
            CompanyDef("007660", "KRX", "Simmtech"),
            CompanyDef("2368", "TWSE", "Gold Circuit Electronics"),
            CompanyDef("3037", "TWSE", "Unimicron"),
            CompanyDef("1303", "TWSE", "Nan Ya Plastics"),
        ],
        system_context=(
            "PCB and IC substrate supply chain supporting AI server and "
            "advanced semiconductor packaging demand. Focus on ABF substrate "
            "capacity, HDI PCB technology evolution, AI server motherboard "
            "complexity, layer count increases, and material cost trends."
        ),
    ),
    "asean_ecommerce": SectorDef(
        key="asean_ecommerce",
        designation="TIDE",
        name="ASEAN E-commerce",
        colour="#14b8a6",
        companies=[
            CompanyDef("GRAB", "NASDAQ", "Grab Holdings"),
            CompanyDef("SE", "NYSE", "Sea Limited"),
        ],
        system_context=(
            "Southeast Asian e-commerce and digital economy platforms. "
            "Focus on GMV growth, path to profitability, fintech cross-sell, "
            "food delivery and ride-hailing unit economics, competitive "
            "dynamics with TikTok Shop, and regulatory environment across ASEAN."
        ),
    ),
    "ai_semis": SectorDef(
        key="ai_semis",
        designation="NOVA",
        name="AI Semis",
        colour="#7c3aed",
        companies=[
            CompanyDef("2330", "TWSE", "TSMC"),
            CompanyDef("NVDA", "NASDAQ", "Nvidia"),
            CompanyDef("AVGO", "NASDAQ", "Broadcom"),
            CompanyDef("AMD", "NASDAQ", "AMD"),
            CompanyDef("2454", "TWSE", "MediaTek"),
            CompanyDef("MRVL", "NASDAQ", "Marvell Technology"),
        ],
        system_context=(
            "Core AI semiconductor companies spanning GPU/accelerator design, "
            "foundry manufacturing, and networking silicon. Focus on AI training "
            "and inference demand, custom ASIC trends, advanced node capacity "
            "allocation, HBM integration, and hyperscaler capex trajectories."
        ),
    ),
    "mlccs": SectorDef(
        key="mlccs",
        designation="FERRO",
        name="MLCCs",
        colour="#b45309",
        companies=[
            CompanyDef("6981", "TSE", "Murata Manufacturing"),
            CompanyDef("6762", "TSE", "TDK Corp"),
            CompanyDef("2327", "TWSE", "Yageo"),
            CompanyDef("009150", "KRX", "Samsung Electro-Mechanics"),
        ],
        system_context=(
            "Multi-layer ceramic capacitor (MLCC) and passive component manufacturers. "
            "Focus on automotive electrification demand, AI server capacitor content, "
            "miniaturisation trends, inventory cycle dynamics, pricing power, "
            "and competitive positioning between Japanese, Korean, and Taiwanese players."
        ),
    ),
    "server_odms": SectorDef(
        key="server_odms",
        designation="RACK",
        name="Server ODMs",
        colour="#475569",
        companies=[
            CompanyDef("2317", "TWSE", "Hon Hai (Foxconn)"),
            CompanyDef("2382", "TWSE", "Quanta Computer"),
            CompanyDef("3231", "TWSE", "Wistron"),
        ],
        system_context=(
            "Taiwan-based server ODMs (Original Design Manufacturers) building "
            "AI and cloud servers for hyperscalers. Focus on AI server order "
            "visibility, GPU allocation from Nvidia, rack-level architecture, "
            "liquid cooling integration, margin trajectory, and customer "
            "concentration risk."
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
