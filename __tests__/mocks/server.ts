import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** Shared MSW node server used across all integration tests */
export const server = setupServer(...handlers)
