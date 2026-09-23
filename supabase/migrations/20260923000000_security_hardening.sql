-- Ewe ati Egbo — security & integrity hardening (follows 20260917000000_initial_schema)
-- Source: docs/security-audit-2026-09-23.md
--
-- What this migration does, in plain terms:
--   1. Identity   — every profile row IS a Supabase auth user; nobody picks their own role.
--   2. Privilege  — role / verification / payout account / prices can't be edited by their owners.
--   3. Money      — no double-recorded Paystack payments, no negative amounts, currency on every
--                   amount, payouts can't exceed what was collected, payment states only move forward.
--   4. History    — deleting an order can no longer wipe its payment, shipment or dispute records.
--   5. Proof      — shipments can only be "delivered" with an evidence event; audit log is append-only.
--   6. Access     — RLS policies for public catalogue reads + "your own rows" reads; all writes stay
--                   server-side (service_role / Fastify) until each write path is designed.

begin;

-- ===========================================================================
-- 1. Identity: users <-> auth.users
-- ===========================================================================
alter table users alter column id drop default;
alter table users
  add constraint users_auth_fk foreign key (id) references auth.users(id) on delete cascade,
  add constraint users_role_chk check (role in ('customer', 'seller', 'cargo_agent', 'admin'));
alter table users add column deleted_at timestamptz;

-- Profile row created on signup. NEVER copies role from user metadata (client-controlled).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.users (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- Admin check for policies. SECURITY DEFINER avoids RLS recursion on `users`.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin' and deleted_at is null);
$$;

-- True for the backend / migrations (service_role, postgres) — the only writers of privileged fields.
create or replace function public.is_trusted_writer()
returns boolean language sql stable as $$
  select current_user in ('postgres', 'service_role', 'supabase_admin') or public.is_admin();
$$;

-- ===========================================================================
-- 2. Ownership columns: required + one profile per user
-- ===========================================================================
alter table sellers      alter column user_id set not null, add constraint sellers_user_unique unique (user_id);
alter table cargo_agents add constraint cargo_agents_user_unique unique (user_id); -- nullable: platform arm
alter table addresses    alter column customer_id set not null;
alter table orders       alter column customer_id set not null;
alter table sellers  add column deleted_at timestamptz;
alter table products add column deleted_at timestamptz;

-- ===========================================================================
-- 3. Guard privileged columns (row-level policies can't restrict columns)
-- ===========================================================================
create or replace function public.guard_privileged_columns()
returns trigger language plpgsql as $$
declare
  col text;
  cols text[] := tg_argv;
begin
  if public.is_trusted_writer() then return new; end if;
  if tg_op = 'INSERT' then
    -- New rows must start unprivileged.
    if tg_table_name = 'users' and new.role is distinct from 'customer' then
      raise exception 'role can only be assigned by an admin';
    end if;
    if tg_table_name in ('sellers', 'cargo_agents') and new.verification_status is distinct from 'pending' then
      raise exception 'verification_status starts as pending';
    end if;
    if tg_table_name = 'cargo_agents' and coalesce(new.is_platform_arm, false) then
      raise exception 'is_platform_arm is admin-only';
    end if;
    return new;
  end if;
  foreach col in array cols loop
    if (to_jsonb(new) -> col) is distinct from (to_jsonb(old) -> col) then
      raise exception '% is managed by the platform and cannot be changed here', col;
    end if;
  end loop;
  return new;
end $$;

create trigger users_guard before insert or update on users
  for each row execute function public.guard_privileged_columns('role', 'id');
create trigger sellers_guard before insert or update on sellers
  for each row execute function public.guard_privileged_columns('verification_status', 'payout_account_id', 'tax_info', 'user_id');
create trigger cargo_agents_guard before insert or update on cargo_agents
  for each row execute function public.guard_privileged_columns('verification_status', 'payout_account_id', 'is_platform_arm', 'rating', 'user_id');
create trigger order_items_guard before update on order_items
  for each row execute function public.guard_privileged_columns('unit_price_pence', 'commission_pence', 'quantity', 'seller_id', 'variant_id', 'order_id');
create trigger shipments_guard before update on shipments
  for each row execute function public.guard_privileged_columns('price_pence', 'agent_cost_pence', 'order_id', 'cargo_agent_id');
create trigger products_guard before update on products
  for each row execute function public.guard_privileged_columns('status', 'seller_id', 'product_class');

comment on column sellers.payout_account_id      is 'Paystack subaccount / transfer recipient code';
comment on column cargo_agents.payout_account_id is 'Paystack subaccount / transfer recipient code';

-- ===========================================================================
-- 4. Enumerated states (no more free-text typos like "captued")
-- ===========================================================================
alter table sellers      add constraint sellers_verif_chk check (verification_status in ('pending','verified','trusted','suspended'));
alter table cargo_agents add constraint agents_verif_chk  check (verification_status in ('pending','verified','trusted','suspended'));
alter table cargo_agents add constraint agents_rating_chk check (rating is null or rating between 0 and 5);
alter table sellers      add constraint sellers_type_chk  check (business_type is null or business_type in ('individual','sole_trader','ltd','partnership','other'));
alter table products     add constraint products_class_chk  check (product_class in ('A','B','C','D'));
alter table products     add constraint products_status_chk check (status in ('draft','pending','approved','rejected','suspended'));
alter table products     add constraint products_regclass_chk check (regulatory_class is null or regulatory_class in ('food','supplement','cosmetic','medicine'));
alter table product_claims add constraint claims_status_chk check (claim_status in ('pending','approved','blocked'));
alter table restricted_ingredients add constraint restricted_status_chk check (status in ('green','amber','red'));
alter table orders       add constraint orders_status_chk check (status in ('pending_payment','processing','shipped','delivered','cancelled','refunded'));
alter table orders       alter column status set default 'pending_payment';
alter table order_items  add constraint items_fulfil_chk  check (fulfilment_status in ('processing','shipped','delivered','cancelled','refunded'));
alter table payouts      add constraint payouts_status_chk check (status in ('pending','held','processing','paid','failed','reversed'));
alter table consignments add constraint consign_status_chk check (status in ('open','sealed','in_transit','cleared','delivered'));
alter table shipments    add constraint ship_status_chk   check (status in ('created','at_origin_hub','in_transit','customs','at_uk_hub','out_for_delivery','delivered','exception'));
alter table shipments    add constraint ship_type_chk     check (fulfilment_type in ('platform_cargo','agent','uk_direct'));
alter table routes       add constraint routes_model_chk  check (rate_model in ('per_kg','per_parcel','flat'));
alter table reviews      add constraint reviews_sub_chk   check (
  coalesce(quality,1)   between 1 and 5 and coalesce(packaging,1) between 1 and 5 and
  coalesce(accuracy,1)  between 1 and 5 and coalesce(delivery,1)  between 1 and 5);
alter table reports      add constraint reports_reason_chk check (reason in ('medical_claim','safety','counterfeit','prohibited','misleading','other'));

-- ===========================================================================
-- 5. Money: non-negative, currency-tagged, consistent
-- ===========================================================================
-- Every amount is in the MINOR unit of its row's currency (pence for GBP, kobo for NGN).
do $$
declare t text;
begin
  foreach t in array array['products','product_variants','orders','order_items','payments','payouts','shipping_options','routes','shipments'] loop
    execute format('alter table %I add column currency char(3) not null default ''GBP''', t);
    execute format('alter table %I add constraint %I check (currency in (''GBP'',''NGN'',''GHS'',''KES'',''ZAR'',''USD''))', t, t || '_currency_chk');
  end loop;
end $$;

alter table products          add constraint products_price_chk check (price_pence > 0);
alter table product_variants  add constraint variants_price_chk check (price_pence is null or price_pence > 0);
alter table inventory         add constraint inventory_qty_chk  check (quantity >= 0);
alter table orders            alter column total_pence set not null,
                              add constraint orders_total_chk  check (total_pence >= 0);
alter table order_items       alter column order_id set not null, alter column seller_id set not null,
                              alter column variant_id set not null, alter column quantity set not null,
                              alter column unit_price_pence set not null, alter column commission_pence set not null,
                              add constraint items_qty_chk   check (quantity > 0),
                              add constraint items_price_chk check (unit_price_pence >= 0),
                              add constraint items_comm_chk  check (commission_pence between 0 and unit_price_pence * quantity);
alter table shipping_options  add constraint shipopt_price_chk check (price_pence >= 0 and est_min_days <= est_max_days);
alter table routes            add constraint routes_price_chk check (coalesce(rate_pence,0) >= 0 and coalesce(per_kg_pence,0) >= 0 and transit_min_days <= transit_max_days);
alter table shipments         add constraint ship_price_chk   check (coalesce(price_pence,0) >= 0 and coalesce(agent_cost_pence,0) >= 0
                                                                     and coalesce(agent_cost_pence,0) <= coalesce(price_pence,0)
                                                                     and coalesce(duty_vat_estimate_pence,0) >= 0);

-- Payments: Paystack, idempotent, forward-only.
alter table payments alter column provider drop default;
update payments set provider = 'paystack' where provider = 'stripe' or provider is null;
alter table payments
  alter column provider set not null,
  alter column provider_ref set not null,
  alter column amount_pence set not null,
  alter column status set not null,
  add column fx_rate numeric(18,8),            -- rate applied if charged in a different currency
  add column verified_at timestamptz,          -- set only after server-side /transaction/verify
  add constraint payments_provider_chk check (provider in ('paystack')),
  add constraint payments_amount_chk   check (amount_pence > 0),
  add constraint payments_status_chk   check (status in ('initialized','authorized','captured','refunded','partially_refunded','failed')),
  add constraint payments_provider_ref_unique unique (provider, provider_ref);

create or replace function public.payments_forward_only()
returns trigger language plpgsql as $$
begin
  if old.status = new.status then return new; end if;
  if (old.status, new.status) not in (
      ('initialized','authorized'), ('initialized','captured'), ('initialized','failed'),
      ('authorized','captured'), ('authorized','failed'),
      ('captured','refunded'), ('captured','partially_refunded'), ('partially_refunded','refunded')) then
    raise exception 'illegal payment transition % -> %', old.status, new.status;
  end if;
  if new.status = 'captured' and new.verified_at is null then
    raise exception 'payment must be verified with Paystack (/transaction/verify) before it is marked captured';
  end if;
  return new;
end $$;
create trigger payments_transition before update on payments
  for each row execute function public.payments_forward_only();

-- Webhook idempotency: each Paystack event is processed once.
create table webhook_events (
    id            uuid primary key default gen_random_uuid(),
    provider      varchar(30) not null default 'paystack',
    event_id      varchar(200) not null,      -- Paystack event/id or reference+event name
    event_type    varchar(60)  not null,
    payload_sha256 char(64)    not null,
    received_at   timestamptz  not null default now(),
    processed_at  timestamptz,
    unique (provider, event_id)
);

-- Payouts: one leg per payee (seller / cargo agent / platform), tied to the payment it came from.
alter table payouts
  alter column order_id set not null,
  alter column amount_pence set not null,
  alter column seller_id drop not null,
  add column payment_id     uuid references payments(id) on delete restrict,
  add column payee_type     varchar(10) not null default 'seller',
  add column cargo_agent_id uuid references cargo_agents(id) on delete restrict,
  add column transfer_ref   varchar(120),
  add constraint payouts_payee_chk check (
    (payee_type = 'seller'   and seller_id is not null and cargo_agent_id is null) or
    (payee_type = 'agent'    and cargo_agent_id is not null and seller_id is null) or
    (payee_type = 'platform' and seller_id is null and cargo_agent_id is null)),
  add constraint payouts_amount_chk check (amount_pence >= 0),
  add constraint payouts_transfer_unique unique (transfer_ref);
create unique index payouts_one_leg_per_payee on payouts
  (payment_id, payee_type, coalesce(seller_id, cargo_agent_id, '00000000-0000-0000-0000-000000000000'::uuid))
  where status <> 'reversed';

-- Payout legs can never add up to more than the payment collected.
create or replace function public.payouts_within_payment()
returns trigger language plpgsql as $$
declare paid int; total int;
begin
  if new.payment_id is null then return new; end if;
  select amount_pence into paid from payments where id = new.payment_id;
  select coalesce(sum(amount_pence),0) into total from payouts
   where payment_id = new.payment_id and status <> 'reversed' and id <> new.id;
  if total + new.amount_pence > paid then
    raise exception 'payout legs (%) would exceed payment (%)', total + new.amount_pence, paid;
  end if;
  return new;
end $$;
create trigger payouts_sum_guard before insert or update on payouts
  for each row execute function public.payouts_within_payment();

-- ===========================================================================
-- 6. History: financial & dispute records survive order/seller deletes
-- ===========================================================================
alter table order_items    drop constraint order_items_order_id_fkey,
                           add  constraint order_items_order_id_fkey foreign key (order_id) references orders(id) on delete restrict;
alter table payments       drop constraint payments_order_id_fkey,
                           add  constraint payments_order_id_fkey foreign key (order_id) references orders(id) on delete restrict;
alter table shipments      drop constraint shipments_order_id_fkey,
                           add  constraint shipments_order_id_fkey foreign key (order_id) references orders(id) on delete restrict;
alter table shipment_items drop constraint shipment_items_shipment_id_fkey,
                           add  constraint shipment_items_shipment_id_fkey foreign key (shipment_id) references shipments(id) on delete restrict,
                           drop constraint shipment_items_order_item_id_fkey,
                           add  constraint shipment_items_order_item_id_fkey foreign key (order_item_id) references order_items(id) on delete restrict;
alter table disputes       drop constraint disputes_order_id_fkey,
                           add  constraint disputes_order_id_fkey foreign key (order_id) references orders(id) on delete restrict;
alter table sellers        drop constraint sellers_user_id_fkey,
                           add  constraint sellers_user_id_fkey foreign key (user_id) references users(id) on delete restrict;
alter table products       drop constraint products_seller_id_fkey,
                           add  constraint products_seller_id_fkey foreign key (seller_id) references sellers(id) on delete restrict;
alter table cargo_agents   drop constraint cargo_agents_user_id_fkey,
                           add  constraint cargo_agents_user_id_fkey foreign key (user_id) references users(id) on delete restrict;
-- Cancel orders by status; retire sellers/products with deleted_at.

-- An order can only ship to the ordering customer's own address.
create or replace function public.order_address_belongs_to_customer()
returns trigger language plpgsql as $$
begin
  if new.address_id is not null and not exists (
       select 1 from addresses where id = new.address_id and customer_id = new.customer_id) then
    raise exception 'address does not belong to this customer';
  end if;
  return new;
end $$;
create trigger orders_address_guard before insert or update of address_id, customer_id on orders
  for each row execute function public.order_address_belongs_to_customer();

-- Verified-purchase reviews: reviewer must be the buyer, and product/seller must match the item.
create or replace function public.review_matches_purchase()
returns trigger language plpgsql as $$
begin
  if not exists (
    select 1 from order_items oi
      join orders o on o.id = oi.order_id
      join product_variants pv on pv.id = oi.variant_id
     where oi.id = new.order_item_id
       and o.customer_id = new.customer_id
       and pv.product_id = new.product_id
       and oi.seller_id = new.seller_id
       and oi.fulfilment_status = 'delivered') then
    raise exception 'reviews are only allowed on your own delivered purchases';
  end if;
  return new;
end $$;
create trigger reviews_purchase_guard before insert or update on reviews
  for each row execute function public.review_matches_purchase();

-- ===========================================================================
-- 7. Proof of delivery + tamper-evident audit
-- ===========================================================================
create table shipment_events (
    id              uuid primary key default gen_random_uuid(),
    shipment_id     uuid not null references shipments(id) on delete restrict,
    status          varchar(20) not null check (status in ('created','at_origin_hub','in_transit','customs','at_uk_hub','out_for_delivery','delivered','exception')),
    actor_id        uuid references users(id),
    evidence_type   varchar(20) check (evidence_type in ('hub_scan','photo','carrier_tracking','customer_otp','customer_confirmed','auto_window')),
    evidence_path   text,           -- private storage path
    evidence_sha256 char(64),
    lat             numeric(9,6),
    lng             numeric(9,6),
    note            text,
    created_at      timestamptz not null default now()
);

-- "Delivered" needs independent evidence — an agent's word alone isn't enough.
create or replace function public.shipment_delivery_needs_proof()
returns trigger language plpgsql as $$
begin
  if new.status = 'delivered' and old.status is distinct from 'delivered' and not exists (
       select 1 from shipment_events
        where shipment_id = new.id and status = 'delivered'
          and evidence_type in ('carrier_tracking','customer_otp','customer_confirmed','auto_window')) then
    raise exception 'shipment % cannot be marked delivered without carrier/customer evidence', new.id;
  end if;
  return new;
end $$;
create trigger shipments_delivery_guard before update of status on shipments
  for each row execute function public.shipment_delivery_needs_proof();

alter table audit_logs
  add column actor_id    uuid,
  add column actor_role  varchar(20),
  add column before_data jsonb,
  add column after_data  jsonb,
  add column ip          inet,
  add column request_id  varchar(80),
  add column prev_hash   char(64),
  add column row_hash    char(64);

-- Append-only: history can be added to, never rewritten. Each row chains the previous row's hash.
create or replace function public.append_only()
returns trigger language plpgsql as $$
begin
  raise exception '% is append-only', tg_table_name;
end $$;
create trigger audit_logs_no_update before update or delete on audit_logs
  for each row execute function public.append_only();
create trigger shipment_events_no_update before update or delete on shipment_events
  for each row execute function public.append_only();
create trigger webhook_events_no_delete before delete on webhook_events
  for each row execute function public.append_only();

create or replace function public.audit_hash_chain()
returns trigger language plpgsql as $$
begin
  perform pg_advisory_xact_lock(hashtext('audit_logs_chain'));
  select row_hash into new.prev_hash from audit_logs order by created_at desc, id desc limit 1;
  new.row_hash := encode(digest(
      coalesce(new.prev_hash,'') || new.id::text || coalesce(new.actor,'') || coalesce(new.action,'') ||
      coalesce(new.target_id::text,'') || coalesce(new.before_data::text,'') || coalesce(new.after_data::text,'') ||
      new.created_at::text, 'sha256'), 'hex');
  return new;
end $$;
alter table audit_logs alter column created_at set not null;
create trigger audit_logs_chain before insert on audit_logs
  for each row execute function public.audit_hash_chain();

-- ===========================================================================
-- 8. Indexes on foreign keys (Postgres doesn't create them)
-- ===========================================================================
create index if not exists idx_sellers_user          on sellers(user_id);
create index if not exists idx_products_seller       on products(seller_id);
create index if not exists idx_products_status       on products(status) where deleted_at is null;
create index if not exists idx_variants_product      on product_variants(product_id);
create index if not exists idx_addresses_customer    on addresses(customer_id);
create index if not exists idx_orders_customer       on orders(customer_id);
create index if not exists idx_items_order           on order_items(order_id);
create index if not exists idx_items_seller          on order_items(seller_id);
create index if not exists idx_items_variant         on order_items(variant_id);
create index if not exists idx_payments_order        on payments(order_id);
create index if not exists idx_payouts_order         on payouts(order_id);
create index if not exists idx_payouts_seller        on payouts(seller_id);
create index if not exists idx_payouts_agent         on payouts(cargo_agent_id);
create index if not exists idx_shipments_order       on shipments(order_id);
create index if not exists idx_shipments_agent       on shipments(cargo_agent_id);
create index if not exists idx_shipment_events_ship  on shipment_events(shipment_id, created_at);
create index if not exists idx_routes_agent          on routes(cargo_agent_id);
create index if not exists idx_disputes_order        on disputes(order_id);
create index if not exists idx_reviews_product       on reviews(product_id);

-- ===========================================================================
-- 9. Access: default-deny grants + minimal read policies
-- ===========================================================================
-- Clients may READ; every WRITE goes through the backend (service_role) until designed.
revoke insert, update, delete, truncate on all tables in schema public from anon, authenticated;
alter default privileges in schema public revoke insert, update, delete, truncate on tables from anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
-- Profile self-service (safe columns only).
grant update (name, phone, postcode, interests) on users to authenticated;

-- RLS is already enabled on the original tables; enable it on the new ones.
alter table webhook_events  enable row level security;
alter table shipment_events enable row level security;

-- Public catalogue
create policy catalog_read_categories  on categories      for select using (true);
create policy catalog_read_traditions  on traditions      for select using (true);
create policy catalog_read_botanicals  on botanicals      for select using (true);
create policy catalog_read_bnames      on botanical_names for select using (true);
create policy catalog_read_corridors   on corridors       for select using (active);
create policy catalog_read_products    on products        for select using ((status = 'approved' and deleted_at is null) or public.is_admin()
                                                                         or seller_id in (select id from sellers where user_id = auth.uid()));
create policy catalog_read_variants    on product_variants for select using (exists (select 1 from products p where p.id = product_id and p.status = 'approved' and p.deleted_at is null));
create policy catalog_read_reviews     on reviews          for select using (true);

-- Your own rows (sensitive columns like tax_info are never exposed to other users).
create policy own_user_read      on users     for select using (id = auth.uid() or public.is_admin());
create policy own_user_update    on users     for update using (id = auth.uid()) with check (id = auth.uid());
create policy own_address_read   on addresses for select using (customer_id = auth.uid() or public.is_admin());
create policy own_order_read     on orders    for select using (customer_id = auth.uid() or public.is_admin());
create policy own_items_read     on order_items for select using (
  exists (select 1 from orders o where o.id = order_id and o.customer_id = auth.uid())
  or seller_id in (select id from sellers where user_id = auth.uid()) or public.is_admin());
create policy own_shipment_read  on shipments for select using (
  exists (select 1 from orders o where o.id = order_id and o.customer_id = auth.uid())
  or cargo_agent_id in (select id from cargo_agents where user_id = auth.uid()) or public.is_admin());
create policy own_seller_read    on sellers   for select using (user_id = auth.uid() or public.is_admin());
create policy own_agent_read     on cargo_agents for select using (user_id = auth.uid() or public.is_admin());
create policy own_payout_read    on payouts   for select using (
  seller_id in (select id from sellers where user_id = auth.uid())
  or cargo_agent_id in (select id from cargo_agents where user_id = auth.uid()) or public.is_admin());
create policy admin_read_audit   on audit_logs for select using (public.is_admin());

-- Public seller storefront without private fields (tax_info, payout account, contact).
create or replace view public.seller_public as
  select id, business_name, trading_name, business_type, years_operating, verification_status, created_at
    from sellers where deleted_at is null and verification_status in ('verified','trusted');
grant select on public.seller_public to anon, authenticated;

commit;
