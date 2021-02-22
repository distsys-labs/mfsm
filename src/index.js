const _ = require('fauxdash')
const Dispatch = require('topic-dispatch')

function after (topic) {
    var { promise, resolve } = _.future()
    this.once(topic, () => resolve())
    return promise
}

function cleanup () {
    this.removeAllListeners()
}

function deferUntil(state, event) {
    return function () {
        this.once(state, () => this.handle(event))
    }.bind(this)
}

function handle (eventName, event) {
    var current = this.states[this.currentState]
    var handler = current[eventName]
    if (handler) {
        try {
            handler(event)
        } catch (e) {
            console.log(`error occurred handling '${eventName}' in state '${this.currentState}':\n${e}`)
        }
    } else {
        console.log(`no handler for ${eventName} at state ${this.currentState}`)
        // log warning of no handler at debug level
    }
}

function next (state) {
    this.previousState = this.currentState
    this.currentState = state
    process.nextTick(() => {
        this.emit(state, this)
        if (this.states[state].onEntry) {
            this.states[state].onEntry()
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