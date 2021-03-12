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
    log.debug(`${this.getContext()} cleaning up all listeners'`)
    this.removeAllListeners()
}

function deferredLog(machine, f, data) {
  if (f.debug) {
    log.debug(interpret(machine, f.debug, data))
  } else if (f.info){
    log.info(interpret(machine, f.info, data))
  } else if (f.warn){
    log.warn(interpret(machine, f.warn, data))
  } else if (f.error){
    log.error(interpret(machine, f.error, data))
  }
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

function interpret(machine, logger, data) {
  if (typeof logger == 'function') {
    return logger.call(machine, data)
  } else {
    return logger
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

function buildFromDeclarative (machine, eventName, definition) {
    return function (data) {
        const relay = data || definition.data
        const next = definition.next || definition.forward
        const after = definition.deferUntil || definition.forward || definition.after
        deferredLog(machine, definition, relay)
        if (after) {
            machine.once(after, () => machine.handle(eventName, relay))
        }
        if (definition.emit) {
            setTimeout(() => {
                machine.emit(definition.emit, relay)
            }, definition.wait || 0)
        } 
        if (next) {
            setTimeout(() => {
                machine.next(next, relay)
            }, definition.wait || 0)
        }
    }.bind(machine)
}

function bindHandles (machine) {
    _.each(machine.states, (state, name) => {
        _.each(state, (definition, eventName) => {
            if (typeof definition === 'function') {
                state[eventName] = definition.bind(machine)
            } else {
                state[eventName] = buildFromDeclarative(machine, eventName, definition)
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
