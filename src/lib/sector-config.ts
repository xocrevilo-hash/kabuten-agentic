export interface SectorDefinition {
  name: string;
  label: string;
  companyIds: string[];
}

/**
 * Sector definitions — 7 sectors covering 49 companies.
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
    companyIds: ["9988", "BIDU", "NTES", "0700", "TME", "TCOM"],
  },
  {
    name: "Data-centre Power & Cooling",
    label: "DC Power & Cooling",
    companyIds: ["3324", "2308", "6501", "VST"],
  },
  {
    name: "India IT Services",
    label: "India IT Services",
    companyIds: ["INFY", "TCS", "TECHM", "WIPRO"],
  },
  {
    name: "Memory Semiconductors",
    label: "Memory Semis",
    companyIds: ["285A", "MU", "005930", "SNDK", "STX", "000660"],
  },
  {
    name: "Networking & Optics",
    label: "Networking & Optics",
    companyIds: ["2345", "CLS", "COHR", "FN", "LITE", "2382", "300394", "300308"],
  },
  {
    name: "Semiconductor Production Equipment",
    label: "Semi Equipment",
    companyIds: [
      "688082", "6857", "AMAT", "3711", "ASML", "6146", "6361",
      "7741", "KLAC", "6525", "LRCX", "6920", "6323", "7735", "8035", "7729",
    ],
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
