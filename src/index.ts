import _ from 'fauxdash'
import Dispatch from 'topic-dispatch'
import logging from 'logging'
import type {
  FSMDefinition,
  FSMInstance,
  StateHandler,
  DeclarativeHandler,
  EventHandler,
  StateConfig
} from './types.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createLogger = (logging as any).default || logging
const log = createLogger('fsm')

function after(this: FSMInstance, topic: string): Promise<void> {
  const { promise, resolve } = _.future()
  this.once(topic, () => resolve())
  return promise
}

function cleanup(this: FSMInstance): void {
  log.debug(`${this.getContext()} cleaning up all listeners'`)
  this.removeAllListeners()
}

function deferredLog(
  machine: FSMInstance,
  f: DeclarativeHandler,
  data: unknown
): void {
  if (f.debug) {
    log.debug(interpret(machine, f.debug, data))
  } else if (f.info) {
    log.info(interpret(machine, f.info, data))
  } else if (f.warn) {
    log.warn(interpret(machine, f.warn, data))
  } else if (f.error) {
    log.error(interpret(machine, f.error, data))
  }
}

function deferUntil(
  this: FSMInstance,
  state: string | null | undefined,
  event: string,
  data?: unknown
): void {
  // An omitted/falsy state means "defer until whatever transition happens
  // next" - '#' is topic-dispatch's catch-all pattern, matching any state
  // name emitted by next(), so a single once() registration covers it
  // without needing a separate synthetic "any transition" event.
  const target = state || '#'
  log.debug(
    `${this.getContext()} deferring handling of '${event}' until '${target}'`
  )
  this.once(target, () => {
    log.debug(
      `${this.getContext()} handling deferred event, '${event}', on change to state '${target}'`
    )
    this.handle(event, data)
  })
}

function forward(
  this: FSMInstance,
  state: string,
  event: string,
  data?: unknown
): void {
  process.nextTick(() => {
    this.next(state, data)
  })
  this.deferUntil(state, event, data)
}

function getContext(this: FSMInstance): string {
  return `(${this.getIdentifier()}[${this.currentState}])`
}

function getIdentifier(this: FSMInstance): string {
  const id = this.id as string | undefined
  const name = this.name as string | undefined
  return id || name || 'anonymous'
}

function handle(this: FSMInstance, eventName: string, event?: unknown): void {
  const current = this.states[this.currentState]
  const handler = current?.[eventName]
  log.debug(`${this.getContext()} handling event, '${eventName}'`)
  if (handler) {
    try {
      ;(handler as EventHandler)(event)
    } catch (e) {
      log.error(
        `${this.getContext()} error occurred handling '${eventName}':\n${e}`
      )
    }
  } else {
    log.debug(`${this.getContext()} no handler for ${eventName}`)
  }
}

function interpret(
  machine: FSMInstance,
  logger: string | ((_data: unknown) => string),
  data: unknown
): string {
  if (typeof logger === 'function') {
    return logger.call(machine, data)
  } else {
    return logger
  }
}

function next(this: FSMInstance, state: string, data?: unknown): Promise<void> {
  log.debug(
    `${this.getContext()} transitioning to '${state}' from ${this.currentState}`
  )
  this.previousState = this.currentState
  this.currentState = state
  const { promise, resolve, reject } = _.future<void>()
  process.nextTick(() => {
    const s = this.states[state]
    if (s?.onEntry) {
      log.debug(`${this.getContext()} calling onEntry function`)
      // emit() must wait for onEntry's result to settle (it may be async)
      // before firing - otherwise after()/on()/once() listeners observe
      // "state entered" before onEntry's setup work has actually finished,
      // even though next()'s own returned promise correctly waits for it.
      Promise.resolve((s.onEntry as EventHandler)(data)).then(
        (result) => {
          this.emit(state, data)
          resolve(result as void)
        },
        (err) => {
          this.emit(state, data)
          reject(err)
        }
      )
    } else if (!s) {
      const err = `${this.getContext()} next was called for missing state '${state}'`
      log.error(err)
      this.emit(state, data)
      reject(new Error(err))
    } else {
      this.emit(state, data)
      resolve()
    }
  })
  return promise
}

function isDeclarative(
  handler: StateHandler
): handler is DeclarativeHandler {
  return typeof handler !== 'function'
}

function buildFromDeclarative(
  machine: FSMInstance,
  eventName: string,
  definition: DeclarativeHandler
): EventHandler {
  return function (this: FSMInstance, data?: unknown): void {
    const relay = data ?? definition.data
    const nextState = definition.next ?? definition.forward
    const after = definition.deferUntil ?? definition.forward ?? definition.after
    deferredLog(machine, definition, relay)
    if (after) {
      machine.once(after, () => {
        log.debug(`${this.getContext()} replaying event ${eventName} in ${after}`)
        machine.handle(eventName, relay)
      })
    }
    if (definition.emit) {
      setTimeout(() => {
        machine.emit(definition.emit!, relay)
      }, definition.wait ?? 0)
    }
    if (nextState) {
      setTimeout(() => {
        log.debug(
          `${this.getContext()} transitioning to ${nextState} on event '${eventName}'`
        )
        machine.next(nextState, relay)
      }, definition.wait ?? 0)
    }
  }.bind(machine)
}

function bindHandles(machine: FSMInstance): void {
  _.each(machine.states, (state: StateConfig, _name: string | number) => {
    _.each(state, (definition: StateHandler | undefined, eventName: string | number) => {
      if (!definition || typeof eventName !== 'string') return
      if (isDeclarative(definition)) {
        state[eventName] = buildFromDeclarative(machine, eventName, definition)
      } else {
        state[eventName] = definition.bind(machine)
      }
    })
  })
}

export default function (definition: FSMDefinition): FSMInstance {
  const baseline = {
    after,
    cleanup,
    deferUntil,
    forward,
    getContext,
    getIdentifier,
    handle,
    next
  }
  const machine = _.melter(
    {},
    baseline,
    _.clone(definition.api ?? {}),
    _.clone(definition.init),
    { states: _.clone(definition.states) },
    Dispatch()
  ) as FSMInstance
  bindHandles(machine)
  machine.next(machine.default as string)
  return machine
}
