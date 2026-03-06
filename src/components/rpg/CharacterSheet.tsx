import { Progress } from "@/components/ui/progress";

const STATS = {
  level: 3,
  hp: { current: 18, max: 24 },
  ac: 10,
  truth: 2,
  corruption: 1,
  faction: "None",
  spellSlots: { current: 2, max: 3 },
  inspiration: 1,
  gold: 47,
};

const ABILITIES = [
  { name: "Audit Trail", icon: "📋" },
  { name: "Redact", icon: "█" },
  { name: "Compliance Shield", icon: "🛡" },
  { name: "Whistle", icon: "📢" },
  { name: "—", icon: "?" },
  { name: "—", icon: "?" },
];

const INVENTORY = [
  { name: "Broken Lanyard", qty: 1, rarity: "common" },
  { name: "Memo of Binding", qty: 1, rarity: "uncommon" },
  { name: "Cafeteria Token", qty: 3, rarity: "common" },
  { name: "Redacted Document", qty: 1, rarity: "rare" },
];

const QUESTS = [
  { name: "Find the Missing Consultant", status: "active" },
  { name: "Decode the Org Chart", status: "active" },
  { name: "Survive the All-Hands", status: "completed" },
];

const rarityColors: Record<string, string> = {
  common: "text-muted-foreground",
  uncommon: "text-primary",
  rare: "text-accent",
};

const CharacterSheet = () => {
  const hpPercent = (STATS.hp.current / STATS.hp.max) * 100;

  return (
    <div className="w-72 flex flex-col gap-3">
      {/* Main stats */}
      <div className="rpg-panel">
        <h3 className="text-sm font-display font-bold text-primary rpg-glow mb-3">
          Character Sheet
        </h3>

        <div className="flex justify-between items-center mb-2">
          <span className="rpg-label">Level</span>
          <span className="stat-value text-lg">{STATS.level}</span>
        </div>

        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="rpg-label">HP</span>
            <span className="text-destructive font-bold">
              {STATS.hp.current} / {STATS.hp.max}
            </span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div className="hp-bar" style={{ width: `${hpPercent}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-xs">
          <div className="flex justify-between">
            <span className="rpg-label">AC</span>
            <span className="stat-value">{STATS.ac}</span>
          </div>
          <div className="flex justify-between">
            <span className="rpg-label">Truth</span>
            <span className="text-truth font-bold">{STATS.truth}</span>
          </div>
          <div className="flex justify-between">
            <span className="rpg-label">Corruption</span>
            <span className="text-corruption font-bold">{STATS.corruption}</span>
          </div>
          <div className="flex justify-between">
            <span className="rpg-label">Faction</span>
            <span className="text-muted-foreground">{STATS.faction}</span>
          </div>
          <div className="flex justify-between">
            <span className="rpg-label">Spell Slots</span>
            <span className="stat-value">
              {STATS.spellSlots.current} / {STATS.spellSlots.max}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="rpg-label">Inspiration</span>
            <span className="text-accent font-bold">{STATS.inspiration}</span>
          </div>
          <div className="flex justify-between col-span-2">
            <span className="rpg-label">Gold</span>
            <span className="text-gold font-bold">{STATS.gold}</span>
          </div>
        </div>

        <div className="mt-3">
          <span className="rpg-label block mb-2">Abilities</span>
          <div className="grid grid-cols-6 gap-1">
            {ABILITIES.map((a, i) => (
              <div key={i} className="ability-slot" title={a.name}>
                {a.icon}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="rpg-panel">
        <h3 className="text-sm font-display font-bold text-primary rpg-glow mb-2">
          Inventory
        </h3>
        {INVENTORY.map((item, i) => (
          <div key={i} className="quest-item flex justify-between items-center">
            <span className={`text-xs ${rarityColors[item.rarity]}`}>{item.name}</span>
            <span className="text-xs text-muted-foreground">x{item.qty}</span>
          </div>
        ))}
      </div>

      {/* Quest Log */}
      <div className="rpg-panel">
        <h3 className="text-sm font-display font-bold text-primary rpg-glow mb-2">
          Quest Log
        </h3>
        {QUESTS.map((q, i) => (
          <div key={i} className="quest-item flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                q.status === "active" ? "bg-accent" : "bg-muted-foreground"
              }`}
            />
            <span
              className={`text-xs ${
                q.status === "completed"
                  ? "text-muted-foreground line-through"
                  : "text-card-foreground"
              }`}
            >
              {q.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterSheet;
