import { Agent, AgentObservation, AgentAction } from '../../simulation/agents/Agent';
import { BaseAIController, AIDecision } from '../AIInterface';

export class ResourceSeekerBehavior extends BaseAIController {
  decide(agent: Agent, observation: AgentObservation): AIDecision {
    if (observation.nearbyResources.length > 0) {
      const closestResource = observation.nearbyResources[0];

      if (closestResource.distance < agent.getConfig().consumeRadius) {
        return {
          action: AgentAction.CONSUME,
          metadata: { behavior: 'resource-seeker', target: 'consuming' },
        };
      }

      const angleToResource = closestResource.angle;
      const angleDiff = this.normalizeAngle(angleToResource);

      if (Math.abs(angleDiff) > 0.3) {
        return {
          action: angleDiff > 0 ? AgentAction.TURN_RIGHT : AgentAction.TURN_LEFT,
          metadata: { behavior: 'resource-seeker', target: 'turning' },
        };
      }

      return {
        action: AgentAction.MOVE_FORWARD,
        metadata: { behavior: 'resource-seeker', target: 'moving' },
      };
    }

    if (observation.nearbyObstacles.length > 0) {
      const closestObstacle = observation.nearbyObstacles[0];
      if (closestObstacle.distance < closestObstacle.radius + 30) {
        const angleToObstacle = closestObstacle.angle;
        const angleDiff = this.normalizeAngle(angleToObstacle);

        return {
          action: angleDiff > 0 ? AgentAction.TURN_LEFT : AgentAction.TURN_RIGHT,
          metadata: { behavior: 'resource-seeker', target: 'avoiding-obstacle' },
        };
      }
    }

    const [left, top, right, bottom] = observation.worldBounds.distanceToEdges;
    const margin = 50;

    if (left < margin || right < margin || top < margin || bottom < margin) {
      let targetAngle = 0;

      if (left < margin) targetAngle = 0;
      else if (right < margin) targetAngle = Math.PI;
      else if (top < margin) targetAngle = Math.PI / 2;
      else if (bottom < margin) targetAngle = -Math.PI / 2;

      const angleDiff = this.normalizeAngle(targetAngle - observation.rotation);

      if (Math.abs(angleDiff) > 0.3) {
        return {
          action: angleDiff > 0 ? AgentAction.TURN_RIGHT : AgentAction.TURN_LEFT,
          metadata: { behavior: 'resource-seeker', target: 'avoiding-edge' },
        };
      }
    }

    if (Math.random() < 0.05) {
      return {
        action: Math.random() > 0.5 ? AgentAction.TURN_LEFT : AgentAction.TURN_RIGHT,
        metadata: { behavior: 'resource-seeker', target: 'exploring' },
      };
    }

    return {
      action: AgentAction.MOVE_FORWARD,
      metadata: { behavior: 'resource-seeker', target: 'exploring' },
    };
  }

  private normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  }

  getName(): string {
    return 'Resource Seeker';
  }

  getDescription(): string {
    return 'Seeks and consumes nearby resources intelligently';
  }
}
