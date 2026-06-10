# Dump Center — Vercel Token Portal

Deze website draait op Vercel en beheert alle access tokens voor de CMD tool.

## Deploy op Vercel

1. Maak een nieuw project op [vercel.com](https://vercel.com)
2. Koppel je Git repo
3. Stel **Root Directory** in op `web`
4. Voeg environment variables toe:
   - `ADMIN_KEY` — sterk wachtwoord voor token-beheer (verplicht)
5. Koppel **Upstash Redis** via [Vercel Marketplace](https://vercel.com/marketplace/upstash) → Install → Connect to project
   - `UPSTASH_REDIS_REST_URL` en `UPSTASH_REDIS_REST_TOKEN` worden automatisch gezet
6. Deploy

## Na deploy

1. Ga naar `https://jouw-app.vercel.app/tokens`
2. Log in met je `ADMIN_KEY`
3. Maak tokens aan per gebruiker
4. Op je PC:
   ```bat
   dumper.bat config --api https://jouw-app.vercel.app
   dumper.bat login --token <TOKEN>
   ```

## Token verwijderen

Klik **Verwijderen** in het token portaal. De token wordt permanent uit de database gehaald — de CMD tool accepteert hem daarna niet meer.

## Lokaal testen (zonder KV)

```bash
cd web
cp .env.example .env.local
# Zet ADMIN_KEY in .env.local
npm install
npm run dev
```

Zonder Redis wordt `data/tokens.json` gebruikt (alleen voor lokale dev).
