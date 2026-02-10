import { useState, useEffect, useCallback } from 'react';
import GraphCanvas from './components/GraphCanvas';
import ControlPanel from './components/ControlPanel';
import ComparisonPanel from './components/ComparisonPanel';
import InfoPanel from './components/InfoPanel';
import GraphSelector from './components/GraphSelector';
import { GraphClass, createExampleGraph } from './algorithms/Graph';
import { dijkstra } from './algorithms/Dijkstra';
import { NewSSSP } from './algorithms/NewSSSP';
import { AlgorithmResult, AlgorithmType } from './algorithms/types';

function App() {
    // Graph state
    const [graph, setGraph] = useState<GraphClass>(() => createExampleGraph());
    const [source, setSource] = useState(0);
    const [destination, setDestination] = useState(9);

    // Algorithm state
    const [algorithmType, setAlgorithmType] = useState<AlgorithmType>('dijkstra');
    const [dijkstraResult, setDijkstraResult] = useState<AlgorithmResult | null>(null);
    const [newSSSPResult, setNewSSSPResult] = useState<AlgorithmResult | null>(null);
    const [currentResult, setCurrentResult] = useState<AlgorithmResult | null>(null);

    // Animation state
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(500);

    // Dark mode
    const [isDark, setIsDark] = useState(true);

    // Run algorithm
    const runAlgorithm = useCallback((type: AlgorithmType) => {
        const g = graph.toGraph();

        if (type === 'dijkstra') {
            const result = dijkstra(g, source, destination);
            setDijkstraResult(result);
            setCurrentResult(result);
        } else {
            const algo = new NewSSSP(g);
            const result = algo.solve(source, destination);
            setNewSSSPResult(result);
            setCurrentResult(result);
        }

        setCurrentStep(0);
        setIsPlaying(false);
        setAlgorithmType(type);
    }, [graph, source, destination]);

    // Animation loop
    useEffect(() => {
        if (!isPlaying || !currentResult) return;

        const interval = setInterval(() => {
            setCurrentStep((prev) => {
                if (prev >= currentResult.steps.length - 1) {
                    setIsPlaying(false);
                    return prev;
                }
                return prev + 1;
            });
        }, speed);

        return () => clearInterval(interval);
    }, [isPlaying, currentResult, speed]);

    // Controls
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleReset = () => {
        setCurrentStep(0);
        setIsPlaying(false);
    };
    const handleStepForward = () => {
        if (currentResult && currentStep < currentResult.steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };
    const handleStepBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Dark mode toggle
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    const currentStepData = currentResult?.steps[currentStep] || null;
    const visualState = currentStepData?.visualState || {
        nodeStates: new Map(),
        distances: new Map(),
        predecessors: new Map(),
        activeEdges: new Set(),
        pivots: new Set(),
        frontier: new Set(),
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                SSSP vs Dijkstra Visualization
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Comparing O(m + n log n) with O(m log^(2/3) n) breakthrough algorithm
                            </p>
                        </div>
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="btn btn-secondary"
                        >
                            {isDark ? '☀️ Light' : '🌙 Dark'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* Algorithm selection */}
                <div className="card mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex space-x-3">
                            <button
                                onClick={() => runAlgorithm('dijkstra')}
                                className={`btn ${algorithmType === 'dijkstra' ? 'btn-primary' : 'btn-secondary'
                                    }`}
                            >
                                Run Dijkstra
                            </button>
                            <button
                                onClick={() => runAlgorithm('new-sssp')}
                                className={`btn ${algorithmType === 'new-sssp' ? 'btn-primary' : 'btn-secondary'
                                    }`}
                            >
                                Run New SSSP
                            </button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => {
                                    runAlgorithm('dijkstra');
                                    setTimeout(() => runAlgorithm('new-sssp'), 0);
                                }}
                                className="btn btn-success"
                            >
                                Run Both (Compare)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Graph Visualization - Full Width Section */}
                <div className="mb-6">
                    <div className="card">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Graph Visualization
                        </h3>
                        <div className="flex justify-center">
                            <GraphCanvas
                                graph={graph.toGraph()}
                                visualState={visualState}
                                width={1000}
                                height={600}
                            />
                        </div>
                    </div>
                </div>

                {/* Controls and Info Panels - Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left column - Graph selector and controls */}
                    <div className="space-y-6">
                        <GraphSelector
                            onGraphChange={setGraph}
                            onSourceChange={setSource}
                            onDestinationChange={setDestination}
                            source={source}
                            destination={destination}
                            nodeCount={graph.nodes.length}
                        />
                        <ControlPanel
                            isPlaying={isPlaying}
                            onPlay={handlePlay}
                            onPause={handlePause}
                            onReset={handleReset}
                            onStepForward={handleStepForward}
                            onStepBack={handleStepBack}
                            canStepForward={
                                currentResult ? currentStep < currentResult.steps.length - 1 : false
                            }
                            canStepBack={currentStep > 0}
                            speed={speed}
                            onSpeedChange={setSpeed}
                            currentStep={currentStep}
                            totalSteps={currentResult?.steps.length || 0}
                        />
                    </div>

                    {/* Right column - Info and comparison */}
                    <div className="space-y-6">
                        <InfoPanel
                            currentStep={currentStepData}
                            algorithmType={algorithmType}
                        />
                        <ComparisonPanel
                            dijkstraStats={dijkstraResult?.statistics || null}
                            newSSSPStats={newSSSPResult?.statistics || null}
                        />
                    </div>
                </div>

                {/* Footer info */}
                <div className="mt-6 card">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                        About This Visualization
                    </h3>
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <p>
                            This tool demonstrates the breakthrough SSSP algorithm from the 2025 research paper
                            <em> "Breaking the Sorting Barrier for Directed Single-Source Shortest Paths"</em>
                            by Duan, Mao, Mao, Shu, and Yin.
                        </p>
                        <p>
                            <strong>Key Innovation:</strong> Instead of maintaining full vertex ordering
                            (O(n log n) barrier), the new algorithm uses FindPivots to reduce frontier size
                            and BMSSP for recursive divide-and-conquer, achieving O(m log^(2/3) n) time.
                        </p>
                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div>
                                <div className="font-semibold text-blue-600 dark:text-blue-400">
                                    Dijkstra's Algorithm
                                </div>
                                <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                                    <li>Uses priority queue (min-heap)</li>
                                    <li>Processes vertices by distance</li>
                                    <li>Complexity: O(m + n log n)</li>
                                    <li>Classic, well-established approach</li>
                                </ul>
                            </div>
                            <div>
                                <div className="font-semibold text-purple-600 dark:text-purple-400">
                                    New SSSP Algorithm
                                </div>
                                <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                                    <li>Uses adaptive frontier structure</li>
                                    <li>FindPivots reduces frontier size</li>
                                    <li>Complexity: O(m log^(2/3) n)</li>
                                    <li>Breakthrough on sparse graphs!</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
