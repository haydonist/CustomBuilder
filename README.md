# Custom Belt Builder

## Prerequisites

1. **Node.js**: [Download and install](https://nodejs.org/en/download/) it if you haven't already.
2. **Shopify Partner Account**: [Create an account](https://partners.shopify.com/signup) if you don't have one.
3. **Test/Dev Store**: Set up either a [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or a [Shopify Plus sandbox store](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store) for testing your app.
4. **Shopify CLI**: [Download and install](https://shopify.dev/docs/apps/tools/cli/getting-started) it if you haven't already.

### Install Shopify cli
```shell
npm install -g @shopify/cli@latest
```

## Database
This app supports **dual-mode** database configuration:
- **Development**: SQLite (local file `dev.sqlite`)
- **Production**: PostgreSQL (hosted database)

## Local Setup (SQLite)
```shell
# 1. Create .env file (or use default SQLite)
echo 'DATABASE_URL="file:./dev.sqlite"' > .env

# 2. Generate Prisma client and create database
npm run dev:db

# 3. Start development server
npm run dev
```
Note: This builds the project and previews it in Shopify. Add it as an "App block" in theme editor in the dev store.

Press P to open the URL to your app. Once you click install, you can start development.

## Build
```shell
npm run build
```
Note: Every new build cleans previous Vite build assets. Rerun this after code changes while already running dev mode. Don't need to rerun `npm run dev`. Shopify app preview will update automatically.

## Production Setup (PostgreSQL)
```shell
# 1. Set DATABASE_URL to your PostgreSQL connection string
# In .env or your hosting platform's environment variables:
DATABASE_URL="postgresql://user:password@host:5432/database"

# 2. Run migrations
npm run deploy:db

# 3. Deploy app
npm run deploy
```

### Important Notes
- Running `shopify app dev clean` **resets the development database**, deleting all settings
- After running `dev clean`, re-run `npm run dev:db` to recreate the schema
- Settings are stored in the `AppSettings` table, one record per shop
- **Switching modes**: Just change `DATABASE_URL` in your `.env` file

## Deployment
```
npm run deploy
```
Builds and deploys to shopify. Updates all distributions of the app (in all stores it's installed).

**Before deploying to production:**
1. Set up production database (PostgreSQL recommended)
2. Update Prisma schema to use PostgreSQL provider
3. Set `DATABASE_URL` environment variable
4. Run `npx prisma migrate deploy` on production
5. Configure production hosting for the app backend
6. Update Shopify app URLs in Partner Dashboard

📖 **See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment guide**

## Intall app in target store and add to theme
1. Go to [dev dashboard](https://dev.shopify.com/dashboard/130794858/apps).
2. Select `custom-belt-builder`.
3. Click `Install app` on left side.
4. Select your target store from the list. NOTE: might need owner privileges, could encounter `The installation link for this app is invalid`.
5. Verify in `Apps` in the shop admin view that it was installed.
6. Add to theme as an app block.
7. All debug info will display in debug console.

## Architecture

### Hosting
- **App Backend**: Hosted on your server (configured via Shopify CLI during development, needs production hosting for deployment)
- **Theme Extension**: Distributed via Shopify's CDN to all stores where the app is installed
- **Admin UI**: Embedded in Shopify admin portal at `/app`

### Data Storage
- **Database**: SQLite (local dev) - should be migrated to PostgreSQL/MySQL for production
- **Settings Location**: `AppSettings` table in Prisma database
  - One record per shop domain
  - Fields: `backgroundColor`, `fontFamily`, `fontColor`
  - Accessed via `/api/settings` endpoint (public, CORS-enabled)

### Settings Flow
1. Merchant configures settings in Shopify admin (`/app`)
2. Settings saved to database via Prisma
3. Storefront belt wizard fetches settings from `/api/settings?shop={domain}`
4. Settings applied as CSS custom properties (`--belt-wizard-bg-color`, etc.)
5. Theme CSS consumes variables with fallback defaults

## Resources
React Router:
- [React Router docs](https://reactrouter.com/home)

Shopify:
- [Intro to Shopify apps](https://shopify.dev/docs/apps/getting-started)
- [Shopify App React Router docs](https://shopify.dev/docs/api/shopify-app-react-router)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [Shopify App Bridge](https://shopify.dev/docs/api/app-bridge-library).
- [Polaris Web Components](https://shopify.dev/docs/api/app-home/polaris-web-components).
- [App extensions](https://shopify.dev/docs/apps/app-extensions/list)
- [Shopify Functions](https://shopify.dev/docs/api/functions)