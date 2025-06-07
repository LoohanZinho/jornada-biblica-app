import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingIndicatorProps {
  size?: number;
  text?: string;
  className?: string;
}

export function LoadingIndicator({ size = 24, text, className }: LoadingIndicatorProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 p-4", className)}>
      <Loader2 className="h-auto animate-spin text-primary" style={{ width: size, height: size }} aria-label="Loading" />
      {text && <p className="text-sm text-muted-foreground font-body">{text}</p>}
    </div>
  );
}
