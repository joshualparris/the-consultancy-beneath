import { useGame } from '@/context/GameContext';

const SkillCheckOverlay = () => {
  const { state, dispatch } = useGame();

  if (!state.skillCheckResult) return null;
  const { skill, dc, roll, modifier, total, passed } = state.skillCheckResult;

  return (
    <div className="skill-check-overlay" onClick={() => dispatch({ type: 'DISMISS_SKILL_CHECK' })}>
      <div className="rpg-panel-active p-6 text-center space-y-3 animate-fade-in-up max-w-sm" onClick={e => e.stopPropagation()}>
        <h3 className="font-display font-bold text-primary rpg-glow text-lg">🎲 {skill} Check</h3>

        <div className="flex items-center justify-center gap-3">
          <div className={roll === 20 ? 'dice-nat20 text-2xl w-14 h-14' : roll === 1 ? 'dice-nat1 text-2xl w-14 h-14' : 'dice-normal text-2xl w-14 h-14'}>
            {roll}
          </div>
          <span className="text-muted-foreground text-lg">+</span>
          <span className="stat-value text-lg">{modifier}</span>
          <span className="text-muted-foreground text-lg">=</span>
          <span className={`font-display font-bold text-xl ${passed ? 'text-primary rpg-glow' : 'text-destructive'}`}>
            {total}
          </span>
        </div>

        <div className="text-sm text-muted-foreground">
          vs DC <span className="stat-value">{dc}</span>
        </div>

        <div className={`font-display font-bold text-xl ${passed ? 'text-primary rpg-glow' : 'text-destructive'}`}>
          {passed ? '✅ SUCCESS' : '❌ FAILURE'}
        </div>

        <button onClick={() => dispatch({ type: 'DISMISS_SKILL_CHECK' })} className="action-btn-defend text-xs mt-2">
          Continue
        </button>
      </div>
    </div>
  );
};

export default SkillCheckOverlay;
