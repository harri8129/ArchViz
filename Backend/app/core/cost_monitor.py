import time
from collections import defaultdict
from datetime import datetime, timedelta

class CostMonitor:
    """Track LLM usage and costs"""
    
    def __init__(self):
        self.calls = defaultdict(int)  # Track calls per hour
        self.total_calls = 0
        self.estimated_cost = 0.0
        
        # Groq pricing (example - adjust based on actual pricing)
        self.cost_per_call = 0.001  # $0.001 per call
    
    def record_call(self, system_name: str):
        """Record an LLM call"""
        hour_key = datetime.now().strftime("%Y-%m-%d-%H")
        self.calls[hour_key] += 1
        self.total_calls += 1
        self.estimated_cost += self.cost_per_call
    
    def get_stats(self) -> dict:
        """Get current usage statistics"""
        current_hour = datetime.now().strftime("%Y-%m-%d-%H")
        return {
            "total_calls": self.total_calls,
            "calls_this_hour": self.calls[current_hour],
            "estimated_cost_usd": round(self.estimated_cost, 4)
        }
    
    def check_budget_limit(self, max_cost: float = 10.0) -> bool:
        """Check if we're within budget"""
        return self.estimated_cost < max_cost

# Global instance
cost_monitor = CostMonitor()
