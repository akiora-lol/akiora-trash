import { useState } from 'react';
import { ChevronDown, ChevronUp, Swords } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ChampionStats } from '@/lib/api';

interface ChampionStatsCardProps {
  championStats: ChampionStats[];
}

export default function ChampionStatsCard({ championStats }: ChampionStatsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!championStats || championStats.length === 0) {
    return null;
  }

  const topChampions = championStats.slice(0, 3);
  const hasMore = championStats.length > 3;

  // Parse KDA string "9 / 7 / 7 (41%)" to get KDA ratio
  const parseKDA = (kdaString: string) => {
    const match = kdaString.match(/([\d.]+):(\d+)/);
    if (match) {
      return match[1];
    }
    // Try to calculate from kills/deaths/assists
    const kdaMatch = kdaString.match(/(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+)/);
    if (kdaMatch) {
      const [, kills, deaths, assists] = kdaMatch;
      const k = parseInt(kills);
      const d = parseInt(deaths);
      const a = parseInt(assists);
      return d === 0 ? (k + a).toFixed(1) : ((k + a) / d).toFixed(1);
    }
    return '0.0';
  };

  return (
    <div className="rounded-lg border border-rose-900/30 bg-black/20 p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between mb-3 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-rose-400" />
          <span className="font-semibold text-rose-50">Топ чемпионы</span>
          <Badge variant="outline" className="border-rose-500/50 bg-rose-500/10 text-rose-300">
            {championStats.length}
          </Badge>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-rose-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-rose-400" />
        )}
      </button>

      {/* Preview - Always visible */}
      {!isExpanded && (
        <div className="flex flex-wrap gap-2">
          {topChampions.map((champ) => (
            <Badge
              key={champ.champion}
              variant="secondary"
              className="border-slate-700 bg-slate-800/50"
            >
              {champ.champion}
            </Badge>
          ))}
          {hasMore && (
            <Badge variant="outline" className="border-rose-900/50 text-muted-foreground">
              +{championStats.length - 3} ещё
            </Badge>
          )}
        </div>
      )}

      {/* Expanded view */}
      {isExpanded && (
        <div className="space-y-2 animate-in slide-in-from-top duration-200">
          {championStats.map((champ, index) => {
            const totalGames = parseInt(champ.wins) + parseInt(champ.losses);
            const kdaValue = parseKDA(champ.kda);
            
            return (
              <div
                key={champ.champion}
                className="flex items-center justify-between rounded-lg border border-rose-900/30 bg-black/20 p-3 hover:bg-black/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-500/20 to-rose-700/20 border border-rose-500/30">
                    <span className="text-xs font-bold text-rose-400">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-rose-50">{champ.champion}</p>
                    <p className="text-xs text-muted-foreground">
                      {totalGames} {totalGames === 1 ? 'игра' : 'игр'} • KDA {kdaValue}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-rose-400">{champ.win_rate}</p>
                    <p className="text-xs text-muted-foreground">WR</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-400">{champ.wins}W</p>
                    <p className="text-xs text-red-400">{champ.losses}L</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
