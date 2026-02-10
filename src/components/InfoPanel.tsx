import { AlgorithmStep } from '../algorithms/types';

interface InfoPanelProps {
    currentStep: AlgorithmStep | null;
    algorithmType: 'dijkstra' | 'new-sssp' | null;
}

export default function InfoPanel({ currentStep, algorithmType }: InfoPanelProps) {
    return (
        <div className="card space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Current Step Information
            </h3>

            {currentStep ? (
                <div className="space-y-3">
                    {/* Step number and action */}
                    <div className="flex items-center justify-between">
                        <span className="stat-badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Step {currentStep.stepNumber}
                        </span>
                        <span className="stat-badge bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            {formatAction(currentStep.action)}
                        </span>
                    </div>

                    {/* Description */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            {currentStep.description}
                        </p>
                    </div>

                    {/* Current node */}
                    {currentStep.currentNode !== null && (
                        <div className="text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Current Node: </span>
                            <span className="font-mono font-bold text-lg">
                                {currentStep.currentNode}
                            </span>
                        </div>
                    )}

                    {/* Details */}
                    {currentStep.details && (
                        <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3">
                            {/* Distance updates */}
                            {currentStep.details.distanceUpdates && (
                                <div className="space-y-1">
                                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                        Distance Updates:
                                    </div>
                                    {currentStep.details.distanceUpdates.map((update, idx) => (
                                        <div key={idx} className="text-sm flex items-center space-x-2">
                                            <span className="font-mono">Node {update.node}:</span>
                                            <span className="text-gray-500">
                                                {update.oldDist === Infinity ? '∞' : update.oldDist.toFixed(1)}
                                            </span>
                                            <span>→</span>
                                            <span className="font-bold text-green-600 dark:text-green-400">
                                                {update.newDist.toFixed(1)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Edge relaxed */}
                            {currentStep.details.edgeRelaxed && (
                                <div className="text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Edge: </span>
                                    <span className="font-mono">
                                        {currentStep.details.edgeRelaxed.from} →{' '}
                                        {currentStep.details.edgeRelaxed.to}
                                    </span>
                                </div>
                            )}

                            {/* Pivots found (New SSSP) */}
                            {currentStep.details.pivotsFound && (
                                <div className="space-y-1">
                                    <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                        Pivots Found:
                                    </div>
                                    <div className="text-sm font-mono">
                                        [{currentStep.details.pivotsFound.join(', ')}]
                                    </div>
                                </div>
                            )}

                            {/* Recursion level (New SSSP) */}
                            {currentStep.details.recursionLevel !== undefined && (
                                <div className="text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Recursion Level:{' '}
                                    </span>
                                    <span className="font-mono font-bold">
                                        {currentStep.details.recursionLevel}
                                    </span>
                                </div>
                            )}

                            {/* Algorithm parameters */}
                            {(currentStep.details.k || currentStep.details.t) && (
                                <div className="flex space-x-4 text-sm">
                                    {currentStep.details.k && (
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">k: </span>
                                            <span className="font-mono">{currentStep.details.k}</span>
                                        </div>
                                    )}
                                    {currentStep.details.t && (
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">t: </span>
                                            <span className="font-mono">{currentStep.details.t}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Algorithm explanation */}
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border-l-4 border-blue-500">
                        <div className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-1">
                            {algorithmType === 'dijkstra' ? "Dijkstra's Algorithm" : 'New SSSP Algorithm'}
                        </div>
                        <p className="text-xs text-blue-800 dark:text-blue-300">
                            {getAlgorithmExplanation(currentStep.action, algorithmType)}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                    Select an algorithm and click Play to begin
                </div>
            )}
        </div>
    );
}

function formatAction(action: string): string {
    const actionMap: Record<string, string> = {
        initialize: 'Initialize',
        visit: 'Visit Node',
        relax: 'Relax Edge',
        complete: 'Complete Node',
        find_pivots: 'Find Pivots',
        bmssp_call: 'BMSSP Call',
        frontier_pull: 'Pull Frontier',
        done: 'Complete',
    };
    return actionMap[action] || action;
}

function getAlgorithmExplanation(action: string, type: 'dijkstra' | 'new-sssp' | null): string {
    if (type === 'dijkstra') {
        const explanations: Record<string, string> = {
            initialize: 'Setting up initial distances and priority queue.',
            visit: 'Visiting the node with minimum distance from the priority queue.',
            relax: 'Updating neighbor distances if a shorter path is found.',
            complete: 'Node processing complete, final distance determined.',
            done: 'All reachable nodes have been processed.',
        };
        return explanations[action] || 'Processing...';
    } else {
        const explanations: Record<string, string> = {
            initialize: 'Setting up algorithm parameters k and t for optimal complexity.',
            find_pivots: 'Reducing frontier by finding vertices with large shortest-path trees.',
            bmssp_call: 'Recursive bounded multi-source shortest path call.',
            frontier_pull: 'Pulling next batch of vertices from adaptive frontier.',
            visit: 'Processing node in base case mini-Dijkstra.',
            relax: 'Updating distances through edge relaxation.',
            done: 'Algorithm complete - achieved O(m log^(2/3) n) complexity!',
        };
        return explanations[action] || 'Advanced processing...';
    }
}
