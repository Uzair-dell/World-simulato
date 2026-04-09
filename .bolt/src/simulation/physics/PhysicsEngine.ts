import { Vector2D } from './Vector2D';

export interface PhysicsConfig {
  gravity: Vector2D;
  friction: number;
  airResistance: number;
  timeStep: number;
}

export interface PhysicsBody {
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
  mass: number;
  radius: number;
  fixed: boolean;
}

export class PhysicsEngine {
  private config: PhysicsConfig;

  constructor(config?: Partial<PhysicsConfig>) {
    this.config = {
      gravity: new Vector2D(0, 0),
      friction: 0.98,
      airResistance: 0.99,
      timeStep: 1 / 60,
      ...config,
    };
  }

  updateConfig(config: Partial<PhysicsConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): PhysicsConfig {
    return { ...this.config };
  }

  applyForce(body: PhysicsBody, force: Vector2D): void {
    if (body.fixed) return;
    const acceleration = force.divide(body.mass);
    body.acceleration = body.acceleration.add(acceleration);
  }

  update(body: PhysicsBody, deltaTime: number = this.config.timeStep): void {
    if (body.fixed) return;

    body.acceleration = body.acceleration.add(this.config.gravity);

    body.velocity = body.velocity.add(body.acceleration.multiply(deltaTime));

    body.velocity = body.velocity.multiply(this.config.airResistance);

    body.position = body.position.add(body.velocity.multiply(deltaTime));

    body.acceleration = Vector2D.zero();
  }

  checkCollision(bodyA: PhysicsBody, bodyB: PhysicsBody): boolean {
    const distance = bodyA.position.distance(bodyB.position);
    return distance < bodyA.radius + bodyB.radius;
  }

  resolveCollision(bodyA: PhysicsBody, bodyB: PhysicsBody): void {
    if (bodyA.fixed && bodyB.fixed) return;

    const direction = bodyB.position.subtract(bodyA.position);
    const distance = direction.magnitude();
    const overlap = bodyA.radius + bodyB.radius - distance;

    if (overlap <= 0) return;

    const normal = direction.normalize();

    if (!bodyA.fixed && !bodyB.fixed) {
      const correction = normal.multiply(overlap / 2);
      bodyA.position = bodyA.position.subtract(correction);
      bodyB.position = bodyB.position.add(correction);

      const relativeVelocity = bodyB.velocity.subtract(bodyA.velocity);
      const velocityAlongNormal = relativeVelocity.dot(normal);

      if (velocityAlongNormal < 0) return;

      const restitution = 0.8;
      const impulse = (-(1 + restitution) * velocityAlongNormal) / (1 / bodyA.mass + 1 / bodyB.mass);

      const impulseVector = normal.multiply(impulse);
      bodyA.velocity = bodyA.velocity.subtract(impulseVector.divide(bodyA.mass));
      bodyB.velocity = bodyB.velocity.add(impulseVector.divide(bodyB.mass));
    } else if (bodyA.fixed) {
      bodyB.position = bodyB.position.add(normal.multiply(overlap));
      const velocityAlongNormal = bodyB.velocity.dot(normal);
      if (velocityAlongNormal < 0) {
        bodyB.velocity = bodyB.velocity.subtract(normal.multiply(velocityAlongNormal * 1.8));
      }
    } else {
      bodyA.position = bodyA.position.subtract(normal.multiply(overlap));
      const velocityAlongNormal = bodyA.velocity.dot(normal);
      if (velocityAlongNormal > 0) {
        bodyA.velocity = bodyA.velocity.subtract(normal.multiply(velocityAlongNormal * 1.8));
      }
    }
  }

  constrainToBox(body: PhysicsBody, minX: number, minY: number, maxX: number, maxY: number): void {
    if (body.position.x - body.radius < minX) {
      body.position.x = minX + body.radius;
      body.velocity.x = Math.abs(body.velocity.x) * this.config.friction;
    }
    if (body.position.x + body.radius > maxX) {
      body.position.x = maxX - body.radius;
      body.velocity.x = -Math.abs(body.velocity.x) * this.config.friction;
    }
    if (body.position.y - body.radius < minY) {
      body.position.y = minY + body.radius;
      body.velocity.y = Math.abs(body.velocity.y) * this.config.friction;
    }
    if (body.position.y + body.radius > maxY) {
      body.position.y = maxY - body.radius;
      body.velocity.y = -Math.abs(body.velocity.y) * this.config.friction;
    }
  }

  applyFriction(body: PhysicsBody, frictionCoefficient: number): void {
    if (body.fixed) return;
    body.velocity = body.velocity.multiply(1 - frictionCoefficient);
  }
}
