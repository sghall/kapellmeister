/* eslint-env mocha */

import { assert } from 'chai'
import BaseNode from './BaseNode'

const interpolateNumber = function(a: number, b: number) {
  return a = +a, b -= a, function(t: number) {
    return a + b * t;
  }
}

class Node extends BaseNode {
  getInterpolator(attr: string, a: number, b: number) {
    return interpolateNumber(a, b)
  }
}

describe('BaseNode', () => {
  it('should instantiate without error', () => {
    const node = new Node()
    assert.isDefined(node)
  })

  it('should have correct public methods', () => {
    const node = new Node()
    assert.isDefined(node.setState)
    assert.isDefined(node.transition)
    assert.isDefined(node.isTransitioning)
    assert.isDefined(node.stopTransitions)
  })

  it('should set values immediately', done => {
    const node = new Node()
    node.setState({ x: 0, y: 0 })
    node.transition({
      x: 1,
      y: 1
    })

    setTimeout(() => {
      assert.strictEqual(node.state.x, 1)
      assert.strictEqual(node.state.y, 1)
      done()
    }, 0)
  })

  it('should set values overtime', done => {
    const node = new Node()
    node.setState({ x: 0, y: 0 })
    node.transition({
      x: [1],
      y: [1]
    })

    setTimeout(() => {
      assert.strictEqual(node.state.x, 0)
      assert.strictEqual(node.state.y, 0)
    }, 0)

    setTimeout(() => {
      assert.isAbove(+node.state.x, 0)
      assert.isBelow(+node.state.x, 1)
      assert.isAbove(+node.state.y, 0)
      assert.isBelow(+node.state.y, 1)
    }, 100)

    setTimeout(() => {
      assert.strictEqual(node.state.x, 1)
      assert.strictEqual(node.state.y, 1)
      done()
    }, 300)
  })
})
