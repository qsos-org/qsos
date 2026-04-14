import { isAdminEmail } from "../../utils/auth"

export default defineOAuthGitHubEventHandler({
  config: {
    scope: ['read:user', 'user:email'],
    emailRequired: true
  },
  async onSuccess(event, { user }) {
    if (!user.email) {
      throw new Error('Email is required but not provided by GitHub')
    }
    await setUserSession(event, {
      user: {
        name: user.name,
        email: user.email,
        roles: await isAdminEmail(user.email) ? ["admin"] : []
      },
      loggedInAt: Date.now()
    })
    return sendRedirect(event, '/profile')
  },
  onError(event, error) {
    console.error('GitHub OAuth error:', error)
    return sendRedirect(event, '/')
  },
})