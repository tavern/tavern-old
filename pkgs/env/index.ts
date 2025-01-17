import { config } from 'dotenv'
import { z } from 'zod'

const workspace = process.cwd().split('/').slice(0, -2).join('/')

const dotenv = config({
  path: [
    `${workspace}/.env`,
    `${workspace}/.env.local`,
    `${workspace}/.env.${process.env.NODE_ENV}`,
    `${workspace}/.env.${process.env.NODE_ENV}.local`,
  ],
})

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(4321),
  DATABASE_URL: z.string(),
  DATABASE_AUTH_TOKEN: z.string().optional(),
  TMDB_API_KEY: z.string().optional(),
  TMDB_ACCESS_TOKEN: z.string(),
  TMDB_API_URL: z.string(),
  TMDB_FILES_URL: z.string(),
  QSTASH_URL: z.string(),
  QSTASH_TOKEN: z.string(),
})

export type Env = z.infer<typeof envSchema>

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}

export default envSchema.parse({ ...process.env, ...dotenv.parsed })
