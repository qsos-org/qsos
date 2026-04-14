
export default defineNuxtRouteMiddleware((to, from) => {
    const { loggedIn } = useUserSession()
    if (to.path === '/profile' && !loggedIn) {
        return '/auth/'
    }
})
