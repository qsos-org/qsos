declare module '#auth-utils' {
    interface User {
        name: string
        email: string
        roles: string[]
    }

    interface UserSession {

    }

    interface SecureSessionData {
        // Add your own fields
    }
}

export { }