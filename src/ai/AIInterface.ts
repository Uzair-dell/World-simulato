import { Agent, AgentObservation, AgentAction } from '../simulation/agents/Agent';

export interface AIDecision {
  action: AgentAction;
  metadata?: Record<string, unknown>;
}

export interface AIController {
  decide(agent: Agent, observation: AgentObservation): AIDecision | Promise<AIDecision>;
  getName(): string;
  getDescription(): string;
}

export abstract class BaseAIController implements AIController {
  abstract decide(agent: Agent, observation: AgentObservation): AIDecision | Promise<AIDecision>;
  abstract getName(): string;
  abstract getDescription(): string;
}

export class AIControllerRegistry {
  private static controllers: Map<string, () => AIController> = new Map();

  static register(name: string, factory: () => AIController): void {
    this.controllers.set(name, factory);
  }

  static create(name: string): AIController | null {
    const factory = this.controllers.get(name);
    return factory ? factory() : null;
  }

  static getAvailable(): string[] {
    return Array.from(this.controllers.keys());
  }

  static getAll(): Map<string, () => AIController> {
    return new Map(this.controllers);
  }
}