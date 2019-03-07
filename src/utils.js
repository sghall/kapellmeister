let transitionId = 0

export function getTransitionId() {
  return ++transitionId
}

export function extend(obj, props) {
  for (const i in props) {
    obj[i] = props[i]
  }
}

export function once(func) {
  let called = false

  return function transitionEvent() {
    if (!called) {
      called = true
      func.call(this)
    }
  }
}

export function isNamespace(prop) {
  return typeof prop === 'object' && Array.isArray(prop) === false
}

const linear = t => {
  return +t
}

export const timingDefaults = {
  delay: 0,
  duration: 250,
  ease: linear,
}
