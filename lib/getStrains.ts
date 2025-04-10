// lib/getStrains.ts
import fs from 'fs';
import path from 'path';

interface Strain {
  name: string;
  type: string;
  effects?: { [key: string]: string };
  flavors?: string[];
  description?: string;
}

export function getStrains(): Strain[] {
  const filePath = path.join(process.cwd(), 'data', 'leafly_strain_data.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(rawData);
  return Array.isArray(parsed)
    ? parsed.filter((s): s is Strain => typeof s?.name === 'string')
    : [];
}
