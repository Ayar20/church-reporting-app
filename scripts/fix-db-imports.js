const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '..', 'src', 'app', 'api');

function getAllRouteFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...getAllRouteFiles(full));
    else if (entry.name === 'route.ts') results.push(full);
  }
  return results;
}

const files = getAllRouteFiles(apiDir);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix import line
  content = content.replace(
    /import getDb from '@\/lib\/db';/g,
    "import getDb from '@/lib/db';"
  );
  content = content.replace(
    /import sql from '@\/lib\/db';/g,
    "import getDb from '@/lib/db';"
  );
  
  // Replace `const sql = getDb();` inserted multiple times in try blocks
  // First remove any already-inserted ones to be idempotent
  content = content.replace(/\n    const sql = getDb\(\);\n/g, '\n');
  
  // Now insert `const sql = getDb();` as FIRST line inside each `try {` block
  content = content.replace(/(\s+try \{)/g, '$1\n    const sql = getDb();');
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed:', file);
}
console.log('Done!');
