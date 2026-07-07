/// <reference types="vite/client" />

declare module 'virtual:portfolio-content' {
  type LoadedContentEntry = {
    slug: string
    title: string
    date: string
    description: string
    tags: string[]
    body: string
    cover?: string
    icon?: string
    hero?: string
    appStore?: string
    github?: string
    website?: string
    status?: string
    platforms?: string[]
    technologies?: string[]
    featured?: boolean
    order?: number
  }

  export const blogPosts: LoadedContentEntry[]
  export const projects: LoadedContentEntry[]
}
