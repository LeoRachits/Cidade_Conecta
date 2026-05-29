import "dotenv/config"
import app from "./app"

const PORT = Number(process.env.PORT) || 3333

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Cidade Conectada CE API rodando na porta ${PORT}`)
  console.log(`Ambiente: ${process.env.NODE_ENV ?? "development"}`)
})
