import React from 'react';
import { Award, Crown, Medal, RefreshCw, Sparkles, TrendingUp, Trophy, User, Users } from 'lucide-react';
import { LeaderboardEntry } from '../types/physics';

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
  onRefresh: () => void;
  isLoading: boolean;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  entries,
  currentUserId,
  onRefresh,
  isLoading,
}) => {
  const top1 = entries[0];
  const top2 = entries[1];
  const top3 = entries[2];

  const totalScoreSum = entries.reduce((acc, curr) => acc + curr.score, 0);
  const averageScore = entries.length > 0 ? Math.round(totalScoreSum / entries.length) : 0;
  const maxScore = entries.length > 0 ? entries[0].score : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header and Live Refresh button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold border border-amber-300 mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-700" />
            <span>Élő Diák Rangsor</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Fizika Kihívás Rangsor
          </h2>
          <p className="text-slate-700 text-sm mt-1">
            Az összesített pontszámok és feladatmegoldások alapján rangsorolt diákok.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium shadow-xs transition-colors shrink-0 cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Rangsor Frissítése</span>
        </button>
      </div>

      {/* Quick Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Regisztrált Diákok
            </span>
            <span className="text-2xl font-bold text-slate-900">{entries.length} fő</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Legmagasabb Pontszám
            </span>
            <span className="text-2xl font-bold text-amber-600">{maxScore} pont</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Átlagos Pontszám
            </span>
            <span className="text-2xl font-bold text-emerald-600">{averageScore} pont</span>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4">
          {/* 2nd Place (Silver) */}
          {top2 && (
            <div className={`order-2 md:order-1 bg-white rounded-2xl border p-5 text-center relative shadow-xs ${
              top2.id === currentUserId ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
            }`}>
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center mx-auto -mt-9 border-2 border-white shadow-xs">
                2
              </div>
              <div className="mt-2 relative inline-block">
                {top2.avatar_url ? (
                  <img
                    src={top2.avatar_url}
                    alt={top2.full_name}
                    className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-slate-300 shadow-xs"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-600">
                    <User className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-slate-200 text-slate-800 p-1 rounded-full border border-white">
                  <Medal className="w-3.5 h-3.5 text-slate-600" />
                </div>
              </div>

              <h4 className="font-bold text-slate-900 mt-2 text-base flex items-center justify-center space-x-1.5">
                <span>{top2.full_name}</span>
                {top2.id === currentUserId && (
                  <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                    Te
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-500 truncate">{top2.email}</p>
              
              <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3">
                <span className="text-xl font-black text-slate-800">{top2.score}</span>
                <span className="text-xs text-slate-500 font-medium ml-1">pont</span>
              </div>
            </div>
          )}

          {/* 1st Place (Gold - Taller/Highlighted) */}
          {top1 && (
            <div className={`order-1 md:order-2 bg-gradient-to-b from-amber-50 to-white rounded-2xl border-2 border-amber-300 p-6 text-center relative shadow-md ${
              top1.id === currentUserId ? 'ring-4 ring-amber-400/20' : ''
            }`}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white p-1.5 rounded-full shadow-sm">
                <Crown className="w-5 h-5" />
              </div>
              <div className="mt-2 relative inline-block">
                {top1.avatar_url ? (
                  <img
                    src={top1.avatar_url}
                    alt={top1.full_name}
                    className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-amber-300 shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-700">
                    <User className="w-10 h-10" />
                  </div>
                )}
              </div>

              <span className="inline-block mt-2 text-[10px] font-extrabold uppercase tracking-wider bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
                1. Helyezett • Élen álló
              </span>

              <h4 className="font-extrabold text-slate-900 mt-1 text-lg flex items-center justify-center space-x-1.5">
                <span>{top1.full_name}</span>
                {top1.id === currentUserId && (
                  <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                    Te
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-500 truncate">{top1.email}</p>

              <div className="mt-3 bg-amber-100/70 border border-amber-300 rounded-xl py-2 px-3">
                <span className="text-2xl font-black text-amber-900">{top1.score}</span>
                <span className="text-xs text-amber-700 font-bold ml-1">pont</span>
              </div>
            </div>
          )}

          {/* 3rd Place (Bronze) */}
          {top3 && (
            <div className={`order-3 bg-white rounded-2xl border p-5 text-center relative shadow-xs ${
              top3.id === currentUserId ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
            }`}>
              <div className="w-8 h-8 rounded-full bg-amber-700 text-amber-100 font-bold text-sm flex items-center justify-center mx-auto -mt-9 border-2 border-white shadow-xs">
                3
              </div>
              <div className="mt-2 relative inline-block">
                {top3.avatar_url ? (
                  <img
                    src={top3.avatar_url}
                    alt={top3.full_name}
                    className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-amber-600 shadow-xs"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-600">
                    <User className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-amber-800 text-amber-100 p-1 rounded-full border border-white">
                  <Medal className="w-3.5 h-3.5 text-amber-200" />
                </div>
              </div>

              <h4 className="font-bold text-slate-900 mt-2 text-base flex items-center justify-center space-x-1.5">
                <span>{top3.full_name}</span>
                {top3.id === currentUserId && (
                  <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                    Te
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-500 truncate">{top3.email}</p>

              <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3">
                <span className="text-xl font-black text-slate-800">{top3.score}</span>
                <span className="text-xs text-slate-500 font-medium ml-1">pont</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Complete Rankings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Teljes Diák Ranglista</h3>
          <span className="text-xs text-slate-500">Pontszámok szerint csökkenő sorrendben</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                <th className="py-3.5 px-4 text-center w-16">Helyezés</th>
                <th className="py-3.5 px-4">Diák Neve és Fiókja</th>
                <th className="py-3.5 px-4 text-center">Megoldott feladatok</th>
                <th className="py-3.5 px-4 text-right pr-6">Összpontszám</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {entries.map((student) => {
                const isCurrent = student.id === currentUserId;

                return (
                  <tr
                    key={student.id}
                    id={`leaderboard-row-${student.id}`}
                    className={`transition-colors ${
                      isCurrent
                        ? 'bg-blue-50/80 hover:bg-blue-50 font-semibold'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-4 px-4 text-center">
                      {student.rank === 1 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-black border border-amber-300">
                          1
                        </span>
                      ) : student.rank === 2 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-black border border-slate-300">
                          2
                        </span>
                      ) : student.rank === 3 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-amber-100 font-black">
                          3
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium">{student.rank}.</span>
                      )}
                    </td>

                    {/* Student name & details */}
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        {student.avatar_url ? (
                          <img
                            src={student.avatar_url}
                            alt={student.full_name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900">{student.full_name}</span>
                            {isCurrent && (
                              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                                Saját profilod
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 font-mono block">{student.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Solved Count */}
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                        <Award className="w-3.5 h-3.5 text-blue-600" />
                        <span>{student.solved_tasks_count} / 3 feladat</span>
                      </span>
                    </td>

                    {/* Total Score */}
                    <td className="py-4 px-4 text-right pr-6">
                      <div className="inline-flex items-center space-x-1.5 font-mono">
                        <span className="text-base font-extrabold text-slate-900">{student.score}</span>
                        <span className="text-xs font-medium text-slate-500">pont</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
