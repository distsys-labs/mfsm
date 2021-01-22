## My Finite State Machine

No really, this is probably not for you.

## API

```js
const fsm = require('mfsm')
const client = require('something')
const clientFsm = fsm({
    api: {
        connect: () => {
            this.handle("connect")
            return this.after('connected')
        },
        disconnect: () => {
            this.handle("disconnect")
            return this.after('disconnected')
        }
    },
    init: {
        url: process.ENV.HOST_URL,
        client: client,
        default: "disconnected"
    },
    states: {
        connected: {
            disconnect: () => {
                this.client.disconnect()
                    .then(
                        () => {
                            this.handle('disconnect')
                        }
                    )
            }
        },
        connecting: () => {
            disconnect: this.deferUntil("connected")
        },
        disconnecting: () => {
            connect: this.deferUntil("disconnected")
        },
        disconnected: {
            connect: () => {
                this.client.connect(this.url)
                    .then(
                        () => {
                            this.next('connected')
                        }
                    )
                this.next('connecting')
                this.client.on("closed", () => {
                    this.next("disconnected")
                })
            }
        }
    }
})

clientFsm.connect()
    .then(() => { console.log("connection established") })
```