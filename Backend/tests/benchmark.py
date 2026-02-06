import asyncio
import httpx
import time
from statistics import mean, median, stdev

BASE_URL = "http://localhost:8000"

async def benchmark_endpoint(endpoint: str, payload: dict, iterations: int = 10):
    """Benchmark an endpoint"""
    times = []
    
    async with httpx.AsyncClient(timeout=60) as client:
        for i in range(iterations):
            start = time.time()
            try:
                response = await client.post(f"{BASE_URL}{endpoint}", json=payload)
                duration = time.time() - start
                times.append(duration)
                print(f"  Request {i+1}/{iterations}: {duration:.2f}s - Status {response.status_code}")
            except Exception as e:
                print(f"  Request {i+1}/{iterations}: FAILED - {e}")
    
    if times:
        return {
            "mean": mean(times),
            "median": median(times),
            "min": min(times),
            "max": max(times),
            "stdev": stdev(times) if len(times) > 1 else 0
        }
    return None

async def main():
    print("🔥 ArchViz AI Performance Benchmark\n")
    
    # Test 1: Build Graph (Cold Start)
    print("Test 1: Build Graph (Cold Start)")
    stats = await benchmark_endpoint(
        "/design/build-graph",
        {"system_name": "TestSystem1"},
        iterations=5
    )
    if stats:
        print(f"  Mean: {stats['mean']:.2f}s")
        print(f"  Median: {stats['median']:.2f}s")
        print(f"  Min: {stats['min']:.2f}s")
        print(f"  Max: {stats['max']:.2f}s\n")
    
    # Test 2: Build Graph (Cached)
    print("Test 2: Build Graph (Cached - Same System)")
    stats = await benchmark_endpoint(
        "/design/build-graph",
        {"system_name": "TestSystem1"},
        iterations=5
    )
    if stats:
        print(f"  Mean: {stats['mean']:.2f}s (should be <100ms)")
        print(f"  Cache speedup: {stats['mean'] < 0.1}\n")
    
    # Test 3: Expand Node
    print("Test 3: Expand Node")
    stats = await benchmark_endpoint(
        "/design/expand-node",
        {
            "system": "TestSystem1",
            "node_id": "test_node",
            "node_label": "Test Node",
            "max_depth": 1
        },
        iterations=5
    )
    if stats:
        print(f"  Mean: {stats['mean']:.2f}s")
        print(f"  Median: {stats['median']:.2f}s\n")
    
    # Get final metrics
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/design/metrics")
        metrics = response.json()
        print("📊 Final Metrics:")
        print(f"  Cache Hit Rate: {metrics['cache']['hit_rate_percent']}%")
        print(f"  Total LLM Calls: {metrics['llm_usage']['total_calls']}")
        print(f"  Estimated Cost: ${metrics['llm_usage']['estimated_cost_usd']}")

if __name__ == "__main__":
    asyncio.run(main())