import math
from fastapi.responses import PlainTextResponse
import traceback
import yfinance as yf
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from models import Company
from pydantic import BaseModel
from models import Portfolio

app = FastAPI(title="FinPulse API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {"message": "Welcome to FinPulse API"}


@app.get("/stocks")
def get_stocks():

    db = SessionLocal()
    companies = db.query(Company).all()

    result = []

    for company in companies:

        try:
            stock = yf.Ticker(company.ticker)
            info = stock.info

            result.append({
                "ticker": company.ticker,
                "company": company.company_name,
                "sector": company.sector,
                "price": info.get("currentPrice"),
                "change": info.get("regularMarketChange"),
                "changePercent": info.get("regularMarketChangePercent"),
                "marketCap": info.get("marketCap"),
                "pe": info.get("trailingPE"),
                "roe": info.get("returnOnEquity")
            })

        except Exception as e:
            print(f"Failed to fetch {company.ticker}: {e}")
            continue

    db.close()
    return result


@app.get("/screener")
def screener():

    tickers = [
        "RELIANCE.NS",
        "TCS.NS",
        "INFY.NS",
        "HDFCBANK.NS",
        "ICICIBANK.NS",
        "LT.NS",
        "ITC.NS",
        "SBIN.NS",
        "BHARTIARTL.NS",
        "ASIANPAINT.NS",
        "MARUTI.NS",
        "SUNPHARMA.NS",
        "BAJFINANCE.NS",
        "AXISBANK.NS",
        "WIPRO.NS",
        "NTPC.NS",
        "POWERGRID.NS",
        "ULTRACEMCO.NS",
        "HINDUNILVR.NS"
        "DIVISLAB.NS"
        "HCLTECH.NS"
    ]

    result = []

    for ticker in tickers:

        try:

            info = yf.Ticker(ticker).info

            result.append({

                "ticker": ticker,

                "company": info.get("longName"),

                "sector": info.get("sector"),

                "price": info.get("currentPrice"),

                "pe": info.get("trailingPE"),

                "roe": info.get("returnOnEquity"),

                "pb": info.get("priceToBook"),

                "marketCap": info.get("marketCap"),

                "dividendYield": info.get("dividendYield")

            })

        except:
            pass

    return result


@app.get("/stock/{ticker}")
def get_stock(ticker: str):

    stock = yf.Ticker(ticker)

    info = stock.info

    return {

        "company": info.get("longName"),

        "price": info.get("currentPrice"),

        "marketCap": info.get("marketCap"),

        "pe": info.get("trailingPE"),

        "sector": info.get("sector"),

        "beta": info.get("beta"),

        "eps": info.get("trailingEps"),

        "bookValue": info.get("bookValue"),

        "dividendYield": info.get("dividendYield"),

        "fiftyTwoHigh": info.get("fiftyTwoWeekHigh"),

        "fiftyTwoLow": info.get("fiftyTwoWeekLow")

    }


@app.get("/market-summary")
def market_summary():

    nifty = yf.Ticker("^NSEI").history(period="2d")
    sensex = yf.Ticker("^BSESN").history(period="2d")

    nifty_price = float(nifty["Close"].iloc[-1])
    nifty_prev = float(nifty["Close"].iloc[-2])

    sensex_price = float(sensex["Close"].iloc[-1])
    sensex_prev = float(sensex["Close"].iloc[-2])

    return {
        "NIFTY": {
            "price": nifty_price,
            "percent": ((nifty_price - nifty_prev) / nifty_prev) * 100
        },
        "SENSEX": {
            "price": sensex_price,
            "percent": ((sensex_price - sensex_prev) / sensex_prev) * 100
        }
    }


@app.get("/history/{ticker}")
def get_history(ticker: str):

    stock = yf.Ticker(ticker)
    history = stock.history(period="1mo")

    dates = []
    prices = []

    for date, row in history.iterrows():

        close = row["Close"]

        # Skip missing values
        if close is None or math.isnan(float(close)):
            continue

        dates.append(date.strftime("%d %b"))
        prices.append(round(float(close), 2))

    return {
        "dates": dates,
        "prices": prices
    }


@app.get("/candles/{ticker}")
def get_candles(ticker: str):

    stock = yf.Ticker(ticker)

    history = stock.history(period="3mo")

    candles = []

    for date, row in history.iterrows():

        candles.append({

            "x": date.strftime("%Y-%m-%d"),

            "y": [

                round(float(row["Open"]), 2),

                round(float(row["High"]), 2),

                round(float(row["Low"]), 2),

                round(float(row["Close"]), 2)

            ]

        })

    return candles


@app.get("/compare")
def compare_stocks(tickers: str):

    ticker_list = tickers.split(",")

    result = []

    for ticker in ticker_list:

        stock = yf.Ticker(ticker)

        info = stock.info

        result.append({

            "ticker": ticker,
            "company": info.get("longName"),
            "price": info.get("currentPrice"),
            "sector": info.get("sector"),

            "pe": info.get("trailingPE"),
            "pb": info.get("priceToBook"),

            "roe": info.get("returnOnEquity"),

            "marketCap": info.get("marketCap"),

            "dividendYield": info.get("dividendYield")

        })

    return result


class PortfolioItem(BaseModel):
    ticker: str
    quantity: int
    buy_price: float


@app.post("/portfolio")
def add_portfolio(item: PortfolioItem):

    db = SessionLocal()

    holding = Portfolio(
        ticker=item.ticker,
        quantity=item.quantity,
        buy_price=item.buy_price
    )

    db.add(holding)
    db.commit()

    db.close()

    return {"message": "Holding Added"}


@app.get("/portfolio")
def get_portfolio():

    db = SessionLocal()

    holdings = db.query(Portfolio).all()

    result = []

    for h in holdings:

        stock = yf.Ticker(h.ticker)

        price = stock.fast_info["lastPrice"]

        value = price * h.quantity

        profit = (price - h.buy_price) * h.quantity

        result.append({

            "id": h.id,
            "ticker": h.ticker,
            "quantity": h.quantity,
            "buy_price": h.buy_price,
            "current_price": round(price, 2),
            "value": round(value, 2),
            "profit": round(profit, 2)

        })

    db.close()

    return result


@app.delete("/portfolio/{id}")
def delete_holding(id: int):

    db = SessionLocal()

    holding = db.query(Portfolio).filter(
        Portfolio.id == id
    ).first()

    db.delete(holding)

    db.commit()

    db.close()

    return {"message": "Deleted"}
