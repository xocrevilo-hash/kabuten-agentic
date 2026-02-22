export interface SectorDefinition {
  name: string;
  label: string;
  companyIds: string[];
}

/**
 * Sector definitions — 17 sectors covering 94 companies.
 * These map to the sector_group column in the companies table.
 * The sector name here must exactly match the sector_group values in the DB.
 */
export const SECTORS: SectorDefinition[] = [
  {
    name: "Australia Enterprise Software",
    label: "AU Enterprise Software",
    companyIds: ["REA", "SEK", "WTC", "XRO", "PME"],
  },
  {
    name: "China Digital Consumption",
    label: "China Digital Consumption",
    companyIds: ["9988", "BIDU", "NTES", "0700", "TME", "TCOM", "PDD"],
  },
  {
    name: "Data-centre Power & Cooling",
    label: "DC Power & Cooling",
    companyIds: ["3324", "2308", "6501", "VST", "2301"],
  },
  {
    name: "India IT Services",
    label: "India IT Services",
    companyIds: ["INFY", "TCS", "TECHM", "WIPRO"],
  },
  {
    name: "Memory Semiconductors",
    label: "Memory Semis",
    companyIds: ["285A", "MU", "005930", "SNDK", "STX", "000660", "2408"],
  },
  {
    name: "Networking & Optics",
    label: "Networking & Optics",
    companyIds: ["2345", "CLS", "COHR", "FN", "LITE", "300394", "300308", "300502"],
  },
  {
    name: "Semiconductor Production Equipment",
    label: "Semi Equipment",
    companyIds: [
      "688082", "6857", "AMAT", "3711", "ASML", "6146", "6361",
      "7741", "KLAC", "6525", "LRCX", "6920", "6323", "7735", "8035", "7729",
      "002371",
    ],
  },
  // ── 10 new sectors ──
  {
    name: "EV Supply-chain",
    label: "EV Supply-chain",
    companyIds: ["TSLA", "1211", "300750", "1810", "373220"],
  },
  {
    name: "China AI Apps",
    label: "China AI Apps",
    companyIds: ["0100", "2513"],
  },
  {
    name: "China Semis",
    label: "China Semis",
    companyIds: ["688981", "688256", "688041", "603501", "688008"],
  },
  {
    name: "Japan Materials",
    label: "Japan Materials",
    companyIds: ["4004", "3110", "3436", "5016", "4062"],
  },
  {
    name: "Gaming",
    label: "Gaming",
    companyIds: ["7974", "6758", "9697", "EA", "TTWO"],
  },
  {
    name: "PCB Supply-chain",
    label: "PCB Supply-chain",
    companyIds: ["007660", "2368", "3037", "1303"],
  },
  {
    name: "ASEAN E-commerce",
    label: "ASEAN E-commerce",
    companyIds: ["GRAB", "SE"],
  },
  {
    name: "AI Semis",
    label: "AI Semis",
    companyIds: ["2330", "NVDA", "AVGO", "AMD", "2454", "MRVL"],
  },
  {
    name: "MLCCs",
    label: "MLCCs",
    companyIds: ["6981", "6762", "2327", "009150"],
  },
  {
    name: "Server ODMs",
    label: "Server ODMs",
    companyIds: ["2317", "2382", "3231"],
  },
];

/**
 * All sector names as a flat array — used by cron triggers.
 */
export const SECTOR_NAMES = SECTORS.map((s) => s.name);

/**
 * Get all sector definitions.
 */
export function getSectors(): SectorDefinition[] {
  return SECTORS;
}

/**
 * Get a sector by name.
 */
export function getSector(name: string): SectorDefinition | undefined {
  return SECTORS.find((s) => s.name === name);
}

/**
 * Find which sector a company belongs to (if any).
 */
export function getCompanySector(companyId: string): SectorDefinition | undefined {
  return SECTORS.find((s) => s.companyIds.includes(companyId));
}
