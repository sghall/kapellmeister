import { interpolate, interpolateTransformSvg } from 'd3-interpolate'

export function getInterpolator(attr: string) {
  if (attr === 'transform') {
    return interpolateTransformSvg
  }

  return interpolate
}

function getTween(nameSpace: string, attr: string, value1: any) {
  return () => {
    const value0 = nameSpace ? this.state[nameSpace][attr] : this.state[attr]

    if (value0 === value1) {
      return null
    }

    const i = getInterpolator(attr)(value0, value1)

    let stateTween: (t: number) => void

    if (nameSpace === null) {
      stateTween = (t: number) => {
        this.setState({ [attr]: i(t) })
      }
    } else {
      stateTween = (t: number) => {
        this.setState((state: object) => {
          return { [nameSpace]: { ...state[nameSpace], [attr]: i(t) } }
        })
      }
    }

    return stateTween
  }
}

export default function (nameSpace: string, attr: string, value: any) {
  return getTween.call(this, nameSpace, attr, value)
}
