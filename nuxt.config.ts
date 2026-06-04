// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxt/test-utils/module', 'nuxt-auth-utils', '@nuxt/icon', '@nuxtjs/i18n'],
  i18n: {
    defaultLocale: 'en',
    strategy: 'no_prefix',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'fr', name: 'French', file: 'fr.json' }
    ],
    langDir: 'locales/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: false
    }
  },
  css: [
    '@/assets/styles/main.css'
  ],
  postcss: {
    plugins: {
      'postcss-lighten-darken': {}
    }
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      link: [
        { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48x48.png' },
        { rel: 'icon', type: 'image/png', sizes: '128x128', href: '/favicon-128x128.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/android-chrome-192x192.png' },
        { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/android-chrome-512x512.png' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'manifest', href: '/manifest.webmanifest' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      github: {
        clientId: process.env.NUXT_OAUTH_GITHUB_CLIENT_ID,
        clientSecret: process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET
      },
      gitlab: {
        clientId: process.env.NUXT_OAUTH_GITLAB_CLIENT_ID,
        clientSecret: process.env.NUXT_OAUTH_GITLAB_CLIENT_SECRET
      },
      docsServerPort: process.env.DOCS_SERVER_PORT || '3001'
    },
    sessionPassword: process.env.NUXT_SESSION_PASSWORD,
    authApiBaseUrl: process.env.AUTH_API_BASE_URL
  },
  nitro: {
    devProxy: {
      '/docs': {
        target: `http://localhost:${process.env.DOCS_SERVER_PORT || '3001'}/docs`,
        changeOrigin: true,
        cookieDomainRewrite: false,
        secure: false
      }
    },
    routeRules: {
      '/docs/**': {
        proxy: {
          to: `http://localhost:${process.env.DOCS_SERVER_PORT || '3001'}/docs/**`
        }
      }
    }
  },
  typescript: {
    typeCheck: true
  }
})