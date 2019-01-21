import { now, timer, timeout } from 'd3-timer'
import {
  once,
  timingDefaults,
  extend,
  getTransitionId,
} from './utils'
import {
  Config,
  Transition
} from './types'

class BaseNode {
  state: object
  private transitionData: object

  constructor(state?: object) {
    this.state = state || {} 
  }

  animate(config: Array<Config> | Config) {
    if (Array.isArray(config)) {
      for (let i = 0; i < config.length; i++) {
        this.parse(config[i])
      }
    } else {
      this.parse(config)
    }
  }

  isAnimating() {
    return !!this.transitionData
  }

  setState(update: object) {
    if (typeof update === 'function') {
      extend(this.state, update(this.state))
    } else {
      extend(this.state, update)
    }
  }

  private parse(config: Config): void {
    const transitions = { ...config }
  
    const events = transitions.events || {}
  
    if (transitions.events) {
      delete transitions.events
    }
  
    const timing = { ...timingDefaults, ...transitions.timing || {}, time: now() }
  
    if (transitions.timing) {
      delete transitions.timing
    }
  
    Object.keys(events).forEach(d => {
      if (typeof events[d] !== 'function') {
        throw new Error('Event handlers must be a function')
      } else {
        events[d] = once(events[d])
      }
    })
  
    Object.keys(transitions).forEach((stateKey) => {
      const tweens = []
      const next = transitions[stateKey]
  
      if (
        typeof next === 'object' &&
        Array.isArray(next) === false
      ) {
        Object.keys(next).forEach((attr) => {
          const val = next[attr]
  
          if (Array.isArray(val)) {
            if (val.length === 1) {
              tweens.push(this.getTween(attr, val[0], stateKey))
            } else {
              this.setState((state: object) => {
                return { [stateKey]: { ...state[stateKey], [attr]: val[0] } }
              })
  
              tweens.push(this.getTween(attr, val[1], stateKey))
            }
          } else if (typeof val === 'function') {
            const getNameSpacedCustomTween = () => {
              const kapellmeisterNamespacedTween = (t: number) => {
                this.setState((state: object) => {
                  return { [stateKey]: { ...state[stateKey], [attr]: val(t) } }
                })
              }
  
              return kapellmeisterNamespacedTween
            }
  
            tweens.push(getNameSpacedCustomTween)
          } else {
            this.setState((state: object) => {
              return { [stateKey]: { ...state[stateKey], [attr]: val } }
            })
  
            tweens.push(this.getTween(attr, val, stateKey))
          }
        })
      } else {  
        if (Array.isArray(next)) {
          if (next.length === 1) {
            tweens.push(this.getTween(stateKey, next[0], null))
          } else {
            this.setState({ [stateKey]: next[0] })
            tweens.push(this.getTween(stateKey, next[1], null))
          }
        } else if (typeof next === 'function') {
          const getCustomTween = () => {
            const kapellmeisterTween = (t: number) => {
              this.setState({ [stateKey]: next(t) })
            }
  
            return kapellmeisterTween
          }
  
          tweens.push(getCustomTween)
        } else {
          this.setState({ [stateKey]: next })
          tweens.push(this.getTween(stateKey, next, null))
        }
      }
  
      this.update({ stateKey, timing, tweens, events, status: 0 })
    })
  }

  private update(config: Transition) {    
    if (!this.transitionData) {
      this.transitionData = {}
    }
  
    this.init(getTransitionId(), config)
  }
  
  private init(id: number, transition: Transition) {  
    const n = transition.tweens.length
    const tweens = new Array(n)
    
    const queue = (elapsed: number) => {
      transition.status = 1
      transition.timer.restart(start, transition.timing.delay, transition.timing.time)
      
      if (transition.timing.delay <= elapsed) {
        start(elapsed - transition.timing.delay)
      }
    }

    this.transitionData[id] = transition
    transition.timer = timer(queue, 0, transition.timing.time)
    
    const start = (elapsed: number) => {
      if (transition.status !== 1) return stop()
  
      for (const tid in this.transitionData) {
        const t: Transition = this.transitionData[tid]
  
        if (t.stateKey !== transition.stateKey) {
          continue
        }
  
        if (t.status === 3) {
          return timeout(start)
        }
  
        if (t.status === 4) {
          t.status = 6
          t.timer.stop()
  
          if (t.events.interrupt) {
            t.events.interrupt.call(this)
          }
          
          delete this.transitionData[tid]
        } else if (+tid < id) {
          t.status = 6
          t.timer.stop()
          
          delete this.transitionData[tid]
        }
      }
  
      timeout(() => {
        if (transition.status === 3) {
          transition.status = 4
          transition.timer.restart(tick, transition.timing.delay, transition.timing.time)
          tick(elapsed)
        }
      })
  
      transition.status = 2
      
      if (transition.events.start) {
        transition.events.start.call(this)
      }
  
      if (transition.status !== 2) {
        return
      }
  
      transition.status = 3
  
      let j = -1
  
      for (let i = 0; i < n; ++i) {
        const res = transition.tweens[i].call(this)
  
        if (res) {
          tweens[++j] = res
        }
      }
  
      tweens.length = j + 1
    }
  
    const tick = (elapsed: number) => {
      let t = 1
  
      if (elapsed < transition.timing.duration) {
        t = transition.timing.ease.call(null, elapsed / transition.timing.duration)
      } else {
        transition.timer.restart(stop)
        transition.status = 5
      }
  
      let i = -1
  
      while (++i < tweens.length) {
        tweens[i].call(null, t)
      }
  
      if (transition.status === 5) {
        if (transition.events.end) {
          transition.events.end.call(this)
        }
  
        stop()
      }
    }
  
    const stop = () => {
      transition.status = 6
      transition.timer.stop()
  
      delete this.transitionData[id]
      for (const i in this.transitionData) return
      delete this.transitionData
    }
  }

  getTween(attr: string, value: any, nameSpace: string) {
    return () => {
      const value0 = nameSpace ? this.state[nameSpace][attr] : this.state[attr]
  
      if (value0 === value) {
        return null
      }
  
      const i = this.getInterpolator(attr, value0, value)
  
      let stateTween: (t: number) => void
  
      if (nameSpace === null) {
        stateTween = (t: number) => {
          this.setState({ [attr]: i(t) })
        }
      } else {
        stateTween = (t: number) => {
          this.setState((state: object) => {
            const data = { [nameSpace]: { ...state[nameSpace], [attr]: i(t) } }
            return data
          })
        }
      }
  
      return stateTween
    }
  }

  getInterpolator(attr: string, begValue: any, endValue: any): (t: number) => any {
    throw new Error('You must implement getInterpolator.')
  }

  stopAnimating() {
    const transitions = this.transitionData
  
    if (transitions) {
      Object.keys(transitions).forEach((t) => {
        transitions[t].timer.stop()
      })
    }
  }

}

export default BaseNode