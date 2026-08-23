create table clients (
    id uuid primary key default gen_random_uuid(),
    created_at timestamp with time zone default now(),
    full_name text not null,
    age integer not null,
    experience integer not null,
    claims integer not null,
    email text not null,
    phone text not null,
    address text not null
);
 
create table vehicles (
    id uuid primary key default gen_random_uuid(),
    created_at timestamp with time zone default now(),
    client_id uuid not null references clients(id),
    vehicle_type text not null,
    make text not null,
    model text not null,
    plate_number text not null,
    manufacture_year integer not null,
    engine_cc integer not null,
    market_value numeric not null,
    fuel_type text not null,
    usage_type text not null,
    annual_mileage integer not null,
    parking text not null,
    region text not null
);
 
create table quotes (
    id uuid primary key default gen_random_uuid(),
    created_at timestamp with time zone default now(),
    client_id uuid not null references clients(id),
    vehicle_id uuid not null references vehicles(id),
    coverage_type text not null,
    coverage_period_months integer not null,
    price numeric not null,
    payment_status text not null default 'fake payment'
);
 
alter table clients enable row level security;
alter table vehicles enable row level security;
alter table quotes enable row level security;
 
create policy "Allow insert for everyone"
on clients
for insert
to anon
with check (true);
 
create policy "Allow insert for everyone"
on vehicles
for insert
to anon
with check (true);
 
create policy "Allow insert for everyone"
on quotes
for insert
to anon
with check (true);