import { useState, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { CLASSES, ABILITY_NAMES, type AbilityName, type ClassName, roll4d6DropLowest, getModifier, formatModifier } from '@/data/classes';

const CharacterCreation = () => {
  const { dispatch } = useGame();
  const [selectedClass, setSelectedClass] = useState<ClassName | null>(null);
  const [name, setName] = useState('');
  const [abilities, setAbilities] = useState<Record<AbilityName, number> | null>(null);
  const [rolledScores, setRolledScores] = useState<number[]>([]);
  const [assignStep, setAssignStep] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [rollAnimations, setRollAnimations] = useState<{ rolls: number[]; total: number }[]>([]);

  const rollStats = useCallback(() => {
    setRolling(true);
    const results: { rolls: number[]; total: number }[] = [];
    for (let i = 0; i < 6; i++) {
      results.push(roll4d6DropLowest());
    }
    setRollAnimations(results);
    setTimeout(() => {
      setRolledScores(results.map(r => r.total).sort((a, b) => b - a));
      setRolling(false);
      setAssignStep(true);
    }, 800);
  }, []);

  const [assignments, setAssignments] = useState<Record<AbilityName, number | null>>({
    STR: null, DEX: null, CON: null, INT: null, WIS: null, CHA: null
  });

  const unassignedScores = rolledScores.filter(score => {
    const usedScores = Object.values(assignments).filter(v => v !== null) as number[];
    const usedCount = usedScores.filter(s => s === score).length;
    const totalCount = rolledScores.filter(s => s === score).length;
    return usedCount < totalCount;
  });

  const assignScore = (ability: AbilityName, score: number) => {
    setAssignments(prev => ({ ...prev, [ability]: score }));
  };

  const allAssigned = Object.values(assignments).every(v => v !== null);

  const handleCreate = () => {
    if (!selectedClass || !name || !allAssigned) return;
    const finalAbilities = {} as Record<AbilityName, number>;
    for (const ab of ABILITY_NAMES) {
      finalAbilities[ab] = assignments[ab]!;
    }
    dispatch({ type: 'CREATE_CHARACTER', className: selectedClass, abilities: finalAbilities, name });
  };

  const classData = selectedClass ? CLASSES.find(c => c.name === selectedClass) : null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display font-bold text-primary rpg-glow">
            The Consultancy Beneath
          </h1>
          <p className="text-sm text-muted-foreground">Create your character to begin the descent.</p>
        </div>

        {/* Name */}
        <div className="rpg-panel">
          <label className="rpg-label block mb-2">Character Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name..."
            className="w-full bg-secondary border border-border rounded-sm px-3 py-2 text-foreground font-mono text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {/* Class Selection */}
        <div className="rpg-panel">
          <h2 className="rpg-label mb-3">Choose Your Class</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {CLASSES.map(cls => (
              <button
                key={cls.name}
                onClick={() => setSelectedClass(cls.name)}
                className={`rpg-panel text-left p-3 transition-all ${
                  selectedClass === cls.name
                    ? 'border-primary rpg-panel-active'
                    : 'hover:border-primary/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{cls.icon}</span>
                  <span className="font-display font-bold text-sm text-primary">{cls.name}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-snug">{cls.description}</p>
                <div className="mt-2 flex gap-2 text-xs">
                  <span className="text-destructive">d{cls.hitDie}</span>
                  <span className="text-muted-foreground">AC {cls.baseAC}</span>
                  {cls.spellcaster && <span className="arcane-text">✨{cls.spellSlots}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        {selectedClass && (
          <div className="rpg-panel animate-fade-in-up">
            <div className="flex justify-between items-center mb-3">
              <h2 className="rpg-label">Ability Scores</h2>
              {!assignStep && (
                <button
                  onClick={rollStats}
                  disabled={rolling}
                  className="action-btn-attack text-xs"
                >
                  {rolling ? 'Rolling...' : '🎲 Roll 4d6 Drop Lowest'}
                </button>
              )}
            </div>

            {rolling && rollAnimations.length > 0 && (
              <div className="grid grid-cols-6 gap-2 mb-3">
                {rollAnimations.map((r, i) => (
                  <div key={i} className="text-center animate-dice-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="dice-normal text-lg">{r.total}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {r.rolls.join(',')}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {assignStep && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Click a score to assign it to an ability. Primary: <span className="text-primary">{classData?.primaryAbility}</span></p>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {unassignedScores.length > 0 && (
                    <span className="rpg-label mr-2">Available:</span>
                  )}
                  {(() => {
                    const remaining = [...rolledScores];
                    const used = Object.values(assignments).filter(v => v !== null) as number[];
                    for (const u of used) {
                      const idx = remaining.indexOf(u);
                      if (idx !== -1) remaining.splice(idx, 1);
                    }
                    return remaining.map((score, i) => (
                      <span key={i} className="dice-normal text-sm cursor-pointer">{score}</span>
                    ));
                  })()}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {ABILITY_NAMES.map(ab => {
                    const remaining = [...rolledScores];
                    const used = Object.values(assignments).filter(v => v !== null) as number[];
                    for (const u of used) {
                      const idx = remaining.indexOf(u);
                      if (idx !== -1) remaining.splice(idx, 1);
                    }
                    const isPrimary = ab === classData?.primaryAbility;
                    return (
                      <div key={ab} className={`rpg-panel p-2 ${isPrimary ? 'border-primary/50' : ''}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`rpg-label ${isPrimary ? 'text-primary' : ''}`}>{ab}</span>
                          {assignments[ab] !== null && (
                            <button onClick={() => setAssignments(p => ({ ...p, [ab]: null }))} className="text-xs text-destructive">✕</button>
                          )}
                        </div>
                        {assignments[ab] !== null ? (
                          <div className="text-center">
                            <span className="stat-value text-xl">{assignments[ab]}</span>
                            <span className="text-xs text-muted-foreground ml-1">({formatModifier(getModifier(assignments[ab]!))})</span>
                          </div>
                        ) : (
                          <div className="flex gap-1 flex-wrap">
                            {remaining.map((score, i) => (
                              <button key={i} onClick={() => assignScore(ab, score)} className="dice-normal text-xs w-7 h-7 hover:border-primary">
                                {score}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Preview + Create */}
        {allAssigned && classData && name && (
          <div className="rpg-panel-active animate-fade-in-up text-center space-y-3">
            <h2 className="font-display font-bold text-primary rpg-glow">
              {name} the {selectedClass}
            </h2>
            <div className="flex justify-center gap-4 text-xs">
              <span>HP: <strong className="text-destructive">{classData.hitDie + getModifier(assignments.CON!)}</strong></span>
              <span>AC: <strong className="stat-value">{selectedClass === 'Wizard' || selectedClass === 'Bard' || selectedClass === 'Rogue' ? classData.baseAC + getModifier(assignments.DEX!) : classData.baseAC}</strong></span>
              {classData.spellcaster && <span>Spells: <strong className="arcane-text">{classData.spellSlots}</strong></span>}
            </div>
            <button onClick={handleCreate} className="action-btn-defend text-sm px-8 py-2">
              ▸ BEGIN DESCENT
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterCreation;
