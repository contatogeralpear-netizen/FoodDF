-- Transactional integration checks. All fixtures and changes are rolled back.
begin;
select set_config('fooddf.test_admin',gen_random_uuid()::text,true);
select set_config('fooddf.test_other',gen_random_uuid()::text,true);
insert into auth.users(id,email,email_confirmed_at,is_anonymous)
values(current_setting('fooddf.test_admin')::uuid,'admin-fixture@fooddf.invalid',now(),false),
      (current_setting('fooddf.test_other')::uuid,'other-fixture@fooddf.invalid',now(),false);
insert into fooddf_private.administrators(email) values('admin-fixture@fooddf.invalid');
select set_config('request.jwt.claim.sub',current_setting('fooddf.test_admin'),true);
set local role authenticated;
do $$ declare rid text:=gen_random_uuid()::text; cid uuid; pid text:=gen_random_uuid()::text; begin
 if not public.fooddf_is_admin() then raise exception 'Admin should be authorized'; end if;
 insert into public.restaurants(id,slug,name,state,city,status) values(rid,'fixture-'||rid,'Fixture restaurant','DF','Brasília','draft');
 insert into public.categories(restaurant_id,name) values(rid,'Original') returning id into cid;
 insert into public.products(id,restaurant_id,name,price,category) values(pid,rid,'Fixture product',1000,'Original');
 perform public.fooddf_rename_category(cid,'Renamed');
 if not exists(select 1 from public.products where id=pid and category='Renamed') then raise exception 'Category rename not propagated'; end if;
 update public.products set promo_price=900,featured=true,extras='[{"id":"extra","name":"Extra","price":100}]' where id=pid;
 update public.restaurants set delivery_fee=750,is_open=false where id=rid;
 insert into public.restaurant_plans(restaurant_id,trial_started_at) values(rid,now());
 perform * from public.fooddf_admin_metrics(rid);
 delete from public.products where id=pid;
 delete from public.categories where id=cid;
 delete from public.restaurants where id=rid;
end $$;
select set_config('request.jwt.claim.sub',current_setting('fooddf.test_other'),true);
do $$ declare n integer; begin
 if public.fooddf_is_admin() then raise exception 'Non-admin incorrectly authorized'; end if;
 update public.restaurants set name='Unauthorized' where id='brasa-burger';
 get diagnostics n=row_count; if n<>0 then raise exception 'Non-admin modified restaurant'; end if;
 if exists(select 1 from public.catalog_events) then raise exception 'Non-admin can read metrics'; end if;
 begin
  insert into public.categories(restaurant_id,name) values('brasa-burger','Unauthorized');
  raise exception 'Non-admin inserted category';
 exception when insufficient_privilege then null; end;
 begin
  insert into storage.objects(bucket_id,name) values('restaurant-images','unauthorized.png');
  raise exception 'Non-admin uploaded image';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
update auth.users set email_confirmed_at=null where id=current_setting('fooddf.test_admin')::uuid;
select set_config('request.jwt.claim.sub',current_setting('fooddf.test_admin'),true);
set local role authenticated;
do $$ begin if public.fooddf_is_admin() then raise exception 'Unverified email incorrectly authorized'; end if; end $$;
set local role anon;
do $$ begin
 if not exists(select 1 from public.restaurants where id='brasa-burger') then raise exception 'Public catalog unavailable'; end if;
 begin
  update public.restaurants set name='Unauthorized' where id='brasa-burger';
  raise exception 'Anonymous write permitted';
 exception when insufficient_privilege then null; end;
end $$;
rollback;
select 'PASS: admin CRUD, atomic category rename, non-admin/anonymous write denial, private metrics, image protection and unverified-email denial' as result;
