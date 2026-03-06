import { useState } from "react";
import MiniMap from "./MiniMap";
import EventLog from "./EventLog";

const ENCOUNTER = {
  title: "The Compliance Officer",
  description:
    "A figure stands at the junction of two identical hallways. Their badge reads 'COMPLIANCE' but the photo is your face. They speak in a language that sounds like legalese rendered through a meat grinder.",
  choices: [
    { id: 1, text: "Present your own badge (Deception DC 14)", skill: "CHA" },
    { id: 2, text: "Attack with Audit Trail (1d8 + Truth modifier)", skill: "INT" },
    { id: 3, text: "Flee deeper into the Consultancy", skill: "DEX" },
    { id: 4, text: "Attempt to reason with bureaucratic logic", skill: "WIS" },
  ],
};

const EncounterPanel = () => {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

  return (
    <div className="rpg-panel flex-1 flex flex-col gap-3">
      {/* Top row: minimap + encounter */}
      <div className="flex gap-3">
        <div className="rpg-panel flex flex-col items-center gap-2 p-2">
          <MiniMap />
          <span className="rpg-label">Floor B3</span>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-display font-bold text-primary rpg-glow mb-2">
              Encounter
            </h3>
            <h4 className="text-xs font-display text-accent mb-2">{ENCOUNTER.title}</h4>
            <p className="encounter-text">{ENCOUNTER.description}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            {ENCOUNTER.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => setSelectedChoice(choice.id)}
                className={`text-left text-xs py-1.5 px-2 rounded-sm border transition-all font-mono ${
                  selectedChoice === choice.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/40 text-muted-foreground hover:border-primary/50 hover:text-card-foreground"
                }`}
              >
                <span className="text-accent mr-1">[{choice.skill}]</span>
                {choice.text}
              </button>
            ))}
          </div>

          {selectedChoice && (
            <button className="self-start text-xs px-4 py-1.5 bg-primary text-primary-foreground rounded-sm font-mono font-bold hover:bg-primary/80 transition-colors">
              ▸ COMMIT ACTION
            </button>
          )}
        </div>
      </div>

      {/* Event log */}
      <div>
        <h3 className="text-sm font-display font-bold text-primary rpg-glow mb-1">
          Event Log
        </h3>
        <EventLog />
      </div>
    </div>
  );
};

export default EncounterPanel;
