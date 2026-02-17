import { Trophy, TrendingUp, Target } from 'lucide-react';
import RankIcon from './RankIcon';
import type { RankedStats } from '@/lib/api';

interface RankDisplayProps {
  solo_queue?: RankedStats;
  flex_queue?: RankedStats;
}

export default function RankDisplay({ solo_queue, flex_queue }: RankDisplayProps) {
  if (!solo_queue && !flex_queue) {
    return null;
  }

  const QueueDisplay = ({ stats, queueName }: { stats: RankedStats; queueName: string }) => {
    // Parse win/loss from "10W 5L" format
    const wins = stats.win_loss ? parseInt(stats.win_loss.split('W')[0]) : 0;
    const losses = stats.win_loss ? parseInt(stats.win_loss.split('W')[1]?.split('L')[0]) : 0;
    const totalGames = wins + losses;
    const winRate = stats.win_rate ? parseFloat(stats.win_rate.replace('%', '')) : 0;
    const winRateColor = winRate >= 55 ? 'text-green-400' : winRate >= 50 ? 'text-yellow-400' : 'text-red-400';

    // Skip unranked queues
    if (stats.current_rank === 'Unranked' || !stats.win_loss) {
      return null;
    }

    return (
      <div className="rounded-lg border border-rose-900/30 bg-gradient-to-br from-black/40 to-rose-950/10 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-rose-400" />
            <span className="font-semibold text-rose-50">{queueName}</span>
          </div>
          <RankIcon rank={stats.current_rank} size="sm" />
        </div>

        <div className="mb-4 space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-400">
              {stats.current_rank}
            </span>
            {stats.current_lp !== null && (
              <span className="text-lg text-rose-300">
                {stats.current_lp} LP
              </span>
            )}
          </div>
          {stats.best_rank && stats.best_rank !== 'Unranked' && stats.best_rank !== stats.current_rank && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Лучший:</span>
              <span className="text-sm font-semibold text-yellow-400">
                {stats.best_rank}
              </span>
              {stats.best_lp !== null && (
                <span className="text-xs text-yellow-300">
                  {stats.best_lp} LP
                </span>
              )}
            </div>
          )}
          {totalGames > 0 && (
            <p className="text-xs text-muted-foreground">
              {totalGames} {totalGames === 1 ? 'игра' : 'игр'} в этом сезоне
            </p>
          )}
        </div>

        {stats.win_loss && (
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-black/40 p-2">
              <div className={`text-lg font-bold ${winRateColor}`}>
                {stats.win_rate || '0%'}
              </div>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                Винрейт
              </div>
            </div>
            <div className="rounded-lg bg-black/40 p-2">
              <div className="text-lg font-bold text-green-400">
                {wins}
              </div>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Target className="h-3 w-3" />
                Побед
              </div>
            </div>
            <div className="rounded-lg bg-black/40 p-2">
              <div className="text-lg font-bold text-red-400">
                {losses}
              </div>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Target className="h-3 w-3" />
                Поражений
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {solo_queue && <QueueDisplay stats={solo_queue} queueName="Solo/Duo Queue" />}
      {flex_queue && <QueueDisplay stats={flex_queue} queueName="Flex Queue" />}
    </div>
  );
}
