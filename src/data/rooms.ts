export type SkillName = 
  | 'Perception' | 'Investigation' | 'Stealth' | 'Arcana' 
  | 'History' | 'Insight' | 'Persuasion' | 'Athletics'
  | 'Deception' | 'Intimidation' | 'Medicine' | 'Nature'
  | 'Performance' | 'Survival';

export interface RoomConnection {
  direction: string;
  roomId: string;
  locked?: boolean;
  requiredItem?: string;
}

export interface RoomEncounter {
  type: 'combat' | 'npc' | 'skillcheck' | 'loot' | 'lore';
  enemyId?: string;
  npcId?: string;
  skill?: SkillName;
  dc?: number;
  lootId?: string;
  loreText?: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  connections: RoomConnection[];
  encounter?: RoomEncounter;
  visited?: boolean;
}

export const ROOMS: Record<string, Room> = {
  lobby: {
    id: 'lobby',
    name: 'The Lobby',
    description: 'The fluorescent lights hum at a frequency that isn\'t quite right. The reception desk is unmanned. A wilted plant watches you from the corner. The elevator only goes down.',
    x: 3, y: 0,
    connections: [
      { direction: 'South', roomId: 'corridor_a' },
    ],
    encounter: { type: 'lore', loreText: 'A plaque reads: "Welcome to the Consultancy. Your compliance is appreciated."' },
  },
  corridor_a: {
    id: 'corridor_a',
    name: 'Corridor A — Fluorescent Hell',
    description: 'An impossibly long corridor. The ceiling tiles are stained with something that might be coffee. Doors line both sides, all identical.',
    x: 3, y: 1,
    connections: [
      { direction: 'North', roomId: 'lobby' },
      { direction: 'West', roomId: 'break_room' },
      { direction: 'East', roomId: 'archive' },
      { direction: 'South', roomId: 'meeting_room' },
    ],
    encounter: { type: 'combat', enemyId: 'shadow_intern' },
  },
  break_room: {
    id: 'break_room',
    name: 'The Break Room',
    description: 'A microwave hums with no food inside. The fridge contains things that were once food. A motivational poster says "HANG IN THERE" but the cat is missing.',
    x: 2, y: 1,
    connections: [
      { direction: 'East', roomId: 'corridor_a' },
    ],
    encounter: { type: 'loot', lootId: 'healing_potion' },
  },
  archive: {
    id: 'archive',
    name: 'Records Archive',
    description: 'Floor-to-ceiling filing cabinets stretch into darkness. The air smells of old paper and regret. Some drawers are labeled with names you almost recognize.',
    x: 4, y: 1,
    connections: [
      { direction: 'West', roomId: 'corridor_a' },
      { direction: 'South', roomId: 'server_room' },
    ],
    encounter: { type: 'skillcheck', skill: 'Investigation', dc: 13, lootId: 'redacted_document' },
  },
  meeting_room: {
    id: 'meeting_room',
    name: 'Conference Room B',
    description: 'An oval table surrounded by ergonomic chairs that seem to lean toward you. A whiteboard is covered in flowcharts that loop back on themselves infinitely.',
    x: 3, y: 2,
    connections: [
      { direction: 'North', roomId: 'corridor_a' },
      { direction: 'South', roomId: 'corridor_b' },
    ],
    encounter: { type: 'combat', enemyId: 'meeting_golem' },
  },
  server_room: {
    id: 'server_room',
    name: 'Server Room',
    description: 'Racks of blinking servers fill the cold room. The hum is deafening. Between the racks, something moves — too fast to see, too slow to be machinery.',
    x: 4, y: 2,
    connections: [
      { direction: 'North', roomId: 'archive' },
      { direction: 'West', roomId: 'corridor_b' },
    ],
    encounter: { type: 'npc', npcId: 'sysadmin' },
  },
  corridor_b: {
    id: 'corridor_b',
    name: 'Corridor B — The Deep Floor',
    description: 'The lights here are dimmer. The carpet pattern seems to shift when you\'re not looking directly at it. A printer screams in the distance.',
    x: 3, y: 3,
    connections: [
      { direction: 'North', roomId: 'meeting_room' },
      { direction: 'East', roomId: 'server_room' },
      { direction: 'West', roomId: 'print_room' },
      { direction: 'South', roomId: 'hr_office' },
    ],
    encounter: { type: 'combat', enemyId: 'compliance_officer' },
  },
  print_room: {
    id: 'print_room',
    name: 'Print Room',
    description: 'Paper covers every surface. The printers are alive and they are angry. One prints a page that says only your name, over and over.',
    x: 2, y: 3,
    connections: [
      { direction: 'East', roomId: 'corridor_b' },
    ],
    encounter: { type: 'combat', enemyId: 'haunted_printer' },
  },
  hr_office: {
    id: 'hr_office',
    name: 'HR Director\'s Office',
    description: 'A vast office with a desk the size of a small continent. Family photos on the desk show the same face at different ages — but it\'s your face.',
    x: 3, y: 4,
    connections: [
      { direction: 'North', roomId: 'corridor_b' },
      { direction: 'South', roomId: 'ceo_suite', locked: true, requiredItem: 'skeleton_key_card' },
    ],
    encounter: { type: 'npc', npcId: 'hr_director' },
  },
  ceo_suite: {
    id: 'ceo_suite',
    name: 'The Senior Partner\'s Suite',
    description: 'The final room. Floor-to-ceiling windows show a city that doesn\'t exist. The Senior Partner sits behind a desk made of compressed resignation letters.',
    x: 3, y: 5,
    connections: [
      { direction: 'North', roomId: 'hr_office' },
    ],
    encounter: { type: 'combat', enemyId: 'senior_partner' },
  },
};
