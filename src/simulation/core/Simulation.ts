import { PhysicsEngine, PhysicsConfig } from '../physics/PhysicsEngine';
import { World, WorldConfig } from '../world/World';
import { Agent } from '../agents/Agent';
import { AIController, AIControllerRegistry } from '../../ai/AIInterface';
import { Vector2D } from '../physics/Vector2D';

export interface SimulationConfig {
  physics: Partial<PhysicsConfig>;
  world: Partial<WorldConfig>;
  maxAgents: number;
  targetFPS: number;
  enableCollisions: boolean;
}

export interface SimulationStats {
  tick: number;
  fps: number;
  agentCount: number;
  aliveAgentCount: number;
  resourceCount: number;
  averageEnergy: number;
  averageAge: number;
}

export class Simulation {
  private physics: PhysicsEngine;
  private world: World;
  private agents: Map<string, Agent>;
  private agentControllers: Map<string, AIController>;
  private config: SimulationConfig;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private tick: number = 0;
  private lastUpdateTime: number = 0;
  private fps: number = 0;
  private speedMultiplier: number = 1;
  private agentIdCounter: number = 0;

  constructor(config: Partial<SimulationConfig> = {}) {
    this.config = {
      physics: {},
      world: {},
      maxAgents: 100,
      targetFPS: 60,
      enableCollisions: true,
      ...config,
    };

    this.physics = new PhysicsEngine(this.config.physics);
    this.world = new World(this.config.world);
    this.agents = new Map();
    this.agentControllers = new Map();
  }

  start(): void {
    this.isRunning = true;
    this.isPaused = false;
    this.lastUpdateTime = performance.now();
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
    this.lastUpdateTime = performance.now();
  }

  stop(): void {
    this.isRunning = false;
    this.isPaused = false;
  }

  reset(): void {
    this.agents.clear();
    this.agentControllers.clear();
    this.world.reset();
    this.tick = 0;
    this.fps = 0;
    this.agentIdCounter = 0;
  }

  spawnAgent(
    position?: Vector2D,
    controllerName: string = 'resource-seeker'
  ): Agent | null {
    if (this.agents.size >= this.config.maxAgents) {
      return null;
    }

    const worldConfig = this.world.getConfig();
    const pos = position || Vector2D.random(worldConfig.width, worldConfig.height);

    const agent = new Agent(`agent-${this.agentIdCounter++}`, pos);
    const controller = AIControllerRegistry.create(controllerName);

    if (!controller) {
      console.warn(`Controller ${controllerName} not found`);
      return null;
    }

    this.agents.set(agent.state.id, agent);
    this.agentControllers.set(agent.state.id, controller);

    return agent;
  }

  removeAgent(id: string): boolean {
    this.agentControllers.delete(id);
    return this.agents.delete(id);
  }

  update(deltaTime: number): void {
    if (!this.isRunning || this.isPaused) return;

    const actualDeltaTime = deltaTime * this.speedMultiplier;

    this.world.update();

    const worldConfig = this.world.getConfig();
    const resources = this.world.getResources();
    const obstacles = this.world.getObstacles();
    const agentList = Array.from(this.agents.values());

    for (const agent of agentList) {
      if (!agent.state.isAlive) continue;

      const controller = this.agentControllers.get(agent.state.id);
      if (controller) {
        const observation = agent.observe(
          resources,
          agentList,
          obstacles,
          worldConfig.width,
          worldConfig.height
        );

        const decision = controller.decide(agent, observation);

        if (decision instanceof Promise) {
          decision.then((d) => agent.executeAction(d.action));
        } else {
          agent.executeAction(decision.action);
        }
      }

      const consumed = agent.tryConsume(resources);
      if (consumed > 0) {
        agent.gainEnergy(consumed * 0.5);
      }

      this.physics.update(agent.state.physicsBody, actualDeltaTime);

      this.physics.constrainToBox(
        agent.state.physicsBody,
        0,
        0,
        worldConfig.width,
        worldConfig.height
      );

      agent.update(actualDeltaTime);
    }

    if (this.config.enableCollisions) {
      const aliveAgents = agentList.filter((a) => a.state.isAlive);
      for (let i = 0; i < aliveAgents.length; i++) {
        for (let j = i + 1; j < aliveAgents.length; j++) {
          const agentA = aliveAgents[i];
          const agentB = aliveAgents[j];

          if (this.physics.checkCollision(agentA.state.physicsBody, agentB.state.physicsBody)) {
            this.physics.resolveCollision(agentA.state.physicsBody, agentB.state.physicsBody);
          }
        }
      }

      for (const agent of aliveAgents) {
        for (const obstacle of obstacles) {
          const obstacleBody = {
            position: obstacle.position,
            velocity: Vector2D.zero(),
            acceleration: Vector2D.zero(),
            mass: Infinity,
            radius: obstacle.radius,
            fixed: true,
          };

          if (this.physics.checkCollision(agent.state.physicsBody, obstacleBody)) {
            this.physics.resolveCollision(agent.state.physicsBody, obstacleBody);
          }
        }
      }
    }

    const deadAgents = agentList.filter((a) => !a.state.isAlive);
    for (const agent of deadAgents) {
      if (agent.state.age > 10) {
        this.removeAgent(agent.state.id);
      }
    }

    this.tick++;
  }

  updateFPS(currentTime: number): void {
    const deltaTime = currentTime - this.lastUpdateTime;
    this.fps = deltaTime > 0 ? 1000 / deltaTime : 0;
    this.lastUpdateTime = currentTime;
  }

  setSpeedMultiplier(multiplier: number): void {
    this.speedMultiplier = Math.max(0.1, Math.min(10, multiplier));
  }

  getSpeedMultiplier(): number {
    return this.speedMultiplier;
  }

  getStats(): SimulationStats {
    const agentList = Array.from(this.agents.values());
    const aliveAgents = agentList.filter((a) => a.state.isAlive);

    const avgEnergy =
      aliveAgents.length > 0
        ? aliveAgents.reduce((sum, a) => sum + a.state.energy, 0) / aliveAgents.length
        : 0;

    const avgAge =
      agentList.length > 0 ? agentList.reduce((sum, a) => sum + a.state.age, 0) / agentList.length : 0;

    return {
      tick: this.tick,
      fps: Math.round(this.fps),
      agentCount: agentList.length,
      aliveAgentCount: aliveAgents.length,
      resourceCount: this.world.getResources().length,
      averageEnergy: Math.round(avgEnergy),
      averageAge: Math.round(avgAge),
    };
  }

  getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getWorld(): World {
    return this.world;
  }

  getPhysics(): PhysicsEngine {
    return this.physics;
  }

  isActive(): boolean {
    return this.isRunning && !this.isPaused;
  }

  getTick(): number {
    return this.tick;
  }
}
