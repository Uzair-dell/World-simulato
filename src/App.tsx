import { useEffect, useRef, useState } from 'react';
import { Simulation } from './simulation/core/Simulation';
import { Renderer } from './rendering/Renderer';
import { registerDefaultBehaviors } from './ai/behaviors';
import { ControlPanel } from './components/ControlPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { ScenarioSelector } from './components/ScenarioSelector';
import { SimulationManager } from './components/SimulationManager';
import { scenarios } from './scenarios/Scenario';
import { Vector2D } from './simulation/physics/Vector2D';
import { SimulationRecord } from './services/simulationService';

registerDefaultBehaviors();

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simulationRef = useRef<Simulation | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const animationFrameRef = useRef<number>(0);

  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({
    tick: 0,
    fps: 0,
    agentCount: 0,
    aliveAgentCount: 0,
    resourceCount: 0,
    averageEnergy: 0,
    averageAge: 0,
  });
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [renderOptions, setRenderOptions] = useState({
    showVelocity: false,
    showSensorRadius: false,
    showGrid: true,
    showEnergy: true,
  });
  const [selectedBehavior, setSelectedBehavior] = useState('resource-seeker');
  const [showSimulationManager, setShowSimulationManager] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const simulation = new Simulation({
      world: {
        width: canvas.width,
        height: canvas.height,
      },
    });

    const renderer = new Renderer(canvas);

    simulationRef.current = simulation;
    rendererRef.current = renderer;

    scenarios[1].setup(simulation);

    const gameLoop = () => {
      const deltaTime = 1 / 60;

      if (simulation.isActive()) {
        simulation.update(deltaTime);
        simulation.updateFPS(performance.now());
        setStats(simulation.getStats());
      }

      renderer.render(simulation);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setOptions(renderOptions);
    }
  }, [renderOptions]);

  useEffect(() => {
    if (simulationRef.current) {
      simulationRef.current.setSpeedMultiplier(speedMultiplier);
    }
  }, [speedMultiplier]);

  const handleStart = () => {
    if (simulationRef.current) {
      if (!isRunning) {
        simulationRef.current.start();
      } else {
        simulationRef.current.resume();
      }
      setIsRunning(true);
    }
  };

  const handlePause = () => {
    if (simulationRef.current) {
      simulationRef.current.pause();
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    if (simulationRef.current) {
      simulationRef.current.reset();
      setIsRunning(false);
      setStats({
        tick: 0,
        fps: 0,
        agentCount: 0,
        aliveAgentCount: 0,
        resourceCount: 0,
        averageEnergy: 0,
        averageAge: 0,
      });
    }
  };

  const handleSpawnAgent = () => {
    if (simulationRef.current && canvasRef.current) {
      const worldConfig = simulationRef.current.getWorld().getConfig();
      const centerX = worldConfig.width / 2;
      const centerY = worldConfig.height / 2;
      simulationRef.current.spawnAgent(new Vector2D(centerX, centerY), selectedBehavior);
    }
  };

  const handleSpawnResource = () => {
    if (simulationRef.current) {
      simulationRef.current.getWorld().spawnResource();
    }
  };

  const handleSpawnObstacle = () => {
    if (simulationRef.current) {
      const worldConfig = simulationRef.current.getWorld().getConfig();
      const centerX = worldConfig.width / 2;
      const centerY = worldConfig.height / 2;
      simulationRef.current.getWorld().spawnObstacle(new Vector2D(centerX, centerY));
    }
  };

  const handleSelectScenario = (index: number) => {
    if (simulationRef.current) {
      scenarios[index].setup(simulationRef.current);
      setIsRunning(false);
    }
  };

  const handleLoadSimulation = (simulation: SimulationRecord) => {
    if (simulationRef.current) {
      simulationRef.current.reset();
      setIsRunning(false);
      setStats({
        tick: 0,
        fps: 0,
        agentCount: 0,
        aliveAgentCount: 0,
        resourceCount: 0,
        averageEnergy: 0,
        averageAge: 0,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <ControlPanel
        isRunning={isRunning}
        stats={stats}
        speedMultiplier={speedMultiplier}
        onStart={handleStart}
        onPause={handlePause}
        onReset={handleReset}
        onSpeedChange={setSpeedMultiplier}
        onSpawnAgent={handleSpawnAgent}
        onSpawnResource={handleSpawnResource}
        onSpawnObstacle={handleSpawnObstacle}
        onToggleSettings={() => setShowSettings(!showSettings)}
      />

      <ScenarioSelector onSelectScenario={handleSelectScenario} />

      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: 'block' }}
        />
      </div>

      <SettingsPanel
        isOpen={showSettings}
        renderOptions={renderOptions}
        selectedBehavior={selectedBehavior}
        onClose={() => setShowSettings(false)}
        onRenderOptionsChange={(options) =>
          setRenderOptions({ ...renderOptions, ...options })
        }
        onBehaviorChange={setSelectedBehavior}
      />

      <SimulationManager
        isOpen={showSimulationManager}
        onClose={() => setShowSimulationManager(false)}
        onLoadSimulation={handleLoadSimulation}
        currentSimulationStats={stats}
      />

      <button
        onClick={() => setShowSimulationManager(true)}
        className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition z-40"
      >
        Simulations
      </button>
    </div>
  );
}

export default App;
