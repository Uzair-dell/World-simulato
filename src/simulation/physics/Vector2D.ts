export class Vector2D {
  constructor(public x: number = 0, public y: number = 0) {}

  static zero(): Vector2D {
    return new Vector2D(0, 0);
  }

  static fromAngle(angle: number, magnitude: number = 1): Vector2D {
    return new Vector2D(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
  }

  add(v: Vector2D): Vector2D {
    return new Vector2D(this.x + v.x, this.y + v.y);
  }

  subtract(v: Vector2D): Vector2D {
    return new Vector2D(this.x - v.x, this.y - v.y);
  }

  multiply(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  divide(scalar: number): Vector2D {
    if (scalar === 0) return Vector2D.zero();
    return new Vector2D(this.x / scalar, this.y / scalar);
  }

  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  normalize(): Vector2D {
    const mag = this.magnitude();
    if (mag === 0) return Vector2D.zero();
    return this.divide(mag);
  }

  limit(max: number): Vector2D {
    const magSq = this.magnitudeSquared();
    if (magSq > max * max) {
      return this.normalize().multiply(max);
    }
    return new Vector2D(this.x, this.y);
  }

  dot(v: Vector2D): number {
    return this.x * v.x + this.y * v.y;
  }

  distance(v: Vector2D): number {
    return this.subtract(v).magnitude();
  }

  distanceSquared(v: Vector2D): number {
    return this.subtract(v).magnitudeSquared();
  }

  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  angleTo(v: Vector2D): number {
    return Math.atan2(v.y - this.y, v.x - this.x);
  }

  rotate(angle: number): Vector2D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vector2D(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    );
  }

  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }

  toArray(): [number, number] {
    return [this.x, this.y];
  }

  static random(maxX: number, maxY: number): Vector2D {
    return new Vector2D(Math.random() * maxX, Math.random() * maxY);
  }
}
