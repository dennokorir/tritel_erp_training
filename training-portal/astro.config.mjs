// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import remarkGlossaryLinks from './src/plugins/remark-glossary-links.mjs';

const group = (label, directory, collapsed = false) => ({ label, collapsed, items: [{ autogenerate: { directory } }] });

export default defineConfig({
  // Netlify sets URL for production and DEPLOY_PRIME_URL for previews
  site: process.env.DEPLOY_PRIME_URL || process.env.URL || 'http://localhost:4321',
  trailingSlash: 'always',
  markdown: { remarkPlugins: [remarkGlossaryLinks] },
  integrations: [
    // Must come before Starlight so ```mermaid blocks are claimed first
    mermaid({
      theme: 'neutral', autoTheme: true, enableLog: false,
      // Draw diagrams at their natural size (wide ones scroll sideways in their box) instead of
      // shrinking them to the column, which made large state diagrams unreadable
      mermaidConfig: { flowchart: { useMaxWidth: false }, state: { useMaxWidth: false }, themeVariables: { fontSize: '16px' } },
    }),
    starlight({
      title: 'Tritel Systems Training',
      description: 'How to use the Accountability Framework, Project Delivery, Tenders and the Board portal at Tritel.',
      logo: { src: './src/assets/mark.svg', alt: '' },
      favicon: '/favicon.svg',
      customCss: ['./src/styles/theme.css'],
      head: [{ tag: 'script', attrs: { src: '/mermaid-size.js', defer: true } }],
      components: { MarkdownContent: './src/components/MarkdownContent.astro' },
      lastUpdated: false,
      pagination: true,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      sidebar: [
        group('Getting started', 'getting-started'),
        { label: "What's new", link: '/whats-new/' },
        {
          label: 'Accountability',
          items: [
            { label: 'Overview', link: '/accountability/' },
            group('Concepts', 'accountability/concepts', true),
            group('Workflows', 'accountability/workflows', true),
            group('How-to: everyone', 'accountability/how-to/everyone', true),
            group('How-to: line managers', 'accountability/how-to/line-managers', true),
            group('How-to: HR and administrators', 'accountability/how-to/hr-admin', true),
            group('Reports', 'accountability/reports', true),
            group("How it's calculated", 'accountability/calculations', true),
            { label: 'Who can do what', link: '/accountability/who-can-do-what/' },
            { label: 'FAQ', link: '/accountability/faq/' },
          ],
        },
        {
          label: 'Projects',
          items: [
            { label: 'Overview', link: '/projects/' },
            group('Concepts', 'projects/concepts', true),
            group('Workflows', 'projects/workflows', true),
            group('How-to: delivery project managers', 'projects/how-to/delivery-pm', true),
            group('How-to: approvers, finance and set-up', 'projects/how-to/approvers', true),
            group('Reports', 'projects/reports', true),
            group("How it's calculated", 'projects/calculations', true),
            { label: 'Who can do what', link: '/projects/who-can-do-what/' },
            { label: 'FAQ', link: '/projects/faq/' },
          ],
        },
        {
          label: 'Tenders and Channel',
          items: [
            { label: 'Overview', link: '/tenders/' },
            group('Concepts', 'tenders/concepts', true),
            group('Workflows', 'tenders/workflows', true),
            group('How-to: bids', 'tenders/how-to/bids', true),
            group('How-to: summaries, customers and the portal', 'tenders/how-to/customers', true),
            group('Channel (OEMs and compliance)', 'tenders/channel', true),
            group('Commercial Targets', 'tenders/commercial-targets', true),
            group("How it's calculated", 'tenders/calculations', true),
            { label: 'Configuration', link: '/tenders/configuration/' },
            { label: 'Who can do what', link: '/tenders/who-can-do-what/' },
            { label: 'FAQ', link: '/tenders/faq/' },
          ],
        },
        {
          label: 'Board portal',
          items: [
            { label: 'Overview', link: '/board/' },
            group('Concepts', 'board/concepts', true),
            group('Workflows', 'board/workflows', true),
            group('How-to', 'board/how-to', true),
            group("How it's calculated", 'board/calculations', true),
            { label: 'Who can do what', link: '/board/who-can-do-what/' },
            { label: 'FAQ', link: '/board/faq/' },
          ],
        },
        {
          label: 'Time Off',
          items: [
            { label: 'Overview', link: '/leave/' },
            group('Concepts', 'leave/concepts', true),
            group('Workflows', 'leave/workflows', true),
            group('How-to: everyone', 'leave/how-to/everyone', true),
            group('How-to: line managers', 'leave/how-to/line-managers', true),
            group('How-to: HR', 'leave/how-to/hr', true),
            group("How it's calculated", 'leave/calculations', true),
            { label: 'Who can do what', link: '/leave/who-can-do-what/' },
            { label: 'Time Off menus', link: '/leave/menus/' },
            { label: 'FAQ', link: '/leave/faq/' },
          ],
        },
        group('End-to-end journeys', 'end-to-end', true),
        group('Learning paths by role', 'roles', true),
        group('Reference', 'reference', true),
      ],
    }),
  ],
});
