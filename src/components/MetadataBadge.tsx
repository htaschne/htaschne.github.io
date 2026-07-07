type MetadataBadgeProps = {
  children: string
  tone?: 'default' | 'accent' | 'status'
}

function MetadataBadge({ children, tone = 'default' }: MetadataBadgeProps) {
  return <span className={`metadata-badge metadata-badge--${tone}`}>{children}</span>
}

export default MetadataBadge
