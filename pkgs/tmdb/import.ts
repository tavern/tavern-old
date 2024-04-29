import env from '@pkgs/env'
import '@total-typescript/ts-reset'
import { Client as QStashClient } from '@upstash/qstash'
import { formatDate } from 'date-fns/format'
import { gunzipSync } from 'node:zlib'
import { z } from 'zod'

export const importTypes = [
  'movie',
  'tv_series',
  'person',
  'collection',
  'tv_network',
  'keyword',
  'production_company',
] as const

type ImportType = (typeof importTypes)[number]

export const getExportFileName = (type: ImportType, date = new Date()) =>
  `${type}_ids_${formatDate(date, 'MM_dd_yyyy')}.json.gz`

const qstash = new QStashClient({ token: env.QSTASH_TOKEN })

export const importLineSchema = z.object({
  id: z.number().int(),
  original_title: z.string(),
  popularity: z.number().default(0),
  video: z.boolean().default(false),
  adult: z.boolean().default(false),
})

export const importQueueItem = importLineSchema.extend({ type: z.enum(importTypes) })
export type ImportQueueItem = z.infer<typeof importQueueItem>

export const updateImports = async (type: ImportType) => {
  const file = await fetch(`${env.TMDB_FILES_URL}/${getExportFileName(type)}`)
  const buffer = gunzipSync(await file.arrayBuffer())

  const parseLine = (line: string) => {
    if (!line) return
    const { data } = importLineSchema.safeParse(JSON.parse(line))
    return data
  }

  const text = new TextDecoder().decode(buffer)

  const lines = text
    .split(/\n/)
    .map(parseLine)
    .filter(Boolean)
    // TODO: remove splice after testing, it only prevents processing the whole file
    .splice(10)

  const batchItems = lines.map(line => ({
    body: JSON.stringify({ ...line, type }),
    topic: `tmdb_import_${type}`,
    headers: { 'Content-Type': 'application/json' },
  }))

  await qstash.batch(batchItems)
}

export const processImport = async (item: ImportQueueItem) => {
  const { id, type, ...rest } = item
  return item
}
