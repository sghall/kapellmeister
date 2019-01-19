import { EasingFunction } from './types'
import { interpolate, interpolateTransformSvg } from 'd3-interpolate'

let transitionId = 0

export function getTransitionId() {
  return ++transitionId
}

export function extend(obj: object, props: object): object {
  for (const i in props) {
    obj[i] = props[i]
  }

  return obj
}

export function once(func: () => void): () => void {
  let called = false

  return function transitionEvent() {
    if (!called) {
      called = true
      func.call(this)
    }
  }
}

const linear: EasingFunction = (t: number) => {
  return +t
}

export const timingDefaults = {
  delay: 0,
  duration: 250,
  ease: linear,
}

export function getInterpolator(attr: string) {
  if (attr === 'transform') {
    return interpolateTransformSvg
  }

  return interpolate
}