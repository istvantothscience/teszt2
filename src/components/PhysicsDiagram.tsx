import React from 'react';

interface PhysicsDiagramProps {
  taskId: string;
}

export const PhysicsDiagram: React.FC<PhysicsDiagramProps> = ({ taskId }) => {
  if (taskId === 'mechanika_01') {
    // Kinematics: Velocity-Time Graph & Moving Vehicle
    return (
      <div className="bg-slate-900 text-slate-100 rounded-xl p-4 my-4 border border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
          <span>v-t (Sebesség-Idő) és Pályagrafikon</span>
          <span className="text-emerald-400 font-semibold">a = 4.0 m/s² (állandó)</span>
        </div>
        <svg viewBox="0 0 460 140" className="w-full h-auto overflow-visible select-none">
          {/* Grid lines */}
          <line x1="50" y1="20" x2="430" y2="20" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
          <line x1="50" y1="60" x2="430" y2="60" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
          <line x1="50" y1="100" x2="430" y2="100" stroke="#475569" strokeWidth="1.5" />
          <line x1="50" y1="10" x2="50" y2="105" stroke="#475569" strokeWidth="1.5" />

          {/* Axes labels */}
          <text x="35" y="104" fill="#94a3b8" fontSize="11" textAnchor="end">0</text>
          <text x="35" y="64" fill="#94a3b8" fontSize="11" textAnchor="end">10</text>
          <text x="35" y="24" fill="#94a3b8" fontSize="11" textAnchor="end">v (m/s)</text>
          
          <text x="50" y="118" fill="#94a3b8" fontSize="11" textAnchor="middle">0s</text>
          <text x="200" y="118" fill="#94a3b8" fontSize="11" textAnchor="middle">2.5s</text>
          <text x="350" y="118" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">t = 5s</text>
          <text x="420" y="118" fill="#94a3b8" fontSize="11" textAnchor="end">t (idő)</text>

          {/* Area under curve (s = integral v dt) */}
          <polygon points="50,100 350,100 350,20" fill="rgba(56, 189, 248, 0.15)" />
          
          {/* Velocity slope line */}
          <line x1="50" y1="100" x2="350" y2="20" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          
          {/* Point at t=5s */}
          <circle cx="350" cy="20" r="5" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
          <line x1="350" y1="20" x2="350" y2="100" stroke="#38bdf8" strokeDasharray="4 3" strokeWidth="1.5" />

          {/* Formula Callout */}
          <rect x="140" y="62" width="130" height="26" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
          <text x="205" y="79" fill="#e2e8f0" fontSize="11" textAnchor="middle" fontWeight="500">
            Terület = s = ½ · a · t²
          </text>
        </svg>
      </div>
    );
  }

  if (taskId === 'elektromossag_02') {
    // Electrical Circuit: Parallel Resistors
    return (
      <div className="bg-slate-900 text-slate-100 rounded-xl p-4 my-4 border border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
          <span>Párhuzamos kapcsolási vázlatrajz</span>
          <span className="text-amber-400 font-semibold">U = 120 V</span>
        </div>
        <svg viewBox="0 0 460 140" className="w-full h-auto overflow-visible select-none">
          {/* Power source / battery on left */}
          <line x1="60" y1="70" x2="110" y2="70" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="60" y1="50" x2="60" y2="90" stroke="#38bdf8" strokeWidth="3" />
          <line x1="50" y1="58" x2="50" y2="82" stroke="#f43f5e" strokeWidth="2" />
          <text x="35" y="65" fill="#f43f5e" fontSize="11" fontWeight="bold">-</text>
          <text x="70" y="65" fill="#38bdf8" fontSize="11" fontWeight="bold">+</text>
          <text x="55" y="112" fill="#e2e8f0" fontSize="11" textAnchor="middle" fontWeight="bold">U = 120 V</text>

          {/* Main wire splitting into parallel branches */}
          <line x1="60" y1="70" x2="140" y2="70" stroke="#94a3b8" strokeWidth="2" />
          <circle cx="140" cy="70" r="3.5" fill="#38bdf8" />
          
          {/* Top Branch (R1 = 60 Ohm) */}
          <line x1="140" y1="70" x2="140" y2="35" stroke="#94a3b8" strokeWidth="2" />
          <line x1="140" y1="35" x2="200" y2="35" stroke="#94a3b8" strokeWidth="2" />
          <rect x="200" y="24" width="70" height="22" rx="3" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
          <text x="235" y="39" fill="#fef3c7" fontSize="11" textAnchor="middle" fontWeight="bold">R₁ = 60 Ω</text>
          <line x1="270" y1="35" x2="330" y2="35" stroke="#94a3b8" strokeWidth="2" />
          <line x1="330" y1="35" x2="330" y2="70" stroke="#94a3b8" strokeWidth="2" />

          {/* Bottom Branch (R2 = 30 Ohm) */}
          <line x1="140" y1="70" x2="140" y2="105" stroke="#94a3b8" strokeWidth="2" />
          <line x1="140" y1="105" x2="200" y2="105" stroke="#94a3b8" strokeWidth="2" />
          <rect x="200" y="94" width="70" height="22" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          <text x="235" y="109" fill="#e0f2fe" fontSize="11" textAnchor="middle" fontWeight="bold">R₂ = 30 Ω</text>
          <line x1="270" y1="105" x2="330" y2="105" stroke="#94a3b8" strokeWidth="2" />
          <line x1="330" y1="105" x2="330" y2="70" stroke="#94a3b8" strokeWidth="2" />

          {/* Merge back */}
          <circle cx="330" cy="70" r="3.5" fill="#38bdf8" />
          <line x1="330" y1="70" x2="410" y2="70" stroke="#94a3b8" strokeWidth="2" />
          
          {/* Main current arrow (I) */}
          <polygon points="100,66 110,70 100,74" fill="#38bdf8" />
          <text x="105" y="60" fill="#38bdf8" fontSize="11" fontWeight="bold">I = ?</text>
          
          <polygon points="370,66 380,70 370,74" fill="#38bdf8" />
          <text x="375" y="60" fill="#38bdf8" fontSize="11" fontWeight="bold">I</text>
        </svg>
      </div>
    );
  }

  if (taskId === 'energia_03') {
    // Energy Conservation: Hill to Flat Ground
    return (
      <div className="bg-slate-900 text-slate-100 rounded-xl p-4 my-4 border border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
          <span>Mechanikai energiamegmaradás modellje</span>
          <span className="text-violet-400 font-semibold">g = 10 m/s², m = 2 kg</span>
        </div>
        <svg viewBox="0 0 460 140" className="w-full h-auto overflow-visible select-none">
          {/* Curved Ramp Path */}
          <path
            d="M 60,30 Q 180,30 220,95 T 410,110"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Ground level line */}
          <line x1="40" y1="112" x2="430" y2="112" stroke="#475569" strokeWidth="1.5" strokeDasharray="5 3" />
          
          {/* Height marker (h = 20 m) */}
          <line x1="45" y1="30" x2="45" y2="112" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="40" y1="30" x2="50" y2="30" stroke="#ec4899" strokeWidth="2" />
          <line x1="40" y1="112" x2="50" y2="112" stroke="#ec4899" strokeWidth="2" />
          <text x="25" y="75" fill="#f472b6" fontSize="11" textAnchor="middle" fontWeight="bold">h = 20m</text>

          {/* Ball at top */}
          <circle cx="68" cy="22" r="9" fill="#a855f7" stroke="#ffffff" strokeWidth="2" />
          <rect x="85" y="12" width="130" height="20" rx="4" fill="#1e293b" stroke="#a855f7" strokeWidth="1" />
          <text x="150" y="26" fill="#e9d5ff" fontSize="10" textAnchor="middle">
            Csúcs: E = E_h = m·g·h
          </text>

          {/* Ball at bottom */}
          <circle cx="360" cy="103" r="9" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <line x1="369" y1="103" x2="395" y2="103" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="393,99 401,103 393,107" fill="#10b981" />
          <rect x="290" y="58" width="140" height="20" rx="4" fill="#1e293b" stroke="#10b981" strokeWidth="1" />
          <text x="360" y="72" fill="#a7f3d0" fontSize="10" textAnchor="middle">
            Völgy: E = E_m = ½·m·v²
          </text>
        </svg>
      </div>
    );
  }

  return null;
};
