import { useRef, useEffect, useState } from 'react';
import { Graph, VisualizationState, NodeState } from '../algorithms/types';

interface GraphCanvasProps {
    graph: Graph;
    visualState: VisualizationState;
    width: number;
    height: number;
}

export default function GraphCanvas({ graph, visualState, width, height }: GraphCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [zoom, setZoom] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Handle zoom with mouse wheel (zoom toward cursor)
    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate zoom delta
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.min(Math.max(zoom * delta, 0.5), 100); // Max 10000%

        // Adjust pan offset to zoom toward mouse position
        const zoomChange = newZoom / zoom;
        const newPanX = mouseX - (mouseX - panOffset.x) * zoomChange;
        const newPanY = mouseY - (mouseY - panOffset.y) * zoomChange;

        setZoom(newZoom);
        setPanOffset({ x: newPanX, y: newPanY });
    };

    // Handle pan with mouse drag
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPanOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const resetView = () => {
        setZoom(1);
        setPanOffset({ x: 0, y: 0 });
    };

    // Add/remove wheel listener
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.addEventListener('wheel', handleWheel, { passive: false });
        return () => canvas.removeEventListener('wheel', handleWheel);
    }, [zoom, panOffset]); // Added dependencies

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas dimensions with device pixel ratio for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply transformations
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.translate(panOffset.x, panOffset.y);

        // Don't scale the whole context - we'll scale positions instead
        // This keeps node/edge sizes constant while spreading them apart

        // Draw edges first (behind nodes)
        drawEdges(ctx, graph, visualState, zoom);

        // Draw nodes on top
        drawNodes(ctx, graph, visualState, zoom);

        ctx.restore();
    }, [graph, visualState, width, height, zoom, panOffset]);

    return (
        <div className="relative">
            <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
            />
            {/* Spacing controls */}
            <div className="absolute top-2 right-2 flex flex-col gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-1 border border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setZoom(prev => Math.min(prev * 1.2, 100))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 font-bold"
                    title="Increase Spacing"
                >
                    +
                </button>
                <button
                    onClick={() => setZoom(prev => Math.max(prev * 0.8, 0.5))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 font-bold"
                    title="Decrease Spacing"
                >
                    −
                </button>
                <div className="border-t border-gray-300 dark:border-gray-600 my-1"></div>
                <button
                    onClick={resetView}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 text-xs"
                    title="Reset View"
                >
                    ⟲
                </button>
                <div className="text-[10px] text-center text-gray-500 dark:text-gray-400 px-1">
                    {(zoom * 100).toFixed(0)}%
                </div>
            </div>
        </div>
    );
}

function drawEdges(
    ctx: CanvasRenderingContext2D,
    graph: Graph,
    visualState: VisualizationState,
    spacing: number = 1
) {
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#475569';

    for (const edge of graph.edges) {
        const fromNode = graph.nodes.find(n => n.id === edge.from);
        const toNode = graph.nodes.find(n => n.id === edge.to);

        if (!fromNode || !toNode) continue;

        // Apply spacing to positions
        const x1 = fromNode.x * spacing;
        const y1 = fromNode.y * spacing;
        const x2 = toNode.x * spacing;
        const y2 = toNode.y * spacing;

        const isActive = visualState.activeEdges.has(`${edge.from}-${edge.to}`);
        const isOnPath =
            visualState.nodeStates.get(edge.from) === NodeState.PATH &&
            visualState.nodeStates.get(edge.to) === NodeState.PATH &&
            visualState.predecessors.get(edge.to) === edge.from;

        // Draw arrow
        if (isOnPath) {
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 4;
        } else if (isActive) {
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 3;
        } else {
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 2;
        }

        drawArrow(ctx, x1, y1, x2, y2);

        // Draw weight label
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(midX - 12, midY - 10, 24, 20);

        ctx.fillStyle = isOnPath ? '#ef4444' : isActive ? '#f59e0b' : '#475569';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(edge.weight.toString(), midX, midY);
    }
}

function drawArrow(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number
) {
    const headLength = 12;
    const nodeRadius = 22;

    // Calculate direction
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const unitX = dx / length;
    const unitY = dy / length;

    // Start and end points (accounting for node radius)
    const startX = x1 + unitX * nodeRadius;
    const startY = y1 + unitY * nodeRadius;
    const endX = x2 - unitX * nodeRadius;
    const endY = y2 - unitY * nodeRadius;

    // Draw line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Draw arrowhead
    const angle = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
        endX - headLength * Math.cos(angle - Math.PI / 6),
        endY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        endX - headLength * Math.cos(angle + Math.PI / 6),
        endY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
}

function drawNodes(
    ctx: CanvasRenderingContext2D,
    graph: Graph,
    visualState: VisualizationState,
    spacing: number = 1
) {
    const radius = 20;

    for (const node of graph.nodes) {
        const state = visualState.nodeStates.get(node.id) || NodeState.UNVISITED;
        const distance = visualState.distances.get(node.id) || Infinity;

        // Apply spacing to position
        const x = node.x * spacing;
        const y = node.y * spacing;

        // Determine node color based on state
        let fillColor = '#9ca3af'; // unvisited
        let strokeColor = '#6b7280';

        switch (state) {
            case NodeState.VISITED:
                fillColor = '#3b82f6';
                strokeColor = '#2563eb';
                break;
            case NodeState.CURRENT:
                fillColor = '#fbbf24';
                strokeColor = '#f59e0b';
                break;
            case NodeState.COMPLETE:
                fillColor = '#10b981';
                strokeColor = '#059669';
                break;
            case NodeState.PIVOT:
                fillColor = '#8b5cf6';
                strokeColor = '#7c3aed';
                break;
            case NodeState.PATH:
                fillColor = '#ef4444';
                strokeColor = '#dc2626';
                break;
        }

        // Draw node circle
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw node label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label || node.id.toString(), x, y);

        // Draw distance below node
        if (distance !== Infinity) {
            ctx.fillStyle = '#1e293b';
            ctx.font = '11px Inter, sans-serif';
            ctx.fillText(distance.toFixed(1), x, y + radius + 14);
        }
    }
}
