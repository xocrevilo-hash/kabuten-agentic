export interface SectorDefinition {
  name: string;
  label: string;
  companyIds: string[];
}

/**
 * Sector definitions — configurable groupings of companies.
 * Placeholder sectors until Oliver defines the final groupings.
 * Company IDs must match the id field in the companies table / seed.json.
 */
export const SECTORS: SectorDefinition[] = [
  {
    name: "semiconductors",
    label: "Semiconductors",
    companyIds: [
      "NVDA", "AMD", "INTC", "QCOM", "AVGO", "MU", "TXN",
      "AMAT", "LRCX", "KLAC", "ADI", "MRVL",
      "NXPI", "MCHP", "ON", "MPWR", "ARM", "SNPS",
      "CDNS", "TER", "SWKS", "QRVO", "ENTG", "GFS",
      "ALAB", "CRDO", "COHR", "ASML",
      "8035", "6857", "6146", "6920", "7735", "6323",
      "6723", "6525", "7729", "6526",
      "005930", "000660", "2330", "2454", "3711", "2303",
      "3034", "2408", "2379", "6415",
      "688981", "603501", "688256", "002371", "688041", "688008",
      "603986", "603290", "300782",
    ],
  },
  {
    name: "ai-software",
    label: "AI & Software",
    companyIds: [
      "MSFT", "GOOGL", "META", "PLTR", "CRM", "ADBE",
      "NOW", "SNOW", "DDOG", "MDB", "CFLT",
      "WDAY", "INTU", "ADSK", "TEAM", "HUBS",
      "ORCL", "IBM", "APP",
    ],
  },
  {
    name: "cloud-data",
    label: "Cloud & Data",
    companyIds: [
      "AMZN", "SHOP", "NET", "TWLO", "NTAP", "PSTG",
      "PANW", "CRWD", "FTNT", "ZS",
      "WDC", "SNDK", "STX", "RMBS", "MTSI",
    ],
  },
  {
    name: "hardware-networking",
    label: "Hardware & Networking",
    companyIds: [
      "AAPL", "DELL", "HPE", "SMCI", "CSCO", "ANET",
      "APH", "TEL", "FLEX", "FN", "JBL",
      "LITE", "GLW", "CLS", "PI", "NVMI",
      "300308", "300502", "2345", "2382_TW", "3231",
      "2317", "2308", "0992",
      "6981", "6762", "4062", "6967", "6976",
      "009150", "3037", "2368", "2327",
    ],
  },
  {
    name: "energy-materials",
    label: "Energy & Materials",
    companyIds: [
      "VRT", "ETN", "CEG", "VST",
      "3436", "4004", "5016", "3110", "7741",
      "1303",
      "300750", "300274", "006400", "373220",
      "1211", "0285",
      "267260", "034020",
      "600487", "300394",
    ],
  },
];

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
