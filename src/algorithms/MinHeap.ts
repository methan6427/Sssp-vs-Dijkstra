/**
 * Min-Heap implementation for Dijkstra's algorithm
 * Provides O(log n) insert, extractMin, and decreaseKey operations
 */

interface HeapNode {
    vertex: number;
    distance: number;
}

export class MinHeap {
    private heap: HeapNode[] = [];
    private positions: Map<number, number> = new Map();

    insert(vertex: number, distance: number): void {
        this.heap.push({ vertex, distance });
        this.positions.set(vertex, this.heap.length - 1);
        this.bubbleUp(this.heap.length - 1);
    }

    extractMin(): number | null {
        if (this.heap.length === 0) return null;

        const min = this.heap[0].vertex;
        const last = this.heap.pop()!;
        this.positions.delete(min);

        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.positions.set(last.vertex, 0);
            this.bubbleDown(0);
        }

        return min;
    }

    decreaseKey(vertex: number, newDistance: number): void {
        const idx = this.positions.get(vertex);
        if (idx !== undefined) {
            this.heap[idx].distance = newDistance;
            this.bubbleUp(idx);
        }
    }

    contains(vertex: number): boolean {
        return this.positions.has(vertex);
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    size(): number {
        return this.heap.length;
    }

    private bubbleUp(idx: number): void {
        while (idx > 0) {
            const parent = Math.floor((idx - 1) / 2);
            if (this.heap[parent].distance <= this.heap[idx].distance) break;

            this.swap(idx, parent);
            idx = parent;
        }
    }

    private bubbleDown(idx: number): void {
        while (true) {
            const left = 2 * idx + 1;
            const right = 2 * idx + 2;
            let smallest = idx;

            if (left < this.heap.length && this.heap[left].distance < this.heap[smallest].distance) {
                smallest = left;
            }
            if (right < this.heap.length && this.heap[right].distance < this.heap[smallest].distance) {
                smallest = right;
            }

            if (smallest === idx) break;

            this.swap(idx, smallest);
            idx = smallest;
        }
    }

    private swap(i: number, j: number): void {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;

        this.positions.set(this.heap[i].vertex, i);
        this.positions.set(this.heap[j].vertex, j);
    }
}
