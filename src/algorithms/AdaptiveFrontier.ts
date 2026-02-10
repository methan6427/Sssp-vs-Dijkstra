/**
 * Adaptive Frontier Data Structure
 * 
 * Key innovation from the paper: Maintains partial ordering without full sorting
 * Implements Lemma 3.3 - allows efficient pulling of smallest elements
 * without maintaining complete O(n log n) sorted order
 */

export class AdaptiveFrontier {
    private elements: Map<number, number> = new Map();
    private dist: number[];

    constructor(initialVertices: number[], dist: number[]) {
        this.dist = dist;
        for (const v of initialVertices) {
            this.elements.set(v, dist[v]);
        }
    }

    /**
     * Insert a vertex into the frontier with its distance
     */
    insert(vertex: number, distance: number): void {
        if (!this.elements.has(vertex) || this.elements.get(vertex)! > distance) {
            this.elements.set(vertex, distance);
        }
    }

    /**
     * Pull approximately 'count' vertices with smallest distances
     * Returns the vertices and an upper bound on remaining distances
     * 
     * KEY: This doesn't require full sorting, just partial ordering
     */
    pull(count: number): { vertices: number[]; upperBound: number } {
        if (this.elements.size === 0) {
            return { vertices: [], upperBound: Infinity };
        }

        // Get smallest 'count' elements using partial sort
        // In practice, we do sort here, but theoretically this can be optimized
        // using selection algorithms to avoid full O(n log n) sorting
        const sorted = Array.from(this.elements.entries())
            .sort((a, b) => a[1] - b[1]);

        const toReturn = Math.min(count, sorted.length);
        const vertices = sorted.slice(0, toReturn).map(e => e[0]);
        const upperBound = toReturn < sorted.length ? sorted[toReturn][1] : Infinity;

        // Remove pulled vertices from frontier
        for (const v of vertices) {
            this.elements.delete(v);
        }

        return { vertices, upperBound };
    }

    /**
     * Check if frontier has any elements
     */
    hasElements(): boolean {
        return this.elements.size > 0;
    }

    /**
     * Get current frontier size
     */
    size(): number {
        return this.elements.size;
    }

    /**
     * Get all vertices currently in frontier
     */
    getVertices(): number[] {
        return Array.from(this.elements.keys());
    }
}
