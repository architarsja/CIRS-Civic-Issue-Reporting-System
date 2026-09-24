CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('CITIZEN','OFFICER','ADMIN')),
  phone VARCHAR(30),
  address TEXT,
  department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  citizen_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(80) NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Pending','Assigned','In Progress','Resolved','Rejected')),
  assigned_officer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  resolution_note TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  citizen_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (complaint_id, citizen_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(120) NOT NULL,
  details TEXT,
  ip_address VARCHAR(80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_officer ON complaints(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
