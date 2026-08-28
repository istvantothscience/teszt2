-- ==============================================================================
-- FIZIKA KIHÍVÁS - SUPABASE ADATBÁZIS SÉMA ÉS BIZTONSÁGOS PONTSZÁMÍTÓ RPC
-- ==============================================================================
-- Ezt a fájlt másold be a Supabase Dashboard -> SQL Editor felületére és futtasd le!

-- 1. PROFILOK TÁBLA (Diákok adatai és pontszámai)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT DEFAULT '',
    score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. FELADATOK TÁBLA (Fizika kvíz feladatok és helyes válaszok)
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    formula_hint TEXT,
    options JSONB NOT NULL,
    correct_option_index INTEGER NOT NULL,
    points INTEGER NOT NULL DEFAULT 10,
    explanation TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. MEGOLDÁSOK TÁBLA (Nyilvántartja, melyik diák melyik feladatot oldotta már meg)
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    task_id TEXT NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    points_awarded INTEGER NOT NULL DEFAULT 0,
    solved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_task UNIQUE (user_id, task_id)
);

-- Indexek a gyorsabb rangsoroláshoz és lekérdezésekhez
CREATE INDEX IF NOT EXISTS idx_profiles_score ON public.profiles (score DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON public.submissions (user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_task ON public.submissions (task_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) BEÁLLÍTÁSOK
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Profilok olvasása: Bárki láthatja a rangsort (diákok neve, pontszáma)
CREATE POLICY "Rangsor megtekintése bárki számára"
    ON public.profiles FOR SELECT
    USING (true);

-- Profil frissítése: Csak a saját profilját módosíthatja
CREATE POLICY "Saját profil módosítása"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Feladatok olvasása: Bejelentkezett diákok láthatják a feladatokat
CREATE POLICY "Feladatok olvasása"
    ON public.tasks FOR SELECT
    USING (true);

-- Megoldások olvasása: A diák láthatja a saját megoldásait
CREATE POLICY "Saját megoldások olvasása"
    ON public.submissions FOR SELECT
    USING (auth.uid() = user_id);

-- ==============================================================================
-- BIZTONSÁGOS PONTSZÁMÍTÓ ADATBÁZIS-FÜGGVÉNY (RPC)
-- ==============================================================================
-- A pontokat a Supabase szerver oldalon érvényesítjük és írjuk jóvá,
-- a böngészőből érkező pontszámítást sosem fogadjuk el vakon.

CREATE OR REPLACE FUNCTION public.submit_physics_answer(
    p_task_id TEXT,
    p_selected_option INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Biztosítja a jogosultságot a pontok megbízható jóváírásához
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_task RECORD;
    v_already_solved BOOLEAN;
    v_is_correct BOOLEAN;
    v_points_to_award INTEGER := 0;
    v_new_score INTEGER;
BEGIN
    -- 1. Azonosítjuk a bejelentkezett felhasználót
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Bejelentkezés szükséges a válasz beküldéséhez!'
        );
    END IF;

    -- 2. Lekérjük a feladatot
    SELECT * INTO v_task FROM public.tasks WHERE id = p_task_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'A megadott feladat nem létezik.'
        );
    END IF;

    -- 3. Ellenőrizzük, hogy megoldotta-e már korábban
    SELECT EXISTS (
        SELECT 1 FROM public.submissions
        WHERE user_id = v_user_id AND task_id = p_task_id
    ) INTO v_already_solved;

    -- 4. Ellenőrizzük a helyes választ
    v_is_correct := (v_task.correct_option_index = p_selected_option);

    IF v_is_correct THEN
        IF v_already_solved THEN
            -- Már korábban megkapta a pontot
            SELECT score INTO v_new_score FROM public.profiles WHERE id = v_user_id;
            RETURN jsonb_build_object(
                'success', true,
                'is_correct', true,
                'already_solved', true,
                'points_awarded', 0,
                'new_total_score', v_new_score,
                'message', 'Helyes válasz! Ezt a feladatot korábban már sikeresen teljesítetted.',
                'explanation', v_task.explanation
            );
        ELSE
            -- Első helyes megoldás: pontok jóváírása az adatbázisban
            v_points_to_award := v_task.points;

            -- Megoldás rögzítése
            INSERT INTO public.submissions (user_id, task_id, points_awarded)
            VALUES (v_user_id, p_task_id, v_points_to_award);

            -- Pontszám atomi növelése a profilban
            UPDATE public.profiles
            SET score = score + v_points_to_award,
                updated_at = now()
            WHERE id = v_user_id
            RETURNING score INTO v_new_score;

            RETURN jsonb_build_object(
                'success', true,
                'is_correct', true,
                'already_solved', false,
                'points_awarded', v_points_to_award,
                'new_total_score', v_new_score,
                'message', 'Gratulálunk! Helyes megoldás, a pontok jóváírásra kerültek a profilodban.',
                'explanation', v_task.explanation
            );
        END IF;
    ELSE
        -- Helytelen válasz esetén nem adunk pontot
        SELECT score INTO v_new_score FROM public.profiles WHERE id = v_user_id;
        RETURN jsonb_build_object(
            'success', true,
            'is_correct', false,
            'already_solved', v_already_solved,
            'points_awarded', 0,
            'new_total_score', v_new_score,
            'message', 'Sajnos nem ez a helyes válasz. Próbáld újra vagy ellenőrizd a képleteket!',
            'explanation', NULL
        );
    END IF;
END;
$$;

-- ==============================================================================
-- AUTOMATIKUS PROFIL LÉTREHOZÁS REGISZTRÁCIÓKOR (Supabase Auth Trigger)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, score)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        0
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 3 FIZIKA TÉMÁJÚ FELADAT ALAPADATAI (Seed data)
-- ==============================================================================

INSERT INTO public.tasks (id, title, category, description, formula_hint, options, correct_option_index, points, explanation)
VALUES
(
    'mechanika_01',
    'Egyenletesen gyorsuló mozgás és féktávolság',
    'Mechanika & Kinematika',
    'Egy elektromos versenyautó álló helyzetből indulva egyenes pályán egyenletesen gyorsul a = 4 m/s² gyorsulással 5 másodpercen keresztül. Mekkora utat (s) tesz meg a jármű ezalatt az 5 másodperc alatt, és mekkora lesz a végsebessége (v)?',
    's = (1/2) * a * t²   és   v = a * t',
    '[
        "s = 100 m, v = 40 m/s",
        "s = 50 m, v = 20 m/s (72 km/h)",
        "s = 20 m, v = 20 m/s",
        "s = 80 m, v = 25 m/s"
    ]'::jsonb,
    1, -- index 1 -> 50 m és 20 m/s
    35,
    'Helyes levezetés: Az út képlete álló helyzetből indulva: s = (1/2) * a * t² = 0.5 * 4 m/s² * (5 s)² = 2 * 25 m = 50 méter. A végsebesség: v = a * t = 4 m/s² * 5 s = 20 m/s (átszámítva 72 km/h).'
),
(
    'elektromossag_02',
    'Ohm törvénye és párhuzamos kapcsolás',
    'Elektromosságtan',
    'Egy laboratóriumi áramkörben két ellenállás van párhuzamosan kapcsolva: R₁ = 60 Ω és R₂ = 30 Ω. Az áramkörre U = 120 V feszültséget kapcsolunk. Mekkora az áramkör eredő ellenállása (Re) és mekkora a főágban folyó teljes áramerősség (I)?',
    '1/Re = 1/R₁ + 1/R₂   (Re = (R₁ * R₂) / (R₁ + R₂))   és   I = U / Re',
    '[
        "Re = 90 Ω, I = 1.33 A",
        "Re = 45 Ω, I = 2.67 A",
        "Re = 20 Ω, I = 6.0 A",
        "Re = 15 Ω, I = 8.0 A"
    ]'::jsonb,
    2, -- index 2 -> 20 Ω és 6.0 A
    45,
    'Helyes levezetés: Párhuzamos kapcsolás esetén Re = (R₁ * R₂) / (R₁ + R₂) = (60 * 30) / (60 + 30) = 1800 / 90 = 20 Ω. Ohm törvénye alapján a teljes áramerősség a főágban: I = U / Re = 120 V / 20 Ω = 6.0 A.'
),
(
    'energia_03',
    'Mechanikai energia megmaradásának törvénye',
    'Munka és Energia',
    'Egy m = 2 kg tömegű síelő a súrlódásmentes h = 20 méter magas dombtetőről nyugalmi állapotból csúszik le a völgybe. Tételezzük fel, hogy g = 10 m/s², és a légellenállás elhanyagolható. Mekkora lesz a síelő sebessége (v) a völgy aljára érve?',
    'Emegm = Ehelyzeti = Emozgási   =>   m * g * h = (1/2) * m * v²   =>   v = √(2 * g * h)',
    '[
        "v = 10 m/s (36 km/h)",
        "v = 14.1 m/s (50.8 km/h)",
        "v = 20 m/s (72 km/h)",
        "v = 40 m/s (144 km/h)"
    ]'::jsonb,
    2, -- index 2 -> 20 m/s
    50,
    'Helyes levezetés: A mechanikai energia megmaradása miatt a hegytetőn lévő helyzeti energia a völgy alján teljes egészében mozgási energiává alakul: m*g*h = 0.5*m*v². A tömeggel (m) egyszerűsítve: v = √(2 * g * h) = √(2 * 10 m/s² * 20 m) = √400 = 20 m/s (72 km/h).'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    formula_hint = EXCLUDED.formula_hint,
    options = EXCLUDED.options,
    correct_option_index = EXCLUDED.correct_option_index,
    points = EXCLUDED.points,
    explanation = EXCLUDED.explanation;
