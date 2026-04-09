import { Simulation } from '../simulation/core/Simulation';
import { Vector2D } from '../simulation/physics/Vector2D';

export interface Scenario {
  name: string;
  description: string;
  setup: (simulation: Simulation) => void;
}

export const scenarios: Scenario[] = [
  {
    name: 'Empty World',
    description: 'Start with a clean slate',
    setup: (simulation: Simulation) => {
      simulation.reset();
    },
  },
  {
    name: 'Survival Test',
    description: '10 agents competing for limited resources',
    setup: (simulation: Simulation) => {
      simulation.reset();

      const world = simulation.getWorld();
      const worldConfig = world.getConfig();

      for (let i = 0; i < 10; i++) {
        const x = worldConfig.width * 0.5 + (Math.random() - 0.5) * 200;
        const y = worldConfig.height * 0.5 + (Math.random() - 0.5) * 200;
        simulation.spawnAgent(new Vector2D(x, y), 'resource-seeker');
      }

      for (let i = 0; i < 15; i++) {
        world.spawnResource();
      }
    },
  },
  {
    name: 'Navigation Challenge',
    description: 'Agents navigate obstacles to reach resources',
    setup: (simulation: Simulation) => {
      simulation.reset();

      const world = simulation.getWorld();
      const worldConfig = world.getConfig();

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = worldConfig.width * 0.5 + Math.cos(angle) * 150;
        const y = worldConfig.height * 0.5 + Math.sin(angle) * 150;
        simulation.spawnAgent(new Vector2D(x, y), 'resource-seeker');
      }

      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const x = worldConfig.width * 0.5 + Math.cos(angle) * 100;
        const y = worldConfig.height * 0.5 + Math.sin(angle) * 100;
        world.spawnObstacle(new Vector2D(x, y), 40);
      }

      for (let i = 0; i < 20; i++) {
        world.spawnResource();
      }
    },
  },
  {
    name: 'Resource Competition',
    description: '20 agents in a resource-rich environment',
    setup: (simulation: Simulation) => {
      simulation.reset();

      const world = simulation.getWorld();
      const worldConfig = world.getConfig();

      for (let i = 0; i < 20; i++) {
        simulation.spawnAgent(
          Vector2D.random(worldConfig.width, worldConfig.height),
          'resource-seeker'
        );
      }

      for (let i = 0; i < 40; i++) {
        world.spawnResource();
      }
    },
  },
  {
    name: 'Maze',
    description: 'Complex obstacle course with scattered resources',
    setup: (simulation: Simulation) => {
      simulation.reset();

      const world = simulation.getWorld();
      const worldConfig = world.getConfig();

      const rows = 4;
      const cols = 5;
      const spacingX = worldConfig.width / (cols + 1);
      const spacingY = worldConfig.height / (rows + 1);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (Math.random() > 0.3) {
            const x = spacingX * (col + 1);
            const y = spacingY * (row + 1);
            world.spawnObstacle(new Vector2D(x, y), 30 + Math.random() * 20);
          }
        }
      }

      for (let i = 0; i < 15; i++) {
        simulation.spawnAgent(
          Vector2D.random(worldConfig.width, worldConfig.height),
          'resource-seeker'
        );
      }

      for (let i = 0; i < 25; i++) {
        world.spawnResource();
      }
    },
  },
];
