import assert from 'node:assert/strict';
process.env.DATABASE_URL = 'postgresql://TEST:TEST@127.0.0.1:1/TEST';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:1';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'TEST';
process.env.SESSION_SECRET = 'TEST_ONLY_LOCAL_NOT_A_SECRET_123456789';
const { DatabaseStorage } = await import('../../api/_lib/db_storage');
const { checkDuplicateSubmission } = await import('../../api/_lib/security');
const db = new DatabaseStorage();
const unresolved = {name:'TEST First Store',address:'111 TEST Street',latitude:'56.1304',longitude:'-106.3468',geocodingStatus:'unresolved' as const};
const other = {...unresolved,name:'TEST Other Store',address:'222 TEST Street'};
assert.equal(checkDuplicateSubmission(unresolved,[other]),false);
assert.equal(checkDuplicateSubmission(unresolved,[unresolved]),true);
assert.equal(checkDuplicateSubmission({...unresolved,geocodingStatus:undefined},[{...other,geocodingStatus:undefined}]),false);
const verified = {...unresolved,latitude:'46.813',longitude:'-71.208',geocodingStatus:'resolved' as const};
assert.equal(checkDuplicateSubmission(verified,[{...other,latitude:'46.813',longitude:'-71.208',geocodingStatus:'resolved'}]),true);
assert.equal(checkDuplicateSubmission({...verified,geocodingStatus:'unresolved'},[{...other,latitude:'46.813',longitude:'-71.208',geocodingStatus:'resolved'}]),false);
const input = {...unresolved,description:'TEST details',products:['TEST chocolate'],city:'Unknown',province:'Unknown',category:'food' as const,status:'pending' as const};
let inserted: any;
(db as any).db = {insert:()=>({values:(data:any)=>{inserted=data;return {returning:async()=>[data]};}})};
const direct = await db.createStore(input);
assert.equal(inserted.geocodingStatus,'unresolved');
assert.equal(direct.geocodingStatus,'unresolved');
(db as any).db = {insert:()=>{throw new Error('TEST force REST fallback');}};
process.env.SUPABASE_SERVICE_ROLE_KEY='TEST-local-only';
const originalFetch=globalThis.fetch;
let restPayload:any;
globalThis.fetch=async (url, init)=>{
  assert.equal(String(url),'http://127.0.0.1:1/rest/v1/stores');
  restPayload=JSON.parse(String(init?.body));
  return new Response(JSON.stringify([{...restPayload,created_at:new Date().toISOString()}]),{status:201});
};
try {
  const rest=await db.createStore(input);
  assert.equal(restPayload.geocoding_status,'unresolved');
  assert.equal(rest.geocodingStatus,'unresolved');
} finally {globalThis.fetch=originalFetch;}
console.log('PASS: 5 duplicate checks; direct insert + REST fallback preserve unresolved geocoding status. No database or external network accessed.');
const { insertStoreSchema } = await import('../../shared/schema');
for (const phone of ['+1 (418) 555-0123','418-555-0123','4185550123','418 555 0123']) {
  const parsed = insertStoreSchema.parse({...input,phone});
  assert.equal('phone' in parsed,false);
}
console.log('PASS: four investigation phone formats remain irrelevant to this form; unknown phone field is stripped.');
