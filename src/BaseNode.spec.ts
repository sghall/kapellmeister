/* eslint-env mocha */
const sinon = require('sinon')
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

  it('should call start event', done => {
    const spy = sinon.spy()

    const node = new Node()
    node.setState({ x: 0, y: 0 })
    node.transition({
      x: [1],
      y: [1],
      events: {
        start: spy
      }
    })

    setTimeout(() => {
      assert.strictEqual(spy.callCount, 1)
      done()
    }, 100)
  })

  it('should NOT call interrupt when no update occurs', done => {
    const startSpy = sinon.spy()
    const interruptSpy = sinon.spy()

    const node = new Node()
    node.setState({ x: 0, y: 0 })
    node.transition({
      x: [1],
      y: [1],
      events: {
        start: startSpy,
        interrupt: interruptSpy
      }
    })

    setTimeout(() => {
      assert.strictEqual(startSpy.callCount, 1)
      assert.strictEqual(interruptSpy.callCount, 0)
      done()
    }, 100)
  })

  it('should call interrupt when update occurs', done => {
    const startSpy = sinon.spy()
    const interruptSpy = sinon.spy()

    const node = new Node()
    node.setState({ x: 0, y: 0 })
    node.transition({
      x: [1],
      y: [1],
      events: {
        start: startSpy,
        interrupt: interruptSpy
      }
    })

    setTimeout(() => {
      node.transition({
        x: [2],
        y: [2],
        events: {
          start: startSpy,
          interrupt: interruptSpy
        }
      })
    }, 100)

    setTimeout(() => {
      assert.strictEqual(startSpy.callCount, 2)
      assert.strictEqual(interruptSpy.callCount, 1)
      done()
    }, 200)
  })
})
