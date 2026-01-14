# Custom Belt Builder

## Quick start

### Prerequisites

1. **Node.js**: [Download and install](https://nodejs.org/en/download/) it if you haven't already.
2. **Shopify Partner Account**: [Create an account](https://partners.shopify.com/signup) if you don't have one.
3. **Test/Dev Store**: Set up either a [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or a [Shopify Plus sandbox store](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store) for testing your app.
4. **Shopify CLI**: [Download and install](https://shopify.dev/docs/apps/tools/cli/getting-started) it if you haven't already.

##### Install Shopify cli
```shell
npm install -g @shopify/cli@latest
```

### Local Development

```shell
npm run dev
```
This builds the project and previews it in Shopify. Add it as an "App block" in theme editor in the dev store.

Press P to open the URL to your app. Once you click install, you can start development.


### Build

```shell
npm run build
```
Note: Every new build cleans previous build assets.

### Clean App preview in Shopify

```shell
shopify app dev clean 
```

## Deployment
```
npm run deploy
```
Builds and deploys to shopify. Updates all distributions of the app (in all stores it's installed).

## Intall app in target store and add to theme
1. Go to [dev dashboard](https://dev.shopify.com/dashboard/130794858/apps).
2. Select `custom-belt-builder`.
3. Click `Install app` on left side.
4. Select you target store from the list. NOTE: might need owner privileges, could encounter `The installation link for this app is invalid`.
5. Verify in `Apps` in the shop admin view that it was installed.
6. Add to theme as an app block.
7. All debug info will display in debug console.

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
