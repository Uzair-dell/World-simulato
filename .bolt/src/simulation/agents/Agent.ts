import { Vector2D } from '../physics/Vector2D';
import { PhysicsBody } from '../physics/PhysicsEngine';
import { Resource, Obstacle } from '../world/World';

export enum AgentAction {
  MOVE_FORWARD = 'move_forward',
  MOVE_BACKWARD = 'move_backward',
  TURN_LEFT = 'turn_left',
  TURN_RIGHT = 'turn_right',
  CONSUME = 'consume',
  IDLE = 'idle',
}

export interface AgentObservation {
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  energy: number;
  nearbyResources: Array<{
    type: string;
    distance: number;
    angle: number;
    amount: number;
  }>;
  nearbyAgents: Array<{
    distance: number;
    angle: number;
    energy: number;
  }>;
  nearbyObstacles: Array<{
    distance: number;
    angle: number;
    radius: number;
  }>;
  worldBounds: {
    distanceToEdges: [number, number, number, number];
  };
}

export interface AgentState {
  id: string;
  physicsBody: PhysicsBody;
  rotation: number;
  energy: number;
  maxEnergy: number;
  age: number;
  isAlive: boolean;
  color: string;
}

export interface AgentConfig {
  maxEnergy: number;
  energyDecayRate: number;
  moveSpeed: number;
  turnSpeed: number;
  sensorRadius: number;
  consumeRadius: number;
  consumeRate: number;
  startEnergy: number;
}

export class Agent {
  public state: AgentState;
  private config: AgentConfig;

  constructor(
    id: string,
    position: Vector2D,
    config: Partial<AgentConfig> = {}
  ) {
    this.config = {
      maxEnergy: 100,
      energyDecayRate: 0.05,
      moveSpeed: 50,
      turnSpeed: 0.1,
      sensorRadius: 150,
      consumeRadius: 20,
      consumeRate: 10,
      startEnergy: 100,
      ...config,
    };

    this.state = {
      id,
      physicsBody: {
        position: position.clone(),
        velocity: Vector2D.zero(),
        acceleration: Vector2D.zero(),
        mass: 1,
        radius: 8,
        fixed: false,
      },
      rotation: Math.random() * Math.PI * 2,
      energy: this.config.startEnergy,
      maxEnergy: this.config.maxEnergy,
      age: 0,
      isAlive: true,
      color: this.generateRandomColor(),
    };
  }

  private generateRandomColor(): string {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 60%)`;
  }

  executeAction(action: AgentAction): void {
    if (!this.state.isAlive) return;

    switch (action) {
      case AgentAction.MOVE_FORWARD: {
        const direction = Vector2D.fromAngle(this.state.rotation);
        const force = direction.multiply(this.config.moveSpeed);
        this.state.physicsBody.acceleration = this.state.physicsBody.acceleration.add(force);
        break;
      }
      case AgentAction.MOVE_BACKWARD: {
        const direction = Vector2D.fromAngle(this.state.rotation);
        const force = direction.multiply(-this.config.moveSpeed * 0.5);
        this.state.physicsBody.acceleration = this.state.physicsBody.acceleration.add(force);
        break;
      }
      case AgentAction.TURN_LEFT:
        this.state.rotation -= this.config.turnSpeed;
        break;
      case AgentAction.TURN_RIGHT:
        this.state.rotation += this.config.turnSpeed;
        break;
      case AgentAction.CONSUME:
        break;
      case AgentAction.IDLE:
        break;
    }
  }

  observe(
    resources: Resource[],
    agents: Agent[],
    obstacles: Obstacle[],
    worldWidth: number,
    worldHeight: number
  ): AgentObservation {
    const pos = this.state.physicsBody.position;

    const nearbyResources = resources
      .map((r) => {
        const distance = pos.distance(r.position);
        const angle = pos.angleTo(r.position) - this.state.rotation;
        return {
          type: r.type,
          distance,
          angle,
          amount: r.amount,
        };
      })
      .filter((r) => r.distance <= this.config.sensorRadius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    const nearbyAgents = agents
      .filter((a) => a.state.id !== this.state.id && a.state.isAlive)
      .map((a) => {
        const distance = pos.distance(a.state.physicsBody.position);
        const angle = pos.angleTo(a.state.physicsBody.position) - this.state.rotation;
        return {
          distance,
          angle,
          energy: a.state.energy,
        };
      })
      .filter((a) => a.distance <= this.config.sensorRadius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    const nearbyObstacles = obstacles
      .map((o) => {
        const distance = pos.distance(o.position);
        const angle = pos.angleTo(o.position) - this.state.rotation;
        return {
          distance,
          angle,
          radius: o.radius,
        };
      })
      .filter((o) => o.distance <= this.config.sensorRadius + o.radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);

    return {
      position: pos.clone(),
      velocity: this.state.physicsBody.velocity.clone(),
      rotation: this.state.rotation,
      energy: this.state.energy,
      nearbyResources,
      nearbyAgents,
      nearbyObstacles,
      worldBounds: {
        distanceToEdges: [
          pos.x,
          pos.y,
          worldWidth - pos.x,
          worldHeight - pos.y,
        ],
      },
    };
  }

  tryConsume(resources: Resource[]): number {
    if (!this.state.isAlive) return 0;

    let totalConsumed = 0;
    const pos = this.state.physicsBody.position;

    for (const resource of resources) {
      const distance = pos.distance(resource.position);
      if (distance <= this.config.consumeRadius) {
        const consumed = Math.min(this.config.consumeRate, resource.amount);
        totalConsumed += consumed;
        resource.amount -= consumed;
      }
    }

    return totalConsumed;
  }

  update(deltaTime: number): void {
    if (!this.state.isAlive) return;

    this.state.age++;

    this.state.energy -= this.config.energyDecayRate * deltaTime * 60;

    const speed = this.state.physicsBody.velocity.magnitude();
    const movementCost = speed * 0.01 * deltaTime * 60;
    this.state.energy -= movementCost;

    if (this.state.energy <= 0) {
      this.state.energy = 0;
      this.state.isAlive = false;
    }

    if (this.state.energy > this.state.maxEnergy) {
      this.state.energy = this.state.maxEnergy;
    }
  }

  gainEnergy(amount: number): void {
    this.state.energy = Math.min(this.state.maxEnergy, this.state.energy + amount);
  }

  getReward(): number {
    if (!this.state.isAlive) return -100;

    const survivalReward = this.state.energy / this.state.maxEnergy;
    const ageReward = Math.log(this.state.age + 1) * 0.1;

    return survivalReward + ageReward;
  }

  getConfig(): AgentConfig {
    return { ...this.config };
  }
}
