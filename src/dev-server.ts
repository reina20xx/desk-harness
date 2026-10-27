import { serve } from '@hono/node-server';
import * as fs from 'node:fs';
import * as path from 'node:path';
import app from './index';
import { createLocalD1 } from './db/local-d1';

const PORT = Number(process.env.PORT || 8802);
const schemaPath = path.join(process.cwd(), 'schema.sql');
const htmlPath = path.join(process.cwd(), 'public', 'index.html');

const db = createLocalD1(':memory:', schemaPath);

serve(
  {
    fetch: (req) => {
      const staticHtml = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf-8') : 'Desk Harness';
      return app.fetch(req, { DB: db, STATIC_HTML: staticHtml });
    },
    port: PORT,
  },
  (info) => {
    console.log(`🚀 Desk Harness running at http://localhost:${info.port}`);
  }
);
