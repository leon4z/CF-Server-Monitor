import { createLiveSocket } from './api.js'

// One early connection for an existing session on a single-site homepage.
// No buffered data is delivered until the authenticated application adopts it.
export function createStartupLiveSocket(makeSocket = createLiveSocket) {
  let target = null
  let buffered = []
  let status = null
  let closed = false
  let taken = false
  const socket = makeSocket('all', {
    initialSnapshot: true, replay: false,
    onMessage(message) {
      if (closed) return
      if (target) target.onMessage?.(message)
      else { buffered.push(message); if (buffered.length > 64) buffered.shift() }
    },
    onStatus(value) {
      status = value
      if (!closed) target?.onStatus?.(value)
    }
  }, 0, [])
  return {
    take(handlers) {
      if (closed || taken) return null
      taken = true
      target = handlers
      if (status) handlers.onStatus?.(status)
      for (const message of buffered) handlers.onMessage?.(message)
      buffered = []
      return socket
    },
    close() { closed = true; buffered = []; target = null; socket.close() }
  }
}
