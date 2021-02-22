const _ = require('fauxdash')
const Dispatch = require('topic-dispatch')
const createLogger = require('logging').default
const log = createLogger('fsm')

function after (topic) {
    var { promise, resolve } = _.future()
    this.once(topic, () => resolve())
    return promise
}

function cleanup () {
    log.debug(`cleaning up all listeners for fsm '${this.getIdentifier()}'`)
    this.removeAllListeners()
}

function deferUntil(state, event, data) {
    log.debug(`deferring handling of '${event}' until '${state}'`)
    return function () {
        this.once(state, () => {
            log.debug(`handling deferred event, '${event}', on change to state '${state}'`)
            this.handle(event, data)
        })
    }.bind(this)
}

function getIdentifier() {
    return this.id || this.name || 'anonymous'
}

function handle (eventName, event) {
    var current = this.states[this.currentState]
    var handler = current[eventName]
    log.debug(`handling event, '${eventName}', in state, '${this.currentState}'`)
    if (handler) {
        try {
            handler(event)
        } catch (e) {
            log.error(`error occurred handling '${eventName}' in state '${this.currentState}':\n${e}`)
        }
    } else {
        log.debug(`no handler for ${eventName} at state ${this.currentState}`)
    }
}

function next (state) {
    this.previousState = this.currentState
    this.currentState = state
    log.debug(`transitioning from '${this.previousState}' to '${this.currentState}'`)
    process.nextTick(() => {
        this.emit(state, this)
        const s = this.states[state]
        if (s && s.onEntry) {
            log.debug(`calling ${state}'s onEntry function`)
            s.onEntry()
        } else if (!s) {
            log.error(`Next was called for missing state '${state}'`)
        }
    })
}

function bindHandles (machine) {
    _.each(machine.states, (state, name) => {
        _.each(state, (f, p) => {
            if (typeof f === 'function') {
                state[p] = f.bind(machine)
            } else {
                if (f.deferUntil) {
                    state[p] = function () {
                        machine.once(f.deferUntil, () => machine.handle(p))
                    }
                } else if (f.emit) {
                    state[p] = function () {
                        setTimeout(() => {
                            machine.emit(f.emit, f.data)
                        }, f.wait || 0)
                    }
                } else if (f.next) {
                    state[p] = function () {
                        setTimeout(() => {
                            machine.next(f.next)
                        }, f.wait || 0)
                    }
                }
            }
        })
    })
}

module.exports = function (definition) {
    const baseline = {
        after,
        cleanup,
        deferUntil,
        getIdentifier,
        handle,
        next
    }
    var machine = _.melter({},
        baseline,
        _.clone(definition.api),
        _.clone(definition.init),
        {states: _.clone(definition.states)},
        Dispatch()
    )
    bindHandles(machine)
    machine.next(machine.default)
    return machine
}