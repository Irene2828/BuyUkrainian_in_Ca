process.env.DATABASE_URL='postgresql://TEST:TEST@127.0.0.1:1/TEST';
process.env.NEXT_PUBLIC_SUPABASE_URL='http://127.0.0.1:1';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY='TEST';
const {checkDuplicateSubmission}=await import('../api/_lib/security');
const result=checkDuplicateSubmission({name:'TEST different business',address:'TEST different address',latitude:'56.1304',longitude:'-106.3468'},[{name:'TEST first business',address:'TEST first address',latitude:'56.1304',longitude:'-106.3468'}]);
if(!result)throw Error('Expected sentinel collision');console.log('Different name/address + fallback coordinates => duplicate:',result);
