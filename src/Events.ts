import { once } from './utils'
import { Config } from './types'

export interface Eventable {
  [key: string]: () => void
  start: () => void
  interrupt: () => void
  end: () => void
}

export class Events implements Eventable {
  start: () => void
  interrupt: () => void
  end: () => void

  [key: string]: () => void

  constructor(config: Config) {
    this.start = null
    this.interrupt = null
    this.end = null

    if (config.events) {
      Object.keys(config.events).forEach(d => {
        if (typeof config.events[d] !== 'function') {
          throw new Error('Event handlers must be a function')
        } else {
          this[d] = once(config.events[d])
        }
      })
    }
  }
}

export default Events
