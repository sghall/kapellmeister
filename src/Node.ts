import BaseNode from './BaseNode'
import { interpolate, interpolateTransformSvg } from 'd3-interpolate'

class Node extends BaseNode {
  getInterpolator(attr: string, begValue: any, endValue: any): (t: number) => any {
    if (attr === 'transform') {
      return interpolateTransformSvg(begValue, endValue)
    }
  
    return interpolate(begValue, endValue)
  }
}

export default Node