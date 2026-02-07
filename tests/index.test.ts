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
})
