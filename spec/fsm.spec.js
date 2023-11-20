require('./setup')

const fsm = require('../src')
const client = require('./fakeClient')

const def = {
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

describe('FSM', function() {
    describe('on creation', function () {
        var one, two
        before(function() {
            one = fsm(def)
            two = fsm(def)
        })

        it('should capture event raised onEntry', function (done) {
            one.on('ready', () => done())
        })
        
        it('should have correct default state', function() {
            one.currentState.should.eql('disconnected')
            one.text = '1'
            two.text = '2'
            one.text.should.not.eql(two.text)
        })

        after(function() {
            one.cleanup()
            two.cleanup()
        })
    })
    
    describe('when connecting', function () {
        var clientFsm
        before(function() {
            clientFsm = fsm(def)
        })
        
        it('should transition through connecting to connected', async function() {
            var states = []
            await clientFsm.after('ready')
                .then(() => {
                    clientFsm.on('*', (ev, t) => states.push(t))
                    return clientFsm.connect()
                })
            states.should.eql([
                'connecting',
                'connected'
            ])
        })

        after(function() {
            clientFsm.cleanup()
        })
    })

    describe('when connecting', function () {
        var clientFsm
        before(function() {
            clientFsm = fsm(def)
        })
        
        it('should defer handling a command until intended state change', function (done) {
            clientFsm.next('disconnecting')
            clientFsm.connect().then(() => done())
            clientFsm.currentState.should.eql('disconnecting')
            clientFsm.next('disconnected')
        })

        after(function() {
            clientFsm.cleanup()
        })
    })

    describe('when emitting from external call', function() {
        var myFsm
        before(function() {
            myFsm = fsm({
                api: {
                    sayHi: () => {

                    }
                },
                init: {
                    default: 'starting'
                },
                states: {
                    "starting": {},
                    "started": {},
                }
            })
        })

        it('should correctly emit events to consumers', function(done) {
            myFsm.on('test', () => done())
            myFsm.emit('test', {})
        })
    })
})