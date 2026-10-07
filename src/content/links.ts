/**
 * Every product URL on the page lives here, and only here.
 * An empty `url` renders a disabled "Coming soon" card with no href.
 */
export type ProductLink = {
  id: 'workspace' | 'mobile' | 'hub';
  product: string;
  label: string;
  /** Optional one-line description shown under the product name. */
  description?: string;
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
    // SPEC §13: jobs site / community hub, separate from the Workspace. Name and URL to be confirmed by the owner.
    id: 'hub',
    product: 'Community Hub',
    label: 'Open the Community Hub',
    description: 'Find and post jobs, then lock the budget.',
    url: '', // TODO(asset): Community Hub URL (keep empty → disabled "Coming soon", no href)
    status: 'coming-soon',
  },
];
