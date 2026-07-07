type ActionButtonProps = {
  href: string
  children: string
  kind?: 'app-store' | 'github' | 'website'
}

function ActionIcon({ kind }: { kind: NonNullable<ActionButtonProps['kind']> }) {
  if (kind === 'app-store') {
    return null
  }

  if (kind === 'github') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.589 2 12.248c0 4.527 2.865 8.367 6.839 9.722.5.096.682-.223.682-.495 0-.245-.009-.894-.014-1.754-2.782.617-3.37-1.373-3.37-1.373-.455-1.184-1.11-1.498-1.11-1.498-.908-.637.069-.624.069-.624 1.004.072 1.532 1.055 1.532 1.055.892 1.565 2.341 1.113 2.91.851.09-.664.35-1.113.636-1.369-2.221-.261-4.555-1.14-4.555-5.074 0-1.121.39-2.038 1.029-2.756-.103-.262-.446-1.317.098-2.746 0 0 .84-.276 2.75 1.053A9.325 9.325 0 0 1 12 6.836a9.29 9.29 0 0 1 2.504.346c1.909-1.329 2.748-1.053 2.748-1.053.545 1.429.202 2.484.1 2.746.64.718 1.028 1.635 1.028 2.756 0 3.944-2.338 4.81-4.566 5.066.359.317.679.942.679 1.899 0 1.371-.012 2.476-.012 2.813 0 .274.18.596.688.494C19.138 20.611 22 16.773 22 12.248 22 6.589 17.523 2 12 2Z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.25 5a.75.75 0 0 1 0-1.5h5.5c.41 0 .75.34.75.75v5.5a.75.75 0 0 1-1.5 0V6.06l-8.22 8.22a.75.75 0 1 1-1.06-1.06L16.94 5h-3.69ZM5.5 6.75c0-.69.56-1.25 1.25-1.25h3a.75.75 0 0 0 0-1.5h-3A2.75 2.75 0 0 0 4 6.75v10.5A2.75 2.75 0 0 0 6.75 20h10.5A2.75 2.75 0 0 0 20 17.25v-3a.75.75 0 0 0-1.5 0v3c0 .69-.56 1.25-1.25 1.25H6.75c-.69 0-1.25-.56-1.25-1.25V6.75Z" />
    </svg>
  )
}

function ActionButton({ href, children, kind = 'website' }: ActionButtonProps) {
  return (
    <a href={href} className={`action-button action-button--${kind}`} target="_blank" rel="noreferrer">
      <ActionIcon kind={kind} />
      <span>{children}</span>
    </a>
  )
}

export default ActionButton
