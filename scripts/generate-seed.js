#!/usr/bin/env node
/**
 * Generate seed.json with all 230 companies from the architecture doc.
 * Preserves existing rich data for the original 23 companies,
 * and generates template-based data for new companies.
 */

const fs = require("fs");
const path = require("path");

// Load existing seed data (23 companies with rich profiles)
const existingPath = path.join(__dirname, "..", "data", "seed.json");
const existing = JSON.parse(fs.readFileSync(existingPath, "utf8"));
const existingMap = new Map(existing.companies.map((c) => [c.ticker_full, c]));

// Load temp Japan files if they exist
let tmpJapan = [];
try {
  const j1 = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "tmp_japan1.json"), "utf8"));
  const j2 = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "tmp_japan2.json"), "utf8"));
  tmpJapan = [...j1, ...j2];
} catch {}
const tmpMap = new Map(tmpJapan.map((c) => [c.ticker_full, c]));

// ========== ALL 230 COMPANIES ==========
const ALL_COMPANIES = [
  // === US COMPANIES (106) ===
  // Mega-Cap Tech (9)
  { id: "AAPL", name: "Apple", name_jp: "アップル", ticker: "AAPL", exchange: "NASDAQ", sector: "Consumer Electronics / Hardware", view: "neutral", conviction: "medium" },
  { id: "NVDA", name: "Nvidia", name_jp: "エヌビディア", ticker: "NVDA", exchange: "NASDAQ", sector: "Semiconductors / AI", view: "bullish", conviction: "high" },
  { id: "MSFT", name: "Microsoft", name_jp: "マイクロソフト", ticker: "MSFT", exchange: "NASDAQ", sector: "Software / Cloud", view: "bullish", conviction: "high" },
  { id: "AMZN", name: "Amazon", name_jp: "アマゾン", ticker: "AMZN", exchange: "NASDAQ", sector: "Cloud / AI", view: "bullish", conviction: "medium" },
  { id: "GOOGL", name: "Alphabet (Class A)", name_jp: "アルファベット", ticker: "GOOGL", exchange: "NASDAQ", sector: "Cloud / AI / Advertising", view: "bullish", conviction: "medium" },
  { id: "META", name: "Meta Platforms", name_jp: "メタ・プラットフォームズ", ticker: "META", exchange: "NASDAQ", sector: "AI / Social / Advertising", view: "bullish", conviction: "medium" },
  { id: "TSLA", name: "Tesla", name_jp: "テスラ", ticker: "TSLA", exchange: "NASDAQ", sector: "EV / Autonomy / AI", view: "bearish", conviction: "medium" },
  { id: "AVGO", name: "Broadcom", name_jp: "ブロードコム", ticker: "AVGO", exchange: "NASDAQ", sector: "Semiconductors / Networking", view: "bullish", conviction: "high" },
  { id: "ASML", name: "ASML (ADR)", name_jp: "ASML（ADR）", ticker: "ASML", exchange: "NASDAQ", sector: "Semiconductor Equipment", view: "bullish", conviction: "high" },

  // Semiconductors (25)
  { id: "AMD", name: "Advanced Micro Devices", name_jp: "アドバンスト・マイクロ・デバイセズ", ticker: "AMD", exchange: "NASDAQ", sector: "Semiconductors", view: "bullish", conviction: "medium" },
  { id: "INTC", name: "Intel", name_jp: "インテル", ticker: "INTC", exchange: "NASDAQ", sector: "Semiconductors / Foundry", view: "bearish", conviction: "medium" },
  { id: "QCOM", name: "Qualcomm", name_jp: "クアルコム", ticker: "QCOM", exchange: "NASDAQ", sector: "Semiconductors / Mobile", view: "neutral", conviction: "medium" },
  { id: "MU", name: "Micron Technology", name_jp: "マイクロン・テクノロジー", ticker: "MU", exchange: "NASDAQ", sector: "Memory", view: "bullish", conviction: "high" },
  { id: "TXN", name: "Texas Instruments", name_jp: "テキサス・インスツルメンツ", ticker: "TXN", exchange: "NASDAQ", sector: "Analog Semiconductors", view: "neutral", conviction: "low" },
  { id: "AMAT", name: "Applied Materials", name_jp: "アプライド・マテリアルズ", ticker: "AMAT", exchange: "NASDAQ", sector: "Semiconductor Equipment", view: "bullish", conviction: "medium" },
  { id: "LRCX", name: "Lam Research", name_jp: "ラム・リサーチ", ticker: "LRCX", exchange: "NASDAQ", sector: "Semiconductor Equipment", view: "bullish", conviction: "medium" },
  { id: "KLAC", name: "KLA Corporation", name_jp: "KLA", ticker: "KLAC", exchange: "NASDAQ", sector: "Semiconductor Equipment", view: "bullish", conviction: "medium" },
  { id: "ADI", name: "Analog Devices", name_jp: "アナログ・デバイセズ", ticker: "ADI", exchange: "NASDAQ", sector: "Analog Semiconductors", view: "neutral", conviction: "low" },
  { id: "MRVL", name: "Marvell Technology", name_jp: "マーベル・テクノロジー", ticker: "MRVL", exchange: "NASDAQ", sector: "Semiconductors / Data Infra", view: "bullish", conviction: "high" },
  { id: "NXPI", name: "NXP Semiconductors", name_jp: "NXPセミコンダクターズ", ticker: "NXPI", exchange: "NASDAQ", sector: "Auto / Industrial Semis", view: "neutral", conviction: "medium" },
  { id: "MCHP", name: "Microchip Technology", name_jp: "マイクロチップ・テクノロジー", ticker: "MCHP", exchange: "NASDAQ", sector: "Microcontrollers", view: "bearish", conviction: "low" },
  { id: "ON", name: "ON Semiconductor", name_jp: "ONセミコンダクター", ticker: "ON", exchange: "NASDAQ", sector: "Power / Auto Semis", view: "neutral", conviction: "medium" },
  { id: "MPWR", name: "Monolithic Power Systems", name_jp: "モノリシック・パワー・システムズ", ticker: "MPWR", exchange: "NASDAQ", sector: "Power Semiconductors", view: "bullish", conviction: "medium" },
  { id: "ARM", name: "Arm Holdings", name_jp: "アーム・ホールディングス", ticker: "ARM", exchange: "NASDAQ", sector: "Semiconductor IP / Design", view: "bullish", conviction: "high" },
  { id: "SNPS", name: "Synopsys", name_jp: "シノプシス", ticker: "SNPS", exchange: "NASDAQ", sector: "EDA / Semiconductor Design", view: "bullish", conviction: "medium" },
  { id: "CDNS", name: "Cadence Design Systems", name_jp: "ケイデンス・デザイン・システムズ", ticker: "CDNS", exchange: "NASDAQ", sector: "EDA / Semiconductor Design", view: "bullish", conviction: "medium" },
  { id: "TER", name: "Teradyne", name_jp: "テラダイン", ticker: "TER", exchange: "NASDAQ", sector: "Semiconductor Test Equipment", view: "neutral", conviction: "medium" },
  { id: "SWKS", name: "Skyworks Solutions", name_jp: "スカイワークス・ソリューションズ", ticker: "SWKS", exchange: "NASDAQ", sector: "RF Semiconductors", view: "bearish", conviction: "low" },
  { id: "QRVO", name: "Qorvo", name_jp: "コルボ", ticker: "QRVO", exchange: "NASDAQ", sector: "RF Semiconductors", view: "bearish", conviction: "low" },
  { id: "ENTG", name: "Entegris", name_jp: "エンテグリス", ticker: "ENTG", exchange: "NASDAQ", sector: "Semiconductor Materials", view: "bullish", conviction: "medium" },
  { id: "GFS", name: "GlobalFoundries", name_jp: "グローバルファウンドリーズ", ticker: "GFS", exchange: "NASDAQ", sector: "Semiconductor Foundry", view: "neutral", conviction: "low" },
  { id: "ALAB", name: "Astera Labs", name_jp: "アステラ・ラボ", ticker: "ALAB", exchange: "NASDAQ", sector: "Connectivity Semiconductors", view: "bullish", conviction: "high" },
  { id: "CRDO", name: "Credo Technology", name_jp: "クレド・テクノロジー", ticker: "CRDO", exchange: "NASDAQ", sector: "Connectivity Semiconductors", view: "bullish", conviction: "high" },
  { id: "COHR", name: "Coherent Corp", name_jp: "コヒレント", ticker: "COHR", exchange: "NYSE", sector: "Optical / Laser Semis", view: "bullish", conviction: "medium" },

  // Data Storage / Memory (5)
  { id: "WDC", name: "Western Digital", name_jp: "ウエスタンデジタル", ticker: "WDC", exchange: "NASDAQ", sector: "Storage (HDD)", view: "neutral", conviction: "low" },
  { id: "SNDK", name: "SanDisk", name_jp: "サンディスク", ticker: "SNDK", exchange: "NASDAQ", sector: "NAND Flash / SSD", view: "neutral", conviction: "low" },
  { id: "STX", name: "Seagate Technology", name_jp: "シーゲイト・テクノロジー", ticker: "STX", exchange: "NASDAQ", sector: "Storage (HDD)", view: "neutral", conviction: "low" },
  { id: "RMBS", name: "Rambus", name_jp: "ランバス", ticker: "RMBS", exchange: "NASDAQ", sector: "Memory IP", view: "bullish", conviction: "medium" },
  { id: "MTSI", name: "MACOM Technology", name_jp: "MACOM テクノロジー", ticker: "MTSI", exchange: "NASDAQ", sector: "Analog / RF Semis", view: "bullish", conviction: "medium" },

  // Software / Cloud / AI (30)
  { id: "CRM", name: "Salesforce", name_jp: "セールスフォース", ticker: "CRM", exchange: "NYSE", sector: "Enterprise Cloud", view: "neutral", conviction: "medium" },
  { id: "ADBE", name: "Adobe", name_jp: "アドビ", ticker: "ADBE", exchange: "NASDAQ", sector: "Creative / AI Software", view: "neutral", conviction: "medium" },
  { id: "NOW", name: "ServiceNow", name_jp: "サービスナウ", ticker: "NOW", exchange: "NYSE", sector: "Enterprise Cloud", view: "bullish", conviction: "medium" },
  { id: "PLTR", name: "Palantir Technologies", name_jp: "パランティア・テクノロジーズ", ticker: "PLTR", exchange: "NASDAQ", sector: "AI / Data Analytics", view: "bullish", conviction: "medium" },
  { id: "SNOW", name: "Snowflake", name_jp: "スノーフレーク", ticker: "SNOW", exchange: "NYSE", sector: "Cloud Data Platform", view: "neutral", conviction: "low" },
  { id: "SHOP", name: "Shopify", name_jp: "ショッピファイ", ticker: "SHOP", exchange: "NYSE", sector: "E-commerce Cloud", view: "bullish", conviction: "medium" },
  { id: "PANW", name: "Palo Alto Networks", name_jp: "パロアルトネットワークス", ticker: "PANW", exchange: "NASDAQ", sector: "Cybersecurity", view: "bullish", conviction: "medium" },
  { id: "CRWD", name: "CrowdStrike", name_jp: "クラウドストライク", ticker: "CRWD", exchange: "NASDAQ", sector: "Cybersecurity", view: "bullish", conviction: "medium" },
  { id: "INTU", name: "Intuit", name_jp: "イントゥイット", ticker: "INTU", exchange: "NASDAQ", sector: "Financial Software", view: "neutral", conviction: "low" },
  { id: "WDAY", name: "Workday", name_jp: "ワークデイ", ticker: "WDAY", exchange: "NASDAQ", sector: "Enterprise Cloud", view: "neutral", conviction: "low" },
  { id: "DDOG", name: "Datadog", name_jp: "データドッグ", ticker: "DDOG", exchange: "NASDAQ", sector: "Observability / Cloud", view: "bullish", conviction: "medium" },
  { id: "FTNT", name: "Fortinet", name_jp: "フォーティネット", ticker: "FTNT", exchange: "NASDAQ", sector: "Cybersecurity", view: "neutral", conviction: "medium" },
  { id: "ADSK", name: "Autodesk", name_jp: "オートデスク", ticker: "ADSK", exchange: "NASDAQ", sector: "Design Software", view: "neutral", conviction: "low" },
  { id: "TEAM", name: "Atlassian", name_jp: "アトラシアン", ticker: "TEAM", exchange: "NASDAQ", sector: "Dev Tools / Collaboration", view: "neutral", conviction: "medium" },
  { id: "ZS", name: "Zscaler", name_jp: "ジースケーラー", ticker: "ZS", exchange: "NASDAQ", sector: "Cybersecurity", view: "bullish", conviction: "medium" },
  { id: "APP", name: "AppLovin", name_jp: "アップラビン", ticker: "APP", exchange: "NASDAQ", sector: "Ad Tech / AI", view: "bullish", conviction: "high" },
  { id: "MDB", name: "MongoDB", name_jp: "モンゴDB", ticker: "MDB", exchange: "NASDAQ", sector: "Database", view: "neutral", conviction: "low" },
  { id: "TWLO", name: "Twilio", name_jp: "トゥイリオ", ticker: "TWLO", exchange: "NYSE", sector: "Communications Platform", view: "neutral", conviction: "low" },
  { id: "CFLT", name: "Confluent", name_jp: "コンフルエント", ticker: "CFLT", exchange: "NASDAQ", sector: "Data Streaming", view: "neutral", conviction: "low" },
  { id: "NET", name: "Cloudflare", name_jp: "クラウドフレア", ticker: "NET", exchange: "NYSE", sector: "Edge / Cloud Infrastructure", view: "bullish", conviction: "medium" },
  { id: "HUBS", name: "HubSpot", name_jp: "ハブスポット", ticker: "HUBS", exchange: "NYSE", sector: "Marketing / CRM Cloud", view: "neutral", conviction: "low" },
  { id: "ORCL", name: "Oracle", name_jp: "オラクル", ticker: "ORCL", exchange: "NYSE", sector: "Cloud / Database", view: "bullish", conviction: "medium" },
  { id: "IBM", name: "IBM", name_jp: "IBM", ticker: "IBM", exchange: "NYSE", sector: "AI / Enterprise IT", view: "neutral", conviction: "low" },
  { id: "ANET", name: "Arista Networks", name_jp: "アリスタネットワークス", ticker: "ANET", exchange: "NYSE", sector: "Networking", view: "bullish", conviction: "high" },
  { id: "CSCO", name: "Cisco Systems", name_jp: "シスコシステムズ", ticker: "CSCO", exchange: "NASDAQ", sector: "Networking", view: "neutral", conviction: "low" },
  { id: "NTAP", name: "NetApp", name_jp: "ネットアップ", ticker: "NTAP", exchange: "NASDAQ", sector: "Storage / Cloud", view: "neutral", conviction: "low" },
  { id: "PSTG", name: "Pure Storage", name_jp: "ピュア・ストレージ", ticker: "PSTG", exchange: "NYSE", sector: "Flash Storage", view: "bullish", conviction: "medium" },
  { id: "DELL", name: "Dell Technologies", name_jp: "デル・テクノロジーズ", ticker: "DELL", exchange: "NYSE", sector: "Hardware / AI Servers", view: "bullish", conviction: "medium" },
  { id: "HPE", name: "Hewlett Packard Enterprise", name_jp: "ヒューレット・パッカード・エンタープライズ", ticker: "HPE", exchange: "NYSE", sector: "AI Servers / Networking", view: "neutral", conviction: "low" },
  { id: "SMCI", name: "Super Micro Computer", name_jp: "スーパー・マイクロ・コンピュータ", ticker: "SMCI", exchange: "NASDAQ", sector: "AI Servers", view: "bullish", conviction: "medium" },

  // AI Infrastructure / Hardware (6)
  { id: "VRT", name: "Vertiv Holdings", name_jp: "バーティブ・ホールディングス", ticker: "VRT", exchange: "NYSE", sector: "Data Center Power / Cooling", view: "bullish", conviction: "high" },
  { id: "ETN", name: "Eaton Corporation", name_jp: "イートン", ticker: "ETN", exchange: "NYSE", sector: "Power Management", view: "bullish", conviction: "medium" },
  { id: "CEG", name: "Constellation Energy", name_jp: "コンステレーション・エナジー", ticker: "CEG", exchange: "NASDAQ", sector: "Nuclear / Data Center Power", view: "bullish", conviction: "medium" },
  { id: "VST", name: "Vistra Corp", name_jp: "ヴィストラ", ticker: "VST", exchange: "NYSE", sector: "Power / Data Center Energy", view: "bullish", conviction: "medium" },
  { id: "GLW", name: "Corning", name_jp: "コーニング", ticker: "GLW", exchange: "NYSE", sector: "Optical Fiber / Glass", view: "bullish", conviction: "medium" },
  { id: "CLS", name: "Celestica", name_jp: "セレスティカ", ticker: "CLS", exchange: "NYSE", sector: "EMS / AI Hardware", view: "bullish", conviction: "medium" },

  // Internet / Digital Platforms (10)
  { id: "NFLX", name: "Netflix", name_jp: "ネットフリックス", ticker: "NFLX", exchange: "NASDAQ", sector: "Streaming", view: "neutral", conviction: "medium" },
  { id: "UBER", name: "Uber Technologies", name_jp: "ウーバー・テクノロジーズ", ticker: "UBER", exchange: "NYSE", sector: "Mobility / AI", view: "bullish", conviction: "medium" },
  { id: "ABNB", name: "Airbnb", name_jp: "エアビーアンドビー", ticker: "ABNB", exchange: "NASDAQ", sector: "Travel Tech", view: "neutral", conviction: "low" },
  { id: "DASH", name: "DoorDash", name_jp: "ドアダッシュ", ticker: "DASH", exchange: "NASDAQ", sector: "Delivery Tech", view: "neutral", conviction: "low" },
  { id: "PYPL", name: "PayPal", name_jp: "ペイパル", ticker: "PYPL", exchange: "NASDAQ", sector: "Fintech", view: "neutral", conviction: "low" },
  { id: "XYZ", name: "Block (Square)", name_jp: "ブロック（スクエア）", ticker: "XYZ", exchange: "NYSE", sector: "Fintech", view: "neutral", conviction: "low" },
  { id: "COIN", name: "Coinbase", name_jp: "コインベース", ticker: "COIN", exchange: "NASDAQ", sector: "Crypto / Fintech", view: "neutral", conviction: "low" },
  { id: "MELI", name: "MercadoLibre", name_jp: "メルカドリブレ", ticker: "MELI", exchange: "NASDAQ", sector: "LatAm E-commerce", view: "bullish", conviction: "medium" },
  { id: "PDD", name: "PDD Holdings", name_jp: "PDD ホールディングス", ticker: "PDD", exchange: "NASDAQ", sector: "China E-commerce (US-listed)", view: "neutral", conviction: "low" },
  { id: "EA", name: "Electronic Arts", name_jp: "エレクトロニック・アーツ", ticker: "EA", exchange: "NASDAQ", sector: "Gaming", view: "neutral", conviction: "low" },

  // Telecom / Media Tech (5)
  { id: "TMUS", name: "T-Mobile US", name_jp: "T-モバイルUS", ticker: "TMUS", exchange: "NASDAQ", sector: "Telecom", view: "neutral", conviction: "low" },
  { id: "CMCSA", name: "Comcast", name_jp: "コムキャスト", ticker: "CMCSA", exchange: "NASDAQ", sector: "Telecom / Media", view: "neutral", conviction: "low" },
  { id: "WBD", name: "Warner Bros. Discovery", name_jp: "ワーナーブラザース・ディスカバリー", ticker: "WBD", exchange: "NASDAQ", sector: "Media / Streaming", view: "bearish", conviction: "low" },
  { id: "TTWO", name: "Take-Two Interactive", name_jp: "テイクツー・インタラクティブ", ticker: "TTWO", exchange: "NASDAQ", sector: "Gaming", view: "neutral", conviction: "medium" },
  { id: "SPOT", name: "Spotify Technology", name_jp: "スポティファイ", ticker: "SPOT", exchange: "NYSE", sector: "Music Streaming", view: "bullish", conviction: "medium" },

  // Misc Tech / AI-Adjacent (10)
  { id: "CTSH", name: "Cognizant", name_jp: "コグニザント", ticker: "CTSH", exchange: "NASDAQ", sector: "IT Services", view: "neutral", conviction: "low" },
  { id: "ACN", name: "Accenture", name_jp: "アクセンチュア", ticker: "ACN", exchange: "NYSE", sector: "IT Services / AI Consulting", view: "neutral", conviction: "medium" },
  { id: "APH", name: "Amphenol", name_jp: "アンフェノール", ticker: "APH", exchange: "NYSE", sector: "Connectors / Networking", view: "bullish", conviction: "medium" },
  { id: "TEL", name: "TE Connectivity", name_jp: "TEコネクティビティ", ticker: "TEL", exchange: "NYSE", sector: "Connectors / Sensors", view: "neutral", conviction: "low" },
  { id: "FLEX", name: "Flex Ltd", name_jp: "フレックス", ticker: "FLEX", exchange: "NASDAQ", sector: "EMS / Hardware", view: "neutral", conviction: "low" },
  { id: "FN", name: "Fabrinet", name_jp: "ファブリネット", ticker: "FN", exchange: "NYSE", sector: "Optical EMS (Thailand-based)", view: "bullish", conviction: "high" },
  { id: "JBL", name: "Jabil", name_jp: "ジャビル", ticker: "JBL", exchange: "NYSE", sector: "EMS / Manufacturing", view: "neutral", conviction: "low" },
  { id: "LITE", name: "Lumentum", name_jp: "ルメンタム", ticker: "LITE", exchange: "NASDAQ", sector: "Optical Components", view: "bullish", conviction: "medium" },
  { id: "PI", name: "Impinj", name_jp: "インピンジ", ticker: "PI", exchange: "NASDAQ", sector: "RFID / IoT Semiconductors", view: "neutral", conviction: "low" },
  { id: "NVMI", name: "Nova Ltd", name_jp: "ノヴァ", ticker: "NVMI", exchange: "NASDAQ", sector: "Semiconductor Metrology", view: "bullish", conviction: "medium" },

  // US-listed China/APAC ADRs (5)
  { id: "BIDU", name: "Baidu", name_jp: "バイドゥ", ticker: "BIDU", exchange: "NASDAQ", sector: "Search / AI / Autonomous Driving", view: "neutral", conviction: "medium" },
  { id: "FUTU", name: "Futu Holdings", name_jp: "富途控股", ticker: "FUTU", exchange: "NASDAQ", sector: "Online Brokerage / Fintech", view: "bullish", conviction: "medium" },
  { id: "NTES", name: "NetEase", name_jp: "ネットイース", ticker: "NTES", exchange: "NASDAQ", sector: "Gaming / E-commerce / Education", view: "bullish", conviction: "medium" },
  { id: "TME", name: "Tencent Music Entertainment", name_jp: "テンセント・ミュージック", ticker: "TME", exchange: "NYSE", sector: "Music Streaming / Social Entertainment", view: "neutral", conviction: "low" },
  { id: "TCOM", name: "Trip.com Group", name_jp: "トリップドットコム", ticker: "TCOM", exchange: "NASDAQ", sector: "Travel Tech / OTA", view: "bullish", conviction: "medium" },

  // === APAC COMPANIES (124) ===
  // Japan — TSE (41)
  { id: "8035", name: "Tokyo Electron", name_jp: "東京エレクトロン", ticker: "8035.T", exchange: "TSE", sector: "Semiconductor Equipment", view: "bullish", conviction: "high" },
  { id: "6857", name: "Advantest", name_jp: "アドバンテスト", ticker: "6857.T", exchange: "TSE", sector: "Semiconductor Test Equipment", view: "bullish", conviction: "high" },
  { id: "6146", name: "Disco Corp", name_jp: "ディスコ", ticker: "6146.T", exchange: "TSE", sector: "Semiconductor Equipment (dicing/grinding)", view: "bullish", conviction: "high" },
  { id: "6920", name: "Lasertec", name_jp: "レーザーテック", ticker: "6920.T", exchange: "TSE", sector: "Semiconductor Inspection (EUV masks)", view: "bullish", conviction: "high" },
  { id: "7735", name: "Screen Holdings", name_jp: "SCREENホールディングス", ticker: "7735.T", exchange: "TSE", sector: "Semiconductor Equipment (cleaning/coating)", view: "bullish", conviction: "medium" },
  { id: "6323", name: "Rorze Corp", name_jp: "ローツェ", ticker: "6323.T", exchange: "TSE", sector: "Semiconductor Automation / Robotics", view: "bullish", conviction: "high" },
  { id: "6723", name: "Renesas Electronics", name_jp: "ルネサスエレクトロニクス", ticker: "6723.T", exchange: "TSE", sector: "Semiconductors / MCU", view: "bullish", conviction: "medium" },
  { id: "6758", name: "Sony Group", name_jp: "ソニーグループ", ticker: "6758.T", exchange: "TSE", sector: "Image Sensors / Entertainment", view: "bullish", conviction: "medium" },
  { id: "6861", name: "Keyence", name_jp: "キーエンス", ticker: "6861.T", exchange: "TSE", sector: "Sensors / Factory Automation", view: "bullish", conviction: "medium" },
  { id: "6501", name: "Hitachi", name_jp: "日立製作所", ticker: "6501.T", exchange: "TSE", sector: "IT / Infrastructure / AI", view: "bullish", conviction: "medium" },
  { id: "6981", name: "Murata Manufacturing", name_jp: "村田製作所", ticker: "6981.T", exchange: "TSE", sector: "Electronic Components", view: "neutral", conviction: "medium" },
  { id: "6762", name: "TDK Corp", name_jp: "TDK", ticker: "6762.T", exchange: "TSE", sector: "Electronic Components", view: "neutral", conviction: "medium" },
  { id: "4062", name: "Ibiden", name_jp: "イビデン", ticker: "4062.T", exchange: "TSE", sector: "IC Substrates / Packaging", view: "bullish", conviction: "medium" },
  { id: "6967", name: "Shinko Electric Industries", name_jp: "新光電気工業", ticker: "6967.T", exchange: "TSE", sector: "IC Substrates / Packaging", view: "bullish", conviction: "medium" },
  { id: "6963", name: "Rohm Co", name_jp: "ローム", ticker: "6963.T", exchange: "TSE", sector: "Power Semiconductors", view: "neutral", conviction: "low" },
  { id: "6526", name: "Socionext", name_jp: "ソシオネクスト", ticker: "6526.T", exchange: "TSE", sector: "SoC Design", view: "bullish", conviction: "medium" },
  { id: "6525", name: "Kokusai Electric", name_jp: "KOKUSAI ELECTRIC", ticker: "6525.T", exchange: "TSE", sector: "Semiconductor Equipment (deposition)", view: "bullish", conviction: "medium" },
  { id: "7729", name: "Tokyo Seimitsu (Accretech)", name_jp: "東京精密", ticker: "7729.T", exchange: "TSE", sector: "Semiconductor Equipment (test/metrology)", view: "bullish", conviction: "medium" },
  { id: "6965", name: "Hamamatsu Photonics", name_jp: "浜松ホトニクス", ticker: "6965.T", exchange: "TSE", sector: "Optical Sensors / Photonics", view: "neutral", conviction: "medium" },
  { id: "6702", name: "Fujitsu", name_jp: "富士通", ticker: "6702.T", exchange: "TSE", sector: "IT Services / Computing", view: "neutral", conviction: "low" },
  { id: "6701", name: "NEC Corp", name_jp: "NEC", ticker: "6701.T", exchange: "TSE", sector: "IT / Telecom", view: "neutral", conviction: "low" },
  { id: "6752", name: "Panasonic Holdings", name_jp: "パナソニック ホールディングス", ticker: "6752.T", exchange: "TSE", sector: "Electronics / Batteries", view: "neutral", conviction: "low" },
  { id: "9984", name: "SoftBank Group", name_jp: "ソフトバンクグループ", ticker: "9984.T", exchange: "TSE", sector: "AI Investment / Telecom", view: "bullish", conviction: "medium" },
  { id: "7731", name: "Nikon Corp", name_jp: "ニコン", ticker: "7731.T", exchange: "TSE", sector: "Lithography / Optics", view: "neutral", conviction: "low" },
  { id: "3436", name: "SUMCO Corp", name_jp: "SUMCO", ticker: "3436.T", exchange: "TSE", sector: "Silicon Wafers", view: "neutral", conviction: "low" },
  { id: "4755", name: "Rakuten Group", name_jp: "楽天グループ", ticker: "4755.T", exchange: "TSE", sector: "Internet / E-commerce / Fintech", view: "bearish", conviction: "medium" },
  { id: "4689", name: "LY Corp", name_jp: "LY", ticker: "4689.T", exchange: "TSE", sector: "Internet / Search / Messaging", view: "neutral", conviction: "low" },
  { id: "9434", name: "SoftBank Corp", name_jp: "ソフトバンク", ticker: "9434.T", exchange: "TSE", sector: "Telecom / AI / Digital", view: "neutral", conviction: "low" },
  { id: "7751", name: "Canon", name_jp: "キヤノン", ticker: "7751.T", exchange: "TSE", sector: "Imaging / Lithography / Office Equipment", view: "neutral", conviction: "medium" },
  { id: "9697", name: "Capcom", name_jp: "カプコン", ticker: "9697.T", exchange: "TSE", sector: "Gaming / Entertainment", view: "bullish", conviction: "medium" },
  { id: "6361", name: "Ebara", name_jp: "荏原製作所", ticker: "6361.T", exchange: "TSE", sector: "Pumps / CMP Equipment / Infrastructure", view: "bullish", conviction: "medium" },
  { id: "6954", name: "Fanuc", name_jp: "ファナック", ticker: "6954.T", exchange: "TSE", sector: "Robotics / Factory Automation / CNC", view: "neutral", conviction: "medium" },
  { id: "7741", name: "Hoya", name_jp: "HOYA", ticker: "7741.T", exchange: "TSE", sector: "Optical / EUV Mask Blanks / Medical", view: "bullish", conviction: "high" },
  { id: "5016", name: "JX Advanced Metals", name_jp: "JX金属", ticker: "5016.T", exchange: "TSE", sector: "Semiconductor Materials / Sputtering Targets", view: "bullish", conviction: "medium" },
  { id: "285A", name: "Kioxia", name_jp: "キオクシア", ticker: "285A.T", exchange: "TSE", sector: "NAND Flash Memory", view: "bullish", conviction: "medium" },
  { id: "3659", name: "Nexon", name_jp: "ネクソン", ticker: "3659.T", exchange: "TSE", sector: "Gaming / Online Games", view: "neutral", conviction: "medium" },
  { id: "7974", name: "Nintendo", name_jp: "任天堂", ticker: "7974.T", exchange: "TSE", sector: "Gaming / Console / Entertainment", view: "bullish", conviction: "medium" },
  { id: "3110", name: "Nitto Boseki", name_jp: "日東紡績", ticker: "3110.T", exchange: "TSE", sector: "Glass Fiber / Semiconductor Materials", view: "neutral", conviction: "low" },
  { id: "6098", name: "Recruit Holdings", name_jp: "リクルートホールディングス", ticker: "6098.T", exchange: "TSE", sector: "HR Tech / Indeed / Staffing", view: "bullish", conviction: "medium" },
  { id: "4004", name: "Resonac Holdings", name_jp: "レゾナック・ホールディングス", ticker: "4004.T", exchange: "TSE", sector: "Semiconductor Materials / Chemicals", view: "bullish", conviction: "medium" },
  { id: "6976", name: "Taiyo Yuden", name_jp: "太陽誘電", ticker: "6976.T", exchange: "TSE", sector: "MLCC / Electronic Components", view: "neutral", conviction: "medium" },

  // Korea — KRX (13)
  { id: "005930", name: "Samsung Electronics", name_jp: "サムスン電子", ticker: "005930.KS", exchange: "KRX", sector: "Memory / Foundry / Display", view: "bullish", conviction: "medium" },
  { id: "000660", name: "SK Hynix", name_jp: "SKハイニックス", ticker: "000660.KS", exchange: "KRX", sector: "Memory (DRAM / HBM)", view: "bullish", conviction: "high" },
  { id: "006400", name: "Samsung SDI", name_jp: "サムスンSDI", ticker: "006400.KS", exchange: "KRX", sector: "Batteries / Energy", view: "neutral", conviction: "low" },
  { id: "373220", name: "LG Energy Solution", name_jp: "LGエネルギーソリューション", ticker: "373220.KS", exchange: "KRX", sector: "Batteries", view: "neutral", conviction: "low" },
  { id: "012450", name: "Hanwha Aerospace", name_jp: "ハンファエアロスペース", ticker: "012450.KS", exchange: "KRX", sector: "Defense / Semiconductors", view: "bullish", conviction: "medium" },
  { id: "007660", name: "Isu Petasys", name_jp: "ISUペタシス", ticker: "007660.KS", exchange: "KRX", sector: "PCB / IC Substrates", view: "bullish", conviction: "high" },
  { id: "035420", name: "Naver Corp", name_jp: "ネイバー", ticker: "035420.KS", exchange: "KRX", sector: "Internet / AI / Search", view: "neutral", conviction: "medium" },
  { id: "035720", name: "Kakao Corp", name_jp: "カカオ", ticker: "035720.KS", exchange: "KRX", sector: "Internet / Messaging", view: "neutral", conviction: "low" },
  { id: "009150", name: "Samsung Electro-Mechanics", name_jp: "サムスン電機", ticker: "009150.KS", exchange: "KRX", sector: "MLCC / Components", view: "neutral", conviction: "medium" },
  { id: "017670", name: "SK Telecom", name_jp: "SKテレコム", ticker: "017670.KS", exchange: "KRX", sector: "Telecom / AI", view: "neutral", conviction: "low" },
  { id: "267260", name: "HD Hyundai Electric", name_jp: "HD現代エレクトリック", ticker: "267260.KS", exchange: "KRX", sector: "Power Infrastructure", view: "bullish", conviction: "medium" },
  { id: "034020", name: "Doosan Enerbility", name_jp: "ドゥーサンエナビリティ", ticker: "034020.KS", exchange: "KRX", sector: "Power / Nuclear", view: "neutral", conviction: "low" },
  { id: "402340", name: "SK Square", name_jp: "SKスクエア", ticker: "402340.KS", exchange: "KRX", sector: "Tech Investment (SK Hynix parent)", view: "bullish", conviction: "medium" },

  // Taiwan — TWSE (20)  [removed Inventec, Compal; added Gold Circuit, Nanya Plastics]
  { id: "2330", name: "TSMC", name_jp: "TSMC", ticker: "2330.TW", exchange: "TWSE", sector: "Semiconductor Foundry", view: "bullish", conviction: "high" },
  { id: "2454", name: "MediaTek", name_jp: "メディアテック", ticker: "2454.TW", exchange: "TWSE", sector: "Fabless Semiconductors", view: "bullish", conviction: "medium" },
  { id: "2317", name: "Hon Hai (Foxconn)", name_jp: "鴻海精密工業", ticker: "2317.TW", exchange: "TWSE", sector: "EMS / AI Servers", view: "bullish", conviction: "medium" },
  { id: "2308", name: "Delta Electronics", name_jp: "台達電子", ticker: "2308.TW", exchange: "TWSE", sector: "Power / Thermal / Data Center", view: "bullish", conviction: "high" },
  { id: "2345", name: "Accton Technology", name_jp: "アクトン・テクノロジー", ticker: "2345.TW", exchange: "TWSE", sector: "Networking Equipment", view: "bullish", conviction: "high" },
  { id: "2382_TW", name: "Quanta Computer", name_jp: "クアンタ・コンピュータ", ticker: "2382.TW", exchange: "TWSE", sector: "ODM / AI Servers", view: "bullish", conviction: "medium" },
  { id: "3231", name: "Wistron", name_jp: "ウィストロン", ticker: "3231.TW", exchange: "TWSE", sector: "ODM / AI Servers", view: "neutral", conviction: "low" },
  { id: "3711", name: "ASE Technology", name_jp: "日月光投控", ticker: "3711.TW", exchange: "TWSE", sector: "Semiconductor Packaging", view: "bullish", conviction: "medium" },
  { id: "2303", name: "United Microelectronics (UMC)", name_jp: "聯華電子", ticker: "2303.TW", exchange: "TWSE", sector: "Semiconductor Foundry", view: "neutral", conviction: "low" },
  { id: "3034", name: "Novatek Microelectronics", name_jp: "聯詠科技", ticker: "3034.TW", exchange: "TWSE", sector: "Display Driver IC", view: "neutral", conviction: "low" },
  { id: "2379", name: "Realtek Semiconductor", name_jp: "瑞昱半導体", ticker: "2379.TW", exchange: "TWSE", sector: "Networking / Audio IC", view: "neutral", conviction: "medium" },
  { id: "2408", name: "Nanya Technology", name_jp: "南亜科技", ticker: "2408.TW", exchange: "TWSE", sector: "DRAM Memory", view: "neutral", conviction: "low" },
  { id: "2301", name: "Lite-On Technology", name_jp: "光宝科技", ticker: "2301.TW", exchange: "TWSE", sector: "Power Supplies / Components", view: "neutral", conviction: "low" },
  { id: "2395", name: "Advantech", name_jp: "研華科技", ticker: "2395.TW", exchange: "TWSE", sector: "Industrial IoT", view: "neutral", conviction: "medium" },
  { id: "3324", name: "Auras Technology", name_jp: "双鴻科技", ticker: "3324.TW", exchange: "TWSE", sector: "Thermal / Cooling Solutions", view: "bullish", conviction: "medium" },
  { id: "2327", name: "Yageo Corp", name_jp: "国巨", ticker: "2327.TW", exchange: "TWSE", sector: "Passive Components", view: "neutral", conviction: "low" },
  { id: "3037", name: "Unimicron Technology", name_jp: "欣興電子", ticker: "3037.TW", exchange: "TWSE", sector: "PCB / IC Substrates", view: "bullish", conviction: "medium" },
  { id: "6415", name: "Silergy Corp", name_jp: "矽力傑", ticker: "6415.TW", exchange: "TWSE", sector: "Power Management IC", view: "neutral", conviction: "medium" },
  { id: "2368", name: "Gold Circuit Electronics", name_jp: "金像電子", ticker: "2368.TW", exchange: "TWSE", sector: "PCB / IC Substrates", view: "bullish", conviction: "medium" },
  { id: "1303", name: "Nanya Plastics", name_jp: "南亜プラスチック", ticker: "1303.TW", exchange: "TWSE", sector: "Petrochemicals / Semiconductor Materials", view: "neutral", conviction: "low" },

  // China — SSE / SZSE (22)
  { id: "300308", name: "Zhongji Innolight", name_jp: "中際旭創", ticker: "300308.SZ", exchange: "SZSE", sector: "Optical Transceivers / AI Networking", view: "bullish", conviction: "high" },
  { id: "300502", name: "Eoptolink Technology", name_jp: "新易盛", ticker: "300502.SZ", exchange: "SZSE", sector: "Optical Transceivers", view: "bullish", conviction: "medium" },
  { id: "688981", name: "SMIC", name_jp: "中芯国際 (SMIC)", ticker: "688981.SS", exchange: "SSE", sector: "Semiconductor Foundry", view: "neutral", conviction: "medium" },
  { id: "000725", name: "BOE Technology", name_jp: "京東方科技", ticker: "000725.SZ", exchange: "SZSE", sector: "Display Panels", view: "neutral", conviction: "low" },
  { id: "002475", name: "Luxshare Precision", name_jp: "立訊精密", ticker: "002475.SZ", exchange: "SZSE", sector: "Connectors / Apple Supply Chain", view: "bullish", conviction: "medium" },
  { id: "603501", name: "Will Semiconductor", name_jp: "韋爾半導体", ticker: "603501.SS", exchange: "SSE", sector: "CIS / Image Sensors", view: "neutral", conviction: "medium" },
  { id: "688256", name: "Cambricon Technologies", name_jp: "寒武紀科技", ticker: "688256.SS", exchange: "SSE", sector: "AI Chips", view: "neutral", conviction: "low" },
  { id: "002371", name: "NAURA Technology", name_jp: "北方華創", ticker: "002371.SZ", exchange: "SZSE", sector: "Semiconductor Equipment", view: "bullish", conviction: "medium" },
  { id: "688041", name: "Hygon Information Technology", name_jp: "海光信息", ticker: "688041.SS", exchange: "SSE", sector: "x86 CPU / Server Chips", view: "neutral", conviction: "low" },
  { id: "688008", name: "Montage Technology", name_jp: "瀾起科技", ticker: "688008.SS", exchange: "SSE", sector: "Memory Interface / Server Chips", view: "neutral", conviction: "medium" },
  { id: "603986", name: "GigaDevice Semiconductor", name_jp: "兆易創新", ticker: "603986.SS", exchange: "SSE", sector: "Flash Memory / MCU", view: "neutral", conviction: "low" },
  { id: "000977", name: "Inspur Electronic Information", name_jp: "浪潮電子信息", ticker: "000977.SZ", exchange: "SZSE", sector: "AI Servers", view: "neutral", conviction: "low" },
  { id: "603019", name: "Dawning Information (Sugon)", name_jp: "中科曙光", ticker: "603019.SS", exchange: "SSE", sector: "AI Servers / HPC", view: "neutral", conviction: "low" },
  { id: "603290", name: "Star Power Semiconductor", name_jp: "斯達半導", ticker: "603290.SS", exchange: "SSE", sector: "IGBT / Power Semis", view: "neutral", conviction: "low" },
  { id: "300782", name: "Maxscend Microelectronics", name_jp: "卓勝微電子", ticker: "300782.SZ", exchange: "SZSE", sector: "RF Semiconductors", view: "neutral", conviction: "low" },
  { id: "600487", name: "Hengtong Optic-Electric", name_jp: "亨通光電", ticker: "600487.SS", exchange: "SSE", sector: "Fiber Optic", view: "neutral", conviction: "low" },
  { id: "688082", name: "ACM Research (Shanghai)", name_jp: "盛美半導体", ticker: "688082.SS", exchange: "SSE", sector: "Semiconductor Equipment (cleaning)", view: "neutral", conviction: "medium" },
  { id: "002156", name: "Tongfu Microelectronics", name_jp: "通富微電子", ticker: "002156.SZ", exchange: "SZSE", sector: "OSAT / Packaging", view: "neutral", conviction: "low" },
  { id: "600584", name: "JCET Group", name_jp: "長電科技", ticker: "600584.SS", exchange: "SSE", sector: "OSAT / Packaging", view: "neutral", conviction: "low" },
  { id: "300750", name: "CATL", name_jp: "寧徳時代", ticker: "300750.SZ", exchange: "SZSE", sector: "EV Batteries / Energy Storage", view: "bullish", conviction: "high" },
  { id: "300274", name: "Sungrow Power Supply", name_jp: "陽光電源", ticker: "300274.SZ", exchange: "SZSE", sector: "Solar Inverters / Energy Storage", view: "bullish", conviction: "medium" },
  { id: "300394", name: "Suzhou TFC Optical Communication", name_jp: "天孚通信", ticker: "300394.SZ", exchange: "SZSE", sector: "Optical Interconnects / Data Center", view: "bullish", conviction: "medium" },

  // Hong Kong — HKEX (12)
  { id: "0700", name: "Tencent Holdings", name_jp: "テンセント", ticker: "0700.HK", exchange: "HKEX", sector: "Internet / AI / Gaming", view: "bullish", conviction: "medium" },
  { id: "9988", name: "Alibaba Group", name_jp: "アリババグループ", ticker: "9988.HK", exchange: "HKEX", sector: "E-commerce / Cloud / AI", view: "bullish", conviction: "medium" },
  { id: "1810", name: "Xiaomi Corp", name_jp: "シャオミ", ticker: "1810.HK", exchange: "HKEX", sector: "Consumer Electronics / EV", view: "bullish", conviction: "medium" },
  { id: "1211", name: "BYD Company", name_jp: "BYD", ticker: "1211.HK", exchange: "HKEX", sector: "EV / Batteries / Semis", view: "bullish", conviction: "medium" },
  { id: "0992", name: "Lenovo Group", name_jp: "レノボ・グループ", ticker: "0992.HK", exchange: "HKEX", sector: "PC / Servers", view: "neutral", conviction: "low" },
  { id: "0285", name: "BYD Electronic", name_jp: "比亜迪電子", ticker: "0285.HK", exchange: "HKEX", sector: "EMS / Components", view: "neutral", conviction: "low" },
  { id: "2382_HK", name: "Sunny Optical", name_jp: "舜宇光学科技", ticker: "2382.HK", exchange: "HKEX", sector: "Optical Components", view: "neutral", conviction: "medium" },
  { id: "3888", name: "Kingsoft Corp", name_jp: "キングソフト", ticker: "3888.HK", exchange: "HKEX", sector: "Software / AI / Cloud", view: "neutral", conviction: "low" },
  { id: "9698", name: "GDS Holdings", name_jp: "万国数据", ticker: "9698.HK", exchange: "HKEX", sector: "Data Centers", view: "bullish", conviction: "medium" },
  { id: "0981", name: "SMIC (H-shares)", name_jp: "中芯国際（H株）", ticker: "0981.HK", exchange: "HKEX", sector: "Semiconductor Foundry", view: "neutral", conviction: "low" },
  { id: "0100", name: "Minimax Group", name_jp: "ミニマックス", ticker: "0100.HK", exchange: "HKEX", sector: "AI / Video Generation / Foundation Models", view: "bullish", conviction: "medium" },
  { id: "2513", name: "Knowledge Atlas / Zhipu AI", name_jp: "智譜AI", ticker: "2513.HK", exchange: "HKEX", sector: "AI / Large Language Models", view: "bullish", conviction: "medium" },

  // India — NSE / BSE (8)
  { id: "INFY", name: "Infosys", name_jp: "インフォシス", ticker: "INFY.NS", exchange: "NSE", sector: "IT Services", view: "neutral", conviction: "medium" },
  { id: "TCS", name: "Tata Consultancy Services", name_jp: "タタ・コンサルタンシー・サービシズ", ticker: "TCS.NS", exchange: "NSE", sector: "IT Services", view: "neutral", conviction: "medium" },
  { id: "HCLTECH", name: "HCL Technologies", name_jp: "HCLテクノロジーズ", ticker: "HCLTECH.NS", exchange: "NSE", sector: "IT Services", view: "neutral", conviction: "low" },
  { id: "WIPRO", name: "Wipro", name_jp: "ウィプロ", ticker: "WIPRO.NS", exchange: "NSE", sector: "IT Services", view: "neutral", conviction: "low" },
  { id: "TECHM", name: "Tech Mahindra", name_jp: "テック・マヒンドラ", ticker: "TECHM.NS", exchange: "NSE", sector: "IT Services / 5G", view: "neutral", conviction: "low" },
  { id: "BHARTIARTL", name: "Bharti Airtel", name_jp: "バーティ・エアテル", ticker: "BHARTIARTL.NS", exchange: "NSE", sector: "Telecom / Digital", view: "bullish", conviction: "medium" },
  { id: "RELIANCE", name: "Reliance Industries", name_jp: "リライアンス・インダストリーズ", ticker: "RELIANCE.NS", exchange: "NSE", sector: "Tech / Telecom / Digital", view: "neutral", conviction: "medium" },
  { id: "PAYTM", name: "One 97 Communications (Paytm)", name_jp: "ペイティーエム", ticker: "PAYTM.NS", exchange: "NSE", sector: "Fintech / Digital Payments", view: "neutral", conviction: "low" },

  // Australia — ASX (7)
  { id: "XRO", name: "Xero", name_jp: "ゼロ", ticker: "XRO.AX", exchange: "ASX", sector: "Cloud Accounting Software", view: "bullish", conviction: "medium" },
  { id: "WTC", name: "WiseTech Global", name_jp: "ワイズテック・グローバル", ticker: "WTC.AX", exchange: "ASX", sector: "Logistics Software", view: "bullish", conviction: "medium" },
  { id: "TNE", name: "Technology One", name_jp: "テクノロジー・ワン", ticker: "TNE.AX", exchange: "ASX", sector: "Enterprise SaaS", view: "neutral", conviction: "low" },
  { id: "PME", name: "Pro Medicus", name_jp: "プロ・メディカス", ticker: "PME.AX", exchange: "ASX", sector: "Medical Imaging AI", view: "bullish", conviction: "high" },
  { id: "NXT", name: "NextDC", name_jp: "ネクストDC", ticker: "NXT.AX", exchange: "ASX", sector: "Data Centers", view: "bullish", conviction: "medium" },
  { id: "REA", name: "REA Group", name_jp: "REAグループ", ticker: "REA.AX", exchange: "ASX", sector: "Property Tech / Digital", view: "neutral", conviction: "low" },
  { id: "SEK", name: "Seek", name_jp: "シーク", ticker: "SEK.AX", exchange: "ASX", sector: "Employment Tech / AI", view: "neutral", conviction: "low" },

  // Southeast Asia (2)
  { id: "SE", name: "Sea Limited", name_jp: "シー・リミテッド", ticker: "SE", exchange: "NYSE", sector: "Gaming / E-commerce / Fintech", view: "bullish", conviction: "medium" },
  { id: "GRAB", name: "Grab Holdings", name_jp: "グラブ・ホールディングス", ticker: "GRAB", exchange: "NASDAQ", sector: "Ride-hailing / Superapp", view: "neutral", conviction: "low" },
];

// ========== NEW FIELD MAPPINGS ==========

// Country derived from exchange
const EXCHANGE_TO_COUNTRY = {
  NASDAQ: "US", NYSE: "US",
  TSE: "Japan",
  KRX: "Korea",
  TWSE: "Taiwan",
  SSE: "China", SZSE: "China",
  HKEX: "Hong Kong",
  NSE: "India",
  ASX: "Australia",
  SGX: "Singapore",
};

// Benchmark index per exchange
const EXCHANGE_TO_BENCHMARK = {
  NASDAQ: "^IXIC", NYSE: "^GSPC",
  TSE: "^TPX",
  KRX: "^KS11",
  TWSE: "^TWII",
  SSE: "000001.SS", SZSE: "399001.SZ",
  HKEX: "^HSI",
  NSE: "^NSEI",
  ASX: "^AXJO",
  SGX: "^STI",
};

// Classification (sub-group from architecture doc)
const CLASSIFICATION_MAP = {
  // Mega-Cap Tech
  AAPL: "Mega-Cap Tech", NVDA: "Mega-Cap Tech", MSFT: "Mega-Cap Tech",
  AMZN: "Mega-Cap Tech", GOOGL: "Mega-Cap Tech", META: "Mega-Cap Tech",
  TSLA: "Mega-Cap Tech", AVGO: "Mega-Cap Tech",
  ASML: "Mega-Cap Tech",
  // Semiconductors
  AMD: "Semiconductors", INTC: "Semiconductors", QCOM: "Semiconductors",
  MU: "Semiconductors", TXN: "Semiconductors", AMAT: "Semiconductors",
  LRCX: "Semiconductors", KLAC: "Semiconductors", ADI: "Semiconductors",
  MRVL: "Semiconductors", NXPI: "Semiconductors", MCHP: "Semiconductors",
  ON: "Semiconductors", MPWR: "Semiconductors", ARM: "Semiconductors",
  SNPS: "Semiconductors", CDNS: "Semiconductors", TER: "Semiconductors",
  SWKS: "Semiconductors", QRVO: "Semiconductors", ENTG: "Semiconductors",
  GFS: "Semiconductors", ALAB: "Semiconductors", CRDO: "Semiconductors",
  COHR: "Semiconductors",
  // Data Storage / Memory
  WDC: "Data Storage / Memory", SNDK: "Data Storage / Memory",
  STX: "Data Storage / Memory", RMBS: "Data Storage / Memory",
  MTSI: "Data Storage / Memory",
  // Software / Cloud / AI
  CRM: "Software / Cloud / AI", ADBE: "Software / Cloud / AI",
  NOW: "Software / Cloud / AI", PLTR: "Software / Cloud / AI",
  SNOW: "Software / Cloud / AI", SHOP: "Software / Cloud / AI",
  PANW: "Software / Cloud / AI", CRWD: "Software / Cloud / AI",
  INTU: "Software / Cloud / AI", WDAY: "Software / Cloud / AI",
  DDOG: "Software / Cloud / AI", FTNT: "Software / Cloud / AI",
  ADSK: "Software / Cloud / AI", TEAM: "Software / Cloud / AI",
  ZS: "Software / Cloud / AI", APP: "Software / Cloud / AI",
  MDB: "Software / Cloud / AI", TWLO: "Software / Cloud / AI",
  CFLT: "Software / Cloud / AI", NET: "Software / Cloud / AI",
  HUBS: "Software / Cloud / AI", ORCL: "Software / Cloud / AI",
  IBM: "Software / Cloud / AI", ANET: "Software / Cloud / AI",
  CSCO: "Software / Cloud / AI", NTAP: "Software / Cloud / AI",
  PSTG: "Software / Cloud / AI", DELL: "Software / Cloud / AI",
  HPE: "Software / Cloud / AI", SMCI: "Software / Cloud / AI",
  // AI Infrastructure / Hardware
  VRT: "AI Infrastructure", ETN: "AI Infrastructure",
  CEG: "AI Infrastructure", VST: "AI Infrastructure",
  GLW: "AI Infrastructure", CLS: "AI Infrastructure",
  // Internet / Digital Platforms
  NFLX: "Internet / Digital", UBER: "Internet / Digital",
  ABNB: "Internet / Digital", DASH: "Internet / Digital",
  PYPL: "Internet / Digital", XYZ: "Internet / Digital",
  COIN: "Internet / Digital", MELI: "Internet / Digital",
  PDD: "Internet / Digital", EA: "Internet / Digital",
  // Telecom / Media Tech
  TMUS: "Telecom / Media", CMCSA: "Telecom / Media",
  WBD: "Telecom / Media", TTWO: "Telecom / Media",
  SPOT: "Telecom / Media",
  // Misc Tech / AI-Adjacent
  CTSH: "Misc Tech / AI-Adjacent", ACN: "Misc Tech / AI-Adjacent",
  APH: "Misc Tech / AI-Adjacent", TEL: "Misc Tech / AI-Adjacent",
  FLEX: "Misc Tech / AI-Adjacent", FN: "Misc Tech / AI-Adjacent",
  JBL: "Misc Tech / AI-Adjacent", LITE: "Misc Tech / AI-Adjacent",
  PI: "Misc Tech / AI-Adjacent", NVMI: "Misc Tech / AI-Adjacent",
  // Japan — TSE
  "8035": "Japan — TSE", "6857": "Japan — TSE", "6146": "Japan — TSE",
  "6920": "Japan — TSE", "7735": "Japan — TSE", "6323": "Japan — TSE",
  "6723": "Japan — TSE", "6758": "Japan — TSE", "6861": "Japan — TSE",
  "6501": "Japan — TSE", "6981": "Japan — TSE", "6762": "Japan — TSE",
  "4062": "Japan — TSE", "6967": "Japan — TSE", "6963": "Japan — TSE",
  "6526": "Japan — TSE", "6525": "Japan — TSE", "7729": "Japan — TSE",
  "6965": "Japan — TSE", "6702": "Japan — TSE", "6701": "Japan — TSE",
  "6752": "Japan — TSE", "9984": "Japan — TSE", "7731": "Japan — TSE",
  "3436": "Japan — TSE", "4755": "Japan — TSE", "4689": "Japan — TSE",
  "9434": "Japan — TSE",
  "7751": "Japan — TSE", "9697": "Japan — TSE", "6361": "Japan — TSE",
  "6954": "Japan — TSE", "7741": "Japan — TSE", "5016": "Japan — TSE",
  "285A": "Japan — TSE", "3659": "Japan — TSE", "7974": "Japan — TSE",
  "3110": "Japan — TSE", "6098": "Japan — TSE", "4004": "Japan — TSE",
  "6976": "Japan — TSE",
  // Korea — KRX
  "005930": "Korea — KRX", "000660": "Korea — KRX", "006400": "Korea — KRX",
  "373220": "Korea — KRX", "012450": "Korea — KRX", "007660": "Korea — KRX",
  "035420": "Korea — KRX", "035720": "Korea — KRX", "009150": "Korea — KRX",
  "017670": "Korea — KRX", "267260": "Korea — KRX",
  "034020": "Korea — KRX", "402340": "Korea — KRX",
  // Taiwan — TWSE
  "2330": "Taiwan — TWSE", "2454": "Taiwan — TWSE", "2317": "Taiwan — TWSE",
  "2308": "Taiwan — TWSE", "2345": "Taiwan — TWSE", "2382_TW": "Taiwan — TWSE",
  "3231": "Taiwan — TWSE", "3711": "Taiwan — TWSE", "2303": "Taiwan — TWSE",
  "3034": "Taiwan — TWSE", "2379": "Taiwan — TWSE", "2408": "Taiwan — TWSE",
  "2301": "Taiwan — TWSE",
  "2395": "Taiwan — TWSE", "3324": "Taiwan — TWSE", "2327": "Taiwan — TWSE",
  "3037": "Taiwan — TWSE", "6415": "Taiwan — TWSE",
  "2368": "Taiwan — TWSE", "1303": "Taiwan — TWSE",
  // China — SSE / SZSE
  "300308": "China — SSE/SZSE", "300502": "China — SSE/SZSE",
  "688981": "China — SSE/SZSE", "000725": "China — SSE/SZSE",
  "002475": "China — SSE/SZSE", "603501": "China — SSE/SZSE",
  "688256": "China — SSE/SZSE", "002371": "China — SSE/SZSE",
  "688041": "China — SSE/SZSE", "688008": "China — SSE/SZSE",
  "603986": "China — SSE/SZSE", "000977": "China — SSE/SZSE",
  "603019": "China — SSE/SZSE", "603290": "China — SSE/SZSE",
  "300782": "China — SSE/SZSE", "600487": "China — SSE/SZSE",
  "688082": "China — SSE/SZSE",
  "002156": "China — SSE/SZSE", "600584": "China — SSE/SZSE",
  "300750": "China — SSE/SZSE", "300274": "China — SSE/SZSE",
  "300394": "China — SSE/SZSE",
  // Hong Kong — HKEX
  "0700": "Hong Kong — HKEX", "9988": "Hong Kong — HKEX",
  "1810": "Hong Kong — HKEX", "1211": "Hong Kong — HKEX",
  "0992": "Hong Kong — HKEX", "0285": "Hong Kong — HKEX",
  "2382_HK": "Hong Kong — HKEX", "3888": "Hong Kong — HKEX",
  "9698": "Hong Kong — HKEX", "0981": "Hong Kong — HKEX",
  "0100": "Hong Kong — HKEX", "2513": "Hong Kong — HKEX",
  // India — NSE
  INFY: "India — NSE", TCS: "India — NSE", HCLTECH: "India — NSE",
  WIPRO: "India — NSE", TECHM: "India — NSE", BHARTIARTL: "India — NSE",
  RELIANCE: "India — NSE", PAYTM: "India — NSE",
  // Australia — ASX
  XRO: "Australia — ASX", WTC: "Australia — ASX", TNE: "Australia — ASX",
  PME: "Australia — ASX", NXT: "Australia — ASX", REA: "Australia — ASX",
  SEK: "Australia — ASX",
  // US-listed China/APAC ADRs
  BIDU: "US-listed ADR", FUTU: "US-listed ADR", NTES: "US-listed ADR",
  TME: "US-listed ADR", TCOM: "US-listed ADR",
  // Southeast Asia
  SE: "Southeast Asia", GRAB: "Southeast Asia",
};

// Market cap in USD billions (approximate, early 2026)
const MARKET_CAPS = {
  "AAPL": 3400, "NVDA": 3200, "MSFT": 3100, "AMZN": 2400, "GOOGL": 2200,
  "META": 1700, "TSLA": 1100, "AVGO": 1000, "ASML": 350,
  "AMD": 250, "INTC": 100, "QCOM": 200, "MU": 130, "TXN": 180,
  "AMAT": 170, "LRCX": 110, "KLAC": 100, "ADI": 110, "MRVL": 90,
  "NXPI": 55, "MCHP": 40, "ON": 30, "MPWR": 40, "ARM": 160,
  "SNPS": 85, "CDNS": 80, "TER": 22, "SWKS": 15, "QRVO": 8,
  "ENTG": 18, "GFS": 25, "ALAB": 20, "CRDO": 12, "COHR": 15,
  "WDC": 22, "SNDK": 20, "STX": 22, "RMBS": 8, "MTSI": 10,
  "CRM": 280, "ADBE": 200, "NOW": 200, "PLTR": 180, "SNOW": 55,
  "SHOP": 120, "PANW": 130, "CRWD": 85, "INTU": 180, "WDAY": 65,
  "DDOG": 45, "FTNT": 60, "ADSK": 55, "TEAM": 50, "ZS": 30,
  "APP": 100, "MDB": 25, "TWLO": 15, "CFLT": 10, "NET": 35,
  "HUBS": 30, "ORCL": 400, "IBM": 200, "ANET": 110, "CSCO": 230,
  "NTAP": 25, "PSTG": 18, "DELL": 95, "HPE": 25, "SMCI": 25,
  "VRT": 45, "ETN": 140, "CEG": 75, "VST": 45, "GLW": 40, "CLS": 12,
  "NFLX": 380, "UBER": 155, "ABNB": 80, "DASH": 70, "PYPL": 75,
  "XYZ": 45, "COIN": 50, "MELI": 95, "PDD": 140, "EA": 40,
  "TMUS": 270, "CMCSA": 150, "WBD": 25, "TTWO": 30, "SPOT": 90,
  "CTSH": 40, "ACN": 210, "APH": 85, "TEL": 45, "FLEX": 15,
  "FN": 12, "JBL": 15, "LITE": 6, "PI": 5, "NVMI": 6,
  "8035": 80, "6857": 55, "6146": 35, "6920": 15, "7735": 10,
  "6323": 5, "6723": 35, "6758": 120, "6861": 110, "6501": 80,
  "6981": 45, "6762": 20, "4062": 8, "6967": 5, "6963": 8,
  "6526": 5, "6525": 5, "7729": 3, "6965": 5, "6702": 30,
  "6701": 20, "6752": 25, "9984": 90, "7731": 5, "3436": 4,
  "4755": 10, "4689": 10, "9434": 60,
  "7751": 35, "9697": 12, "6361": 10, "6954": 35, "7741": 55,
  "5016": 5, "285A": 15, "3659": 20, "7974": 80, "3110": 2,
  "6098": 90, "4004": 8, "6976": 4,
  "005930": 350, "000660": 100, "006400": 15, "373220": 70, "012450": 15,
  "007660": 3, "035420": 20, "035720": 10, "009150": 10,
  "017670": 10, "267260": 15, "034020": 5, "402340": 12,
  "2330": 850, "2454": 60, "2317": 55, "2308": 35, "2345": 12,
  "2382_TW": 30, "3231": 8, "3711": 20, "2303": 15, "3034": 12,
  "2379": 8, "2408": 4, "2301": 6,
  "2395": 6, "3324": 4, "2327": 6, "3037": 10, "6415": 5,
  "2368": 3, "1303": 8,
  "300308": 25, "300502": 8, "688981": 40, "000725": 15, "002475": 40,
  "603501": 15, "688256": 20, "002371": 15, "688041": 20, "688008": 8,
  "603986": 8, "000977": 8, "603019": 12, "603290": 5, "300782": 5,
  "600487": 5, "688082": 4, "002156": 5, "600584": 8,
  "300750": 150, "300274": 15, "300394": 8,
  "0700": 450, "9988": 200, "1810": 100, "1211": 100, "0992": 12,
  "0285": 5, "2382_HK": 8, "3888": 5, "9698": 8, "0981": 30,
  "0100": 5, "2513": 3,
  "INFY": 85, "TCS": 170, "HCLTECH": 50, "WIPRO": 30, "TECHM": 15,
  "BHARTIARTL": 100, "RELIANCE": 230, "PAYTM": 5,
  "XRO": 18, "WTC": 25, "TNE": 5, "PME": 15, "NXT": 5, "REA": 15, "SEK": 5,
  "SE": 30, "GRAB": 15,
  "BIDU": 35, "FUTU": 8, "NTES": 65, "TME": 8, "TCOM": 25,
};

// ========== TEMPLATE GENERATORS ==========

function generateSweepCriteria(sector) {
  const sources = ["company_ir", "reuters_nikkei", "twitter", "tradingview", "industry"];
  // Add EDINET for Japanese companies
  const focus = [];

  if (sector.toLowerCase().includes("semiconductor")) {
    focus.push(
      "Monitor semiconductor cycle indicators and order trends",
      "Track AI/HPC chip demand and capacity utilization",
      "Watch for customer concentration risk and new design wins"
    );
  } else if (sector.toLowerCase().includes("cloud") || sector.toLowerCase().includes("software") || sector.toLowerCase().includes("saas")) {
    focus.push(
      "Track enterprise software spending trends and deal pipeline",
      "Monitor AI integration and product innovation",
      "Watch revenue growth acceleration/deceleration and margin trends"
    );
  } else if (sector.toLowerCase().includes("ai") || sector.toLowerCase().includes("data center")) {
    focus.push(
      "Track AI infrastructure capex trends from hyperscalers",
      "Monitor competitive positioning and market share",
      "Watch for margin expansion from higher-value product mix"
    );
  } else if (sector.toLowerCase().includes("memory") || sector.toLowerCase().includes("dram") || sector.toLowerCase().includes("hbm")) {
    focus.push(
      "Monitor memory pricing trends (DRAM, NAND, HBM)",
      "Track AI-driven HBM demand and capacity allocation",
      "Watch inventory levels and supply-demand balance"
    );
  } else if (sector.toLowerCase().includes("networking") || sector.toLowerCase().includes("optical")) {
    focus.push(
      "Track 400G/800G networking upgrade cycle demand",
      "Monitor hyperscaler networking capex trends",
      "Watch competitive dynamics and new product ramps"
    );
  } else if (sector.toLowerCase().includes("telecom")) {
    focus.push(
      "Monitor subscriber growth and ARPU trends",
      "Track 5G/AI infrastructure investment returns",
      "Watch competitive dynamics and market share"
    );
  } else if (sector.toLowerCase().includes("gaming") || sector.toLowerCase().includes("entertainment")) {
    focus.push(
      "Track content pipeline and release calendar",
      "Monitor engagement metrics and monetization trends",
      "Watch competitive landscape and market share"
    );
  } else if (sector.toLowerCase().includes("ev") || sector.toLowerCase().includes("battery") || sector.toLowerCase().includes("auto")) {
    focus.push(
      "Track EV sales trends and market penetration",
      "Monitor battery cost reduction and technology roadmap",
      "Watch regulatory environment and subsidy policies"
    );
  } else if (sector.toLowerCase().includes("fintech") || sector.toLowerCase().includes("payment")) {
    focus.push(
      "Monitor payment volume growth and take rate trends",
      "Track regulatory changes affecting digital payments",
      "Watch user acquisition costs and engagement metrics"
    );
  } else if (sector.toLowerCase().includes("cybersecurity")) {
    focus.push(
      "Track enterprise cybersecurity spending and budget trends",
      "Monitor platform consolidation and cross-sell metrics",
      "Watch threat landscape evolution driving demand"
    );
  } else if (sector.toLowerCase().includes("it services") || sector.toLowerCase().includes("consulting")) {
    focus.push(
      "Track IT services demand trends and deal pipeline",
      "Monitor AI/generative AI adoption impact on services",
      "Watch attrition rates and margin trends"
    );
  } else if (sector.toLowerCase().includes("e-commerce")) {
    focus.push(
      "Monitor GMV growth and take rate trends",
      "Track competitive dynamics and market share shifts",
      "Watch logistics efficiency and fulfillment costs"
    );
  } else if (sector.toLowerCase().includes("power") || sector.toLowerCase().includes("energy") || sector.toLowerCase().includes("nuclear")) {
    focus.push(
      "Track data center power demand growth trajectory",
      "Monitor power infrastructure order backlog and book-to-bill",
      "Watch regulatory and permitting developments"
    );
  } else if (sector.toLowerCase().includes("ems") || sector.toLowerCase().includes("odm") || sector.toLowerCase().includes("manufacturing")) {
    focus.push(
      "Monitor AI server and hardware assembly demand trends",
      "Track customer diversification and new platform wins",
      "Watch margin dynamics and capacity utilization"
    );
  } else if (sector.toLowerCase().includes("component") || sector.toLowerCase().includes("connector") || sector.toLowerCase().includes("passive")) {
    focus.push(
      "Monitor end-market demand trends (auto, industrial, consumer)",
      "Track inventory channel dynamics and restocking cycles",
      "Watch pricing trends and product mix shifts"
    );
  } else if (sector.toLowerCase().includes("display") || sector.toLowerCase().includes("oled")) {
    focus.push(
      "Track display panel pricing and utilization rates",
      "Monitor OLED adoption trends across form factors",
      "Watch capex cycle and supply-demand balance"
    );
  } else if (sector.toLowerCase().includes("packaging") || sector.toLowerCase().includes("substrate")) {
    focus.push(
      "Monitor advanced packaging demand (CoWoS, 2.5D/3D)",
      "Track IC substrate capacity expansion and pricing",
      "Watch AI chip packaging requirements evolution"
    );
  } else {
    focus.push(
      "Monitor industry trends and competitive positioning",
      "Track revenue growth drivers and margin trajectory",
      "Watch for material changes in market dynamics"
    );
  }

  return { sources, focus };
}

function generateProfile(company) {
  const { name, sector, view, conviction } = company;

  const overview = `${name} operates in the ${sector} sector. The company is positioned as a key player in its segment.`;

  let thesis;
  if (view === "bullish") {
    thesis = `${name} is well-positioned to benefit from structural growth tailwinds in ${sector}. Strong competitive positioning and execution support an above-market growth trajectory.`;
  } else if (view === "bearish") {
    thesis = `${name} faces headwinds in ${sector} with increasing competitive pressure and structural challenges. Current valuation does not adequately reflect downside risks.`;
  } else {
    thesis = `${name} offers balanced risk/reward in ${sector}. Growth trajectory is in-line with market expectations, with limited catalysts for material re-rating in the near term.`;
  }

  const key_assumptions = [
    `Core ${sector.split("/")[0].trim()} market grows in line with industry forecasts`,
    `${name} maintains competitive positioning and market share`,
    `Management executes on strategic priorities and capital allocation`,
    `Regulatory environment remains stable for operations`
  ];

  const risk_factors = [
    `Competitive intensity increases in ${sector.split("/")[0].trim()}`,
    `Macroeconomic slowdown impacts end-market demand`,
    `Execution risk on product roadmap and strategic initiatives`,
    `Currency and geopolitical risks affecting operations`
  ];

  // Generate representative earnings data
  const earnings = [
    { period: "FY2024", revenue: "—", operatingProfit: "—", netProfit: "—", eps: "—" },
    { period: "FY2025", revenue: "—", operatingProfit: "—", netProfit: "—", eps: "—" },
    { period: "FY2026E", revenue: "—", operatingProfit: "—", netProfit: "—", eps: "—", isEstimate: true },
    { period: "FY2027E", revenue: "—", operatingProfit: "—", netProfit: "—", eps: "—", isEstimate: true }
  ];

  const segments = [
    { name: "Primary Segment", revenue: "—", share: "—" },
    { name: "Secondary Segment", revenue: "—", share: "—" }
  ];

  const valuation_metrics = [
    { label: "P/E (FY26E)", current: "—", sectorAvg: "—" },
    { label: "EV/EBITDA", current: "—", sectorAvg: "—" },
    { label: "P/B", current: "—" },
    { label: "Div. Yield", current: "—" }
  ];

  const valuation_scenarios = [
    { label: "Bull Case", targetPrice: "—", methodology: "Upside scenario based on outperformance", upside: "—" },
    { label: "Base Case", targetPrice: "—", methodology: "Fair value based on consensus estimates", upside: "—" },
    { label: "Bear Case", targetPrice: "—", methodology: "Downside scenario on market weakness", upside: "—" }
  ];

  const valuation_notes = `${name} valuation analysis pending first sweep cycle. Agent will populate with live data from initial research sweep.`;

  return {
    overview,
    thesis,
    key_assumptions,
    risk_factors,
    earnings,
    segments,
    current_price: "—",
    fair_value: "—",
    valuation_metrics,
    valuation_scenarios,
    valuation_notes,
  };
}

// ========== GENERATE SEED ==========

const companies = ALL_COMPANIES.map((c) => {
  const exchangeSuffix = {
    TSE: ".T",
    KRX: ".KS",
    TWSE: ".TW",
    SSE: ".SS",
    SZSE: ".SZ",
    HKEX: ".HK",
    NSE: ".NS",
    ASX: ".AX",
    SGX: ".SI",
    NASDAQ: "",
    NYSE: "",
  };

  // Use ticker field as-is if it contains a suffix already, otherwise add one
  const ticker_full = c.ticker.includes(".") ? c.ticker : c.ticker + (exchangeSuffix[c.exchange] || "");

  // New fields for Phase 5
  const country = EXCHANGE_TO_COUNTRY[c.exchange] || "Unknown";
  const classification = CLASSIFICATION_MAP[c.id] || country;
  const market_cap_usd = MARKET_CAPS[c.id] || null;
  const benchmark_index = EXCHANGE_TO_BENCHMARK[c.exchange] || "";

  // Use existing rich data if available, but augment with new fields
  const existingEntry = existingMap.get(c.ticker);
  if (existingEntry) {
    return {
      ...existingEntry,
      exchange: c.exchange,
      country,
      classification,
      market_cap_usd,
      benchmark_index,
    };
  }

  // Check temp Japan files
  const tmpEntry = tmpMap.get(c.ticker);
  if (tmpEntry) {
    return {
      ...tmpEntry,
      exchange: c.exchange,
      country,
      classification,
      market_cap_usd,
      benchmark_index,
    };
  }

  // Generate new entry
  return {
    id: c.id,
    name: c.name,
    name_jp: c.name_jp,
    ticker_full,
    sector: c.sector,
    exchange: c.exchange,
    country,
    classification,
    market_cap_usd,
    benchmark_index,
    investment_view: c.view,
    conviction: c.conviction,
    profile_json: generateProfile(c),
    sweep_criteria_json: generateSweepCriteria(c.sector),
  };
});

// Write output
const output = { companies };
const outputPath = path.join(__dirname, "..", "data", "seed.json");
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`Generated seed.json with ${companies.length} companies`);

// Count by region
const us = companies.filter((c) => !c.ticker_full.includes("."));
const apac = companies.filter((c) => c.ticker_full.includes("."));
console.log(`  US companies: ${us.length}`);
console.log(`  APAC companies: ${apac.length}`);

// Count rich vs template
const rich = companies.filter((c) => c.profile_json.current_price !== "—" && c.profile_json.current_price);
const template = companies.filter((c) => c.profile_json.current_price === "—" || !c.profile_json.current_price);
console.log(`  Rich profiles (existing data): ${rich.length}`);
console.log(`  Template profiles (to be enriched by sweep): ${template.length}`);

// Verify no duplicates
const tickers = companies.map((c) => c.ticker_full);
const uniqueTickers = new Set(tickers);
if (uniqueTickers.size !== tickers.length) {
  const dupes = tickers.filter((t, i) => tickers.indexOf(t) !== i);
  console.warn(`  WARNING: ${dupes.length} duplicate tickers: ${dupes.join(", ")}`);
} else {
  console.log(`  No duplicate tickers ✓`);
}
