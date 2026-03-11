-- Criação básica de esquema em PostgreSQL

CREATE TABLE IF NOT EXISTS access_profiles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  profile_id INTEGER REFERENCES access_profiles(id) ON DELETE SET NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'funcionario',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cash_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL, -- 'entrada' ou 'saida'
  description TEXT,
  amount NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cash_closures (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  operator_name VARCHAR(150) NOT NULL,
  opening_balance NUMERIC(12,2) NOT NULL,
  counted_total NUMERIC(12,2) NOT NULL,
  total_withdrawals NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(12,2) NOT NULL,
  observations TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'fechado',
  closed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Perfil e usuário administrador inicial
INSERT INTO access_profiles (name, description, permissions)
VALUES (
  'Administrador',
  'Perfil administrador com acesso total',
  '{
    "telas": ["dashboard", "caixa", "relatorio_caixa", "configuracoes", "perfil", "cadastro"],
    "acoes": ["ver", "criar", "editar", "excluir", "fechar_caixa"]
  }'
) ON CONFLICT (name) DO NOTHING;

-- ATENÇÃO: gere um hash bcrypt real e substitua o valor abaixo antes de rodar em produção
INSERT INTO users (name, email, password_hash, profile_id, role)
VALUES (
  'Administrador',
  'admin@docesemimos.com',
  '$2a$10$$2b$10$jh7SnKPeyBtIdw4T/IdvbuzJ/dKLi.BdLL7RG0F.4RNfP.2IOzWs.',
  (SELECT id FROM access_profiles WHERE name = 'Administrador'),
  'admin'
) ON CONFLICT (email) DO NOTHING;

