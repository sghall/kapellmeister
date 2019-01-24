import { Timer } from 'd3-timer'
import Events from './Events'

export interface HashMap {
  [key: string]: any
}

export { default as BaseNode } from './BaseNode'
export { now, Timer, timer, interval, timeout } from 'd3-timer'

export type EasingFunction = (t: number) => number
export type Interpolator = (t: number) => void

export interface Timing {
  time: number
  delay: number
  duration: number
  ease: EasingFunction
}

export interface Transition {
  status: number
  timing: Timing
  timer?: Timer
  tweens: Array<() => Interpolator>
  events: Events
  stateKey: string
}

export type CustomInterpolator = (t: number) => any

export interface NameSpace {
  [key: string]:
    | Array<number>
    | Array<string>
    | number
    | string
    | CustomInterpolator
}

export interface Config {
  [key: string]:
    | Array<number>
    | Array<string>
    | number
    | string
    | CustomInterpolator
    | NameSpace
    | Events
    | Timing
}
