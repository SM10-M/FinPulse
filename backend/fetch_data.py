import yfinance as yf

from database import SessionLocal
from models import Company


stocks = [
    "RELIANCE.NS",
    "TCS.NS",
    "INFY.NS",
    "HDFCBANK.NS",
    "ICICIBANK.NS",
    "LT.NS",
    "ITC.NS",
    "SBIN.NS",
    "BHARTIARTL.NS",
    "HINDUNILVR.NS",
    "ASIANPAINT.NS",
    "MARUTI.NS",
    "AXISBANK.NS",
    "SUNPHARMA.NS",
    "TATAMOTORS.NS",
    "BAJFINANCE.NS",
    "WIPRO.NS",
    "NTPC.NS",
    "POWERGRID.NS",
    "ULTRACEMCO.NS"
]

db = SessionLocal()

for ticker in stocks:

    print(f"Fetching {ticker}...")

    stock = yf.Ticker(ticker)
    info = stock.info

    company = Company(
        ticker=ticker,
        company_name=info.get("longName"),
        sector=info.get("sector"),
        current_price=info.get("currentPrice"),
        market_cap=info.get("marketCap"),
        pe_ratio=info.get("trailingPE")
    )

    db.add(company)

db.commit()
db.close()

print("Database populated successfully!")
