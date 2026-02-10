import { AlgorithmStatistics } from '../algorithms/types';

interface ComparisonPanelProps {
    dijkstraStats: AlgorithmStatistics | null;
    newSSSPStats: AlgorithmStatistics | null;
}

export default function ComparisonPanel({ dijkstraStats, newSSSPStats }: ComparisonPanelProps) {
    return (
        <div className="card space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Algorithm Comparison
            </h3>

            {/* Complexity formulas */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                        Dijkstra's Algorithm
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            O(m + n log n)
                        </code>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="font-semibold text-purple-600 dark:text-purple-400">
                        New SSSP Algorithm
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            O(m log^(2/3) n)
                        </code>
                    </div>
                </div>
            </div>

            {/* Statistics comparison */}
            {(dijkstraStats || newSSSPStats) && (
                <div className="space-y-3">
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                        <StatRow
                            label="Execution Time"
                            dijkstra={dijkstraStats?.executionTime.toFixed(2) + ' ms'}
                            newSSSP={newSSSPStats?.executionTime.toFixed(2) + ' ms'}
                        />
                        <StatRow
                            label="Total Operations"
                            dijkstra={dijkstraStats?.operations.toString()}
                            newSSSP={newSSSPStats?.operations.toString()}
                        />
                        <StatRow
                            label="Edge Relaxations"
                            dijkstra={dijkstraStats?.relaxations.toString()}
                            newSSSP={newSSSPStats?.relaxations.toString()}
                        />
                        <StatRow
                            label="Nodes Processed"
                            dijkstra={dijkstraStats?.nodesProcessed.toString()}
                            newSSSP={newSSSPStats?.nodesProcessed.toString()}
                        />
                    </div>

                    {/* New SSSP specific parameters */}
                    {newSSSPStats && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
                                New SSSP Parameters
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">k:</span>{' '}
                                    <span className="font-mono">{newSSSPStats.k}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">t:</span>{' '}
                                    <span className="font-mono">{newSSSPStats.t}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Levels:</span>{' '}
                                    <span className="font-mono">{newSSSPStats.levels}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Pivots:</span>{' '}
                                    <span className="font-mono">{newSSSPStats.pivotsCount}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Speedup */}
                    {dijkstraStats && newSSSPStats && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                            <div className="text-center">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Speedup Factor
                                </div>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {(dijkstraStats.executionTime / newSSSPStats.executionTime).toFixed(2)}x
                                </div>
                                {dijkstraStats.executionTime > newSSSPStats.executionTime ? (
                                    <div className="text-xs text-green-600 dark:text-green-400">
                                        New SSSP is faster! 🚀
                                    </div>
                                ) : (
                                    <div className="text-xs text-gray-500">
                                        (Graph size may be too small to show advantage)
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!(dijkstraStats || newSSSPStats) && (
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                    Run algorithms to see comparison statistics
                </div>
            )}
        </div>
    );
}

function StatRow({
    label,
    dijkstra,
    newSSSP,
}: {
    label: string;
    dijkstra?: string;
    newSSSP?: string;
}) {
    return (
        <div className="flex justify-between items-center py-1 text-sm">
            <span className="text-gray-600 dark:text-gray-400">{label}:</span>
            <div className="flex space-x-4">
                <span className="font-mono text-blue-600 dark:text-blue-400 w-20 text-right">
                    {dijkstra || '-'}
                </span>
                <span className="font-mono text-purple-600 dark:text-purple-400 w-20 text-right">
                    {newSSSP || '-'}
                </span>
            </div>
        </div>
    );
}
