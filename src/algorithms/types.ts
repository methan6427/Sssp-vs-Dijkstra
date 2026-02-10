// Core type definitions for the SSSP visualization application

export interface Node {
    id: number;
    x: number;
    y: number;
    label?: string;
}

export interface Edge {
    from: number;
    to: number;
    weight: number;
}

export interface Graph {
    nodes: Node[];
    edges: Edge[];
    adjacencyList: Map<number, Array<{ node: number; weight: number }>>;
}

export enum NodeState {
    UNVISITED = 'unvisited',
    VISITED = 'visited',
    CURRENT = 'current',
    COMPLETE = 'complete',
    PIVOT = 'pivot',
    PATH = 'path',
}

export interface VisualizationState {
    nodeStates: Map<number, NodeState>;
    distances: Map<number, number>;
    predecessors: Map<number, number>;
    activeEdges: Set<string>; // "from-to" format
    pivots: Set<number>;
    frontier: Set<number>;
}

export interface AlgorithmStep {
    stepNumber: number;
    description: string;
    currentNode: number | null;
    action: 'initialize' | 'visit' | 'relax' | 'complete' | 'find_pivots' | 'bmssp_call' | 'frontier_pull' | 'done';
    visualState: VisualizationState;
    details?: {
        distanceUpdates?: Array<{ node: number; oldDist: number; newDist: number }>;
        edgeRelaxed?: { from: number; to: number };
        pivotsFound?: number[];
        frontierSize?: number;
        recursionLevel?: number;
        k?: number;
        t?: number;
    };
}

export interface AlgorithmResult {
    distances: Map<number, number>;
    predecessors: Map<number, number>;
    shortestPath: number[];
    steps: AlgorithmStep[];
    statistics: AlgorithmStatistics;
}

export interface AlgorithmStatistics {
    executionTime: number; // milliseconds
    operations: number; // total operations performed
    heapOperations?: number; // for Dijkstra
    relaxations: number; // edge relaxations
    nodesProcessed: number;
    complexity: string; // e.g., "O(m + n log n)"
    // New SSSP specific
    k?: number;
    t?: number;
    levels?: number;
    pivotsCount?: number;
    frontierReductions?: number;
}

export type AlgorithmType = 'dijkstra' | 'new-sssp';

export interface AnimationConfig {
    speed: number; // milliseconds per step
    isPlaying: boolean;
    currentStep: number;
    canStepForward: boolean;
    canStepBack: boolean;
}
