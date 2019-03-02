import { now, timer, timeout } from 'd3-timer'
import { timingDefaults, extend, getTransitionId, isNamespace } from './utils'
import { Config, Transition, HashMap, Tween } from './types'
import Events from './Events'

export interface TransitionData {
  [key: string]: Transition
}

export interface Node {
  getInterpolator(
    begValue: any,
    endValue: any,
    attr: string,
    nameSpace: string | null,
  ): (t: number) => any
}

abstract class BaseNode implements Node {
  state: HashMap
  private transitionData?: TransitionData

  constructor(state?: HashMap) {
    this.state = state || {}
  }

  transition(config: Array<Config> | Config) {
    if (Array.isArray(config)) {
      for (const item of config) {
        this.parse(item)
      }
    } else {
      this.parse(config)
    }
  }

  isTransitioning() {
    return !!this.transitionData
  }

  stopTransitions() {
    const transitions = this.transitionData

    if (transitions) {
      Object.keys(transitions).forEach(t => {
        transitions[t].timer.stop()
      })
    }
  }

  setState(update: any) {
    if (typeof update === 'function') {
      extend(this.state, update(this.state))
    } else {
      extend(this.state, update)
    }
  }

  abstract getInterpolator(
    begValue: any,
    endValue: any,
    attr: string,
    nameSpace: string | null,
  ): (t: number) => any

  private parse(config: Config) {
    const clone = { ...config }

    const events = new Events(clone)

    if (clone.events) {
      delete clone.events
    }

    const timing = {
      ...timingDefaults,
      ...((clone.timing as object) || {}),
      time: now(),
    }

    if (clone.timing) {
      delete clone.timing
    }

    Object.keys(clone).forEach(stateKey => {
      const tweens: Tween[] = []
      const next = clone[stateKey]

      if (isNamespace(next)) {
        Object.keys(next).forEach(attr => {
          const val = next[attr]

          if (Array.isArray(val)) {
            if (val.length === 1) {
              tweens.push(this.getTween(attr, val[0], stateKey))
            } else {
              this.setState((state: HashMap) => {
                return { [stateKey]: { ...state[stateKey], [attr]: val[0] } }
              })

              tweens.push(this.getTween(attr, val[1], stateKey))
            }
          } else if (typeof val === 'function') {
            const getNameSpacedCustomTween = () => {
              const kapellmeisterNamespacedTween = (t: number) => {
                this.setState((state: HashMap) => {
                  return { [stateKey]: { ...state[stateKey], [attr]: val(t) } }
                })
              }

              return kapellmeisterNamespacedTween
            }

            tweens.push(getNameSpacedCustomTween)
          } else {
            this.setState((state: HashMap) => {
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

  private getTween(attr: string, endValue: any, nameSpace: string | null): Tween {
    return () => {
      const begValue = nameSpace
        ? this.state[nameSpace][attr]
        : this.state[attr]

      if (begValue === endValue) {
        return null
      }

      const i = this.getInterpolator(begValue, endValue, attr, nameSpace)

      let stateTween: (t: number) => void

      if (nameSpace === null) {
        stateTween = (t: number) => {
          this.setState({ [attr]: i(t) })
        }
      } else {
        stateTween = (t: number) => {
          this.setState((state: HashMap) => {
            return { [nameSpace]: { ...state[nameSpace], [attr]: i(t) } }
          })
        }
      }

      return stateTween
    }
  }

  private update(transition: Transition) {
    if (!this.transitionData) {
      this.transitionData = {}
    }

    this.init(getTransitionId(), transition)
  }

  private init(id: number, transition: Transition) {
    const n = transition.tweens.length
    const tweens = new Array(n)

    const queue = (elapsed: number) => {
      transition.status = 1
      transition.timer.restart(
        start,
        transition.timing.delay,
        transition.timing.time,
      )

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
          transition.timer.restart(
            tick,
            transition.timing.delay,
            transition.timing.time,
          )
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
        const res = transition.tweens[i]()

        if (res) {
          tweens[++j] = res
        }
      }

      tweens.length = j + 1
    }

    const tick = (elapsed: number) => {
      let t = 1

      if (elapsed < transition.timing.duration) {
        t = transition.timing.ease(elapsed / transition.timing.duration)
      } else {
        transition.timer.restart(stop)
        transition.status = 5
      }

      let i = -1

      while (++i < tweens.length) {
        tweens[i](t)
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
      for (const _ in this.transitionData) return
      delete this.transitionData
    }
  }
}

export default BaseNode
