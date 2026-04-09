import { AIControllerRegistry } from '../AIInterface';
import { RandomBehavior } from './RandomBehavior';
import { ResourceSeekerBehavior } from './ResourceSeekerBehavior';

export function registerDefaultBehaviors(): void {
  AIControllerRegistry.register('random', () => new RandomBehavior());
  AIControllerRegistry.register('resource-seeker', () => new ResourceSeekerBehavior());
}

export { RandomBehavior, ResourceSeekerBehavior };
