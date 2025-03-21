 ## AI Generative Masterclass

 If you are coming from the AI Generative Masterclass, please see the `tutorial` branch. 

 Clone the `tutorial` branch:

```
git clone -b tutorial https://github.com/shawnesquivel/ai-41-start.git
```

# Supabase Local Testing

### 0. Open Docker

### 1. Start Supabase

```powershell
npx supabase start
```

### 2. Spin up Edge

```powershell
npx supabase functions serve  --import-map ./supabase/functions/import_map.json
```

### 3. NextJS in dev mode with  `local` flag.

```powershell
npm run dev:local
```

### 4. Run Tests

```powershell
/Users/shawnesquivel/ai-41-start/supabase/tests/sitemap.bash
```



# Reset & Redeploy Supabase Production DB (2min)

### 1. RESET Production

From CLI, default `yes` to reset remote DB.

⚠️ Remember to export tables as CSV.

```powershell
yes | npx supabase db reset --linked
```

- Optional SQL Editor
    
    ```powershell
    TRUNCATE therapists CASCADE;
    ```
    

### 2. Apply Migration (optional)

```powershell
npx supabase db push          
```

### 3. Redeploy ALL Functions

```powershell
npx supabase functions deploy --import-map ./supabase/functions/import_map.json
```

- Optional: Deploy 1 function
    
    ```powershell
    npx supabase functions deploy gumloop --import-map ./supabase/functions/import_map.json         
    ```
    

### 4. Re-insert data from CSVs.

### 5. Update allowed domains

### 1. Use this SQL to get all the unique domains

https://supabase.com/dashboard/project/joypkrixfrtsyjcsyeeb/sql/a24e51b1-b667-4448-bc08-dde28ccced59

### 2.  Export as JSON → Cursor to update domains in `next.config.js`

## 5. View Logs (optional)

### Embeddings

[Edge Functions | Supabase](https://supabase.com/dashboard/project/joypkrixfrtsyjcsyeeb/functions/embed/invocations)

### Optional: View Logs

[`https://supabase.com/dashboard/project/joypkrixfrtsyjcsyeeb/functions`](https://supabase.com/dashboard/project/joypkrixfrtsyjcsyeeb/functions)

### Optional: View Deployed Functions

```powershell
npx supabase functions list --project-ref joypkrixfrtsyjcsyeeb
```



# Project Setup (local → deployment)

### Vercel

1. Update the Vercel Console → Add `SUPABASE_URL` AND  `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. npm run dev:prod

### Reset Database

1. npx supabase db reset
2. npx supabase secrets set OPEN_AI_KEY=….
3. npx supabase functions deploy --project-ref joypkrixfrtsyjcsyeeb

### Supabase Console

1. Create a produciton deployment and link it to the locla one
2. Push migrations + deployl
3. npx supbase functions deploy
4. Update the `create_embed_function` url to not use Docker URL, the Supbase URL instead.



# Migrations
Create new migration 
```
npx supabase migration new migration_name
```

Sync migration locally
```
npx supabase migration up


Sync migrations to database.
```powershell
npx supabase db push
```

# Functions
Serve functions locally
```powershell
npx supabase functions serve  --import-map ./supabase/functions/import_map.json
```

Deploy functions to production
```powershell
npx supabase functions deploy --import-map ./supabase/functions/import_map.json
```

