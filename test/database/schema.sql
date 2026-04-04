-- test/database/schema.sql
-- Database schema for Eligetuplan (Supabase / PostgreSQL)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: isapres
CREATE TABLE public.isapres (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: planes
CREATE TABLE public.planes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    isapre_id UUID NOT NULL REFERENCES public.isapres(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price_uf DECIMAL(10, 2) NOT NULL,
    hospital_coverage DECIMAL(5, 2) NOT NULL CHECK (hospital_coverage >= 0 AND hospital_coverage <= 100),
    ambulatory_coverage DECIMAL(5, 2) NOT NULL CHECK (ambulatory_coverage >= 0 AND ambulatory_coverage <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: clinicas
CREATE TABLE public.clinicas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: plan_clinica (Many-to-Many between plans and clinics)
CREATE TABLE public.plan_clinica (
    plan_id UUID NOT NULL REFERENCES public.planes(id) ON DELETE CASCADE,
    clinica_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (plan_id, clinica_id)
);

-- Row Level Security (RLS) setup -> Can be expanded based on need
ALTER TABLE public.isapres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_clinica ENABLE ROW LEVEL SECURITY;

-- Allow read access for everyone (since this is public comparison data)
CREATE POLICY "Allow public read access to isapres" ON public.isapres FOR SELECT USING (true);
CREATE POLICY "Allow public read access to planes" ON public.planes FOR SELECT USING (true);
CREATE POLICY "Allow public read access to clinicas" ON public.clinicas FOR SELECT USING (true);
CREATE POLICY "Allow public read access to plan_clinica" ON public.plan_clinica FOR SELECT USING (true);
