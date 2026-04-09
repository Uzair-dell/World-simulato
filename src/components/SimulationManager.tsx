import { useEffect, useState } from 'react';
import { Save, Folder, Trash2, Plus } from 'lucide-react';
import { simulationService, SimulationRecord } from '../services/simulationService';

interface SimulationManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSimulation: (simulation: SimulationRecord) => void;
  currentSimulationStats: { tick: number; agentCount: number; resourceCount: number };
}

export function SimulationManager({
  isOpen,
  onClose,
  onLoadSimulation,
  currentSimulationStats,
}: SimulationManagerProps) {
  const [simulations, setSimulations] = useState<SimulationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [newSimulationName, setNewSimulationName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSimulations();
    }
  }, [isOpen]);

  const loadSimulations = async () => {
    setLoading(true);
    const sims = await simulationService.getSimulations();
    setSimulations(sims);
    setLoading(false);
  };

  const handleSaveSimulation = async () => {
    if (!newSimulationName.trim()) return;

    setSaving(true);
    const result = await simulationService.createSimulation(
      newSimulationName,
      { ...currentSimulationStats }
    );

    if (result) {
      setNewSimulationName('');
      await loadSimulations();
    }
    setSaving(false);
  };

  const handleLoadSimulation = (simulation: SimulationRecord) => {
    onLoadSimulation(simulation);
    onClose();
  };

  const handleDeleteSimulation = async (id: string) => {
    if (confirm('Delete this simulation?')) {
      await simulationService.deleteSimulation(id);
      await loadSimulations();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl max-h-96 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Simulation Manager
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newSimulationName}
            onChange={(e) => setNewSimulationName(e.target.value)}
            placeholder="Enter simulation name..."
            className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
            onKeyPress={(e) => e.key === 'Enter' && handleSaveSimulation()}
          />
          <button
            onClick={handleSaveSimulation}
            disabled={!newSimulationName.trim() || saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-gray-400 text-center py-4">Loading...</div>
          ) : simulations.length === 0 ? (
            <div className="text-gray-400 text-center py-4">No simulations saved yet</div>
          ) : (
            <div className="space-y-2">
              {simulations.map((sim) => (
                <div
                  key={sim.id}
                  className="bg-gray-800 rounded p-3 flex items-center justify-between hover:bg-gray-750 transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{sim.name}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(sim.created_at).toLocaleDateString()} at{' '}
                      {new Date(sim.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => handleLoadSimulation(sim)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDeleteSimulation(sim.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
