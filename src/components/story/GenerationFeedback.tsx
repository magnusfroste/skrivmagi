import { useEffect, useState } from 'react';
import { Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GenerationFeedbackProps {
  busy: boolean;
  error: boolean;
  label: string;
  onRetry: () => void;
}

export function GenerationFeedback({ busy, error, label, onRetry }: GenerationFeedbackProps) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    setSlow(false);
    if (!busy) return;
    const timer = setTimeout(() => setSlow(true), 15_000);
    return () => clearTimeout(timer);
  }, [busy]);

  return (
    <div aria-live="polite" aria-atomic="true">
      {busy && (
        <p role="status" className="flex items-center gap-2 py-3 text-base text-foreground">
          <Loader2 aria-hidden="true" className="h-5 w-5 shrink-0 animate-spin" />
          {slow ? 'Det tar lite längre tid. Vi jobbar på det! Din saga finns kvar.' : label}
        </p>
      )}
      {error && !busy && (
        <div className="flex flex-wrap items-center gap-3 py-3">
          <p className="text-base text-foreground">Oj, det gick inte just nu. Din saga finns kvar.</p>
          <Button variant="outline" onClick={onRetry}><RotateCcw aria-hidden="true" />Försök igen</Button>
        </div>
      )}
    </div>
  );
}