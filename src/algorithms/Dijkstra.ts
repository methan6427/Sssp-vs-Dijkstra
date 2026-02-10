import { Graph, AlgorithmResult, AlgorithmStep, VisualizationState, NodeState } from './types';
import { MinHeap } from './MinHeap';

/**
 * Dijkstra's Algorithm - Traditional approach
 * Time Complexity: O(m + n log n) with binary heap
 * 
 * Returns step-by-step execution for visualization
 */
export function dijkstra(
    graph: Graph,
    source: number,
    destination?: number
): AlgorithmResult {
    const startTime = performance.now();
    const n = graph.nodes.length;
    const steps: AlgorithmStep[] = [];

    // Initialize
    const dist = new Map<number, number>();
    const visited = new Map<number, boolean>();
    const pred = new Map<number, number>();
    const heap = new MinHeap();

    let operations = 0;
    let heapOps = 0;
    let relaxations = 0;

    // Initialize distances
    for (const node of graph.nodes) {
        dist.set(node.id, Infinity);
        visited.set(node.id, false);
        pred.set(node.id, -1);
    }

    dist.set(source, 0);
    heap.insert(source, 0);
    heapOps++;

    // Initial step
    const initialState = createVisState(dist, pred, visited, new Set(), new Set(), new Set());
    steps.push({
        stepNumber: 0,
        description: `Initialize: Set distance of source node ${source} to 0, all others to ∞`,
        currentNode: source,
        action: 'initialize',
        visualState: initialState,
    });

    let stepNum = 1;

    while (!heap.isEmpty()) {
        const u = heap.extractMin()!;
        operations++;
        heapOps++;

        if (visited.get(u)) continue;
        visited.set(u, true);

        // Log visit step
        const activeEdges = new Set<string>();
        const currentState = createVisState(dist, pred, visited, activeEdges, new Set([u]), new Set());
        steps.push({
            stepNumber: stepNum++,
            description: `Visit node ${u} with distance ${dist.get(u)}`,
            currentNode: u,
            action: 'visit',
            visualState: currentState,
        });

        // Early termination if destination reached
        if (destination !== undefined && u === destination) {
            break;
        }

        // Relax edges
        const neighbors = graph.adjacencyList.get(u) || [];
        for (const { node: v, weight } of neighbors) {
            operations++;
            const newDist = dist.get(u)! + weight;

            if (newDist < dist.get(v)!) {
                const oldDist = dist.get(v)!;
                dist.set(v, newDist);
                pred.set(v, u);
                relaxations++;

                if (heap.contains(v)) {
                    heap.decreaseKey(v, newDist);
                    heapOps++;
                } else if (!visited.get(v)) {
                    heap.insert(v, newDist);
                    heapOps++;
                }

                // Log relaxation step
                const relaxEdges = new Set<string>([`${u}-${v}`]);
                const relaxState = createVisState(dist, pred, visited, relaxEdges, new Set([u]), new Set());
                steps.push({
                    stepNumber: stepNum++,
                    description: `Relax edge (${u} → ${v}): distance updated from ${oldDist === Infinity ? '∞' : oldDist} to ${newDist}`,
                    currentNode: u,
                    action: 'relax',
                    visualState: relaxState,
                    details: {
                        distanceUpdates: [{ node: v, oldDist, newDist }],
                        edgeRelaxed: { from: u, to: v },
                    },
                });
            }
        }

        // Mark complete
        const completeState = createVisState(dist, pred, visited, new Set(), new Set(), new Set([u]));
        completeState.nodeStates.set(u, NodeState.COMPLETE);
        steps.push({
            stepNumber: stepNum++,
            description: `Node ${u} completed - final distance is ${dist.get(u)}`,
            currentNode: u,
            action: 'complete',
            visualState: completeState,
        });
    }

    const endTime = performance.now();

    // Build shortest path
    const shortestPath: number[] = [];
    if (destination !== undefined && dist.get(destination) !== Infinity) {
        let current = destination;
        while (current !== -1) {
            shortestPath.unshift(current);
            current = pred.get(current)!;
        }
    }

    // Mark path in final state
    if (shortestPath.length > 0) {
        const finalState = cloneVisState(steps[steps.length - 1].visualState);
        for (const node of shortestPath) {
            finalState.nodeStates.set(node, NodeState.PATH);
        }
        steps.push({
            stepNumber: stepNum++,
            description: `Shortest path found: ${shortestPath.join(' → ')} (distance: ${dist.get(destination!)})`,
            currentNode: null,
            action: 'done',
            visualState: finalState,
        });
    }

    return {
        distances: dist,
        predecessors: pred,
        shortestPath,
        steps,
        statistics: {
            executionTime: endTime - startTime,
            operations,
            heapOperations: heapOps,
            relaxations,
            nodesProcessed: Array.from(visited.values()).filter(v => v).length,
            complexity: 'O(m + n log n)',
        },
    };
}

function createVisState(
    dist: Map<number, number>,
    pred: Map<number, number>,
    visited: Map<number, boolean>,
    activeEdges: Set<string>,
    current: Set<number>,
    complete: Set<number>
): VisualizationState {
    const nodeStates = new Map<number, NodeState>();

    for (const [node, isVisited] of visited.entries()) {
        if (complete.has(node)) {
            nodeStates.set(node, NodeState.COMPLETE);
        } else if (current.has(node)) {
            nodeStates.set(node, NodeState.CURRENT);
        } else if (isVisited) {
            nodeStates.set(node, NodeState.VISITED);
        } else {
            nodeStates.set(node, NodeState.UNVISITED);
        }
    }

    return {
        nodeStates,
        distances: new Map(dist),
        predecessors: new Map(pred),
        activeEdges: new Set(activeEdges),
        pivots: new Set(),
        frontier: new Set(),
    };
}

function cloneVisState(state: VisualizationState): VisualizationState {
    return {
        nodeStates: new Map(state.nodeStates),
        distances: new Map(state.distances),
        predecessors: new Map(state.predecessors),
        activeEdges: new Set(state.activeEdges),
        pivots: new Set(state.pivots),
        frontier: new Set(state.frontier),
    };
}
