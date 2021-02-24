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
    log.debug(` cleaning up all listeners'`)
    this.removeAllListeners()
}

function deferUntil(state, event, data) {
    log.debug(`${this.getContext()} deferring handling of '${event}' until '${state}'`)
    return function () {
        this.once(state, () => {
            log.debug(`${this.getContext()} handling deferred event, '${event}', on change to state '${state}'`)
            this.handle(event, data)
        })
    }.bind(this)
}

function getContext() {
  return `(${this.getIdentifier()}[${this.currentState}])`
}

function getIdentifier() {
    return this.id || this.name || 'anonymous'
}

function handle (eventName, event) {
    var current = this.states[this.currentState]
    var handler = current[eventName]
    log.debug(`${this.getContext()} handling event, '${eventName}'`)
    if (handler) {
        try {
            handler(event)
        } catch (e) {
            log.error(`${this.getContext()} error occurred handling '${eventName}':\n${e}`)
        }
    } else {
        log.debug(`${this.getContext()} no handler for ${eventName}`)
    }
}

function next (state, data) {
  log.debug(`${this.getContext()} transitioning to '${state}'`)
  this.previousState = this.currentState
  this.currentState = state
  process.nextTick(() => {
      this.emit(state, data)
      const s = this.states[state]
      if (s && s.onEntry) {
          log.debug(`${this.getContext()} calling onEntry function`)
          s.onEntry(data)
      } else if (!s) {
          log.error(`${this.getContext()} next was called for missing state '${state}'`)
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
                    state[p] = function (data) {
                        machine.once(f.deferUntil, () => machine.handle(p, data))
                    }
                } else if (f.emit) {
                    state[p] = function (data) {
                        setTimeout(() => {
                            machine.emit(f.emit, data || f.data)
                        }, f.wait || 0)
                    }
                } else if (f.next) {
                    state[p] = function (data) {
                        setTimeout(() => {
                            machine.next(f.next, data)
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
        getContext,
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
