import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import fs from 'node:fs';
import * as yaml from 'js-yaml';

const roleIds = (yaml.load(fs.readFileSync('src/data/roles.yaml', 'utf8')) as { id: string }[]).map((r) => r.id);

export const MODULES = ['general', 'accountability', 'projects', 'tenders', 'board', 'leave', 'end-to-end', 'reference'] as const;

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        // Search filters and learning paths
        module: z.enum(MODULES).default('general'),
        roles: z.array(z.enum(roleIds as [string, ...string[]])).default(['everyone']),
        tags: z.array(z.string()).default([]),
        // How staff actually talk: LPO, bid, KPI ... (indexed for search, never shown)
        keywords: z.array(z.string()).default([]),
        // Kind of page: drives the header block and the sidebar badges
        pageType: z.enum(['home', 'overview', 'concept', 'how-to', 'workflow', 'calculation', 'report', 'faq', 'journey', 'role-path', 'reference']).default('concept'),
        // How-to header: menu path as a breadcrumb, and prerequisites
        where: z.array(z.string()).optional(),
        before: z.array(z.string()).optional(),
        related: z.array(z.string()).default([]),
        // Code the page was written from (module-relative paths), for drift checks. Not published.
        sources: z.array(z.string()).default([]),
        // Commit of the module repo the page was last checked against (docs-sync)
        verified_commit: z.string().optional(),
      }),
    }),
  }),
};
