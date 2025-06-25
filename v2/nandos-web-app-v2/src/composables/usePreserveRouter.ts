import { RouteLocationRaw, useRoute, useRouter } from "vue-router";

type TRouteType = 'path' | 'name';

export function usePreserveRouter() {

    const router = useRouter();
    const route = useRoute();

    /**
     * Pushes a new route whilst preserving route params and query
     * @param {string} newRoute - The path or name of the new route 
     * @param type - If the route we pushing is a named route or a path. Default value is 'path'
     */
    function pushRoute(newRoute: string, type: TRouteType = 'path') {
        router.push({
            [type]: newRoute,
            params: route.params,
            query: route.query
        });
    }

    /**
     * Returns a RouteLocationRaw object that preserves route params and query
     * @param {string} newRoute - The path or name of the new route 
     * @param type - If the route we pushing is a named route or a path. Default value is 'path'
     * @returns {RouteLocationRaw}
     */
    function preserveTo(newRoute: string, type: TRouteType = 'path'): RouteLocationRaw {
        const to: RouteLocationRaw = {
            [type]: newRoute,
            params: route.params,
            query: route.query
        };
        return to;
    }

    /**
     * Navigates to the redirect route in the route query. If redirect is not found then 
     * navigates to the fallback route. If there is no redirect and fallback then return void
     * @param {string} fallbackRoute - The fallback route when redirect query is empty. default is empty
     */
    function pushToRedirect(fallbackRoute: string = '') {
        const redirect = route.query?.redirect as string;
        if (!redirect && !fallbackRoute) return;
        router.push(redirect || fallbackRoute);
    }

    return {
        // Expose router and route
        router,
        route,
        // Preserve router functions 
        pushRoute,
        preserveTo,
        pushToRedirect
    };
}