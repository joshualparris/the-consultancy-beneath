export interface Item {
  id: string;
  name: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  description: string;
  effect?: string;
}

export const ITEMS: Record<string, Item> = {
  broken_lanyard: {
    id: 'broken_lanyard',
    name: 'Broken Lanyard',
    icon: '🏷️',
    rarity: 'common',
    description: 'A snapped ID lanyard. The photo has been scratched off.',
    effect: '+1 to Deception checks',
  },
  memo_of_binding: {
    id: 'memo_of_binding',
    name: 'Memo of Binding',
    icon: '📜',
    rarity: 'uncommon',
    description: 'An interdepartmental memo that compels the reader to comply.',
    effect: 'Can be used to auto-pass one Persuasion check',
  },
  cafeteria_token: {
    id: 'cafeteria_token',
    name: 'Cafeteria Token',
    icon: '🪙',
    rarity: 'common',
    description: 'A brass token accepted in the basement cafeteria.',
    effect: 'Heals 1d4 HP when used',
  },
  redacted_document: {
    id: 'redacted_document',
    name: 'Redacted Document',
    icon: '█',
    rarity: 'rare',
    description: 'A heavily redacted file. Some truths bleed through the black ink.',
    effect: '+2 to Investigation checks',
  },
  skeleton_key_card: {
    id: 'skeleton_key_card',
    name: 'Skeleton Key Card',
    icon: '🔑',
    rarity: 'rare',
    description: 'A master key card that opens any door in the Consultancy.',
    effect: 'Opens locked rooms',
  },
  golden_severance: {
    id: 'golden_severance',
    name: 'Golden Severance Package',
    icon: '💰',
    rarity: 'legendary',
    description: 'A shimmering envelope that promises freedom — at a cost.',
    effect: 'Victory condition',
  },
  healing_potion: {
    id: 'healing_potion',
    name: 'Healing Potion',
    icon: '🧪',
    rarity: 'common',
    description: 'A vial of red liquid. Tastes like copper and hope.',
    effect: 'Heals 2d4+2 HP',
  },
  scroll_of_audit: {
    id: 'scroll_of_audit',
    name: 'Scroll of Audit Trail',
    icon: '📋',
    rarity: 'uncommon',
    description: 'A scroll that reveals hidden financial irregularities.',
    effect: '+3 to Investigation in financial rooms',
  },
};

export const RARITY_COLORS: Record<Item['rarity'], string> = {
  common: 'text-muted-foreground',
  uncommon: 'text-primary',
  rare: 'text-arcane',
  legendary: 'text-gold',
};
