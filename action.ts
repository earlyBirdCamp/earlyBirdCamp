import { join } from 'path';
import { writeFileSync } from 'fs';

const now = new Date();
const pathToData = join(__dirname, 'data', fileString(now)) + '.json';

writeFileSync(pathToData, now.toString(), 'utf-8');

function fileString(ts: Date) {
  const year = ts.getUTCFullYear();
  const month = (ts.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = ts.getUTCDate().toString().toString().padStart(2, '0');
  const name = `${year}-${month}-${day}`;
  return name;
}
