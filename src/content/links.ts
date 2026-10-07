/**
 * Every product URL on the page lives here, and only here.
 * An empty `url` renders a disabled "Coming soon" card with no href.
 */
export type ProductLink = {
  id: 'workspace' | 'mobile' | 'hub';
  product: string;
  label: string;
  url: string;
  status: 'live' | 'coming-soon';
};

export const links: ProductLink[] = [
  {
    id: 'mobile',
    product: 'Mobile app',
    label: 'Try the app (test network)',
    url: 'https://tdat10052499.github.io/Unihackfest-2026/',
    status: 'live',
  },
  {
    id: 'workspace',
    product: 'Workspace (computer)',
    label: 'Open the Workspace',
    url: 'https://unihackfest-2026.vercel.app',
    status: 'live',
  },
  {
    id: 'hub',
    product: 'Communication Hub',
    label: 'Open the Communication Hub',
    url: '', // TODO(asset): Communication Hub URL
    status: 'coming-soon',
  },
];
