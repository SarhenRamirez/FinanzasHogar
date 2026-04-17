CREATE TYPE categoria AS ENUM ('granos', 'aseo', 'verdura', 'proteina');

CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  categoria categoria NOT NULL,
  precio NUMERIC(10, 2) NOT NULL DEFAULT 0,
  cantidad INTEGER NOT NULL DEFAULT 0,
  cantidad_minima INTEGER NOT NULL DEFAULT 1,
  unidad VARCHAR(20) DEFAULT 'unidad',
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp ON productos;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON productos
FOR EACH ROW EXECUTE FUNCTION update_timestamp();