export class NotifyError extends Error {
  constructor(message, { status } = {}) {
    super(message)
    this.name = 'NotifyError'
    this.status = status
  }
}

export const withTimeout = (ms) => AbortSignal.timeout(ms)

export const isTimeout = (err) => err?.name === 'TimeoutError' || err?.name === 'AbortError'
