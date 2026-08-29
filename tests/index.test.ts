import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import './helpers.js'
import fsm from '../src/index.js'
import { client } from './mocks.js'
import type { FSMDefinition, FSMInstance } from '../src/types.js'

const def: FSMDefinition = {
  api: {
    connect: function (this: FSMInstance) {
      this.handle('connect')
      return this.after('connected')
    },
    disconnect: function (this: FSMInstance) {
      this.handle('disconnect')
      return this.after('disconnected')
    }
  },
  init: {
    url: process.env.HOST_URL,
    client: client,
    default: 'disconnected'
  },
  states: {
    connected: {
      disconnect: function (this: FSMInstance) {
        ;(this.client as typeof client).disconnect()
          .then(() => {
            this.handle('disconnect')
          })
      }
    },
    connecting: {
      disconnect: { deferUntil: 'connected' }
    },
    disconnecting: {
      connect: { deferUntil: 'disconnected' }
    },
    disconnected: {
      onEntry: { emit: 'ready', wait: 50 },
      connect: function (this: FSMInstance) {
        ;(this.client as typeof client).connect(this.url)
          .then(() => {
            this.next('connected')
          })
        this.next('connecting')
        this.once('closed', () => {
          this.next('disconnected')
        })
      }
    }
  }
}

describe('FSM', () => {
  describe('on creation', () => {
    let one: FSMInstance, two: FSMInstance
    beforeAll(() => {
      one = fsm(def)
      two = fsm(def)
    })

    it('should capture event raised onEntry', () => {
      return new Promise<void>((resolve) => {
        one.on('ready', () => resolve())
      })
    })

    it('should have correct default state', () => {
      expect(one.currentState).toEqual('disconnected')
      one.text = '1'
      two.text = '2'
      expect(one.text).not.toEqual(two.text)
    })

    afterAll(() => {
      one.cleanup()
      two.cleanup()
    })
  })

  describe('when connecting', () => {
    let clientFsm: FSMInstance
    beforeAll(() => {
      clientFsm = fsm(def)
    })

    it('should transition through connecting to connected', async () => {
      const states: string[] = []
      await clientFsm.after('ready')
        .then(() => {
          clientFsm.on('*', (_ev: string, t: string) => states.push(t))
          return (clientFsm.connect as () => Promise<void>)()
        })
      expect(states).toEqual([
        'connecting',
        'connected'
      ])
    })

    afterAll(() => {
      clientFsm.cleanup()
    })
  })

  describe('when deferring', () => {
    let clientFsm: FSMInstance
    beforeAll(() => {
      clientFsm = fsm(def)
    })

    it('should defer handling a command until intended state change', () => {
      clientFsm.next('disconnecting')
      const promise = (clientFsm.connect as () => Promise<void>)()
      expect(clientFsm.currentState).toEqual('disconnecting')
      clientFsm.next('disconnected')
      return promise
    })

    afterAll(() => {
      clientFsm.cleanup()
    })
  })

  describe('when emitting from external call', () => {
    let myFsm: FSMInstance
    beforeAll(() => {
      myFsm = fsm({
        api: {
          sayHi: () => {}
        },
        init: {
          default: 'starting'
        },
        states: {
          starting: {},
          started: {}
        }
      })
    })

    it('should correctly emit events to consumers', () => {
      return new Promise<void>((resolve) => {
        myFsm.on('test', () => resolve())
        myFsm.emit('test', {})
      })
    })
  })

  describe('deferUntil / forward / onEntry timing fixes', () => {
    it('should not emit state entry until an async onEntry settles', async () => {
      const order: string[] = []
      const testFsm = fsm({
        api: {},
        init: { default: 'idle' },
        states: {
          idle: {},
          loading: {
            onEntry: () => new Promise<void>((resolve) => {
              setTimeout(() => { order.push('onEntry done'); resolve() }, 20)
            })
          }
        }
      })
      testFsm.on('loading', () => { order.push('emitted') })
      await testFsm.next('loading')
      expect(order).toEqual(['onEntry done', 'emitted'])
    })

    it('should defer an imperative deferUntil call without needing to invoke a returned closure', async () => {
      const seen: string[] = []
      const testFsm = fsm({
        api: {},
        init: { default: 'a' },
        states: {
          a: {
            go: function (this: FSMInstance) {
              this.deferUntil('b', 'go')
            }
          },
          b: {
            go: function () { seen.push('replayed-in-b') }
          }
        }
      })
      testFsm.handle('go')
      expect(seen).toEqual([])
      await testFsm.next('b')
      expect(seen).toEqual(['replayed-in-b'])
    })

    it('should defer until whatever transition happens next when state is omitted', async () => {
      const seen: string[] = []
      const testFsm = fsm({
        api: {},
        init: { default: 'a' },
        states: {
          a: {
            go: function (this: FSMInstance) {
              this.deferUntil(null, 'go')
            }
          },
          b: {
            go: function () { seen.push('replayed-in-b') }
          }
        }
      })
      testFsm.handle('go')
      expect(seen).toEqual([])
      await testFsm.next('b')
      expect(seen).toEqual(['replayed-in-b'])
    })
  })
})
