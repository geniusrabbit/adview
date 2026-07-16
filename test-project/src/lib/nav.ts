export type NavItem = {
  href: string;
  label: string;
  description: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/',
    label: 'Overview',
    description: 'Provider + Unit basics',
  },
  {
    href: '/sources',
    label: 'Declarative sources',
    description: 'Config.sources & drivers',
  },
  {
    href: '/mix',
    label: 'Mix sources',
    description: 'Blend ads from many backends',
  },
  {
    href: '/selection',
    label: 'Conditional selection',
    description: 'Pick by tags or source name',
  },
  {
    href: '/waterfall',
    label: 'Waterfall fill',
    description: 'Top-up until limit',
  },
  {
    href: '/custom-driver',
    label: 'Custom adapter',
    description: 'Write your own DataLoader',
  },
  {
    href: '/custom-templates',
    label: 'Custom templates',
    description: 'Multi-template Unit + *',
  },
  {
    href: '/unit-props',
    label: 'Unit props',
    description: 'query · wrapper · filters',
  },
  {
    href: '/adinfo',
    label: 'Ad info',
    description: 'adsourceInfo · adinfo',
  },
  {
    href: '/render',
    label: 'Custom render',
    description: 'Render-prop control',
  },
  {
    href: '/templates',
    label: 'Built-in templates',
    description: 'Banner & Native',
  },
  {
    href: '/tracking',
    label: 'Tracking',
    description: 'Impressions & clicks',
  },
];
