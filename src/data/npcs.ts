export interface DialogueOption {
  text: string;
  skillCheck?: { skill: string; dc: number };
  response: string;
  flag?: string;
  giveItem?: string;
}

export interface NPC {
  id: string;
  name: string;
  title: string;
  icon: string;
  greeting: string;
  dialogueOptions: DialogueOption[];
}

export const NPCS: Record<string, NPC> = {
  sysadmin: {
    id: 'sysadmin',
    name: 'Gerald',
    title: 'Basement Systems Administrator',
    icon: '🧑‍💻',
    greeting: 'You shouldn\'t be down here. Nobody should. The servers remember things the company would rather forget.',
    dialogueOptions: [
      {
        text: 'What is this place, really?',
        response: 'A consultancy. Or it was. Now it\'s more like a digestive system. It takes people in, processes them, and what comes out... well. You\'ve seen the interns.',
        flag: 'knows_truth',
      },
      {
        text: '[Persuasion] Help me find the Senior Partner.',
        skillCheck: { skill: 'Persuasion', dc: 14 },
        response: 'Fine. Take this. The elevator to the executive floor requires a Skeleton Key Card. The HR Director has one, but she won\'t part with it willingly.',
        giveItem: 'scroll_of_audit',
      },
      {
        text: '[Insight] You seem afraid. What are you hiding?',
        skillCheck: { skill: 'Insight', dc: 12 },
        response: 'I\'ve been here for seventeen years. Or seventeen days. Time works differently below the third sub-basement. I maintain the servers because if they stop, the building stops existing.',
        flag: 'gerald_secret',
      },
      {
        text: 'Goodbye.',
        response: 'Be careful. The further down you go, the less the Consultancy remembers it was ever a building.',
      },
    ],
  },
  hr_director: {
    id: 'hr_director',
    name: 'Director Voss',
    title: 'HR Director, The Consultancy',
    icon: '👩‍💼',
    greeting: 'Ah, another candidate. Your performance review is... concerning. But we can discuss your future here. Everyone has a future here. Everyone.',
    dialogueOptions: [
      {
        text: 'I need the key to the executive floor.',
        response: 'The executive floor? That requires clearance level Omega. You\'d need to demonstrate... alignment with our corporate values. Which is to say, compliance.',
      },
      {
        text: '[Persuasion] I\'m here for the Senior Partner. It\'s urgent.',
        skillCheck: { skill: 'Persuasion', dc: 16 },
        response: 'Well. If the Partner is expecting you... I suppose I can make an exception. Take the key card. But know this: no one who enters that office leaves the same.',
        giveItem: 'skeleton_key_card',
      },
      {
        text: '[Intimidation] Give me the key or I\'ll file a formal complaint.',
        skillCheck: { skill: 'Intimidation', dc: 15 },
        response: 'A... a complaint? With OSHA? Fine. Take it. Take it and leave my office. Some threats are worse than any monster in this building.',
        giveItem: 'skeleton_key_card',
      },
      {
        text: 'What happened to the previous employees?',
        response: 'They were... restructured. The Consultancy has a 100% retention rate. Think about what that means. Really think.',
        flag: 'knows_restructuring',
      },
    ],
  },
};
