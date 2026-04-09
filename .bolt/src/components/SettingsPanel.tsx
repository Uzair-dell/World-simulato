import { X } from 'lucide-react';
import { RenderOptions } from '../rendering/Renderer';
import { AIControllerRegistry } from '../ai/AIInterface';

interface SettingsPanelProps {
  isOpen: boolean;
  renderOptions: RenderOptions;
  selectedBehavior: string;
  onClose: () => void;
  onRenderOptionsChange: (options: Partial<RenderOptions>) => void;
  onBehaviorChange: (behavior: string) => void;
}

export function SettingsPanel({
  isOpen,
  renderOptions,
  selectedBehavior,
  onClose,
  onRenderOptionsChange,
  onBehaviorChange,
}: SettingsPanelProps) {
  if (!isOpen) return null;

  const availableBehaviors = AIControllerRegistry.getAvailable();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Visualization</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={renderOptions.showGrid}
                  onChange={(e) => onRenderOptionsChange({ showGrid: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-gray-300">Show Grid</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={renderOptions.showEnergy}
                  onChange={(e) => onRenderOptionsChange({ showEnergy: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-gray-300">Show Energy Bars</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={renderOptions.showVelocity}
                  onChange={(e) => onRenderOptionsChange({ showVelocity: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-gray-300">Show Velocity Vectors</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={renderOptions.showSensorRadius}
                  onChange={(e) => onRenderOptionsChange({ showSensorRadius: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-gray-300">Show Sensor Radius</span>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">AI Behavior</h3>
            <select
              value={selectedBehavior}
              onChange={(e) => onBehaviorChange(e.target.value)}
              className="w-full bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
            >
              {availableBehaviors.map((behavior) => (
                <option key={behavior} value={behavior}>
                  {behavior.charAt(0).toUpperCase() + behavior.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-400 mt-2">
              Select the default AI behavior for new agents
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
