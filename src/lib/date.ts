const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export function formatContentDate(date: string) {
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? date : dateFormatter.format(parsed)
}
