// backend/src/services/email.service.ts
// Sistema de Notificacao por E-mail — Cidade Conectada CE
// Utiliza Resend (API HTTP) — compativel com o Render (sem SMTP bloqueado)
import { Resend } from 'resend'
import { OccurrenceCategory, OccurrenceStatus } from '@prisma/client'

const resend = new Resend(process.env.RESEND_API_KEY)

// Remetente. Sem dominio proprio verificado, o Resend exige onboarding@resend.dev
const FROM = process.env.EMAIL_FROM_RESEND ?? 'Cidade Conectada CE <onboarding@resend.dev>'

// Durante os testes (Resend sem dominio), todos os e-mails so podem ser entregues
// para o e-mail dono da conta Resend. Definimos abaixo. Em producao com dominio
// proprio, basta limpar TEST_REDIRECT para enviar aos destinatarios reais.
const TEST_REDIRECT = process.env.EMAIL_TEST_REDIRECT ?? 'cidadeconectada.horizonte@gmail.com'

export interface OccurrenceEmailData {
  id: string
  title: string
  description: string
  category: OccurrenceCategory
  status: OccurrenceStatus
  latitude: number
  longitude: number
  address?: string
  neighborhood?: string
  photoUrl?: string
  createdAt: Date
  citizen: {
    name: string
    email: string
    phone?: string
  }
}

function getPrefeituraRecipients(category: OccurrenceCategory): string[] {
  const base = [
    process.env.EMAIL_PREFEITURA ?? 'gabinete@horizonte.ce.gov.br',
    process.env.EMAIL_INFRAESTRUTURA ?? 'seinfra@horizonte.ce.gov.br',
  ]
  if (category === OccurrenceCategory.GARBAGE) return [...base, process.env.EMAIL_MEIO_AMBIENTE ?? 'meioambiente@horizonte.ce.gov.br']
  if (category === OccurrenceCategory.WATER) return [...base, process.env.EMAIL_CAGECE ?? 'privacidadededados@cagece.com.br']
  if (category === OccurrenceCategory.ENERGY) return [...base, process.env.EMAIL_ENEL ?? 'atendimento@enel.com.br']
  return base
}

const CATEGORY_LABELS: Record<OccurrenceCategory, string> = {
  ROAD: '🛣️ Via / Buraco / Calçada',
  LIGHTING: '💡 Iluminação Pública',
  GARBAGE: '🗑️ Lixo Irregular',
  FLOODING: '🌊 Alagamento',
  WATER: '💧 Falta de Água (Cagece)',
  ENERGY: '⚡ Falta de Luz (Enel)',
  OTHER: '📌 Outro',
}

const STATUS_LABELS: Record<OccurrenceStatus, string> = {
  OPEN: 'Aberto',
  UNDER_REVIEW: 'Em Análise',
  IN_PROGRESS: 'Em Andamento',
  RESOLVED: 'Resolvido',
  REJECTED: 'Rejeitado',
}

const STATUS_COLORS: Record<OccurrenceStatus, string> = {
  OPEN: '#E74C3C',
  UNDER_REVIEW: '#F39C12',
  IN_PROGRESS: '#2980B9',
  RESOLVED: '#27AE60',
  REJECTED: '#95A5A6',
}

function buildPrefeituraEmailHtml(data: OccurrenceEmailData): string {
  const googleMapsUrl = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`
  const adminUrl = `${process.env.APP_URL ?? 'http://localhost:5173'}/ocorrencias/${data.id}`
  const statusColor = STATUS_COLORS[data.status]
  const categoryLabel = CATEGORY_LABELS[data.category]
  const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Fortaleza',
  }).format(new Date(data.createdAt))

  return `
<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F0F4FB;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A3560;"><tr><td align="center" style="padding:28px 20px;">
    <h1 style="margin:0;color:#fff;font-size:24px;">🏙️ Cidade Conectada CE</h1>
    <p style="margin:6px 0 0;color:#BDD3F5;font-size:13px;">Prefeitura Municipal de Horizonte — Sistema de Ocorrências Urbanas</p>
  </td></tr></table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${statusColor};"><tr><td align="center" style="padding:14px 20px;">
    <p style="margin:0;color:#fff;font-size:15px;font-weight:bold;">🚨 NOVA OCORRÊNCIA REGISTRADA — Ação Necessária</p>
  </td></tr></table>
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td style="padding:28px 32px 0;">
        <h2 style="margin:0;color:#1A3560;font-size:20px;">${data.title}</h2>
        <p style="margin:8px 0 0;color:#666;font-size:13px;">Registrada em ${dataFormatada}</p>
      </td></tr>
      <tr><td style="padding:16px 32px 0;">
        <span style="display:inline-block;background:${statusColor};color:#fff;font-size:12px;font-weight:bold;padding:4px 12px;border-radius:20px;">${STATUS_LABELS[data.status]}</span>
        <span style="display:inline-block;background:#EBF1FB;color:#1A3560;font-size:12px;font-weight:bold;padding:4px 12px;border-radius:20px;margin-left:8px;">${categoryLabel}</span>
      </td></tr>
      <tr><td style="padding:20px 32px 0;">
        <p style="margin:0;color:#333;font-size:14px;line-height:1.6;background:#F8F9FA;padding:14px;border-radius:8px;border-left:4px solid #2E5FA3;">${data.description}</p>
      </td></tr>
      <tr><td style="padding:20px 32px 0;">
        <p style="margin:0;font-size:13px;color:#333;"><strong>📍 Local:</strong> ${data.address ?? 'Não informado'}${data.neighborhood ? ` — ${data.neighborhood}` : ''}</p>
        <p style="margin:8px 0 0;font-size:13px;color:#333;"><strong>👤 Cidadão:</strong> ${data.citizen.name} (${data.citizen.email})${data.citizen.phone ? ` — ${data.citizen.phone}` : ''}</p>
        <p style="margin:8px 0 0;font-size:13px;color:#333;"><strong>🗺️ GPS:</strong> ${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}</p>
      </td></tr>
      ${data.photoUrl ? `<tr><td style="padding:20px 32px 0;"><img src="${data.photoUrl}" alt="Foto" style="width:100%;max-width:536px;border-radius:8px;border:1px solid #eee;display:block;"/></td></tr>` : ''}
      <tr><td style="padding:24px 32px 32px;">
        <a href="${adminUrl}" style="display:inline-block;background:#1A3560;color:#fff;text-decoration:none;font-size:13px;font-weight:bold;padding:12px 24px;border-radius:8px;margin-right:8px;">⚙️ Acessar Painel</a>
        <a href="${googleMapsUrl}" style="display:inline-block;background:#27AE60;color:#fff;text-decoration:none;font-size:13px;font-weight:bold;padding:12px 24px;border-radius:8px;">🗺️ Ver no Mapa</a>
      </td></tr>
    </table>
  </td></tr></table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A3560;"><tr><td align="center" style="padding:20px;">
    <p style="margin:0;color:#BDD3F5;font-size:11px;">Cidade Conectada CE — Prefeitura Municipal de Horizonte/CE</p>
  </td></tr></table>
</body></html>`
}

function buildCitizenConfirmationHtml(data: OccurrenceEmailData): string {
  const adminUrl = `${process.env.APP_URL ?? 'http://localhost:5173'}/ocorrencias/${data.id}`
  const categoryLabel = CATEGORY_LABELS[data.category]
  const recipients = getPrefeituraRecipients(data.category)
  return `
<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F0F4FB;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A3560;"><tr><td align="center" style="padding:24px;">
    <h1 style="margin:0;color:#fff;font-size:22px;">🏙️ Cidade Conectada CE</h1>
  </td></tr></table>
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 16px;">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;padding:32px;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
      <tr><td>
        <div style="text-align:center;margin-bottom:24px;">
          <div style="font-size:48px;">✅</div>
          <h2 style="margin:12px 0 4px;color:#1A3560;font-size:20px;">Ocorrência registrada com sucesso!</h2>
          <p style="margin:0;color:#666;font-size:14px;">Olá, <strong>${data.citizen.name}</strong>! Sua denúncia foi recebida e <strong>encaminhada com sucesso</strong> ao órgão responsável.</p>
        </div>
        <div style="background:#EBF1FB;border-radius:8px;padding:16px;margin-bottom:20px;">
          <p style="margin:0 0 6px;font-size:13px;color:#333;"><strong>Título:</strong> ${data.title}</p>
          <p style="margin:0 0 6px;font-size:13px;color:#333;"><strong>Categoria:</strong> ${categoryLabel}</p>
          <p style="margin:0 0 6px;font-size:13px;color:#333;"><strong>Encaminhado para:</strong> ${recipients.join(', ')}</p>
          <p style="margin:0;font-size:13px;color:#333;"><strong>Protocolo:</strong> ${data.id}</p>
        </div>
        <p style="font-size:13px;color:#555;line-height:1.6;">Você receberá atualizações por e-mail conforme o status da sua ocorrência mudar. Acompanhe também pelo app ou site.</p>
        <div style="text-align:center;margin-top:24px;">
          <a href="${adminUrl}" style="display:inline-block;background:#2E5FA3;color:#fff;text-decoration:none;font-size:13px;font-weight:bold;padding:12px 32px;border-radius:8px;">Acompanhar minha ocorrência</a>
        </div>
      </td></tr>
    </table>
  </td></tr></table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A3560;"><tr><td align="center" style="padding:16px;">
    <p style="margin:0;color:#BDD3F5;font-size:11px;">Cidade Conectada CE — Horizonte/CE | Projeto Acadêmico 2026</p>
  </td></tr></table>
</body></html>`
}

function buildStatusUpdateHtml(data: OccurrenceEmailData, newStatus: OccurrenceStatus, comment?: string): string {
  const adminUrl = `${process.env.APP_URL ?? 'http://localhost:5173'}/ocorrencias/${data.id}`
  const statusColor = STATUS_COLORS[newStatus]
  return `
<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F0F4FB;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A3560;"><tr><td align="center" style="padding:24px;">
    <h1 style="margin:0;color:#fff;font-size:22px;">🏙️ Cidade Conectada CE</h1>
  </td></tr></table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${statusColor};"><tr><td align="center" style="padding:12px;">
    <p style="margin:0;color:#fff;font-size:14px;font-weight:bold;">Status atualizado: ${STATUS_LABELS[newStatus]}</p>
  </td></tr></table>
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 16px;">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;padding:32px;">
      <tr><td>
        <p style="font-size:14px;color:#333;">Olá, <strong>${data.citizen.name}</strong>!</p>
        <p style="font-size:14px;color:#555;line-height:1.6;">Sua ocorrência <strong>"${data.title}"</strong> teve o status atualizado para:</p>
        <div style="text-align:center;margin:20px 0;">
          <span style="display:inline-block;background:${statusColor};color:#fff;font-size:16px;font-weight:bold;padding:10px 28px;border-radius:24px;">${STATUS_LABELS[newStatus]}</span>
        </div>
        ${comment ? `<div style="background:#F8F9FA;border-left:4px solid ${statusColor};padding:14px;border-radius:0 8px 8px 0;margin:16px 0;"><p style="margin:0;font-size:13px;color:#333;"><strong>Comentário:</strong><br/>${comment}</p></div>` : ''}
        <div style="text-align:center;margin-top:24px;">
          <a href="${adminUrl}" style="display:inline-block;background:#2E5FA3;color:#fff;text-decoration:none;font-size:13px;font-weight:bold;padding:12px 32px;border-radius:8px;">Ver detalhes</a>
        </div>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`
}

// Envia via Resend. Durante testes, redireciona tudo para o e-mail da conta.
async function send(to: string | string[], subject: string, html: string): Promise<void> {
  const recipients = TEST_REDIRECT ? [TEST_REDIRECT] : (Array.isArray(to) ? to : [to])
  const { error } = await resend.emails.send({ from: FROM, to: recipients, subject, html })
  if (error) {
    console.error('❌ Resend erro:', error)
    throw new Error(typeof error === 'string' ? error : JSON.stringify(error))
  }
  console.log(`📧 E-mail enviado para ${recipients.join(', ')} — "${subject}"`)
}

export async function notifyPrefeitura(data: OccurrenceEmailData): Promise<void> {
  const recipients = getPrefeituraRecipients(data.category)
  await send(recipients, `🚨 [Cidade Conectada CE] Nova Ocorrência: ${data.title}`, buildPrefeituraEmailHtml(data))
}

export async function confirmCitizenRegistration(data: OccurrenceEmailData): Promise<void> {
  await send(data.citizen.email, `✅ Ocorrência registrada e encaminhada: ${data.title}`, buildCitizenConfirmationHtml(data))
}

export async function notifyCitizenStatusUpdate(data: OccurrenceEmailData, newStatus: OccurrenceStatus, comment?: string): Promise<void> {
  await send(data.citizen.email, `📋 Atualização: "${data.title}" — ${STATUS_LABELS[newStatus]}`, buildStatusUpdateHtml(data, newStatus, comment))
}

export async function sendNewOccurrenceNotifications(data: OccurrenceEmailData): Promise<void> {
  const results = await Promise.allSettled([
    notifyPrefeitura(data),
    confirmCitizenRegistration(data),
  ])
  results.forEach((r, i) => {
    if (r.status === 'rejected') console.error(`❌ Falha no e-mail [${i}]:`, r.reason)
  })
}

// --- E-mail de redefinicao de senha -----------------------------
export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<void> {
  const html = `
<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F0F4FB;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A3560;"><tr><td align="center" style="padding:24px;">
    <h1 style="margin:0;color:#fff;font-size:22px;">??? Cidade Conectada CE</h1>
  </td></tr></table>
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 16px;">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;padding:32px;">
      <tr><td>
        <div style="text-align:center;margin-bottom:20px;"><div style="font-size:48px;">??</div>
          <h2 style="margin:12px 0 4px;color:#1A3560;font-size:20px;">Redefini��o de Senha</h2></div>
        <p style="font-size:14px;color:#555;line-height:1.6;">Ol�, <strong>${name}</strong>! Recebemos um pedido para redefinir a senha da sua conta. Clique no bot�o abaixo para criar uma nova senha:</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${resetUrl}" style="display:inline-block;background:#2E5FA3;color:#fff;text-decoration:none;font-size:14px;font-weight:bold;padding:14px 36px;border-radius:8px;">Redefinir minha senha</a>
        </div>
        <p style="font-size:12px;color:#888;line-height:1.6;">Este link expira em 1 hora. Se voc� n�o solicitou a redefini��o, ignore este e-mail � sua senha permanece a mesma.</p>
        <p style="font-size:11px;color:#aaa;margin-top:16px;word-break:break-all;">Ou copie este link: ${resetUrl}</p>
      </td></tr>
    </table>
  </td></tr></table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A3560;"><tr><td align="center" style="padding:16px;">
    <p style="margin:0;color:#BDD3F5;font-size:11px;">Cidade Conectada CE � Horizonte/CE</p>
  </td></tr></table>
</body></html>`
  await send(to, '?? Redefini��o de senha � Cidade Conectada CE', html)
}
