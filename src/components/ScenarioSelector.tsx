import { scenarios } from '../scenarios/Scenario';

interface ScenarioSelectorProps {
  onSelectScenario: (index: number) => void;
}

export function ScenarioSelector({ onSelectScenario }: ScenarioSelectorProps) {
  return (
    <div className="bg-gray-900 text-white p-4 border-b border-gray-700">
      <h3 className="text-sm font-semibold mb-2 text-gray-400">SCENARIOS</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {scenarios.map((scenario, index) => (
          <button
            key={index}
            onClick={() => onSelectScenario(index)}
            className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg text-left transition-colors group"
          >
            <div className="font-semibold text-sm mb-1 group-hover:text-blue-400 transition-colors">
              {scenario.name}
            </div>
            <div className="text-xs text-gray-400">{scenario.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
