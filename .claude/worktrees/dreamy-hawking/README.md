# 💴 Laporan Zharizal — Web Edition

Personal finance tracker. React + Vite + Supabase + Vercel.

## 🚀 Deploy Steps

### 1. Supabase Setup

1. [supabase.com](https://supabase.com) → Sign in with GitHub
2. New Project → nama: `laporan-zharizal` → Region: **Northeast Asia (Tokyo)**
3. Tunggu project ready (~1 menit)
4. SQL Editor → paste & run:

```sql
create table laporan (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

alter table laporan enable row level security;

create policy "Allow all" on laporan
  for all using (true) with check (true);
```

5. Settings → API → copy **Project URL** dan **anon public key**
6. Paste ke `src/supabase.js`

### 2. Local Dev

```bash
npm install
npm run dev
```

### 3. Deploy ke Vercel

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USER/laporan-zharizal.git
git push -u origin main
```

Vercel → Import → Framework: Vite → Deploy ✅
