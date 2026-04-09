/*
  # Simulation World Database Schema

  ## Overview
  Creates tables for persisting simulation state, agents, and training data.

  ## New Tables
  
  ### `simulations`
  Stores simulation instances and their configuration
  - `id` (uuid, primary key)
  - `name` (text) - Simulation name
  - `config` (jsonb) - Physics and world configuration
  - `status` (text) - running, paused, stopped
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `agents`
  Stores agent state and history
  - `id` (uuid, primary key)
  - `simulation_id` (uuid, foreign key)
  - `agent_type` (text) - Type of agent behavior
  - `state` (jsonb) - Position, velocity, energy, etc.
  - `lifetime_ticks` (integer) - How long agent has lived
  - `is_alive` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `world_state`
  Stores world snapshots
  - `id` (uuid, primary key)
  - `simulation_id` (uuid, foreign key)
  - `tick` (bigint) - Simulation tick number
  - `resources` (jsonb) - Resource positions and amounts
  - `environment` (jsonb) - Environmental state
  - `created_at` (timestamptz)

  ### `training_data`
  Stores agent observations and actions for AI training
  - `id` (uuid, primary key)
  - `agent_id` (uuid, foreign key)
  - `tick` (bigint)
  - `observation` (jsonb) - Agent's sensor data
  - `action` (jsonb) - Action taken
  - `reward` (float) - Reward signal
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Allow public read access for demo purposes
  - Restrict write access to authenticated users
*/

-- Create simulations table
CREATE TABLE IF NOT EXISTS simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Unnamed Simulation',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'stopped',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id uuid REFERENCES simulations(id) ON DELETE CASCADE,
  agent_type text NOT NULL DEFAULT 'default',
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  lifetime_ticks integer DEFAULT 0,
  is_alive boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create world_state table
CREATE TABLE IF NOT EXISTS world_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id uuid REFERENCES simulations(id) ON DELETE CASCADE,
  tick bigint NOT NULL DEFAULT 0,
  resources jsonb NOT NULL DEFAULT '[]'::jsonb,
  environment jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create training_data table
CREATE TABLE IF NOT EXISTS training_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
  tick bigint NOT NULL,
  observation jsonb NOT NULL DEFAULT '{}'::jsonb,
  action jsonb NOT NULL DEFAULT '{}'::jsonb,
  reward float DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_simulation ON agents(simulation_id);
CREATE INDEX IF NOT EXISTS idx_agents_alive ON agents(is_alive);
CREATE INDEX IF NOT EXISTS idx_world_state_simulation ON world_state(simulation_id);
CREATE INDEX IF NOT EXISTS idx_world_state_tick ON world_state(tick);
CREATE INDEX IF NOT EXISTS idx_training_data_agent ON training_data(agent_id);
CREATE INDEX IF NOT EXISTS idx_training_data_tick ON training_data(tick);

-- Enable Row Level Security
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for simulations
CREATE POLICY "Anyone can view simulations"
  ON simulations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert simulations"
  ON simulations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update simulations"
  ON simulations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for agents
CREATE POLICY "Anyone can view agents"
  ON agents FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert agents"
  ON agents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update agents"
  ON agents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for world_state
CREATE POLICY "Anyone can view world state"
  ON world_state FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert world state"
  ON world_state FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for training_data
CREATE POLICY "Anyone can view training data"
  ON training_data FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert training data"
  ON training_data FOR INSERT
  TO authenticated
  WITH CHECK (true);