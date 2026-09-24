-- ============================================================
-- SCRIPT DE INICIALIZACIÓN PARA SUPABASE - VISALUD
-- Copia y pega todo este contenido en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- 1. Crear la tabla de profesionales
CREATE TABLE IF NOT EXISTS public.professionals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    specialty TEXT NOT NULL,
    "regNumber" TEXT,
    image TEXT,
    address TEXT,
    phone TEXT,
    whatsapp TEXT,
    attention TEXT,
    modality TEXT,
    convenios TEXT,
    bio TEXT,
    status TEXT DEFAULT 'active',
    order_index INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

-- 3. Crear Políticas de Acceso:
-- Permitir lectura pública de los profesionales a cualquier visitante
CREATE POLICY "Acceso de lectura público para profesionales"
    ON public.professionals
    FOR SELECT
    USING (true);

-- Permitir inserción, actualización y borrado
CREATE POLICY "Permitir inserción de profesionales"
    ON public.professionals
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Permitir actualización de profesionales"
    ON public.professionals
    FOR UPDATE
    USING (true);

CREATE POLICY "Permitir eliminación de profesionales"
    ON public.professionals
    FOR DELETE
    USING (true);

-- 4. Insertar los profesionales iniciales de Visalud
INSERT INTO public.professionals (
    id, name, "serviceId", "serviceName", specialty, "regNumber", image, address, phone, whatsapp, attention, modality, convenios, bio, status, order_index
) VALUES
(
    'enfra-marcela-soto',
    'Enfra. Marcela Soto Oyarzún',
    'cuidados-adulto-mayor',
    'Cuidados Adulto Mayor',
    'Enfermera Universitaria - Gerontología y Cuidados Integrales',
    'Reg. SIS N° 458921',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
    'Servicio a Domicilio en Osorno y Centro Clínico Visalud',
    '+56 9 8452 1190',
    '56984521190',
    'Lunes a Domingo (Visitas programadas y turnos)',
    'A Domicilio en Osorno',
    'Particular con Boleta y Reembolso Isapre',
    'Especialista en valoración integral del adulto mayor, prevención de escaras, control de fármacos y trato empático con la familia.',
    'active',
    1
),
(
    'tens-javier-cardenas',
    'TENS Javier Cárdenas Silva',
    'inyecciones',
    'Inyecciones y Tratamientos',
    'Técnico en Enfermería de Nivel Superior (TENS) Clínico',
    'Reg. SIS N° 389412',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    'Los Carrera 1150, Centro Visalud / Servicio a Domicilio, Osorno',
    '+56 9 7619 4432',
    '56976194432',
    'Lunes a Sábado (08:00 - 20:00)',
    'En Centro y a Domicilio',
    'Fonasa, Isapre y Particular',
    'Administración rápida, estéril y prácticamente indolora de inyectables intramusculares, subcutáneos, neurobionta y antibióticos.',
    'active',
    2
),
(
    'enfra-claudia-morales',
    'Enfra. Claudia Morales Valenzuela',
    'curaciones-de-heridas',
    'Curaciones de Heridas',
    'Enfermera Especialista en Curación Simple y Avanzada',
    'Reg. SIS N° 612840',
    'https://images.unsplash.com/photo-1594824813629-873b22e1a3bc?auto=format&fit=crop&w=600&q=80',
    'Manuel Rodríguez 850, Edificio Bicentenario Of. 402, Osorno',
    '+56 9 9345 6781',
    '56993456781',
    'Lunes a Viernes (08:30 - 19:00) y Urgencias Domiciliarias',
    'Box Clínico y a Domicilio',
    'Fonasa, Isapre y Particular',
    'Manejo experto de úlceras venosas, escaras, heridas quirúrgicas y retiro de suturas con apósitos hidrocoloides y técnica aséptica.',
    'active',
    3
),
(
    'tens-patricia-rivas',
    'TENS Patricia Rivas Muñoz',
    'cuidados-adulto-mayor',
    'Cuidados Adulto Mayor',
    'Cuidadora Certificada & TENS Adulto Mayor',
    'Reg. SIS N° 524109',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    'Cobertura a domicilio en todo el radio urbano de Osorno',
    '+56 9 6523 8810',
    '56965238810',
    'Lunes a Domingo (Turnos diurnos, nocturnos y 24 horas)',
    '100% a Domicilio',
    'Particular con Boleta de Honorarios',
    'Asistencia dedicada en aseo y confort, movilidad en cama, alimentación asistida, control glicémico y compañía respetuosa.',
    'active',
    4
),
(
    'enfra-camila-fuentes',
    'Enfra. Camila Fuentes Sepúlveda',
    'inyecciones',
    'Inyecciones y Tratamientos',
    'Enfermera Universitaria - Procedimientos Ambulatorios',
    'Reg. SIS N° 701423',
    'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=600&q=80',
    'Clínica Visalud, Bilbao 740 / Atención Domiciliaria, Osorno',
    '+56 9 8214 5567',
    '56982145567',
    'Lunes a Viernes (08:30 - 18:30)',
    'Domicilio y Box Clínico',
    'Fonasa, Isapre y Particular',
    'Instalación de vías venosas, sueroterapia, administración de fármacos inyectables y tomas de muestra con gran calidez humana.',
    'active',
    5
),
(
    'enfra-romina-alvarez',
    'Enfra. Romina Álvarez Delgado',
    'curaciones-de-heridas',
    'Curaciones de Heridas',
    'Enfermera Clínica - Manejo de Heridas Complejas y Ostomías',
    'Reg. SIS N° 498315',
    'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80',
    'Centro Médico Visalud, Los Carrera 1150, Piso 2, Osorno',
    '+56 9 7182 3349',
    '56971823349',
    'Lunes a Sábado (09:00 - 18:00)',
    'Presencial y a Domicilio',
    'Fonasa, Isapre y Particular',
    'Evaluación y tratamiento integral de pie diabético, heridas tórpidas, dehiscencias quirúrgicas y seguimiento continuo de cicatrización.',
    'active',
    6
),
(
    'klgo-diego-almonacid',
    'Klgo. Diego Almonacid Vera',
    'cuidados-adulto-mayor',
    'Cuidados Adulto Mayor',
    'Kinesiólogo Gerontológico - Movilidad y Prevención de Caídas',
    'Reg. SIS N° 340918',
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80',
    'Manuel Antonio Matta 620 / Atención a Domicilio, Osorno',
    '+56 9 8923 1144',
    '56989231144',
    'Lunes a Viernes (08:30 - 19:00)',
    'Visita Domiciliaria en Osorno',
    'Fonasa e Isapre',
    'Rehabilitación motriz, ejercicios respiratorios y estimulación física suave para personas mayores postradas o con movilidad reducida.',
    'active',
    7
),
(
    'tens-esteban-lagos',
    'TENS Esteban Lagos Barrientos',
    'curaciones-de-heridas',
    'Curaciones de Heridas',
    'TENS de Procedimientos & Retiro de Puntos',
    'Reg. SIS N° 581204',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
    'Atención a Domicilio en Osorno y Alrededores',
    '+56 9 7455 2319',
    '56974552319',
    'Lunes a Domingo (08:00 - 20:00)',
    'Servicio Domiciliario Express',
    'Fonasa y Particular',
    'Curaciones planas, desinfección preventiva, recambio de apósitos y retiro de suturas con técnica aséptica certificada.',
    'active',
    8
)
ON CONFLICT (id) DO NOTHING;
