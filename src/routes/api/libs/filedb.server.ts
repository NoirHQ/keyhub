import fs from 'fs';
import { FILEDB_PATH } from './config.server';

async function write(path: string, name: string, data: any): Promise<void> {
  if (!fs.existsSync(`${FILEDB_PATH}/${path}`)) {
    await fs.promises.mkdir(`${FILEDB_PATH}/${path}`, { recursive: true });
  }
  await fs.promises.writeFile(`${FILEDB_PATH}/${path}/${name}.json`, JSON.stringify(data));
}

async function read<T>(path: string, name: string): Promise<T> {
  const data = await fs.promises.readFile(`${FILEDB_PATH}/${path}/${name}.json`, 'utf8');
  return JSON.parse(data) as T;
}

function exist(path: string, name: string): boolean {
  return fs.existsSync(`${FILEDB_PATH}/${path}/${name}.json`);
}

export const filedb = {
  write,
  read,
  exist
};
