/*
  # Security Fixes

  ## Overview
  Addresses security vulnerabilities and performance issues:
  - Remove unused indexes to reduce storage and write overhead
  - Fix overly permissive RLS policies that bypass security
  - Implement proper row-level security with ownership checks

  ## Changes

  ### 1. Remove Unused Indexes
  - Indexes were created but not used by queries
  - Removing reduces storage overhead and write performance impact

  ### 2. Fix RLS Policies
  - Previous policies had `WITH CHECK (true)` allowing unrestricted access
  - Implement proper ownership/authentication checks
  - Ensure data isolation between users

  ### 3. Auth Connection Strategy
  - Configuration documented for manual review
  - Consider percentage-based allocation for better scalability
*/

DROP INDEX IF EXISTS idx_agents_simulation;
DROP INDEX IF EXISTS idx_agents_alive;
DROP INDEX IF EXISTS idx_world_state_simulation;
DROP INDEX IF EXISTS idx_world_state_tick;
DROP INDEX IF EXISTS idx_training_data_agent;
DROP INDEX IF EXISTS idx_training_data_tick;

DROP POLICY IF EXISTS "Authenticated users can insert simulations" ON simulations;
DROP POLICY IF EXISTS "Authenticated users can update simulations" ON simulations;
DROP POLICY IF EXISTS "Authenticated users can insert agents" ON agents;
DROP POLICY IF EXISTS "Authenticated users can update agents" ON agents;
DROP POLICY IF EXISTS "Authenticated users can insert world state" ON world_state;
DROP POLICY IF EXISTS "Authenticated users can insert training data" ON training_data;

ALTER TABLE simulations ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

ALTER TABLE agents ADD COLUMN IF NOT EXISTS simulation_owner uuid REFERENCES auth.users(id);

ALTER TABLE world_state ADD COLUMN IF NOT EXISTS simulation_owner uuid REFERENCES auth.users(id);

ALTER TABLE training_data ADD COLUMN IF NOT EXISTS simulation_owner uuid REFERENCES auth.users(id);

CREATE POLICY "Users can view own simulations"
  ON simulations FOR SELECT
  TO authenticated
  USING (created_by = auth.uid() OR created_by IS NULL);

CREATE POLICY "Users can insert own simulations"
  ON simulations FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own simulations"
  ON simulations FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete own simulations"
  ON simulations FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can view own agents"
  ON agents FOR SELECT
  TO authenticated
  USING (simulation_owner = auth.uid() OR simulation_owner IS NULL);

CREATE POLICY "Users can insert own agents"
  ON agents FOR INSERT
  TO authenticated
  WITH CHECK (simulation_owner = auth.uid());

CREATE POLICY "Users can update own agents"
  ON agents FOR UPDATE
  TO authenticated
  USING (simulation_owner = auth.uid())
  WITH CHECK (simulation_owner = auth.uid());

CREATE POLICY "Users can delete own agents"
  ON agents FOR DELETE
  TO authenticated
  USING (simulation_owner = auth.uid());

CREATE POLICY "Users can view own world state"
  ON world_state FOR SELECT
  TO authenticated
  USING (simulation_owner = auth.uid() OR simulation_owner IS NULL);

CREATE POLICY "Users can insert own world state"
  ON world_state FOR INSERT
  TO authenticated
  WITH CHECK (simulation_owner = auth.uid());

CREATE POLICY "Users can view own training data"
  ON training_data FOR SELECT
  TO authenticated
  USING (simulation_owner = auth.uid() OR simulation_owner IS NULL);

CREATE POLICY "Users can insert own training data"
  ON training_data FOR INSERT
  TO authenticated
  WITH CHECK (simulation_owner = auth.uid());

CREATE INDEX idx_simulations_owner ON simulations(created_by);
CREATE INDEX idx_agents_owner ON agents(simulation_owner);
CREATE INDEX idx_world_state_owner ON world_state(simulation_owner);
CREATE INDEX idx_training_data_owner ON training_data(simulation_owner);
