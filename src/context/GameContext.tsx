import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import { type ClassName, type AbilityName, CLASSES, ABILITY_NAMES, getModifier, calculateHP, calculateAC, rollDice } from '@/data/classes';
import { ROOMS, type Room } from '@/data/rooms';
import { ITEMS, type Item } from '@/data/items';
import { ENEMIES, type Enemy } from '@/data/enemies';

export type GameScreen = 'creation' | 'adventure' | 'combat' | 'dialogue';

export interface LogEntry {
  id: number;
  text: string;
  type: 'narrative' | 'combat' | 'system' | 'loot' | 'skill' | 'dialogue';
}

export interface QuestEntry {
  id: string;
  name: string;
  status: 'active' | 'completed';
}

export interface CombatState {
  enemy: Enemy & { currentHP: number };
  playerTurn: boolean;
  dodging: boolean;
}

export interface GameState {
  screen: GameScreen;
  // Character
  playerName: string;
  className: ClassName | null;
  level: number;
  xp: number;
  abilities: Record<AbilityName, number>;
  maxHP: number;
  currentHP: number;
  ac: number;
  proficiencyBonus: number;
  spellSlots: { current: number; max: number };
  inspiration: number;
  gold: number;
  skills: string[];
  // World
  currentRoomId: string;
  visitedRooms: Set<string>;
  clearedEncounters: Set<string>;
  inventory: (string | null)[];
  questLog: QuestEntry[];
  storyFlags: Set<string>;
  log: LogEntry[];
  logCounter: number;
  // Combat
  combat: CombatState | null;
  // Skill check
  activeSkillCheck: {
    skill: string;
    dc: number;
    onSuccess: () => void;
    onFail: () => void;
  } | null;
  skillCheckResult: {
    skill: string;
    dc: number;
    roll: number;
    modifier: number;
    total: number;
    passed: boolean;
  } | null;
  // Dialogue
  activeNpcId: string | null;
}

type Action =
  | { type: 'CREATE_CHARACTER'; className: ClassName; abilities: Record<AbilityName, number>; name: string }
  | { type: 'ADD_LOG'; text: string; logType: LogEntry['type'] }
  | { type: 'MOVE_ROOM'; roomId: string }
  | { type: 'START_COMBAT'; enemyId: string }
  | { type: 'PLAYER_ATTACK' }
  | { type: 'PLAYER_CAST_SPELL' }
  | { type: 'PLAYER_DODGE' }
  | { type: 'PLAYER_FLEE' }
  | { type: 'ENEMY_TURN' }
  | { type: 'END_COMBAT'; won: boolean }
  | { type: 'TAKE_DAMAGE'; amount: number }
  | { type: 'HEAL'; amount: number }
  | { type: 'ADD_ITEM'; itemId: string }
  | { type: 'USE_ITEM'; slotIndex: number }
  | { type: 'ADD_QUEST'; quest: QuestEntry }
  | { type: 'COMPLETE_QUEST'; questId: string }
  | { type: 'SET_FLAG'; flag: string }
  | { type: 'OPEN_DIALOGUE'; npcId: string }
  | { type: 'CLOSE_DIALOGUE' }
  | { type: 'START_SKILL_CHECK'; skill: string; dc: number; onSuccess: () => void; onFail: () => void }
  | { type: 'RESOLVE_SKILL_CHECK'; roll: number; modifier: number }
  | { type: 'DISMISS_SKILL_CHECK' }
  | { type: 'GAIN_XP'; amount: number }
  | { type: 'GAIN_GOLD'; amount: number }
  | { type: 'REST' }
  | { type: 'NEW_GAME' };

const initialState: GameState = {
  screen: 'creation',
  playerName: '',
  className: null,
  level: 1,
  xp: 0,
  abilities: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
  maxHP: 10,
  currentHP: 10,
  ac: 10,
  proficiencyBonus: 2,
  spellSlots: { current: 0, max: 0 },
  inspiration: 0,
  gold: 0,
  skills: [],
  currentRoomId: 'lobby',
  visitedRooms: new Set(['lobby']),
  clearedEncounters: new Set(),
  inventory: Array(8).fill(null),
  questLog: [{ id: 'main', name: 'Find the Senior Partner', status: 'active' }],
  storyFlags: new Set(),
  log: [],
  logCounter: 0,
  combat: null,
  activeSkillCheck: null,
  skillCheckResult: null,
  activeNpcId: null,
};

function addLog(state: GameState, text: string, logType: LogEntry['type']): GameState {
  const id = state.logCounter + 1;
  return {
    ...state,
    log: [...state.log, { id, text, type: logType }],
    logCounter: id,
  };
}

function addItemToInventory(inventory: (string | null)[], itemId: string): (string | null)[] {
  const slot = inventory.indexOf(null);
  if (slot === -1) return inventory;
  const newInv = [...inventory];
  newInv[slot] = itemId;
  return newInv;
}

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'NEW_GAME':
      return { ...initialState, visitedRooms: new Set(['lobby']), log: [], inventory: Array(8).fill(null), questLog: [{ id: 'main', name: 'Find the Senior Partner', status: 'active' }], storyFlags: new Set(), clearedEncounters: new Set() };

    case 'CREATE_CHARACTER': {
      const classData = CLASSES.find(c => c.name === action.className)!;
      const conMod = getModifier(action.abilities.CON);
      const dexMod = getModifier(action.abilities.DEX);
      const maxHP = calculateHP(classData, conMod, 1);
      const ac = calculateAC(classData, dexMod);
      const inv = Array(8).fill(null) as (string | null)[];
      // Add starting items conceptually (we'll just note them)
      let s = {
        ...state,
        screen: 'adventure' as GameScreen,
        playerName: action.name,
        className: action.className,
        abilities: action.abilities,
        maxHP,
        currentHP: maxHP,
        ac,
        spellSlots: { current: classData.spellSlots, max: classData.spellSlots },
        skills: classData.skills,
        inventory: inv,
        gold: 10,
      };
      s = addLog(s, `${action.name} the ${action.className} enters the Consultancy Beneath.`, 'narrative');
      s = addLog(s, `Level 1 | HP: ${maxHP} | AC: ${ac}`, 'system');
      return s;
    }

    case 'ADD_LOG':
      return addLog(state, action.text, action.logType);

    case 'MOVE_ROOM': {
      const newVisited = new Set(state.visitedRooms);
      newVisited.add(action.roomId);
      const room = ROOMS[action.roomId];
      let s = { ...state, currentRoomId: action.roomId, visitedRooms: newVisited, screen: 'adventure' as GameScreen, combat: null, activeNpcId: null };
      s = addLog(s, `You enter ${room.name}.`, 'narrative');
      return s;
    }

    case 'START_COMBAT': {
      const enemyData = ENEMIES[action.enemyId];
      if (!enemyData) return state;
      let s: GameState = {
        ...state,
        screen: 'combat',
        combat: {
          enemy: { ...enemyData, currentHP: enemyData.maxHP },
          playerTurn: true,
          dodging: false,
        },
      };
      s = addLog(s, `⚔️ ${enemyData.name} appears! (HP: ${enemyData.maxHP}, AC: ${enemyData.ac})`, 'combat');
      return s;
    }

    case 'PLAYER_ATTACK': {
      if (!state.combat || !state.combat.playerTurn) return state;
      const abilityMod = state.className === 'Wizard' ? getModifier(state.abilities.INT)
        : state.className === 'Rogue' || state.className === 'Ranger' ? getModifier(state.abilities.DEX)
        : state.className === 'Bard' ? getModifier(state.abilities.CHA)
        : getModifier(state.abilities.STR);
      const attackRoll = rollDice(20);
      const totalAttack = attackRoll + abilityMod + state.proficiencyBonus;
      let s = addLog(state, `🎲 Attack roll: ${attackRoll} + ${abilityMod + state.proficiencyBonus} = ${totalAttack} vs AC ${state.combat.enemy.ac}`, 'combat');

      if (attackRoll === 20 || (attackRoll !== 1 && totalAttack >= state.combat.enemy.ac)) {
        const classData = CLASSES.find(c => c.name === state.className)!;
        let dmgDie = classData.hitDie === 6 ? 6 : classData.hitDie === 8 ? 8 : classData.hitDie === 10 ? 10 : 6;
        let damage = rollDice(dmgDie) + abilityMod;
        if (attackRoll === 20) { damage += rollDice(dmgDie); s = addLog(s, '💥 CRITICAL HIT!', 'combat'); }
        damage = Math.max(1, damage);
        const newEnemyHP = Math.max(0, s.combat!.enemy.currentHP - damage);
        s = addLog(s, `You deal ${damage} damage! (Enemy HP: ${newEnemyHP}/${s.combat!.enemy.maxHP})`, 'combat');
        s = { ...s, combat: { ...s.combat!, enemy: { ...s.combat!.enemy, currentHP: newEnemyHP }, playerTurn: false, dodging: false } };
        if (newEnemyHP <= 0) {
          s = addLog(s, `☠️ ${s.combat!.enemy.name} is defeated!`, 'combat');
        }
      } else {
        s = addLog(s, attackRoll === 1 ? '💀 Critical miss!' : 'The attack misses.', 'combat');
        s = { ...s, combat: { ...s.combat!, playerTurn: false, dodging: false } };
      }
      return s;
    }

    case 'PLAYER_CAST_SPELL': {
      if (!state.combat || !state.combat.playerTurn || state.spellSlots.current <= 0) return state;
      const intMod = getModifier(state.abilities.INT);
      const wisMod = getModifier(state.abilities.WIS);
      const chaMod = getModifier(state.abilities.CHA);
      const spellMod = state.className === 'Wizard' ? intMod : state.className === 'Cleric' ? wisMod : chaMod;
      const spellAttack = rollDice(20) + spellMod + state.proficiencyBonus;
      let s = { ...state, spellSlots: { ...state.spellSlots, current: state.spellSlots.current - 1 } };
      s = addLog(s, `✨ Spell attack: ${spellAttack} vs AC ${s.combat!.enemy.ac}`, 'combat');

      if (spellAttack >= s.combat!.enemy.ac) {
        const damage = rollDice(8) + rollDice(8) + spellMod;
        const newHP = Math.max(0, s.combat!.enemy.currentHP - Math.max(1, damage));
        s = addLog(s, `🔮 Arcane energy deals ${Math.max(1, damage)} damage! (Enemy HP: ${newHP}/${s.combat!.enemy.maxHP})`, 'combat');
        s = { ...s, combat: { ...s.combat!, enemy: { ...s.combat!.enemy, currentHP: newHP }, playerTurn: false, dodging: false } };
        if (newHP <= 0) {
          s = addLog(s, `☠️ ${s.combat!.enemy.name} is obliterated by arcane power!`, 'combat');
        }
      } else {
        s = addLog(s, 'The spell fizzles against their defenses.', 'combat');
        s = { ...s, combat: { ...s.combat!, playerTurn: false, dodging: false } };
      }
      return s;
    }

    case 'PLAYER_DODGE': {
      if (!state.combat || !state.combat.playerTurn) return state;
      let s = addLog(state, '🛡️ You take the Dodge action. Attacks against you have disadvantage.', 'combat');
      s = { ...s, combat: { ...s.combat!, playerTurn: false, dodging: true } };
      return s;
    }

    case 'PLAYER_FLEE': {
      if (!state.combat) return state;
      const dexCheck = rollDice(20) + getModifier(state.abilities.DEX);
      let s = addLog(state, `🏃 Attempting to flee... DEX check: ${dexCheck} vs DC 12`, 'combat');
      if (dexCheck >= 12) {
        s = addLog(s, 'You successfully disengage!', 'combat');
        s = { ...s, combat: null, screen: 'adventure' };
      } else {
        s = addLog(s, 'You fail to escape!', 'combat');
        s = { ...s, combat: { ...s.combat!, playerTurn: false, dodging: false } };
      }
      return s;
    }

    case 'ENEMY_TURN': {
      if (!state.combat || state.combat.playerTurn || state.combat.enemy.currentHP <= 0) return state;
      const enemy = state.combat.enemy;
      let roll1 = rollDice(20);
      let roll2 = state.combat.dodging ? rollDice(20) : roll1;
      const attackRoll = state.combat.dodging ? Math.min(roll1, roll2) : roll1;
      const totalAttack = attackRoll + enemy.attackBonus;
      let s = addLog(state, `${enemy.icon} ${enemy.name} ${enemy.attackDesc}! Roll: ${totalAttack} vs AC ${state.ac}${state.combat.dodging ? ' (disadvantage)' : ''}`, 'combat');

      if (attackRoll !== 1 && (attackRoll === 20 || totalAttack >= state.ac)) {
        let damage = rollDice(enemy.damageDie) + enemy.damageBonus;
        if (attackRoll === 20) damage += rollDice(enemy.damageDie);
        const newHP = Math.max(0, state.currentHP - damage);
        s = addLog(s, `You take ${damage} damage! (HP: ${newHP}/${state.maxHP})`, 'combat');
        s = { ...s, currentHP: newHP, combat: { ...s.combat!, playerTurn: true, dodging: false } };
        if (newHP <= 0) {
          s = addLog(s, '💀 You have fallen...', 'combat');
        }
      } else {
        s = addLog(s, 'The attack misses!', 'combat');
        s = { ...s, combat: { ...s.combat!, playerTurn: true, dodging: false } };
      }
      return s;
    }

    case 'END_COMBAT': {
      if (!state.combat) return state;
      const cleared = new Set(state.clearedEncounters);
      cleared.add(state.currentRoomId);
      let s: GameState = { ...state, screen: 'adventure', clearedEncounters: cleared };
      if (action.won) {
        const enemy = state.combat.enemy;
        s = addLog(s, `Victory! Gained ${enemy.xp} XP.`, 'system');
        s = { ...s, xp: s.xp + enemy.xp };
        if (enemy.loot && ITEMS[enemy.loot]) {
          s = addLog(s, `Found: ${ITEMS[enemy.loot].name}`, 'loot');
          s = { ...s, inventory: addItemToInventory(s.inventory, enemy.loot) };
        }
        // Level up check
        const xpThreshold = s.level * 100;
        if (s.xp >= xpThreshold) {
          s = { ...s, level: s.level + 1, xp: s.xp - xpThreshold, proficiencyBonus: s.level >= 4 ? 3 : 2 };
          const classData = CLASSES.find(c => c.name === s.className)!;
          const conMod = getModifier(s.abilities.CON);
          const newMaxHP = calculateHP(classData, conMod, s.level);
          s = { ...s, maxHP: newMaxHP, currentHP: Math.min(s.currentHP + rollDice(classData.hitDie) + conMod, newMaxHP) };
          s = addLog(s, `⬆️ LEVEL UP! You are now level ${s.level}!`, 'system');
        }
      }
      s = { ...s, combat: null };
      return s;
    }

    case 'TAKE_DAMAGE': {
      const newHP = Math.max(0, state.currentHP - action.amount);
      return { ...state, currentHP: newHP };
    }

    case 'HEAL': {
      const newHP = Math.min(state.maxHP, state.currentHP + action.amount);
      let s = { ...state, currentHP: newHP };
      s = addLog(s, `💚 Healed for ${action.amount} HP. (HP: ${newHP}/${state.maxHP})`, 'system');
      return s;
    }

    case 'ADD_ITEM': {
      const inv = addItemToInventory(state.inventory, action.itemId);
      const item = ITEMS[action.itemId];
      let s = { ...state, inventory: inv };
      if (item) s = addLog(s, `Found: ${item.icon} ${item.name}`, 'loot');
      return s;
    }

    case 'USE_ITEM': {
      const itemId = state.inventory[action.slotIndex];
      if (!itemId) return state;
      const newInv = [...state.inventory];
      newInv[action.slotIndex] = null;
      let s = { ...state, inventory: newInv };

      if (itemId === 'healing_potion' || itemId === 'cafeteria_token') {
        const heal = rollDice(4) + rollDice(4) + 2;
        const newHP = Math.min(s.maxHP, s.currentHP + heal);
        s = { ...s, currentHP: newHP };
        s = addLog(s, `💚 Used ${ITEMS[itemId].name}. Healed ${heal} HP. (HP: ${newHP}/${s.maxHP})`, 'system');
      }
      return s;
    }

    case 'ADD_QUEST':
      return { ...state, questLog: [...state.questLog, action.quest] };

    case 'COMPLETE_QUEST':
      return { ...state, questLog: state.questLog.map(q => q.id === action.questId ? { ...q, status: 'completed' as const } : q) };

    case 'SET_FLAG': {
      const flags = new Set(state.storyFlags);
      flags.add(action.flag);
      return { ...state, storyFlags: flags };
    }

    case 'OPEN_DIALOGUE':
      return { ...state, screen: 'dialogue', activeNpcId: action.npcId };

    case 'CLOSE_DIALOGUE':
      return { ...state, screen: 'adventure', activeNpcId: null };

    case 'START_SKILL_CHECK':
      return { ...state, activeSkillCheck: { skill: action.skill, dc: action.dc, onSuccess: action.onSuccess, onFail: action.onFail }, skillCheckResult: null };

    case 'RESOLVE_SKILL_CHECK': {
      if (!state.activeSkillCheck) return state;
      const { skill, dc } = state.activeSkillCheck;
      const total = action.roll + action.modifier;
      const passed = total >= dc;
      let s: GameState = { ...state, skillCheckResult: { skill, dc, roll: action.roll, modifier: action.modifier, total, passed } };
      s = addLog(s, `🎲 ${skill} check: ${action.roll} + ${action.modifier} = ${total} vs DC ${dc} — ${passed ? '✅ SUCCESS' : '❌ FAILURE'}`, 'skill');
      return s;
    }

    case 'DISMISS_SKILL_CHECK': {
      const result = state.skillCheckResult;
      const check = state.activeSkillCheck;
      let s = { ...state, activeSkillCheck: null, skillCheckResult: null };
      if (result && check) {
        if (result.passed) check.onSuccess();
        else check.onFail();
      }
      return s;
    }

    case 'GAIN_XP':
      return { ...state, xp: state.xp + action.amount };

    case 'GAIN_GOLD':
      return { ...state, gold: state.gold + action.amount };

    case 'REST': {
      const classData = CLASSES.find(c => c.name === state.className);
      const heal = classData ? rollDice(classData.hitDie) + getModifier(state.abilities.CON) : 4;
      const newHP = Math.min(state.maxHP, state.currentHP + Math.max(1, heal));
      const newSlots = classData ? { current: classData.spellSlots, max: classData.spellSlots } : state.spellSlots;
      let s = { ...state, currentHP: newHP, spellSlots: newSlots };
      s = addLog(s, `🛏️ You rest. Healed ${newHP - state.currentHP} HP. Spell slots restored.`, 'system');
      return s;
    }

    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<Action>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
