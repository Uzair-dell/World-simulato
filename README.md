# AI World Simulator

A modular, realistic world simulator with AI integration capabilities, designed as a sandbox for experimentation and AI testing. This system allows you to observe emergent behavior, test custom AI models, and experiment with autonomous agents in a dynamic environment.

## Features

- **Real-time Physics Simulation** - Stable, simplified physics with collision detection
- **Dynamic World** - Procedurally spawning resources, obstacles, and environmental elements
- **Autonomous Agents** - AI-controlled entities with sensors, actions, and energy management
- **Modular AI System** - Pluggable AI behaviors with easy custom implementation
- **Visual Debugging** - Real-time rendering with toggleable debug views
- **Control Panel** - Interactive UI for simulation control and monitoring
- **Scenario System** - Pre-built test scenarios for various challenges
- **Persistent Storage** - Supabase integration for saving simulation state and training data

## Architecture

The system is organized into independent, modular components:

```
src/
├── simulation/
│   ├── physics/           # Physics engine and Vector2D math
│   ├── world/            # World system with resources and obstacles
│   ├── agents/           # Agent system with state and actions
│   └── core/             # Main simulation loop and coordination
├── ai/
│   ├── AIInterface.ts    # AI controller interface and registry
│   └── behaviors/        # Default AI behaviors (Random, Resource Seeker)
├── rendering/
│   └── Renderer.ts       # Canvas-based visualization system
├── components/           # React UI components
├── scenarios/            # Pre-built test scenarios
└── App.tsx              # Main application integration
```

## Core Systems

### 1. Physics Engine (`src/simulation/physics/`)

Provides stable, simplified physics simulation:

- **Vector2D** - Complete 2D vector math operations
- **PhysicsEngine** - Handles forces, collisions, and constraints
- Configurable gravity, friction, and air resistance
- Circle-based collision detection and resolution

### 2. World System (`src/simulation/world/`)

Manages the environment and resources:

- **Resources** - Food, energy, and materials that agents can consume
- **Obstacles** - Static objects that agents must navigate around
- **Procedural Generation** - Automatic resource spawning and regeneration
- Configurable world size and resource parameters

### 3. Agent System (`src/simulation/agents/`)

Autonomous entities with:

- **State** - Position, velocity, energy, age, alive status
- **Sensors** - Observe nearby resources, agents, obstacles, and world bounds
- **Actions** - Move forward/backward, turn left/right, consume resources
- **Energy Management** - Agents consume energy over time and from movement
- **Lifecycle** - Agents die when energy reaches zero

### 4. AI Integration System (`src/ai/`)

Extensible AI behavior system:

- **AIController Interface** - Standard contract for AI implementations
- **AIControllerRegistry** - Factory pattern for creating AI instances
- **Default Behaviors**:
  - **Random** - Moves randomly without purpose
  - **Resource Seeker** - Intelligently seeks and consumes resources

### 5. Rendering System (`src/rendering/`)

Canvas-based visualization:

- Real-time rendering of agents, resources, and obstacles
- Camera system with zoom support
- Debug visualizations (velocity vectors, sensor radius, energy bars)
- Toggleable grid and visual options

### 6. Simulation Core (`src/simulation/core/`)

Main coordination layer:

- Fixed time-step simulation loop
- Speed control (0.1x to 10x)
- Pause/resume/reset functionality
- Statistics tracking (FPS, agent count, average energy/age)
- Collision handling between agents and obstacles

## Creating Custom AI Behaviors

To create your own AI behavior, implement the `AIController` interface:

```typescript
import { BaseAIController, AIDecision } from './ai/AIInterface';
import { Agent, AgentObservation, AgentAction } from './simulation/agents/Agent';

export class MyCustomBehavior extends BaseAIController {
  decide(agent: Agent, observation: AgentObservation): AIDecision {
    // Implement your AI logic here
    // Access observation.nearbyResources, observation.nearbyAgents, etc.

    return {
      action: AgentAction.MOVE_FORWARD,
      metadata: { behavior: 'my-custom-behavior' },
    };
  }

  getName(): string {
    return 'My Custom Behavior';
  }

  getDescription(): string {
    return 'Description of what this AI does';
  }
}
```

Then register it:

```typescript
import { AIControllerRegistry } from './ai/AIInterface';
import { MyCustomBehavior } from './ai/behaviors/MyCustomBehavior';

AIControllerRegistry.register('my-custom', () => new MyCustomBehavior());
```

### Agent Observations

Your AI receives rich observations about the environment:

```typescript
interface AgentObservation {
  position: Vector2D;              // Agent's current position
  velocity: Vector2D;              // Agent's current velocity
  rotation: number;                // Agent's facing direction
  energy: number;                  // Current energy level
  nearbyResources: Array<{         // Sorted by distance
    type: string;                  // 'food', 'energy', 'material'
    distance: number;
    angle: number;                 // Relative to agent's rotation
    amount: number;
  }>;
  nearbyAgents: Array<{            // Other agents in sensor range
    distance: number;
    angle: number;
    energy: number;
  }>;
  nearbyObstacles: Array<{         // Obstacles to avoid
    distance: number;
    angle: number;
    radius: number;
  }>;
  worldBounds: {
    distanceToEdges: [left, top, right, bottom];
  };
}
```

### Available Actions

```typescript
enum AgentAction {
  MOVE_FORWARD,    // Accelerate in facing direction
  MOVE_BACKWARD,   // Move backward (slower)
  TURN_LEFT,       // Rotate counter-clockwise
  TURN_RIGHT,      // Rotate clockwise
  CONSUME,         // Consume nearby resources
  IDLE,            // Do nothing
}
```

## Pre-built Scenarios

The simulator includes 5 test scenarios:

1. **Empty World** - Clean slate for experimentation
2. **Survival Test** - 10 agents competing for limited resources
3. **Navigation Challenge** - Agents navigate obstacles to reach resources
4. **Resource Competition** - 20 agents in resource-rich environment
5. **Maze** - Complex obstacle course with scattered resources

## Database Schema

The simulation state can be persisted to Supabase:

- **simulations** - Simulation instances and configuration
- **agents** - Agent state and history
- **world_state** - World snapshots at specific ticks
- **training_data** - Observation-action-reward tuples for AI training

## Configuration

### Physics Configuration

```typescript
const simulation = new Simulation({
  physics: {
    gravity: new Vector2D(0, 0),    // Gravity force
    friction: 0.98,                  // Friction coefficient
    airResistance: 0.99,             // Air resistance
    timeStep: 1 / 60,                // Physics time step
  },
});
```

### World Configuration

```typescript
const simulation = new Simulation({
  world: {
    width: 1000,                     // World width
    height: 800,                     // World height
    initialResources: 50,            // Starting resource count
    resourceRegenerationInterval: 300, // Ticks between spawns
    maxResources: 100,               // Maximum resources
  },
});
```

### Agent Configuration

```typescript
const agent = new Agent(id, position, {
  maxEnergy: 100,          // Maximum energy capacity
  energyDecayRate: 0.05,   // Energy lost per tick
  moveSpeed: 50,           // Movement force
  turnSpeed: 0.1,          // Rotation speed
  sensorRadius: 150,       // Observation range
  consumeRadius: 20,       // Range to consume resources
  consumeRate: 10,         // Amount consumed per action
  startEnergy: 100,        // Initial energy
});
```

## Usage

### Running the Simulation

The simulation starts automatically when you open the application. Use the control panel to:

- **Start/Pause** - Control simulation execution
- **Reset** - Clear and restart the simulation
- **Speed Control** - Adjust simulation speed (0.1x to 10x)
- **Spawn** - Add agents, resources, or obstacles
- **Settings** - Toggle visualization options and select default AI behavior

### Visualization Options

- **Show Grid** - Display background grid
- **Show Energy Bars** - Display agent energy levels
- **Show Velocity Vectors** - Display agent movement vectors
- **Show Sensor Radius** - Display agent observation range

## Key Design Principles

1. **Stability over Complexity** - Physics is simplified but consistent
2. **Modularity** - Each system is independent and replaceable
3. **Extensibility** - Easy to add new behaviors, scenarios, and features
4. **Emergence** - Behavior arises from simple rules, not hardcoded logic
5. **Observable** - Rich debugging and visualization tools

## Performance Considerations

- Efficient spatial queries for nearby objects
- Collision detection only for alive agents
- Configurable simulation speed for fast training
- Fixed time-step for deterministic simulation
- Automatic dead agent cleanup

## Future Extensions

This architecture supports many potential extensions:

- **Neural Network Integration** - Use observations as input for ML models
- **Genetic Algorithms** - Evolve agent behaviors over generations
- **Multi-agent Cooperation** - Implement team-based scenarios
- **Complex Behaviors** - Add memory, planning, and learning
- **Remote AI Models** - Call external APIs for decision making
- **Training Mode** - Batch simulations for reinforcement learning
- **Advanced Physics** - Add forces, momentum, and complex collisions
- **Procedural Terrain** - Generate varied environments

## Technical Stack

- **React** - UI framework
- **TypeScript** - Type-safe development
- **Canvas API** - Real-time rendering
- **Tailwind CSS** - Styling
- **Supabase** - Database and persistence
- **Vite** - Build tool

## License

This project is designed as a learning tool and experimentation platform.
