-- Configuración de la base de datos para TASKIE
-- Ejecutar este script en el SQL Editor de Supabase

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  long_name TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de tareas
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'completed', 'blocked')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  week_of DATE NOT NULL,
  due_date DATE NOT NULL,
  estimated_hours INTEGER NOT NULL DEFAULT 0,
  actual_hours INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  ticket_number TEXT,
  tags TEXT[] DEFAULT '{}',
  original_task_id UUID REFERENCES tasks(id),
  copied_from_week DATE,
  copied_to_week DATE,
  copy_reason TEXT,
  copied_by UUID REFERENCES users(id),
  copy_history JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de comentarios de tareas
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de listas semanales de tareas
CREATE TABLE IF NOT EXISTS weekly_task_lists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  week_of DATE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(week_of, user_id)
);

-- Crear tabla de equipos
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de miembros del equipo
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'lead', 'admin')),
  permissions TEXT[] DEFAULT '{}',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Crear tabla de notificaciones por email
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('weekly', 'daily', 'urgent')),
  recipients TEXT[] NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed'))
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_week_of ON tasks(week_of);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_weekly_task_lists_user_week ON weekly_task_lists(user_id, week_of);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_task_lists_updated_at BEFORE UPDATE ON weekly_task_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Crear función para obtener estadísticas de tareas por semana
CREATE OR REPLACE FUNCTION get_task_stats_by_week(
  p_user_id UUID,
  p_week_of DATE
)
RETURNS TABLE(
  total_tasks BIGINT,
  completed_tasks BIGINT,
  in_progress_tasks BIGINT,
  pending_tasks BIGINT,
  blocked_tasks BIGINT,
  total_estimated_hours BIGINT,
  total_actual_hours BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
    COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress_tasks,
    COUNT(*) FILTER (WHERE status = 'todo') as pending_tasks,
    COUNT(*) FILTER (WHERE status = 'blocked') as blocked_tasks,
    COALESCE(SUM(estimated_hours), 0) as total_estimated_hours,
    COALESCE(SUM(actual_hours), 0) as total_actual_hours
  FROM tasks
  WHERE assignee_id = p_user_id AND week_of = p_week_of;
END;
$$ LANGUAGE plpgsql;

-- Crear función para copiar tarea
CREATE OR REPLACE FUNCTION copy_task(
  p_task_id UUID,
  p_target_week DATE,
  p_copy_reason TEXT,
  p_copied_by UUID,
  p_reset_status BOOLEAN DEFAULT true,
  p_include_comments BOOLEAN DEFAULT true
)
RETURNS UUID AS $$
DECLARE
  v_new_task_id UUID;
  v_original_task tasks%ROWTYPE;
  v_copy_history JSONB;
BEGIN
  -- Obtener la tarea original
  SELECT * INTO v_original_task FROM tasks WHERE id = p_task_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Task not found';
  END IF;
  
  -- Preparar el historial de copias
  v_copy_history = COALESCE(v_original_task.copy_history, '[]'::JSONB) || 
    jsonb_build_object(
      'id', uuid_generate_v4(),
      'originalTaskId', COALESCE(v_original_task.original_task_id, v_original_task.id),
      'copiedFromWeek', v_original_task.week_of,
      'copiedToWeek', p_target_week,
      'copyReason', p_copy_reason,
      'copiedBy', p_copied_by,
      'copiedAt', NOW(),
      'status', 'active'
    );
  
  -- Crear la nueva tarea copiada
  INSERT INTO tasks (
    title,
    description,
    status,
    priority,
    assignee_id,
    week_of,
    due_date,
    estimated_hours,
    actual_hours,
    progress,
    ticket_number,
    tags,
    original_task_id,
    copied_from_week,
    copied_to_week,
    copy_reason,
    copied_by,
    copy_history
  ) VALUES (
    v_original_task.title,
    v_original_task.description,
    CASE WHEN p_reset_status THEN 'todo' ELSE v_original_task.status END,
    v_original_task.priority,
    v_original_task.assignee_id,
    p_target_week,
    v_original_task.due_date,
    v_original_task.estimated_hours,
    CASE WHEN p_reset_status THEN 0 ELSE v_original_task.actual_hours END,
    CASE WHEN p_reset_status THEN 0 ELSE v_original_task.progress END,
    v_original_task.ticket_number,
    v_original_task.tags,
    COALESCE(v_original_task.original_task_id, v_original_task.id),
    v_original_task.week_of,
    p_target_week,
    p_copy_reason,
    p_copied_by,
    v_copy_history
  ) RETURNING id INTO v_new_task_id;
  
  -- Copiar comentarios si se solicita
  IF p_include_comments THEN
    INSERT INTO task_comments (task_id, user_id, content, created_at)
    SELECT v_new_task_id, user_id, content, created_at
    FROM task_comments
    WHERE task_id = p_task_id;
  END IF;
  
  -- Actualizar el historial de copias en la tarea original
  UPDATE tasks 
  SET copy_history = v_copy_history,
      updated_at = NOW()
  WHERE id = p_task_id;
  
  RETURN v_new_task_id;
END;
$$ LANGUAGE plpgsql;

-- Configurar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_task_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para tareas
CREATE POLICY "Users can view their own tasks" ON tasks
  FOR SELECT USING (auth.uid() = assignee_id);

CREATE POLICY "Users can insert their own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = assignee_id);

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = assignee_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (auth.uid() = assignee_id);

-- Políticas para comentarios
CREATE POLICY "Users can view comments on their tasks" ON task_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_comments.task_id 
      AND tasks.assignee_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert comments on their tasks" ON task_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_comments.task_id 
      AND tasks.assignee_id = auth.uid()
    )
  );

-- Políticas para listas semanales
CREATE POLICY "Users can view their own weekly lists" ON weekly_task_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own weekly lists" ON weekly_task_lists
  FOR ALL USING (auth.uid() = user_id);

-- Insertar datos de ejemplo (opcional)
INSERT INTO users (id, email, name, long_name, role, department) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@taskie.com', 'Admin', 'Administrador del Sistema', 'admin', 'management'),
  ('00000000-0000-0000-0000-000000000002', 'user@taskie.com', 'Usuario', 'Usuario de Prueba', 'developer', 'engineering')
ON CONFLICT (id) DO NOTHING;

-- Crear vista para estadísticas semanales
CREATE OR REPLACE VIEW weekly_task_stats AS
SELECT
  t.week_of,
  t.assignee_id,
  u.name as user_name,
  COUNT(*) as total_tasks,
  COUNT(*) FILTER (WHERE t.status = 'completed') as completed_tasks,
  COUNT(*) FILTER (WHERE t.status = 'in-progress') as in_progress_tasks,
  COUNT(*) FILTER (WHERE t.status = 'todo') as pending_tasks,
  COUNT(*) FILTER (WHERE t.status = 'blocked') as blocked_tasks,
  COALESCE(SUM(t.estimated_hours), 0) as total_estimated_hours,
  COALESCE(SUM(t.actual_hours), 0) as total_actual_hours
FROM tasks t
JOIN users u ON t.assignee_id = u.id
GROUP BY t.week_of, t.assignee_id, u.name
ORDER BY t.week_of DESC, u.name;

-- Comentarios sobre las tablas
COMMENT ON TABLE users IS 'Tabla de usuarios del sistema';
COMMENT ON TABLE tasks IS 'Tabla principal de tareas con historial de copias';
COMMENT ON TABLE task_comments IS 'Comentarios asociados a las tareas';
COMMENT ON TABLE weekly_task_lists IS 'Listas semanales de tareas por usuario';
COMMENT ON TABLE teams IS 'Equipos de trabajo';
COMMENT ON TABLE team_members IS 'Miembros de los equipos con roles y permisos';
COMMENT ON TABLE email_notifications IS 'Historial de notificaciones por email enviadas';

COMMENT ON COLUMN tasks.copy_history IS 'Historial completo de copias de la tarea en formato JSONB';
COMMENT ON COLUMN tasks.original_task_id IS 'ID de la tarea original si esta es una copia';
COMMENT ON COLUMN tasks.copied_from_week IS 'Semana de donde se copió la tarea';
COMMENT ON COLUMN tasks.copied_to_week IS 'Semana a donde se copió la tarea';
COMMENT ON COLUMN tasks.copy_reason IS 'Razón por la cual se copió la tarea';
COMMENT ON COLUMN tasks.copied_by IS 'Usuario que copió la tarea';
