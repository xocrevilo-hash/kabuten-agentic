import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/migrate
 * Lightweight migration endpoint — applies schema changes and data fixes
 * without touching the full company seed data.
 *
 * Safe to call multiple times (idempotent).
 *
 * Fixes applied:
 * 1. Creates sector_briefs table if not exists
 * 2. Seeds default investment mandate bullets for all 17 sectors (DO NOTHING on conflict)
 * 3. Fixes Quanta Computer (2382_TW) sector_group = 'Server ODMs'
 * 4. Ensures sector_agent_threads row exists for all 17 sectors including RACK
 */
export async function POST() {
  try {
    const { getDb } = await import("@/lib/db");
    const sql = getDb();

    // 1. Create sector_briefs table
    await sql`
      CREATE TABLE IF NOT EXISTS sector_briefs (
        sector_key TEXT PRIMARY KEY,
        bullet_1 TEXT NOT NULL,
        bullet_2 TEXT NOT NULL,
        bullet_3 TEXT NOT NULL,
        bullet_4 TEXT NOT NULL,
        bullet_5 TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // 2. Seed default briefs for all 17 sectors
    const briefSeeds: [string, string, string, string, string, string][] = [
      ['au_enterprise_software',
        'Track ARR growth and net revenue retention — the two metrics that determine long-term compounding',
        'Monitor competitive displacement of legacy on-premise systems by SaaS players',
        'Flag any pricing power evidence: seat expansion, ARPU growth, upsell rates',
        'Watch US/global expansion progress — TAM extension is the key re-rating catalyst',
        'Alert on any earnings guidance revision, analyst upgrade cycle, or multiple expansion triggers'],
      ['china_digital_consumption',
        'Track monthly active user trends and monetisation rates across e-commerce and entertainment',
        'Monitor regulatory shifts from Beijing — platform economy rules are the dominant risk factor',
        'Flag any evidence of consumer spending recovery in China\'s domestic economy',
        'Watch competitive dynamics between platforms: who is taking share in AI-native features',
        'Alert on any ADR delisting risk, geopolitical escalation, or US-China trade policy impact'],
      ['dc_power_cooling',
        'Track hyperscaler capex announcements — they are the primary demand signal for power and cooling equipment',
        'Monitor AI data centre buildout pace: rack density increases drive cooling intensity non-linearly',
        'Flag any utility-scale power constraint news — grid bottlenecks are the key sector risk',
        'Watch order backlog and lead time data — supply constraints drive margin expansion',
        'Alert on new product cycles: liquid cooling, direct-to-chip, and high-density UPS adoption curves'],
      ['india_it_services',
        'Track deal TCV (total contract value) and large deal wins — leading indicator of revenue 12-18 months out',
        'Monitor AI services adoption within existing client bases — the key re-rating narrative',
        'Flag rupee/USD FX moves and their margin impact for USD-revenue, INR-cost businesses',
        'Watch headcount and attrition data — execution capacity determines revenue conversion',
        'Alert on US visa policy changes, client budget freeze signals, or vertical-specific slowdowns'],
      ['memory_semis',
        'Track HBM allocation and pricing — AI server demand is driving a structural premium over commodity DRAM',
        'Monitor DRAM and NAND contract price trends — the primary earnings swing factor',
        'Flag any capacity addition announcements: new fabs or technology node transitions affect supply balance',
        'Watch inventory levels across the supply chain — overhang signals are a leading warning indicator',
        'Alert on customer concentration risk (Nvidia, hyperscalers) or geopolitical supply disruption'],
      ['networking_optics',
        'Track hyperscaler fibre and optical transceiver orders — 800G/1.6T adoption is the key growth vector',
        'Monitor silicon photonics adoption curve — this determines which vendors gain structural share',
        'Flag any co-packaged optics (CPO) milestone: a technology transition that reshapes the competitive landscape',
        'Watch capacity utilisation and ASP trends — pricing power confirms genuine demand vs inventory restocking',
        'Alert on any new datacom standard adoption, competitor product launch, or key customer design win'],
      ['semi_equipment',
        'Track WFE (wafer fab equipment) spending guidance from TSMC, Samsung, and Intel — the primary demand driver',
        'Monitor export control developments: US restrictions on China sales are the dominant sector risk',
        'Flag technology inflection points: High-NA EUV ramp, GAA adoption, advanced packaging intensity increases',
        'Watch order book and book-to-bill ratio — leading indicators of revenue 6-12 months ahead',
        'Alert on any capacity expansion announcement, customer fab delay, or competitive displacement news'],
      ['ev_supply_chain',
        'Track EV penetration rates by market: China, Europe, and US are the three key demand theatres',
        'Monitor battery cost per kWh trends — cost parity with ICE is the structural inflection point',
        'Flag any government subsidy change, EV mandate policy, or tariff development in major markets',
        'Watch vertically integrated players (BYD, Tesla) vs supply chain specialists — margin flow matters',
        'Alert on raw material price moves (lithium, cobalt, nickel) and their battery cost pass-through impact'],
      ['china_ai_apps',
        'Track daily/monthly active users and revenue per user — commercial scale is the key validation metric',
        'Monitor foundation model benchmark performance vs US peers — technical parity is the re-rating catalyst',
        'Flag any regulatory development from Beijing\'s AI governance framework — approval cycles affect deployment',
        'Watch gross margin trajectory — inference cost reduction determines path to profitability',
        'Alert on any enterprise contract win, government deployment, or overseas market expansion evidence'],
      ['china_semis',
        'Track domestic chip substitution progress — government mandates are accelerating adoption curves',
        'Monitor US Entity List additions and export control expansions — the dominant sector risk',
        'Flag any technology node advancement: closing the gap with TSMC/Samsung is the structural thesis',
        'Watch government subsidy flows and state-backed capex commitments — funding visibility matters',
        'Alert on any foundry capacity utilisation data, yield improvement milestones, or customer design wins'],
      ['japan_materials',
        'Track semiconductor materials supply tightness — Japan controls critical chokepoints in the global chip supply chain',
        'Monitor export control developments from Japan\'s METI — materials restrictions have global ripple effects',
        'Flag customer inventory drawdown signals — semiconductor materials demand lags equipment by 1-2 quarters',
        'Watch yen moves and their impact on USD-reported margins for Japan-headquartered exporters',
        'Alert on any capacity expansion, new material qualification, or customer concentration shift'],
      ['gaming',
        'Track software title release schedules and attach rates — IP launches are the primary earnings catalyst',
        'Monitor console hardware cycle timing: next-gen transitions create both opportunity and disruption',
        'Flag mobile gaming monetisation trends — in-app purchase and live service revenue are the recurring base',
        'Watch AI-assisted game development adoption — cost reduction and release cadence improvement',
        'Alert on any major studio acquisition, competitive platform shift, or regulatory change on loot boxes/monetisation'],
      ['pcb_supply_chain',
        'Track AI server PCB and IC substrate order volumes — this is the highest-value tier of the supply chain',
        'Monitor substrate technology transitions: ABF (Ajinomoto Build-up Film) capacity is the bottleneck',
        'Flag customer concentration risk — a handful of hyperscalers and chipmakers dominate demand',
        'Watch lead times and ASP trends for high-layer-count PCBs — pricing power reflects genuine demand',
        'Alert on any new substrate technology qualification, capacity expansion, or competitive displacement'],
      ['asean_ecommerce',
        'Track GMV growth and take rate expansion — the two levers that compound into earnings power',
        'Monitor path to profitability: both Grab and Sea have moved from growth-at-all-costs to margin discipline',
        'Flag any regional regulatory development, particularly in Indonesia, Thailand, and Vietnam',
        'Watch fintech and digital financial services attach rates — the highest-margin revenue stream in the ecosystem',
        'Alert on competitive pressure from TikTok Shop, Temu, and Chinese cross-border players entering SEA'],
      ['ai_semis',
        'Track AI accelerator demand signals: hyperscaler capex, model training cluster announcements, inference buildout',
        'Monitor custom ASIC adoption (Google TPU, Amazon Trainium, Microsoft Maia) — the key threat to GPU incumbents',
        'Flag any US export control tightening on advanced AI chips — China revenue exposure is a major risk factor',
        'Watch HBM and CoWoS packaging supply constraints — they cap AI chip shipment volumes regardless of demand',
        'Alert on any new architecture announcement, competitive benchmark result, or foundry yield milestone'],
      ['mlccs',
        'Track EV and AI server MLCC content per unit — both are structural demand drivers with multi-year runways',
        'Monitor MLCC pricing cycles — the market is highly cyclical and inventory corrections are sharp',
        'Flag capacity utilisation at Murata and TDK — the two oligopoly leaders set industry pricing',
        'Watch automotive qualification timelines — design wins take 18-24 months to reach revenue',
        'Alert on any commodity pricing move for base metals (nickel, palladium) used in MLCC electrodes'],
      ['server_odms',
        'Track AI server rack assembly volumes and GB200/GB300 NVL rack build rates — the primary growth driver',
        'Monitor customer concentration: Nvidia allocations and hyperscaler direct orders determine revenue visibility',
        'Flag any supply chain bottleneck (HBM, CoWoS, power components) that caps rack shipment capacity',
        'Watch ASP trends for AI vs standard servers — mix shift to AI racks is the key margin expansion driver',
        'Alert on any new hyperscaler vendor qualification, white-box design win, or direct ODM-to-cloud deal'],
    ];

    let briefsSeeded = 0;
    for (const [key, b1, b2, b3, b4, b5] of briefSeeds) {
      await sql`
        INSERT INTO sector_briefs (sector_key, bullet_1, bullet_2, bullet_3, bullet_4, bullet_5)
        VALUES (${key}, ${b1}, ${b2}, ${b3}, ${b4}, ${b5})
        ON CONFLICT (sector_key) DO NOTHING
      `;
      briefsSeeded++;
    }

    // 3. Fix Quanta Computer (2382_TW) sector_group
    const quantaFix = await sql`
      UPDATE companies
      SET sector_group = 'Server ODMs'
      WHERE id = '2382_TW' AND (sector_group IS NULL OR sector_group != 'Server ODMs')
      RETURNING id
    `;

    // 3b. Fix VOLT sector_group: remove Vistra (VST), add Vertiv (VRT) and Lite-On (2301)
    await sql`
      UPDATE companies SET sector_group = NULL
      WHERE id = 'VST' AND sector_group = 'dc_power_cooling'
    `;
    await sql`
      UPDATE companies SET sector_group = 'dc_power_cooling'
      WHERE id IN ('VRT', '2301')
        AND (sector_group IS NULL OR sector_group != 'dc_power_cooling')
    `;

    // 3c. Backfill country from exchange for any APAC companies where country is NULL/empty.
    // This covers the case where companies were seeded before the country column was added.
    await sql`UPDATE companies SET country = 'Japan'      WHERE exchange = 'TSE'              AND (country IS NULL OR country = '')`;
    await sql`UPDATE companies SET country = 'Taiwan'     WHERE exchange = 'TWSE'             AND (country IS NULL OR country = '')`;
    await sql`UPDATE companies SET country = 'Korea'      WHERE exchange = 'KRX'              AND (country IS NULL OR country = '')`;
    await sql`UPDATE companies SET country = 'Hong Kong'  WHERE exchange = 'HKEX'             AND (country IS NULL OR country = '')`;
    await sql`UPDATE companies SET country = 'China'      WHERE exchange IN ('SSE', 'SZSE')   AND (country IS NULL OR country = '')`;
    await sql`UPDATE companies SET country = 'India'      WHERE exchange = 'NSE'              AND (country IS NULL OR country = '')`;
    await sql`UPDATE companies SET country = 'Australia'  WHERE exchange = 'ASX'              AND (country IS NULL OR country = '')`;

    // 4. Ensure all 17 sector_agent_threads rows exist (including RACK)
    const agentSeeds: [string, string][] = [
      ['au_enterprise_software', 'APEX'],
      ['china_digital_consumption', 'ORIENT'],
      ['dc_power_cooling', 'VOLT'],
      ['india_it_services', 'INDRA'],
      ['memory_semis', 'HELIX'],
      ['networking_optics', 'PHOTON'],
      ['semi_equipment', 'FORGE'],
      ['ev_supply_chain', 'SURGE'],
      ['china_ai_apps', 'SYNTH'],
      ['china_semis', 'DRAGON'],
      ['japan_materials', 'TERRA'],
      ['gaming', 'PIXEL'],
      ['pcb_supply_chain', 'LAYER'],
      ['asean_ecommerce', 'TIDE'],
      ['ai_semis', 'NOVA'],
      ['mlccs', 'FERRO'],
      ['server_odms', 'RACK'],
    ];

    let threadsEnsured = 0;
    for (const [key, designation] of agentSeeds) {
      await sql`
        INSERT INTO sector_agent_threads (sector_key, designation)
        VALUES (${key}, ${designation})
        ON CONFLICT (sector_key) DO NOTHING
      `;
      threadsEnsured++;
    }

    // 5. Ensure last_read_at column exists on sector_agent_threads
    await sql`ALTER TABLE sector_agent_threads ADD COLUMN IF NOT EXISTS last_read_at TIMESTAMPTZ DEFAULT NOW()`;

    return NextResponse.json({
      success: true,
      applied: {
        sector_briefs_table: "created or already exists",
        briefs_seeded: briefsSeeded,
        quanta_sector_group_fixed: quantaFix.length > 0,
        volt_sector_group_fixed: "VST removed, VRT+2301 added to dc_power_cooling",
        country_backfill: "Japan/Taiwan/Korea/HK/China/India/Australia backfilled from exchange",
        threads_ensured: threadsEnsured,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
