// prisma/seed.ts
import { PrismaClient, OccurrenceCategory, OccurrenceStatus, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // ─── MASTER (você - desenvolvedor) ──────────────────────────
  const masterPassword = await bcrypt.hash('172422Al@', 12)
  const master = await prisma.user.upsert({
    where: { email: 'leorachits12@gmail.com' },
    update: { role: UserRole.MASTER, password: masterPassword, mustChangePassword: false },
    create: {
      name: 'Leandro Gonçalves Nascimento',
      email: 'leorachits12@gmail.com',
      password: masterPassword,
      role: UserRole.MASTER,
      mustChangePassword: false,
    },
  })

  // ─── ADMIN (prefeitura - login com usuário ADM) ─────────────
  const admPassword = await bcrypt.hash('ADM@123', 12)
  const adm = await prisma.user.upsert({
    where: { username: 'ADM' },
    update: {},
    create: {
      name: 'Administrador Prefeitura',
      email: 'adm@horizonte.ce.gov.br',
      username: 'ADM',
      password: admPassword,
      role: UserRole.ADMIN,
      mustChangePassword: true,
    },
  })

  // ─── CIDADÃO de exemplo ─────────────────────────────────────
  const citizenPassword = await bcrypt.hash('Cidadao@123', 12)
  const citizen = await prisma.user.upsert({
    where: { email: 'leandro@email.com' },
    update: {},
    create: {
      name: 'Leandro Cidadão',
      email: 'leandro@email.com',
      password: citizenPassword,
      phone: '(85) 99999-0000',
      role: UserRole.CITIZEN,
    },
  })

  console.log('✅ Seed concluído!')
  console.log('   MASTER:  leorachits12@gmail.com / 172422Al@')
  console.log('   ADMIN:   ADM / ADM@123 (troca obrigatória no 1º acesso)')
  console.log('   CIDADÃO: leandro@email.com / Cidadao@123')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })