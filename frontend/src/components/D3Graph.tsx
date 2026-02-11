import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { useGraphStore } from '../store/graphStore';
import type { GraphNode, GraphEdge } from '../store/graphStore';
import { nodeIcons, nodeColors } from './GraphIcons';
import { renderToString } from 'react-dom/server';
import { RefreshCw } from 'lucide-react';

const D3Graph: React.FC = () => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const {
        nodes,
        edges,
        selectedNodeId,
        selectNode,
        expandNode,
        searchTerm,
        filters,
        pinNode,
        system,
        setError,
        rebuildLayout
    } = useGraphStore();

    // Filter nodes and edges based on store filters
    const visibleNodes = useMemo(() => {
        return nodes.filter(node => {
            const matchesType = filters.types.includes(node.type);
            const matchesExpansion =
                filters.expansion === 'all' ||
                (filters.expansion === 'expandable' && node.expandable) ||
                (filters.expansion === 'leaf' && !node.expandable);
            const matchesDepth = node.level <= filters.maxDepth;

            return matchesType && matchesExpansion && matchesDepth;
        });
    }, [nodes, filters]);

    const visibleEdges = useMemo(() => {
        const nodeIds = new Set(visibleNodes.map(n => n.id));
        return edges
            .filter(edge => {
                const sourceId = typeof edge.source === 'string' ? edge.source : (edge.source as any).id;
                const targetId = typeof edge.target === 'string' ? edge.target : (edge.target as any).id;
                return nodeIds.has(sourceId) && nodeIds.has(targetId);
            })
            .map(edge => ({
                ...edge,
                source: typeof edge.source === 'object' ? (edge.source as any).id : edge.source,
                target: typeof edge.target === 'object' ? (edge.target as any).id : edge.target
            }));
    }, [visibleNodes, edges]);

    useEffect(() => {
        if (!svgRef.current || !containerRef.current) return;

        const svg = d3.select(svgRef.current);
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        svg.selectAll('*').remove();

        const g = svg.append('g').attr('class', 'main-container');

        // Zoom behavior
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);

        // Simulation with adjusted forces for better visibility of all edges
        const simulation = d3.forceSimulation<GraphNode>(visibleNodes)
            .force('link', d3.forceLink<GraphNode, GraphEdge>(visibleEdges)
                .id(d => d.id)
                .distance(200)) // Increased link distance for better spacing
            .force('charge', d3.forceManyBody().strength(-1500)) // Stronger repulsion to spread nodes
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('x', d3.forceX(width / 2).strength(0.05)) // Reduced centering strength for more natural layout
            .force('y', d3.forceY(height / 2).strength(0.05))
            .force('collision', d3.forceCollide().radius(40)); // Add collision detection to prevent overlap

        // Markers for edge arrows
        svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', 28) // Offset to sit outside the circle
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 8)
            .attr('markerHeight', 8)
            .attr('xoverflow', 'visible')
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', '#818cf8') // indigo-400
            .style('stroke', 'none');

        // Edges
        const link = g.append('g')
            .attr('class', 'links')
            .selectAll('path')
            .data(visibleEdges)
            .enter().append('path')
            .attr('class', 'edge')
            .attr('stroke', '#6366f1') // indigo-500
            .attr('stroke-width', 2.5)
            .attr('stroke-opacity', 0.6)
            .attr('fill', 'none')
            .attr('marker-end', 'url(#arrowhead)');

        // Edge labels
        const edgeLabel = g.append('g')
            .attr('class', 'edge-labels')
            .selectAll('text')
            .data(visibleEdges)
            .enter().append('text')
            .attr('class', 'edge-label')
            .attr('font-size', '11px')
            .attr('font-weight', '500')
            .attr('fill', '#94a3b8')
            .attr('text-anchor', 'middle')
            .text(d => d.relation);

        // Nodes container
        const node = g.append('g')
            .attr('class', 'nodes')
            .selectAll('.node')
            .data(visibleNodes)
            .enter().append('g')
            .attr('class', 'node')
            .attr('cursor', 'pointer')
            .call(d3.drag<SVGGElement, GraphNode>()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended))
            .on('click', (event, d) => {
                console.log('Node clicked:', d.id);
                event.stopPropagation();
                selectNode(d.id);
            })
            .on('dblclick', async (event, d) => {
                console.log('Node double-clicked:', d.id);
                event.stopPropagation();
                if (d.expandable && system) {
                    try {
                        console.log('Expanding node:', d.id);
                        // This is a placeholder for the actual API call
                        // In a real app, this would be handled by a service
                        // and the store would be updated.
                        const api = (await import('../services/api')).api;
                        const res = await api.expandNode(system, d.id, d.label);
                        expandNode(d.id, res.added_nodes, res.added_edges);
                    } catch (err) {
                        console.error('Expansion failed:', err);
                        setError(err instanceof Error ? err.message : 'Expansion failed');
                    }
                }
            });

        // Node circles
        node.append('circle')
            .attr('r', 20)
            .attr('fill', d => nodeColors[d.type] || '#3b82f6')
            .attr('stroke', d => d.id === selectedNodeId ? '#fff' : 'none')
            .attr('stroke-width', 3)
            .attr('class', d => {
                const matchesSearch = searchTerm && d.label.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesSearch ? 'glow-effect' : '';
            });

        // Node icons (using foreignObject for Lucide)
        node.append('foreignObject')
            .attr('x', -10)
            .attr('y', -10)
            .attr('width', 20)
            .attr('height', 20)
            .style('pointer-events', 'none')
            .html(d => {
                const Icon = nodeIcons[d.type] || nodeIcons.service;
                return renderToString(<Icon size={20} color="white" />);
            });

        // "+" icons for expandable nodes
        node.filter(d => d.expandable)
            .append('circle')
            .attr('cx', 12)
            .attr('cy', -12)
            .attr('r', 6)
            .attr('fill', '#8b5cf6')
            .attr('class', 'plus-bg');

        node.filter(d => d.expandable)
            .append('text')
            .attr('x', 12)
            .attr('y', -9)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('font-weight', 'bold')
            .attr('fill', 'white')
            .style('pointer-events', 'none')
            .text('+');

        // Node labels
        node.append('text')
            .attr('dy', 35)
            .attr('text-anchor', 'middle')
            .attr('fill', '#f8fafc')
            .attr('font-size', '12px')
            .attr('font-weight', '500')
            .text(d => d.label);

        // Hover tooltip
        node.append('title')
            .text(d => `${d.label}\n${d.type}\n${d.description}`);

        simulation.on('tick', () => {
            link.attr('d', d => {
                const sx = (d.source as any).x;
                const sy = (d.source as any).y;
                const tx = (d.target as any).x;
                const ty = (d.target as any).y;

                // Curved edge logic
                const dx = tx - sx;
                const dy = ty - sy;
                const dr = Math.sqrt(dx * dx + dy * dy);
                return `M${sx},${sy}A${dr},${dr} 0 0,1 ${tx},${ty}`;
            });

            edgeLabel
                .attr('x', d => ((d.source as any).x + (d.target as any).x) / 2)
                .attr('y', d => ((d.source as any).y + (d.target as any).y) / 2 - 10);

            node.attr('transform', d => `translate(${d.x},${d.y})`);
        });

        function dragstarted(event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event: any, d: any) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event: any, d: any) {
            if (!event.active) simulation.alphaTarget(0);
            pinNode(d.id, d.fx, d.fy);
        }

        // Centering/Fit View initial
        if (visibleNodes.length > 0) {
            const transform = d3.zoomIdentity
                .translate(width / 2, height / 2)
                .scale(0.8)
                .translate(-width / 2, -height / 2);
            svg.transition().duration(750).call(zoom.transform, transform);
        }

        return () => {
            simulation.stop();
        };
    }, [visibleNodes, visibleEdges, selectedNodeId, searchTerm, filters, system, selectNode, expandNode, setError, pinNode, rebuildLayout]);

    return (
        <div id="graph-container" ref={containerRef} className="w-full h-full bg-slate-900 overflow-hidden relative">
            <svg
                ref={svgRef}
                className="w-full h-full"
                style={{ touchAction: 'none' }}
            />

            {/* Search Glow CSS */}
            <style>{`
        .glow-effect {
          filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
          stroke: #fff;
          stroke-width: 2px;
        }
        .edge {
          transition: stroke 0.2s;
        }
        .node:hover circle {
          filter: brightness(1.2);
        }
      `}</style>

            {/* Zoom Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                {/* <button
                    onClick={() => {
                        const svg = d3.select(svgRef.current as any);
                        svg.transition().call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1.3);
                    }}
                    className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                    title="Zoom In"
                >
                    <Plus size={20} />
                </button>
                <button
                    onClick={() => {
                        const svg = d3.select(svgRef.current as any);
                        svg.transition().call(d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 0.7);
                    }}
                    className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                    title="Zoom Out"
                >
                    <div className="w-4 h-0.5 bg-current rounded-full" />
                </button>
                <button
                    onClick={() => {
                        if (!containerRef.current || !svgRef.current) return;
                        const width = containerRef.current.clientWidth;
                        const height = containerRef.current.clientHeight;
                        const svg = d3.select(svgRef.current as any);
                        const transform = d3.zoomIdentity
                            .translate(width / 2, height / 2)
                            .scale(0.8)
                            .translate(-width / 2, -height / 2);
                        svg.transition().duration(750).call(d3.zoom<SVGSVGElement, unknown>().transform as any, transform);
                    }}
                    className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                    title="Fit View"
                >
                    <Layout size={20} />
                </button> */}
                <button
                    onClick={() => {
                        rebuildLayout();
                    }}
                    className="w-15 h-10 bg-indigo-600 border border-indigo-500 rounded-lg text-white hover:bg-indigo-500 flex items-center justify-center transition-colors shadow-lg shadow-indigo-500/30"
                    title="Reset Layout"
                >
                    Reset
                    <RefreshCw size={20} />
                </button>
            </div>
        </div>
    );
};

export default D3Graph;

