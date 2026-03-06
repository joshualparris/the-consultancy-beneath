import { GameProvider, useGame } from '@/context/GameContext';
import CharacterCreation from '@/components/rpg/CharacterCreation';
import CharacterSheet from '@/components/rpg/CharacterSheet';
import CombatSystem from '@/components/rpg/CombatSystem';
import DungeonNavigation from '@/components/rpg/DungeonNavigation';
import NPCDialogue from '@/components/rpg/NPCDialogue';
import SkillCheckOverlay from '@/components/rpg/SkillCheckOverlay';
import EventLog from '@/components/rpg/EventLog';

const GameScreen = () => {
  const { state } = useGame();

  if (state.screen === 'creation') {
    return <CharacterCreation />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-2 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-display font-bold text-primary rpg-glow tracking-wider">
            The Consultancy Beneath
          </h1>
          <p className="text-[10px] text-muted-foreground font-mono">Floor B{Math.abs(3 - Object.values(state.visitedRooms).length)} | {state.playerName} the {state.className}</p>
        </div>
        <div className="flex gap-4 text-xs font-mono">
          <span>Lvl <strong className="stat-value">{state.level}</strong></span>
          <span>HP <strong className="text-destructive">{state.currentHP}/{state.maxHP}</strong></span>
          <span>AC <strong className="stat-value">{state.ac}</strong></span>
          <span className="text-gold">{state.gold}g</span>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Main content */}
        <div className="flex-1 flex flex-col p-3 gap-3 overflow-y-auto">
          {state.screen === 'combat' && <CombatSystem />}
          {state.screen === 'dialogue' && <NPCDialogue />}
          {state.screen === 'adventure' && <DungeonNavigation />}
          <EventLog />
        </div>

        {/* Right: Character sheet sidebar */}
        <div className="border-l border-border p-2 overflow-y-auto">
          <CharacterSheet />
        </div>
      </div>

      {/* Skill check overlay */}
      <SkillCheckOverlay />
    </div>
  );
};

const Index = () => {
  return (
    <GameProvider>
      <GameScreen />
    </GameProvider>
  );
};

export default Index;
