import { Simulation } from '../simulation/core/Simulation';
import { Agent } from '../simulation/agents/Agent';
import { Resource, ResourceType } from '../simulation/world/World';
import { Vector2D } from '../simulation/physics/Vector2D';

export interface Camera {
  position: Vector2D;
  zoom: number;
}

export interface RenderOptions {
  showVelocity: boolean;
  showSensorRadius: boolean;
  showGrid: boolean;
  showEnergy: boolean;
}

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;
  private options: RenderOptions;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = ctx;

    this.camera = {
      position: new Vector2D(0, 0),
      zoom: 1,
    };

    this.options = {
      showVelocity: false,
      showSensorRadius: false,
      showGrid: true,
      showEnergy: true,
    };
  }

  setCamera(position: Vector2D, zoom: number): void {
    this.camera.position = position;
    this.camera.zoom = zoom;
  }

  setOptions(options: Partial<RenderOptions>): void {
    this.options = { ...this.options, ...options };
  }

  clear(): void {
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  render(simulation: Simulation): void {
    this.clear();

    const world = simulation.getWorld();
    const worldConfig = world.getConfig();

    if (this.options.showGrid) {
      this.renderGrid(worldConfig.width, worldConfig.height);
    }

    this.renderBounds(worldConfig.width, worldConfig.height);

    for (const obstacle of world.getObstacles()) {
      this.renderObstacle(obstacle.position, obstacle.radius);
    }

    for (const resource of world.getResources()) {
      this.renderResource(resource);
    }

    for (const agent of simulation.getAgents()) {
      this.renderAgent(agent);
    }
  }

  private renderGrid(width: number, height: number): void {
    const gridSize = 50;
    this.ctx.strokeStyle = '#2a2a2a';
    this.ctx.lineWidth = 1;

    for (let x = 0; x <= width; x += gridSize) {
      this.ctx.beginPath();
      const screenX = this.worldToScreenX(x);
      this.ctx.moveTo(screenX, this.worldToScreenY(0));
      this.ctx.lineTo(screenX, this.worldToScreenY(height));
      this.ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      this.ctx.beginPath();
      const screenY = this.worldToScreenY(y);
      this.ctx.moveTo(this.worldToScreenX(0), screenY);
      this.ctx.lineTo(this.worldToScreenX(width), screenY);
      this.ctx.stroke();
    }
  }

  private renderBounds(width: number, height: number): void {
    this.ctx.strokeStyle = '#444';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      this.worldToScreenX(0),
      this.worldToScreenY(0),
      width * this.camera.zoom,
      height * this.camera.zoom
    );
  }

  private renderObstacle(position: Vector2D, radius: number): void {
    this.ctx.fillStyle = '#555';
    this.ctx.beginPath();
    this.ctx.arc(
      this.worldToScreenX(position.x),
      this.worldToScreenY(position.y),
      radius * this.camera.zoom,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    this.ctx.strokeStyle = '#666';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  private renderResource(resource: Resource): void {
    const screenX = this.worldToScreenX(resource.position.x);
    const screenY = this.worldToScreenY(resource.position.y);
    const radius = resource.radius * this.camera.zoom;

    let color: string;
    switch (resource.type) {
      case ResourceType.FOOD:
        color = '#4ade80';
        break;
      case ResourceType.ENERGY:
        color = '#fbbf24';
        break;
      case ResourceType.MATERIAL:
        color = '#60a5fa';
        break;
    }

    const alpha = Math.min(1, resource.amount / resource.maxAmount);
    this.ctx.fillStyle = color;
    this.ctx.globalAlpha = alpha * 0.6 + 0.4;

    this.ctx.beginPath();
    this.ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.globalAlpha = 1;
    this.ctx.stroke();
  }

  private renderAgent(agent: Agent): void {
    const pos = agent.state.physicsBody.position;
    const screenX = this.worldToScreenX(pos.x);
    const screenY = this.worldToScreenY(pos.y);
    const radius = agent.state.physicsBody.radius * this.camera.zoom;

    if (this.options.showSensorRadius && agent.state.isAlive) {
      this.ctx.strokeStyle = agent.state.color;
      this.ctx.globalAlpha = 0.1;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(
        screenX,
        screenY,
        agent.getConfig().sensorRadius * this.camera.zoom,
        0,
        Math.PI * 2
      );
      this.ctx.stroke();
      this.ctx.globalAlpha = 1;
    }

    this.ctx.fillStyle = agent.state.isAlive ? agent.state.color : '#666';
    this.ctx.beginPath();
    this.ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = agent.state.isAlive ? '#fff' : '#444';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    if (agent.state.isAlive) {
      const dirX = Math.cos(agent.state.rotation) * radius * 1.5;
      const dirY = Math.sin(agent.state.rotation) * radius * 1.5;
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(screenX, screenY);
      this.ctx.lineTo(screenX + dirX, screenY + dirY);
      this.ctx.stroke();
    }

    if (this.options.showVelocity && agent.state.isAlive) {
      const vel = agent.state.physicsBody.velocity;
      const velScale = 2;
      this.ctx.strokeStyle = '#ff6b6b';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(screenX, screenY);
      this.ctx.lineTo(
        screenX + vel.x * velScale * this.camera.zoom,
        screenY + vel.y * velScale * this.camera.zoom
      );
      this.ctx.stroke();
    }

    if (this.options.showEnergy && agent.state.isAlive) {
      const barWidth = radius * 2;
      const barHeight = 4;
      const barY = screenY - radius - 10;

      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(screenX - barWidth / 2, barY, barWidth, barHeight);

      const energyPercent = agent.state.energy / agent.state.maxEnergy;
      const energyColor = energyPercent > 0.5 ? '#4ade80' : energyPercent > 0.25 ? '#fbbf24' : '#ef4444';
      this.ctx.fillStyle = energyColor;
      this.ctx.fillRect(screenX - barWidth / 2, barY, barWidth * energyPercent, barHeight);
    }
  }

  private worldToScreenX(x: number): number {
    return (x - this.camera.position.x) * this.camera.zoom;
  }

  private worldToScreenY(y: number): number {
    return (y - this.camera.position.y) * this.camera.zoom;
  }

  screenToWorldX(screenX: number): number {
    return screenX / this.camera.zoom + this.camera.position.x;
  }

  screenToWorldY(screenY: number): number {
    return screenY / this.camera.zoom + this.camera.position.y;
  }

  getCamera(): Camera {
    return { ...this.camera };
  }

  getOptions(): RenderOptions {
    return { ...this.options };
  }
}
