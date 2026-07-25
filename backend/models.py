from sqlalchemy import Column, Integer, String, Float
from database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String, unique=True, index=True)
    company_name = Column(String)
    sector = Column(String)
    current_price = Column(Float)
    market_cap = Column(Float)
    pe_ratio = Column(Float)


class Portfolio(Base):
    __tablename__ = "portfolio"

    id = Column(Integer, primary_key=True, index=True)
    ticker = Column(String)
    quantity = Column(Integer)
    buy_price = Column(Float)
