from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from astro_app.backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    tier = Column(String, default="free") # free, premium, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    charts = relationship("Chart", back_populates="owner")

class Chart(Base):
    __tablename__ = "charts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    first_name = Column(String, default="")
    last_name = Column(String, default="")
    gender = Column(String, default="")
    relation = Column(String, default="Myself") # Chart for...
    
    date_str = Column(String)
    time_str = Column(String)
    timezone_str = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    location_name = Column(String, default="") # City Name
    
    created_at = Column(DateTime, default=datetime.utcnow)
    is_default = Column(Boolean, default=False) # Star icon

    owner = relationship("User", back_populates="charts")

class DailyRating(Base):
    __tablename__ = "daily_ratings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date_str = Column(String, index=True) # YYYY-MM-DD
    rating = Column(Integer) # 1-5
    feedback_text = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="ratings")

class MarketSignal(Base):
    __tablename__ = "market_signals"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=datetime.utcnow)
    asset = Column(String) # BTC, ETH, SPX
    asset_class = Column(String) # Crypto, Stock
    signal = Column(String) # Buy, Hold, Sell, Avoid
    confidence = Column(Integer) # 0-100
    user_profile = Column(String) # Conservative, Balanced, Speculative
    entry_price = Column(Float)
    price_24h = Column(Float, nullable=True)
    price_7d = Column(Float, nullable=True)
    outcome = Column(String, nullable=True) # Win, Loss, Neutral

class PerformanceMetric(Base):
    __tablename__ = "performance_metrics"

    id = Column(Integer, primary_key=True, index=True)
    period = Column(String) # "30d", "all_time"
    crypto_win_rate = Column(Float)
    stocks_win_rate = Column(Float)
    avoid_accuracy = Column(Float)
    updated_at = Column(DateTime, default=datetime.utcnow)

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String) # user, assistant
    content = Column(String) # Text content
    html_content = Column(String, nullable=True) # For charts/tables
    timestamp = Column(DateTime, default=datetime.utcnow)
    session_id = Column(String, nullable=True, index=True)
    suggestions = Column(String, nullable=True) # JSON string of suggestions
    
    # Relationship to user
    owner = relationship("User", backref="messages")
