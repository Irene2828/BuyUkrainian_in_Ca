// Local-only real routes, with all persistence replaced before accepting requests.
process.env.DATABASE_URL = 'postgresql://TEST:TEST@127.0.0.1:1/TEST';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:1';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'TEST';
process.env.SESSION_SECRET = 'TEST_ONLY_LOCAL_NOT_A_SECRET_123456789';
const { storage } = await import('../../api/_lib/db_storage');
const { registerRoutes } = await import('../../api/_lib/server_routes');
const { default: express } = await import('express');
const { createServer } = await import('node:http');
let records: any[] = [];
let failInsert = false;
let fixture: any[] = [];
storage.getAllStores = async () => fixture;
storage.getApprovedStoresLean = async () => [];
storage.createStore = async (data: any) => {
  if (failInsert) throw new Error("TEST local persistence failure");
  const record = { ...data, id: 'TEST-memory-only', createdAt: new Date() };
  records.push(record);
  return record;
};
const app = express();
app.set('trust proxy', 'loopback');
app.use(express.json());
app.post('/test/reset', (req, res) => {
  records = [];
  failInsert = !!req.body.failInsert;
  fixture = req.body.fixture || [];
  res.json({ ok: true });
});
app.get('/test/records', (_req, res) => res.json(records));
const server = createServer(app);
await registerRoutes(server, app);
server.listen(3000, '127.0.0.1');
