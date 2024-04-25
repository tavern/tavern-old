import { getExportFileName, importLineSchema, importQueueItem, updateImports } from '.'

const { test, expect, mock, afterAll } = await import('bun:test')
let globalFetch = globalThis.fetch

afterAll(() => {
  globalThis.fetch = globalFetch
})

test('getExportFileName', () => {
  expect(getExportFileName('movie', new Date('2021-09-01'))).toBe('movie_ids_09_01_2021.json.gz')
})

test('importLineSchema', () => {
  const data = { id: 1, original_title: 'Title', popularity: 1.2, video: false, adult: true }
  expect(importLineSchema.safeParse(data).success).toBe(true)
  expect(importLineSchema.safeParse({ ...data, popularity: '1.2' }).success).toBe(false)
})

test('importQueueItem', () => {
  const data = { id: 1, original_title: 'Title', popularity: 1.2, video: false, adult: true, type: 'movie' }
  expect(importQueueItem.safeParse(data).success).toBe(true)
  expect(importQueueItem.safeParse({ ...data, type: 'invalid' }).success).toBe(false)
})

test('updateImports', async () => {
  const fetch = mock(
    async (_i: string | URL | RequestInfo) =>
      new Response(Buffer.from('{"id":1,"original_title":"Title","popularity":1.2,"video":false,"adult":true}\n')),
  )
  globalThis.fetch = fetch

  await updateImports('movie')
  expect(fetch).toHaveBeenCalledWith(
    `https://files.tmdb.org/p/exports/${getExportFileName('movie', new Date('2021-09-01'))}`,
  )
})
