import { useEffect, useMemo, useRef, useState } from 'react'
import { useHuffmanSimulation } from '../../hooks/useHuffmanSimulation'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import {
  HUFFMAN_MAX_INPUT_LENGTH,
  HUFFMAN_MAX_UNIQUE_SYMBOLS,
  getOrderedCodeRows,
  symbolLabel,
  type HuffmanNode,
  type HuffmanSimulation,
} from '../../lib/huffman'
import HuffmanTree from './HuffmanTree'

type DemoKind = 'frequency' | 'tree' | 'codes' | 'encoding'

type HuffmanDemoProps = {
  kind: DemoKind
}

function classNames(...names: Array<string | false | undefined>) {
  return names.filter(Boolean).join(' ')
}

function DemoShell({ kind, children }: { kind: DemoKind; children: React.ReactNode }) {
  return (
    <section className={`huffman-demo huffman-demo--${kind}`} aria-label={`Interactive Huffman ${kind} demo`}>
      {children}
    </section>
  )
}

function DemoInput({
  input,
  onInputChange,
  warning,
}: {
  input: string
  onInputChange: (input: string) => void
  warning?: string
}) {
  return (
    <div className="huffman-input-panel">
      <label htmlFor="huffman-demo-input">Try a short ASCII string</label>
      <input
        id="huffman-demo-input"
        value={input}
        maxLength={HUFFMAN_MAX_INPUT_LENGTH}
        onChange={(event) => onInputChange(event.target.value)}
        aria-describedby="huffman-demo-input-note"
      />
      <p id="huffman-demo-input-note">
        Basic printable ASCII only. The real Hz compressor works on arbitrary bytes, but this keeps characters and
        bytes aligned for the explanation.
      </p>
      {warning && <p className="huffman-demo__warning">{warning}</p>}
    </div>
  )
}

function FrequencyChart({
  simulation,
  input,
  onInputChange,
}: {
  simulation: HuffmanSimulation
  input: string
  onInputChange: (input: string) => void
}) {
  const maxCount = Math.max(1, ...simulation.frequencies.map((entry) => entry.count))

  return (
    <>
      <DemoInput input={input} onInputChange={onInputChange} warning={simulation.warning} />
      <div className="frequency-chart" aria-label="Character frequency chart">
        {simulation.frequencies.length === 0 ? (
          <p className="huffman-demo__empty">Type a few characters to see their frequencies.</p>
        ) : (
          simulation.frequencies.map((entry) => (
            <div className="frequency-row" key={entry.symbol}>
              <span className="frequency-row__symbol" aria-label={`Character ${entry.label}`}>
                {entry.label}
              </span>
              <div className="frequency-row__track">
                <span className="frequency-row__bar" style={{ width: `${(entry.count / maxCount) * 100}%` }} />
              </div>
              <span className="frequency-row__count">{entry.count}</span>
            </div>
          ))
        )}
      </div>
      <p className="huffman-demo__takeaway">
        The tree starts from these weights. Repeated symbols are pulled higher in the final tree because shorter paths
        save more bits.
      </p>
    </>
  )
}

function TreeBuildControls({
  stepIndex,
  stepCount,
  isPlaying,
  onPrevious,
  onNext,
  onRestart,
  onTogglePlay,
  onSelectStep,
}: {
  stepIndex: number
  stepCount: number
  isPlaying: boolean
  onPrevious: () => void
  onNext: () => void
  onRestart: () => void
  onTogglePlay: () => void
  onSelectStep: (index: number) => void
}) {
  return (
    <div className="tree-controls">
      <div className="tree-controls__buttons">
        <button type="button" onClick={onPrevious} disabled={stepIndex === 0} aria-label="Previous Huffman tree step">
          Previous
        </button>
        <button type="button" onClick={onTogglePlay} aria-label={isPlaying ? 'Pause tree animation' : 'Play tree animation'}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={stepIndex >= stepCount - 1}
          aria-label="Next Huffman tree step"
        >
          Next
        </button>
        <button type="button" onClick={onRestart} aria-label="Restart Huffman tree animation">
          Restart
        </button>
      </div>

      <div className="tree-stepper" aria-label="Tree build steps">
        {Array.from({ length: stepCount }, (_, index) => (
          <button
            className={classNames('tree-stepper__dot', index === stepIndex && 'tree-stepper__dot--active')}
            key={index}
            type="button"
            onClick={() => onSelectStep(index)}
            aria-label={`Show step ${index + 1}`}
            aria-current={index === stepIndex ? 'step' : undefined}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

function useVisiblePlayback(ref: React.RefObject<HTMLElement | null>, allowPlayback: boolean) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const element = ref.current

    if (!element || typeof IntersectionObserver === 'undefined') {
      return
    }

    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.2 })
    observer.observe(element)

    return () => observer.disconnect()
  }, [ref])

  return allowPlayback && isVisible
}

function TreeConstructionDemo({
  simulation,
  input,
  onInputChange,
}: {
  simulation: HuffmanSimulation
  input: string
  onInputChange: (input: string) => void
}) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const containerRef = useRef<HTMLElement | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const canAutoPlay = useVisiblePlayback(containerRef, isPlaying && !prefersReducedMotion)
  const steps = simulation.steps
  const activeStep = steps[Math.min(stepIndex, steps.length - 1)]

  useEffect(() => {
    if (!canAutoPlay || stepIndex >= steps.length - 1) {
      return
    }

    const timer = window.setTimeout(() => {
      setStepIndex((currentStep) => {
        const nextStep = Math.min(currentStep + 1, steps.length - 1)

        if (nextStep >= steps.length - 1) {
          setIsPlaying(false)
        }

        return nextStep
      })
    }, 1100)
    return () => window.clearTimeout(timer)
  }, [canAutoPlay, stepIndex, steps.length])

  return (
    <section ref={containerRef} className="huffman-demo__playback">
      <DemoInput input={input} onInputChange={onInputChange} warning={simulation.warning} />
      <TreeBuildControls
        stepIndex={stepIndex}
        stepCount={steps.length}
        isPlaying={isPlaying}
        onPrevious={() => setStepIndex((currentStep) => Math.max(0, currentStep - 1))}
        onNext={() => setStepIndex((currentStep) => Math.min(steps.length - 1, currentStep + 1))}
        onRestart={() => {
          setStepIndex(0)
          setIsPlaying(false)
        }}
        onTogglePlay={() => setIsPlaying((playing) => (prefersReducedMotion ? false : !playing))}
        onSelectStep={(index) => setStepIndex(index)}
      />

      <p className="tree-status" aria-live="polite">
        {activeStep.description}
      </p>

      <div className="huffman-tree-frame">
        <HuffmanTree
          roots={activeStep.queue}
          selectedNodeIds={activeStep.selectedNodeIds}
          combinedNodeId={activeStep.combinedNodeId}
          showEdgeLabels={stepIndex === steps.length - 1}
        />
      </div>

      <p className="huffman-demo__takeaway">
        Huffman repeatedly combines the two lightest nodes. Deterministic tie-breaking keeps the same input from
        producing a different tree on the next render.
      </p>
    </section>
  )
}

function findPath(root: HuffmanNode | null, symbol: string, path: HuffmanNode[] = []): HuffmanNode[] {
  if (!root) {
    return []
  }

  const nextPath = [...path, root]

  if (root.symbol === symbol) {
    return nextPath
  }

  return findPath(root.left ?? null, symbol, nextPath).concat(findPath(root.right ?? null, symbol, nextPath)).slice(0, 20)
}

function CodeTable({
  simulation,
  activeSymbol,
}: {
  simulation: HuffmanSimulation
  activeSymbol?: string
}) {
  return (
    <div className="markdown-table-scroll huffman-code-table-wrap">
      <table className="huffman-code-table">
        <thead>
          <tr>
            <th>Character</th>
            <th>Frequency</th>
            <th>Huffman Code</th>
          </tr>
        </thead>
        <tbody>
          {getOrderedCodeRows(simulation).map((row) => (
            <tr key={row.symbol} className={row.symbol === activeSymbol ? 'huffman-code-table__row--active' : undefined}>
              <td>{row.label}</td>
              <td>{row.count}</td>
              <td>
                <code>{row.code}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CodeGenerationDemo({
  simulation,
  input,
  onInputChange,
}: {
  simulation: HuffmanSimulation
  input: string
  onInputChange: (input: string) => void
}) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const rows = getOrderedCodeRows(simulation)
  const activeRow = rows[Math.min(activeIndex, rows.length - 1)]
  const activePath = useMemo(
    () => findPath(simulation.root, activeRow?.symbol ?? '').map((node) => node.id),
    [simulation.root, activeRow?.symbol],
  )

  useEffect(() => {
    if (prefersReducedMotion || rows.length <= 1) {
      return
    }

    const timer = window.setTimeout(() => setActiveIndex((index) => (index + 1) % rows.length), 1500)
    return () => window.clearTimeout(timer)
  }, [activeIndex, prefersReducedMotion, rows.length])

  return (
    <>
      <DemoInput input={input} onInputChange={onInputChange} warning={simulation.warning} />
      <div className="huffman-codes-grid">
        <div className="huffman-tree-frame">
          <HuffmanTree
            roots={simulation.root ? [simulation.root] : []}
            activeNodeId={activePath.at(-1)}
            activePathNodeIds={activePath}
            showEdgeLabels
          />
        </div>
        <div className="huffman-code-panel">
          <p aria-live="polite">
            {activeRow
              ? `Following the path to "${activeRow.label}" produces ${activeRow.code || 'no bits yet'}. Left edges add 0, right edges add 1.`
              : 'Add input to generate codes.'}
          </p>
          <CodeTable simulation={simulation} activeSymbol={activeRow?.symbol} />
        </div>
      </div>
      <p className="huffman-demo__takeaway">
        Codes are not assigned independently. Each one is the exact path from the final root to a leaf.
      </p>
    </>
  )
}

function EncodingWalkthrough({
  simulation,
  input,
  onInputChange,
}: {
  simulation: HuffmanSimulation
  input: string
  onInputChange: (input: string) => void
}) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const symbols = simulation.encodedSymbols
  const activeSymbol = symbols[Math.min(activeIndex, symbols.length - 1)]
  const encodedPrefix = symbols
    .slice(0, activeIndex + 1)
    .map((entry) => entry.code)
    .join('')
  const totalWithMetadata = simulation.payloadBitCount + simulation.estimatedMetadataBits

  useEffect(() => {
    if (prefersReducedMotion || symbols.length <= 1) {
      return
    }

    const timer = window.setTimeout(() => setActiveIndex((index) => (index + 1) % symbols.length), 1000)
    return () => window.clearTimeout(timer)
  }, [activeIndex, prefersReducedMotion, symbols.length])

  return (
    <>
      <DemoInput input={input} onInputChange={onInputChange} warning={simulation.warning} />
      <div className="encoding-grid">
        <div className="encoding-source" aria-label="Input characters">
          {symbols.length === 0 ? (
            <span className="huffman-demo__empty">No characters yet.</span>
          ) : (
            symbols.map((entry, index) => (
              <button
                className={classNames('encoding-symbol', index === activeIndex && 'encoding-symbol--active')}
                key={`${entry.symbol}-${entry.index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show code for ${entry.label} at position ${index + 1}`}
              >
                {symbolLabel(entry.symbol)}
              </button>
            ))
          )}
        </div>

        <div className="encoding-current">
          <span>Current code</span>
          <strong>{activeSymbol ? `${activeSymbol.label} -> ${activeSymbol.code}` : 'none'}</strong>
        </div>

        <div className="encoding-stream" aria-label="Encoded Huffman bitstream">
          <code>{encodedPrefix || 'bits will appear here'}</code>
        </div>
      </div>

      <div className="bit-summary" aria-label="Bit count comparison">
        <div>
          <span>Naive ASCII</span>
          <strong>{simulation.naiveBitCount} bits</strong>
        </div>
        <div>
          <span>Huffman payload</span>
          <strong>{simulation.payloadBitCount} bits</strong>
        </div>
        <div>
          <span>Conceptual tree/header overhead</span>
          <strong>~{simulation.estimatedMetadataBits} bits</strong>
        </div>
        <div>
          <span>Payload + overhead</span>
          <strong>~{totalWithMetadata} bits</strong>
        </div>
      </div>

      <p className="huffman-demo__takeaway">
        The payload can be shorter while the complete archive is larger for tiny inputs. Real compressors have to store
        enough metadata for decompression.
      </p>
    </>
  )
}

function HuffmanDemo({ kind }: HuffmanDemoProps) {
  const { input, setInput, simulation } = useHuffmanSimulation()

  return (
    <DemoShell kind={kind}>
      {kind === 'frequency' && <FrequencyChart input={input} onInputChange={setInput} simulation={simulation} />}
      {kind === 'tree' && (
        <TreeConstructionDemo key={simulation.input} input={input} onInputChange={setInput} simulation={simulation} />
      )}
      {kind === 'codes' && (
        <CodeGenerationDemo key={simulation.input} input={input} onInputChange={setInput} simulation={simulation} />
      )}
      {kind === 'encoding' && (
        <EncodingWalkthrough key={simulation.input} input={input} onInputChange={setInput} simulation={simulation} />
      )}
      <p className="huffman-demo__limit">
        Demo limit: {HUFFMAN_MAX_INPUT_LENGTH} ASCII characters, up to {HUFFMAN_MAX_UNIQUE_SYMBOLS} unique symbols.
      </p>
    </DemoShell>
  )
}

export default HuffmanDemo
