export type AttrValue = any
export type EasingFunction = (t: number) => number
export type Interpolator = (t: number) => void

export type Timer = {
  stop: () => void
  restart: (action: Interpolator, delay?: number, time?: number) => void
}

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
  events: TransitionEvents
  stateKey: string
}

type TransitionEvents = {
  start?: () => void
  interrupt?: () => void
  end?: () => void
}