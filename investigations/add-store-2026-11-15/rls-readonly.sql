-- Run read-only in Ukraine2026 SQL editor; no data mutations.
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies where schemaname='public' and tablename='stores';
select relrowsecurity, relforcerowsecurity from pg_class
where oid='public.stores'::regclass;
select grantee, privilege_type from information_schema.role_table_grants
where table_schema='public' and table_name='stores';
select column_name, data_type, is_nullable, column_default, character_maximum_length,
 numeric_precision, numeric_scale from information_schema.columns
where table_schema='public' and table_name='stores' order by ordinal_position;
select conname, pg_get_constraintdef(oid) from pg_constraint
where conrelid='public.stores'::regclass;
select indexname,indexdef from pg_indexes where schemaname='public' and tablename='stores';
select tgname, pg_get_triggerdef(oid) from pg_trigger
where tgrelid='public.stores'::regclass and not tgisinternal;
