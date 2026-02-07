import type { EventEmitter } from 'events'

/**
 * Declarative handler configuration for state events
 */
export interface DeclarativeHandler {
  /** Next state to transition to */
  next?: string
  /** State to defer this event until */
  deferUntil?: string
  /** State to forward to (alias for deferUntil) */
  forward?: string
  /** State to wait for before handling */
  after?: string
  /** Event to emit */
  emit?: string
  /** Delay in milliseconds before executing next/emit */
  wait?: number
  /** Data to pass with the transition/emit */
  data?: unknown
  /** Debug log message (string or function) */
  debug?: string | ((data: unknown) => string)
  /** Info log message (string or function) */
  info?: string | ((data: unknown) => string)
  /** Warn log message (string or function) */
  warn?: string | ((data: unknown) => string)
  /** Error log message (string or function) */
  error?: string | ((data: unknown) => string)
}

/**
 * Functional handler - bound to FSM instance
 */
export type EventHandler = (data?: unknown) => void | Promise<void>

/**
 * Handler can be either declarative config or functional
 */
export type StateHandler = DeclarativeHandler | EventHandler

/**
 * State configuration - maps event names to handlers
 */
export interface StateConfig {
  /** Special handler called when entering this state */
  onEntry?: StateHandler
  /** Event handlers for this state */
  [eventName: string]: StateHandler | undefined
}

/**
 * Collection of all states in the FSM
 */
export interface FSMStates {
  [stateName: string]: StateConfig
}

/**
 * Custom API methods added to the FSM instance
 */
export interface FSMApi {
  [methodName: string]: (this: FSMInstance, ...args: unknown[]) => unknown
}

/**
 * Initialization configuration
 */
export interface FSMInit {
  /** Default/initial state name */
  default: string
  /** Optional identifier for logging */
  id?: string
  /** Optional name for logging */
  name?: string
  /** Additional initialization properties */
  [key: string]: unknown
}

/**
 * FSM definition passed to the factory function
 */
export interface FSMDefinition {
  /** State definitions */
  states: FSMStates
  /** Initialization config */
  init: FSMInit
  /** Custom API methods */
  api?: FSMApi
}

/**
 * Base FSM instance methods
 */
export interface FSMBaseMethods {
  /** Wait for a state to be entered, returns a promise */
  after(topic: string): Promise<void>

  /** Clean up all event listeners */
  cleanup(): void

  /** Defer handling an event until a specific state is reached */
  deferUntil(state: string, event: string, data?: unknown): () => void

  /** Forward to a state and defer event handling */
  forward(state: string, event: string, data?: unknown): () => void

  /** Get context string for logging */
  getContext(): string

  /** Get identifier for this FSM instance */
  getIdentifier(): string

  /** Handle an event in the current state */
  handle(eventName: string, event?: unknown): void

  /** Transition to a new state */
  next(state: string, data?: unknown): Promise<void>

  /** Current state name */
  currentState: string

  /** Previous state name */
  previousState?: string

  /** State definitions */
  states: FSMStates
}

/**
 * FSM instance combines base methods, custom API, init properties, and EventEmitter
 */
export type FSMInstance = FSMBaseMethods &
  EventEmitter &
  Record<string, unknown>
