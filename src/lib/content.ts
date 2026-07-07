import { blogPosts as loadedBlogPosts, projects as loadedProjects } from 'virtual:portfolio-content'

type BaseContentEntry = {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  body: string
}

export type BlogPost = BaseContentEntry & {
  kind: 'blog'
  cover?: string
  readingTime?: string
  tldr?: string
  takeaways?: string[]
}

export type Project = BaseContentEntry & {
  kind: 'project'
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

export const blogPosts: BlogPost[] = loadedBlogPosts.map((post) => ({ ...post, kind: 'blog' }))

export const projects: Project[] = loadedProjects.map((project) => ({ ...project, kind: 'project' }))

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug)
}

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug)
}
