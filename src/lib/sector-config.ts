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
      "nvidia", "amd", "intel", "qualcomm", "broadcom", "micron", "texas-instruments",
      "applied-materials", "lam-research", "kla-corporation", "analog-devices", "marvell",
      "nxp", "microchip", "on-semiconductor", "monolithic-power", "arm", "synopsys",
      "cadence", "teradyne", "skyworks", "qorvo", "entegris", "globalfoundries",
      "astera-labs", "credo-technology", "coherent", "asml",
      "tokyo-electron", "advantest", "disco", "lasertec", "screen-holdings", "rorze",
      "renesas", "kokusai-electric", "tokyo-seimitsu", "socionext",
      "samsung-electronics", "sk-hynix", "tsmc", "mediatek", "ase-technology", "umc",
      "novatek", "nanya-technology", "realtek", "silergy",
      "smic", "will-semiconductor", "cambricon", "naura", "hygon", "montage",
      "gigadevice", "star-power", "maxscend",
    ],
  },
  {
    name: "ai-software",
    label: "AI & Software",
    companyIds: [
      "microsoft", "alphabet", "meta", "palantir", "salesforce", "adobe",
      "servicenow", "snowflake", "datadog", "mongodb", "confluent",
      "workday", "intuit", "autodesk", "atlassian", "hubspot",
      "oracle", "ibm", "applovin",
    ],
  },
  {
    name: "cloud-data",
    label: "Cloud & Data",
    companyIds: [
      "amazon", "shopify", "cloudflare", "twilio", "netapp", "pure-storage",
      "palo-alto", "crowdstrike", "fortinet", "zscaler",
      "western-digital", "sandisk", "seagate", "rambus", "macom",
    ],
  },
  {
    name: "hardware-networking",
    label: "Hardware & Networking",
    companyIds: [
      "apple", "dell", "hpe", "supermicro", "cisco", "arista",
      "amphenol", "te-connectivity", "flex", "fabrinet", "jabil",
      "lumentum", "corning", "celestica", "impinj", "nova",
      "zhongji-innolight", "eoptolink", "accton", "quanta", "wistron",
      "hon-hai", "delta-electronics", "lenovo",
      "murata", "tdk", "ibiden", "shinko", "taiyo-yuden",
      "samsung-electro-mechanics", "unimicron", "gold-circuit", "yageo",
    ],
  },
  {
    name: "energy-materials",
    label: "Energy & Materials",
    companyIds: [
      "vertiv", "eaton", "constellation-energy", "vistra",
      "sumco", "resonac", "jx-advanced-metals", "nitto-boseki", "hoya",
      "nanya-plastics",
      "catl", "sungrow", "samsung-sdi", "lg-energy",
      "byd", "byd-electronic",
      "hd-hyundai-electric", "doosan-enerbility",
      "hengtong", "suzhou-tfc",
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
