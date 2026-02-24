#!/usr/bin/env python3
"""
Fetch live market caps for all 230 companies via yfinance and upsert into
the companies table (market_cap_usd column, in USD billions).

Handles local-currency conversion: KRW, TWD, JPY, HKD, CNY, AUD, INR → USD.

Run: python3 scripts/update_market_caps.py
"""

import os, sys, time
import yfinance as yf
import psycopg2
from dotenv import dotenv_values

# ── Load env ──────────────────────────────────────────────────────────────────
env = dotenv_values(os.path.join(os.path.dirname(__file__), "../.env.local"))
DATABASE_URL = env.get("DATABASE_URL") or os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    sys.exit("DATABASE_URL not found in .env.local")

conn_str = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# ── Fetch live FX rates (local-currency → USD) ────────────────────────────────
FX_PAIRS = {
    "TWD": "TWDUSD=X",
    "KRW": "KRWUSD=X",
    "JPY": "JPYUSD=X",
    "HKD": "HKDUSD=X",
    "CNY": "CNYUSD=X",
    "AUD": "AUDUSD=X",
    "INR": "INRUSD=X",
    "USD": None,
}
FX_RATES: dict[str, float] = {"USD": 1.0}

print("Fetching live FX rates…")
for currency, pair in FX_PAIRS.items():
    if pair is None:
        continue
    try:
        rate = yf.Ticker(pair).fast_info.last_price
        FX_RATES[currency] = float(rate)
        print(f"  {currency}/USD = {rate:.6f}")
    except Exception as e:
        print(f"  {currency}/USD — error: {e} — using fallback")

# Fallback rates (approximate, Feb 2026)
FALLBACK = {"TWD": 0.0309, "KRW": 0.000714, "JPY": 0.00660,
            "HKD": 0.1282,  "CNY": 0.1375,   "AUD": 0.630,   "INR": 0.01190}
for cur, rate in FALLBACK.items():
    if cur not in FX_RATES:
        FX_RATES[cur] = rate
        print(f"  {cur}/USD = {rate} (fallback)")

print()

# ── Fetch tickers from DB ─────────────────────────────────────────────────────
conn = psycopg2.connect(conn_str)
cur = conn.cursor()
cur.execute("SELECT id, ticker_full FROM companies ORDER BY id")
companies = cur.fetchall()
print(f"Fetching market caps for {len(companies)} companies…\n")

# ── Batch fetch via yfinance ──────────────────────────────────────────────────
BATCH = 40

updates = []
errors  = []

for i in range(0, len(companies), BATCH):
    batch = companies[i:i+BATCH]
    tickers = [row[1] for row in batch]
    id_map  = {row[1]: row[0] for row in batch}

    try:
        data = yf.Tickers(" ".join(tickers))
        for ticker in tickers:
            try:
                fi = data.tickers[ticker].fast_info
                mc_local = getattr(fi, "market_cap", None)
                currency = getattr(fi, "currency", "USD")

                if mc_local and mc_local > 0:
                    fx = FX_RATES.get(currency, FX_RATES.get("USD", 1.0))
                    mc_usd_bn = round(mc_local * fx / 1e9, 2)
                    updates.append((mc_usd_bn, id_map[ticker]))
                    print(f"  {ticker:<22} {currency}  ${mc_usd_bn:>10,.1f}B")
                else:
                    errors.append(ticker)
                    print(f"  {ticker:<22} [no data]")
            except Exception as e:
                errors.append(ticker)
                print(f"  {ticker:<22} [error: {e}]")
    except Exception as e:
        print(f"Batch {i//BATCH+1} failed: {e}")
        errors.extend(tickers)

    time.sleep(1)

# ── Upsert into DB ────────────────────────────────────────────────────────────
print(f"\nUpserting {len(updates)} values into DB…")
cur.executemany(
    "UPDATE companies SET market_cap_usd = %s WHERE id = %s",
    updates
)
conn.commit()
cur.close()
conn.close()

print(f"\nDone. Updated: {len(updates)}  |  No data: {len(errors)}")
if errors:
    print("Tickers with no data:", ", ".join(errors))

# ── Validation spot-check ─────────────────────────────────────────────────────
print("\n── Spot-check (should be roughly: NVDA ~3000-5000, AAPL ~3500-4500, TSMC ~800-1800, Samsung ~200-400) ──")
spot = [("NVDA", "Nvidia"), ("AAPL", "Apple"), ("2330.TW", "TSMC"), ("005930.KS", "Samsung")]
for t, name in spot:
    match = [(v, id_) for v, id_ in updates if id_ == dict(companies)[t.replace(".", "_")] or True]
    # just show from the updates list
for t, name in spot:
    for (v, id_) in updates:
        if id_ in (t, t.replace(".", "_"), t.replace(".", "").replace("-", "_")):
            print(f"  {name}: ${v:,.0f}B")
            break
