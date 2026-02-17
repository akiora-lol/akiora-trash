import { Shield } from 'lucide-react';

interface RankIconProps {
  rank: string;
  size?: 'sm' | 'md' | 'lg';
}

const rankColors: Record<string, { bg: string; border: string; text: string }> = {
  IRON: { bg: 'bg-slate-600/20', border: 'border-slate-500', text: 'text-slate-400' },
  BRONZE: { bg: 'bg-amber-900/20', border: 'border-amber-700', text: 'text-amber-600' },
  SILVER: { bg: 'bg-slate-400/20', border: 'border-slate-400', text: 'text-slate-300' },
  GOLD: { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-400' },
  PLATINUM: { bg: 'bg-cyan-500/20', border: 'border-cyan-400', text: 'text-cyan-300' },
  EMERALD: { bg: 'bg-emerald-500/20', border: 'border-emerald-400', text: 'text-emerald-300' },
  DIAMOND: { bg: 'bg-blue-500/20', border: 'border-blue-400', text: 'text-blue-300' },
  MASTER: { bg: 'bg-purple-500/20', border: 'border-purple-400', text: 'text-purple-300' },
  GRANDMASTER: { bg: 'bg-red-500/20', border: 'border-red-400', text: 'text-red-300' },
  CHALLENGER: { bg: 'bg-rose-500/20', border: 'border-rose-400', text: 'text-rose-300' },
  UNRANKED: { bg: 'bg-gray-700/20', border: 'border-gray-600', text: 'text-gray-400' },
};

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

export default function RankIcon({ rank, size = 'md' }: RankIconProps) {
  // Extract rank tier (e.g., "GOLD IV" -> "GOLD")
  const tier = rank.split(' ')[0].toUpperCase();
  const colors = rankColors[tier] || rankColors.UNRANKED;

  return (
    <div
      className={`${sizeClasses[size]} ${colors.bg} ${colors.border} flex items-center justify-center rounded-lg border-2`}
    >
      <Shield className={`${colors.text} ${size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8'}`} />
    </div>
  );
}
