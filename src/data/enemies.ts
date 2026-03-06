export interface Enemy {
  id: string;
  name: string;
  maxHP: number;
  ac: number;
  attackBonus: number;
  damage: string;
  damageDie: number;
  damageBonus: number;
  attackDesc: string;
  xp: number;
  loot?: string;
  icon: string;
}

export const ENEMIES: Record<string, Enemy> = {
  compliance_officer: {
    id: 'compliance_officer',
    name: 'The Compliance Officer',
    maxHP: 18,
    ac: 12,
    attackBonus: 4,
    damage: '1d6+2',
    damageDie: 6,
    damageBonus: 2,
    attackDesc: 'swings a heavy binder full of violations',
    xp: 50,
    loot: 'memo_of_binding',
    icon: '📋',
  },
  shadow_intern: {
    id: 'shadow_intern',
    name: 'Shadow Intern',
    maxHP: 8,
    ac: 10,
    attackBonus: 2,
    damage: '1d4+1',
    damageDie: 4,
    damageBonus: 1,
    attackDesc: 'throws a scalding coffee cup',
    xp: 25,
    loot: 'cafeteria_token',
    icon: '👤',
  },
  meeting_golem: {
    id: 'meeting_golem',
    name: 'Meeting Room Golem',
    maxHP: 30,
    ac: 15,
    attackBonus: 6,
    damage: '1d10+3',
    damageDie: 10,
    damageBonus: 3,
    attackDesc: 'slams with a whiteboard eraser the size of a tombstone',
    xp: 100,
    loot: 'skeleton_key_card',
    icon: '🗿',
  },
  haunted_printer: {
    id: 'haunted_printer',
    name: 'Haunted Printer',
    maxHP: 14,
    ac: 11,
    attackBonus: 3,
    damage: '1d6+1',
    damageDie: 6,
    damageBonus: 1,
    attackDesc: 'sprays searing toner and jams your fingers',
    xp: 40,
    loot: 'redacted_document',
    icon: '🖨️',
  },
  senior_partner: {
    id: 'senior_partner',
    name: 'The Senior Partner',
    maxHP: 45,
    ac: 17,
    attackBonus: 8,
    damage: '2d8+4',
    damageDie: 8,
    damageBonus: 4,
    attackDesc: 'unleashes a wave of corporate restructuring energy',
    xp: 250,
    loot: 'golden_severance',
    icon: '👔',
  },
};
