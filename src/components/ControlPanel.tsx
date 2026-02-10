interface ControlPanelProps {
    isPlaying: boolean;
    onPlay: () => void;
    onPause: () => void;
    onReset: () => void;
    onStepForward: () => void;
    onStepBack: () => void;
    canStepForward: boolean;
    canStepBack: boolean;
    speed: number;
    onSpeedChange: (speed: number) => void;
    currentStep: number;
    totalSteps: number;
}

export default function ControlPanel({
    isPlaying,
    onPlay,
    onPause,
    onReset,
    onStepForward,
    onStepBack,
    canStepForward,
    canStepBack,
    speed,
    onSpeedChange,
    currentStep,
    totalSteps,
}: ControlPanelProps) {
    return (
        <div className="card space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Animation Controls
            </h3>

            {/* Play controls */}
            <div className="flex space-x-2">
                {isPlaying ? (
                    <button onClick={onPause} className="btn btn-warning flex-1">
                        ⏸ Pause
                    </button>
                ) : (
                    <button
                        onClick={onPlay}
                        className="btn btn-success flex-1"
                        disabled={!canStepForward}
                    >
                        ▶ Play
                    </button>
                )}
                <button onClick={onReset} className="btn btn-secondary flex-1">
                    ⟲ Reset
                </button>
            </div>

            {/* Step controls */}
            <div className="flex space-x-2">
                <button
                    onClick={onStepBack}
                    className="btn btn-secondary flex-1"
                    disabled={!canStepBack}
                >
                    ⏮ Step Back
                </button>
                <button
                    onClick={onStepForward}
                    className="btn btn-secondary flex-1"
                    disabled={!canStepForward}
                >
                    Step Forward ⏭
                </button>
            </div>

            {/* Speed control */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Speed</span>
                    <span>{(1000 / speed).toFixed(1)}x</span>
                </div>
                <input
                    type="range"
                    min="50"
                    max="2000"
                    step="50"
                    value={speed}
                    onChange={(e) => onSpeedChange(Number(e.target.value))}
                    className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                    <span>Fast</span>
                    <span>Slow</span>
                </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Progress</span>
                    <span>
                        {currentStep} / {totalSteps}
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentStep / Math.max(totalSteps, 1)) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
