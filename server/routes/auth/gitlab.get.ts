import { isAdminEmail } from "../../utils/auth"

export default defineOAuthGitLabEventHandler({
  config: {
    scope: ['read_user', 'email'],
    emailRequired: true
  },
  async onSuccess(event, { user }) {
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
    console.error('GitLab OAuth error:', error)
    return sendRedirect(event, '/')
  },
})