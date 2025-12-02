import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LageBadgeProps {
  lage: string;
  className?: string;
  showEmoji?: boolean;
}

const lageConfig: Record<string, { emoji: string; label: string; className: string }> = {
  pussel: {
    emoji: '🧩',
    label: 'Pussel',
    className: 'bg-green-100 text-green-700 border-green-300',
  },
  halv: {
    emoji: '✏️',
    label: 'Halv-fritt',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  },
  fritt: {
    emoji: '✨',
    label: 'Fritt',
    className: 'bg-purple-100 text-purple-700 border-purple-300',
  },
};

export function LageBadge({ lage, className, showEmoji = true }: LageBadgeProps) {
  const config = lageConfig[lage] || lageConfig.pussel;

  return (
    <Badge className={cn(config.className, className)}>
      {showEmoji && <span className="mr-1">{config.emoji}</span>}
      {config.label}
    </Badge>
  );
}

// Compact version for stats display
export function LageStats({ sagor }: { sagor: Array<{ lage: string }> }) {
  const counts = sagor.reduce(
    (acc, saga) => {
      acc[saga.lage] = (acc[saga.lage] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const items = [
    { key: 'pussel', emoji: '🧩', count: counts.pussel || 0 },
    { key: 'halv', emoji: '✏️', count: counts.halv || 0 },
    { key: 'fritt', emoji: '✨', count: counts.fritt || 0 },
  ].filter(item => item.count > 0);

  if (items.length === 0) return null;

  return (
    <span className="text-xs text-muted-foreground">
      {items.map((item, i) => (
        <span key={item.key}>
          {i > 0 && ' · '}
          {item.emoji} {item.count}
        </span>
      ))}
    </span>
  );
}
