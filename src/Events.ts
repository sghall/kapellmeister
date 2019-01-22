import { once } from './utils'
import { Config } from './types'

export class Events {
  start: () => void
  interrupt: () => void
  end: () => void

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
