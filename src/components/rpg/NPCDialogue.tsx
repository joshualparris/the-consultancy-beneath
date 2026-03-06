import { useGame } from '@/context/GameContext';
import { NPCS } from '@/data/npcs';
import { getModifier, rollDice } from '@/data/classes';
import { useState } from 'react';

const NPCDialogue = () => {
  const { state, dispatch } = useGame();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<{ passed: boolean; roll: number; mod: number; dc: number } | null>(null);

  if (!state.activeNpcId) return null;
  const npc = NPCS[state.activeNpcId];
  if (!npc) return null;

  const handleChoice = (idx: number) => {
    const option = npc.dialogueOptions[idx];
    setSelectedOption(idx);

    if (option.skillCheck) {
      const skillAbilityMap: Record<string, 'INT' | 'WIS' | 'CHA' | 'DEX' | 'STR'> = {
        Investigation: 'INT', Arcana: 'INT', History: 'INT',
        Perception: 'WIS', Insight: 'WIS', Medicine: 'WIS',
        Stealth: 'DEX', Athletics: 'STR',
        Persuasion: 'CHA', Deception: 'CHA', Intimidation: 'CHA', Performance: 'CHA',
      };
      const ability = skillAbilityMap[option.skillCheck.skill] || 'CHA';
      const mod = getModifier(state.abilities[ability]) + (state.skills.includes(option.skillCheck.skill) ? state.proficiencyBonus : 0);
      const roll = rollDice(20);
      const total = roll + mod;
      const passed = total >= option.skillCheck.dc;

      setCheckResult({ passed, roll, mod, dc: option.skillCheck.dc });
      dispatch({ type: 'ADD_LOG', text: `🎲 ${option.skillCheck.skill}: ${roll}+${mod}=${total} vs DC ${option.skillCheck.dc} — ${passed ? 'SUCCESS' : 'FAIL'}`, logType: 'skill' });

      if (passed) {
        setResponse(option.response);
        if (option.flag) dispatch({ type: 'SET_FLAG', flag: option.flag });
        if (option.giveItem) dispatch({ type: 'ADD_ITEM', itemId: option.giveItem });
      } else {
        setResponse(`[${option.skillCheck.skill} check failed] ${npc.name} is unconvinced.`);
      }
    } else {
      setResponse(option.response);
      if (option.flag) dispatch({ type: 'SET_FLAG', flag: option.flag });
      if (option.giveItem) dispatch({ type: 'ADD_ITEM', itemId: option.giveItem });
    }
  };

  const handleLeave = () => {
    const cleared = new Set(state.clearedEncounters);
    cleared.add(state.currentRoomId);
    dispatch({ type: 'CLOSE_DIALOGUE' });
    setSelectedOption(null);
    setResponse(null);
    setCheckResult(null);
  };

  return (
    <div className="rpg-panel-active flex-1 flex flex-col gap-3">
      <h2 className="font-display font-bold text-primary rpg-glow text-lg">💬 Dialogue</h2>

      {/* NPC */}
      <div className="flex items-start gap-3">
        <div className="text-4xl">{npc.icon}</div>
        <div className="npc-bubble flex-1">
          <div className="font-display font-bold text-primary text-sm">{npc.name}</div>
          <div className="text-xs text-muted-foreground italic mb-2">{npc.title}</div>
          <p className="encounter-text">{response || npc.greeting}</p>
        </div>
      </div>

      {/* Skill check result */}
      {checkResult && (
        <div className={`rpg-panel text-center text-xs animate-dice-bounce ${checkResult.passed ? 'border-primary' : 'border-destructive'}`}>
          <span className={checkResult.roll === 20 ? 'dice-nat20' : checkResult.roll === 1 ? 'dice-nat1' : 'dice-normal'}>
            {checkResult.roll}
          </span>
          <span className="ml-2 text-muted-foreground">+ {checkResult.mod} = {checkResult.roll + checkResult.mod}</span>
          <span className="ml-2">vs DC {checkResult.dc}</span>
          <span className={`ml-2 font-bold ${checkResult.passed ? 'text-primary' : 'text-destructive'}`}>
            {checkResult.passed ? '✅ PASS' : '❌ FAIL'}
          </span>
        </div>
      )}

      {/* Choices */}
      {!response && (
        <div className="flex flex-col gap-1.5">
          {npc.dialogueOptions.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleChoice(i)}
              className="text-left text-xs py-2 px-3 rounded-sm border border-border/40 text-card-foreground hover:border-primary/50 transition-all font-mono"
            >
              {opt.text}
            </button>
          ))}
        </div>
      )}

      {response && (
        <div className="flex gap-2">
          <button onClick={() => { setResponse(null); setSelectedOption(null); setCheckResult(null); }} className="action-btn-defend text-xs">
            Ask something else
          </button>
          <button onClick={handleLeave} className="action-btn-flee text-xs">
            Leave
          </button>
        </div>
      )}
    </div>
  );
};

export default NPCDialogue;
