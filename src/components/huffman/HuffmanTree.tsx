import type { HuffmanNode } from '../../lib/huffman'
import { symbolLabel } from '../../lib/huffman'

type PositionedNode = {
  node: HuffmanNode
  x: number
  y: number
  depth: number
}

type PositionedEdge = {
  from: PositionedNode
  to: PositionedNode
  bit: '0' | '1'
}

type HuffmanTreeProps = {
  roots: HuffmanNode[]
  selectedNodeIds?: string[]
  combinedNodeId?: string
  activeNodeId?: string
  activePathNodeIds?: string[]
  showEdgeLabels?: boolean
}

function leafCount(node: HuffmanNode): number {
  if (!node.left && !node.right) {
    return 1
  }

  return leafCount(node.left ?? node) + leafCount(node.right ?? node)
}

function layoutTree(
  node: HuffmanNode,
  startX: number,
  width: number,
  depth: number,
  nodes: PositionedNode[],
  edges: PositionedEdge[],
) {
  const positioned: PositionedNode = {
    node,
    x: startX + width / 2,
    y: 42 + depth * 86,
    depth,
  }

  nodes.push(positioned)

  if (node.left) {
    const leftWidth = (width * leafCount(node.left)) / leafCount(node)
    const child = layoutTree(node.left, startX, leftWidth, depth + 1, nodes, edges)
    edges.push({ from: positioned, to: child, bit: '0' })
  }

  if (node.right) {
    const leftWidth = node.left ? (width * leafCount(node.left)) / leafCount(node) : 0
    const child = layoutTree(node.right, startX + leftWidth, width - leftWidth, depth + 1, nodes, edges)
    edges.push({ from: positioned, to: child, bit: '1' })
  }

  return positioned
}

function getMaxDepth(node: HuffmanNode): number {
  return Math.max(node.left ? getMaxDepth(node.left) + 1 : 0, node.right ? getMaxDepth(node.right) + 1 : 0)
}

function layoutForest(roots: HuffmanNode[]) {
  const nodes: PositionedNode[] = []
  const edges: PositionedEdge[] = []
  const totalLeaves = roots.reduce((total, root) => total + leafCount(root), 0)
  const totalWidth = Math.max(720, totalLeaves * 76)
  let cursor = 28

  for (const root of roots) {
    const width = Math.max(64, (leafCount(root) / Math.max(1, totalLeaves)) * (totalWidth - 56))
    layoutTree(root, cursor, width, 0, nodes, edges)
    cursor += width
  }

  const maxDepth = roots.reduce((depth, root) => Math.max(depth, getMaxDepth(root)), 0)

  return {
    edges,
    nodes,
    viewBox: `0 0 ${totalWidth} ${Math.max(160, 96 + maxDepth * 86)}`,
  }
}

function nodeTitle(node: HuffmanNode) {
  if (node.symbol === undefined) {
    return `Internal node with weight ${node.weight}`
  }

  return `Leaf for ${symbolLabel(node.symbol)} with frequency ${node.weight}`
}

function classNames(...names: Array<string | false | undefined>) {
  return names.filter(Boolean).join(' ')
}

function HuffmanTree({
  roots,
  selectedNodeIds = [],
  combinedNodeId,
  activeNodeId,
  activePathNodeIds = [],
  showEdgeLabels = false,
}: HuffmanTreeProps) {
  if (roots.length === 0) {
    return <div className="huffman-tree-empty">Type a few ASCII characters to build the tree.</div>
  }

  const selected = new Set(selectedNodeIds)
  const activePath = new Set(activePathNodeIds)
  const layout = layoutForest(roots)

  return (
    <svg className="huffman-tree" viewBox={layout.viewBox} role="img" aria-label="Huffman tree visualization">
      {layout.edges.map((edge) => {
        const isActive = activePath.has(edge.from.node.id) && activePath.has(edge.to.node.id)

        return (
          <g key={`${edge.from.node.id}-${edge.to.node.id}`}>
            <line
              className={classNames('huffman-tree__edge', isActive && 'huffman-tree__edge--active')}
              x1={edge.from.x}
              y1={edge.from.y + 24}
              x2={edge.to.x}
              y2={edge.to.y - 24}
            />
            {showEdgeLabels && (
              <text
                className="huffman-tree__edge-label"
                x={(edge.from.x + edge.to.x) / 2}
                y={(edge.from.y + edge.to.y) / 2 - 5}
              >
                {edge.bit}
              </text>
            )}
          </g>
        )
      })}

      {layout.nodes.map(({ node, x, y }) => {
        const isLeaf = node.symbol !== undefined
        const isSelected = selected.has(node.id)
        const isCombined = combinedNodeId === node.id
        const isActive = activeNodeId === node.id || activePath.has(node.id)

        return (
          <g
            key={node.id}
            className={classNames(
              'huffman-tree__node',
              isLeaf && 'huffman-tree__node--leaf',
              isSelected && 'huffman-tree__node--selected',
              isCombined && 'huffman-tree__node--combined',
              isActive && 'huffman-tree__node--active',
            )}
            transform={`translate(${x} ${y})`}
          >
            <title>{nodeTitle(node)}</title>
            <circle r="25" />
            <text y={isLeaf ? -2 : 5}>{isLeaf ? symbolLabel(node.symbol ?? '') : node.weight}</text>
            {isLeaf && <text className="huffman-tree__weight" y="14">{node.weight}</text>}
          </g>
        )
      })}
    </svg>
  )
}

export default HuffmanTree
