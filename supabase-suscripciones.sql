-- ============================================================
-- MIGRACIÓN: SISTEMA DE SUSCRIPCIONES DE PROFESIONALES
-- Pega esto en el SQL Editor de tu proyecto Supabase → RUN
-- ============================================================

ALTER TABLE public.professionals
  ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'basico'
    CHECK (plan_type IN ('basico', 'destacado')),
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactivo'
    CHECK (subscription_status IN ('activo', 'vencido', 'inactivo')),
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_price INTEGER DEFAULT 15000,
  ADD COLUMN IF NOT EXISTS subscription_notes TEXT;

-- Los profesionales ficticios actuales quedan INACTIVOS (no aparecen en la web)
-- Solo aparecen cuando la dueña presiona "Renovar" después de cobrar
UPDATE public.professionals
SET
  subscription_status = 'inactivo',
  plan_type = 'basico',
  subscription_price = 15000
WHERE subscription_status IS NULL;
