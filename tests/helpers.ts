import { expect } from 'vitest'
import _ from 'fauxdash'

interface CustomMatchers<R = unknown> {
  partiallyEql(_partial: unknown): R
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

function deepCompare(a: unknown, b: unknown, k?: string): string[] {
  let diffs: string[] = []
  if (b === undefined && a !== undefined) {
    diffs.push(`expected ${k} to equal ${a} but was undefined `)
  } else if (_.isObject(a) || Array.isArray(a)) {
    _.each(a as Record<string, unknown>, (v: unknown, c: string) => {
      const key = k ? [k, c].join('.') : c
      const bObj = b as Record<string, unknown>
      diffs = diffs.concat(deepCompare((a as Record<string, unknown>)[c], bObj?.[c], key))
    })
  } else {
     
    const equal = a == b
    if (!equal) {
      diffs.push(`expected ${k} to equal ${a} but got ${b}`)
    }
  }
  return diffs
}

expect.extend({
  partiallyEql(received: unknown, partial: unknown) {
    const diffs = deepCompare(partial, received)
    const pass = diffs.length === 0

    return {
      pass,
      message: () =>
        pass
          ? `expected values not to partially match`
          : `partial match failed:\n\t${diffs.join('\n\t')}`,
      actual: received,
      expected: partial
    }
  }
})
