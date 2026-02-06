from app.core.db import SessionLocal
from app.models.graph_snapshot import GraphSnapshot

class SnapshotService:

    @staticmethod
    def save_snapshot(system: str, version: int, state: dict):
        db = SessionLocal()
        snapshot = GraphSnapshot(
            system=system,
            version=version,
            state=state
        )
        db.add(snapshot)
        db.commit()
        db.close()

    @staticmethod
    def load_latest(system: str) -> dict | None:
        db = SessionLocal()
        snapshot = (
            db.query(GraphSnapshot)
            .filter(GraphSnapshot.system == system)
            .order_by(GraphSnapshot.version.desc())
            .first()
        )
        db.close()
        return snapshot.state if snapshot else None
