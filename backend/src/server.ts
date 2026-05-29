// src/server.ts
import 'dotenv/config'
import app from './app'

const PORT = process.env.PORT ?? 3333

app.listen(PORT, () => {
  console.log(`ðŸš€ Cidade Conectada CE API rodando em http://localhost:${PORT}`)
  console.log(`ðŸ“š Ambiente: ${process.env.NODE_ENV ?? 'development'}`)
})
