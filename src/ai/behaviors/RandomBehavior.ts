import { Agent, AgentObservation, AgentAction } from '../../simulation/agents/Agent';
import { BaseAIController, AIDecision } from '../AIInterface';

export class RandomBehavior extends BaseAIController {
  private actionChangeInterval: number = 30;
  private tickCounter: number = 0;
  private currentAction: AgentAction = AgentAction.IDLE;

  decide(agent: Agent, observation: AgentObservation): AIDecision {
    this.tickCounter++;

    if (this.tickCounter >= this.actionChangeInterval) {
      this.tickCounter = 0;
      this.currentAction = this.getRandomAction();
    }

    return {
      action: this.currentAction,
      metadata: { behavior: 'random' },
    };
  }

  private getRandomAction(): AgentAction {
    const actions = [
      AgentAction.MOVE_FORWARD,
      AgentAction.TURN_LEFT,
      AgentAction.TURN_RIGHT,
      AgentAction.IDLE,
    ];
    return actions[Math.floor(Math.random() * actions.length)];
  }

  getName(): string {
    return 'Random';
  }

  getDescription(): string {
    return 'Moves randomly without purpose';
  }
}
