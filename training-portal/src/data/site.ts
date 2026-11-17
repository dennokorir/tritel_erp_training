import fs from 'node:fs';
import * as yaml from 'js-yaml';

export type Role = { id: string; label: string; department: string };
export const ROLES: Role[] = yaml.load(fs.readFileSync('src/data/roles.yaml', 'utf8')) as Role[];
export const roleById = Object.fromEntries(ROLES.map((r) => [r.id, r]));

export const MODULE_LABELS: Record<string, string> = {
  general: 'General', accountability: 'Accountability', projects: 'Projects', tenders: 'Tenders',
  board: 'Board', leave: 'Time Off', 'end-to-end': 'End-to-end', reference: 'Reference',
};
