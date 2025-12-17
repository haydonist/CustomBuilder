# Shopify App Deployment Guide

This guide explains how to deploy the BeltMaster Belt Builder as a Shopify app with a Theme App Extension.

## Prerequisites

1. **Shopify Partner Account**: Create one at [partners.shopify.com](https://partners.shopify.com)
2. **Shopify CLI**: Install via `npm install -g @shopify/cli @shopify/theme`
3. **Development Store**: Create a development store in your Partner Dashboard

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

### 5. Deploy to Production

```bash
npm run shopify:deploy
# or
shopify app deploy
```

## Using the Belt Builder in a Theme

### Option 1: Add as App Block (Recommended)

1. Go to your Shopify store admin
2. Navigate to **Online Store** → **Themes** → **Customize**
3. Add a new section or block
4. Look for "Belt Builder" under **Apps**
5. Configure settings as needed

### Option 2: Add as Full Page Section

1. In the theme editor, add a new section
2. Select "Belt Builder" from the Apps section
3. This creates a full-page belt customization experience

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
