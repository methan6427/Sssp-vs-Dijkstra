import { Node, Edge, Graph } from './types';

/**
 * Graph class with adjacency list representation
 * Supports weighted directed graphs
 */
export class GraphClass {
    private nodeIdCounter = 0;
    nodes: Node[] = [];
    edges: Edge[] = [];
    adjacencyList: Map<number, Array<{ node: number; weight: number }>> = new Map();

    addNode(x: number, y: number, label?: string): number {
        const id = this.nodeIdCounter++;
        this.nodes.push({ id, x, y, label: label || `${id}` });
        this.adjacencyList.set(id, []);
        return id;
    }

    removeNode(id: number): void {
        // Remove the node
        this.nodes = this.nodes.filter(n => n.id !== id);

        // Remove all edges connected to this node
        this.edges = this.edges.filter(e => e.from !== id && e.to !== id);

        // Update adjacency list
        this.adjacencyList.delete(id);
        for (const [nodeId, neighbors] of this.adjacencyList.entries()) {
            this.adjacencyList.set(
                nodeId,
                neighbors.filter(n => n.node !== id)
            );
        }
    }

    addEdge(from: number, to: number, weight: number): void {
        // Check if edge already exists
        const existingEdge = this.edges.find(e => e.from === from && e.to === to);
        if (existingEdge) {
            existingEdge.weight = weight;
            // Update adjacency list
            const neighbors = this.adjacencyList.get(from) || [];
            const neighbor = neighbors.find(n => n.node === to);
            if (neighbor) neighbor.weight = weight;
        } else {
            this.edges.push({ from, to, weight });
            const neighbors = this.adjacencyList.get(from) || [];
            neighbors.push({ node: to, weight });
            this.adjacencyList.set(from, neighbors);
        }
    }

    removeEdge(from: number, to: number): void {
        this.edges = this.edges.filter(e => !(e.from === from && e.to === to));
        const neighbors = this.adjacencyList.get(from) || [];
        this.adjacencyList.set(
            from,
            neighbors.filter(n => n.node !== to)
        );
    }

    updateEdgeWeight(from: number, to: number, weight: number): void {
        const edge = this.edges.find(e => e.from === from && e.to === to);
        if (edge) {
            edge.weight = weight;
            const neighbors = this.adjacencyList.get(from) || [];
            const neighbor = neighbors.find(n => n.node === to);
            if (neighbor) neighbor.weight = weight;
        }
    }

    getNode(id: number): Node | undefined {
        return this.nodes.find(n => n.id === id);
    }

    getEdge(from: number, to: number): Edge | undefined {
        return this.edges.find(e => e.from === from && e.to === to);
    }

    toGraph(): Graph {
        return {
            nodes: [...this.nodes],
            edges: [...this.edges],
            adjacencyList: new Map(this.adjacencyList),
        };
    }

    clone(): GraphClass {
        const g = new GraphClass();
        g.nodeIdCounter = this.nodeIdCounter;
        g.nodes = this.nodes.map(n => ({ ...n }));
        g.edges = this.edges.map(e => ({ ...e }));
        g.adjacencyList = new Map();
        for (const [key, value] of this.adjacencyList.entries()) {
            g.adjacencyList.set(key, value.map(v => ({ ...v })));
        }
        return g;
    }
}

/**
 * Generate a random graph with specified number of nodes and density
 */
export function generateRandomGraph(
    nodeCount: number,
    density: number = 0.3,
    maxWeight: number = 20,
    width: number = 800,
    height: number = 600
): GraphClass {
    const graph = new GraphClass();

    // Add nodes in a circular layout
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    for (let i = 0; i < nodeCount; i++) {
        const angle = (2 * Math.PI * i) / nodeCount;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        graph.addNode(x, y, `${i}`);
    }

    // Add edges based on density
    const possibleEdges = nodeCount * (nodeCount - 1);
    const targetEdges = Math.floor(possibleEdges * density);

    let edgesAdded = 0;
    const attempts = targetEdges * 3; // Limit attempts to avoid infinite loop

    for (let attempt = 0; attempt < attempts && edgesAdded < targetEdges; attempt++) {
        const from = Math.floor(Math.random() * nodeCount);
        const to = Math.floor(Math.random() * nodeCount);

        if (from !== to && !graph.getEdge(from, to)) {
            const weight = Math.floor(Math.random() * maxWeight) + 1;
            graph.addEdge(from, to, weight);
            edgesAdded++;
        }
    }

    return graph;
}

/**
 * Generate a grid graph
 */
export function generateGridGraph(
    rows: number,
    cols: number,
    width: number = 800,
    height: number = 600
): GraphClass {
    const graph = new GraphClass();
    const padding = 100;
    const cellWidth = (width - 2 * padding) / (cols - 1);
    const cellHeight = (height - 2 * padding) / (rows - 1);

    // Create nodes
    const nodeIds: number[][] = [];
    for (let row = 0; row < rows; row++) {
        nodeIds[row] = [];
        for (let col = 0; col < cols; col++) {
            const x = padding + col * cellWidth;
            const y = padding + row * cellHeight;
            const id = graph.addNode(x, y, `${row * cols + col}`);
            nodeIds[row][col] = id;
        }
    }

    // Add edges (bidirectional: up, down, left, right)
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const currentId = nodeIds[row][col];

            // Right edge (bidirectional)
            if (col < cols - 1) {
                const rightId = nodeIds[row][col + 1];
                const weight = Math.floor(Math.random() * 10) + 1;
                graph.addEdge(currentId, rightId, weight);
                graph.addEdge(rightId, currentId, weight); // Reverse edge
            }

            // Down edge (bidirectional)
            if (row < rows - 1) {
                const downId = nodeIds[row + 1][col];
                const weight = Math.floor(Math.random() * 10) + 1;
                graph.addEdge(currentId, downId, weight);
                graph.addEdge(downId, currentId, weight); // Reverse edge
            }
        }
    }

    return graph;
}

/**
 * Create example graph from the reference implementation
 */
export function createExampleGraph(width: number = 800, height: number = 600): GraphClass {
    const graph = new GraphClass();

    // Position nodes nicely
    const positions = [
        { x: 100, y: 300 },  // 0
        { x: 250, y: 200 },  // 1
        { x: 250, y: 400 },  // 2
        { x: 400, y: 150 },  // 3
        { x: 400, y: 450 },  // 4
        { x: 550, y: 250 },  // 5
        { x: 650, y: 350 },  // 6
        { x: 550, y: 100 },  // 7
        { x: 750, y: 400 },  // 8
        { x: 750, y: 200 },  // 9
    ];

    // Add nodes
    for (let i = 0; i < 10; i++) {
        graph.addNode(positions[i].x, positions[i].y, `${i}`);
    }

    // Add edges (same as reference implementation)
    graph.addEdge(0, 1, 4);
    graph.addEdge(0, 2, 2);
    graph.addEdge(1, 3, 5);
    graph.addEdge(2, 1, 1);
    graph.addEdge(2, 4, 10);
    graph.addEdge(3, 5, 3);
    graph.addEdge(4, 3, 2);
    graph.addEdge(4, 5, 1);
    graph.addEdge(5, 6, 2);
    graph.addEdge(3, 7, 6);
    graph.addEdge(6, 8, 3);
    graph.addEdge(7, 9, 1);
    graph.addEdge(8, 9, 2);

    return graph;
}
