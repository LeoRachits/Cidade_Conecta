// prisma/seed.ts
import { PrismaClient, OccurrenceCategory, OccurrenceStatus, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Admin padrão
  const adminPassword = await bcrypt.hash('Admin@123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@horizonte.ce.gov.br' },
    update: {},
    create: {
      name: 'Administrador Municipal',
      email: 'admin@horizonte.ce.gov.br',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  })

  // Usuário cidadão de exemplo
  const citizenPassword = await bcrypt.hash('Cidadao@123', 12)
  const citizen = await prisma.user.upsert({
    where: { email: 'leandro@email.com' },
    update: {},
    create: {
      name: 'Leandro Gonçalves Nascimento',
      email: 'leandro@email.com',
      password: citizenPassword,
      phone: '(85) 99999-0000',
      role: UserRole.CITIZEN,
    },
  })

  // Ocorrências de exemplo
  const occurrences = [
    {
      title: 'Buraco na Rua das Flores',
      description: 'Grande buraco no meio da via, causando risco aos veículos e pedestres.',
      category: OccurrenceCategory.ROAD,
      status: OccurrenceStatus.OPEN,
      latitude: -3.8672,
      longitude: -38.4986,
      address: 'Rua das Flores, 120',
      neighborhood: 'Centro',
      userId: citizen.id,
    },
    {
      title: 'Poste apagado na Rua XV de Novembro',
      description: 'Poste de iluminação pública sem funcionar há 3 dias.',
      category: OccurrenceCategory.LIGHTING,
      status: OccurrenceStatus.UNDER_REVIEW,
      latitude: -3.8695,
      longitude: -38.4970,
      address: 'Rua XV de Novembro, 45',
      neighborhood: 'Jereissati',
      userId: citizen.id,
    },
    {
      title: 'Lixo irregular na Av. Boa Vista',
      description: 'Descarte irregular de lixo volumoso na calçada há mais de uma semana.',
      category: OccurrenceCategory.GARBAGE,
      status: OccurrenceStatus.IN_PROGRESS,
      latitude: -3.8710,
      longitude: -38.5002,
      address: 'Av. Boa Vista, 300',
      neighborhood: 'Vila União',
      userId: citizen.id,
    },
    {
      title: 'Alagamento após chuva na Rua Principal',
      description: 'Rua fica completamente alagada em dias de chuva, bloqueando o tráfego.',
      category: OccurrenceCategory.FLOODING,
      status: OccurrenceStatus.RESOLVED,
      latitude: -3.8650,
      longitude: -38.4995,
      address: 'Rua Principal, s/n',
      neighborhood: 'Parque das Flores',
      userId: citizen.id,
    },
  ]

  for (const occ of occurrences) {
    await prisma.occurrence.create({ data: occ })
  }

  console.log('✅ Seed concluído!')
  console.log(`   Admin: admin@horizonte.ce.gov.br / Admin@123`)
  console.log(`   Cidadão: leandro@email.com / Cidadao@123`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
