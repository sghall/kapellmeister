import { once } from './utils'

export class Events {
  constructor(config) {
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
