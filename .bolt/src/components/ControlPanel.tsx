import { Play, Pause, RotateCcw, Plus, Minus, Settings } from 'lucide-react';
import { SimulationStats } from '../simulation/core/Simulation';

interface ControlPanelProps {
  isRunning: boolean;
  stats: SimulationStats;
  speedMultiplier: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onSpawnAgent: () => void;
  onSpawnResource: () => void;
  onSpawnObstacle: () => void;
  onToggleSettings: () => void;
}

export function ControlPanel({
  isRunning,
  stats,
  speedMultiplier,
  onStart,
  onPause,
  onReset,
  onSpeedChange,
  onSpawnAgent,
  onSpawnResource,
  onSpawnObstacle,
  onToggleSettings,
}: ControlPanelProps) {
  return (
    <div className="bg-gray-900 text-white p-4 border-b border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">AI World Simulator</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={isRunning ? onPause : onStart}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            {isRunning ? (
              <>
                <Pause size={20} />
                Pause
              </>
            ) : (
              <>
                <Play size={20} />
                Start
              </>
            )}
          </button>

          <button
            onClick={onReset}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RotateCcw size={20} />
            Reset
          </button>

          <button
            onClick={onToggleSettings}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-4">
        <StatCard label="Tick" value={stats.tick} />
        <StatCard label="FPS" value={stats.fps} />
        <StatCard label="Agents" value={stats.agentCount} />
        <StatCard label="Alive" value={stats.aliveAgentCount} color="text-green-400" />
        <StatCard label="Resources" value={stats.resourceCount} />
        <StatCard label="Avg Energy" value={stats.averageEnergy} />
        <StatCard label="Avg Age" value={stats.averageAge} />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Speed:</span>
          <button
            onClick={() => onSpeedChange(Math.max(0.1, speedMultiplier - 0.5))}
            className="bg-gray-700 hover:bg-gray-600 p-2 rounded transition-colors"
          >
            <Minus size={16} />
          </button>
          <span className="text-lg font-mono w-12 text-center">{speedMultiplier.toFixed(1)}x</span>
          <button
            onClick={() => onSpeedChange(Math.min(10, speedMultiplier + 0.5))}
            className="bg-gray-700 hover:bg-gray-600 p-2 rounded transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-700" />

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Spawn:</span>
          <button
            onClick={onSpawnAgent}
            className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm transition-colors"
          >
            Agent
          </button>
          <button
            onClick={onSpawnResource}
            className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm transition-colors"
          >
            Resource
          </button>
          <button
            onClick={onSpawnObstacle}
            className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-sm transition-colors"
          >
            Obstacle
          </button>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  color?: string;
}

function StatCard({ label, value, color = 'text-white' }: StatCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
