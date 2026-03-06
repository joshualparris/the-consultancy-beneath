import { useGame } from '@/context/GameContext';
import { useEffect, useCallback } from 'react';

const CombatSystem = () => {
  const { state, dispatch } = useGame();
  const { combat } = state;

  // Handle enemy death / player death
  useEffect(() => {
    if (!combat) return;
    if (combat.enemy.currentHP <= 0) {
      const timer = setTimeout(() => dispatch({ type: 'END_COMBAT', won: true }), 1200);
      return () => clearTimeout(timer);
    }
    if (state.currentHP <= 0) {
      // Game over - just log it
    }
  }, [combat?.enemy.currentHP, state.currentHP]);

  // Auto enemy turn
  useEffect(() => {
    if (!combat || combat.playerTurn || combat.enemy.currentHP <= 0 || state.currentHP <= 0) return;
    const timer = setTimeout(() => dispatch({ type: 'ENEMY_TURN' }), 1000);
    return () => clearTimeout(timer);
  }, [combat?.playerTurn]);

  if (!combat) return null;
  const { enemy } = combat;
  const dead = enemy.currentHP <= 0;
  const playerDead = state.currentHP <= 0;

  return (
    <div className="rpg-panel-active flex-1 flex flex-col gap-3">
      <h2 className="font-display font-bold text-destructive text-lg rpg-glow">⚔️ Combat</h2>

      {/* Enemy */}
      <div className="rpg-panel flex items-center gap-4">
        <span className="text-4xl">{enemy.icon}</span>
        <div className="flex-1">
          <h3 className="font-display font-bold text-primary text-sm">{enemy.name}</h3>
          <div className="text-xs text-muted-foreground mb-1">AC {enemy.ac} | Atk +{enemy.attackBonus} | {enemy.damage}</div>
          <div className="flex gap-1">
            {Array.from({ length: enemy.maxHP }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-3 rounded-sm transition-all ${
                  i < enemy.currentHP ? 'bg-destructive' : 'bg-secondary'
                }`}
                style={i < enemy.currentHP ? { boxShadow: '0 0 3px hsl(0 80% 45% / 0.5)' } : {}}
              />
            ))}
          </div>
          <div className="text-xs mt-1 text-muted-foreground">HP: {enemy.currentHP}/{enemy.maxHP}</div>
        </div>
      </div>

      {/* Player death */}
      {playerDead && (
        <div className="rpg-panel text-center py-6 animate-fade-in-up">
          <h3 className="font-display text-xl text-destructive font-bold mb-2">YOU HAVE FALLEN</h3>
          <p className="text-xs text-muted-foreground mb-4">The Consultancy claims another soul.</p>
          <button onClick={() => dispatch({ type: 'NEW_GAME' })} className="action-btn-attack">
            ↺ Start Over
          </button>
        </div>
      )}

      {/* Victory */}
      {dead && !playerDead && (
        <div className="rpg-panel text-center py-4 animate-fade-in-up">
          <h3 className="font-display text-lg text-primary font-bold rpg-glow">VICTORY</h3>
          <p className="text-xs text-muted-foreground">+{enemy.xp} XP</p>
        </div>
      )}

      {/* Actions */}
      {!dead && !playerDead && combat.playerTurn && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => dispatch({ type: 'PLAYER_ATTACK' })} className="action-btn-attack">
            ⚔️ Attack
          </button>
          {state.spellSlots.current > 0 && (
            <button onClick={() => dispatch({ type: 'PLAYER_CAST_SPELL' })} className="action-btn-spell">
              🔮 Cast Spell ({state.spellSlots.current})
            </button>
          )}
          <button onClick={() => dispatch({ type: 'PLAYER_DODGE' })} className="action-btn-defend">
            🛡️ Dodge
          </button>
          <button onClick={() => dispatch({ type: 'PLAYER_FLEE' })} className="action-btn-flee">
            🏃 Disengage
          </button>
        </div>
      )}

      {!dead && !playerDead && !combat.playerTurn && (
        <div className="text-center text-xs text-muted-foreground animate-pulse">
          Enemy turn...
        </div>
      )}
    </div>
  );
};

export default CombatSystem;
