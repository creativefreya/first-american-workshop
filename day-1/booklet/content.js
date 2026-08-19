/**
 * Day 1 booklet content — the words. `build.mjs` turns this plus the captured
 * slide images into `day-1-booklet.html`, which renders to PDF.
 *
 * Housekeeping copy is transcribed from the FigJam board (Goals + Agenda,
 * Workshop activity tips, How to get help). Activity steps are Freya's, verbatim
 * where they were written as instructions to the room.
 */

export const meta = {
  client: 'First American',
  course: 'Becoming an Augmented Designer',
  day: 'Day 1 of 2',
  subtitle: 'Your product brain, your skills, and the tools you plug into them',
  facilitators: 'Freya Stockman · Alex Zinoviev',
};

export const goals = [
  'Learn how to use a product-brain',
  'Learn how to make skills and use skills',
  'Learn how to pull context from tools into your product-brain',
];

export const agenda = {
  columns: ['PDT', 'HST', 'AU', 'Topic', 'Owner'],
  rows: [
    ['12:00pm', '9:00am', '5:00am', 'Kick-off', 'Freya / Alex'],
    ['12:30pm', '9:30am', '5:30am', 'Why AI fluency is a good thing', 'Freya'],
    ['1:00pm', '10:00am', '6:00am', 'Product AI Brain', 'Freya / Alex'],
    ['2:00pm', '11:00am', '7:00am', '15min Break', '—'],
    ['2:15pm', '11:15am', '7:15am', 'Skills and automations', 'Freya / Alex'],
    ['3:30pm', '12:30pm', '8:30am', 'Q&A, retro', 'Freya / Alex'],
  ],
};

export const activityTips = {
  title: 'Workshop activity tips',
  standfirst: 'Implement the lessons bit by bit',
  spotTitle: 'How to spot workshop activities',
  spotBody:
    'Anything on a blue <strong>Prompt for Cursor</strong> sticky is yours to copy. Select the text, copy it, and paste it straight into the Cursor chat — you do not have to retype it or reword it.',
  spotExample: {
    label: 'Prompt for Cursor',
    lines: [
      'Start local host so I can see this slide deck',
      '',
      'File name:',
      'slide-deck-template/example-first-american.html#3',
    ],
  },
  stuckTitle: 'If you get stuck — helpful prompts',
  stuckPrompts: [
    "Explain to me like I'm an absolute beginner",
    'Break it down for me with step by step instructions',
  ],
};

export const help = {
  title: 'How to get help if you get stuck',
  duringTitle: 'During workshop',
  during: [
    "Paste a screenshot showing what you're stuck on.",
    'Use a sticky note to describe what you need help with.',
    'A helper will try to resolve it by writing sticky note responses.',
    "If you need hands-on support — you'll be directed to join a Breakout room.",
  ],
  blocks: [
    {
      title: '15 minute break (optional)',
      body:
        'Freya and Alex will stay back on the 15 minute call to help anyone who got stuck during any activity.',
    },
    {
      title: 'After workshops (optional)',
      body:
        'Freya will stay back after the workshop is finished to help attendees finish setup who are motivated to stay back.',
    },
    {
      title: 'If you get lost on the board',
      body:
        'Find us via the pin. Click <strong>(F)</strong> in the toolbar to spotlight Freya and follow her cursor.',
    },
  ],
};

/**
 * Chapter for each Day 1 slide, keyed by the first slide index of the chapter.
 * Matches the agenda topics so the booklet header answers "where are we?".
 */
export const chapters = [
  { from: 0, name: 'Kick-off' },
  { from: 5, name: 'Why AI fluency is a good thing' },
  { from: 19, name: 'Product AI Brain' },
  { from: 33, name: 'Skills and automations' },
];

/**
 * The six hands-on activities, in the order they run. `after` is the Day 1 slide
 * index (0-based, as captured) the activity page follows — the deck's own
 * Activity title cards are at 31 (Explore the AI Brain), 40 (Create a SKILL.md)
 * and 51 (Build automations), so those three land immediately behind their card.
 *
 * Copy here is Freya's, as written. Don't add example prompts, "helpful" extra
 * steps or reworded goals — an activity page that says more than the brief said
 * sends the room off doing something nobody planned for.
 */
export const activities = [
  {
    n: 1,
    after: 31,
    intro:
      'Ask Cursor one question about the repo and share what you learn in a sticky note with everyone else.',
    title: 'Ask Cursor one question about the repo',
    examplesTitle: 'Example questions',
    examples: [
      'What the difference is between skills and skill chains?',
      'Why githooks / gitignore / .cursor folders are invisible and how to reveal them?',
      'How could I use this for each project?',
    ],
  },
  {
    // Runs straight after activity 1 — same `after`, so it lands on the next
    // page rather than waiting for the skills chapter.
    n: 2,
    after: 31,
    title: 'Create a slide deck with a template and skill',
    intro:
      'Create a slide deck with a template and skill. Then paste a screenshot of your new slide deck here for the group to see.',
    steps: [
      'Ask Cursor to start local host so you can see this slide deck template: <code>slide-deck-template/example-first-american.html#3</code>',
      'Then ask Cursor to make a copy of it about a recent project of yours — provide context about the project using this skill: <code>Use skill: 51-comms-slide-deck</code>',
    ],
  },
  {
    n: 3,
    after: 40,
    title: 'Create a Skill',
    goal:
      'Turn a design or research process you do on most projects into a repeatable prompt (Skill).',
    goalRef: '04-setup-skill-builder',
    steps: [
      'In Cursor, open Chat.',
      'Describe the common research or design tasks you do on projects.',
      'Ask Cursor to use a skill from the repo “skill-builder” to help you brainstorm Skills — and also flag what existing Skills may already cover part or all of that process.',
    ],
  },
  {
    // Two activities on one page: find (or make) the product folder, then give
    // Cursor the live line into Confluence that fills it. Runs after "Build
    // automations" (slide 51) and directly ahead of the automation itself, so
    // the folder and the connection both exist before the automation needs them.
    n: 4,
    after: 51,
    title: 'Add context from Confluence to your Product Folder',
    goal:
      'Pull fresh context from Confluence into your product / initiative folder so Cursor can easily access it across your design thinking to support decision making.',
    stepGroups: [
      {
        title: 'Steps — Part 1',
        steps: [
          'In your <code>product-brain</code> folder, look for a product you have worked on.',
          'If you don’t see one, ask Cursor to make a new folder and give it context about it (eg. <em>This product is a Mobile app and an initiative I’m working on is uplifting onboarding</em>).',
        ],
      },
      {
        title: 'Steps — Part 2',
        subtitle: 'Connect Confluence with Atlassian MCP',
        steps: [
          'In Cursor, open Customise.',
          'Search Atlassian.',
          'Add your project.',
          'Click “try in chat”.',
          'Ask Cursor to look for documents on Confluence related to a project you’re working on. <strong>What does it find?</strong>',
        ],
      },
    ],
  },
  {
    n: 5,
    after: 51,
    title: 'Create Confluence context pull automation',
    goal:
      "Pull fresh context from Confluence into your product / initiative folder every day so you're always synced with Confluence updates.",
    stepsTitle: 'Steps — Part 1',
    steps: [
      'In Cursor, open Automations.',
      'Rename “Untitled” to “Confluence context pull”.',
      'Select your repo.',
      'Add daily trigger schedule.',
      'Add Atlassian MCP.',
      'Update agent instructions using script below.',
    ],
    script: `I want to pull context from Confluence about the project I'm working on into my repo every day so I don't have to do it manually.

Look for any documents in Confluence related to this product-context folder [insert folder name] and create new md files to sync to each that are dated with a short summary title.

Additionally, if you notice any amendments to existing Confluence documents and there is a discrepancy between my md file connected to that Confluence doc, apply the amendment to my existing md file.

All files should document a URL or ID to the original Confluence doc so I can trace it outside of this repo.

Don't modify any other files outside the Confluence folder.`,
  },
];
