import { PhysicsTask, PredefinedStudent } from '../types/physics';

export const PREDEFINED_STUDENTS: PredefinedStudent[] = [
  {
    id: 'student_anna_01',
    email: 'anna.kovacs@fizika.hu',
    name: 'Kovács Anna',
    role: '10.A osztályos diák',
    badge: 'Kinematika Bajnok',
    defaultScore: 80,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    passwordPlaceholder: 'anna123',
  },
  {
    id: 'student_bence_02',
    email: 'bence.nagy@fizika.hu',
    name: 'Nagy Bence',
    role: '10.B osztályos diák',
    badge: 'Elektromosság Mester',
    defaultScore: 45,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    passwordPlaceholder: 'bence123',
  },
  {
    id: 'student_csilla_03',
    email: 'csilla.toth@fizika.hu',
    name: 'Tóth Csilla',
    role: '10.A osztályos diák',
    badge: 'Energia Kutató',
    defaultScore: 35,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    passwordPlaceholder: 'csilla123',
  },
];

export const PHYSICS_TASKS: PhysicsTask[] = [
  {
    id: 'mechanika_01',
    title: 'Egyenletesen gyorsuló mozgás és megtett út',
    category: 'Mechanika & Kinematika',
    description:
      'Egy kísérleti jármű álló helyzetből (v₀ = 0 m/s) indulva egyenes pályán egyenletesen gyorsul a = 4 m/s² állandó gyorsulással t = 5 másodpercen keresztül. Számítsd ki, mekkora utat (s) tesz meg a jármű ezalatt az idő alatt, és mekkora pillanatnyi sebességet (v) ér el az 5. másodperc végén!',
    formula_hint: 's = ½ · a · t²   és   v = a · t',
    options: [
      's = 100 m,  v = 40 m/s',
      's = 50 m,  v = 20 m/s (72 km/h)',
      's = 20 m,  v = 20 m/s',
      's = 80 m,  v = 25 m/s',
    ],
    points: 35,
    explanation:
      'A megtett út: s = ½ · a · t² = 0.5 · 4 m/s² · (5 s)² = 2 · 25 m = 50 m. A végsebesség: v = a · t = 4 m/s² · 5 s = 20 m/s (ami 20 · 3.6 = 72 km/h).',
  },
  {
    id: 'elektromossag_02',
    title: 'Ohm törvénye és párhuzamos kapcsolás',
    category: 'Elektromosságtan',
    description:
      'Egy egyenáramú áramkörben két fogyasztó van párhuzamosan kapcsolva: R₁ = 60 Ω és R₂ = 30 Ω. A telepről mérhető kapocsfeszültség U = 120 V. Határozd meg az áramkör eredő ellenállását (Re) és a főágban folyó teljes áramerősséget (I)!',
    formula_hint: '1/Re = 1/R₁ + 1/R₂   (Re = (R₁ · R₂) / (R₁ + R₂))   és   I = U / Re',
    options: [
      'Re = 90 Ω,  I = 1.33 A',
      'Re = 45 Ω,  I = 2.67 A',
      'Re = 20 Ω,  I = 6.0 A',
      'Re = 15 Ω,  I = 8.0 A',
    ],
    points: 45,
    explanation:
      'Párhuzamos kapcsolás eredő ellenállása: Re = (60 · 30) / (60 + 30) = 1800 / 90 = 20 Ω. Az Ohm-törvény (I = U / R) alapján a főági áramerősség: I = 120 V / 20 Ω = 6.0 A.',
  },
  {
    id: 'energia_03',
    title: 'Mechanikai energia megmaradásának törvénye',
    category: 'Munka és Energia',
    description:
      'Egy m = 2 kg tömegű kísérleti golyó egy súrlódásmentes h = 20 m magas dombtetőről nyugalomból szabadon legördül a vízszintes síkra. A nehézségi gyorsulás értéke g = 10 m/s², a közegellenállás elhanyagolható. Mekkora lesz a golyó sebessége (v) a pálya alján?',
    formula_hint: 'E_helyzeti = E_mozgási   ⇒   m · g · h = ½ · m · v²   ⇒   v = √(2 · g · h)',
    options: [
      'v = 10 m/s (36 km/h)',
      'v = 14.1 m/s (50.8 km/h)',
      'v = 20 m/s (72 km/h)',
      'v = 40 m/s (144 km/h)',
    ],
    points: 50,
    explanation:
      'Mivel nincs súrlódási veszteség, a dombtetőn lévő helyzeti energia (E_h = m·g·h) a völgy aljára érve 100%-ban mozgási energiává (E_m = ½·m·v²) alakul. m-mel egyszerűsítve: v = √(2 · g · h) = √(2 · 10 m/s² · 20 m) = √400 = 20 m/s (72 km/h).',
  },
];

// Backend server correct answer mapping (evaluated safely on the server side / RPC)
export const TASK_CORRECT_ANSWERS: Record<string, number> = {
  mechanika_01: 1, // index 1
  elektromossag_02: 2, // index 2
  energia_03: 2, // index 2
};
