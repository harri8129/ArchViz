import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict
from datetime import datetime

class PerformanceMonitor:
    """Track endpoint performance metrics"""
    
    def __init__(self):
        self.metrics = defaultdict(lambda: {
            "count": 0,
            "total_time": 0.0,
            "min_time": float('inf'),
            "max_time": 0.0
        })
    
    def record(self, endpoint: str, duration: float):
        """Record request duration"""
        m = self.metrics[endpoint]
        m["count"] += 1
        m["total_time"] += duration
        m["min_time"] = min(m["min_time"], duration)
        m["max_time"] = max(m["max_time"], duration)
    
    def get_stats(self) -> dict:
        """Get performance statistics"""
        stats = {}
        for endpoint, m in self.metrics.items():
            if m["count"] > 0:
                stats[endpoint] = {
                    "requests": m["count"],
                    "avg_time_ms": round((m["total_time"] / m["count"]) * 1000, 2),
                    "min_time_ms": round(m["min_time"] * 1000, 2),
                    "max_time_ms": round(m["max_time"] * 1000, 2)
                }
        return stats

# Global instance
perf_monitor = PerformanceMonitor()


class PerformanceMiddleware(BaseHTTPMiddleware):
    """Middleware to track request timing"""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        response = await call_next(request)
        
        duration = time.time() - start_time
        endpoint = f"{request.method} {request.url.path}"
        perf_monitor.record(endpoint, duration)
        
        # Add timing header
        response.headers["X-Process-Time"] = f"{duration:.4f}"
        
        return response
