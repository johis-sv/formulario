-- ═══════════════════════════════════════════════════════════
--  InnoTrack — Migración inicial
--  Ejecuta este script en: Supabase → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS iniciativas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Datos del postulante
  nombre_iniciativa   TEXT NOT NULL,
  correo              TEXT NOT NULL,
  nombre_postulante   TEXT NOT NULL,
  departamento        TEXT NOT NULL,

  -- Descripción
  problema            TEXT NOT NULL,
  solucion            TEXT NOT NULL,
  beneficio           TEXT NOT NULL,

  -- Impacto (array de opciones seleccionadas)
  impacto             TEXT[] NOT NULL DEFAULT '{}',
  impacto_otros_texto TEXT,

  -- Archivos adjuntos (nombres de archivos)
  archivos            TEXT[] DEFAULT '{}',

  -- Fecha de la iniciativa (ingresada por el usuario)
  fecha_iniciativa    DATE NOT NULL,

  -- Estado del flujo
  estado              TEXT NOT NULL DEFAULT 'Recibido'
                        CHECK (estado IN ('Recibido','En Revisión','En Desarrollo','Completado','Rechazado')),

  -- Auditoría
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Actualiza updated_at automáticamente al modificar un registro
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_iniciativas_updated_at
  BEFORE UPDATE ON iniciativas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Índices para búsquedas frecuentes del dashboard
CREATE INDEX IF NOT EXISTS idx_iniciativas_estado       ON iniciativas(estado);
CREATE INDEX IF NOT EXISTS idx_iniciativas_departamento ON iniciativas(departamento);
CREATE INDEX IF NOT EXISTS idx_iniciativas_created_at   ON iniciativas(created_at DESC);

-- ── Seguridad: habilitar Row Level Security ───────────────────────────────────
-- (permite que cualquier usuario anónimo lea e inserte, pero solo el servidor actualice)
ALTER TABLE iniciativas ENABLE ROW LEVEL SECURITY;

-- Política: cualquiera puede leer (para el dashboard)
CREATE POLICY "Lectura pública" ON iniciativas
  FOR SELECT USING (true);

-- Política: cualquiera puede insertar (para el formulario)
CREATE POLICY "Inserción pública" ON iniciativas
  FOR INSERT WITH CHECK (true);

-- Política: solo el service_role puede actualizar estados
-- (las actualizaciones van siempre por la API de Next.js con service_role)
CREATE POLICY "Actualización por servicio" ON iniciativas
  FOR UPDATE USING (true);
