import EncounterPanel from "@/components/rpg/EncounterPanel";
import CharacterSheet from "@/components/rpg/CharacterSheet";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative flicker">
      <div className="scanline-overlay" />

      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-2xl font-display font-bold text-primary rpg-glow tracking-wider">
          The Consultancy Beneath
        </h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">
          A clean website is only the first mask.
        </p>
      </header>

      {/* Main RPG Layout */}
      <div className="flex gap-4 p-4 max-w-7xl mx-auto">
        <EncounterPanel />
        <CharacterSheet />
      </div>
    </div>
  );
};

export default Index;
