/* eslint-env mocha */
import { assert } from 'chai'
import BaseNode from './BaseNode'
const sinon = require('sinon')

const interpolateNumber = (a, b) => {
  return a = +a, b -= a, (t) => {
    return a + b * t
  }
}

class Node extends BaseNode {
  getInterpolator(a, b) {
    return interpolateNumber(a, b)
  }
}

describe('<class BaseNode>', () => {
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
        start: spy,
        interrupt: () => {},
        end: () => {}
      },
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
        interrupt: interruptSpy,
        end: () => {}
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
        interrupt: interruptSpy,
        end: () => {}
      }
    })

    setTimeout(() => {
      node.transition({
        x: [2],
        y: [2],
        events: {
          start: startSpy,
          interrupt: interruptSpy,
          end: () => {}
        }
      })
    }, 100)

    setTimeout(() => {
      assert.strictEqual(startSpy.callCount, 2)
      assert.strictEqual(interruptSpy.callCount, 1)
      done()
    }, 200)
  })

  it('should transition the object given to it', done => {
    const userObject = {
      x: 0,
      y: 0
    }

    const node = new Node(userObject)

    node.transition({
      x: [1],
      y: [1]
    })

    setTimeout(() => {
      assert.strictEqual(userObject.x, 1)
      assert.strictEqual(userObject.y, 1)
      done()
    }, 300)
  })

  it('should transition namespaced items', done => {
    const node = new Node()
    node.setState({
      ns1: {
        x: 1,
        y: 2
      },
      ns2: {
        x: 3,
        y: 4
      }
    })

    node.transition({
      ns1: {
        x: [100],
      },
      ns2: {
        x: [30],
        y: [40, 100]
      }
    })

    setTimeout(() => {
      assert.strictEqual(node.state.ns1.x, 100)
      assert.strictEqual(node.state.ns1.y, 2)
      assert.strictEqual(node.state.ns2.x, 30)
      assert.strictEqual(node.state.ns2.y, 100)
      done()
    }, 300)
  })

  it('should transition mixed attr and namespaced items', done => {
    const node = new Node()
    node.setState({
      x: 1,
      y: 2,
      ns1: {
        x: 3,
        y: 4
      }
    })

    node.transition({
      x: [100],
      ns1: {
        x: [30],
        y: [40, 100]
      }
    })

    setTimeout(() => {
      assert.strictEqual(node.state.x, 100)
      assert.strictEqual(node.state.y, 2)
      assert.strictEqual(node.state.ns1.x, 30)
      assert.strictEqual(node.state.ns1.y, 100)
      done()
    }, 300)
  })

  it('should send correct attr and namespace to getInterpolator', done => {
    let sentX = false
    let sentY = false

    let sentNsX = false
    let sentNsY = false

    // tslint:disable:max-classes-per-file
    class NamespaceNode extends BaseNode {
      getInterpolator(a, b, attr, namespace) {
        if (attr === 'x' && namespace === null) {
          sentX = true
        }

        if (attr === 'y' && namespace === null) {
          sentY = true
        }

        if (attr === 'x' && namespace === 'ns') {
          sentNsX = true
        }

        if (attr === 'y' && namespace === 'ns') {
          sentNsY = true
        }

        return interpolateNumber(a, b)
      }
    }

    const node = new NamespaceNode()

    node.setState({
      x: 1,
      y: 2,
      ns: {
        x: 3,
        y: 4
      }
    })

    node.transition({
      x: [100],
      ns: {
        x: [30],
        y: [40, 100]
      }
    })

    setTimeout(() => {
      assert.strictEqual(sentX, true, 'sentX')
      assert.strictEqual(sentY, false, 'sentY')
      assert.strictEqual(sentNsX, true, 'sentNsX')
      assert.strictEqual(sentNsY, true, 'sentNsY')
      done()
    }, 300)
  })
})
