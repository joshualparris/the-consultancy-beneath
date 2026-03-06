export type ClassName = 'Wizard' | 'Fighter' | 'Rogue' | 'Cleric' | 'Ranger' | 'Bard';

export type AbilityName = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

export interface ClassData {
  name: ClassName;
  hitDie: number;
  primaryAbility: AbilityName;
  savingThrows: AbilityName[];
  baseAC: number;
  armorDesc: string;
  spellcaster: boolean;
  spellSlots: number;
  description: string;
  icon: string;
  skills: string[];
  startingItems: string[];
}

export const CLASSES: ClassData[] = [
  {
    name: 'Wizard',
    hitDie: 6,
    primaryAbility: 'INT',
    savingThrows: ['INT', 'WIS'],
    baseAC: 10,
    armorDesc: 'No armor',
    spellcaster: true,
    spellSlots: 4,
    description: 'A scholarly practitioner of arcane formulae, wielding devastating spells.',
    icon: '🔮',
    skills: ['Arcana', 'History', 'Investigation'],
    startingItems: ['Spellbook', 'Component Pouch'],
  },
  {
    name: 'Fighter',
    hitDie: 10,
    primaryAbility: 'STR',
    savingThrows: ['STR', 'CON'],
    baseAC: 16,
    armorDesc: 'Chain mail',
    spellcaster: false,
    spellSlots: 0,
    description: 'A master of martial combat, trained with weapons and armor.',
    icon: '⚔️',
    skills: ['Athletics', 'Intimidation', 'Perception'],
    startingItems: ['Longsword', 'Shield', 'Chain Mail'],
  },
  {
    name: 'Rogue',
    hitDie: 8,
    primaryAbility: 'DEX',
    savingThrows: ['DEX', 'INT'],
    baseAC: 12,
    armorDesc: 'Leather armor',
    spellcaster: false,
    spellSlots: 0,
    description: 'A scoundrel who uses stealth and trickery to overcome obstacles.',
    icon: '🗡️',
    skills: ['Stealth', 'Perception', 'Investigation', 'Deception'],
    startingItems: ['Shortsword', 'Thieves\' Tools', 'Leather Armor'],
  },
  {
    name: 'Cleric',
    hitDie: 8,
    primaryAbility: 'WIS',
    savingThrows: ['WIS', 'CHA'],
    baseAC: 16,
    armorDesc: 'Chain mail + shield',
    spellcaster: true,
    spellSlots: 3,
    description: 'A priestly champion who wields divine magic in service of a higher power.',
    icon: '✝️',
    skills: ['Insight', 'Medicine', 'Persuasion'],
    startingItems: ['Mace', 'Shield', 'Holy Symbol'],
  },
  {
    name: 'Ranger',
    hitDie: 10,
    primaryAbility: 'DEX',
    savingThrows: ['STR', 'DEX'],
    baseAC: 14,
    armorDesc: 'Scale mail',
    spellcaster: true,
    spellSlots: 2,
    description: 'A warrior of the wilderness, skilled in tracking and nature magic.',
    icon: '🏹',
    skills: ['Perception', 'Stealth', 'Survival', 'Nature'],
    startingItems: ['Longbow', 'Quiver (20)', 'Scale Mail'],
  },
  {
    name: 'Bard',
    hitDie: 8,
    primaryAbility: 'CHA',
    savingThrows: ['DEX', 'CHA'],
    baseAC: 12,
    armorDesc: 'Leather armor',
    spellcaster: true,
    spellSlots: 3,
    description: 'An inspiring magician whose power echoes the music of creation.',
    icon: '🎵',
    skills: ['Persuasion', 'Performance', 'Deception', 'Insight'],
    startingItems: ['Rapier', 'Lute', 'Leather Armor'],
  },
];

export const ABILITY_NAMES: AbilityName[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function rollDice(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function roll4d6DropLowest(): { rolls: number[]; total: number } {
  const rolls = [rollDice(6), rollDice(6), rollDice(6), rollDice(6)];
  const sorted = [...rolls].sort((a, b) => b - a);
  const total = sorted[0] + sorted[1] + sorted[2];
  return { rolls, total };
}

export function calculateHP(classData: ClassData, conModifier: number, level: number): number {
  // Level 1: max hit die + CON mod. Higher levels: average + CON mod per level
  const lvl1HP = classData.hitDie + conModifier;
  const perLevelHP = Math.floor(classData.hitDie / 2) + 1 + conModifier;
  return Math.max(1, lvl1HP + perLevelHP * (level - 1));
}

export function calculateAC(classData: ClassData, dexModifier: number): number {
  if (classData.name === 'Wizard' || classData.name === 'Bard' || classData.name === 'Rogue') {
    return classData.baseAC + dexModifier;
  }
  return classData.baseAC; // Heavy armor doesn't use DEX
}
