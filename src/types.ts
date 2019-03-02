import { Timer } from 'd3-timer'
import Events, { Eventable } from './Events'

export interface HashMap {
  [key: string]: any
}

export { default as BaseNode } from './BaseNode'
export { now, Timer, timer, interval, timeout } from 'd3-timer'

export type EasingFunction = (t: number) => number
export type Interpolator = (t: number) => void
export type Tween = () => ((t: number) => void) | null

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

export type NameSpaceType = number[]
  | string[]
  | number
  | string
  | CustomInterpolator

export interface NameSpace {
  [key: string]: NameSpaceType
}

export interface Config {
  [key: string]:
    | number[]
    | string[]
    | number
    | string
    | CustomInterpolator
    | NameSpace
    | Timing
  events?: Eventable
}

export interface Indexable {
  [key: string]: any
}
