import { Vector2D } from '../physics/Vector2D';

export enum ResourceType {
  FOOD = 'food',
  ENERGY = 'energy',
  MATERIAL = 'material',
}

export interface Resource {
  id: string;
  type: ResourceType;
  position: Vector2D;
  amount: number;
  maxAmount: number;
  regenerationRate: number;
  radius: number;
}

export interface WorldConfig {
  width: number;
  height: number;
  initialResources: number;
  resourceRegenerationInterval: number;
  maxResources: number;
}

export interface Obstacle {
  id: string;
  position: Vector2D;
  radius: number;
}

export class World {
  private config: WorldConfig;
  private resources: Map<string, Resource>;
  private obstacles: Map<string, Obstacle>;
  private resourceIdCounter: number = 0;
  private obstacleIdCounter: number = 0;
  private tickCounter: number = 0;

  constructor(config: Partial<WorldConfig> = {}) {
    this.config = {
      width: 1000,
      height: 800,
      initialResources: 50,
      resourceRegenerationInterval: 300,
      maxResources: 100,
      ...config,
    };

    this.resources = new Map();
    this.obstacles = new Map();
    this.initialize();
  }

  private initialize(): void {
    for (let i = 0; i < this.config.initialResources; i++) {
      this.spawnResource();
    }
  }

  spawnResource(type?: ResourceType, position?: Vector2D): Resource {
    const resourceType = type || this.getRandomResourceType();
    const pos = position || Vector2D.random(this.config.width, this.config.height);

    const resource: Resource = {
      id: `resource-${this.resourceIdCounter++}`,
      type: resourceType,
      position: pos,
      amount: this.getResourceAmount(resourceType),
      maxAmount: this.getResourceAmount(resourceType),
      regenerationRate: 0.1,
      radius: this.getResourceRadius(resourceType),
    };

    this.resources.set(resource.id, resource);
    return resource;
  }

  private getRandomResourceType(): ResourceType {
    const types = [ResourceType.FOOD, ResourceType.ENERGY, ResourceType.MATERIAL];
    return types[Math.floor(Math.random() * types.length)];
  }

  private getResourceAmount(type: ResourceType): number {
    switch (type) {
      case ResourceType.FOOD:
        return 50 + Math.random() * 50;
      case ResourceType.ENERGY:
        return 100 + Math.random() * 100;
      case ResourceType.MATERIAL:
        return 30 + Math.random() * 30;
    }
  }

  private getResourceRadius(type: ResourceType): number {
    switch (type) {
      case ResourceType.FOOD:
        return 8;
      case ResourceType.ENERGY:
        return 12;
      case ResourceType.MATERIAL:
        return 6;
    }
  }

  spawnObstacle(position?: Vector2D, radius?: number): Obstacle {
    const obstacle: Obstacle = {
      id: `obstacle-${this.obstacleIdCounter++}`,
      position: position || Vector2D.random(this.config.width, this.config.height),
      radius: radius || 20 + Math.random() * 30,
    };

    this.obstacles.set(obstacle.id, obstacle);
    return obstacle;
  }

  removeResource(id: string): boolean {
    return this.resources.delete(id);
  }

  removeObstacle(id: string): boolean {
    return this.obstacles.delete(id);
  }

  consumeResource(id: string, amount: number): number {
    const resource = this.resources.get(id);
    if (!resource) return 0;

    const consumed = Math.min(amount, resource.amount);
    resource.amount -= consumed;

    if (resource.amount <= 0) {
      this.resources.delete(id);
    }

    return consumed;
  }

  getResourcesInRadius(position: Vector2D, radius: number): Resource[] {
    const nearby: Resource[] = [];

    for (const resource of this.resources.values()) {
      if (position.distance(resource.position) <= radius) {
        nearby.push(resource);
      }
    }

    return nearby;
  }

  getObstaclesInRadius(position: Vector2D, radius: number): Obstacle[] {
    const nearby: Obstacle[] = [];

    for (const obstacle of this.obstacles.values()) {
      if (position.distance(obstacle.position) <= radius + obstacle.radius) {
        nearby.push(obstacle);
      }
    }

    return nearby;
  }

  update(): void {
    this.tickCounter++;

    for (const resource of this.resources.values()) {
      if (resource.amount < resource.maxAmount) {
        resource.amount = Math.min(
          resource.maxAmount,
          resource.amount + resource.regenerationRate
        );
      }
    }

    if (
      this.tickCounter % this.config.resourceRegenerationInterval === 0 &&
      this.resources.size < this.config.maxResources
    ) {
      this.spawnResource();
    }
  }

  getResources(): Resource[] {
    return Array.from(this.resources.values());
  }

  getObstacles(): Obstacle[] {
    return Array.from(this.obstacles.values());
  }

  getConfig(): WorldConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<WorldConfig>): void {
    this.config = { ...this.config, ...config };
  }

  clear(): void {
    this.resources.clear();
    this.obstacles.clear();
    this.tickCounter = 0;
  }

  reset(): void {
    this.clear();
    this.initialize();
  }

  getTick(): number {
    return this.tickCounter;
  }
}
