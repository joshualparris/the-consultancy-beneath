import { ScrollArea } from "@/components/ui/scroll-area";

interface LogEntry {
  id: number;
  text: string;
  type: "narrative" | "combat" | "system" | "loot";
}

const LOG_ENTRIES: LogEntry[] = [
  { id: 1, text: "You descend into the Consultancy Beneath.", type: "narrative" },
  { id: 2, text: "The fluorescent lights hum at a frequency that isn't quite right.", type: "narrative" },
  { id: 3, text: "[SYSTEM] Session initialized. Reality anchor: UNSTABLE.", type: "system" },
  { id: 4, text: "A figure in a grey suit watches from the end of the corridor.", type: "narrative" },
  { id: 5, text: "You found: Broken Lanyard (Common)", type: "loot" },
  { id: 6, text: "The Compliance Officer attacks! Roll for initiative.", type: "combat" },
  { id: 7, text: "You rolled 14. The Compliance Officer rolled 8.", type: "combat" },
  { id: 8, text: "You cast 'Audit Trail'. The officer recoils.", type: "combat" },
];

const typeColors: Record<LogEntry["type"], string> = {
  narrative: "text-card-foreground",
  combat: "text-destructive",
  system: "text-accent",
  loot: "text-gold",
};

const EventLog = () => {
  return (
    <ScrollArea className="h-48">
      <div className="space-y-0">
        {LOG_ENTRIES.map((entry) => (
          <div key={entry.id} className={`event-log-entry ${typeColors[entry.type]}`}>
            {entry.text}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default EventLog;
