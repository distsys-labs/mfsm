import _ from 'fauxdash'

function delay(ms?: number): Promise<Record<string, unknown>> {
  const { promise, resolve } = _.future()
  setTimeout(() => resolve({}), ms ?? 200)
  return promise
}

export const client = {
  connect: () => delay(),
  disconnect: () => delay(),
  on: () => {}
}
