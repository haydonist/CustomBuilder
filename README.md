# BeltMaster Belt Customization Wizard (Shopify Theme App Extension)

This project ships the Belt Builder as a Shopify **Theme App Extension**.

## Project structure

```
CustomBuilder/
├── shopify.app.toml
├── extensions/
│   └── belt-wizard-block/        # Theme App Extension (Liquid + built assets)
├── src/                          # Lit + TypeScript source
├── assets/                       # CSS sources (concatenated into extension CSS)
├── vite.config.ts                # Vite build config (outputs into extension assets)
└── SHOPIFY_DEPLOYMENT.md         # More detailed deployment notes
```

## Prerequisites

- Node.js + npm
- Shopify CLI (`shopify`)
- Access to the target Shopify app in the Partner/Dev Dashboard

## Install

```sh
npm install
```

## Build the Theme App Extension assets

```sh
npm run build:extension
```

Outputs:

- `extensions/belt-wizard-block/assets/belt-wizard.js`
- `extensions/belt-wizard-block/assets/belt-wizard.css`

## Local development (Shopify dev preview)

```sh
npm run shopify:dev
```

This builds the extension and runs `shopify app dev` to create a dev preview on a Shopify store.

## Deploy

```sh
npm run shopify:deploy
```

This builds the extension and runs `shopify app deploy` to release a new app version.

## Notes

- Extension build artifacts are ignored by git (see `.gitignore`).
- See `SHOPIFY_DEPLOYMENT.md` for detailed setup and troubleshooting.
