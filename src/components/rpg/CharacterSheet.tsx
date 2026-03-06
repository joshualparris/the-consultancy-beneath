import { useGame } from '@/context/GameContext';
import { ABILITY_NAMES, getModifier, formatModifier, CLASSES } from '@/data/classes';
import { ITEMS, RARITY_COLORS } from '@/data/items';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';

const CharacterSheet = () => {
  const { state, dispatch } = useGame();
  const [tooltipItem, setTooltipItem] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const hpPercent = state.maxHP > 0 ? (state.currentHP / state.maxHP) * 100 : 0;
  const classData = CLASSES.find(c => c.name === state.className);

  const handleItemHover = (itemId: string | null, e?: React.MouseEvent) => {
    setTooltipItem(itemId);
    if (e) setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="w-64 flex flex-col gap-2 shrink-0">
      {/* Header */}
      <div className="rpg-panel">
        <h3 className="font-display font-bold text-primary rpg-glow text-sm">{state.playerName}</h3>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Level {state.level} {state.className}</span>
          <span>XP: {state.xp}/{state.level * 100}</span>
        </div>
      </div>

      {/* HP */}
      <div className="rpg-panel">
        <div className="flex justify-between text-xs mb-1">
          <span className="rpg-label">HP</span>
          <span className="text-destructive font-bold">{state.currentHP} / {state.maxHP}</span>
        </div>
        <div className="hp-bar-track">
          <div className="hp-bar-fill" style={{ width: `${hpPercent}%` }} />
        </div>
        <div className="flex justify-between text-xs mt-2">
          <span className="rpg-label">AC</span>
          <span className="stat-value">{state.ac}</span>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className="rpg-label">Proficiency</span>
          <span className="stat-value">+{state.proficiencyBonus}</span>
        </div>
      </div>

      {/* Ability Scores */}
      <div className="rpg-panel">
        <h4 className="rpg-label mb-2">Abilities</h4>
        <div className="grid grid-cols-3 gap-1.5">
          {ABILITY_NAMES.map(ab => (
            <div key={ab} className="text-center rpg-panel p-1">
              <div className="rpg-label text-[9px]">{ab}</div>
              <div className="stat-value text-sm">{state.abilities[ab]}</div>
              <div className="text-xs text-muted-foreground">{formatModifier(getModifier(state.abilities[ab]))}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Saving Throws */}
      <div className="rpg-panel">
        <h4 className="rpg-label mb-1">Saving Throws</h4>
        <div className="text-xs space-y-0.5">
          {ABILITY_NAMES.map(ab => {
            const prof = classData?.savingThrows.includes(ab);
            const mod = getModifier(state.abilities[ab]) + (prof ? state.proficiencyBonus : 0);
            return (
              <div key={ab} className="flex justify-between">
                <span className={prof ? 'text-primary' : 'text-muted-foreground'}>
                  {prof ? '●' : '○'} {ab}
                </span>
                <span className={prof ? 'stat-value text-xs' : 'text-muted-foreground'}>
                  {formatModifier(mod)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spell Slots */}
      {state.spellSlots.max > 0 && (
        <div className="rpg-panel">
          <h4 className="rpg-label mb-1">Spell Slots</h4>
          <div className="flex gap-1">
            {Array.from({ length: state.spellSlots.max }, (_, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full border transition-colors ${
                  i < state.spellSlots.current
                    ? 'bg-arcane border-arcane'
                    : 'bg-secondary border-border'
                }`}
                style={i < state.spellSlots.current ? { boxShadow: '0 0 6px hsl(270 70% 55% / 0.5)' } : {}}
              />
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      <div className="rpg-panel">
        <h4 className="rpg-label mb-1">Skills</h4>
        <div className="text-xs space-y-0.5">
          {state.skills.map(skill => (
            <div key={skill} className="flex justify-between">
              <span className="text-primary">● {skill}</span>
              <span className="stat-value text-xs">+{state.proficiencyBonus}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory */}
      <div className="rpg-panel relative">
        <div className="flex justify-between items-center mb-2">
          <h4 className="rpg-label">Inventory</h4>
          <span className="text-xs text-gold font-bold">{state.gold}g</span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {state.inventory.map((itemId, i) => {
            const item = itemId ? ITEMS[itemId] : null;
            return (
              <div
                key={i}
                className={item ? 'inventory-slot-filled' : 'inventory-slot'}
                onMouseEnter={e => item && handleItemHover(itemId, e)}
                onMouseLeave={() => handleItemHover(null)}
                onClick={() => item && dispatch({ type: 'USE_ITEM', slotIndex: i })}
                title={item ? `${item.name} (click to use)` : 'Empty'}
              >
                {item ? (
                  <>
                    <span className="text-lg">{item.icon}</span>
                    <span className={`text-[8px] ${RARITY_COLORS[item.rarity]}`}>{item.name.split(' ')[0]}</span>
                  </>
                ) : (
                  <span className="text-border">·</span>
                )}
              </div>
            );
          })}
        </div>

        {tooltipItem && ITEMS[tooltipItem] && (
          <div className="tooltip-item -left-52 top-8">
            <div className={`font-bold ${RARITY_COLORS[ITEMS[tooltipItem].rarity]}`}>
              {ITEMS[tooltipItem].icon} {ITEMS[tooltipItem].name}
            </div>
            <div className="text-muted-foreground mt-1">{ITEMS[tooltipItem].description}</div>
            {ITEMS[tooltipItem].effect && (
              <div className="text-primary mt-1 italic">{ITEMS[tooltipItem].effect}</div>
            )}
          </div>
        )}
      </div>

      {/* Quest Log */}
      <div className="rpg-panel">
        <h4 className="rpg-label mb-1">Quests</h4>
        <ScrollArea className="max-h-32">
          {state.questLog.map(q => (
            <div key={q.id} className="quest-item flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${q.status === 'active' ? 'bg-accent' : 'bg-muted-foreground'}`} />
              <span className={`text-xs ${q.status === 'completed' ? 'text-muted-foreground line-through' : 'text-card-foreground'}`}>
                {q.name}
              </span>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Actions */}
      <div className="rpg-panel flex gap-2">
        <button onClick={() => dispatch({ type: 'REST' })} className="action-btn-defend flex-1 text-[10px]" disabled={state.screen === 'combat'}>
          🛏️ Rest
        </button>
        <button onClick={() => dispatch({ type: 'NEW_GAME' })} className="action-btn-flee flex-1 text-[10px]">
          ↺ New Game
        </button>
      </div>
    </div>
  );
};

export default CharacterSheet;
