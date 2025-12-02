import { WifiOff, Wifi } from 'lucide-react';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { Badge } from '@/components/ui/badge';

export function OfflineIndicator() {
  const { isOnline, getSagasNeedingSync } = useOfflineStorage();
  const pendingSync = getSagasNeedingSync().length;

  if (isOnline && pendingSync === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {!isOnline ? (
        <Badge variant="destructive" className="flex items-center gap-2 px-3 py-2 text-sm">
          <WifiOff className="h-4 w-4" />
          Offline-läge
        </Badge>
      ) : pendingSync > 0 ? (
        <Badge variant="secondary" className="flex items-center gap-2 px-3 py-2 text-sm">
          <Wifi className="h-4 w-4" />
          Synkroniserar {pendingSync} saga{pendingSync > 1 ? 'r' : ''}...
        </Badge>
      ) : null}
    </div>
  );
}
