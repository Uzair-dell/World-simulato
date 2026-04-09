import { supabase } from './supabase';
import { Simulation } from '../simulation/core/Simulation';

export interface SimulationRecord {
  id: string;
  name: string;
  config: Record<string, unknown>;
  status: 'running' | 'paused' | 'stopped';
  created_at: string;
  updated_at: string;
}

export interface AgentRecord {
  id: string;
  simulation_id: string;
  agent_type: string;
  state: Record<string, unknown>;
  lifetime_ticks: number;
  is_alive: boolean;
}

export interface WorldStateRecord {
  id: string;
  simulation_id: string;
  tick: number;
  resources: unknown[];
  environment: Record<string, unknown>;
}

export class SimulationService {
  async createSimulation(name: string, config: Record<string, unknown>): Promise<SimulationRecord | null> {
    const { data, error } = await supabase
      .from('simulations')
      .insert([
        {
          name,
          config,
          status: 'stopped',
        },
      ])
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating simulation:', error);
      return null;
    }

    return data;
  }

  async getSimulations(): Promise<SimulationRecord[]> {
    const { data, error } = await supabase
      .from('simulations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching simulations:', error);
      return [];
    }

    return data || [];
  }

  async getSimulation(id: string): Promise<SimulationRecord | null> {
    const { data, error } = await supabase
      .from('simulations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching simulation:', error);
      return null;
    }

    return data;
  }

  async updateSimulation(id: string, updates: Partial<SimulationRecord>): Promise<SimulationRecord | null> {
    const { data, error } = await supabase
      .from('simulations')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating simulation:', error);
      return null;
    }

    return data;
  }

  async deleteSimulation(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('simulations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting simulation:', error);
      return false;
    }

    return true;
  }

  async saveAgentState(simulationId: string, agentId: string, agentType: string, state: Record<string, unknown>, lifetimeTicks: number, isAlive: boolean): Promise<AgentRecord | null> {
    const { data, error } = await supabase
      .from('agents')
      .upsert([
        {
          id: agentId,
          simulation_id: simulationId,
          agent_type: agentType,
          state,
          lifetime_ticks: lifetimeTicks,
          is_alive: isAlive,
        },
      ], { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error saving agent state:', error);
      return null;
    }

    return data;
  }

  async getAgentsBySimulation(simulationId: string): Promise<AgentRecord[]> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('simulation_id', simulationId);

    if (error) {
      console.error('Error fetching agents:', error);
      return [];
    }

    return data || [];
  }

  async saveWorldState(simulationId: string, tick: number, resources: unknown[], environment: Record<string, unknown>): Promise<WorldStateRecord | null> {
    const { data, error } = await supabase
      .from('world_state')
      .insert([
        {
          simulation_id: simulationId,
          tick,
          resources,
          environment,
        },
      ])
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error saving world state:', error);
      return null;
    }

    return data;
  }

  async getWorldStates(simulationId: string): Promise<WorldStateRecord[]> {
    const { data, error } = await supabase
      .from('world_state')
      .select('*')
      .eq('simulation_id', simulationId)
      .order('tick', { ascending: true });

    if (error) {
      console.error('Error fetching world states:', error);
      return [];
    }

    return data || [];
  }

  async saveTrainingData(simulationId: string, agentId: string, tick: number, observation: Record<string, unknown>, action: Record<string, unknown>, reward: number): Promise<void> {
    const { error } = await supabase
      .from('training_data')
      .insert([
        {
          agent_id: agentId,
          tick,
          observation,
          action,
          reward,
        },
      ]);

    if (error) {
      console.error('Error saving training data:', error);
    }
  }

  async getTrainingData(agentId: string): Promise<unknown[]> {
    const { data, error } = await supabase
      .from('training_data')
      .select('*')
      .eq('agent_id', agentId)
      .order('tick', { ascending: true });

    if (error) {
      console.error('Error fetching training data:', error);
      return [];
    }

    return data || [];
  }
}

export const simulationService = new SimulationService();
