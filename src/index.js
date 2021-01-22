const _ = require('fauxdash')
const Dispatch = require('topic-dispatch')

function after (topic) {
    var { promise, resolve } = _.future()
    this.once(topic, () => resolve())
    return promise
}

function cleanup () {
    this.removeAll()
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
        handler(event)
    } else {
        console.log(`no handler for ${eventName} at state ${this.currentState}`)
        // log warning of no handler at debug level
    }
}

function next (state) {
    this.currentState = state
    this.dispatch(state, this)
}

function bindHandles (machine) {
    _.each(machine.states, (state, name) => {
        _.each(state, (f, p) => {
            if (typeof f === 'function') {
                state[p] = f.bind(machine)
            } else {
                state[p] = function () {
                    machine.once(f.deferUntil, () => machine.handle(p))
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
    machine.currentState = machine.default
    bindHandles(machine)
    return machine
}