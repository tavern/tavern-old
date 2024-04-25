import { mock } from 'bun:test'

mock.module('@upstash/qstash', () => {
  return {
    Client: class {
      constructor() {}
      batch = async (...args: any[]) => {}
    },
  }
})
