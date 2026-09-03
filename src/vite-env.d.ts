/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface TokenClient {
  requestAccessToken: (override?: { prompt?: string }) => void
}

interface GoogleAccounts {
  oauth2: {
    initTokenClient: (config: {
      client_id: string
      scope: string
      callback: (resp: { access_token?: string; error?: string; expires_in?: string }) => void
    }) => TokenClient
    revoke: (token: string, done?: () => void) => void
  }
}

interface Window {
  google?: { accounts: GoogleAccounts }
}
