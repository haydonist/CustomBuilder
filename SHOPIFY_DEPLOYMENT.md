# Shopify App Deployment Guide

This guide explains how to deploy the BeltMaster Belt Builder as a Shopify app with a Theme App Extension.

## Prerequisites

1. **Shopify Partner Account**: Create one at [partners.shopify.com](https://partners.shopify.com)
2. **Shopify CLI**:
   - Install via `npm install -g @shopify/cli @shopify/theme`
   - Confirm it's available: `shopify version`
3. **Access to the Shopify app in Partner Dashboard**: Your Partner account must have access to the app you are deploying.
4. **Access to the target store**:
   - You must be able to authenticate to the target store during installation (the CLI opens a browser).
   - Your account on the target store must be the store owner or a staff user with permission to install/manage apps.
   - To add the block in the theme editor, you also need Online Store / Themes access.
   - Minimum staff permissions typically required:
     - Apps and channels (install/manage)
     - Online Store (Themes) (to add/enable the app block)
5. **Development Store (recommended)**: Create a development store in your Partner Dashboard for initial setup/testing.

## Project Structure

```
CustomBuilder/
├── shopify.app.toml          # Shopify app configuration
├── extensions/
│   └── belt-wizard-block/    # Theme App Extension
│       ├── shopify.extension.toml
│       ├── assets/           # Built JS/CSS files
│       ├── blocks/           # Liquid blocks for theme editor
│       ├── snippets/         # Reusable Liquid snippets
│       └── locales/          # Translations
├── src/                      # Source TypeScript/Lit components
└── vite.config.ts           # Build configuration
```

## Setup Steps

### 1. Create Shopify App in Partner Dashboard

1. Go to [partners.shopify.com](https://partners.shopify.com)
2. Navigate to **Apps** → **Create app**
3. Choose **Create app manually**
4. Name your app "BeltMaster Belt Builder"
5. Copy the **Client ID** and update `shopify.app.toml`:

```toml
client_id = "your-client-id-here"
```

### 2. Configure App URLs

Update `shopify.app.toml` with your app URLs:

```toml
application_url = "https://your-app-url.com"

[auth]
redirect_urls = [
  "https://your-app-url.com/auth/callback"
]
```

### 3. Build the Extension

```bash
# Install dependencies
npm install

# Build the extension assets
npm run build:extension
```

This will:
- Bundle the Lit components into `extensions/belt-wizard-block/assets/belt-wizard.js`
- Combine CSS into `extensions/belt-wizard-block/assets/belt-wizard.css`

### 4. Start Development Server

```bash
npm run shopify:dev
# or
shopify app dev
```

This will:
- Start a local development server
- Create a tunnel for testing
- Install the app on your development store

### 5. Install the App on a Target Store

Use this section when you need to install the app onto a specific store (dev store, staging store, or a store you have collaborator/staff access to).

1. **Confirm permissions**
   - In the **Partner Dashboard**, you must have access to the app.
   - In the **target store admin**, your user must be able to install/manage apps (store owner or a staff user with the appropriate permissions).

2. **Preferred (non-dev) install: Partner Dashboard install link (app distribution)**

If you have an install link (from the app's distribution settings in the Partner Dashboard), use it to install onto the target store.

This is typically the most reliable path for staging/merchant stores because it installs the app version that is available for distribution.

3. **Optional: Install/sync via Shopify CLI (dev preview)**

The CLI flow is most useful when you want a dev preview and to ensure the Theme App Extension is synced to the store.

Note: Depending on how the app is distributed and your access level, CLI-based installation may fail even if the Partner Dashboard install link works. If CLI install fails, install the app via the Partner Dashboard install link, then try running the CLI dev command again to sync the extension.

Authenticate the Shopify CLI for the target store:

```bash
shopify login --store your-store.myshopify.com
```

Run the dev command against the target store:

```bash
shopify app dev --store your-store.myshopify.com
```

The CLI will:
- Prompt you to select the app (if needed)
- Open a browser window to complete the install/authorization
- Sync the Theme App Extension to that store so it appears in the theme editor

4. **Verify the install**
   - In the target store admin, confirm the app appears under **Apps**.
   - Go to **Online Store** → **Themes** → **Edit theme**.
   - Add a block and confirm the extension appears under **Apps** ("Belt Builder").
   - If the block does not appear, re-run `shopify app dev --store your-store.myshopify.com` to re-sync the extension, then refresh the theme editor.

### 6. Deploy to Production

```bash
npm run shopify:deploy
# or
shopify app deploy
```

After deploying, you typically install the released version onto a store from the Shopify Partner Dashboard (the exact labels can vary). Look for actions like "Test on store" / "Install" for the app, then complete the install flow in the target store admin.

## Using the Belt Builder in a Theme

### Option 1: Add as App Block (Recommended)

1. Go to your Shopify store admin
2. Navigate to **Online Store** → **Themes**
3. Choose the theme you want to edit and click **Edit theme**
4. In the theme editor, select where you want the Belt Builder to appear:
   - A specific template (e.g. product page, page template)
   - A specific section (e.g. main content area)
5. Click **Add block** (or **Add section**, depending on your theme)
6. Under **Apps**, choose **Belt Builder** or **Belt Builder Section**
7. Configure settings as needed
8. Click **Save**

If you're editing a non-live theme, make sure you also **Publish** the theme when you're ready.

### Option 2: Add as Full Page Section
1. In your Shopify store admin, navigate to **Online Store** → **Pages** -> **Add page**.
2. Set Title to "Custom Belt Builder" or any other name you prefer.
3. Select **Visible** for the page visibility.
3. Change the URL to any other URL you prefer or leave it as `/custom-belt-builder`.
4. Click **Save**
5. In the theme editor, add a new item, Belt Builder, to the Main Menu in the Header section or where you want the link to appear to the belt builder page.
6. On the page, Select "Custom Belt Builder" from the Apps section.
7. This creates a full-page belt customization experience.

### If the block does not appear

1. Confirm the app is installed on the store (store admin → **Apps**)
2. Confirm you're editing the correct theme
3. Re-sync the extension by running `shopify app dev --store your-store.myshopify.com`, then refresh the theme editor

## Configuration Options

The Belt Builder block supports these settings:

| Setting | Description | Default |
|---------|-------------|---------|
| `heading_text` | Main heading text | "BeltMaster" |
| `subheading_text` | Subheading text | "Build Your Own Custom Belt" |
| `button_text` | CTA button text | "Get Started" |
| `show_jumbotron` | Show/hide hero section | true |

## Storefront API Configuration

The app uses the Shopify Storefront API to fetch products. The API client is configured in `src/api/index.ts`:

```typescript
const client = createStorefrontApiClient({
  storeDomain: "https://belt-master-belts.myshopify.com",
  apiVersion: "2025-10",
  publicAccessToken: "your-storefront-access-token",
});
```

### Getting a Storefront Access Token

1. In Shopify Admin, go to **Settings** → **Apps and sales channels**
2. Click **Develop apps** → **Create an app**
3. Configure **Storefront API scopes**:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
4. Install the app and copy the Storefront access token

## Product Tagging Requirements

The Belt Builder expects products to be tagged appropriately:

| Tag | Product Type |
|-----|--------------|
| `Belt Strap` | Belt base/strap |
| `buckle` | Belt buckles |
| `Loop` | Belt loops |
| `concho` | Conchos |
| `tip` | Belt tips |
| `Set` | Complete buckle sets |
| `size` | Size variants |
| `38mm`, `32mm`, etc. | Width filters |

## Troubleshooting

### Extension not showing in theme editor

1. Ensure the app is installed on the store
2. Run `shopify app dev` to sync extensions
3. Check the extension is enabled in app settings

### Products not loading

1. Verify Storefront API token is valid
2. Check product tags match expected values
3. Ensure products are published to the Storefront API channel

### Styles not applying

1. Rebuild the extension: `npm run build:extension`
2. Clear browser cache
3. Check for CSS conflicts with theme styles

## Development Tips

- Use `shopify app dev` for hot-reloading during development
- Check browser console for API errors
- Use Shopify's GraphiQL explorer to test queries

## Support

For issues or questions, contact the development team.
