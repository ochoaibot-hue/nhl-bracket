import Fastify from 'fastify'
import { bracketRoutes } from './routes/bracket'
import { drilldownRoutes } from './routes/drilldown'
import { rankingsRoutes } from './routes/rankings'

const app = Fastify({ logger: true })

app.get('/api/health', async () => ({ ok: true, name: 'nhl-bracket', now: new Date().toISOString() }))

await bracketRoutes(app)
await rankingsRoutes(app)
await drilldownRoutes(app)

const port = Number(process.env.PORT ?? 3000)
const host = process.env.HOST ?? '0.0.0.0'

try {
  await app.listen({ port, host })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
