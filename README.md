## My Finite State Machine

No really, this is probably not for you.

## API

```js
const fsm = require('mfsm')
const client = require('something')
const clientFsm = fsm({
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
            onEntry: { dispatch: 'ready', wait: 200 },
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
})

clientFsm.connect()
    .then(() => { console.log("connection established") })
```