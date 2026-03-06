import { useGame } from '@/context/GameContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef } from 'react';

const logTypeColors: Record<string, string> = {
  narrative: 'text-card-foreground',
  combat: 'text-destructive',
  system: 'text-accent',
  loot: 'text-gold',
  skill: 'text-arcane',
  dialogue: 'text-primary',
};

const EventLog = () => {
  const { state } = useGame();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.log.length]);

  return (
    <div className="rpg-panel">
      <h3 className="rpg-label mb-1">Event Log</h3>
      <ScrollArea className="h-40">
        <div className="space-y-0">
          {state.log.map(entry => (
            <div key={entry.id} className={`event-log-entry ${logTypeColors[entry.type] || 'text-card-foreground'}`}>
              {entry.text}
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </ScrollArea>
    </div>
  );
};

export default EventLog;
