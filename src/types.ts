import { Timer } from 'd3-timer'

export type AttrValue = any
export type EasingFunction = (t: number) => number
export type Interpolator = (t: number) => void

export type Timing = {
  time: number
  delay: number
  duration: number
  ease: EasingFunction
}

export type Transition = {
  status: number
  timing: Timing
  timer?: Timer
  tweens: Array<Interpolator>
  events: Events
  stateKey: string
}

type Events = {
  start?: () => void
  interrupt?: () => void
  end?: () => void
}

export interface CustomInterpolator {
  (t: number): any
}

export interface NameSpace {
  [key: string]:
    | Array<number>
    | Array<string>
    | number
    | string
    | CustomInterpolator
}

export interface Config {
  timing?: Timing
  events?: Events
  [key: string]:
    | Array<number>
    | Array<string>
    | number
    | string
    | CustomInterpolator
    | NameSpace
}
