from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
import uuid
from app.core.db import Base  



class GraphSnapshot(Base):
    __tablename__ = "graph_snapshots"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    system = Column(String, index=True)
    version = Column(Integer)
    state = Column(JSONB)
    created_at = Column(DateTime, default=datetime.utcnow)
