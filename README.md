## My Finite State Machine

No really, this is probably not for you.

## Installation

```bash
npm install mfsm
```

**Requirements:**
- Node.js 22 or higher
- ESM only (no CommonJS support)

## Usage

### TypeScript

```typescript
import fsm from 'mfsm'
import type { FSMDefinition, FSMInstance } from 'mfsm'
import client from 'something'

const clientFsm: FSMInstance = fsm({
    api: {
        connect: function () {
            this.handle('connect')
            return this.after('connected')
        },
        disconnect: function () {
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
            disconnect: function () {
                this.client.disconnect()
                    .then(
                        () => {
                            this.handle('disconnect')
                        }
                    )
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
            connect: function () {
                this.client.connect(this.url)
                    .then(
                        () => {
                            this.next('connected')
                        }
                    )
                this.next('connecting')
                this.once('closed', () => {
                    this.next('disconnected')
                })
            }
        }
    }
}
})

clientFsm.connect()
    .then(() => { console.log("connection established") })
```

### JavaScript (ESM)

```javascript
import fsm from 'mfsm'

const clientFsm = fsm({
    api: {
        connect() {
            this.handle('connect')
            return this.after('connected')
        },
        disconnect() {
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
            disconnect() {
                this.client.disconnect()
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
            connect() {
                this.client.connect(this.url)
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
})

clientFsm.connect()
    .then(() => { console.log("connection established") })
```

## Declarative Handle Properties

 * `emit` - emits an event from the FSM
 * `next` - transitions FSM to a new state
 * `after` - shorthand for deferUntil
 * `deferUntil` - delays handling the event until after a specific state has occurred
 * `forward` - forwards the event to a new state (after + next)
 * `wait` - amount of time (in ms) to wait before emitting events or transitioning

## Event Patterns

The FSM uses [topic-dispatch](https://github.com/arobson/topic-dispatch) for event handling, which supports AMQP-style wildcard patterns:

```typescript
// Listen to all events
machine.on('*', (event, topic) => {
  console.log(`Event on ${topic}:`, event)
})

// Pattern matching (see topic-dispatch docs for more patterns)
machine.on('state.*', handler)  // Match state.connected, state.idle, etc.
```

## Version 3.0.0 Changes

This is a major rewrite with breaking changes:

- **ESM-only**: No CommonJS support. Use ESM imports (`import`) only.
- **TypeScript**: Full TypeScript support with complete type definitions.
- **Node.js 22+**: Minimum Node.js version is now 22.
- **Modern dependencies**: Updated to latest versions with ESM and TypeScript support.
  - `fauxdash` ^1.8.6 (ESM + TypeScript)
  - `topic-dispatch` ^3.0.0 (ESM + TypeScript)
  - `logging` ^4.2.0 (ESM)
- **Modern tooling**: Built with TypeScript, tested with Vitest.
