import { useState } from 'react';
import { GraphClass, createExampleGraph, generateRandomGraph, generateGridGraph } from '../algorithms/Graph';

interface GraphSelectorProps {
    onGraphChange: (graph: GraphClass) => void;
    onSourceChange: (source: number) => void;
    onDestinationChange: (destination: number) => void;
    source: number;
    destination: number;
    nodeCount: number;
}

export default function GraphSelector({
    onGraphChange,
    onSourceChange,
    onDestinationChange,
    source,
    destination,
    nodeCount,
}: GraphSelectorProps) {
    const [randomSize, setRandomSize] = useState(15);
    const [randomDensity, setRandomDensity] = useState(0.3);

    const loadPreset = (preset: string) => {
        let graph: GraphClass;
        switch (preset) {
            case 'example':
                graph = createExampleGraph();
                break;
            case 'grid':
                graph = generateGridGraph(4, 4);
                break;
            case 'sparse':
                graph = generateRandomGraph(20, 0.15);
                break;
            case 'dense':
                graph = generateRandomGraph(15, 0.5);
                break;
            default:
                return;
        }
        onGraphChange(graph);
        onSourceChange(0);
        onDestinationChange(graph.nodes.length - 1);
    };

    const handleGenerateRandom = () => {
        const graph = generateRandomGraph(randomSize, randomDensity);
        onGraphChange(graph);
        onSourceChange(0);
        onDestinationChange(Math.min(randomSize - 1, graph.nodes.length - 1));
    };

    return (
        <div className="card space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Graph & Node Selection
            </h3>

            {/* Preset graphs */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Preset Graphs
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => loadPreset('example')} className="btn btn-secondary text-sm">
                        Example (10)
                    </button>
                    <button onClick={() => loadPreset('grid')} className="btn btn-secondary text-sm">
                        Grid (16)
                    </button>
                    <button onClick={() => loadPreset('sparse')} className="btn btn-secondary text-sm">
                        Sparse (20)
                    </button>
                    <button onClick={() => loadPreset('dense')} className="btn btn-secondary text-sm">
                        Dense (15)
                    </button>
                </div>
            </div>

            {/* Random graph generator */}
            <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Generate Random Graph
                </label>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Nodes:</span>
                        <span className="font-mono">{randomSize}</span>
                    </div>
                    <input
                        type="range"
                        min="5"
                        max="100"
                        value={randomSize}
                        onChange={(e) => setRandomSize(Number(e.target.value))}
                        className="w-full"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Density:</span>
                        <span className="font-mono">{(randomDensity * 125).toFixed(0)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0.1"
                        max="0.8"
                        step="0.05"
                        value={randomDensity}
                        onChange={(e) => setRandomDensity(Number(e.target.value))}
                        className="w-full"
                    />
                </div>

                <button onClick={handleGenerateRandom} className="btn btn-primary w-full">
                    Generate
                </button>
            </div>

            {/* Node selection */}
            <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Source Node
                    </label>
                    <select
                        value={source}
                        onChange={(e) => onSourceChange(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        {Array.from({ length: nodeCount }, (_, i) => (
                            <option key={i} value={i}>
                                Node {i}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Destination Node
                    </label>
                    <select
                        value={destination}
                        onChange={(e) => onDestinationChange(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        {Array.from({ length: nodeCount }, (_, i) => (
                            <option key={i} value={i}>
                                Node {i}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Node States
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="legend-item">
                        <div className="legend-color bg-gray-400" />
                        <span>Unvisited</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color bg-blue-500" />
                        <span>Visited</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color bg-yellow-400" />
                        <span>Current</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color bg-green-500" />
                        <span>Complete</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color bg-purple-600" />
                        <span>Pivot</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color bg-red-500" />
                        <span>Path</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
