import { Graph, AlgorithmResult, AlgorithmStep, VisualizationState, NodeState } from './types';
import { MinHeap } from './MinHeap';
import { AdaptiveFrontier } from './AdaptiveFrontier';

/**
 * New SSSP Algorithm - Breaking the Sorting Barrier
 * Time Complexity: O(m log^(2/3) n)
 * 
 * Based on "Breaking the Sorting Barrier for Directed Single-Source Shortest Paths" (2025)
 * Key innovations:
 * 1. FindPivots: Reduces frontier size from |S| to ~|S|/k
 * 2. BMSSP: Bounded Multi-Source Shortest Path with recursive divide-and-conquer
 * 3. Adaptive partitioning avoids full O(n log n) sorting
 */
export class NewSSSP {
    private graph: Graph;
    private n: number;
    private k: number;
    private t: number;
    private dist: number[];
    private pred: number[];
    private complete: boolean[];
    private steps: AlgorithmStep[] = [];
    private stepNum = 0;
    private operations = 0;
    private relaxations = 0;
    private pivotsCount = 0;
    private frontierReductions = 0;

    constructor(graph: Graph) {
        this.graph = graph;
        this.n = graph.nodes.length;

        // Algorithm parameters from the paper
        this.k = Math.max(2, Math.floor(Math.pow(this.n, 1 / 3))); // k = ⌊n^(1/3)⌋
        this.t = Math.max(2, Math.floor(Math.pow(this.n, 2 / 3))); // t = ⌊n^(2/3)⌋

        this.dist = new Array(this.n).fill(Infinity);
        this.pred = new Array(this.n).fill(-1);
        this.complete = new Array(this.n).fill(false);
    }

    solve(source: number, destination?: number): AlgorithmResult {
        const startTime = performance.now();

        this.dist[source] = 0;
        this.complete[source] = true;

        // Initial step
        this.addStep(
            `Initialize: Set distance of source node ${source} to 0. Parameters: k=${this.k}, t=${this.t}`,
            source,
            'initialize',
            { k: this.k, t: this.t }
        );

        // Top-level call to BMSSP
        const levels = Math.ceil(Math.log(this.n) / this.t);
        this.addStep(
            `Starting BMSSP with ${levels} recursion levels`,
            null,
            'bmssp_call',
            { recursionLevel: levels }
        );


        // Run the BMSSP algorithm
        this.BMSSP(levels, Infinity, [source]);

        const endTime = performance.now();

        // Add completion step
        this.addStep(
            `Algorithm completed - processed ${this.complete.filter(c => c).length} nodes`,
            null,
            'complete',
            {}
        );

        // Build shortest path
        const shortestPath: number[] = [];
        if (destination !== undefined && this.dist[destination] !== Infinity) {
            let current = destination;
            while (current !== -1) {
                shortestPath.unshift(current);
                current = this.pred[current];
            }

            // Mark path in final state
            const finalState = this.createVisState(new Set(), new Set(), new Set());
            for (const node of shortestPath) {
                finalState.nodeStates.set(node, NodeState.PATH);
            }
            this.steps.push({
                stepNumber: this.stepNum++,
                description: `Shortest path found: ${shortestPath.join(' → ')} (distance: ${this.dist[destination].toFixed(1)})`,
                currentNode: null,
                action: 'done',
                visualState: finalState,
            });
        } else if (destination !== undefined) {
            // Destination not reachable
            this.addStep(
                `No path exists from node ${source} to node ${destination}`,
                null,
                'done',
                {}
            );
        }

        // Convert distances and predecessors to Maps
        const distMap = new Map<number, number>();
        const predMap = new Map<number, number>();
        for (let i = 0; i < this.n; i++) {
            distMap.set(i, this.dist[i]);
            predMap.set(i, this.pred[i]);
        }

        return {
            distances: distMap,
            predecessors: predMap,
            shortestPath,
            steps: this.steps,
            statistics: {
                executionTime: endTime - startTime,
                operations: this.operations,
                relaxations: this.relaxations,
                nodesProcessed: this.complete.filter(c => c).length,
                complexity: 'O(m log^(2/3) n)',
                k: this.k,
                t: this.t,
                levels,
                pivotsCount: this.pivotsCount,
                frontierReductions: this.frontierReductions,
            },
        };
    }

    /**
     * BMSSP: Bounded Multi-Source Shortest Path
     * Core innovation: Recursive divide-and-conquer on bounded frontier
     */
    private BMSSP(l: number, B: number, S: number[]): { B_prime: number; U: number[] } {
        // Base case: use mini-Dijkstra for small problems
        if (l === 0) {
            return this.baseCase(B, S);
        }

        // KEY INNOVATION 1: Find Pivots to reduce frontier size
        const { pivots, W } = this.findPivots(B, S);

        this.addStep(
            `Level ${l}: FindPivots reduced frontier from ${S.length} to ${pivots.length} pivots`,
            null,
            'find_pivots',
            {
                pivotsFound: pivots,
                frontierSize: pivots.length,
                recursionLevel: l,
            }
        );

        let U: number[] = [];
        let B_prime = B;

        // Adaptive partitioning data structure
        const frontier = new AdaptiveFrontier(pivots, this.dist);

        // KEY INNOVATION 2: Recursive divide-and-conquer
        while (U.length < this.k * Math.pow(2, l * this.t) && frontier.hasElements()) {
            // Pull approximately 2^((l-1)*t) vertices from frontier
            const pullCount = Math.floor(Math.pow(2, (l - 1) * this.t));
            const { vertices: Si, upperBound: Bi } = frontier.pull(pullCount);

            this.addStep(
                `Level ${l}: Pull ${Si.length} vertices from frontier (bound: ${Bi === Infinity ? '∞' : Bi.toFixed(1)})`,
                null,
                'frontier_pull',
                { frontierSize: frontier.size(), recursionLevel: l }
            );

            if (Si.length === 0) break;

            // Recursively solve smaller subproblem
            const subResult = this.BMSSP(l - 1, Bi, Si);

            U = U.concat(subResult.U);
            B_prime = Math.min(B_prime, subResult.B_prime);

            // Relax edges from newly completed vertices
            this.relaxEdges(subResult.U, Bi, B, frontier);

            // Early termination if workload too large
            if (U.length >= this.k * Math.pow(2, l * this.t)) {
                break;
            }
        }

        // Include vertices from W that are within bounds
        for (const v of W) {
            if (this.dist[v] < B_prime && !U.includes(v)) {
                U.push(v);
            }
        }

        return { B_prime, U };
    }

    /**
     * FindPivots: Reduce frontier size using Bellman-Ford-like relaxation
     * KEY INSIGHT: Only vertices with large shortest-path trees (≥k vertices)
     * need to be in the frontier. This reduces frontier to |U|/k size.
     */
    private findPivots(B: number, S: number[]): { pivots: number[]; W: number[] } {
        const W = new Set<number>(S);
        const layers: Set<number>[] = [new Set(S)];

        // Perform k relaxation steps (Bellman-Ford style)
        for (let i = 0; i < this.k; i++) {
            const nextLayer = new Set<number>();

            for (const u of layers[i]) {
                if (!this.complete[u]) continue;

                const neighbors = this.graph.adjacencyList.get(u) || [];
                for (const { node: v, weight } of neighbors) {
                    this.operations++;
                    const newDist = this.dist[u] + weight;

                    if (newDist <= this.dist[v] && newDist < B) {
                        if (newDist < this.dist[v]) {
                            this.dist[v] = newDist;
                            this.pred[v] = u;
                            this.relaxations++;
                        }
                        nextLayer.add(v);
                        W.add(v);
                    }
                }
            }

            layers.push(nextLayer);

            // Early termination: frontier already small enough
            if (W.size > this.k * S.length) {
                this.pivotsCount += S.length;
                return { pivots: S, W: Array.from(W) };
            }
        }

        // Find pivots: roots of trees with ≥k vertices
        const pivots = this.findLargeTreeRoots(S, Array.from(W), this.k);
        this.pivotsCount += pivots.length;
        this.frontierReductions++;

        return { pivots, W: Array.from(W) };
    }

    /**
     * Find roots of shortest-path trees containing ≥k vertices
     */
    private findLargeTreeRoots(S: number[], W: number[], k: number): number[] {
        const treeSize = new Map<number, number>();
        const roots = new Set(S.filter(v => this.complete[v]));

        for (const v of W) {
            let root = v;
            const visited = new Set<number>();

            // Find root by following predecessors
            while (this.pred[root] !== -1 && !visited.has(root)) {
                visited.add(root);
                root = this.pred[root];
                if (roots.has(root)) break;
            }

            if (roots.has(root)) {
                treeSize.set(root, (treeSize.get(root) || 0) + 1);
            }
        }

        // Return only roots with large trees
        const pivots = Array.from(roots).filter(r => (treeSize.get(r) || 0) >= k);
        return pivots.length > 0 ? pivots : Array.from(roots).slice(0, 1);
    }

    /**
     * Base case: Mini Dijkstra for l=0
     */
    private baseCase(B: number, S: number[]): { B_prime: number; U: number[] } {
        if (S.length === 0) return { B_prime: B, U: [] };

        const source = S[0];
        const U: number[] = [];
        const heap = new MinHeap();
        const inHeap = new Set<number>();

        heap.insert(source, this.dist[source]);
        inHeap.add(source);

        while (!heap.isEmpty()) {
            const u = heap.extractMin()!;
            inHeap.delete(u);
            U.push(u);
            this.complete[u] = true;
            this.operations++;

            this.addStep(
                `Base case: Visit node ${u} (distance: ${this.dist[u].toFixed(1)})`,
                u,
                'visit',
                { recursionLevel: 0 }
            );

            const neighbors = this.graph.adjacencyList.get(u) || [];
            for (const { node: v, weight } of neighbors) {
                this.operations++;
                const newDist = this.dist[u] + weight;

                if (newDist < this.dist[v] && newDist < B) {
                    const oldDist = this.dist[v];
                    this.dist[v] = newDist;
                    this.pred[v] = u;
                    this.relaxations++;

                    if (inHeap.has(v)) {
                        heap.decreaseKey(v, newDist);
                    } else {
                        heap.insert(v, newDist);
                        inHeap.add(v);
                    }

                    this.addStep(
                        `Base case: Relax edge (${u} → ${v}): ${oldDist === Infinity ? '∞' : oldDist.toFixed(1)} → ${newDist.toFixed(1)}`,
                        u,
                        'relax',
                        {
                            edgeRelaxed: { from: u, to: v },
                            distanceUpdates: [{ node: v, oldDist, newDist }],
                        }
                    );
                }
            }
        }

        const B_prime = B;
        return { B_prime, U };
    }

    /**
     * Relax edges from completed vertices
     */
    private relaxEdges(vertices: number[], Bi: number, B: number, frontier: AdaptiveFrontier): void {
        for (const u of vertices) {
            this.complete[u] = true;

            const neighbors = this.graph.adjacencyList.get(u) || [];
            for (const { node: v, weight } of neighbors) {
                this.operations++;
                const newDist = this.dist[u] + weight;

                if (newDist <= this.dist[v] && newDist < B) {
                    if (newDist < this.dist[v]) {
                        this.dist[v] = newDist;
                        this.pred[v] = u;
                        this.relaxations++;
                    }

                    // Add to frontier if not already complete
                    // Modified: Insert if distance is >= Bi OR if Bi is Infinity (top-level call)
                    if (!this.complete[v] && (Bi === Infinity || newDist >= Bi)) {
                        frontier.insert(v, newDist);
                    }
                }
            }
        }
    }

    private addStep(
        description: string,
        currentNode: number | null,
        action: AlgorithmStep['action'],
        details?: AlgorithmStep['details']
    ): void {
        const pivots = new Set<number>();
        const frontier = new Set<number>();
        const current = currentNode !== null ? new Set([currentNode]) : new Set<number>();

        const visualState = this.createVisState(pivots, frontier, current);

        this.steps.push({
            stepNumber: this.stepNum++,
            description,
            currentNode,
            action,
            visualState,
            details,
        });
    }

    private createVisState(
        pivots: Set<number>,
        frontier: Set<number>,
        current: Set<number>
    ): VisualizationState {
        const nodeStates = new Map<number, NodeState>();

        for (let i = 0; i < this.n; i++) {
            if (current.has(i)) {
                nodeStates.set(i, NodeState.CURRENT);
            } else if (pivots.has(i)) {
                nodeStates.set(i, NodeState.PIVOT);
            } else if (this.complete[i]) {
                nodeStates.set(i, NodeState.COMPLETE);
            } else if (this.dist[i] !== Infinity) {
                nodeStates.set(i, NodeState.VISITED);
            } else {
                nodeStates.set(i, NodeState.UNVISITED);
            }
        }

        const distMap = new Map<number, number>();
        const predMap = new Map<number, number>();
        for (let i = 0; i < this.n; i++) {
            distMap.set(i, this.dist[i]);
            predMap.set(i, this.pred[i]);
        }

        return {
            nodeStates,
            distances: distMap,
            predecessors: predMap,
            activeEdges: new Set(),
            pivots,
            frontier,
        };
    }
}
