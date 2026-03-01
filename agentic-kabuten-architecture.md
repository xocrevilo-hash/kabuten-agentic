# Agentic Kabuten — Architecture & Build Spec

## Overview

Agentic Kabuten is an evolution of the Kabuten Japanese stock research platform. It introduces dedicated AI analyst agents — one per company — that conduct daily fundamental research sweeps, monitor data sources for material information, and maintain a living investment view for each covered company.

The platform targets a single power user (Oliver) acting as the orchestrator across all agents.

### Authentication

The site is protected by a simple password gate on the homepage. On first visit, users see a centered password input field. Entering the correct password (`fingerthumb`) grants access to the full site for the session. Implementation: lightweight client-side check with session cookie — no user accounts or database auth required. The **Enter button** must be **solid black background with white text**.

---

## Company Coverage

Coverage targets **230 companies** across the global technology and semiconductor value chain, organized into two regional groups: US (105) and APAC (125). The definitive list below is the single source of truth — every company listed here must be seeded in `seed.json` and have a company page built.

### US Companies (105)

**Mega-Cap Tech (10)**
| Company | Ticker | Exchange | Sector |
|---------|--------|----------|--------|
| Apple | AAPL | NASDAQ | Consumer Electronics / Hardware |
| Nvidia | NVDA | NASDAQ | Semiconductors / AI |
| Microsoft | MSFT | NASDAQ | Software / Cloud |
| Amazon | AMZN | NASDAQ | Cloud / AI |
| Alphabet (Class A) | GOOGL | NASDAQ | Cloud / AI / Advertising |
| Meta Platforms | META | NASDAQ | AI / Social / Advertising |
| Tesla | TSLA | NASDAQ | EV / Autonomy / AI |
| Broadcom | AVGO | NASDAQ | Semiconductors / Networking |
| ASML (ADR) | ASML | NASDAQ | Semiconductor Equipment |

**Semiconductors (25)**
| Company | Ticker | Exchange | Sector |
|---------|--------|----------|--------|
| Advanced Micro Devices | AMD | NASDAQ | Semiconductors |
| Intel | INTC | NASDAQ | Semiconductors / Foundry |
| Qualcomm | QCOM | NASDAQ | Semiconductors / Mobile |
| Micron Technology | MU | NASDAQ | Memory |
| Texas Instruments | TXN | NASDAQ | Analog Semiconductors |
| Applied Materials | AMAT | NASDAQ | Semiconductor Equipment |
| Lam Research | LRCX | NASDAQ | Semiconductor Equipment |
| KLA Corporation | KLAC | NASDAQ | Semiconductor Equipment |
| Analog Devices | ADI | NASDAQ | Analog Semiconductors |
| Marvell Technology | MRVL | NASDAQ | Semiconductors / Data Infra |
| NXP Semiconductors | NXPI | NASDAQ | Auto / Industrial Semis |
| Microchip Technology | MCHP | NASDAQ | Microcontrollers |
| ON Semiconductor | ON | NASDAQ | Power / Auto Semis |
| Monolithic Power Systems | MPWR | NASDAQ | Power Semiconductors |
| Arm Holdings | ARM | NASDAQ | Semiconductor IP / Design |
| Synopsys | SNPS | NASDAQ | EDA / Semiconductor Design |
| Cadence Design Systems | CDNS | NASDAQ | EDA / Semiconductor Design |
| Teradyne | TER | NASDAQ | Semiconductor Test Equipment |
| Skyworks Solutions | SWKS | NASDAQ | RF Semiconductors |
| Qorvo | QRVO | NASDAQ | RF Semiconductors |
| Entegris | ENTG | NASDAQ | Semiconductor Materials |
| GlobalFoundries | GFS | NASDAQ | Semiconductor Foundry |
| Astera Labs | ALAB | NASDAQ | Connectivity Semiconductors |
| Credo Technology | CRDO | NASDAQ | Connectivity Semiconductors |
| Coherent Corp | COHR | NYSE | Optical / Laser Semis |

**Data Storage / Memory (5)**
| Company | Ticker | Exchange | Sector |
|---------|--------|----------|--------|
| Western Digital | WDC | NASDAQ | Storage (HDD) |
| SanDisk | SNDK | NASDAQ | NAND Flash / SSD |
| Seagate Technology | STX | NASDAQ | Storage (HDD) |
| Rambus | RMBS | NASDAQ | Memory IP |
| MACOM Technology | MTSI | NASDAQ | Analog / RF Semis |

**Software / Cloud / AI (30)**
| Company | Ticker | Exchange | Sector |
|---------|--------|----------|--------|
| Salesforce | CRM | NYSE | Enterprise Cloud |
| Adobe | ADBE | NASDAQ | Creative / AI Software |
| ServiceNow | NOW | NYSE | Enterprise Cloud |
| Palantir Technologies | PLTR | NASDAQ | AI / Data Analytics |
| Snowflake | SNOW | NYSE | Cloud Data Platform |
| Shopify | SHOP | NYSE | E-commerce Cloud |
| Palo Alto Networks | PANW | NASDAQ | Cybersecurity |
| CrowdStrike | CRWD | NASDAQ | Cybersecurity |
| Intuit | INTU | NASDAQ | Financial Software |
| Workday | WDAY | NASDAQ | Enterprise Cloud |
| Datadog | DDOG | NASDAQ | Observability / Cloud |
| Fortinet | FTNT | NASDAQ | Cybersecurity |
| Autodesk | ADSK | NASDAQ | Design Software |
| Atlassian | TEAM | NASDAQ | Dev Tools / Collaboration |
| Zscaler | ZS | NASDAQ | Cybersecurity |
| AppLovin | APP | NASDAQ | Ad Tech / AI |
| MongoDB | MDB | NASDAQ | Database |
| Twilio | TWLO | NYSE | Communications Platform |
| Confluent | CFLT | NASDAQ | Data Streaming |
| Cloudflare | NET | NYSE | Edge / Cloud Infrastructure |
| HubSpot | HUBS | NYSE | Marketing / CRM Cloud |
| Oracle | ORCL | NYSE | Cloud / Database |
| IBM | IBM | NYSE | AI / Enterprise IT |
| Arista Networks | ANET | NYSE | Networking |
| Cisco Systems | CSCO | NASDAQ | Networking |
| NetApp | NTAP | NASDAQ | Storage / Cloud |
| Pure Storage | PSTG | NYSE | Flash Storage |
| Dell Technologies | DELL | NYSE | Hardware / AI Servers |
| Hewlett Packard Enterprise | HPE | NYSE | AI Servers / Networking |
| Super Micro Computer | SMCI | NASDAQ | AI Servers |

**AI Infrastructure / Hardware (6)**
| Company | Ticker | Exchange | Sector |
|---------|--------|----------|--------|
| Vertiv Holdings | VRT | NYSE | Data Center Power / Cooling |
| Eaton Corporation | ETN | NYSE | Power Management |
| Constellation Energy | CEG | NASDAQ | Nuclear / Data Center Power |
| Vistra Corp | VST | NYSE | Power / Data Center Energy |
| Corning | GLW | NYSE | Optical Fiber / Glass |
| Celestica | CLS | NYSE | EMS / AI Hardware |

**Internet / Digital Platforms (10)**
| Company | Ticker | Exchange | Sector |
|---------|--------|----------|--------|
| Netflix | NFLX | NASDAQ | Streaming |
| Uber Technologies | UBER | NYSE | Mobility / AI |
| Airbnb | ABNB | NASDAQ | Travel Tech |
| DoorDash | DASH | NASDAQ | Delivery Tech |
| PayPal | PYPL | NASDAQ | Fintech |
| Block (Square) | XYZ | NYSE | Fintech |
| Coinbase | COIN | NASDAQ | Crypto / Fintech |
| MercadoLibre | MELI | NASDAQ | LatAm E-commerce |
| PDD Holdings | PDD | NASDAQ | China E-commerce (US-listed) |
| Electronic Arts | EA | NASDAQ | Gaming |

**Telecom / Media Tech (5)**
| Company | Ticker | Exchange | Sector |
|---------|--------|----------|--------|
| T-Mobile US | TMUS | NASDAQ | Telecom |
| Comcast | CMCSA | NASDAQ | Telecom / Media |
| Warner Bros. Discovery | WBD | NASDAQ | Media / Streaming |
| Take-Two Interactive | TTWO | NASDAQ | Gaming |
| Spotify Technology | SPOT | NYSE | Music Streaming |

**China / APAC ADRs (5)**
| Company | Ticker | Exchange | Sector |
|---------|--------|----------|--------|
| Baidu (ADR) | BIDU | NASDAQ | AI / Search / Autonomous Driving |
| Futu Holdings | FUTU | NASDAQ | Digital Brokerage / Fintech |
| NetEase | NTES | NASDAQ | Gaming / Internet / AI |
| Tencent Music Entertainment | TME | NYSE | Music Streaming / Entertainment |
| Trip.com Group | TCOM | NASDAQ | Online Travel / AI |

**Misc Tech / AI-Adjacent (10)**
| Company | Ticker | Exchange | Sector |
|---------|--------|----------|--------|
| Cognizant | CTSH | NASDAQ | IT Services |
| Accenture | ACN | NYSE | IT Services / AI Consulting |
| Amphenol | APH | NYSE | Connectors / Networking |
| TE Connectivity | TEL | NYSE | Connectors / Sensors |
| Flex Ltd | FLEX | NASDAQ | EMS / Hardware |
| Fabrinet | FN | NYSE | Optical EMS (Thailand-based) |
| Jabil | JBL | NYSE | EMS / Manufacturing |
| Lumentum | LITE | NASDAQ | Optical Components |
| Impinj | PI | NASDAQ | RFID / IoT Semiconductors |
| Nova Ltd | NVMI | NASDAQ | Semiconductor Metrology |

### APAC Companies (125)

**Japan — TSE (41)**
| Company | Ticker | Exchange | Sector |
|---------|--------|----------|--------|
| Tokyo Electron | 8035 | TSE | Semiconductor Equipment |
| Advantest | 6857 | TSE | Semiconductor Test Equipment |
| Disco Corp | 6146 | TSE | Semiconductor Equipment (dicing/grinding) |
| Lasertec | 6920 | TSE | Semiconductor Inspection (EUV masks) |
| Screen Holdings | 7735 | TSE | Semiconductor Equipment (cleaning/coating) |
| Rorze Corp | 6323 | TSE | Semiconductor Automation / Robotics |
| Renesas Electronics | 6723 | TSE | Semiconductors / MCU |
| Sony Group | 6758 | TSE | Image Sensors / Entertainment |
| Keyence | 6861 | TSE | Sensors / Factory Automation |
| Hitachi | 6501 | TSE | IT / Infrastructure / AI |
| Murata Manufacturing | 6981 | TSE | Electronic Components |
| TDK Corp | 6762 | TSE | Electronic Components |
| Ibiden | 4062 | TSE | IC Substrates / Packaging |
| Shinko Electric Industries | 6967 | TSE | IC Substrates / Packaging |
| Rohm Co | 6963 | TSE | Power Semiconductors |
| Socionext | 6526 | TSE | SoC Design |
| Kokusai Electric | 6525 | TSE | Semiconductor Equipment (deposition) |
| Tokyo Seimitsu (Accretech) | 7729 | TSE | Semiconductor Equipment (test/metrology) |
| Hamamatsu Photonics | 6965 | TSE | Optical Sensors / Photonics |
| Fujitsu | 6702 | TSE | IT Services / Computing |
| NEC Corp | 6701 | TSE | IT / Telecom |
| Panasonic Holdings | 6752 | TSE | Electronics / Batteries |
| SoftBank Group | 9984 | TSE | AI Investment / Telecom |
| Nikon Corp | 7731 | TSE | Lithography / Optics |
| SUMCO Corp | 3436 | TSE | Silicon Wafers |
| Rakuten Group | 4755 | TSE | Internet / E-commerce / Fintech |
| LY Corp | 4689 | TSE | Internet / Search / Messaging |
| SoftBank Corp | 9434 | TSE | Telecom / AI / Digital |
| Canon | 7751 | TSE | Imaging / Lithography / Optics |
| Capcom | 9697 | TSE | Gaming / Entertainment |
| Ebara Corp | 6361 | TSE | Semiconductor Equipment (CMP) / Pumps |
| Fanuc | 6954 | TSE | Factory Automation / Robotics |
| Hoya Corp | 7741 | TSE | Optical / EUV Mask Blanks |
| JX Advanced Metals | 5016 | TSE | Semiconductor Materials / Advanced Metals |
| Kioxia Holdings | 285A | TSE | NAND Flash Memory |
| Nexon | 3659 | TSE | Gaming / Online Entertainment |
| Nintendo | 7974 | TSE | Gaming / Entertainment |
| Nitto Boseki | 3110 | TSE | Glass Fiber / Electronic Materials |
| Recruit Holdings | 6098 | TSE | HR Tech / Internet / AI |
| Resonac Holdings | 4004 | TSE | Semiconductor Materials / Chemicals |
| Taiyo Yuden | 6976 | TSE | Electronic Components / MLCC |

**Korea — KRX (13)**
| Company | Ticker | Exchange | Sector |
|---------|--------|----------|--------|
| Samsung Electronics | 005930 | KRX | Memory / Foundry / Display |
| SK Hynix | 000660 | KRX | Memory (DRAM / HBM) |
| Samsung SDI | 006400 | KRX | Batteries / Energy |
| LG Energy Solution | 373220 | KRX | Batteries |
| Hanwha Aerospace | 012450 | KRX | Defense / Semiconductors |
| Isu Petasys | 007660 | KRX | PCB / IC Substrates |
| Naver Corp | 035420 | KRX | Internet / AI / Search |
| Kakao Corp | 035720 | KRX | Internet / Messaging |
| Samsung Electro-Mechanics | 009150 | KRX | MLCC / Components |
| SK Telecom | 017670 | KRX | Telecom / AI |
| HD Hyundai Electric | 267260 | KRX | Power Infrastructure |
| Doosan Enerbility | 034020 | KRX | Power / Nuclear |
| SK Square | 402340 | KRX | Tech Investment (SK Hynix parent) |

**Taiwan — TWSE (20)**
| Company | Ticker | Exchange | Sector |
|---------|--------|----------|--------|
| TSMC | 2330 | TWSE | Semiconductor Foundry |
| MediaTek | 2454 | TWSE | Fabless Semiconductors |
| Hon Hai (Foxconn) | 2317 | TWSE | EMS / AI Servers |
| Delta Electronics | 2308 | TWSE | Power / Thermal / Data Center |
| Accton Technology | 2345 | TWSE | Networking Equipment |
| Quanta Computer | 2382 | TWSE | ODM / AI Servers |
| Wistron | 3231 | TWSE | ODM / AI Servers |
| ASE Technology | 3711 | TWSE | Semiconductor Packaging |
| United Microelectronics (UMC) | 2303 | TWSE | Semiconductor Foundry |
| Novatek Microelectronics | 3034 | TWSE | Display Driver IC |
| Realtek Semiconductor | 2379 | TWSE | Networking / Audio IC |
| Nanya Technology | 2408 | TWSE | DRAM Memory |
| Lite-On Technology | 2301 | TWSE | Power Supplies / Components |
| Advantech | 2395 | TWSE | Industrial IoT |
| Auras Technology | 3324 | TWSE | Thermal / Cooling Solutions |
| Yageo Corp | 2327 | TWSE | Passive Components |
| Unimicron Technology | 3037 | TWSE | PCB / IC Substrates |
| Silergy Corp | 6415 | TWSE | Power Management IC |
| Gold Circuit Electronics | 2368 | TWSE | PCB / Advanced Substrates |
| Nanya Plastics | 1303 | TWSE | Plastics / Electronic Materials |

**China — SSE / SZSE (22)**
| Company | Ticker | Exchange | Sector |
|---------|--------|----------|--------|
| Zhongji Innolight | 300308 | SZSE | Optical Transceivers / AI Networking |
| Eoptolink Technology | 300502 | SZSE | Optical Transceivers |
| SMIC | 688981 | SSE | Semiconductor Foundry |
| BOE Technology | 000725 | SZSE | Display Panels |
| Luxshare Precision | 002475 | SZSE | Connectors / Apple Supply Chain |
| Will Semiconductor | 603501 | SSE | CIS / Image Sensors |
| Cambricon Technologies | 688256 | SSE | AI Chips |
| NAURA Technology | 002371 | SZSE | Semiconductor Equipment |
| Hygon Information Technology | 688041 | SSE | x86 CPU / Server Chips |
| Montage Technology | 688008 | SSE | Memory Interface / Server Chips |
| GigaDevice Semiconductor | 603986 | SSE | Flash Memory / MCU |
| Inspur Electronic Information | 000977 | SZSE | AI Servers |
| Dawning Information (Sugon) | 603019 | SSE | AI Servers / HPC |
| Star Power Semiconductor | 603290 | SSE | IGBT / Power Semis |
| Maxscend Microelectronics | 300782 | SZSE | RF Semiconductors |
| Hengtong Optic-Electric | 600487 | SSE | Fiber Optic |
| ACM Research (Shanghai) | 688082 | SSE | Semiconductor Equipment (cleaning) |
| Tongfu Microelectronics | 002156 | SZSE | OSAT / Packaging |
| JCET Group | 600584 | SSE | OSAT / Packaging |
| CATL (Contemporary Amperex) | 300750 | SZSE | EV Batteries / Energy Storage |
| Sungrow Power Supply | 300274 | SZSE | Solar Inverters / Energy Storage |
| Suzhou TFC Optical Communication | 300394 | SZSE | Optical Components / Fiber Optic |

**Hong Kong — HKEX (12)**
| Company | Ticker | Exchange | Sector |
|---------|--------|----------|--------|
| Tencent Holdings | 0700 | HKEX | Internet / AI / Gaming |
| Alibaba Group | 9988 | HKEX | E-commerce / Cloud / AI |
| Xiaomi Corp | 1810 | HKEX | Consumer Electronics / EV |
| BYD Company | 1211 | HKEX | EV / Batteries / Semis |
| Lenovo Group | 0992 | HKEX | PC / Servers |
| BYD Electronic | 0285 | HKEX | EMS / Components |
| Sunny Optical | 2382 | HKEX | Optical Components |
| Kingsoft Corp | 3888 | HKEX | Software / AI / Cloud |
| GDS Holdings | 9698 | HKEX | Data Centers |
| SMIC (H-shares) | 0981 | HKEX | Semiconductor Foundry |
| Minimax Group | 0100 | HKEX | AI Foundation Models / AGI |
| Knowledge Atlas (Zhipu AI) | 2513 | HKEX | AI Foundation Models / LLM |

**India — NSE / BSE (8)**
| Company | Ticker | Exchange | Sector |
|---------|--------|----------|--------|
| Infosys | INFY | NSE | IT Services |
| Tata Consultancy Services | TCS | NSE | IT Services |
| HCL Technologies | HCLTECH | NSE | IT Services |
| Wipro | WIPRO | NSE | IT Services |
| Tech Mahindra | TECHM | NSE | IT Services / 5G |
| Bharti Airtel | BHARTIARTL | NSE | Telecom / Digital |
| Reliance Industries | RELIANCE | NSE | Tech / Telecom / Digital |
| One 97 Communications (Paytm) | PAYTM | NSE | Fintech / Digital Payments |

**Australia — ASX (7)**
| Company | Ticker | Exchange | Sector |
|---------|--------|----------|--------|
| Xero | XRO | ASX | Cloud Accounting Software |
| WiseTech Global | WTC | ASX | Logistics Software |
| Technology One | TNE | ASX | Enterprise SaaS |
| Pro Medicus | PME | ASX | Medical Imaging AI |
| NextDC | NXT | ASX | Data Centers |
| REA Group | REA | ASX | Property Tech / Digital |
| Seek | SEK | ASX | Employment Tech / AI |

**Southeast Asia (2)**
| Company | Ticker | Exchange | Sector |
|---------|--------|----------|--------|
| Sea Limited | SE | NYSE | Gaming / E-commerce / Fintech |
| Grab Holdings | GRAB | NASDAQ | Ride-hailing / Superapp |

### Coverage Management
- The 230-company list above is definitive — `seed.json` must contain an entry for every company listed
- Companies are added to the database and automatically included in sweep batches — no code changes required
- SearchBar autocomplete dynamically loaded from database
- Company cards on homepage rendered from database, sorted alphabetically
- Each company requires: seed data entry, IR page URL in fetcher config, EDINET code (if Japanese-listed)
- TSMC tracked under primary listing only (2330 on TWSE) — ADR (TSM on NYSE) removed to avoid duplication
- SMIC appears as both A-shares (688981 on SSE) and H-shares (0981 on HKEX) — track as single company

Coverage spans Japan (TSE), Korea (KRX), Taiwan (TWSE), China (SSE/SZSE), Hong Kong (HKEX), India (NSE/BSE), Australia (ASX), and US (NASDAQ/NYSE). Companies share macro drivers (AI capex, advanced packaging, cloud infrastructure) but have distinct business models and cycle dynamics.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (React), Tailwind CSS v4 |
| Backend/API | Next.js API routes |
| Database | PostgreSQL via Neon (`@neondatabase/serverless`) |
| AI Engine | Claude API (Anthropic) via `@anthropic-ai/sdk` — claude-sonnet-4-5-20250929 for daily sweeps, claude-opus-4-6 for deep analysis |
| Scheduler | Vercel Cron Jobs — **Non-US companies daily**, **US companies weekly (Sundays)**. Staggered batches, 2:00–6:30 AM JST (10-min intervals) |
| Data Fetching | Native `fetch()` for IR pages + Claude API `web_search_20250305` tool for news/social/price/industry |
| Deployment | Vercel (connected to GitHub repo) |
| Source Control | GitHub |

**Implementation notes:**
- `@vercel/postgres` is deprecated — use `@neondatabase/serverless` instead
- Tailwind v4 uses `@theme inline {}` blocks in `globals.css` instead of `tailwind.config.ts`
- Puppeteer is not compatible with Vercel serverless — use lightweight `fetch()` with HTML stripping for IR pages
- Claude API responses often wrap JSON in markdown code fences — always add fallback regex extraction `rawText.match(/\{[\s\S]*\}/)`
- Web search fetchers consume significant tokens — run them sequentially with 2s delays, not in parallel, and use `max_uses: 3` and `max_tokens: 2048`
- Content truncation to ~4000 chars per source before analysis keeps token usage manageable

---

## Data Source Configuration

### Environment Variables (Vercel Dashboard)

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | ✅ | Claude API key for AI analysis and web search |
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `SITE_PASSWORD` | ✅ | Password gate for site access (set to `fingerthumb`) |
| `REDDIT_CLIENT_ID` | ✅ Phase 5 | Reddit API app client ID |
| `REDDIT_CLIENT_SECRET` | ✅ Phase 5 | Reddit API app client secret |
| `REDDIT_USERNAME` | ✅ Phase 5 | Reddit account username |
| `REDDIT_PASSWORD` | ✅ Phase 5 | Reddit account password |

### Reddit API Setup

Oliver needs to create a Reddit API application before the Reddit fetcher can go live:

1. Go to https://www.reddit.com/prefs/apps
2. Click "create another app..." at the bottom
3. Fill in:
   - **Name:** Kabuten Research
   - **App type:** Select "script"
   - **Description:** AI stock research platform
   - **Redirect URI:** http://localhost:8080 (required but not used for script apps)
4. Click "create app"
5. Note down the **client ID** (string under the app name) and **client secret**
6. Add all four Reddit env vars to Vercel dashboard

**Reddit fetcher implementation (Pending — not yet active):**
- Uses Reddit's OAuth2 API (`https://oauth.reddit.com`) with script-type authentication
- Searches targeted subreddits per company: r/semiconductors, r/stocks, r/investing, r/wallstreetbets, r/chipdesign, r/technology, plus company-specific subreddits where they exist (e.g. r/nvidia, r/AMD, r/intel)
- Fetches top posts from the past 24 hours mentioning the company or key terms from sweep criteria
- Falls back to Claude API web search if Reddit API is unavailable or rate-limited
- Rate limits: Reddit API allows 60 requests/minute for OAuth2 apps
- **Status:** Reddit is shown with ✖ (Pending) on all company pages until Oliver creates the Reddit API app and configures the env vars

### TradingView (Premium Subscription)

Oliver has a **TradingView Premium** subscription. This is used for:
- **Chart embeds** — TradingView Advanced Chart widget embedded on each company page (already implemented in Phase 4). Premium allows full-featured embeds.
- **Visual reference only** — TradingView does not offer a programmatic REST API for data extraction. All financial data for earnings models and valuation calculations is sourced from Yahoo Finance and market-specific free sources (see Earnings Model and Valuation Box specs).

No TradingView environment variables are needed — the embed widget works without authentication.

### Bloomberg Terminal (On Ice)

Oliver has a Bloomberg Terminal subscription. Integration is **deferred** — not part of Phase 5. When activated in a future phase, potential integrations include:
- Bloomberg B-PIPE or Server API for real-time consensus data
- Bloomberg email alerts forwarding to a parsing endpoint
- BLPAPI for programmatic data pulls

Bloomberg is shown with a ✖ (red X) and "(Pending)" label on company pages to indicate it's a future source not yet integrated.

### Financial Data Fetcher Architecture

Since there are no paid financial data API subscriptions (Bloomberg API, Refinitiv), the platform uses a **tiered free-source strategy** per market:

```
┌────────────────────────────────────────────────────┐
│               FINANCIAL DATA FETCHERS               │
├──────────┬─────────────────────────────────────────┤
│  Market  │  Primary → Fallback                     │
├──────────┼─────────────────────────────────────────┤
│  US      │  Yahoo Finance (yfinance) → web search  │
│  Japan   │  Kabutan.jp → company IR → web search   │
│  Korea   │  Naver Finance → web search             │
│  Taiwan  │  Goodinfo.tw / TWSE MOPS → web search   │
│  China   │  East Money → web search                │
│  HK      │  HKEX pages → web search               │
│  India   │  Moneycontrol → web search              │
│  All     │  Claude API web search (ultimate fallback)│
└──────────┴─────────────────────────────────────────┘
```

**New fetcher files** (added to `src/lib/sweep/fetchers/`):

| File | Purpose |
|------|---------|
| `financial-data.ts` | Unified financial data fetcher — routes to market-specific source, returns standardized earnings/valuation JSON |
| `yahoo-finance.ts` | Yahoo Finance fetcher — historical prices, analyst estimates, EPS history (works for all markets) |
| `kabutan.ts` | Kabutan.jp scraper — Japan company financials, estimates (TSE-listed) |
| `naver-finance.ts` | Naver Finance scraper — Korea company financials (KRX-listed) |

**Data refresh:** Financial data fetchers run as part of the daily sweep. Historical valuation ranges (5yr PER/PBR) are recomputed weekly or on material earnings changes to avoid excessive API calls.

---

## Core Architecture

### Agent Model

Each company has a **dedicated agent** consisting of:

1. **Company Profile** (persistent, evolves over time)
   - Company overview, business segments, key products
   - Current investment thesis & view (bull/bear/neutral + conviction level)
   - Key assumptions and risk factors
   - Earnings model with forward estimates
   - Valuation framework (P/E, EV/EBITDA, DCF assumptions)
   - Historical context and trend data

2. **Daily Sweep Criteria** (user-configurable per company)
   - List of monitored data sources (see below)
   - 3 focus bullet points that define what the agent prioritizes
   - These act as prompt guidance for the AI analysis step
   - Example for Tokyo Electron:
     - "Focus specifically on incremental order growth momentum and new business wins"
     - "Monitor China revenue exposure and any regulatory/sanctions developments"
     - "Track EUV-related deposition and coater/developer competitive positioning vs. ASML ecosystem"

3. **Analyst Agent Log** (append-only history)
   - Timestamped record of every sweep and its outcome
   - Most entries: "Sweep completed: no change to Investment View"
   - Material entries: structured brief on what changed and why

### Data Sources

Each agent sweeps the following sources daily:

| Source | Type | URL / Method | Status |
|--------|------|-------------|--------|
| Company IR Page | Filings, press releases, presentations | Direct `fetch()` with HTML stripping (hardcoded IR URLs per company) | ✅ Active |
| EDINET | Regulatory filings (yuho, quarterly) | EDINET API v2 (Japanese-listed companies only — codes per company in fetcher config) | ✅ Active |
| Reuters / Nikkei | News articles | Web search via Claude API (`web_search_20250305` tool) | ✅ Active |
| X.com / Twitter | Social sentiment, breaking info | Web search via Claude API | ✅ Active |
| TradingView / Yahoo Finance JP | Price data, volume, technicals | Web search via Claude API | ✅ Active |
| Industry Sources | SEMI, WSTS, peer company announcements | Web search via Claude API | ✅ Active |
| Reddit | Community sentiment, rumours, technical discussion | Reddit API (OAuth2) for targeted subreddit searches + Claude web search fallback | ✖ Pending |
| Bloomberg Inbox | Sell-side research, earnings alerts | On ice — Oliver has Terminal subscription but integration deferred until later | ✖ Pending |
| Alphasense | Earnings transcripts, expert calls, filings search | Future integration — requires Alphasense API key | ✖ Pending |
| Internal Research | Oliver's own notes, models, meeting notes | Future integration — file upload or Notion/Drive sync | ✖ Pending |

**Source display notes:** Active sources show a green checkbox (☑) on the company page. Pending/future sources show a red X (✖) with "(Pending)" label to indicate they are not yet integrated but are on the roadmap. The label "Pending" replaces the previous "Planned" terminology across the entire site.

**EDINET display:** EDINET Filings always shows a green tick (☑) on all company pages, with the annotation "(Japan only)" next to it. For non-Japanese companies, EDINET is greyed out / blacked out visually but still displays the green tick and "(Japan only)" label — this correctly indicates the source is active for the platform but only applies to Japanese-listed companies. It is not shown as Pending or with a red X.

**Fetcher execution strategy:** IR page and EDINET fetchers run in parallel (direct HTTP). Web search fetchers (news, twitter, reddit, price, industry) run sequentially with 2-second delays to avoid Claude API rate limits.

### Daily Sweep Flow

**Sweep frequency — cost optimisation:**
- **Non-US companies (125 APAC):** Swept **daily** — more time-zone-sensitive news flow, less English-language coverage, daily sweeps add more value
- **US companies (105):** Swept **once per week (Sundays)** — well-covered by English-language media, less incremental value from daily sweeps
- This reduces weekly Claude API calls from 1,610 (230 × 7) to **980** (125 × 7 + 105 × 1) — a **~40% cost reduction**

The sweep route checks each company's `country` field to determine if it should run today:
- If `country === "US"` → only sweep on Sundays (or whatever day is configured)
- If `country !== "US"` → sweep every day

```
┌─────────────────────────────────────────────────┐
│              STAGGERED CRON TRIGGERS              │
│  Daily: ~16 batches (125 non-US companies)       │
│  Weekly (Sun): +14 batches (105 US companies)    │
│  10-min intervals, 2:00 AM JST onwards           │
│  ?batch=1 at 17:00 UTC, ?batch=2 at 17:10, ...   │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│        FOR EACH COMPANY IN THIS BATCH:            │
│                                                   │
│  1. Fetch latest data from all sources            │
│  2. Load persistent company profile from DB       │
│  3. Load Daily Sweep Criteria (focus prompts)     │
│  4. Load SECTOR PEER CONTEXT: query recent        │
│     Incremental/Material findings from other      │
│     companies in the same sector (last 7 days)    │
│  5. Send to Claude API:                           │
│     - System: "You are a senior equity analyst    │
│       covering {company}. Your sweep criteria     │
│       are: {criteria}."                           │
│     - Context: company profile + new data         │
│       + sector peer context                       │
│     - Task: "Analyze new information. Determine   │
│       if anything is material to the investment   │
│       thesis. Consider recent findings from       │
│       sector peers for cross-company signals.     │
│       If yes, explain what changed and            │
│       recommend any updates to the view."         │
│  6. Parse Claude response                         │
│  7. If material → update company profile + log    │
│     If not material → log "no change"             │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│         UPDATE DATABASE & ANALYST AGENT LOG       │
└─────────────────────────────────────────────────┘
```

### Batch Sweep Architecture

Sweeps are staggered to stay within Vercel's 5-minute serverless function timeout (`maxDuration: 300`).

**How it works:**
- Companies are loaded from the database, sorted by ID, and sliced into groups of 8 (`BATCH_SIZE = 8`)
- Each cron trigger passes `?batch=N` — the route dynamically computes which companies belong to that batch
- **Before sweeping each company, the route checks sweep eligibility:**
  - Non-US companies (`country !== "US"`) → eligible every day
  - US companies (`country === "US"`) → eligible only on Sundays (configurable day)
  - If a company is not eligible today, it is skipped (logged as "skipped — not scheduled today")
- Empty batches return gracefully with no work done
- Adding companies to the database automatically includes them in the next sweep cycle — no code changes needed

**Daily sweep load (typical weekday):**

| Segment | Companies | Batches | Sweep window (JST) |
|---------|-----------|---------|-------------------|
| Non-US (daily) | 125 | 16 | 2:00–4:30 AM |

**Sunday sweep load (full universe):**

| Segment | Companies | Batches | Sweep window (JST) |
|---------|-----------|---------|-------------------|
| All companies | 230 | 29 | 2:00–6:30 AM |

**Weekly cost comparison:**
- Old (all 230 daily): 230 × 7 = 1,610 Claude API calls/week
- New (125 daily + 105 weekly): (125 × 7) + (105 × 1) = 980 Claude API calls/week
- **Saving: ~40% reduction in token costs**

**⚠️ Known sweep failure mode — batch count drift:**
If new companies are added to the DB and the total APAC count exceeds (current batch count × 8), companies in the overflow batches silently never get swept — no error is thrown. `vercel.json` must have exactly `ceil(APAC_count / 8)` daily cron triggers and `ceil(total_count / 8)` Sunday triggers. **Always recount and update `vercel.json` after any company additions.** Also check: (a) Vercel auto-pauses cron jobs after repeated timeout failures — verify in Vercel Dashboard → Settings → Cron Jobs that all triggers show green; (b) verify the `country` field is correctly set for all Japan/Taiwan companies (`"Japan"` and `"Taiwan"` respectively, not `"US"`).

**Sweep route modes:**
- `?batch=N` — run batch N from DB (used by cron)
- `?companyId=X` — run a single company (used by manual sweep button)
- No params — run all companies sequentially (will timeout at scale)

### Sector Peer Context (Cross-Company Intelligence)

**v3.0 approach — reducing agent silos within the subagent model.**

Each company agent operates independently, but receives context about recent findings from peer companies in the same sector. This enables cross-company signal detection without the overhead of a full multi-agent communication system.

**How it works:**
1. Each company has a `sector_group` field (e.g. "Memory Semiconductors") that maps to the Sector Agent groupings
2. Before each company's sweep, the system queries the `action_log` for all **Incremental and Material** entries from companies in the same `sector_group` over the last 7 days
3. These peer findings are formatted as a brief context block and injected into the sweep prompt as `{sector_peer_findings}`
4. The agent is instructed to consider whether any peer findings have read-through implications for its own company

**Example — Advantest sweep receives this peer context:**
```
SECTOR PEER CONTEXT — RECENT FINDINGS (Semiconductor Production Equipment, last 7 days):
- Tokyo Electron (2026-02-11, MATERIAL): Arizona fab equipment orders from TSMC surging, FY guidance raised
- ASML (2026-02-11, INCREMENTAL): High-NA EUV tool installations progressing at Intel
- Disco Corp (2026-02-10, INCREMENTAL): Dicing demand for HBM packages increasing
```
The Advantest agent can now consider: "Tokyo Electron seeing surging orders from TSMC Arizona + Disco seeing HBM packaging demand → confirms broad semiconductor equipment upcycle → positive read-through for Advantest's HBM test platforms."

**Peer context formatting rules:**
- Include only Incremental 🟡 and Material 🔴 entries (not No Change)
- Last 7 days only — keeps context fresh and token-efficient
- Max 10 peer entries to cap token usage (prioritise Material over Incremental, newest first)
- Format: `{company} ({date}, {classification}): {one-line summary}`

**Token cost impact:** Adds approximately 200–400 tokens per sweep call. Marginal cost increase (~5%) for significantly better cross-company signal detection.

**Future (v4.0 consideration):** Agent Teams architecture where company agents communicate directly during analysis, enabling real-time debate and collaborative thesis-building. This is architecturally different (requires Claude Code runtime, not Vercel cron) and significantly more expensive (~3–5× token cost). Parked for future evaluation.

### Materiality Assessment

The Claude API call should classify new information into one of:

- **No Change** — nothing material found. Log: "Sweep completed: no change to Investment View". **This is the expected outcome on the vast majority of days.**
- **Incremental** — interesting but doesn't change the thesis. Log with brief description. Incremental observations accumulate context but do NOT trigger an Investment View update.
- **Material** — changes or could change the investment view. Log with structured brief:
  - What happened (source, date, summary)
  - Why it matters (link to thesis/assumptions)
  - Recommended action (update view, update model, flag for manual review)
  - Confidence level (high/medium/low)

**High hurdle rate for materiality:** The threshold for classifying something as MATERIAL should be set deliberately high. Most daily sweeps — the large majority — should result in NO_CHANGE. A typical company might go weeks or even months without a MATERIAL classification. Incremental observations (interesting data points, minor beats/misses, routine news) should NOT be escalated to MATERIAL.

MATERIAL is reserved for information that genuinely changes the investment thesis, such as:
- A significant earnings miss or beat that alters the forward earnings trajectory
- A major contract win or loss that structurally changes the revenue outlook
- A regulatory action (sanctions, antitrust) that impacts the business model
- A management change or strategic pivot that reframes the thesis
- A competitive development that meaningfully shifts the company's positioning
- A valuation dislocation driven by a fundamental change (not just price movement)

Information that is merely confirming the existing thesis (even if positive) is INCREMENTAL, not MATERIAL. Price movements alone are never MATERIAL — only the underlying fundamental reasons behind them.

---

## Page Architecture

### Homepage (`/`)

The Kabuten homepage serves as the orchestrator's command center.

**Layout:**

```
┌──────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  KABUTEN (56px)   [Agent Log] [Ask Kabuten] [Podcast Tracker]││
│  │                   [Social Heatmap] [Sectors] [Portfolio] [Coverage Table]│
│  │  ← logo left      buttons top-right, sticky on scroll →     ││
│  └──────────────────────────────────────────────────────────────┘│
│  (sticky toolbar — remains visible on all pages when scrolling)  │
│                                                                    │
│                    K A B U T E N                                   │
│           (Hero logo — 90px Orbitron, metallic)                    │
│                                                                    │
│     ┌──────────────────────────────────────────┐                  │
│     │  🔍 Search by code, company, or theme... │                  │
│     └──────────────────────────────────────────┘                  │
│                                                                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  ANALYST AGENT LOG (AGGREGATED)                               ││
│  │  All Incremental & Material entries — paginated                  ││
│  │  ┌──────────────────────────────────────────────────────────┐││
│  │  │ 2026-02-06 07:14 | Disco Corp | 🟡 Incremental          │││
│  │  │ Q3 orders above consensus — monitoring                   │││
│  │  ├──────────────────────────────────────────────────────────┤││
│  │  │ 2026-02-06 07:15 | Advantest | 🔴 Material              │││
│  │  │ New HBM test platform win at SK Hynix...                 │││
│  │  └──────────────────────────────────────────────────────────┘││
│  │  ... (all Incremental/Material entries — paginated)            ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

**Note:** The Highest Conviction Top 20 list has been moved to the Portfolio Constructor page. The Company Coverage Table has been moved to its own dedicated page (`/coverage`). The homepage now focuses on the hero logo, search bar, and the aggregated Analyst Agent Log.

**Agent Log Filtering — Incremental and Material only:**
- The Analyst Agent Log on the homepage (and on the dedicated `/agent-log` page) must **only show Incremental 🟡 and Material 🔴 entries**. No Change ⚪ entries are excluded.
- Since most daily sweeps result in No Change, showing them would flood the log with noise. The log should only surface findings worth reading.
- No Change results are still recorded in the database for audit purposes — they are simply not displayed in the Agent Log UI.

**Analyst Agent Log — Clickable Company Names:**
- Every **company name** displayed in the Analyst Agent Log on the homepage must be a **clickable link** that navigates directly to that company's page (e.g. clicking "Tokyo Electron" navigates to `/company/tokyo-electron`)
- This applies to all agent log entries shown on the homepage
- The company name should be visually distinguished as a link (e.g. underline on hover, pointer cursor)

**Homepage Navigation Buttons:**
- All buttons (Agent Log, Ask Kabuten, Podcast Tracker, Social Heatmap, Sector Agent, Portfolio Constructor, Coverage Table) are displayed in a **sticky/frozen toolbar** in the **top-right** of the page
- **Sticky behavior**: The toolbar is fixed to the top of the viewport (`position: sticky` or `position: fixed`) so it remains visible when scrolling down any page
- **Visible on every page**: This toolbar must appear on **all pages** of the site (homepage, company pages, agent log, ask, podcasts, heatmap, sectors, portfolio, coverage table). Implement as part of the root layout or a shared `NavToolbar.tsx` component.
- Buttons are displayed in a neat horizontal row with consistent spacing
- Clean, compact design that doesn't dominate the page — small/medium button size appropriate for a persistent toolbar

### Coverage Table Page (`/coverage`)

A dedicated full-page sortable table of all 230 covered companies. Accessible via the "Coverage Table" button in the sticky navigation toolbar.

**Page subtitle:** "230 companies across US, Japan, Korea, Taiwan, China, Hong Kong, India & Australia" — **Note: Singapore was removed** from the exchange list (no SGX companies in coverage). The current live site incorrectly shows "& Singapore" in the subtitle — this must be removed.

**Layout:**

```
┌──────────────────────────────────────────────────────────────────┐
│  [Sticky nav toolbar with all buttons — same as every page]       │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│     ┌──────────────────────────────────────────┐                  │
│     │  🔍 Filter by code, company, or theme... │                  │
│     └──────────────────────────────────────────┘                  │
│                                                                    │
│  ┌──────┬──────────────────┬─────────┬────────────────┬─────────┐│
│  │ Code │ Company          │ Country │ Classification │Mkt Cap  ││
│  │      │                  │         │                │(USD bn) ││
│  │      │                  │         │                │View/Conv││
│  ├──────┼──────────────────┼─────────┼────────────────┼─────────┤│
│  │ (column headers are FROZEN — remain visible on scroll)        ││
│  ├──────┼──────────────────┼─────────┼────────────────┼─────────┤│
│  │ AAPL │ Apple            │ 🇺🇸 US   │ Consumer Elec. │ 3,450   ││
│  │      │                  │         │                │ ► ★★☆   ││
│  ├──────┼──────────────────┼─────────┼────────────────┼─────────┤│
│  │ NVDA │ Nvidia           │ 🇺🇸 US   │ Semiconductors │ 3,200   ││
│  │      │                  │         │                │ ▲ ★★★   ││
│  ├──────┼──────────────────┼─────────┼────────────────┼─────────┤│
│  │8035.T│ Tokyo Electron   │ 🇯🇵 Japan│ Semi Equipment │   85    ││
│  │      │                  │         │                │ ▲ ★★★   ││
│  ├──────┼──────────────────┼─────────┼────────────────┼─────────┤│
│  │005930│ Samsung Elec.    │ 🇰🇷 Korea│ Memory / Fndry │  320    ││
│  │ .KS  │                  │         │                │ ► ★★☆   ││
│  └──────┴──────────────────┴─────────┴────────────────┴─────────┘│
│  ... (230 companies, sortable by any column)                      │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

| Column | Description |
|--------|-------------|
| Code | Ticker symbol (e.g. "AAPL", "8035.T", "005930.KS") |
| Company | Full company name |
| Country | Country flag emoji + code (US, Japan, Korea, Taiwan, China, HK, India, Australia) |
| Classification | Short sector label (e.g. "Semiconductors", "E-commerce", "EVs", "Cloud/AI", "Semi Equipment") |
| Market Cap (USD bn) | Current market cap in USD billions — fetched from Yahoo Finance during daily sweep |
| View | Current investment view arrow: ▲ (bullish), ► (neutral), ▼ (bearish) |
| Conviction | Star rating: ★★★ (high), ★★☆ (medium), ★☆☆ (low) |

**Table behavior:**
- Each row is clickable — navigates to the company page (`/company/[ticker]`)
- Sortable by any column (click column header to sort)
- Default sort: alphabetical by company name
- **Sticky column headers**: The Code, Company, Country, Classification, Mkt Cap, View, Conviction header row is **frozen/sticky** (`position: sticky; top: 0`) so column titles remain visible when scrolling down through 230 companies
- Country column uses flag emoji + short country code
- Market Cap fetched from Yahoo Finance via `yfinance` Python library (`yf.Ticker("AAPL").info['marketCap']`) or Yahoo Finance JSON endpoint, and stored in `profile_json` during daily sweep; displayed as rounded USD billions
- **IMPORTANT — MARKET CAP DATA MUST BE REPLACED:** The current market cap values in the Coverage Table are **hardcoded static estimates from the seed data** — every value is a suspiciously round number (e.g. Apple 3,400, ServiceNow 200, Qualcomm 200, Palantir 180). These are not real market caps and must be replaced with live data. Claude Code must:
  1. **Delete all existing static market cap values** from the seed data / database
  2. Fetch **real market cap** for each company using Yahoo Finance `yfinance` library — the ticker format must match Yahoo Finance conventions (e.g. `8035.T` for Tokyo Electron, `005930.KS` for Samsung, `2330.TW` for TSMC, `AAPL` for Apple)
  3. Convert all values to USD billions for consistent display
  4. Validate a sample of results against known market caps (e.g. Apple ~$3.5T, Nvidia ~$3T, Samsung ~$300B) to confirm the data is correct
  5. If `yfinance` fails for certain tickers, fall back to Yahoo Finance direct JSON endpoint or Alpha Vantage
  6. Store refreshed market caps in the database during daily sweep so the Coverage Table always shows **current, real data** — not static estimates
  7. Market caps should show reasonable precision (e.g. 3,487 not 3,400) to confirm they are real fetched values
- Classification uses short human-friendly labels (not the full sector strings from seed data)
- Filter bar at top to quickly search/filter the table

### Company Page (`/company/[ticker]`)

Each company page is the agent's workspace and output display. Layout is **desktop-optimized** — designed to look great and run well on a PC/laptop screen. No mobile-responsive concerns; optimize for widescreen.

**Layout (desktop two-column top, full-width below):**

```
┌──────────────────────────────────────────────────────────────────┐
│  KABUTEN (56px navbar logo) — Company Name — Ticker               │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐│
│  │  INVESTMENT VIEW (top-left)  │  │  ANALYST AGENT LOG (top-right)│
│  │  Current thesis,             │  │  Full history of sweep       ││
│  │  bull/bear/neutral,          │  │  outcomes for this company   ││
│  │  conviction level,           │  │  Expandable entries for      ││
│  │  last updated date           │  │  material findings           ││
│  └─────────────────────────────┘  └─────────────────────────────┘│
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  DAILY SWEEP CRITERIA (centered, full-width below)            ││
│  │                                                                ││
│  │  ┌─────────────────────────────────────────────────────────┐  ││
│  │  │  MANUAL SWEEP (embedded inside criteria box)             │  ││
│  │  │  [Run Sweep] button | Last sweep: timestamp              │  ││
│  │  └─────────────────────────────────────────────────────────┘  ││
│  │                                                                ││
│  │  ┌──────────────────────┐  ┌──────────────────────────────┐  ││
│  │  │  SOURCES (left col)  │  │  FOCUS (right col)           │  ││
│  │  │  ☑ Company IR Page   │  │  • [Custom bullet 1]   [Edit]│  ││
│  │  │  ☑ EDINET Filings    │  │  • [Custom bullet 2]   [Edit]│  ││
│  │  │    (Japan only)       │  │  • [Custom bullet 3]   [Edit]│  ││
│  │  │  ☑ Reuters / Nikkei  │  │  • [Custom bullet 3]   [Edit]│  ││
│  │  │  ☑ X.com / Twitter   │  │                              │  ││
│  │  │  ☑ TradingView       │  │  [Edit] button enables       │  ││
│  │  │  ☑ Industry Sources  │  │  inline editing of each      │  ││
│  │  │  ✖ Reddit (Pending)  │  │  focus bullet point          │  ││
│  │  │  ✖ Bloomberg (Pending)│ │                              │  ││
│  │  │  ✖ Alphasense (Pending)│ │                             │  ││
│  │  │  ✖ Internal Research  │  │                              │  ││
│  │  │    (Pending)          │  │                              │  ││
│  │  └──────────────────────┘  └──────────────────────────────┘  ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  NARRATIVE                                    [AI-Estimated]  ││
│  │                                                                ││
│  │  ┃ 📊 Earnings Trend (Past 3 Quarters):                      ││
│  │  ┃ (blue left border) Paragraph summarising recent            ││
│  │  ┃ quarterly earnings trajectory and key trends               ││
│  │                                                                ││
│  │  ┃ 📰 Recent Newsflow (Past 6 Months):                       ││
│  │  ┃ (blue left border) Key developments numbered               ││
│  │  ┃ e.g. (1) Order intake surging; (2) New products...         ││
│  │                                                                ││
│  │  ┃ 🌐 Long-term Trajectory (3 Years):                        ││
│  │  ┃ (green left border) Multi-year stock performance,          ││
│  │  ┃ structural positioning, long-term growth thesis            ││
│  │                                                                ││
│  │  Sources: Company filings, earnings releases, analyst reports ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  OUTLOOK                                      [AI-Estimated]  ││
│  │                                                                ││
│  │  ┃ 🏗 Fundamentals:                                           ││
│  │  ┃ (green left border) Business description, products,        ││
│  │  ┃ key customers, market position, competitive moat           ││
│  │                                                                ││
│  │  ┃ 💰 Financials:                                             ││
│  │  ┃ (yellow left border) Revenue, margins, valuation           ││
│  │  ┃ multiples, balance sheet, dividends, FCF                   ││
│  │                                                                ││
│  │  ┃ ⚠️ Risks:                                                  ││
│  │  ┃ (red left border) Key risk factors — cyclicality,          ││
│  │  ┃ competition, regulation, concentration, macro              ││
│  │                                                                ││
│  │  Sources: Company filings, analyst reports, industry research ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  KEY INFORMATION                                              ││
│  │  Market cap, P/E, etc.                                        ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  SHARE PRICE CHART                                            ││
│  │  (TradingView embed or custom chart)                          ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  EARNINGS MODEL                                               ││
│  │  Period, Revenue, Rev Growth, Op. Profit,                     ││
│  │  Op. Margin, Net Profit, NP Margin, EPS,                      ││
│  │  EPS Growth. Source explanation text at bottom.                ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │  VALUATION                                                    ││
│  │  5yr PER/PBR historical trading range (high/low/current)      ││
│  │  Decile gauge + historic returns table (company vs index)     ││
│  │  Current vs. fair value, multiple scenarios                   ││
│  └──────────────────────────────────────────────────────────────┘│
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

**Company Page Analyst Agent Log vs Homepage Agent Log — important distinction:**
- The **company page** Analyst Agent Log (top-right box) shows **ALL daily sweep records** for that company — including No Change ⚪, Incremental 🟡, and Material 🔴. This gives the full audit trail of every sweep that ran.
- The **homepage** Analyst Agent Log (and the dedicated `/agent-log` page) only shows **Incremental 🟡 and Material 🔴** entries. No Change ⚪ entries are excluded from the homepage to avoid clutter.
- **No entry limit — show all entries with pagination.** The homepage Agent Log should display ALL Incremental and Material entries (not capped at 30 or any other number). Use pagination (e.g. 50 entries per page with page controls) so the user can browse the full history.
- In other words: every sweep result is logged on the company page, but only noteworthy findings (Incremental or Material) get pushed up to the main homepage log.

#### Earnings Model Specification

The Earnings Model table displays forward consensus estimates in the following columns:

| Column | Description | Required |
|--------|-------------|----------|
| Period | FY/Q label (e.g. FY2025E, FY2026E, Q1 2026E) | Yes |
| Revenue | Consensus revenue estimate | Yes |
| Revenue Growth | YoY % growth — **must be populated with actual data** | Yes |
| Op. Profit | Operating profit estimate | Yes |
| Operating Margin | Op. Profit / Revenue (%) — **must be populated** | Yes |
| Net Profit | Net income estimate | Yes |
| Net Profit Margin | Net Profit / Revenue (%) — **must be populated** | Yes |
| EPS | Earnings per share | Yes |
| EPS Growth | YoY % growth — **must be populated with actual data** | Yes |

**All columns are required.** Revenue Growth, Operating Margin, Net Profit Margin, and EPS Growth must show actual computed values (not blank or "N/A"). If the underlying data is available for Revenue and EPS, compute the growth rates and margins from the data. If only partial data is available, compute what is possible and note assumptions.

**Source explanation text (displayed at bottom of Earnings Model box):**

Below the data table, display a source attribution and methodology note. The default approach is:

1. **Consensus forecasts (preferred):** Use analyst consensus estimates from the market-specific data sources (Yahoo Finance, Kabutan, Naver Finance, etc.). Display: "Source: Analyst consensus estimates via [source name]"
2. **AI-generated forecasts (fallback):** If consensus data is unavailable for a company (e.g. smaller APAC companies with limited analyst coverage), Claude generates its own forward estimates based on: historical financial trends, management guidance, industry growth rates, and peer comparisons. Display: "Source: Kabuten AI forecast — based on [brief methodology]. Consensus estimates unavailable for this company."

The source text should be concise but transparent. When AI-generated, it must clearly state this and briefly explain the basis (e.g. "Based on 3-year historical revenue CAGR of 15%, management guidance for FY2026, and peer median margins").

**Consensus data sources** (practical, based on available subscriptions):

No Bloomberg API or Refinitiv access currently. Data sourced from free/freemium APIs and web search:

- **US companies:** Yahoo Finance analyst estimates (free, good coverage — forward EPS, revenue, growth via `yfinance` or direct fetch). Supplemented by Claude web search for recent consensus revisions from MarketWatch, Seeking Alpha, Finviz.
- **Japan companies:** Kabutan.jp (株探) for financial data and estimates (free, web-scrape). Minkabu for consensus. Company IR pages for management guidance. Claude web search for Toyo Keizai Shikiho data where available.
- **Korea companies:** Naver Finance (finance.naver.com) for KRX-listed companies — provides analyst consensus, financials (free, web-scrape). FnGuide data available via Naver.
- **Taiwan companies:** Goodinfo.tw for TWSE-listed companies — provides financials, estimates (free, web-scrape). TWSE MOPS (Market Observation Post System) for official filings.
- **China / Hong Kong companies:** East Money (eastmoney.com) for SSE/SZSE data. HKEX company pages. Claude web search for analyst estimates.
- **Fallback for all markets:** Claude API web search to find the latest consensus estimates from broker reports, news articles, and financial sites.
- **Source attribution:** The data source is displayed below the table (e.g. "Source: Yahoo Finance Analyst Estimates" or "Source: Kabutan.jp"). Where estimates come from multiple sources, the primary source is noted.

**Financial data API strategy:**

| Market | Primary Source | Method | Backup |
|--------|---------------|--------|--------|
| US (NASDAQ/NYSE) | Yahoo Finance | `yfinance` Python or direct JSON endpoint | Claude web search |
| Japan (TSE) | Kabutan.jp | Web scrape via `fetch()` + HTML parse | Company IR pages, Minkabu |
| Korea (KRX) | Naver Finance | Web scrape via `fetch()` + HTML parse | Claude web search |
| Taiwan (TWSE) | Goodinfo.tw / TWSE MOPS | Web scrape via `fetch()` + HTML parse | Claude web search |
| China (SSE/SZSE) | East Money | Web scrape via `fetch()` + HTML parse | Claude web search |
| Hong Kong (HKEX) | HKEX company pages | Web scrape via `fetch()` + HTML parse | Claude web search |

**Environment variables:** `YAHOO_FINANCE_API` not required (free endpoint). Scraping targets are configured per-market in fetcher config files.

#### Valuation Box Specification

The Valuation box displays current multiples in historical context:

**5-Year Historical Trading Range (prominent display):**
- **PER (P/E Ratio):** Show the 5-year historical **high**, **low**, **average**, and **current** PER as a clear data display. Example: "5Y Range: 15.2x – 45.8x | Avg: 28.3x | Current: 32.1x"
- **PBR (P/B Ratio):** Show the 5-year historical **high**, **low**, **average**, and **current** PBR. Example: "5Y Range: 2.1x – 8.4x | Avg: 4.2x | Current: 5.1x"
- These trading range data points must be prominently displayed — they are a key analytical feature

**Decile Gauge:**
A visual gauge/bar for each metric showing where the current valuation sits within the 5-year range, expressed in decile terms:
- 90th percentile → "Expensive vs. history" (red zone)
- 50th percentile → "In line with history" (neutral)
- 10th percentile → "Cheap vs. history" (green zone)

**Historical valuation data sourcing:**

Computing the 5-year PER/PBR range requires historical price data + historical EPS/BPS data:

| Data needed | Source | Method |
|-------------|--------|--------|
| Historical daily prices (5yr) | Yahoo Finance | `yfinance` — works for all markets (US, Japan, Korea, Taiwan, HK, China tickers supported) |
| Historical EPS (trailing) | Yahoo Finance + market-specific sources | Quarterly EPS from earnings history, compute trailing 12m |
| Historical BPS | Yahoo Finance + market-specific sources | Annual book value per share from balance sheet |
| Current PER/PBR | TradingView widget (already embedded) | Visual display via existing chart embed |

**Calculation approach:**
1. Fetch 5 years of daily closing prices from Yahoo Finance
2. Fetch quarterly EPS history — compute trailing-12-month EPS for each quarter
3. Calculate daily PER = Price / TTM EPS for each date where EPS data is available
4. Calculate PBR = Price / Latest BPS at each point
5. Compute percentile distribution → derive decile position for current valuation
6. Store computed ranges in `profile_json` and refresh during each sweep

**TradingView Premium** (Oliver's subscription): Used for the embedded interactive chart widget on the company page. TradingView does not offer a REST API for programmatic data access, so historical financial data is sourced from Yahoo Finance and market-specific free sources instead. The TradingView embed provides the visual chart experience; the valuation calculations run server-side using fetched data.

The gauge provides an instant visual read on whether a stock looks cheap or expensive relative to its own trading history, independent of the fundamental thesis.

**Historic Returns Table:**

A comparative returns table showing the company's stock performance vs. its local market index across standard time horizons:

```
┌──────────────────────────────────────────────────────────────┐
│  HISTORIC RETURNS                                             │
├──────────────┬───────┬──────┬──────┬──────┬──────┬──────────┤
│              │  1D   │  1W  │  3M  │  1Y  │  3Y  │  5Y     │
├──────────────┼───────┼──────┼──────┼──────┼──────┼──────────┤
│ Tokyo Elec.  │ +1.2% │-0.8% │+12.4%│+34.7%│+89.2%│+156.3%  │
│ TOPIX        │ +0.3% │-0.2% │ +4.1%│+11.8%│+22.5%│ +41.6%  │
├──────────────┼───────┼──────┼──────┼──────┼──────┼──────────┤
│ vs. Index    │ +0.9% │-0.6% │ +8.3%│+22.9%│+66.7%│+114.7%  │
└──────────────┴───────┴──────┴──────┴──────┴──────┴──────────┘
  Source: Yahoo Finance
```

**Rows:**
1. **Company** — absolute total return over each period
2. **Local Index** — absolute total return for the benchmark index over the same period
3. **vs. Index** — relative outperformance/underperformance (Company − Index)

**Local Index Mapping:**

| Market | Index | Yahoo Finance Ticker |
|--------|-------|---------------------|
| Japan (TSE) | TOPIX | `^TPX` |
| US (NASDAQ) | Nasdaq Composite | `^IXIC` |
| US (NYSE) | S&P 500 | `^GSPC` |
| Korea (KRX) | KOSPI | `^KS11` |
| Taiwan (TWSE) | TAIEX | `^TWII` |
| China (SSE) | SSE Composite | `000001.SS` |
| China (SZSE) | SZSE Component | `399001.SZ` |
| Hong Kong (HKEX) | Hang Seng | `^HSI` |
| India (NSE) | Nifty 50 | `^NSEI` |
| Australia (ASX) | S&P/ASX 200 | `^AXJO` |

US companies listed on NASDAQ use Nasdaq Composite; those on NYSE use S&P 500. Assignment stored per company in `seed.json` as `benchmark_index` field.

**Data source:** Yahoo Finance historical prices via `yfinance`. This covers both individual stock prices and all major index values in a single consistent source. Returns are computed as simple price returns: `(current_price / price_N_periods_ago) - 1`.

**Calculation (in `financial-data.ts`):**
1. Fetch current price and historical prices at T−1D, T−1W, T−3M, T−1Y, T−3Y, T−5Y for the company ticker
2. Fetch the same price points for the company's assigned `benchmark_index` ticker
3. Compute absolute return for each period: `(P_now / P_then) - 1`
4. Compute relative return: `company_return - index_return`
5. Return standardized JSON with both rows

**Sweep integration:** The returns table data is refreshed as part of the daily sweep. The `financial-data.ts` fetcher pulls updated prices for both the company and its benchmark index, computes the returns, and stores the result in `profile_json` under a `historic_returns` key. This adds minimal overhead — just 2 extra Yahoo Finance price lookups per company (one for the stock, one for the index; the index is cached and shared across all companies on the same exchange).

**Source attribution:** "Source: Yahoo Finance" displayed below the table.

#### Narrative Box Specification

A company research narrative box displayed on every company page, positioned below the Daily Sweep Criteria box. Provides backward-looking context on the company's recent performance and trajectory. Design matches the screenshot from Kabuten v2 exactly.

**Visual design:**
- White card with subtle border/shadow, rounded corners
- Title "Narrative" in bold top-left, "AI-Estimated" badge in grey pill top-right
- Three sub-sections, each with a coloured left border bar, emoji icon, and bold heading
- Each sub-section contains a single paragraph of prose (not bullet points)
- Sources footer at bottom in grey italic text

**Sub-sections:**

| # | Heading | Icon | Left Border | Content |
|---|---------|------|-------------|---------|
| 1 | **Earnings Trend (Past 3 Quarters):** | 📊 | Blue (`#3B82F6`) | Summary of recent quarterly earnings trajectory — revenue trends, margin direction, beats/misses, key drivers of recent results. Max 80 words. |
| 2 | **Recent Newsflow (Past 6 Months):** | 📰 | Blue (`#3B82F6`) | Key developments numbered inline e.g. "(1) Order intake surging; (2) New products gaining traction; (3) Government subsidies..." Max 6 items, max 80 words total. |
| 3 | **Long-term Trajectory (3 Years):** | 🌐 | Green (`#22C55E`) | Multi-year stock performance context, structural positioning, competitive standing, long-term growth thesis. Max 80 words. |

**Sources footer:** "Sources: Company filings, earnings releases, analyst reports" — grey italic, bottom of box.

#### Outlook Box Specification

A forward-looking company research box displayed on every company page, immediately below the Narrative box. Provides fundamental analysis, financial summary, and risk assessment. Design matches the screenshot from Kabuten v2 exactly.

**Visual design:**
- White card with subtle border/shadow, rounded corners
- Title "Outlook" in bold top-left, "AI-Estimated" badge in grey pill top-right
- Three sub-sections, each with a coloured left border bar, emoji icon, and bold heading
- Each sub-section contains a single paragraph of prose (not bullet points)
- Sources footer at bottom in grey italic text

**Sub-sections:**

| # | Heading | Icon | Left Border | Background Tint | Content |
|---|---------|------|-------------|-----------------|---------|
| 1 | **Fundamentals:** | 🏗 | Green (`#22C55E`) | Light green | Business description, products/services, key customers, market position, competitive advantages, R&D intensity. Max 80 words. |
| 2 | **Financials:** | 💰 | Yellow (`#EAB308`) | Light yellow | Revenue, operating profit, margins, valuation multiples (P/E), order book, balance sheet health, dividend yield, FCF generation. Max 80 words. |
| 3 | **Risks:** | ⚠️ | Red (`#EF4444`) | Light red/pink | Key risk factors — cyclicality, geopolitical/regulatory, competition, customer concentration, currency, valuation. Max 80 words. |

**Sources footer:** "Sources: Company filings, analyst reports, industry research" — grey italic, bottom of box.

#### Narrative & Outlook — Data and Generation

**Storage:** Both boxes are stored in the company's `profile_json` under two new keys:
- `profile_json.narrative` — object with `earnings_trend`, `recent_newsflow`, `long_term_trajectory` (each a string)
- `profile_json.outlook` — object with `fundamentals`, `financials`, `risks` (each a string)

**Initial generation (smart first-run):** During each daily sweep, if `profile_json.narrative` OR `profile_json.outlook` is null/empty for a company, the sweep MUST generate both Narrative and Outlook boxes **regardless of the sweep classification** (even if NO_CHANGE). The system prompt for that sweep includes instructions to produce all 6 sub-sections based on the company's current Investment View and any new data. This ensures all 230 companies get populated on the first sweep cycle.

**Subsequent updates:** Once both boxes are populated, Narrative and Outlook content is only refreshed when a **Material** sweep finding occurs — the same Claude API call that updates the Investment View also regenerates any Narrative/Outlook sub-sections affected by the material change. Incremental and No Change sweeps do NOT trigger updates to already-populated Narrative/Outlook boxes.

**Content limits (enforced in system prompt):**
- Each sub-section: max 80 words
- Total Narrative box: ~240 words max
- Total Outlook box: ~240 words max

### Analyst Agent Log Page (`/agent-log`)

A dedicated full-page view of the Analyst Agent Log across all companies. **Only Incremental 🟡 and Material 🔴 entries are shown** — No Change ⚪ entries are excluded to keep the log focused on actionable findings.

**Layout:**
- **Search bar** at the top — searchable by ticker, company name, or theme/keyword (e.g. "HBM", "sanctions", "earnings")
- **Full chronological list** of all Incremental and Material log entries (newest first), with color-coded severity indicators (🟡🔴)
- Expandable entries — click to see full structured brief for incremental/material findings
- Pagination: show **100 entries per page** with page controls for browsing full history
- This is the long-form version of the aggregated log box shown on the homepage (both show all Incremental/Material entries with pagination)

### Ask Kabuten Page (`/ask`)

An interactive Q&A page where the user can query Kabuten's accumulated knowledge about all covered companies. **This must be fully wired and functional** — not just a UI mockup.

**Layout — two-column:**

```
┌──────────────────────────────────────────────────────────────────┐
│  [Sticky nav toolbar]                                             │
├──────────────────────┬───────────────────────────────────────────┤
│                       │                                           │
│  QUESTION HISTORY     │  ASK KABUTEN                              │
│  (left sidebar)       │                                           │
│                       │  ┌──────────────────────────────────────┐│
│  All previous         │  │  🔍 Ask Kabuten a question...       ││
│  questions asked,     │  └──────────────────────────────────────┘│
│  newest first         │                                           │
│                       │  [Kabuten] [Claude] [Internet] [All]     │
│  ┌─────────────────┐ │                                           │
│  │ 2026-02-11 14:30│ │  Sample questions:                       │
│  │ "Why did you    │ │  • "Why did you change your view on..."  │
│  │  change view    │ │  • "What factors coincided with..."      │
│  │  on Advantest?" │ │  • "Why has Adobe been underperforming?" │
│  ├─────────────────┤ │  • "What do analysts forecast for..."    │
│  │ 2026-02-11 14:15│ │                                           │
│  │ "What's the     │ │  ┌──────────────────────────────────────┐│
│  │  bull case for  │ │  │  Response display area                ││
│  │  SK Hynix?"     │ │  │  Claude-generated answer with         ││
│  ├─────────────────┤ │  │  citations to sweep log entries,      ││
│  │ 2026-02-11 13:50│ │  │  dates, and sources                   ││
│  │ "How exposed    │ │  └──────────────────────────────────────┘│
│  │  are we to      │ │                                           │
│  │  China risk?"   │ │                                           │
│  └─────────────────┘ │                                           │
│                       │                                           │
│  (clickable — click   │                                           │
│   to reload that Q&A) │                                           │
│                       │                                           │
└──────────────────────┴───────────────────────────────────────────┘
```

**Question History (left sidebar):**
- Displays a record log of **all questions previously asked**, newest first
- Each entry shows: timestamp, question text (truncated if long)
- Clickable — clicking a previous question reloads that Q&A pair (question + answer) in the main response area
- Stored in a `ask_kabuten_log` table (see Database Schema)
- Persistent across sessions — the log is saved to the database, not just session memory

**Source toggle** — a button/toggle bar to select the search scope:
  - **Kabuten Only** (default) — searches only Kabuten's own database: sweep history, investment views, analyst agent logs, earnings models
  - **Claude** — uses Claude's general knowledge
  - **Internet** — uses Claude API web search
  - **All Sources** — combines all three
- **Sample questions** displayed near the search box as clickable prompts:
  - "Why did you change your view on Advantest?"
  - "What factors coincided with the previous peak in SK Hynix?"
  - "Why has Adobe been underperforming recently?"
  - "What do analysts forecast for Google's capex in 2027?"
- **Response display** — Claude-generated answer with citations to specific sweep log entries, dates, and sources where applicable

**Implementation (must be functional):**

The Ask Kabuten feature requires a working backend API route (`/api/ask/route.ts`) that:

1. Receives the user's question and selected source scope
2. Based on scope:
   - **Kabuten Only**: Queries the `action_log` table (full text search on summary + detail_json), `companies` table (investment views, profiles), and `sweep_data` table. Constructs a context payload from matching results and sends to Claude API for synthesis.
   - **Claude**: Sends the question directly to Claude API with a system prompt that includes Kabuten's coverage universe context (company names, tickers, sectors) but no database data.
   - **Internet**: Sends the question to Claude API with `web_search` tool enabled.
   - **All Sources**: Combines: database context + Claude knowledge + web search tool enabled.
3. Streams the response back to the frontend for display

**System prompt for Ask Kabuten:**
```
You are Kabuten, an AI equity research platform covering 230 technology and semiconductor companies globally.

{if scope includes Kabuten data}
DATABASE CONTEXT:
{matching action log entries, investment views, earnings data from DB query}
{/if}

Answer the user's question using the available context. Cite specific sweep log dates and sources where relevant. If the question is about a specific company, focus on that company's data. If the question spans multiple companies, synthesize across the coverage universe.
```

**Frontend:** Client component with input field, source toggle buttons, loading state, and streamed response display. Conversation history maintained for follow-up questions within the session.

### Podcast Tracker Page (`/podcasts`)

A manually-triggered page that extracts AI and semiconductor insights from key technology podcasts. Displays results in a **reverse-chronological log format** — newest episodes at the top.

**Trigger: Manual via [Run Podcast Scan] button**

The podcast tracker does **not** run on a cron schedule. Oliver clicks the button to trigger a scan that fetches transcripts and analyzes them for insights.

**How it works:**
1. Oliver opens the `/podcasts` page and clicks **[Run Podcast Scan]** button
2. The frontend calls `POST /api/podcasts/scan` which triggers the backend scan
3. For each of the 11 tracked podcasts, the backend:
   a. Uses Claude API with web search tool to find the most recent episode title and date
   b. Fetches the transcript using the sourcing chain (see below)
   c. Claude API analyzes the transcript for AI and semiconductor insights
   d. Relevant insights are extracted and stored in the database
4. Results are rendered on the page with status indicators per episode
5. Over time, this builds a searchable library of curated ideas from these podcasts

**[Run Podcast Scan] button — implementation detail:**

The button triggers a `POST /api/podcasts/scan` API route. This route:
1. Iterates through all 11 tracked podcasts
2. For each podcast, uses Claude API with `web_search` tool to find the latest episode
3. Attempts to fetch the transcript via the sourcing chain
4. Analyzes with Claude API and stores results in `podcast_episodes` table
5. Returns progress updates via streaming or polling (frontend polls `GET /api/podcasts/status` for progress)

**IMPORTANT:** The Run button must work without Chrome MCP. The primary scan flow uses Claude API web search (server-side) to find episodes and fetch transcripts/summaries. Chrome MCP (metacast.app) is an optional enhancement for higher-quality transcripts when Oliver's browser is connected, but the button must function independently.

**[Run Podcast Scan] button states:**
- Idle: "Run Podcast Scan" — ready to scan
- Running: "Scanning podcasts..." — with progress indicator (e.g. "Fetching transcript: All-In (2/11)")
- Complete: "Podcast scan complete" — with timestamp of last scan

**Transcript Sourcing Chain:**

Transcripts are fetched in priority order. No YouTube dependency.

| Priority | Source | Method | Coverage |
|----------|--------|--------|----------|
| 1 | Claude API web search | Server-side web search for episode transcripts, recaps, show notes | 11/11 podcasts — always available, no browser dependency |
| 2 | metacast.app | Chrome MCP (requires browser open) — optional enhancement | 11/11 podcasts — higher quality full transcripts when available |
| 3 | podscripts.co | Web fetch transcript page | 6/11 podcasts: All-In, a16z, No Priors, Dwarkesh, Big Technology, Hard Fork |

**podscripts.co URL patterns:**
- `podscripts.co/podcasts/{slug}` — podcast page with episode list
- `podscripts.co/podcasts/{slug}/{episode-slug}` — full transcript with timestamps

**metacast.app URL patterns:**
- `metacast.app/podcast/{name}/{id}` — podcast page with episode list and transcripts
- Requires Chrome MCP for access (403 on direct fetch — authentication needed)

**Podcast-to-source mapping:**

| # | Podcast | Focus | Primary Source | podscripts.co slug (backup) |
|---|---------|-------|----------------|-------------------|
| 1 | All-In | Tech, venture, macro | Claude web search | `all-in-with-chamath-jason-sacks-friedberg` |
| 2 | a16z Podcast | Tech, venture, AI | Claude web search | `a16z-podcast` |
| 3 | BG2 Pod | Business, growth, tech | Claude web search | — |
| 4 | No Priors | AI, machine learning | Claude web search | `no-priors-artificial-intelligence-technology-startups` |
| 5 | Dwarkesh Podcast | AI, technology, science | Claude web search | `dwarkesh-podcast` |
| 6 | Big Technology Podcast | Big tech industry | Claude web search | `big-technology-podcast` |
| 7 | Excess Returns | Investing, markets | Claude web search | — |
| 8 | Bloomberg Technology | Tech news, markets | Claude web search | — |
| 9 | Hard Fork (NYT) | Tech culture, AI | Claude web search | `hard-fork` |
| 10 | Odd Lots (Bloomberg) | Markets, economics, tech | Claude web search | — |
| 11 | Semi Doped | Semiconductors, chip industry | Claude web search | — |

**Status indicators per episode:**
- ✅ Full transcript analysed — transcript found and insights extracted
- 🟡 Partial — used episode description + web search summaries (no full transcript)
- ❌ Episode not found — could not locate latest episode
- ⏳ Pending — scan in progress

**Graceful fallback:**
- Default mode: Claude API web search finds episode info and summaries/recaps (server-side, always works)
- If Chrome MCP is connected: optionally use metacast.app for higher-quality full transcripts
- If neither full transcript nor recap available: extract what's possible from episode title + description
- Display message when Chrome MCP not connected: "Connect Chrome extension for full transcripts from metacast.app (optional)"

**Layout — Two-column: Podcast list (left) + Episode log (right):**
- **Frozen header**: Run Podcast Scan button + last-scan timestamp + search bar — sticky at top, visible on scroll
- **Left column (narrow, ~250px):** "Podcasts Tracked" table listing all 11 tracked podcast titles in **alphabetical order**. Static reference list. Sticky within the column so it remains visible as the user scrolls through episodes on the right.
- **Right column (wide, remaining width):** Sequential log of episode summaries in **reverse chronological order** (newest at top). Each episode displayed **fully expanded** — no dropdown chevrons or expandable sections. Like a social media post thread.
- Each entry shows: podcast name, episode title, date, status indicator, and the full extracted insights (bullet points tagged by topic)
- Search bar filters across all extracted insights on the right
- Entries are visually separated like individual posts/cards in a feed — clear visual boundaries between each episode summary
- Historical archive scrolls down — browse past episodes and their insights by scrolling

### Social Heatmap Page (`/heatmap`)

A manually-triggered visual heatmap showing which AI and technology keywords are generating the most buzz on X.com (Twitter), based on **real view count data** from Oliver's logged-in X.com account.

**Trigger: Manual via [Run Heatmap] button — requires Chrome MCP**

The heatmap does **not** run on a cron schedule and **cannot** run as a cron job (that would require paid X API access). Oliver clicks the button to trigger a scan while Chrome MCP is connected to his browser with X.com logged in.

**If Chrome MCP is not connected:** The [Run Heatmap] button is **disabled/greyed out** and shows the message: "Connect Chrome extension and log into X.com to run heatmap scan." There is no fallback mode — the scan requires direct browser access to X.com to read view counts.

**[Run Heatmap] button states:**
- **Disabled**: "Connect Chrome to scan" — Chrome MCP not connected (button greyed out)
- **Idle**: "⚡ Run Heatmap" — ready to scan (Chrome MCP connected)
- **Running**: "Scanning: HBM (3/40)" — with progress bar showing current keyword
- **Complete**: "✅ Heatmap Updated" — with timestamp, reverts to idle after 3 seconds

**Methodology — X.com View Count Comparison:**

For each of the ~40 curated keywords:

1. **Navigate** to X.com search via Chrome MCP: `x.com/search?q={keyword}&f=top`
2. **Read the view counts** of the **top 3 posts** in the search results
3. **Sum** the 3 view counts → this is today's **Total Views** for that keyword
4. **Store** today's Total Views in the `heatmap_snapshots` database table
5. **Compare** today's Total Views against the **7-day rolling average** of Total Views (calculated from the last 7 stored snapshots for that keyword)
6. **Calculate heat score** (0–100) based on the ratio of today vs 7-day average:
   - Ratio = Today's Total Views ÷ 7-Day Average
   - Ratio 2.0× (double the average) → score ~95
   - Ratio 1.5× → score ~75
   - Ratio 1.0× (exactly average) → score ~50
   - Ratio 0.7× → score ~30
   - Ratio 0.5× (half the average) → score ~15
   - Formula: `score = Math.min(100, Math.max(0, Math.round(50 + (ratio - 1) * 45)))`
7. **Classify** each keyword:
   - Score ≥ 75 → **Hot** (significantly above average)
   - Score 55–74 → **Warm** (above average)
   - Score 45–54 → **Neutral** (around average)
   - Score < 45 → **Cold** (below average)
8. **Delta** = today's score minus the score from 7 days ago (shows trend direction)

**First scan / baseline period:** For the first 7 days of scanning, there is no 7-day average to compare against. During this period, all keywords default to score 50 (neutral) and the system simply accumulates daily snapshots. After 7 days of data, the comparison methodology kicks in and scores become meaningful. Display a note: "Building baseline — X days of data collected. Scores become active after 7 days."

**Rate limiting:** 3–5 second delays between keyword searches to avoid X.com throttling. A full scan of 40 keywords takes approximately **3–4 minutes**.

**Scan implementation flow (Chrome MCP):**
1. Frontend checks Chrome MCP connection status — if not connected, button stays disabled
2. On click, frontend sends message to Chrome MCP to begin scan sequence
3. For each keyword (sequentially, with delays):
   a. MCP navigates to `x.com/search?q={keyword}&f=top`
   b. Wait 2 seconds for results to load
   c. MCP reads the page to extract view counts from the top 3 posts
   d. Sum the 3 view counts
   e. Send result to backend: `POST /api/heatmap/record` with `{ keyword, totalViews, top3Views: [v1, v2, v3], date }`
   f. Wait 3–5 seconds before next keyword (rate limiting)
4. After all keywords processed, frontend calls `GET /api/heatmap/results` to fetch computed scores and render the grid
5. Backend computes scores by comparing today's Total Views against stored 7-day averages

**Database — `heatmap_snapshots` table:**

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| keyword | TEXT | The keyword searched |
| category | TEXT | Category (AI & ML, Semiconductors, Cloud, Hardware, Regulation, Energy) |
| scan_date | DATE | Date of scan |
| top3_views | JSONB | Array of view counts for top 3 posts, e.g. [45000, 32000, 28000] |
| total_views | INTEGER | Sum of top 3 view counts |
| heat_score | INTEGER | Computed score 0–100 |
| seven_day_avg | INTEGER | 7-day rolling average of total_views at time of calculation |
| created_at | TIMESTAMPTZ | Timestamp of record creation |

**Layout:**
- **[Run Heatmap]** button — prominent, top of page (disabled if Chrome MCP not connected)
- **Last updated:** timestamp of most recent scan
- **Summary cards:** Hot count, Warm count, Cool count, Average score
- **Category filters:** All, AI & ML, Semiconductors, Cloud & Data, Hardware, Regulation & Trade, Energy & Materials
- **Sort options:** Heat Score (default) or Biggest Movers (by delta)
- **Legend:** Color scale from red (surging) to blue (cold)
- Visual **heatmap grid** — keyword tiles colored by heat score (red = hot, blue = cold), showing score number and delta arrow
- **Click any tile** → detail panel slides in on the right showing: heat score, 7-day change, estimated mentions, 7-day trend bar chart, and latest intelligence summary
- **Historical snapshots** — browse previous days' heatmaps by scrolling or date picker
- **Baseline indicator** — during first 7 days, show note explaining scores are building up

**IMPLEMENTATION — CRITICAL (page currently broken, must be rebuilt):**

The existing Social Heatmap implementation is non-functional (database type errors). **Rebuild the entire page from scratch** following the methodology above. The mockup HTML file (`heatmap-mockup.html`) shows the exact target design and interactions. Key implementation steps:

1. **Create `heatmap_snapshots` table** in Neon database with the schema above
2. **Build API routes:**
   - `POST /api/heatmap/record` — receives individual keyword scan results from Chrome MCP and stores in DB
   - `GET /api/heatmap/results` — computes scores from stored data, returns all keywords with scores/deltas
   - `GET /api/heatmap/status` — returns Chrome MCP connection status and scan progress
3. **Build frontend page** matching the mockup design — grid of colored tiles, detail panel, category filters, summary cards
4. **Chrome MCP scan logic** — the scan sequence that navigates X.com, reads view counts, and posts results to the API
5. **Score computation** — backend function that calculates heat scores from ratio of today's views vs 7-day average
6. **Error handling** — graceful handling of failed keyword searches (skip and continue), connection drops, and rate limiting

### Sector Agent Page (`/sectors`)

> **⚠️ This section supersedes all previous Sector Agent specifications.**  
> Last updated: 22 Feb 2026. Company lists verified against live database.

#### Overview

The Sectors page has been redesigned from a simple tab + two-column card layout into a **Slack/Symphony-style chatroom interface**. Each sector now has a dedicated named Lead Agent with its own persistent conversation thread. The page is powered by a hierarchical multi-agent system using Claude Sonnet 4.6.

**Trigger: Automatic — cron runs after each daily sweep completes**

---

#### Multi-Agent Architecture

```
KabutenOrchestrator
├── APEX    → AU Enterprise Software     (5 companies)
├── ORIENT  → China Digital Consumption  (7 companies)
├── VOLT    → DC Power & Cooling         (5 companies)  ← VRT, 3324.TW, 2308.TW, 6501.T, 2301.TW — VST removed
├── INDRA   → India IT Services          (4 companies)
├── HELIX   → Memory Semis              (7 companies)
├── PHOTON  → Networking & Optics        (8 companies)
├── FORGE   → Semi Equipment            (17 companies)
├── SURGE   → EV Supply-chain           (5 companies)
├── SYNTH   → China AI Apps             (2 companies)
├── DRAGON  → China Semis              (5 companies)
├── TERRA   → Japan Materials           (5 companies)
├── PIXEL   → Gaming                    (5 companies)
├── LAYER   → PCB Supply-chain          (4 companies)
├── TIDE    → ASEAN E-commerce          (2 companies)
├── NOVA    → AI Semis                  (6 companies)
├── FERRO   → MLCCs                     (4 companies)
└── RACK    → Server ODMs               (3 companies)
     └── Each Sector Lead orchestrates N × CompanyCoverageAgent
```

**Agent roles:**

- **KabutenOrchestrator** — top-level manager. Runs all 17 sector sweeps concurrently via `asyncio.gather`. Routes OC chat messages to the correct sector thread.
- **SectorLeadAgent** (APEX / ORIENT / VOLT / INDRA / HELIX / PHOTON / FORGE / SURGE / SYNTH / DRAGON / TERRA / PIXEL / LAYER / TIDE / NOVA / FERRO / RACK) — one per sector (17 total). Orchestrates its CompanyCoverageAgents, synthesises findings into a sector view, escalates material findings for deep-dive analysis, maintains the persistent sector conversation thread, and converses with OC.
- **CompanyCoverageAgent** — one per company (89 total across all 17 sectors). Sub-agent invoked by its parent SectorLead. Returns structured JSON findings. Runs at `effort="low"` for routine sweeps, `effort="high"` for escalated deep-dives. **94 CompanyCoverageAgents total** across 17 sectors.

**Sonnet 4.6 features in use:**

| Feature | Where used | Purpose |
|---|---|---|
| Multi-agent orchestration | `orchestrator.py` + `sector_agent.py` | Lead delegates to sub-agents, synthesises results |
| Context compaction (beta) | `sector_agent.py` — all `chat()` calls | Sector threads persist indefinitely without truncation |
| 1M token context window (beta) | `sector_agent.py` — all `chat()` calls | Full sweep history stays in context |
| Adaptive thinking (`effort` param) | All agent API calls | `low` for routine, `medium` for synthesis, `high` for escalations |
| Structured outputs (`output_config.format`) | Both agent classes | Guaranteed JSON schema on every sweep and synthesis |
| Web search (`web_search_20260209`) | `company_agent.py` | Dynamic filtering of search results per sweep |

**Beta headers required on all SectorLead API calls:**
```python
betas=["interleaved-thinking-2025-05-14", "context-1m-2025-08-07"]
```

**Agent capabilities — all three are live from day one:**
- **Memory:** Each agent's `_thread_history` accumulates every sweep, finding, and conversation across sessions. Persisted to Postgres after every sweep and chat, loaded on startup. Context compaction means the thread never hits a ceiling.
- **Learning:** The full thread is passed on every API call. If the OC shared intelligence last week, the agent incorporates it into this week's synthesis automatically.
- **Conversation:** OC can message any Sector Lead at any time via the chat composer. The `chat(sector_key, message)` method on `KabutenOrchestrator` routes it to the correct agent and appends the exchange to the persistent thread.

---

#### Agent Code Files

The agent package lives at `agents/` in the repo root. All files are complete and ready — do not regenerate them:

| File | Purpose |
|---|---|
| `agents/config.py` | All 17 sector + 94 company definitions — **single source of truth** for tickers, exchanges, and sector-specific system prompt context |
| `agents/company_agent.py` | `CompanyCoverageAgent` — sub-agent, structured JSON output, web search, effort scaling |
| `agents/sector_agent.py` | `SectorLeadAgent` — orchestration, context compaction, synthesis, chat |
| `agents/orchestrator.py` | `KabutenOrchestrator` — top-level manager, concurrent sweep, chat routing |
| `agents/__init__.py` | Package exports |

---

#### Sector & Company Definitions

All 7 sectors and 48 companies verified against the live database on 22 Feb 2026. Do not alter tickers or exchanges.

| Agent | Sector | Companies (ticker — exchange) |
|---|---|---|
| **APEX** | AU Enterprise Software | WTC–ASX, XRO–ASX, PME–ASX, REA–ASX, SEK–ASX |
| **ORIENT** | China Digital Consumption | BABA–HKEX, BIDU–NASDAQ, NTES–NASDAQ, 700.HK–HKEX, TME–NYSE, TCOM–NASDAQ, PDD–NASDAQ |
| **VOLT** | DC Power & Cooling | 3324.TW–TWSE, 2308.TW–TWSE, 6501.T–TSE, VRT–NYSE, 2301.TW–TWSE |
| **INDRA** | India IT Services | INFY.NS–NSE, TCS.NS–NSE, TECHM.NS–NSE, WIPRO.NS–NSE |
| **HELIX** | Memory Semis | 285A.T–TSE, MU–NASDAQ, 005930.KS–KRX, SNDK–NASDAQ, STX–NASDAQ, 000660.KS–KRX, 2408.TW–TWSE |
| **PHOTON** | Networking & Optics | 2345.TW–TWSE, CLS–NYSE, COHR–NYSE, FN–NYSE, LITE–NASDAQ, 300394.SZ–SZSE, 300308.SZ–SZSE, 300502.SZ–SZSE |
| **FORGE** | Semi Equipment | 688082.SS–SHSE, 6857.T–TSE, AMAT–NASDAQ, 3711.TW–TWSE, ASML–NASDAQ, 6146.T–TSE, 6361.T–TSE, 7741.T–TSE, KLAC–NASDAQ, 6525.T–TSE, LRCX–NASDAQ, 6920.T–TSE, 6323.T–TSE, 7735.T–TSE, 8035.T–TSE, 7729.T–TSE, 002371.SZ–SZSE |
| **SURGE** | EV Supply-chain | TSLA–NASDAQ, 1211.HK–HKEX, 300750.SZ–SZSE, 1810.HK–HKEX, 373220.KS–KRX |
| **SYNTH** | China AI Apps | 00100.HK–HKEX, 02513.HK–HKEX |
| **DRAGON** | China Semis | 688981.SS–SHSE, 688256.SS–SHSE, 688041.SS–SHSE, 603501.SS–SHSE, 688008.SS–SHSE |
| **TERRA** | Japan Materials | 4004.T–TSE, 3110.T–TSE, 3436.T–TSE, 5016.T–TSE, 4062.T–TSE |
| **PIXEL** | Gaming | 7974.T–TSE, 6758.T–TSE, 9697.T–TSE, EA–NASDAQ, TTWO–NASDAQ |
| **LAYER** | PCB Supply-chain | 007660.KS–KRX, 2368.TW–TWSE, 3037.TW–TWSE, 1303.TW–TWSE |
| **TIDE** | ASEAN E-commerce | GRAB–NASDAQ, SE–NYSE |
| **NOVA** | AI Semis | 2330.TW–TWSE, NVDA–NASDAQ, AVGO–NASDAQ, AMD–NASDAQ, 2454.TW–TWSE, MRVL–NASDAQ |
| **FERRO** | MLCCs | 6981.T–TSE, 6762.T–TSE, 2327.TW–TWSE, 009150.KS–KRX |
| **RACK** | Server ODMs | 2317.TW–TWSE, 2382.TW–TWSE, 3231.TW–TWSE |

**Company name reference — all 17 sectors, 94 companies, verified 22 Feb 2026:**

| Ticker | Company Name | Sector |
|---|---|---|
| WTC | WiseTech Global | AU Enterprise Software |
| XRO | Xero | AU Enterprise Software |
| PME | Pro Medicus | AU Enterprise Software |
| REA | REA Group | AU Enterprise Software |
| SEK | Seek | AU Enterprise Software |
| BABA | Alibaba Group | China Digital Consumption |
| BIDU | Baidu | China Digital Consumption |
| NTES | NetEase | China Digital Consumption |
| 700.HK | Tencent Holdings | China Digital Consumption |
| TME | Tencent Music | China Digital Consumption |
| TCOM | Trip.com Group | China Digital Consumption |
| PDD | PDD Holdings (Temu/Pinduoduo) | China Digital Consumption |
| 3324.TW | Auras Technology | DC Power & Cooling |
| 2308.TW | Delta Electronics | DC Power & Cooling |
| 6501.T | Hitachi | DC Power & Cooling |
| VRT | Vertiv Holdings | DC Power & Cooling |
| 2301.TW | Lite-On Technology | DC Power & Cooling |
| INFY.NS | Infosys | India IT Services |
| TCS.NS | Tata Consultancy Services | India IT Services |
| TECHM.NS | Tech Mahindra | India IT Services |
| WIPRO.NS | Wipro | India IT Services |
| 285A.T | Kioxia | Memory Semis |
| MU | Micron Technology | Memory Semis |
| 005930.KS | Samsung Electronics | Memory Semis |
| SNDK | SanDisk | Memory Semis |
| STX | Seagate Technology | Memory Semis |
| 000660.KS | SK Hynix | Memory Semis |
| 2408.TW | Nanya Technology | Memory Semis |
| 2345.TW | Accton Technology | Networking & Optics |
| CLS | Celestica | Networking & Optics |
| COHR | Coherent Corp | Networking & Optics |
| FN | Fabrinet | Networking & Optics |
| LITE | Lumentum | Networking & Optics |
| 300394.SZ | Suzhou TFC Optical Communication | Networking & Optics |
| 300308.SZ | Zhongji Innolight | Networking & Optics |
| 300502.SZ | Eoptolink Technology | Networking & Optics |
| 688082.SS | ACM Research (Shanghai) | Semi Equipment |
| 6857.T | Advantest | Semi Equipment |
| AMAT | Applied Materials | Semi Equipment |
| 3711.TW | ASE Technology | Semi Equipment |
| ASML | ASML | Semi Equipment |
| 6146.T | Disco Corporation | Semi Equipment |
| 6361.T | Ebara | Semi Equipment |
| 7741.T | Hoya | Semi Equipment |
| KLAC | KLA Corporation | Semi Equipment |
| 6525.T | Kokusai Electric | Semi Equipment |
| LRCX | Lam Research | Semi Equipment |
| 6920.T | Lasertec | Semi Equipment |
| 6323.T | Rorze | Semi Equipment |
| 7735.T | Screen Holdings | Semi Equipment |
| 8035.T | Tokyo Electron | Semi Equipment |
| 7729.T | Tokyo Seimitsu | Semi Equipment |
| 002371.SZ | NAURA Technology Group | Semi Equipment |
| TSLA | Tesla | EV Supply-chain |
| 1211.HK | BYD (H-shares) | EV Supply-chain |
| 300750.SZ | CATL | EV Supply-chain |
| 1810.HK | Xiaomi | EV Supply-chain |
| 373220.KS | LG Energy Solution | EV Supply-chain |
| 00100.HK | MiniMax Group | China AI Apps |
| 02513.HK | Zhipu / Z.ai (Knowledge Atlas Technology) | China AI Apps |
| 688981.SS | SMIC | China Semis |
| 688256.SS | Cambricon Technologies | China Semis |
| 688041.SS | Hygon Information Technology | China Semis |
| 603501.SS | Will Semiconductor (OmniVision) | China Semis |
| 688008.SS | Montage Technology | China Semis |
| 4004.T | Resonac Holdings | Japan Materials |
| 3110.T | Nitto Boseki | Japan Materials |
| 3436.T | Sumco | Japan Materials |
| 5016.T | JX Advanced Metals | Japan Materials |
| 4062.T | Ibiden | Japan Materials |
| 7974.T | Nintendo | Gaming |
| 6758.T | Sony Group | Gaming |
| 9697.T | Capcom | Gaming |
| EA | Electronic Arts | Gaming |
| TTWO | Take-Two Interactive | Gaming |
| 007660.KS | Isu Petasys | PCB Supply-chain |
| 2368.TW | Gold Circuit Electronics | PCB Supply-chain |
| 3037.TW | Unimicron Technology | PCB Supply-chain |
| 1303.TW | Nanya Plastics | PCB Supply-chain |
| GRAB | Grab Holdings | ASEAN E-commerce |
| SE | SEA Limited | ASEAN E-commerce |
| 2330.TW | TSMC | AI Semis |
| NVDA | Nvidia | AI Semis |
| AVGO | Broadcom | AI Semis |
| AMD | AMD | AI Semis |
| 2454.TW | Mediatek | AI Semis |
| MRVL | Marvell Technology | AI Semis |
| 6981.T | Murata Manufacturing | MLCCs |
| 6762.T | TDK | MLCCs |
| 2327.TW | Yageo | MLCCs |
| 009150.KS | Samsung Electro-Mechanics | MLCCs |
| 2317.TW | Hon Hai Precision (Foxconn) | Server ODMs |
| 2382.TW | Quanta Computer | Server ODMs |
| 3231.TW | Wistron | Server ODMs |

**Note on Tokyo Seimitsu:** Tokyo Seimitsu (7729.T) was already in FORGE from the original verified list and was not a new addition.
---

#### UI — Three-Pane Chatroom Layout

The page is redesigned from its current tab + card layout into a three-pane chatroom. This is a frontend change to `app/sectors/page.tsx` — the underlying data model is extended by two new DB tables (see below).

```
┌─────────────────┬───────────────────────────────┬──────────────────┐
│   LEFT SIDEBAR  │         CENTRE FEED           │   RIGHT PANEL    │
│   (230px)       │         (flex: 1)             │   (270px)        │
├─────────────────┼───────────────────────────────┼──────────────────┤
│ Kabuten brand   │ Channel header                │ Agent tab        │
│                 │ Stats bar                     │ Sector View tab  │
│ SECTOR THREADS  │                               │ Coverage tab     │
│ • APEX          │ Message feed                  │                  │
│ • ORIENT        │  - Date dividers              │ Agent profile    │
│ • VOLT          │  - Sweep messages             │ Sector snapshot  │
│ • INDRA         │  - Material finding cards     │ Coverage list    │
│ • HELIX         │  - OC messages                │ My notes         │
│ • PHOTON        │  - Agent replies              │                  │
│ • FORGE         │                               │                  │
│                 │ Message composer              │                  │
│ OC footer       │                               │                  │
└─────────────────┴───────────────────────────────┴──────────────────┘
```

**Design language — must match existing Kabuten exactly:**
- Background: `#f4f5f7`, cards on `#ffffff`
- Kanji wallpaper: tiling SVG at ~4.5% opacity (existing pattern)
- Typography: Inter (body), IBM Plex Mono (labels, timestamps, tickers)
- Active sector: dark navy pill `#111827`
- Bullish: `#16a34a` · Neutral: `#ea580c` · Bearish: `#dc2626`
- MATERIAL badge: red · INCREMENTAL badge: blue
- Borders: `#e2e5ea` · Light theme only — no dark mode

**Message types in the feed:**

| Type | Tag | Trigger |
|---|---|---|
| Daily Sweep | Blue | Automatic, once per day |
| Material Finding | Amber | Agent escalation (`finding_type=material`) |
| Sector View | Green | Agent's synthesised sector view update |
| OC Message | Navy | OC sends via composer |
| Agent Response | Green | Agent reply to OC |

**Sweep message** — one row per company: Ticker · Finding badge (MATERIAL / INCREMENTAL / NONE) · Headline. Footer: agent's sector-level read.

**Material Finding card** — amber left accent, company name, ticker, signal badge (↑ BULLISH / ⚠ WATCH / ↓ RISK), category, headline, detail, assessment (max 100 words).

**Stats bar** — Companies · Bullish · Neutral · Bearish · Last Material date.

**Right panel tabs** — Agent (designation, last sweep), Sector View (posture, stars, conviction, material count), Coverage (all companies with BULL/NEUT/BEAR badges). Plus **My Notes** showing OC's most recent logged view for this sector.

**Composer** — multi-line textarea, auto-resize. Hint: `Tag: @Ticker · Log view: /view · Ask: /ask`. Enter sends, Shift+Enter newlines. On send: append OC message, show agent "Thinking…", stream reply.

**Sidebar** — K株 brand mark, "SECTOR AGENT" sub-label. Seven channel items with colour-coded dot. Active sector: navy left border. Unread badge (red) for new material findings. OC footer with online status dot.

---

#### Database — New Tables

Two new tables supplement the existing `sector_views` and `sector_log` tables. **Keep the existing tables** — they continue to be written and used for the sector view display. Add:

```sql
-- Sector agent persistent thread histories
CREATE TABLE IF NOT EXISTS sector_agent_threads (
    sector_key      TEXT PRIMARY KEY,
    designation     TEXT NOT NULL,
    thread_history  JSONB NOT NULL DEFAULT '[]',
    message_count   INTEGER GENERATED ALWAYS AS (jsonb_array_length(thread_history)) STORED,
    last_updated    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_sweep_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sat_designation ON sector_agent_threads(designation);

-- Sector synthesis results (one row per sweep per sector)
CREATE TABLE IF NOT EXISTS sector_syntheses (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sector_key        TEXT NOT NULL,
    designation       TEXT NOT NULL,
    posture           TEXT NOT NULL CHECK (posture IN ('bullish', 'neutral', 'bearish')),
    conviction        NUMERIC(3,1) NOT NULL CHECK (conviction BETWEEN 0 AND 10),
    thesis_summary    TEXT,
    key_drivers       TEXT[],
    key_risks         TEXT[],
    company_signals   JSONB,
    material_findings JSONB,
    synthesised_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ss_sector_key ON sector_syntheses(sector_key);
CREATE INDEX IF NOT EXISTS idx_ss_synthesised ON sector_syntheses(synthesised_at DESC);

-- Seed thread rows for all 17 sector agents
INSERT INTO sector_agent_threads (sector_key, designation) VALUES
    ('au_enterprise_software',    'APEX'),
    ('china_digital_consumption', 'ORIENT'),
    ('dc_power_cooling',          'VOLT'),
    ('india_it_services',         'INDRA'),
    ('memory_semis',              'HELIX'),
    ('networking_optics',         'PHOTON'),
    ('semi_equipment',            'FORGE'),
    ('ev_supply_chain',           'SURGE'),
    ('china_ai_apps',             'SYNTH'),
    ('china_semis',               'DRAGON'),
    ('japan_materials',           'TERRA'),
    ('gaming',                    'PIXEL'),
    ('pcb_supply_chain',          'LAYER'),
    ('asean_ecommerce',           'TIDE'),
    ('ai_semis',                  'NOVA'),
    ('mlccs',                     'FERRO'),
    ('server_odms',               'RACK')
ON CONFLICT (sector_key) DO NOTHING;

-- ⚠️ CRITICAL SEEDING REQUIREMENTS (must run on first deploy, before any sweep):
--
-- 1. sector_briefs — seed default investment mandate bullets for all 17 sectors.
--    The Sector Brief tab will be blank until this is done. Default bullets are
--    defined in the "Sector Brief Tab — Default bullet points per sector" section above.
--
-- 2. sector_syntheses — populated automatically after the first successful sector agent
--    sweep (cron at 22:00 UTC). No manual seeding needed — just ensure the sector agent
--    cron runs successfully at least once.
--
-- 3. Coverage tab in the Sectors page reads from the companies table filtered by sector_group.
--    If the Coverage tab is blank, the sector_group column is not populated correctly.
--    All sector-grouped companies must have sector_group set to the exact sector_key value
--    (e.g. 'semi_equipment', 'dc_power_cooling') — check with:
--    SELECT ticker, sector_group FROM companies WHERE sector_group IS NOT NULL ORDER BY sector_group;
```

---

#### API Routes

Add to the Next.js API layer (or FastAPI if Python backend):

**`GET /api/agents/status`** — returns status of all 17 agents: designation, sector name, company count, thread length, colour.

**`POST /api/agents/sweep`**
```json
// body (omit sector_key to sweep all 7)
{ "sector_key": "au_enterprise_software" }
// response — sector synthesis object
{ "designation": "APEX", "posture": "neutral", "conviction": 6.4, "thesis_summary": "...", ... }
```

**`POST /api/agents/chat`**
```json
{ "sector_key": "au_enterprise_software", "message": "What's driving the WTC re-rating?" }
// response
{ "reply": "..." }
```

After every chat and sweep, persist the thread:
```typescript
const thread = orchestrator.export_thread(sector_key);
await db.save_thread_history(sector_key, thread);
```

---

#### Sweep & Escalation Flow

1. Orchestrator calls `SectorLeadAgent.run_daily_sweep()`
2. Lead fans out to all CompanyCoverageAgents concurrently (`asyncio.gather`)
3. Each CompanyCoverageAgent runs a web search sweep → returns structured JSON
4. Lead identifies any `requires_escalation=True` finding
5. Escalated companies get a deep-dive re-sweep at `effort="high"`
6. Lead synthesises all findings into a sector view
7. Sweep result and material findings appended to persistent thread
8. Thread and synthesis saved to database

**Cron schedule** — runs after all company sweep batches complete:
```json
{ "path": "/api/agents/sweep", "schedule": "0 22 * * *" }
```
`22:00 UTC` = `07:00 AEDT` — 30 min after the last company batch (as per existing schedule).

---

#### Implementation Notes

- The agents are ready to converse from day one of deployment — no sweep history required. History accumulates from the first sweep onwards.
- On startup, load thread histories from `sector_agent_threads` into each `SectorLeadAgent` via `load_thread_history(history)`.
- The `sector_group` field on the `companies` table continues to be used for peer context injection into individual company sweeps (existing behaviour unchanged).
- `sector_group` values for the 48 sector companies must map to the 7 `sector_key` values: `au_enterprise_software`, `china_digital_consumption`, `dc_power_cooling`, `india_it_services`, `memory_semis`, `networking_optics`, `semi_equipment`.
- **Agent role clarity:** Each Sector Lead Agent synthesises Investment Views and Daily Sweep results from its member Company Analyst Agents. It does not conduct independent internet research — the Company Agents do that. The Sector Lead's job is synthesis and pattern recognition across those company-level findings.
- **⚠️ VOLT config.py fix required:** The `dc_power_cooling` sector in `agents/config.py` currently has `VST` (Vistra Corp) instead of `VRT` (Vertiv Holdings), and is missing `2301.TW` (Lite-On Technology). The correct 5 companies are: `3324.TW`, `2308.TW`, `6501.T`, `VRT`, `2301.TW`. Also update the DB: set `sector_group = 'dc_power_cooling'` for VRT and 2301.TW; set `sector_group = NULL` for VST.

**Navigation:** The "Sectors" nav button in the sticky toolbar must show only the monochrome SVG building icon — **remove the 🏭 emoji**. Search for `🏭` in the navigation component and delete it. Keep the SVG icon and the word "Sectors".

---

#### Fix 1 — Thread Persistence (Conversations Must Survive Page Reload)

**Problem:** OC's conversations with each Sector Agent disappear when the page is closed and reopened. The thread history is being held in React state only and lost on unmount.

**Required behaviour:** Every message — whether a sweep result, OC message, or agent reply — must be saved to the database immediately and reloaded on every page open. The feed should look exactly as OC left it.

**Implementation:**

1. **On page mount**: call `GET /api/agents/status` which returns the current thread history for each sector. Populate the feed from the database, not from local state.

2. **After every OC message + agent reply pair**: immediately persist the updated thread to `sector_agent_threads.thread_history` in Postgres. Do not batch — persist after every single exchange. Either add `POST /api/agents/persist` or fold persistence into `POST /api/agents/chat` (write to DB before returning the reply).

3. **After every sweep**: confirm the full thread (not just the synthesis) is written to `sector_agent_threads.thread_history`.

4. **Never use `localStorage` or session state** as the primary store for thread history. Postgres is the source of truth.

5. **Feed hydration on sector switch**: when OC clicks a different sector in the sidebar, fetch that sector's thread from the DB and render it. Do not hold all 7 threads in memory simultaneously — fetch on demand per sector.

```typescript
// New or extended route — persist thread after every chat exchange
POST /api/agents/persist
body: { sector_key: string, thread_history: Message[] }
response: { ok: true }
```

---

#### Fix 2 — Current Date Injection into Agent System Prompts

**Problem:** Agents reason as if it is end-2024 because no current date is provided at runtime.

**Required fix:** Inject the current date dynamically into the base system prompt of every agent — both `SectorLeadAgent` and `CompanyCoverageAgent` — on every API call.

In `sector_agent.py` and `company_agent.py`, prepend the following to every system prompt before the API call. This must be computed at call time (not hardcoded) so it reflects the actual date of each sweep or chat:

```python
from datetime import date

def date_header() -> str:
    today = date.today()
    return (
        f"Today's date is {today.strftime('%A, %d %B %Y')}. "
        f"You are operating in {today.year}. "
        "Your training has a knowledge cutoff, but you have access to web search "
        "and to daily sweep data collected up to today. "
        f"Always reason as if it is {today.year}, not 2024 or any prior year. "
        "If OC asks what year it is, tell them the correct year based on this header."
    )
```

Prepend `date_header()` to the system prompt string on every API call — sweeps, deep-dives, synthesis, and chat. Do not store it; recompute each time.

---

#### Fix 3 — UI Layout Adjustments

**Updated pane widths:**

| Pane | Old width | New width |
|---|---|---|
| Left sidebar | 230px | 200px |
| Centre feed | flex: 1 | flex: 1, min-width: 440px |
| Right panel | 270px | 340px |

**Right panel — Sector View tab must now show (in order):**

1. Posture badge (↑ Bullish / → Neutral / ↓ Bearish) + conviction stars
2. **Thesis** — full text, no truncation, wraps naturally in the wider 340px panel
3. **Key Drivers** — up to 3 bullet items with `+` prefix (green)
4. **Key Risks** — up to 3 bullet items with `-` prefix (red)
5. Thin horizontal divider
6. **Companies in this sector** — compact list at the bottom of the panel showing every member company as a row: Company name · Ticker (mono font) · signal badge (`↑ BULL` / `→ NEUT` / `↓ BEAR`). Each row tappable → navigates to company page.

The Coverage tab remains as before (full-width company list), but the Sector View tab now also shows the company list at the bottom so OC can see thesis + coverage without switching tabs.

---

#### Sector Brief Tab (replaces "Agent" tab)

The right panel tab previously labelled **"Agent"** must be renamed to **"Sector Brief"**. This tab defines the investment mandate for the sector agent — what it should focus on, track, and optimise for.

**Layout:**
- Agent avatar, designation, sector name, last sweep timestamp (unchanged from Agent tab)
- Section header: **"Investment Mandate"** in monospace label style
- **5 editable bullet points** — the standing instructions that define what this agent prioritises in its coverage and recommendations
- **Edit button** — small pencil icon (pencil emoji) top-right of the mandate section. On click: all 5 bullet points become editable inline text fields. Save button appears. On save: updated bullets written to `sector_briefs` DB table and included in the agent system prompt on next sweep/chat call.

**Storage — `sector_briefs` table:**

```sql
CREATE TABLE IF NOT EXISTS sector_briefs (
  sector_key TEXT PRIMARY KEY,
  bullet_1 TEXT NOT NULL,
  bullet_2 TEXT NOT NULL,
  bullet_3 TEXT NOT NULL,
  bullet_4 TEXT NOT NULL,
  bullet_5 TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**API routes:**
```
GET  /api/agents/brief?sector=forge    -- returns current 5 bullets for sector
POST /api/agents/brief                 -- body: { sector_key, bullet_1..5 } upsert
```

**Agent integration:** On every sweep and chat call, prepend the sector brief bullets to the system prompt:
```python
brief = load_sector_brief(sector_key)  # from DB
brief_block = f"""
Your investment mandate for this sector:
1. {brief.bullet_1}
2. {brief.bullet_2}
3. {brief.bullet_3}
4. {brief.bullet_4}
5. {brief.bullet_5}
"""
# Prepend to system prompt before every API call
```

**Default bullet points per sector — seed these into `sector_briefs` on first deploy:**

APEX (AU Enterprise Software):
1. Track ARR growth and net revenue retention — the two metrics that determine long-term compounding
2. Monitor competitive displacement of legacy on-premise systems by SaaS players
3. Flag any pricing power evidence: seat expansion, ARPU growth, upsell rates
4. Watch US/global expansion progress — TAM extension is the key re-rating catalyst
5. Alert on any earnings guidance revision, analyst upgrade cycle, or multiple expansion triggers

ORIENT (China Digital Consumption):
1. Track monthly active user trends and monetisation rates across e-commerce and entertainment
2. Monitor regulatory shifts from Beijing — platform economy rules are the dominant risk factor
3. Flag any evidence of consumer spending recovery in China's domestic economy
4. Watch competitive dynamics between platforms: who is taking share in AI-native features
5. Alert on any ADR delisting risk, geopolitical escalation, or US-China trade policy impact

VOLT (DC Power & Cooling):
1. Track hyperscaler capex announcements — they are the primary demand signal for power and cooling equipment
2. Monitor AI data centre buildout pace: rack density increases drive cooling intensity non-linearly
3. Flag any utility-scale power constraint news — grid bottlenecks are the key sector risk
4. Watch order backlog and lead time data — supply constraints drive margin expansion
5. Alert on new product cycles: liquid cooling, direct-to-chip, and high-density UPS adoption curves

INDRA (India IT Services):
1. Track deal TCV (total contract value) and large deal wins — leading indicator of revenue 12-18 months out
2. Monitor AI services adoption within existing client bases — the key re-rating narrative
3. Flag rupee/USD FX moves and their margin impact for USD-revenue, INR-cost businesses
4. Watch headcount and attrition data — execution capacity determines revenue conversion
5. Alert on US visa policy changes, client budget freeze signals, or vertical-specific slowdowns

HELIX (Memory Semis):
1. Track HBM allocation and pricing — AI server demand is driving a structural premium over commodity DRAM
2. Monitor DRAM and NAND contract price trends — the primary earnings swing factor
3. Flag any capacity addition announcements: new fabs or technology node transitions affect supply balance
4. Watch inventory levels across the supply chain — overhang signals are a leading warning indicator
5. Alert on customer concentration risk (Nvidia, hyperscalers) or geopolitical supply disruption

PHOTON (Networking & Optics):
1. Track hyperscaler fibre and optical transceiver orders — 800G/1.6T adoption is the key growth vector
2. Monitor silicon photonics adoption curve — this determines which vendors gain structural share
3. Flag any co-packaged optics (CPO) milestone: a technology transition that reshapes the competitive landscape
4. Watch capacity utilisation and ASP trends — pricing power confirms genuine demand vs inventory restocking
5. Alert on any new datacom standard adoption, competitor product launch, or key customer design win

FORGE (Semi Equipment):
1. Track WFE (wafer fab equipment) spending guidance from TSMC, Samsung, and Intel — the primary demand driver
2. Monitor export control developments: US restrictions on China sales are the dominant sector risk
3. Flag technology inflection points: High-NA EUV ramp, GAA adoption, advanced packaging intensity increases
4. Watch order book and book-to-bill ratio — leading indicators of revenue 6-12 months ahead
5. Alert on any capacity expansion announcement, customer fab delay, or competitive displacement news

SURGE (EV Supply-chain):
1. Track EV penetration rates by market: China, Europe, and US are the three key demand theatres
2. Monitor battery cost per kWh trends — cost parity with ICE is the structural inflection point
3. Flag any government subsidy change, EV mandate policy, or tariff development in major markets
4. Watch vertically integrated players (BYD, Tesla) vs supply chain specialists — margin flow matters
5. Alert on raw material price moves (lithium, cobalt, nickel) and their battery cost pass-through impact

SYNTH (China AI Apps):
1. Track daily/monthly active users and revenue per user — commercial scale is the key validation metric
2. Monitor foundation model benchmark performance vs US peers — technical parity is the re-rating catalyst
3. Flag any regulatory development from Beijing's AI governance framework — approval cycles affect deployment
4. Watch gross margin trajectory — inference cost reduction determines path to profitability
5. Alert on any enterprise contract win, government deployment, or overseas market expansion evidence

DRAGON (China Semis):
1. Track domestic chip substitution progress — government mandates are accelerating adoption curves
2. Monitor US Entity List additions and export control expansions — the dominant sector risk
3. Flag any technology node advancement: closing the gap with TSMC/Samsung is the structural thesis
4. Watch government subsidy flows and state-backed capex commitments — funding visibility matters
5. Alert on any foundry capacity utilisation data, yield improvement milestones, or customer design wins

TERRA (Japan Materials):
1. Track semiconductor materials supply tightness — Japan controls critical chokepoints in the global chip supply chain
2. Monitor export control developments from Japan's METI — materials restrictions have global ripple effects
3. Flag customer inventory drawdown signals — semiconductor materials demand lags equipment by 1-2 quarters
4. Watch yen moves and their impact on USD-reported margins for Japan-headquartered exporters
5. Alert on any capacity expansion, new material qualification, or customer concentration shift

PIXEL (Gaming):
1. Track software title release schedules and attach rates — IP launches are the primary earnings catalyst
2. Monitor console hardware cycle timing: next-gen transitions create both opportunity and disruption
3. Flag mobile gaming monetisation trends — in-app purchase and live service revenue are the recurring base
4. Watch AI-assisted game development adoption — cost reduction and release cadence improvement
5. Alert on any major studio acquisition, competitive platform shift, or regulatory change on loot boxes/monetisation

LAYER (PCB Supply-chain):
1. Track AI server PCB and IC substrate order volumes — this is the highest-value tier of the supply chain
2. Monitor substrate technology transitions: ABF (Ajinomoto Build-up Film) capacity is the bottleneck
3. Flag customer concentration risk — a handful of hyperscalers and chipmakers dominate demand
4. Watch lead times and ASP trends for high-layer-count PCBs — pricing power reflects genuine demand
5. Alert on any new substrate technology qualification, capacity expansion, or competitive displacement

TIDE (ASEAN E-commerce):
1. Track GMV growth and take rate expansion — the two levers that compound into earnings power
2. Monitor path to profitability: both Grab and Sea have moved from growth-at-all-costs to margin discipline
3. Flag any regional regulatory development, particularly in Indonesia, Thailand, and Vietnam
4. Watch fintech and digital financial services attach rates — the highest-margin revenue stream in the ecosystem
5. Alert on competitive pressure from TikTok Shop, Temu, and Chinese cross-border players entering SEA

NOVA (AI Semis):
1. Track AI accelerator demand signals: hyperscaler capex, model training cluster announcements, inference buildout
2. Monitor custom ASIC adoption (Google TPU, Amazon Trainium, Microsoft Maia) — the key threat to GPU incumbents
3. Flag any US export control tightening on advanced AI chips — China revenue exposure is a major risk factor
4. Watch HBM and CoWoS packaging supply constraints — they cap AI chip shipment volumes regardless of demand
5. Alert on any new architecture announcement, competitive benchmark result, or foundry yield milestone

FERRO (MLCCs):
1. Track EV and AI server MLCC content per unit — both are structural demand drivers with multi-year runways
2. Monitor MLCC pricing cycles — the market is highly cyclical and inventory corrections are sharp
3. Flag capacity utilisation at Murata and TDK — the two oligopoly leaders set industry pricing
4. Watch automotive qualification timelines — design wins take 18-24 months to reach revenue
5. Alert on any commodity pricing move for base metals (nickel, palladium) used in MLCC electrodes

RACK (Server ODMs):
1. Track AI server rack assembly volumes and GB200/GB300 NVL rack build rates — the primary growth driver
2. Monitor customer concentration: Nvidia allocations and hyperscaler direct orders determine revenue visibility
3. Flag any supply chain bottleneck (HBM, CoWoS, power components) that caps rack shipment capacity
4. Watch ASP trends for AI vs standard servers — mix shift to AI racks is the key margin expansion driver
5. Alert on any new hyperscaler vendor qualification, white-box design win, or direct ODM-to-cloud deal


---

#### Fix 4 — Image Attachments in Thread

OC must be able to attach images (charts, screenshots, research graphics) to messages. Images persist in the thread history and the agent can reason about them.

**Composer — desktop and mobile:**
- Add image attach button (📎) to the composer, left of the send button
- On click: opens native file picker. Accepts: `image/png`, `image/jpeg`, `image/webp`, `image/gif`
- Selected image shows as a thumbnail preview inside the composer before send
- OC can add optional text alongside the image
- On send: image + text sent as one message

**Message rendering:**
- OC messages with images display the image inline in the feed, full width of the message bubble, max-height `320px`
- Image appears above the text if both are present
- Click to expand to full size (lightbox)

**Storage:**
- On send, upload the image file to Supabase Storage bucket `sector-thread-images`
- Store the returned public URL in the message content object
- Thread history in Postgres stores the URL, not raw bytes
- On thread reload, images render from the URL

**Agent vision — API format:**

When OC sends a message containing an image, pass it to the Sector Lead Agent as a multimodal content array:

```python
{
    "role": "user",
    "content": [
        {
            "type": "image",
            "source": {
                "type": "url",
                "url": "<supabase_storage_public_url>"
            }
        },
        {
            "type": "text",
            "text": "<OC message text, may be empty string>"
        }
    ]
}
```

The agent can see and reason about the image. Subsequent messages in the thread may reference it ("the chart you shared earlier shows...").

**Mobile:** Image attach button visible in mobile composer. Tapping opens native photo picker or camera. Inline image display constrained to screen width.

---

#### Fix 5 — OC Identity (Replaces All "PM" References)

The user is **OC** throughout — in agent system prompts, UI labels, message attribution, and all copy. No reference to "PM" or "portfolio manager" anywhere.

**System prompt template in `config.py` / `sector_agent.py`:**

```python
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
```

**UI labels — all instances:**

| Location | Old label | New label |
|---|---|---|
| Sidebar footer | PM | OC |
| Message attribution | PM | OC |
| Right panel notes section | My Notes | OC's Notes |
| Mobile composer | (unchanged) | `Ask [DESIGNATION]...` |
| Thread message bubble header | PM | OC |

---

#### Mobile View — `/sectors` (Slack Mobile Pattern)

The Sectors page must be fully usable on mobile. **Only the Sectors page requires mobile optimisation** — no other pages need mobile treatment. Use the Slack iOS/Android app as the design reference.

**Breakpoint:** Apply mobile layout at `max-width: 768px`.

**Core principle — single-pane navigation with bottom tab bar:**

The three-pane desktop layout collapses into a single-pane view with a persistent bottom tab bar for switching between the three panels. This mirrors exactly how Slack mobile works: one pane visible at a time, bottom nav to switch.

```
┌─────────────────────────────┐
│  ← APEX  [sector name]  ⋮  │  ← top bar: back arrow + active sector + overflow menu
├─────────────────────────────┤
│                             │
│   [active pane content]     │
│   Feed / Agent / Coverage   │
│                             │
│                             │
│                             │
│                             │
│ ┌─────────────────────────┐ │
│ │ 💬 Ask [APEX]...    ➤  │ │  ← composer, always visible above bottom nav
│ └─────────────────────────┘ │
├──────┬──────────┬───────────┤
│  💬  │    🤖    │    📋     │  ← bottom tab bar
│ Feed │  Agent   │ Coverage  │
└──────┴──────────┴───────────┘
```

**Top bar:**
- Left: `←` back chevron → taps to open the sector selector drawer (replaces desktop sidebar)
- Centre: Active sector designation + name (e.g. "APEX · AU Enterprise Software")
- Right: `⋮` overflow menu → Run Sweep, View Notes

**Sector selector drawer:**
- Slides in from the left on tap of `←` (standard Slack channel list pattern)
- Full-height overlay showing all 7 sector channels with colour dot, name, company count, and unread badge
- Tap any sector to switch and dismiss the drawer
- Dismiss by swiping right or tapping outside

**Bottom tab bar (3 tabs):**

| Tab | Icon | Content |
|---|---|---|
| Feed | 💬 | The message feed — sweep cards, material findings, OC messages, agent replies |
| Agent | 🤖 | Agent profile + current sector view (posture, conviction, thesis, key drivers/risks) |
| Coverage | 📋 | Full company list with BULL/NEUT/BEAR badges, each tappable to company page |

**Feed tab (default):**
- Full-width scrollable message feed — same message types as desktop (Sweep, Material Finding, Sector View, OC, Agent Response)
- Cards stack vertically, full width, with slightly reduced padding
- Date dividers between days
- Material Finding cards retain the amber left accent bar
- Sweep cards collapse company rows behind a "Show all N companies" toggle to save vertical space — only Material and Incremental rows shown by default

**Composer (always visible above bottom nav):**
- Single-line input that expands to multi-line on focus
- Placeholder: `Ask APEX...` (agent name changes per active sector)
- Send button `➤` right-aligned
- On send: appends OC message to feed, shows "Thinking…" indicator, streams agent reply
- Supports `/view` and `/ask` prefix commands
- No attach button on mobile — keep it simple

**Agent tab:**
- Agent avatar/icon, designation, sector name, last sweep timestamp
- Posture badge (↑ Bullish / → Neutral / ↓ Bearish) + conviction stars
- Thesis text (full, scrollable)
- Key Drivers (up to 3) and Key Risks (up to 3) as compact list items
- "My Notes" section at bottom — OC's most recent logged view for this sector

**Coverage tab:**
- Vertically stacked list (not grid) of all companies in the sector
- Each row: Company name · Ticker · Signal badge (BULL / NEUT / BEAR)
- Full-width tappable rows → navigate to company page
- Stats bar at top: X Companies · X Bullish · X Neutral · X Bearish

**Stats bar:**
- Displayed as a compact horizontal scroll strip at the top of the Feed tab (below top bar)
- 5 pills: Companies · Bullish · Neutral · Bearish · Last Material
- Smaller font than desktop, no card borders — just inline pills

**Typography & spacing on mobile:**
- Reduce card padding from desktop values: `12px` horizontal, `10px` vertical
- Font sizes: headlines `14px`, body `13px`, timestamps/labels `11px` IBM Plex Mono
- Tap targets minimum `44px` height (iOS HIG standard)
- No hover states — replace with tap/active states

**Scroll behaviour:**
- Feed, Agent, and Coverage tabs each scroll independently
- Top bar and bottom tab bar are fixed — always visible
- Composer is fixed above the bottom tab bar — never scrolls away

**What to omit on mobile (not needed):**
- Right panel tabs (replaced by bottom tab bar)
- Desktop sidebar (replaced by drawer)
- Attach button in composer

### Highest Conviction Top 20 (Portfolio Constructor Page)

A ranked list of the 20 highest conviction Buy ideas from all covered companies, displayed on the **Portfolio Constructor page** (not the homepage). This list drives portfolio composition.

**Selection logic:**
1. Query all companies where `investment_view = 'bullish'` and `conviction = 'high'`
2. **Note:** High Conviction Buy is a rare rating — expect ~10% of coverage (~21 companies) at most to qualify at any time. The Top 20 list should therefore represent nearly all High Conviction names, not a subset of a much larger pool.
3. If more than 20 qualify, select the top 20 by most recent material finding (`last_material_at`) as a tiebreaker
4. If fewer than 20 high-conviction buys exist (which is expected and normal), fill remaining slots with medium-conviction bullish names, then low-conviction bullish names
5. If still fewer than 20, the list shows fewer than 20 (no padding with neutral/bearish names)

**Display columns:**
- **#** — Rank (1–20)
- **Company** — Clickable name linking to the company page
- **Ticker** — Exchange ticker
- **Rating** — Conviction level shown as stars: ★★★ (high), ★★☆ (medium), ★☆☆ (low)
- **Investment View** — Brief summary of the current thesis

**Data source:** Computed from the `companies` table (`investment_view`, `conviction`, `profile_json` for thesis summary). No additional data fetching required — this is a derived view of existing agent opinions.

**Refresh:** Recomputed whenever the Portfolio Constructor page loads (real-time from DB). Must be populated with the current top 20 high conviction buy rated stocks.

### Portfolio Constructor Page (`/portfolio`)

A model portfolio that tracks the performance of Kabuten's top 20 highest conviction ideas as an equal-weighted, long-only, USD-denominated portfolio.

**Portfolio Rules:**
- **Long-only**, equal-weighted at entry: 5% initial allocation to each of the 20 stocks
- **No rebalancing** — weights drift as prices move
- **Returns in USD** — all local currency returns converted to USD using daily FX rates
- **Inception date:** 9th February 2026 (all 20 positions entered on this date)
- **Composition driven by agents:** Individual company agents' views determine portfolio membership. If an agent downgrades a company (e.g. from bullish/high conviction to neutral or bearish), that stock is removed from the portfolio and replaced

**Composition changes:**
- When a stock is **removed** (downgraded below bullish threshold): its current weight is reallocated equally among replacement stock(s)
- When a stock is **added** (newly qualifies as top 20): it enters at the weight vacated by the removed stock
- If more than 20 companies qualify as highest conviction at any time, select the largest 20 by market cap
- If fewer than 20 qualify as highest conviction, backfill with other bullish-rated names (medium then low conviction)
- All changes are logged with timestamp, reason, entry/exit price

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  [Sticky nav toolbar]              Portfolio Constructor      │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  HIGHEST CONVICTION TOP 20                                    │
│  Top 20 highest conviction Buy ideas from all covered         │
│  companies, ranked 1–20                                       │
│  ┌───┬──────────────┬──────┬────────────────────────────────┐│
│  │ # │ Company      │Rating│ Investment View                ││
│  ├───┼──────────────┼──────┼────────────────────────────────┤│
│  │ 1 │ Advantest ↗  │ ★★★  │ HBM test demand...            ││
│  │ 2 │ SK Hynix ↗   │ ★★★  │ HBM leadership...             ││
│  │ 3 │ TSMC ↗       │ ★★★  │ N2 ramp + AI...               ││
│  │...│ ...          │ ...  │ ...                            ││
│  │20 │ Mediatek ↗   │ ★★☆  │ Edge AI SoC...                ││
│  └───┴──────────────┴──────┴────────────────────────────────┘│
│                                                               │
├──────────────────────────────┬───────────────────────────────┤
│                               │                               │
│  PORTFOLIO RETURNS            │  KABUTEN VIEW                 │
│  ┌─────┬─────┬─────┬───────┐ │  AI-generated summary of      │
│  │ 1D  │ 1W  │ 1M  │  3M   │ │  portfolio positioning,       │
│  │+0.3%│+1.2%│+4.5%│+11.2% │ │  sector tilts, key risks,    │
│  ├─────┼─────┼─────┼───────┤ │  and recent changes.          │
│  │ 1Y  │ 3Y  │ 5Y  │ Since │ │                               │
│  │ --  │ --  │ --  │Incep. │ │  Generated by Claude after    │
│  │     │     │     │ +4.5% │ │  each portfolio rebalance.    │
│  └─────┴─────┴─────┴───────┘ │                               │
│                               │                               │
├──────────────────────────────┴───────────────────────────────┤
│                                                               │
│  PORTFOLIO DETAILS (centered, full-width)                     │
│  ┌───┬──────────────┬────────┬────────┬───────────┬─────────┐│
│  │ # │ Company      │ Rating │Weight  │Date Entered│Return   ││
│  ├───┼──────────────┼────────┼────────┼───────────┼─────────┤│
│  │ 1 │ Advantest ↗  │ ★★★   │  5.8%  │2026-02-09 │ +16.2%  ││
│  │ 2 │ SK Hynix ↗   │ ★★★   │  5.4%  │2026-02-09 │ +8.1%   ││
│  │ 3 │ TSMC ↗       │ ★★★   │  5.6%  │2026-02-09 │ +12.4%  ││
│  │...│ ...          │ ...    │ ...    │ ...       │ ...     ││
│  │20 │ Mediatek ↗   │ ★★☆   │  4.7%  │2026-02-09 │ -5.8%   ││
│  └───┴──────────────┴────────┴────────┴───────────┴─────────┘│
│  ↗ = clickable, links to company page                        │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  PORTFOLIO CHANGE LOG                                         │
│  Full history of all portfolio changes                        │
│  ┌───────────┬──────────┬────────────────────────────────────┐│
│  │ Date      │ Action   │ Detail                             ││
│  ├───────────┼──────────┼────────────────────────────────────┤│
│  │ 2026-02-09│ INIT     │ Portfolio created: 20 stocks at 5% ││
│  │ 2026-03-15│ REMOVE   │ CompanyX removed: downgraded to    ││
│  │           │          │ neutral by agent. Exit: $45.20     ││
│  │ 2026-03-15│ ADD      │ CompanyY added: new high conviction││
│  │           │          │ buy. Entry: $112.40, weight: 4.8%  ││
│  └───────────┴──────────┴────────────────────────────────────┘│
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  CHAT WITH PORTFOLIO CONSTRUCTOR                              │
│  ┌───────────────────────────────────────────────────────────┐│
│  │  Ask Kabuten about the portfolio...                       ││
│  │                                                           ││
│  │  💬 "Why is Advantest your top pick right now?"           ││
│  │  🤖 "Advantest is ranked #1 because the agent detected   ││
│  │      a new HBM test platform win at SK Hynix last week,  ││
│  │      reinforcing the high conviction thesis on..."        ││
│  │                                                           ││
│  │  💬 "Are you considering any changes?"                   ││
│  │  🤖 "I'm watching two potential changes: CompanyX has    ││
│  │      seen weakening order data over the past 3 sweeps,   ││
│  │      which may lead to a downgrade. CompanyY recently     ││
│  │      upgraded to high conviction and could replace..."    ││
│  │                                                           ││
│  │  ┌─────────────────────────────────────┬───────────────┐ ││
│  │  │  Type your question...              │    Ask ▶      │ ││
│  │  └─────────────────────────────────────┴───────────────┘ ││
│  └───────────────────────────────────────────────────────────┘│
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Chat with Portfolio Constructor:**

An interactive chat interface where Oliver can ask Kabuten questions about the portfolio in natural language. Unlike the "Ask Kabuten" page (which searches across all company data), this chat is scoped specifically to the portfolio context.

**Context provided to Claude on each query:**
- Current portfolio holdings (all 20 stocks with weights, entry dates, returns)
- Recent portfolio change log (last 30 changes)
- Latest Kabuten View commentary
- Current investment views and conviction levels for all portfolio holdings
- Recent agent log entries for portfolio companies (last 7 days)
- Candidate companies that may be approaching the threshold for addition/removal

**Sample questions:**
- "Why is Advantest your top pick right now?"
- "Are you considering any changes to the portfolio?"
- "Which stocks are at risk of being removed?"
- "What's driving the underperformance this week?"
- "How exposed are we to the memory cycle?"
- "What would happen if China sanctions tighten?"

**Implementation:** Uses the same Claude API as Ask Kabuten but with a portfolio-specific system prompt and context injection. Conversation history is maintained for the session so follow-up questions work naturally.

**Returns calculation methodology:**

The portfolio tracks USD-denominated total returns from inception:

1. **Entry prices:** Record closing price in local currency + USD/local FX rate on date of entry for each stock
2. **Daily valuation:** During each daily sweep, fetch current prices (Yahoo Finance) and FX rates for all 20 holdings
3. **Per-stock return:** `(current_price_USD / entry_price_USD) - 1`
   - Where `price_USD = local_price × (1 / FX_rate)` (FX rate = units of local currency per 1 USD)
4. **Current weight:** `initial_weight × (1 + stock_return) / (1 + portfolio_return)`
5. **Portfolio return:** Weighted sum of individual returns using initial weights (since no rebalancing, this equals the sum of `initial_weight × stock_return` for each position)
6. **Period returns** (1D, 1W, 1M, etc.): Computed from stored daily portfolio NAV snapshots

**FX rates source:** Yahoo Finance currency pairs (e.g. `JPYUSD=X`, `KRWUSD=X`, `TWDUSD=X`, `CNYUSD=X`, `HKDUSD=X`, `INRUSD=X`, `AUDUSD=X`). US-listed stocks need no conversion.

**Kabuten View:** After each portfolio composition change or weekly on a schedule, Claude API generates a brief portfolio commentary covering: sector tilts, geographic exposure, key risks, recent performance drivers, and any notable concentration. Stored in the `portfolio_snapshots` table.

**Sweep integration:** Portfolio valuation runs as a final step after all company sweeps complete. A dedicated cron trigger at the end of the sweep window (e.g. 5:50 AM JST) fetches prices for all 20 holdings, computes returns, checks for any agent-driven composition changes, and stores the daily NAV snapshot.

---

## Database Schema

### `companies` table
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | Ticker (e.g. "8035") |
| name | TEXT | Company name |
| name_jp | TEXT | Japanese name |
| ticker_full | TEXT | Full ticker (e.g. "8035.T") |
| exchange | TEXT | Exchange code (e.g. "TSE", "NASDAQ", "KRX") |
| country | TEXT | Country code (e.g. "US", "Japan", "Korea", "Taiwan", "China", "HK", "India", "Australia") |
| classification | TEXT | Short sector label for homepage table (e.g. "Semiconductors", "E-commerce", "EVs", "Cloud/AI", "Semi Equipment") |
| market_cap_usd | REAL | Market cap in USD billions, refreshed during daily sweep via Yahoo Finance |
| benchmark_index | TEXT | Yahoo Finance ticker for local market index (e.g. "^TPX", "^GSPC", "^KS11") |
| sector | TEXT | Full sector/industry description |
| sector_group | TEXT | Sector Agent group — maps to sectors on `/sectors` page. One of: "Australia Enterprise Software", "China Digital Consumption", "Data-centre Power & Cooling", "India IT Services", "Memory Semiconductors", "Networking & Optics", "Semiconductor Production Equipment". NULL for companies not assigned to a sector. Used for: (1) sector peer context in sweeps, (2) Sector Agent page groupings. |
| profile_json | JSON | Full persistent company profile (thesis, model, valuation) |
| sweep_criteria_json | JSON | Daily sweep criteria config |
| investment_view | TEXT | Current view: "bullish" / "neutral" / "bearish" |
| conviction | TEXT | "high" / "medium" / "low" |
| last_sweep_at | TIMESTAMP | Last sweep completion time |
| last_material_at | TIMESTAMP | Last material finding time |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### `action_log` table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | Auto-increment |
| company_id | TEXT (FK) | Reference to companies |
| timestamp | TIMESTAMP | When the sweep ran |
| severity | TEXT | "no_change" / "incremental" / "material" |
| summary | TEXT | One-line summary |
| detail_json | JSON | Full structured brief (for notable/material) |
| sources_checked | JSON | List of sources that were checked |
| created_at | TIMESTAMP | |

### `sweep_data` table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | Auto-increment |
| company_id | TEXT (FK) | Reference to companies |
| source | TEXT | Source identifier |
| fetched_at | TIMESTAMP | When data was fetched |
| content_hash | TEXT | Hash to detect changes |
| content | TEXT | Raw fetched content |
| is_new | BOOLEAN | Whether this was new vs. previously seen |

### `ask_kabuten_log` table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | Auto-increment |
| question | TEXT | The question text asked by the user |
| source_scope | TEXT | "kabuten" / "claude" / "internet" / "all" |
| answer | TEXT | Claude-generated response |
| context_json | JSON | DB context used (matching companies, log entries) — for debugging/replay |
| asked_at | TIMESTAMP | When the question was asked |

### `podcast_episodes` table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | Auto-increment |
| podcast_name | TEXT | Podcast identifier (e.g. "all-in", "a16z") |
| episode_title | TEXT | Episode title |
| episode_date | DATE | Episode publish date |
| transcript_url | TEXT | URL to transcript source |
| insights_json | JSON | Extracted AI/semiconductor insights (bullet points, topics, quotes) |
| processed_at | TIMESTAMP | When Claude analyzed the transcript |

### `heatmap_snapshots` table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | Auto-increment |
| snapshot_date | DATE | Date of the heatmap snapshot |
| keyword | TEXT | Tracked keyword (e.g. "HBM", "TSMC", "AI agents") |
| top_posts_json | JSON | Top 5 posts by views (post URL, views, engagement) |
| current_views | INTEGER | Total views for top 5 posts today |
| avg_7d_views | INTEGER | Trailing 7-day average views |
| heat_score | REAL | Heat index (current / 7d avg — >1 = heating, <1 = cooling) |
| trend | TEXT | "heating" / "cooling" / "steady" |

### `portfolio_holdings` table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | Auto-increment |
| company_id | TEXT (FK) | Reference to companies |
| entry_date | DATE | Date entered portfolio (initial: 2026-02-09) |
| entry_price_local | REAL | Closing price in local currency on entry date |
| entry_fx_rate | REAL | USD/local FX rate on entry date |
| entry_price_usd | REAL | Computed: entry_price_local / entry_fx_rate |
| initial_weight | REAL | Starting weight (0.05 for 5%) |
| exit_date | DATE | NULL if still held, date if removed |
| exit_price_local | REAL | Closing price on exit date (NULL if held) |
| exit_price_usd | REAL | USD price on exit date (NULL if held) |
| exit_reason | TEXT | NULL, "downgrade", "replaced" |
| is_active | BOOLEAN | TRUE if currently in portfolio |

### `portfolio_snapshots` table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | Auto-increment |
| snapshot_date | DATE | Date of daily valuation |
| nav | REAL | Portfolio net asset value (starting at 100.0) |
| daily_return | REAL | 1-day portfolio return (%) |
| holdings_json | JSON | Snapshot of all holdings: company, weight, price_usd, return_since_entry |
| kabuten_view | TEXT | AI-generated portfolio commentary (updated on changes or weekly) |
| created_at | TIMESTAMP | |

### `portfolio_changes` table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER (PK) | Auto-increment |
| change_date | DATE | Date of portfolio change |
| action | TEXT | "INIT" / "ADD" / "REMOVE" |
| company_id | TEXT (FK) | Company added or removed |
| reason | TEXT | Why (e.g. "downgraded to neutral by agent", "new high conviction buy") |
| price_local | REAL | Price at time of change |
| price_usd | REAL | USD price at time of change |
| weight | REAL | Weight at time of entry/exit |
| created_at | TIMESTAMP | |

---

## Claude API Integration

### System Prompt Template (Daily Sweep)

```
You are a senior equity research analyst dedicated to covering {company_name} ({ticker}).

Your role is to conduct a daily sweep of new information and assess whether anything is material to the current investment thesis.

CURRENT INVESTMENT VIEW:
{investment_view_summary}

CURRENT VALUATION CONTEXT:
{valuation_data — current PER, PBR, 5yr range, forward EPS estimates}

CURRENT THESIS & KEY ASSUMPTIONS:
{thesis_and_assumptions}

DAILY SWEEP CRITERIA — FOCUS AREAS:
{sweep_criteria_bullets}

SECTOR PEER CONTEXT — RECENT FINDINGS FROM YOUR SECTOR:
{sector_peer_findings}
(Recent Incremental and Material findings from other companies in the same sector, last 7 days.
Use these to identify cross-company signals — e.g. a supply chain development at one company
may have implications for peers. Flag any connections you see.)

INSTRUCTIONS:
1. Review the new information provided below
2. Assess each item against the current thesis and focus areas
3. Consider valuation implications — does new information change the earnings outlook or make the current valuation more/less attractive?
4. Consider sector peer findings — do any recent developments at peer companies have read-through implications for this company?
4. Classify the overall sweep as: NO_CHANGE, INCREMENTAL, or MATERIAL
5. IMPORTANT: Apply a HIGH hurdle rate for MATERIAL classification. Most days should be NO_CHANGE. Information that merely confirms the existing thesis is INCREMENTAL at most, not MATERIAL. Only genuinely thesis-changing developments (major earnings surprises, structural competitive shifts, regulatory actions, management changes) qualify as MATERIAL. Price movements alone are never MATERIAL.
6. RATING DISCIPLINE: High Conviction Buy (bullish + high conviction) is a rare rating — no more than ~10% of the 230-company coverage universe should hold this rating at any time. Apply the highest bar before recommending this rating. It requires: strong fundamentals, supportive valuation, identifiable catalysts, AND genuine confidence in the outcome.
6. If INCREMENTAL or MATERIAL, provide a structured brief
7. If MATERIAL, recommend specific updates to the investment view or model
8. If updating the Investment View, you MUST include:
   - A thesis summary (max 100 words)
   - A valuation assessment (max 4 bullet points)
   - A conviction rationale (max 4 bullet points explaining WHY conviction is at this level)
9. If MATERIAL, also update the Narrative and Outlook boxes:
   - **Narrative**: earnings_trend (max 80 words), recent_newsflow (max 80 words, numbered items), long_term_trajectory (max 80 words)
   - **Outlook**: fundamentals (max 80 words), financials (max 80 words), risks (max 80 words)
   - Only regenerate sub-sections affected by the material change — leave unchanged sub-sections as-is
10. **FIRST-RUN RULE:** If the current Narrative or Outlook fields are empty/null (provided in context), you MUST generate all 6 sub-sections regardless of classification — even if NO_CHANGE. Base content on the current Investment View and company profile data.

Respond in the following JSON format:
{
  "classification": "NO_CHANGE" | "INCREMENTAL" | "MATERIAL",
  "summary": "One-line summary",
  "detail": {
    "what_happened": "...",
    "why_it_matters": "...",
    "valuation_impact": "...",
    "recommended_action": "...",
    "confidence": "high" | "medium" | "low",
    "sources": ["..."]
  },
  "suggested_profile_updates": { ... }, // only if MATERIAL — must include valuation_assessment and conviction_rationale
  "narrative_updates": { "earnings_trend": "...", "recent_newsflow": "...", "long_term_trajectory": "..." }, // if MATERIAL, or if current narrative is empty (first-run)
  "outlook_updates": { "fundamentals": "...", "financials": "...", "risks": "..." } // if MATERIAL, or if current outlook is empty (first-run)
}
```

### Model Selection
- **Daily sweeps**: `claude-sonnet-4-5-20250929` (cost-efficient for routine analysis)
- **Deep analysis / thesis changes**: `claude-opus-4-6` (triggered when material finding detected)
- **Web search**: Use Claude API with web search tool enabled for news, Twitter, analyst coverage

### Investment View — Generation & Update Process

The Investment View is the core output of each company's agent. It represents the current thesis, stance, and conviction level.

**Distribution guidance — High Conviction Buy is rare:**

The strongest rating — bullish stance with high conviction (i.e. "High Conviction Buy") — should be reserved for truly exceptional opportunities. As a rule of thumb, **no more than ~10% of the coverage universe** (~23 out of 230 companies) should carry a High Conviction Buy at any given time. If the number of High Conviction Buys drifts significantly above this threshold, Claude should apply greater scrutiny before assigning this rating and consider whether existing High Conviction names still deserve it.

This constraint ensures the rating carries real signal. A High Conviction Buy means: the fundamental thesis is strong, the valuation is supportive, the catalysts are identifiable, and the analyst has genuine confidence in the outcome. It is not a default for any company that looks reasonably attractive.

**Initial generation (at seeding):**

When a company is first seeded, Claude generates the initial Investment View using:
- System prompt: "You are a senior equity research analyst. Generate an initial investment view for {company_name} ({ticker}) based on current publicly available information."
- Claude uses web search to gather: recent earnings, analyst coverage, industry trends, competitive positioning, current valuation multiples, and forward earnings estimates
- Output format: Bull/Bear/Neutral stance, conviction level (high/medium/low), thesis summary (max 100 words), valuation assessment (max 4 bullet points), conviction rationale (max 4 bullet points)

**Daily review (during sweep):**

During each daily sweep, the Investment View is assessed but only updated when material information warrants it. **The bar for changing the Investment View is deliberately high** — most days should result in no change. The Investment View represents a considered, durable thesis that should not be whipsawed by routine news or minor data points.

1. The sweep executor loads the current Investment View from `profile_json`
2. New data from all sources is compared against the existing thesis and sweep focus criteria
3. Claude classifies the sweep as NO_CHANGE, INCREMENTAL, or MATERIAL
4. **If MATERIAL** (rare — expect this for a given company perhaps once every few weeks or months): Claude (escalated to Opus for quality) generates an updated Investment View, explaining what changed and why. The updated view replaces the previous one in `profile_json` and the change is logged in the Analyst Agent Log with full detail. The updated view must re-assess both valuation and conviction level.
5. **If INCREMENTAL**: The view is NOT changed. The observation is logged for context and may accumulate over time to eventually support a MATERIAL reassessment.
6. **If NO_CHANGE** (most common outcome): No update to the view; log entry records "no change"

**Required Investment View content — every view MUST include:**

1. **Thesis summary** (max 100 words): Concise investment case covering key drivers, risks, and catalysts. Must not exceed 100 words.

2. **Valuation assessment** (max 4 bullet points): Every Investment View must explicitly address valuation. Cover up to 4 of the following:
   - Is the stock cheap or expensive relative to its expected 2-year forward earnings trajectory?
   - How does the current PER/PBR compare to the 5-year historical trading range?
   - Is the valuation justified by the growth outlook, or is it stretched?
   - Are there valuation catalysts (re-rating potential) or risks (multiple compression)?

3. **Conviction rationale** (max 4 bullet points): Every Investment View must conclude with a clear explanation of WHY the conviction level is set where it is. Up to 4 bullet points covering what specifically drives the conviction level. Not just restating the stance — must explain the reasoning.

4. **Key drivers** (max 3 bullet points): The top 3 factors driving the investment case. Keep concise — one line each.

5. **Key risks** (max 3 bullet points): The top 3 risks to the thesis. Keep concise — one line each.

**Investment View content structure (stored in `profile_json.investment_view_detail`):**
```json
{
  "stance": "bullish" | "neutral" | "bearish",
  "conviction": "high" | "medium" | "low",
  "thesis_summary": "Concise investment thesis — max 100 words",
  "valuation_assessment": "Max 4 bullet points on current valuation",
  "conviction_rationale": "Max 4 bullet points explaining WHY conviction is at this level",
  "key_drivers": ["driver 1", "driver 2", "driver 3"],   // exactly 3 bullet points max
  "key_risks": ["risk 1", "risk 2", "risk 3"],           // exactly 3 bullet points max
  "catalysts": ["catalyst 1", "catalyst 2"],
  "last_updated": "2026-02-10T07:15:00Z",
  "last_updated_reason": "Material finding: HBM test platform win at SK Hynix"
}
```

**Narrative content (stored in `profile_json.narrative`):**
```json
{
  "earnings_trend": "Max 80 words — recent quarterly earnings trajectory",
  "recent_newsflow": "Max 80 words — key developments numbered (1), (2), (3)...",
  "long_term_trajectory": "Max 80 words — multi-year stock/business performance"
}
```

**Outlook content (stored in `profile_json.outlook`):**
```json
{
  "fundamentals": "Max 80 words — business description, products, market position",
  "financials": "Max 80 words — revenue, margins, valuation, balance sheet",
  "risks": "Max 80 words — key risk factors"
}
```

**Display on company page:** The Investment View box shows the stance (with arrow indicator), conviction stars, thesis summary (max 100 words), valuation assessment (max 4 bullets), key drivers (max 3 bullets), key risks (max 3 bullets), and concludes with the conviction rationale (max 4 bullets). The last-updated timestamp with reason is shown at the bottom. Positioned top-left on the desktop layout.

---

## Daily Sweep Criteria

### Tokyo Electron (8035.T)
**Focus:**
- Focus specifically on incremental order growth momentum and new business wins
- Monitor China revenue exposure and any regulatory/sanctions developments
- Track EUV-related deposition and coater/developer competitive positioning vs. ASML ecosystem

### Disco Corporation (6146.T)
**Focus:**
- Monitor advanced packaging order trends, particularly for AI chip dicing and grinding
- Track HBM (High Bandwidth Memory) related demand and Disco's positioning
- Watch for margin trends and any pricing power signals in precision cutting equipment

### Advantest (6857.T)
**Focus:**
- Track AI/HPC-related test demand, particularly for advanced SoC and HBM test systems
- Monitor new platform wins and competitive dynamics vs. Teradyne
- Watch for order intake trends and any signals on test intensity per transistor

### Accton Technology (2345.TW)
**Focus:**
- Track AI/data center networking switch demand, particularly 400G/800G adoption
- Monitor white-box/ODM market share trends vs. branded vendors (Arista, Cisco)
- Watch for hyperscaler customer concentration and new design wins

### Delta Electronics (2308.TW)
**Focus:**
- Track AI server power supply demand and data center thermal management orders
- Monitor EV/energy infrastructure segment growth trajectory
- Watch for margin expansion signals from higher-value product mix

### Eoptolink Technology (300502.SZ)
**Focus:**
- Track 800G/1.6T optical transceiver shipment ramp and customer wins
- Monitor competitive positioning vs. Zhongji Innolight in data center optics
- Watch for US/China trade restriction impacts on customer base

### Fabrinet (FN)
**Focus:**
- Track optical manufacturing volumes and new technology qualifications (silicon photonics, co-packaged optics)
- Monitor customer concentration (Nvidia, Lumentum) and diversification efforts
- Watch for capacity expansion plans and utilization trends

### GDS Holdings (9698.HK)
**Focus:**
- Track China data center demand driven by AI/cloud build-out
- Monitor new capacity additions, utilization rates, and pricing trends
- Watch for regulatory developments and competition from state-backed providers

### Hanwha Aerospace (012450.KS)
**Focus:**
- Track defense order book growth and new export contract wins
- Monitor aerospace engine development milestones and MRO revenue
- Watch for space/satellite segment developments and government funding

### Hitachi (6501.T)
**Focus:**
- Track Lumada (digital solutions/IoT) growth and recurring revenue trends
- Monitor power grid/energy infrastructure order momentum
- Watch for portfolio restructuring and margin improvement signals

### Hon Hai / Foxconn (2317.TW)
**Focus:**
- Track AI server assembly volumes (Nvidia GB200/GB300 rack builds)
- Monitor EV segment progress and customer diversification beyond Apple
- Watch for margin trends as product mix shifts toward higher-value AI hardware

### Isu Petasys (007660.KS)
**Focus:**
- Track high-layer-count PCB demand for AI servers and networking equipment
- Monitor order trends from major customers (Cisco, hyperscalers)
- Watch for capacity expansion and technology roadmap for next-gen substrates

### Lasertec (6920.T)
**Focus:**
- Track EUV mask inspection tool orders and market share vs. KLA
- Monitor High-NA EUV inspection system development timeline
- Watch for customer adoption rates of advanced inspection at leading foundries

### Lite-on Technology (2301.TW)
**Focus:**
- Track server power supply and SSD demand driven by AI build-out
- Monitor optoelectronics segment growth in automotive and industrial
- Watch for margin trends and product mix improvements

### Mediatek (2454.TW)
**Focus:**
- Track flagship mobile SoC market share gains vs. Qualcomm
- Monitor edge AI/on-device AI chip adoption and design wins
- Watch for automotive, IoT, and compute chip diversification progress

### Nanya Technology (2408.TW)
**Focus:**
- Track DRAM pricing and supply/demand balance signals
- Monitor technology migration progress (1α, 1β node transitions)
- Watch for HBM-related developments and potential partnership announcements

### Panasonic (6752.T)
**Focus:**
- Track battery business growth (automotive EV, energy storage systems)
- Monitor supply chain/factory automation segment performance
- Watch for strategic portfolio changes and margin improvement initiatives

### Rorze (6323.T)
**Focus:**
- Track semiconductor wafer handling robot orders tied to fab construction cycle
- Monitor market share in panel-level packaging automation
- Watch for new product launches and geographic expansion

### Samsung Electronics (005930.KS)
**Focus:**
- Track HBM3E/HBM4 qualification progress and market share vs. SK Hynix
- Monitor foundry yield improvements at 3nm/2nm and customer wins vs. TSMC
- Watch for memory pricing cycle and AI-driven demand signals

### Screen Holdings (7735.T)
**Focus:**
- Track semiconductor cleaning equipment orders and market share trends
- Monitor new tool qualifications at leading foundries and memory makers
- Watch for display equipment segment and any diversification moves

### SK Hynix (000660.KS)
**Focus:**
- Track HBM revenue growth and supply allocation to Nvidia/hyperscalers
- Monitor DRAM/NAND pricing trends and inventory levels
- Watch for capacity expansion plans and advanced packaging developments

### TSMC (2330.TW)
**Focus:**
- Track N3/N2 technology ramp and capacity utilization at advanced nodes
- Monitor AI accelerator wafer demand from Nvidia, AMD, Broadcom, and custom ASIC players
- Watch for overseas fab progress (Arizona, Kumamoto) and geopolitical risk developments

### Zhongji Innolight (300308.SZ)
**Focus:**
- Track 800G/1.6T optical module shipment volumes and customer diversification
- Monitor technology leadership in silicon photonics and LPO modules
- Watch for US entity list risk and supply chain localization efforts

---

## Design Notes

### Overall Aesthetic
- **Clean white, Google-esque design** — minimal, lots of whitespace, light backgrounds, crisp typography
- NOT dark/glassmorphism — the design language is clean, professional, and bright
- Light card surfaces with subtle borders or shadows
- San-serif body typography (Inter or similar)

### Background Wallpaper
The site name "Kabuten" is a portmanteau of **株 (kabu — stock)** and **天 (ten — heaven)**, meaning "stock heaven."

**IMPORTANT — FRESH START:** Remove any existing wallpaper implementation entirely. Start from scratch with the specification below.

**KNOWN BUG (current implementation):** The current wallpaper has a tiling defect where the first character 株 merges with a copy of itself at tile boundaries, producing ugly 株株 clusters instead of a clean 株天株天 repeating pattern. This happens because the tile/pattern edges are not properly aligned. The fix must ensure the pattern repeats **seamlessly** — every 株 must be followed by 天 and every 天 must be followed by 株, with no doubling at tile edges. Use a single continuous line of 株天株天株天... as the repeating unit, long enough that the seam is invisible, or use a CSS approach that avoids tile-edge collisions entirely.

- **Kanji couplet 株天** rendered as repeating lines of text covering the background of every page **except the password landing page**
- **Pattern**: Lines of 株天株天株天... repeating horizontally across each row, with rows stacked vertically to fill the full page
- **Color**: Very light grey (e.g. `#e0e0e0` or `rgba(0,0,0,0.07)`) — subtle background texture that does not compete with content. Should be barely visible, one shade lighter than the current implementation.
- **Coverage**: Must cover the **entire page background** on every page after login. Use CSS `background-repeat: repeat` or equivalent tiling approach that fills the viewport and extends as the page scrolls
- **Excluded from password gate:** The initial landing page (password entry screen) should have a **plain white background** with no wallpaper. The wallpaper only appears once the user has entered the password and is inside the site.
- **Placement**: Applied to the `<body>` or main layout background — visible in the white space around and between content boxes
- **Not inside boxes**: The wallpaper shows through the page background only. Content boxes/cards have their own **white/opaque backgrounds** so the wallpaper does not appear inside them. This makes the boxes stand out against the textured background.
- **Effect**: Creates a clean, continuous kanji texture behind all page content. The wallpaper is decorative — it should not compete with the content in the foreground boxes

### Kabuten Logo
The logo is the one standout visual element against the clean white design. It uses a premium metallic treatment with enhanced 3D depth:

- **Font**: Google Font — Orbitron
- **Hero logo** (homepage): 90px, large, centered
- **Navbar logo** (company pages / inner pages): 56px, smaller header placement
- **Metallic gradient**: Complete definition with 10 color stops transitioning from navy to gold
- **3D effect**: Enhanced drop shadows, layered text-shadow for depth and embossed look, subtle bevel simulation
- **Background shading**: Soft radial gradient or vignette behind the logo text for added dimensionality
- **Animation keyframes**: Two animations —
  - Organic glow (subtle pulsing luminance)
  - Metallic flow (gradient shift across the text)
- **Color reference guide**: Navy (#0a1628) → Steel Blue → Silver → Warm Gold (#c9a84c) spectrum

### Homepage Search Bar
- Positioned directly below the hero Kabuten logo on the homepage (below the navigation buttons)
- Google-style: large, centered, rounded, prominent
- Supports search by: **Code** (e.g. "8035"), **Company** (e.g. "Tokyo Electron"), **Theme** (e.g. "semiconductor equipment", "AI capex")
- Placeholder text: "Search by code, company, or theme..."
- **Autocomplete dynamically loaded from database** — scales automatically across all 230 covered companies

### Color Coding (Analyst Agent Log)
- ⚪ No Change — muted grey
- 🟡 Incremental — amber/warm
- 🔴 Material — red accent
- These severity indicators should feel at home in the clean white design (not garish)

### UI Patterns
- **Expandable log entries** — collapsed by default, click to see full brief
- **Two-column sweep criteria** — Sources on the left, Focus on the right. Focus bullets have an [Edit] button for inline editing. Sources column shows toggles for active sources and ✖ (Pending) labels for non-active sources.
- **Manual sweep trigger** — button to run an ad-hoc sweep outside the cron schedule
- **Last sweep timestamp** visible on each company's sweep criteria section and in the homepage table

---

## Build Phases

### Phase 1 — Foundation ✅ COMPLETE
- [x] Initialize GitHub repo and connect to Vercel
- [x] Project scaffolding (Next.js 16 + Tailwind v4)
- [x] PostgreSQL database setup (Neon via `@neondatabase/serverless`) with schema and seed data
- [x] Environment variables configured in Vercel (DATABASE_URL, ANTHROPIC_API_KEY)
- [x] KabutenLogo component (Orbitron font, metallic gradient, glow + flow animations, hero/navbar variants)
- [x] SearchBar component (mock — autocomplete against covered companies, search by code/name/theme)
- [x] Homepage with hero logo, search bar, company cards, and aggregated analyst agent log
- [x] Company pages with static/seeded data for all 23 covered companies
- [x] Clean white Google-esque design system (colors, spacing, card styles, typography)
- [x] Data layer abstraction (`data.ts`) with database-first, seed.json fallback pattern
- [x] Deploy to Vercel — site live with seeded data

### Phase 2 — Agent Core ✅ COMPLETE
- [x] Claude API integration (`claude.ts` — `webSearch()`, `analyzeSweep()`, `deepAnalysis()`)
- [x] Data fetching layer (7 fetchers: ir-page, edinet, news, twitter, reddit, price, industry)
- [x] Sweep execution pipeline (`executor.ts` — fetch → deduplicate via content hash → analyze → classify → store)
- [x] Action log read/write
- [x] Vercel Cron Job for daily sweeps (`vercel.json` cron config)
- [x] Deploy — live with working agent sweeps

### Phase 3 — Interactive Features ✅ COMPLETE
- [x] Editable Daily Sweep Criteria (inline editing on company page — source toggles + focus bullet editing)
- [x] Expandable analyst agent log entries
- [x] Manual sweep trigger button (with loading state, result display, auto-refresh)
- [x] Aggregated analyst agent log on homepage
- [x] Investment view display with last-updated metadata

### Phase 4 — Polish & Extend ✅ COMPLETE
- [x] Share price chart integration (TradingView advanced chart widget embed)
- [x] Earnings model display (financial table with revenue/profit/EPS + segment breakdown)
- [x] Valuation framework display (multiples grid, bull/base/bear scenarios, fair value)
- [x] Source-level sweep detail (which sources returned new data, displayed in analyst agent log)
- [ ] Export / notification features (deferred — lower priority)

### Phase 5 — Expansion & New Features
- [ ] **Password protection** — Simple password gate on homepage (`fingerthumb`), session cookie, `PasswordGate.tsx` + `auth.ts`
- [ ] **Sticky navigation toolbar** — All nav buttons (Agent Log, Ask Kabuten, Podcast Tracker, Social Heatmap, Sector Agent, Portfolio Constructor, Coverage Table) in a **sticky toolbar top-right** of every page. `position: sticky/fixed`, visible on scroll. Implement as shared `NavToolbar.tsx` in root layout.
- [ ] **Desktop-optimized company page** — Two-column layout: Investment View (top-left) + Analyst Agent Log (top-right), Daily Sweep Criteria centered below (two-column: Sources left, Focus right with Edit button). No mobile-responsive concerns — optimize for PC/desktop.
- [ ] **EDINET display** — Show green tick ☑ with "(Japan only)" label on all company pages. Greyed out for non-Japanese companies but still shows green tick.
- [ ] **Daily Sweep Criteria two-column layout** — Sources on the left column, Focus on the right column. Add [Edit] button to each Focus bullet point for inline editing. Sources shows ✖ (Pending) for Reddit, Bloomberg, Alphasense, Internal Research.
- [ ] **Earnings model reformat** — New columns: Period, Revenue, Rev Growth, Op. Profit, Op. Margin, Net Profit, NP Margin, EPS, EPS Growth. **All columns must be populated with actual data.** Add source explanation text at bottom: consensus estimates preferred, AI-generated forecasts as fallback with methodology explanation.
- [ ] **Valuation box upgrade** — 5-year PER/PBR historical trading range with high/low/average/current display + decile gauge visualization (cheap↔expensive vs history). Historic returns table (1D/1W/3M/1Y/3Y/5Y) showing company vs local index, refreshed daily via Yahoo Finance
- [ ] **Narrative & Outlook boxes on company page** — Two new full-width boxes below Daily Sweep Criteria, above Key Information. **Narrative box:** three sub-sections with coloured left borders — 📊 Earnings Trend (blue), 📰 Recent Newsflow (blue), 🌐 Long-term Trajectory (green). "AI-Estimated" badge top-right. **Outlook box:** three sub-sections — 🏗 Fundamentals (green border, green tint), 💰 Financials (yellow border, yellow tint), ⚠️ Risks (red border, pink tint). "AI-Estimated" badge top-right. Each sub-section max 80 words. Stored in `profile_json.narrative` and `profile_json.outlook`. Generated on initial company setup, refreshed only on Material sweep findings. See Narrative Box Specification and Outlook Box Specification in architecture doc for exact design.
- [ ] **Data sources update** — Reddit changed from Active to Pending (✖). All non-active sources labelled "(Pending)" instead of "Planned". Bloomberg, Alphasense, Internal Research all show ✖ (Pending).
- [ ] **Homepage simplified** — Homepage shows hero logo, search bar, and aggregated Analyst Agent Log only. Company table and Top 20 moved to dedicated pages. **Every company name in the Analyst Agent Log must be a clickable link** to that company's page.
- [ ] **Coverage Table market cap fix** — Market caps are currently **hardcoded static estimates** (all suspiciously round numbers like 3,400 / 200 / 180). Delete all static values and replace with **real live data** from Yahoo Finance `yfinance`. Validate a sample against known values. Show realistic precision (e.g. 3,487 not 3,400). Refresh during daily sweep.
- [ ] **Coverage Table page** (`/coverage`) — Dedicated page with sortable company table (Code, Company, Country, Classification, Mkt Cap USD bn, View, Conviction). **Sticky column headers** that remain visible on scroll. Each row clickable → company page. Filter bar at top.
- [ ] **Background wallpaper fresh start** — **Remove all existing wallpaper code first.** Then implement from scratch: very light grey 株天 kanji lines repeating across every page background **except the password landing page** (landing page gets plain white background). **Fix tiling bug:** current version has 株株 doubling at tile boundaries — the pattern must repeat seamlessly so every 株 is followed by 天 with no character doubling at seams. Use a long continuous 株天株天... string as the tile unit. Very light grey color (`#e0e0e0` or `rgba(0,0,0,0.07)`) — one shade lighter than current, should barely be visible. White opaque backgrounds on content boxes so wallpaper doesn't show inside them.
- [ ] **Analyst Agent Log page** (`/agent-log`) — Full searchable history of all agent actions, search by ticker/company/theme
- [ ] **Ask Kabuten page** (`/ask`) — **Fully wired and functional** Q&A interface. Two-column layout: **question history log on left sidebar** (all previous questions, newest first, clickable to reload Q&A, persisted in `ask_kabuten_log` DB table). Main Q&A area on right. Backend API route (`/api/ask/route.ts`) that queries DB + Claude API. Source toggle (Kabuten/Claude/Internet/All), sample questions.
- [ ] **Podcast Tracker page** (`/podcasts`) — Manual [Run Podcast Scan] button triggers server-side Claude API web search + transcript analysis for **11** tracked podcasts (added: Semi Doped). **Button must work without Chrome MCP**. **No dropdown chevrons** — each episode summary displayed fully expanded in sequential log format like social media thread. Newest at top — new summaries added to the top of the page. **Frozen header** (Run button + search bar sticky on scroll). **Two-column layout:** "Podcasts Tracked" list on the **left** (narrow, sticky, alphabetical), episode summaries log on the **right** (wide, scrollable, reverse chronological).
- [ ] **Sector Agent page** (`/sectors`) — New page. Implementation steps:
  1. **Add `sector_group` column** to `companies` table if not present (TEXT, nullable)
  2. **Seed sector_group values** for the 49 companies listed in the sector definitions table (see Sector Agent Page section). Set `sector_group` for each company to match exactly: "Australia Enterprise Software", "China Digital Consumption", "Data-centre Power & Cooling", "India IT Services", "Memory Semiconductors", "Networking & Optics", "Semiconductor Production Equipment". The remaining 181 companies get `sector_group = NULL`.
  3. **Create `sector-config.ts`** listing all 7 sector names — this is the master list of active sectors
  4. **Create `sector_views` and `sector_log` database tables** (schemas in architecture doc)
  5. **Build Sector Agent cron trigger** — a final cron trigger that runs AFTER all company sweep batches complete. For each sector in `sector-config.ts`: query today's sweep results from `action_log` for companies with matching `sector_group`, feed to Claude API with current sector view, store updated view in `sector_views` and log in `sector_log`
  6. **Build frontend** — single page with toggle buttons per sector, matching `sector-agent-mockup.html` design. Two-column layout (Sector Investment View + Sector Agent Log), stats row, companies grid. Page reads from `sector_views` and `sector_log` tables.
  7. **Generate initial Sector Investment Views** — on first run (or if `sector_views` is empty for a sector), Claude generates an initial sector view by reading the current Investment Views of all member companies. This ensures the page is populated after the first sweep.
  8. **Add "🏭 Sectors" to nav toolbar** on all pages
- [ ] **Social Heatmap page** (`/heatmap`) — **REBUILD FROM SCRATCH.** Existing implementation is broken. New methodology: **Chrome MCP required** (no fallback). Scan navigates X.com search for each of 40 keywords, reads view counts from top 3 posts, compares against 7-day rolling average to compute heat score (0–100). Button disabled when Chrome MCP not connected. Create `heatmap_snapshots` table, build API routes (`/api/heatmap/record`, `/api/heatmap/results`), build frontend matching `heatmap-mockup.html` design. See full methodology in Heatmap section.
- [ ] **Logo enhancement** — More 3D depth, enhanced metallic effect, background shading
- [ ] **Seed all 230 companies** — Build seed.json entries for all 230 companies listed in the Coverage section (105 US + 125 APAC), with ticker, exchange, sector, **sector_group**, profile, market_cap_usd, country, classification, and sweep criteria. Every company must have a `sector_group` value matching a sector defined in `sector-config.ts`. Update SearchBar to load from DB.
- [ ] **Sector peer context in sweeps** — Before each company's sweep, query `action_log` for Incremental/Material entries from companies in the same `sector_group` (last 7 days, max 10 entries). Inject as `{sector_peer_findings}` in the sweep prompt. See "Sector Peer Context" section for full spec.
- [ ] **Highest Conviction Top 20** — Moved to **Portfolio Constructor page** (not homepage). Ranked list of top 20 bullish ideas. Must be populated with current high conviction buy rated stocks.
- [ ] **Portfolio Constructor page** (`/portfolio`) — Top 20 list at top of page, then portfolio returns + Kabuten View, then holdings detail, change log, and chat. Make sure all data on the page is working. Model portfolio tracking top 20 ideas: equal-weighted long-only, USD-denominated, no rebalancing. Daily NAV snapshots via cron. Agent-driven rebalancing when views change.
- [ ] Deploy all Phase 5 features to Vercel

---

## File Structure (Actual)

```
kabuten-agentic/
├── src/
│   ├── app/
│   │   ├── globals.css               # Tailwind v4 @theme inline, logo animations, kanji wallpaper
│   │   ├── layout.tsx                # Root layout (Inter + Orbitron fonts), password gate wrapper
│   │   ├── page.tsx                  # Homepage
│   │   ├── company/
│   │   │   └── [ticker]/
│   │   │       └── page.tsx          # Company page (desktop two-column layout)
│   │   ├── agent-log/
│   │   │   └── page.tsx              # Full Analyst Agent Log page (searchable history)
│   │   ├── ask/
│   │   │   └── page.tsx              # Ask Kabuten Q&A page
│   │   ├── podcasts/
│   │   │   └── page.tsx              # Podcast Tracker page
│   │   ├── heatmap/
│   │   │   └── page.tsx              # Social Heatmap page
│   │   ├── sectors/
│   │   │   └── page.tsx              # Sector Agent page (7 sectors with toggle buttons)
│   │   ├── portfolio/
│   │   │   └── page.tsx              # Portfolio Constructor page
│   │   └── api/
│   │       ├── auth/route.ts         # POST — password verification
│   │       ├── seed/route.ts         # POST — seed/reseed database from seed.json
│   │       ├── sweep/
│   │       │   ├── run/route.ts      # POST/GET — trigger sweep (manual or cron)
│   │       │   └── status/route.ts   # GET — sweep status per company
│   │       ├── companies/
│   │       │   ├── route.ts          # GET — all companies
│   │       │   └── [id]/route.ts     # GET — single company
│   │       ├── action-log/
│   │       │   └── route.ts          # GET — action log (optional companyId filter, search)
│   │       ├── criteria/
│   │       │   └── [id]/route.ts     # GET/PUT — sweep criteria CRUD
│   │       ├── ask/route.ts          # POST — Ask Kabuten query (source toggle: kabuten/claude/internet/all)
│   │       ├── podcasts/
│   │       │   ├── run/route.ts      # POST — manual trigger for podcast transcript fetch + analysis
│   │       │   └── route.ts          # GET — podcast episodes and insights
│   │       └── heatmap/
│   │           ├── run/route.ts      # POST — manual trigger: starts Chrome MCP scan of X.com
│   │           └── route.ts          # GET — heatmap snapshot data and history
│   │       ├── sectors/
│   │       │   ├── route.ts          # GET — all sector views and latest log entries
│   │       │   └── assess/route.ts   # POST — trigger sector agent assessment (called after daily sweep)
│   │       ├── portfolio/
│   │       │   ├── route.ts          # GET — current portfolio holdings, returns, change log
│   │       │   ├── rebalance/route.ts # GET — cron trigger: check agent views, rebalance if needed
│   │       │   ├── snapshot/route.ts # GET — cron trigger: daily NAV snapshot + price fetch
│   │       │   └── chat/route.ts    # POST — Chat with Portfolio Constructor (Claude API with portfolio context)
│   ├── lib/
│   │   ├── db.ts                     # PostgreSQL connection, queries, schema init
│   │   ├── data.ts                   # Data fetching layer (DB-first, seed.json fallback)
│   │   ├── claude.ts                 # Claude API wrapper (webSearch, analyzeSweep, deepAnalysis, askKabuten)
│   │   ├── auth.ts                   # Password gate logic (session cookie management)
│   │   ├── portfolio.ts              # Portfolio engine: top-20 selection, returns calc, rebalancing, NAV tracking
│   │   └── sweep/
│   │       ├── executor.ts           # Main sweep orchestrator
│   │       ├── podcast-processor.ts  # Podcast transcript fetch (Claude API web search primary → metacast.app optional → podscripts.co backup) + Claude analysis. 11 podcasts.
│   │       ├── heatmap-collector.ts  # Keyword buzz scan via Claude API web search (primary) + optional Chrome MCP for enhanced X.com data
│   │       ├── sector-agent.ts      # Sector Agent cron trigger: calls KabutenOrchestrator.sweep_all() after company batches, persists thread histories
│   │       └── fetchers/             # Data source fetchers
│   │           ├── ir-page.ts        # Direct fetch with HTML stripping
│   │           ├── edinet.ts         # EDINET API v2
│   │           ├── news.ts           # Claude web search
│   │           ├── twitter.ts        # Claude web search
│   │           ├── reddit.ts         # Reddit OAuth2 API + Claude web search fallback (Pending — API not yet configured)
│   │           ├── price.ts          # Claude web search
│   │           ├── industry.ts       # Claude web search
│   │           ├── financial-data.ts # Unified financial data router (market → source)
│   │           ├── yahoo-finance.ts  # Yahoo Finance: prices, estimates, EPS history (all markets)
│   │           ├── kabutan.ts        # Kabutan.jp scraper: Japan company financials
│   │           └── naver-finance.ts  # Naver Finance scraper: Korea company financials
│   └── components/
│       ├── ActionLog.tsx             # Expandable log entries with source-level detail
│       ├── CompanyTable.tsx          # Homepage sortable company table (Code, Name, Country, Classification, Mkt Cap, View, Conviction)
│       ├── InvestmentView.tsx        # Thesis, assumptions, risks display
│       ├── KabutenLogo.tsx           # Metallic gradient logo (hero/navbar variants, 3D depth)
│       ├── NavButtons.tsx            # Horizontal navigation buttons (Agent Log, Ask Kabuten, Podcast Tracker, Social Heatmap, Sector Agent, Portfolio Constructor)
│       ├── PasswordGate.tsx          # Password input overlay (client component)
│       ├── TopConviction.tsx         # Highest Conviction Top 20 ranked list (homepage box)
│       ├── PortfolioReturns.tsx      # Portfolio returns grid (1D/1W/1M/3M/1Y/3Y/5Y/inception)
│       ├── PortfolioDetails.tsx      # Portfolio holdings table with clickable company links
│       ├── PortfolioChangeLog.tsx    # Historic portfolio change log
│       ├── PortfolioChat.tsx         # Chat interface for portfolio Q&A (client component, session history)
│       ├── SearchBar.tsx             # Autocomplete search (230 companies, loaded from DB)
│       ├── SweepCriteria.tsx         # Two-column layout: Sources (left) + Focus with Edit button (right). Client component.
│       ├── ManualSweepButton.tsx     # Ad-hoc sweep trigger (client component)
│       ├── EarningsModel.tsx         # Financial table with all columns populated. Source explanation text at bottom (consensus or AI-generated).
│       ├── ValuationBox.tsx          # 5yr PER/PBR historical trading range (high/low/avg/current), decile gauge, historic returns table (company vs index), multiples, scenarios, fair value
│       └── SharePriceChart.tsx       # TradingView widget embed (client component)
├── agents/                           # Python multi-agent package (Sector Agent system)
│   ├── __init__.py                   # Package exports
│   ├── config.py                     # All 7 sector + 48 company definitions — SINGLE SOURCE OF TRUTH
│   ├── company_agent.py              # CompanyCoverageAgent: sub-agent, structured JSON, web search, effort scaling
│   ├── sector_agent.py               # SectorLeadAgent: orchestration, context compaction, persistent chat thread
│   └── orchestrator.py               # KabutenOrchestrator: top-level manager, concurrent sweeps, chat routing
├── data/
│   └── seed.json                     # Company data (230 companies): ticker, exchange, sector, country, classification, market_cap_usd, action log, earnings, valuation
├── package.json
├── tsconfig.json
├── next.config.ts
└── vercel.json                       # Vercel config (29 staggered cron triggers for sweeps + portfolio + sector agent; podcast + heatmap are manual)
```

**Notes on file structure vs. original spec:**
- No `tailwind.config.ts` — Tailwind v4 uses `@theme inline {}` in `globals.css`
- No `analyzer.ts` — analysis logic merged into `claude.ts`
- No `schema.ts` — schema/migrations merged into `db.ts`
- Added `data.ts` — abstraction layer for DB-first with seed.json fallback
- Added `ManualSweepButton.tsx` — not in original spec file list
- Added `seed/route.ts` — API endpoint for seeding/reseeding the database
- Added `auth.ts` + `PasswordGate.tsx` + `api/auth/route.ts` — password protection
- Added `CompanyTable.tsx` — replaces `CompanyCard.tsx`; sortable table with Code, Name, Country, Classification, Mkt Cap, View, Conviction
- Added `NavButtons.tsx` — horizontal navigation buttons for new pages
- Added `reddit.ts` fetcher — Reddit OAuth2 API with web search fallback
- Added `financial-data.ts`, `yahoo-finance.ts`, `kabutan.ts`, `naver-finance.ts` — market-specific financial data fetchers for earnings/valuation
- Added `podcast-processor.ts` + `heatmap-collector.ts` — new feature processors
- Added 4 new page routes: `/agent-log`, `/ask`, `/podcasts`, `/heatmap`
- Added 4 new API route groups: `ask/`, `podcasts/`, `heatmap/`, `auth/`
- Added `portfolio.ts` — portfolio engine (top-20 selection, returns, rebalancing, NAV)
- Added `TopConviction.tsx`, `PortfolioReturns.tsx`, `PortfolioDetails.tsx`, `PortfolioChangeLog.tsx` — portfolio components
- Added `agents/` Python package — multi-agent sector system (APEX/ORIENT/VOLT/INDRA/HELIX/PHOTON/FORGE) with persistent threads, context compaction, and OC chat
- Added `/portfolio` page route + `portfolio/` API route group (holdings, rebalance, snapshot)

---

## Key Decisions — Resolved

1. **Claude API web search** — Uses `web_search_20250305` tool with `max_uses: 3` and `max_tokens: 2048` per call. Web search fetchers run sequentially with 2s delays to stay within rate limits (30k input tokens/min). Content truncated to ~4000 chars per source before analysis.
2. **IR page scraping** — Resolved: lightweight `fetch()` with HTML tag stripping. Puppeteer is incompatible with Vercel serverless. IR page URLs are hardcoded per company in `ir-page.ts`.
3. **Twitter/X data** — Resolved: using Claude API web search only (no MCP integration). Searches for recent tweets/posts about each company.
4. **Cost management** — Resolved: sequential web search fetchers, content truncation, conservative token limits. **Sweep frequency split: non-US companies (125) swept daily, US companies (105) swept weekly (Sundays only) — ~40% cost reduction.** Sweeps are staggered across batches of 8 companies to stay within Vercel's 5-minute serverless timeout. Investment View content limits enforced: thesis 100 words, valuation 4 bullets, key drivers 3 bullets, key risks 3 bullets, conviction rationale 4 bullets.
5. **Profile evolution** — The persistent company profile is stored as `profile_json` in the database. Currently manageable size. Strategy for summarization/compression to be implemented if profiles grow beyond context limits.
6. **Vercel deployment** — GitHub repo connected to Vercel. Environment variables (ANTHROPIC_API_KEY, DATABASE_URL) configured in Vercel dashboard. 29 staggered cron triggers at 10-min intervals (17:00 UTC onwards, i.e. 2:00 AM JST onwards) each hitting `GET /api/sweep/run?batch=N`. Dynamic batching: companies are loaded from DB, sorted by ID, sliced into groups of 8. **Sweep frequency: non-US companies daily, US companies Sundays only.** The sweep route checks each company's country field to determine eligibility on a given day.
7. **Database** — Using Neon Postgres via `@neondatabase/serverless`. `@vercel/postgres` is deprecated. Neon integration set up via Vercel dashboard (requires accepting terms manually). Seed data fallback pattern ensures app works without DATABASE_URL.
8. **JSON parsing** — Claude API frequently wraps JSON responses in markdown code fences. All parsers include regex fallback: `rawText.match(/\{[\s\S]*\}/)`.

## Open Questions

1. **Export / notification features** — Deferred from Phase 4. Could include email alerts on material findings, PDF export of company reports, or webhook integrations.
2. **Profile compression** — As sweep history grows, may need a strategy for summarizing older profile data to keep within Claude's context limits.
3. **Company coverage seeding** — The definitive 230-company list is now specified in the Coverage section. Each company requires: seed data entry in seed.json with ticker, exchange, sector, profile, sweep criteria. Japanese-listed companies also need EDINET codes. All 230 companies must have company pages built.
4. **Bloomberg Terminal integration** — Oliver has a Bloomberg Terminal subscription but integration is on ice. When activated, could provide consensus data (replacing free-tier scraping), sell-side research alerts, and real-time pricing. Potential approaches: B-PIPE, BLPAPI, or email alert parsing.
5. **Alphasense integration** — No current access. Would provide earnings transcripts, expert call summaries, and filings search. Requires Alphasense API key or account.
6. **Reddit API setup** — Oliver needs to create the Reddit API app at reddit.com/prefs/apps and add the 4 env vars to Vercel before the Reddit fetcher goes live. Until then, falls back to Claude web search for Reddit content.
7. **Podcast transcript sourcing** — Resolved: Claude API web search as primary source (all 11 podcasts, server-side, no browser dependency). metacast.app as optional enhancement via Chrome MCP (higher quality full transcripts). podscripts.co as additional backup (6/11 podcasts, direct fetch). Manual trigger only via [Run Podcast Scan] button. Added Semi Doped as 11th podcast.
8. **Social Heatmap X.com access** — Resolved: Claude API web search as primary (server-side, no browser dependency). Chrome MCP as optional enhancement for direct X.com browsing with actual view counts (requires Oliver's browser open + logged into X.com). Both Podcast Scan and Heatmap Scan buttons must function without Chrome MCP.
9. **Financial data scraping reliability** — Free sources (Kabutan.jp, Naver Finance, Goodinfo.tw, East Money) may change their HTML structure or block automated requests. Need monitoring and fallback strategy. Yahoo Finance (`yfinance`) is the most stable free source but has known rate-limiting issues at scale.
10. **Valuation historical data completeness** — Yahoo Finance covers most tickers globally but some smaller APAC companies may have incomplete EPS/BPS history. May need manual seeding for companies with sparse data.

---

*This document serves as the architecture reference for Agentic Kabuten. Phases 1–4 are complete and deployed at https://kabuten-agentic.vercel.app. Phase 5 (expansion and new features) is in progress. The GitHub repo is at https://github.com/xocrevilo-hash/kabuten-agentic.*
