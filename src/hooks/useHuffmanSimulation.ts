import { useMemo, useState } from 'react'
import { HUFFMAN_DEFAULT_INPUT, createHuffmanSimulation, sanitizeHuffmanInput } from '../lib/huffman'

export function useHuffmanSimulation() {
  const [input, setInput] = useState(HUFFMAN_DEFAULT_INPUT)
  const simulation = useMemo(() => createHuffmanSimulation(input), [input])

  return {
    input,
    setInput: (nextInput: string) => setInput(sanitizeHuffmanInput(nextInput)),
    simulation,
  }
}
