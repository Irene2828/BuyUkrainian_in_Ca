process.env.DATABASE_URL='postgresql://TEST:TEST@127.0.0.1:1/TEST';
process.env.NEXT_PUBLIC_SUPABASE_URL='http://127.0.0.1:1';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY='TEST';
process.env.SESSION_SECRET='TEST_ONLY_LOCAL_NOT_A_SECRET_123456789';
const {storage}=await import('../api/_lib/db_storage');
const {registerRoutes}=await import('../api/_lib/server_routes');
const {default:express}=await import('express');
const {createServer}=await import('node:http');
// All persistence boundaries replaced before any requests. Never connects to a DB.
storage.getAllStores=async()=>[];
storage.getApprovedStoresLean=async()=>[];
storage.createStore=async(data:any)=>({...data,id:'TEST-memory-only',createdAt:new Date()});
const app=express();app.set('trust proxy','loopback');app.use(express.json());const server=createServer(app);await registerRoutes(server,app);server.listen(3000,'127.0.0.1');
