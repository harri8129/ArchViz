import type { GraphNode, GraphEdge } from '../store/graphStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface BuildGraphResponse {
  system: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  version: number;
}

interface ExpandNodeResponse {
  system: string;
  version: number;
  added_nodes: GraphNode[];
  added_edges: GraphEdge[];
}

interface LoadLatestResponse {
  system: string;
  version: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function fetchWithError(url: string, options?: RequestInit): Promise<Response> {
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };

  // Only add Content-Type for non-GET requests or if body is present
  if (options?.body || (options?.method && options.method !== 'GET')) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.detail || `HTTP error! status: ${response.status}`
    );
  }

  return response;
}

export const api = {
  async buildGraph(systemName: string, diff = false, useCache = true): Promise<BuildGraphResponse> {
    const response = await fetchWithError(
      `${API_BASE_URL}/build-graph?diff=${diff}`,
      {
        method: 'POST',
        body: JSON.stringify({
          system_name: systemName,
          use_cache: useCache
        }),
      }
    );
    return response.json();
  },

  async expandNode(
    system: string,
    nodeId: string,
    nodeLabel: string,
    maxDepth = 1,
    diff = true
  ): Promise<ExpandNodeResponse> {
    const response = await fetchWithError(
      `${API_BASE_URL}/expand-node?diff=${diff}`,
      {
        method: 'POST',
        body: JSON.stringify({
          system,
          node_id: nodeId,
          node_label: nodeLabel,
          max_depth: maxDepth,
        }),
      }
    );
    return response.json();
  },

  async loadLatest(system: string): Promise<LoadLatestResponse | null> {
    try {
      const response = await fetchWithError(
        `${API_BASE_URL}/load-latest/${encodeURIComponent(system)}`
      );
      const data = await response.json();

      // Handle "No saved graph found" message
      if (data.message) {
        return null;
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async getStats(): Promise<{ llm_usage: unknown; status: string }> {
    const response = await fetchWithError(`${API_BASE_URL}/stats`);
    return response.json();
  },

  async getMetrics(): Promise<unknown> {
    const response = await fetchWithError(`${API_BASE_URL}/metrics`);
    return response.json();
  },
};