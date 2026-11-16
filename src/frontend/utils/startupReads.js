import { http, DEFAULT_REQUEST_TIMEOUT_MS } from './http'
import { getApiBases, hasMultipleApiBases } from './config'
import { STORAGE } from './constants'
import { isAdminPath } from '../router/adminEntryUrl'

const KEY = '__CFSM_STARTUP_READS__'
const identity = () => JSON.stringify([
  window.location.pathname, window.location.hash.replace(/^#/, '') || '/', getApiBases(),
  ...[STORAGE.JWT_TOKEN, STORAGE.TURNSTILE_TOKEN, STORAGE.TURNSTILE_VERIFIED].map(key => localStorage.getItem(key))
])

// Built into a small inline script: no Vue, router, UI or private HTML payload.
export function startStartupReads(preloadUrls = []) {
  const hash = window.location.hash || ''
  if (isAdminPath() || hash.startsWith('#admin') || hash.startsWith('#/admin') ||
    (hash.replace(/^#/, '') || '/').split('?')[0] !== '/' || hasMultipleApiBases() || window[KEY]) return
  for (const href of preloadUrls) {
    const link = document.createElement('link')
    link.rel = 'modulepreload'
    link.crossOrigin = 'anonymous'
    link.href = href
    document.head.appendChild(link)
  }
  const options = { autoRedirect: false, updateSession: false, includeTurnstileToken: false, timeoutMs: DEFAULT_REQUEST_TIMEOUT_MS }
  const expectedIdentity = identity()
  const state = { matches: () => expectedIdentity === identity(), config: null, servers: null }
  // A fresh one-time challenge belongs to the normal authoritative config flow.
  if (!localStorage.getItem(STORAGE.TURNSTILE_TOKEN)) state.config = http.get('/api/config', options)
  if (localStorage.getItem(STORAGE.JWT_TOKEN)) state.servers = http.get('/api/servers?realtime=deferred', options)
  window[KEY] = state
}

export function takeStartupReads() {
  const state = window[KEY]
  delete window[KEY]
  return state?.matches() ? state : null
}
