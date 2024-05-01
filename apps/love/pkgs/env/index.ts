import { config } from 'dotenv'
import { z } from 'zod'

const workspace = process.cwd().split('/').slice(0, -4).join('/')
const parent = process.cwd().split('/').slice(0, -2).join('/')

const workspaceEnv = config({
  path: [
    `${workspace}/.env`,
    `${workspace}/.env.local`,
    `${workspace}/.env.${process.env.NODE_ENV}`,
    `${workspace}/.env.${process.env.NODE_ENV}.local`,
  ],
})

const parentEnv = config({
  path: [
    `${parent}/.env`,
    `${parent}/.env.local`,
    `${parent}/.env.${process.env.NODE_ENV}`,
    `${parent}/.env.${process.env.NODE_ENV}.local`,
  ],
})

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(4321),
  DATABASE_URL: z.string(),
  DATABASE_AUTH_TOKEN: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}

export default envSchema.parse({ ...process.env, ...workspaceEnv.parsed, ...parentEnv.parsed })
