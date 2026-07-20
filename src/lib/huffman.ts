export const HUFFMAN_DEFAULT_INPUT = 'huffman coding'
export const HUFFMAN_MAX_INPUT_LENGTH = 40
export const HUFFMAN_MAX_UNIQUE_SYMBOLS = 12

export type FrequencyEntry = {
  symbol: string
  count: number
  label: string
}

export type HuffmanNode = {
  id: string
  weight: number
  minSymbol: string
  symbol?: string
  left?: HuffmanNode
  right?: HuffmanNode
}

export type HuffmanBuildStep = {
  queue: HuffmanNode[]
  selectedNodeIds: string[]
  combinedNodeId?: string
  description: string
}

export type HuffmanSimulation = {
  input: string
  frequencies: FrequencyEntry[]
  steps: HuffmanBuildStep[]
  root: HuffmanNode | null
  codes: Record<string, string>
  encodedSymbols: EncodedSymbol[]
  payloadBitCount: number
  naiveBitCount: number
  estimatedMetadataBits: number
  warning?: string
}

export type EncodedSymbol = {
  index: number
  symbol: string
  label: string
  code: string
}

export function symbolLabel(symbol: string) {
  if (symbol === ' ') {
    return 'space'
  }

  return symbol
}

export function sanitizeHuffmanInput(input: string) {
  return Array.from(input)
    .filter((character) => character === ' ' || (character >= '!' && character <= '~'))
    .join('')
    .slice(0, HUFFMAN_MAX_INPUT_LENGTH)
}

export function countFrequencies(input: string) {
  const counts = new Map<string, number>()

  for (const symbol of input) {
    counts.set(symbol, (counts.get(symbol) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([symbol, count]) => ({ symbol, count, label: symbolLabel(symbol) }))
    .sort(compareFrequencies)
}

export function compareFrequencies(left: FrequencyEntry, right: FrequencyEntry) {
  return right.count - left.count || left.symbol.localeCompare(right.symbol)
}

export function compareNodes(left: HuffmanNode, right: HuffmanNode) {
  return left.weight - right.weight || left.minSymbol.localeCompare(right.minSymbol) || left.id.localeCompare(right.id)
}

function cloneQueue(queue: HuffmanNode[]) {
  return queue.map((node) => node)
}

function describeNode(node: HuffmanNode) {
  return node.symbol === undefined ? `node ${node.weight}` : `"${symbolLabel(node.symbol)}" (${node.weight})`
}

function buildCodes(node: HuffmanNode | null, prefix = '', codes: Record<string, string> = {}) {
  if (!node) {
    return codes
  }

  if (node.symbol !== undefined) {
    codes[node.symbol] = prefix || '0'
    return codes
  }

  buildCodes(node.left ?? null, `${prefix}0`, codes)
  buildCodes(node.right ?? null, `${prefix}1`, codes)
  return codes
}

export function createHuffmanSimulation(rawInput: string): HuffmanSimulation {
  const sanitizedInput = sanitizeHuffmanInput(rawInput)
  const allFrequencies = countFrequencies(sanitizedInput)
  const frequencies = allFrequencies.slice(0, HUFFMAN_MAX_UNIQUE_SYMBOLS)
  const includedSymbols = new Set(frequencies.map((entry) => entry.symbol))
  const input = Array.from(sanitizedInput)
    .filter((symbol) => includedSymbols.has(symbol))
    .join('')
  const warning =
    allFrequencies.length > HUFFMAN_MAX_UNIQUE_SYMBOLS
      ? `This demo keeps the ${HUFFMAN_MAX_UNIQUE_SYMBOLS} most frequent symbols so the tree stays readable. Shorten the input to inspect every character.`
      : undefined

  if (frequencies.length === 0) {
    return {
      input,
      frequencies,
      steps: [
        {
          queue: [],
          selectedNodeIds: [],
          description: 'Add a few ASCII characters to build a Huffman tree.',
        },
      ],
      root: null,
      codes: {},
      encodedSymbols: [],
      payloadBitCount: 0,
      naiveBitCount: 0,
      estimatedMetadataBits: 0,
      warning,
    }
  }

  const queue: HuffmanNode[] = frequencies
    .map((entry) => ({
      id: `leaf-${entry.symbol.charCodeAt(0)}`,
      weight: entry.count,
      minSymbol: entry.symbol,
      symbol: entry.symbol,
    }))
    .sort(compareNodes)

  const steps: HuffmanBuildStep[] = [
    {
      queue: cloneQueue(queue),
      selectedNodeIds: [],
      description:
        frequencies.length === 1
          ? 'Only one symbol is present, so it receives the single-bit code 0.'
          : 'Start with one leaf node per character, ordered by frequency.',
    },
  ]

  let internalIndex = 0

  while (queue.length > 1) {
    queue.sort(compareNodes)
    const left = queue.shift()
    const right = queue.shift()

    if (!left || !right) {
      break
    }

    const parent: HuffmanNode = {
      id: `internal-${internalIndex}`,
      weight: left.weight + right.weight,
      minSymbol: left.minSymbol.localeCompare(right.minSymbol) <= 0 ? left.minSymbol : right.minSymbol,
      left,
      right,
    }

    internalIndex += 1
    queue.push(parent)
    queue.sort(compareNodes)

    steps.push({
      queue: cloneQueue(queue),
      selectedNodeIds: [left.id, right.id],
      combinedNodeId: parent.id,
      description: `Combining ${describeNode(left)} and ${describeNode(right)} into a node with weight ${parent.weight}.`,
    })
  }

  const root = queue[0] ?? null
  const codes = buildCodes(root)
  const encodedSymbols = Array.from(input).map((symbol, index) => ({
    index,
    symbol,
    label: symbolLabel(symbol),
    code: codes[symbol] ?? '',
  }))
  const payloadBitCount = encodedSymbols.reduce((total, entry) => total + entry.code.length, 0)

  return {
    input,
    frequencies,
    steps,
    root,
    codes,
    encodedSymbols,
    payloadBitCount,
    naiveBitCount: input.length * 8,
    estimatedMetadataBits: frequencies.length * 72 + 208,
    warning,
  }
}

export function getOrderedCodeRows(simulation: HuffmanSimulation) {
  return simulation.frequencies.map((entry) => ({
    ...entry,
    code: simulation.codes[entry.symbol] ?? '',
  }))
}
