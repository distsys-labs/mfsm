# mfsm

A finite state machine (FSM) library with declarative state handlers, promise-based state waiting, AMQP-style event patterns, and context object on `this`. Used by `rabbot` to manage connection, exchange, and queue lifecycle states.

## Mental Model

Define states as objects. Each key in a state is an event name; the value is either a function (imperative) or a declarative object (shorthand). Context properties from `init` are available as `this.property` in all handlers. Call `this.next('stateName')` to transition. Call `this.handle('eventName')` to dispatch an event to the current state.

## Definition Structure

```typescript
import fsm from 'mfsm'

const machine = fsm({
  api: {
    // Public methods added to the returned FSM instance.
    // Use this.handle() and this.after() inside these methods.
    connect() {
      this.handle('connect')
      return this.after('connected')  // returns a Promise that resolves when state is reached
    }
  },
  init: {
    // Everything here becomes a property on `this` in handlers.
    // Special key: `default` sets the initial state name.
    default: 'disconnected',
    url: process.env.HOST_URL,
    client: myClient
  },
  states: {
    disconnected: {
      // Called automatically on entry to this state
      onEntry: { emit: 'disconnected', wait: 50 },

      connect(command) {
        this.client.connect(this.url).then(() => this.next('connected'))
        this.next('connecting')
      }
    },
    connecting: {
      // Declarative: defer 'disconnect' until after 'connected' state is reached
      disconnect: { deferUntil: 'connected' }
    },
    connected: {
      disconnect() {
        this.client.disconnect().then(() => this.next('disconnected'))
        this.next('disconnecting')
      }
    },
    disconnecting: {
      connect: { deferUntil: 'disconnected' }
    }
  }
})

// Using public API methods
await machine.connect()
await machine.disconnect()
```

## Declarative Handler Properties

Instead of a function, a state handler can be a plain object using these keys:

| Key | Type | Description |
|---|---|---|
| `emit` | string | Emit this event from the FSM |
| `next` | string | Transition to this state |
| `after` | string | Alias for `deferUntil` |
| `deferUntil` | string | Queue this event for processing after the named state is reached |
| `forward` | string | `deferUntil` + `next` combined |
| `wait` | number (ms) | Delay before `emit` or `next` takes effect |

```typescript
// These are all equivalent forms
states: {
  myState: {
    someEvent: { emit: 'ready', wait: 100 },       // emit 'ready' after 100ms
    otherEvent: { next: 'idle' },                  // transition to 'idle'
    lateEvent: { deferUntil: 'idle' },             // replay 'lateEvent' once in 'idle'
    combined: { forward: 'idle' }                  // defer + transition
  }
}
```

## FSM Instance API

```typescript
machine.handle('eventName', data?)  // dispatch event to current state handler
machine.next('stateName')           // transition to a new state
machine.after('stateName')          // Promise that resolves when state is entered
machine.deferUntil('stateName')     // re-dispatch current event after state is reached
machine.emit('eventName', data?)    // emit event from the FSM (like EventEmitter)
machine.once('eventName', fn)       // subscribe to one FSM event
machine.on('pattern', fn)           // subscribe with AMQP wildcard pattern
machine.removeListener('p', fn)
machine.removeAllListeners('p'?)
machine.getContext()                // get the current `this` context object
machine.getIdentifier()             // get a unique ID for this machine instance
machine.cleanup()                   // remove all listeners and timers
```

## Event Patterns (via topic-dispatch)

```typescript
machine.on('*', handler)            // all events
machine.on('state.*', handler)      // events matching one-segment suffix
machine.on('connected', handler)    // exact event name
```

## Gotchas

- **ESM only** — `import`, not `require`. Node 22+.
- `this.after('state')` returns a Promise — always `await` or `.then()` it.
- `onEntry` runs when a state is entered via `this.next()`. It does not run for the initial state unless you call `this.next(init.default)` manually.
- Declarative `deferUntil` re-queues the event, so the handler for it in the target state will be called with the *original* event data.
- State names in `deferUntil`/`after` must exactly match a key in `states`.

## Used By

- `rabbot` — connection FSM, exchange FSM, queue FSM
