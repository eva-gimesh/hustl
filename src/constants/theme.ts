/**
 * HUSTL Brand Tokens and System Constants
 * 
 * Strict palette:
 * Primary background: #080B09
 * Secondary background: #101510
 * Card background: #141B15
 * Primary accent green: #B6FF4A
 * Secondary green: #7CCB37
 * Primary text: #F4F7F1
 * Secondary text: #A0AAA0
 * Borders: #273128
 */

export const THEME = {
  colors: {
    bgPrimary: '#080B09',
    bgSecondary: '#101510',
    bgCard: '#141B15',
    accentPrimary: '#B6FF4A',
    accentSecondary: '#7CCB37',
    textPrimary: '#F4F7F1',
    textSecondary: '#A0AAA0',
    border: '#273128',
  },
  fonts: {
    heading: 'Space Grotesk, sans-serif',
    body: 'Inter, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
} as const;

export interface NavItem {
  label: string;
  href: string;
  badge?: string;
  description: string;
}

export const MAIN_NAV: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    description: 'The Opportunity Ecosystem & Launchpad',
  },
  {
    label: 'Freelance',
    href: '/freelance',
    description: 'Discover paid projects & monetize your skillset',
  },
  {
    label: 'Recruit',
    href: '/recruit',
    description: 'Scout top student engineers, designers & builders',
  },
  {
    label: 'TeamUp',
    href: '/teamup',
    description: 'Find co-founders & build high-impact squads',
  },
  {
    label: 'Explore',
    href: '/explore',
    description: 'Unified radar across all opportunities',
  },
];

export interface PillarMeta {
  id: 'freelance' | 'recruit' | 'teamup';
  title: string;
  tagline: string;
  description: string;
  audience: string;
  href: string;
  features: string[];
  metric: string;
  metricLabel: string;
}

export const PILLARS: PillarMeta[] = [
  {
    id: 'freelance',
    title: 'FREELANCE',
    tagline: 'MAKE YOUR SKILLS COUNT.',
    description: 'Discover projects, showcase your expertise and turn your abilities into real opportunities.',
    audience: 'Students, autonomous creators, specialized freelancers',
    href: '/freelance',
    features: [
      'Set your own budget — from ₹500 micro-gigs upwards',
      'Clear scopes and milestone-based briefs',
      'Direct portfolio proof verification',
    ],
    metric: '₹500+',
    metricLabel: 'Starting Budgets for Student Gigs',
  },
  {
    id: 'recruit',
    title: 'RECRUIT',
    tagline: 'FIND THE RIGHT PEOPLE.',
    description: 'Discover emerging talent and connect with students who have the skills and ambition your business needs.',
    audience: 'Early-stage founders, startup CTOs, forward-thinking enterprises',
    href: '/recruit',
    features: [
      'Proof-of-work profiles with verified code repositories',
      'Direct 48-hour hiring sprint pipeline',
      'Integrated contract-to-hire workflows',
    ],
    metric: '48h',
    metricLabel: 'Average Time to First Interview',
  },
  {
    id: 'teamup',
    title: 'TEAMUP',
    tagline: 'BUILD SOMETHING TOGETHER.',
    description: 'Meet ambitious people, find complementary skills and bring your ideas to life with the right team.',
    audience: 'Aspiring founders, hackathon builders, ambitious innovators',
    href: '/teamup',
    features: [
      'Skill-gap matching algorithms',
      'Standardized equity split & sweat agreements',
      'Incubator and demo day fast-tracks',
    ],
    metric: '320+',
    metricLabel: 'Active Ventures Formed',
  },
];
