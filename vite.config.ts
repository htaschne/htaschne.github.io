import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { copyFile, readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const virtualContentModuleId = 'virtual:portfolio-content'
const resolvedVirtualContentModuleId = `\0${virtualContentModuleId}`

type ContentKind = 'blog' | 'project'

type ParsedContentEntry = {
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

function asString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback
}

function asTags(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return value.split(',').map((tag) => tag.trim()).filter(Boolean)
  }

  return []
}

function asBoolean(value: unknown) {
  return value === true
}

function asNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function sortByNewest<T extends { date: string }>(entries: T[]) {
  return [...entries].sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0))
}

function getSlug(filename: string) {
  return filename
    .replace(/\.md$/, '')
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean)
    .map((segment) =>
      segment
        .trim()
        .toLowerCase()
        .replace(/[_\s]+/g, '-')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, ''),
    )
    .filter(Boolean)
    .join('-')
}

async function findMarkdownFiles(directory: string, baseDirectory = directory): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const markdownFiles = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        return findMarkdownFiles(entryPath, baseDirectory)
      }

      if (entry.isFile() && entry.name.endsWith('.md')) {
        return [path.relative(baseDirectory, entryPath)]
      }

      return []
    }),
  )

  return markdownFiles.flat().sort()
}

async function loadMarkdownDirectory(contentRoot: string, kind: ContentKind) {
  const directory = path.join(contentRoot, kind === 'blog' ? 'blog' : 'projects')
  const filenames = await findMarkdownFiles(directory)
  const entries: ParsedContentEntry[] = []

  for (const filename of filenames) {
    const filePath = path.join(directory, filename)
    const raw = await readFile(filePath, 'utf8')
    const parsed = matter(raw)
    const slug = getSlug(filename)
    const data = parsed.data
    const entry: ParsedContentEntry = {
      slug,
      title: asString(data.title, slug),
      date: asString(data.date, '1970-01-01'),
      description: asString(data.description, ''),
      tags: asTags(data.tags),
      body: parsed.content.trim(),
    }

    if (kind === 'project') {
      const icon = asString(data.icon, '')
      const hero = asString(data.hero, '')
      const appStore = asString(data.appStore, '')
      const github = asString(data.github, asString(data.repo, ''))
      const website = asString(data.website, asString(data.demo, ''))
      const status = asString(data.status, '')
      const platforms = asTags(data.platforms)
      const technologies = asTags(data.technologies)
      const featured = asBoolean(data.featured)
      const order = asNumber(data.order)

      if (icon) {
        entry.icon = icon
      }

      if (hero) {
        entry.hero = hero
      }

      if (appStore) {
        entry.appStore = appStore
      }

      if (github) {
        entry.github = github
      }

      if (website) {
        entry.website = website
      }

      if (status) {
        entry.status = status
      }

      if (platforms.length > 0) {
        entry.platforms = platforms
      }

      if (technologies.length > 0) {
        entry.technologies = technologies
      }

      if (featured) {
        entry.featured = featured
      }

      if (order !== undefined) {
        entry.order = order
      }
    } else {
      const cover = asString(data.cover, '')

      if (cover) {
        entry.cover = cover
      }
    }

    entries.push(entry)
  }

  return sortByNewest(entries)
}

function portfolioContentPlugin(): Plugin {
  const projectRoot = fileURLToPath(new URL('.', import.meta.url))
  const contentRoot = path.resolve(projectRoot, 'src/content')

  return {
    name: 'portfolio-content',
    configureServer(server) {
      const contentDirectories = ['blog', 'projects'].map((directoryName) => path.join(contentRoot, directoryName))

      server.watcher.add(contentDirectories)
      server.watcher.on('all', (eventName, filePath) => {
        if (!['add', 'change', 'unlink'].includes(eventName) || !filePath.endsWith('.md')) {
          return
        }

        const normalizedFilePath = path.normalize(filePath)
        const isContentFile = contentDirectories.some((directory) =>
          normalizedFilePath.startsWith(`${path.normalize(directory)}${path.sep}`),
        )

        if (!isContentFile) {
          return
        }

        const contentModule = server.moduleGraph.getModuleById(resolvedVirtualContentModuleId)

        if (contentModule) {
          server.moduleGraph.invalidateModule(contentModule)
        }

        server.ws.send({ type: 'full-reload' })
      })
    },
    resolveId(id) {
      return id === virtualContentModuleId ? resolvedVirtualContentModuleId : undefined
    },
    async load(id) {
      if (id !== resolvedVirtualContentModuleId) {
        return undefined
      }

      const blogPosts = await loadMarkdownDirectory(contentRoot, 'blog')
      const projects = await loadMarkdownDirectory(contentRoot, 'project')

      for (const directoryName of ['blog', 'projects']) {
        const directory = path.join(contentRoot, directoryName)
        const filenames = await findMarkdownFiles(directory)

        for (const filename of filenames) {
          this.addWatchFile(path.join(directory, filename))
        }
      }

      return [
        `export const blogPosts = ${JSON.stringify(blogPosts)};`,
        `export const projects = ${JSON.stringify(projects)};`,
      ].join('\n')
    },
  }
}

function githubPagesFallbackPlugin(): Plugin {
  let outDir = ''

  return {
    name: 'github-pages-spa-fallback',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      await copyFile(path.join(outDir, 'index.html'), path.join(outDir, '404.html'))
    },
  }
}

export default defineConfig({
  plugins: [portfolioContentPlugin(), githubPagesFallbackPlugin(), react()],
  base: '/',
})
