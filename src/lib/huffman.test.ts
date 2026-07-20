import assert from 'node:assert/strict'
import test from 'node:test'
import {
  compareNodes,
  countFrequencies,
  createHuffmanSimulation,
  getOrderedCodeRows,
  sanitizeHuffmanInput,
} from './huffman.js'

test('counts frequencies and labels spaces', () => {
  assert.deepEqual(countFrequencies('a b a'), [
    { symbol: ' ', count: 2, label: 'space' },
    { symbol: 'a', count: 2, label: 'a' },
    { symbol: 'b', count: 1, label: 'b' },
  ])
})

test('orders priority nodes by weight, symbol, then id', () => {
  const nodes = [
    { id: 'b', weight: 2, minSymbol: 'b' },
    { id: 'a2', weight: 1, minSymbol: 'a' },
    { id: 'a1', weight: 1, minSymbol: 'a' },
  ].sort(compareNodes)

  assert.deepEqual(
    nodes.map((node) => node.id),
    ['a1', 'a2', 'b'],
  )
})

test('generates a deterministic Huffman tree and codes', () => {
  const first = createHuffmanSimulation('huffman coding')
  const second = createHuffmanSimulation('huffman coding')

  assert.deepEqual(first.codes, second.codes)
  assert.equal(first.steps.length, first.frequencies.length)
  assert.ok(first.root)
  assert.equal(first.payloadBitCount, first.encodedSymbols.reduce((total, entry) => total + entry.code.length, 0))
})

test('generates prefix-free codes from the tree', () => {
  const rows = getOrderedCodeRows(createHuffmanSimulation('banana bandana'))

  for (const left of rows) {
    for (const right of rows) {
      if (left.symbol !== right.symbol) {
        assert.equal(left.code.startsWith(right.code), false)
      }
    }
  }
})

test('handles a single-character input', () => {
  const simulation = createHuffmanSimulation('aaaa')

  assert.deepEqual(simulation.codes, { a: '0' })
  assert.equal(simulation.payloadBitCount, 4)
  assert.equal(simulation.steps.length, 1)
})

test('handles empty input', () => {
  const simulation = createHuffmanSimulation('')

  assert.deepEqual(simulation.frequencies, [])
  assert.deepEqual(simulation.codes, {})
  assert.equal(simulation.root, null)
})

test('handles equal frequencies deterministically', () => {
  const simulation = createHuffmanSimulation('dcba')

  assert.deepEqual(
    simulation.frequencies.map((entry) => entry.symbol),
    ['a', 'b', 'c', 'd'],
  )
  assert.deepEqual(simulation.codes, createHuffmanSimulation('dcba').codes)
})

test('keeps only supported ASCII input for the educational demo', () => {
  assert.equal(sanitizeHuffmanInput('hi π\n!'), 'hi !')
})
