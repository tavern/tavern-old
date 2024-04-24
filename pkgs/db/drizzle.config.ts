import env from '@pkgs/env'
import type { Config } from 'drizzle-kit'

export default {
  schema: './index.ts',
  out: './migrations',
  driver: 'turso',
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  },
} satisfies Config
