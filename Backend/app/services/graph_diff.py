from typing import List, Dict, Set

class GraphDiff:
    """Computes differences between two graph states"""
    
    @staticmethod
    def compute_diff(old_state: dict, new_state: dict) -> dict:
        """
        Compare two canonical graph states and return only additions.
        
        Args:
            old_state: Previous graph state with nodes/edges
            new_state: New graph state with nodes/edges
            
        Returns:
            {
                "added_nodes": [...],
                "added_edges": [...]
            }
        """
        old_node_ids = {node["id"] for node in old_state.get("nodes", [])}
        new_node_ids = {node["id"] for node in new_state.get("nodes", [])}
        
        old_edge_ids = {edge["id"] for edge in old_state.get("edges", [])}
        new_edge_ids = {edge["id"] for edge in new_state.get("edges", [])}
        
        # Find additions
        added_node_ids = new_node_ids - old_node_ids
        added_edge_ids = new_edge_ids - old_edge_ids
        
        # Extract full node/edge objects
        added_nodes = [
            node for node in new_state["nodes"]
            if node["id"] in added_node_ids
        ]
        
        added_edges = [
            edge for edge in new_state["edges"]
            if edge["id"] in added_edge_ids
        ]
        
        return {
            "added_nodes": added_nodes,
            "added_edges": added_edges
        }
