# nandos-ordering

> These Vue components represent shared frontend functionality for the Nando's ordering journey. Components allow a user to set up an order, browse a menu and its products and viewing a basket. By injecting the appropriate services, these components can be reused in various contexts.

Appropriate dependencies for a context are configured by the web and admin packages here:

***Web***

`/packages/nandos-web-app/src/components/ordering/index.js`
Components are configured so that customers can order

***Admin***

`/packages/nandos-admin-app/src/components/menu-preview/index.js`
Menu components are configured to run in "preview" mode - allowing menu authors to preview what a menu will look like before publishing changes

`/packages/nandos-admin-app/src/components/ordering/index.js`
Components are configured so that call center agents can order on behalf of a customer


## Build Setup

**There is no build**. The components in this package are intended to be used/imported directly by other packages.
