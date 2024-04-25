import env from '@pkgs/env'
import { expect, test, spyOn } from 'bun:test'
import { gzipSync } from 'node:zlib'
import { getExportFileName, importLineSchema, importQueueItem, updateImports } from './import'

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
  const fileName = getExportFileName('movie', new Date())
  const buffer = gzipSync(
    new TextEncoder().encode('{"id":1,"original_title":"Title","popularity":1.2,"video":false,"adult":true}\n'),
  )
  const mockedFetch = spyOn(globalThis, 'fetch').mockResolvedValue(new Response(buffer))
  await updateImports('movie')
  expect(mockedFetch).toHaveBeenCalledTimes(1)
  expect(mockedFetch).toHaveBeenCalledWith(`${env.TMDB_FILES_URL}/${fileName}`)
})
