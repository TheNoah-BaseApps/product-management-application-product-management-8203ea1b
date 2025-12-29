CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  email text NOT NULL UNIQUE,
  name text,
  password text NOT NULL,
  role text DEFAULT 'Viewer' NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

CREATE TABLE IF NOT EXISTS product_roadmaps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  roadmap_id text NOT NULL UNIQUE,
  roadmap_name text NOT NULL,
  timeframe text,
  strategic_theme text,
  last_updated_date timestamp with time zone DEFAULT now() NOT NULL,
  next_review_date date,
  stakeholder_visibility text,
  status text DEFAULT 'Planning' NOT NULL,
  approved_by uuid,
  approval_date date,
  change_log jsonb DEFAULT '[]'::jsonb,
  dependencies text[],
  risk_assessment text,
  success_metrics jsonb,
  presentation_version text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_roadmaps_roadmap_id ON product_roadmaps (roadmap_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_status ON product_roadmaps (status);
CREATE INDEX IF NOT EXISTS idx_roadmaps_created_by ON product_roadmaps (created_by);

CREATE TABLE IF NOT EXISTS product_requirements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  requirement_id text NOT NULL UNIQUE,
  requirement_type text,
  user_story text,
  acceptance_criteria text,
  priority text DEFAULT 'Medium' NOT NULL,
  complexity text,
  status text DEFAULT 'Draft' NOT NULL,
  last_updated_date timestamp with time zone DEFAULT now() NOT NULL,
  validated_by uuid,
  validation_date date,
  related_features text[],
  technical_constraints text,
  security_considerations text,
  compliance_needs text,
  mockup_references text[],
  roadmap_id uuid,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_requirements_requirement_id ON product_requirements (requirement_id);
CREATE INDEX IF NOT EXISTS idx_requirements_status ON product_requirements (status);
CREATE INDEX IF NOT EXISTS idx_requirements_priority ON product_requirements (priority);
CREATE INDEX IF NOT EXISTS idx_requirements_roadmap_id ON product_requirements (roadmap_id);
CREATE INDEX IF NOT EXISTS idx_requirements_created_by ON product_requirements (created_by);

CREATE TABLE IF NOT EXISTS product_ideas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  idea_id text NOT NULL UNIQUE,
  idea_name text NOT NULL,
  submitted_by uuid NOT NULL,
  submission_date timestamp with time zone DEFAULT now() NOT NULL,
  problem_statement text,
  target_customer text,
  estimated_impact text,
  feasibility text,
  alignment_with_strategy text,
  competitive_advantage text,
  triage_status text DEFAULT 'Submitted' NOT NULL,
  triage_date date,
  triaged_by uuid,
  next_steps text,
  related_products text[],
  requirement_id uuid,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ideas_idea_id ON product_ideas (idea_id);
CREATE INDEX IF NOT EXISTS idx_ideas_triage_status ON product_ideas (triage_status);
CREATE INDEX IF NOT EXISTS idx_ideas_submitted_by ON product_ideas (submitted_by);
CREATE INDEX IF NOT EXISTS idx_ideas_requirement_id ON product_ideas (requirement_id);

CREATE TABLE IF NOT EXISTS comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments (user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments (created_at);

CREATE TABLE IF NOT EXISTS attachments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  uploaded_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_attachments_entity ON attachments (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_attachments_uploaded_by ON attachments (uploaded_by);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  user_id uuid NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  read boolean DEFAULT false NOT NULL,
  entity_type text,
  entity_id uuid,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications (read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications (created_at);

CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
  user_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  changes jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs (created_at);