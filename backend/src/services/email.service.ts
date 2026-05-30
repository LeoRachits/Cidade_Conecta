// backend/src/services/email.service.ts
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Sistema de NotificaÃ§Ã£o por E-mail â€” CidadeAlerta CE
// Utiliza Nodemailer + Gmail SMTP (gratuito)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import nodemailer from 'nodemailer'
import { OccurrenceCategory, OccurrenceStatus } from '@prisma/client'

// â”€â”€â”€ Tipos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ ConfiguraÃ§Ã£o do transporte â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
    tls: { family: 4 },
  } as any)
}

// â”€â”€â”€ DestinatÃ¡rios da Prefeitura â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function getPrefeituraRecipients(category: OccurrenceCategory): string[] {
  const base = [
    process.env.EMAIL_PREFEITURA      ?? 'gabinete@horizonte.ce.gov.br',
    process.env.EMAIL_INFRAESTRUTURA  ?? 'seinfra@horizonte.ce.gov.br',
  ]
  if (category === OccurrenceCategory.GARBAGE) {
    return [...base, process.env.EMAIL_MEIO_AMBIENTE ?? 'meioambiente@horizonte.ce.gov.br']
  }
  if (category === OccurrenceCategory.WATER) {
    return [...base, process.env.EMAIL_CAGECE ?? 'privacidadededados@cagece.com.br']
  }
  if (category === OccurrenceCategory.ENERGY) {
    return [...base, process.env.EMAIL_ENEL ?? 'atendimento@enel.com.br']
  }
  return base
}
// â”€â”€â”€ Labels legÃ­veis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const CATEGORY_LABELS: Record<OccurrenceCategory, string> = {
  ROAD:     'ðŸ›£ï¸ Via / Buraco / CalÃ§ada',
  LIGHTING: 'ðŸ’¡ IluminaÃ§Ã£o PÃºblica',
  GARBAGE:  'ðŸ—‘ï¸ Lixo Irregular',
  FLOODING: 'ðŸŒŠ Alagamento',
  WATER:    'ðŸ’§ Falta de Ãgua (Cagece)',
  ENERGY:   'âš¡ Falta de Luz (Enel)',
  OTHER:    'ðŸ“Œ Outro',
}

const STATUS_LABELS: Record<OccurrenceStatus, string> = {
  OPEN:         'Aberto',
  UNDER_REVIEW: 'Em AnÃ¡lise',
  IN_PROGRESS:  'Em Andamento',
  RESOLVED:     'Resolvido',
  REJECTED:     'Rejeitado',
}

const STATUS_COLORS: Record<OccurrenceStatus, string> = {
  OPEN:         '#E74C3C',
  UNDER_REVIEW: '#F39C12',
  IN_PROGRESS:  '#2980B9',
  RESOLVED:     '#27AE60',
  REJECTED:     '#95A5A6',
}

// â”€â”€â”€ Template HTML da notificaÃ§Ã£o Ã  Prefeitura â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function buildPrefeituraEmailHtml(data: OccurrenceEmailData): string {
  const googleMapsUrl = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`
  const adminUrl = `${process.env.APP_URL ?? 'http://localhost:5173'}/ocorrencias/${data.id}`
  const statusColor = STATUS_COLORS[data.status]
  const categoryLabel = CATEGORY_LABELS[data.category]
  const statusLabel = STATUS_LABELS[data.status]
  const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Fortaleza',
  }).format(new Date(data.createdAt))

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nova OcorrÃªncia â€” CidadeAlerta CE</title>
</head>
<body style="margin:0;padding:0;background:#F0F4FB;font-family:Arial,sans-serif;">

  <!-- Header -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A3560;">
    <tr>
      <td align="center" style="padding:28px 20px;">
        <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;">
          ðŸ™ï¸ CidadeAlerta CE
        </h1>
        <p style="margin:6px 0 0;color:#BDD3F5;font-size:13px;">
          Prefeitura Municipal de Horizonte â€” Sistema de OcorrÃªncias Urbanas
        </p>
      </td>
    </tr>
  </table>

  <!-- Alert banner -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${statusColor};">
    <tr>
      <td align="center" style="padding:14px 20px;">
        <p style="margin:0;color:#ffffff;font-size:15px;font-weight:bold;">
          ðŸš¨ NOVA OCORRÃŠNCIA REGISTRADA â€” AÃ§Ã£o NecessÃ¡ria
        </p>
      </td>
    </tr>
  </table>

  <!-- Body -->
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;overflow:hidden;
                      box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Title -->
          <tr>
            <td style="padding:28px 32px 0;">
              <h2 style="margin:0;color:#1A3560;font-size:20px;">${data.title}</h2>
              <p style="margin:8px 0 0;color:#666;font-size:13px;">
                Registrada em ${dataFormatada}
              </p>
            </td>
          </tr>

          <!-- Status badge -->
          <tr>
            <td style="padding:16px 32px 0;">
              <span style="display:inline-block;background:${statusColor};color:#fff;
                           font-size:12px;font-weight:bold;padding:4px 12px;border-radius:20px;">
                ${statusLabel}
              </span>
              <span style="display:inline-block;background:#EBF1FB;color:#1A3560;
                           font-size:12px;font-weight:bold;padding:4px 12px;
                           border-radius:20px;margin-left:8px;">
                ${categoryLabel}
              </span>
            </td>
          </tr>

          <!-- Description -->
          <tr>
            <td style="padding:20px 32px 0;">
              <p style="margin:0;color:#333;font-size:14px;line-height:1.6;
                        background:#F8F9FA;padding:14px;border-radius:8px;
                        border-left:4px solid #2E5FA3;">
                ${data.description}
              </p>
            </td>
          </tr>

          <!-- Info grid -->
          <tr>
            <td style="padding:20px 32px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding:0 8px 12px 0;vertical-align:top;">
                    <p style="margin:0;font-size:11px;color:#888;font-weight:bold;text-transform:uppercase;">
                      ðŸ“ LocalizaÃ§Ã£o
                    </p>
                    <p style="margin:4px 0 0;font-size:13px;color:#333;">
                      ${data.address ?? 'NÃ£o informado'}<br/>
                      ${data.neighborhood ? `Bairro: ${data.neighborhood}` : ''}
                    </p>
                  </td>
                  <td width="50%" style="padding:0 0 12px 8px;vertical-align:top;">
                    <p style="margin:0;font-size:11px;color:#888;font-weight:bold;text-transform:uppercase;">
                      ðŸ‘¤ CidadÃ£o
                    </p>
                    <p style="margin:4px 0 0;font-size:13px;color:#333;">
                      ${data.citizen.name}<br/>
                      ${data.citizen.email}
                      ${data.citizen.phone ? `<br/>${data.citizen.phone}` : ''}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding:0 8px 0 0;vertical-align:top;">
                    <p style="margin:0;font-size:11px;color:#888;font-weight:bold;text-transform:uppercase;">
                      ðŸ—ºï¸ Coordenadas GPS
                    </p>
                    <p style="margin:4px 0 0;font-size:13px;color:#333;">
                      Lat: ${data.latitude.toFixed(6)}<br/>
                      Lng: ${data.longitude.toFixed(6)}
                    </p>
                  </td>
                  <td width="50%" style="padding:0 0 0 8px;vertical-align:top;">
                    <p style="margin:0;font-size:11px;color:#888;font-weight:bold;text-transform:uppercase;">
                      ðŸ†” ID da OcorrÃªncia
                    </p>
                    <p style="margin:4px 0 0;font-size:11px;color:#555;word-break:break-all;">
                      ${data.id}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${data.photoUrl ? `
          <!-- Photo -->
          <tr>
            <td style="padding:20px 32px 0;">
              <p style="margin:0 0 8px;font-size:11px;color:#888;font-weight:bold;text-transform:uppercase;">
                ðŸ“· Foto da OcorrÃªncia
              </p>
              <img src="${process.env.APP_URL ?? 'http://localhost:5173'}${data.photoUrl}"
                   alt="Foto da ocorrÃªncia"
                   style="width:100%;max-width:536px;border-radius:8px;
                          border:1px solid #eee;display:block;" />
            </td>
          </tr>` : ''}

          <!-- CTA Buttons -->
          <tr>
            <td style="padding:24px 32px 32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:12px;">
                    <a href="${adminUrl}"
                       style="display:inline-block;background:#1A3560;color:#fff;
                              text-decoration:none;font-size:13px;font-weight:bold;
                              padding:12px 24px;border-radius:8px;">
                      âš™ï¸ Acessar Painel Admin
                    </a>
                  </td>
                  <td>
                    <a href="${googleMapsUrl}"
                       style="display:inline-block;background:#27AE60;color:#fff;
                              text-decoration:none;font-size:13px;font-weight:bold;
                              padding:12px 24px;border-radius:8px;">
                      ðŸ—ºï¸ Ver no Google Maps
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

  <!-- Footer -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A3560;">
    <tr>
      <td align="center" style="padding:20px;">
        <p style="margin:0;color:#BDD3F5;font-size:11px;">
          Este e-mail foi enviado automaticamente pelo sistema CidadeAlerta CE.<br/>
          Prefeitura Municipal de Horizonte â€” CE | Sistema de OcorrÃªncias Urbanas<br/>
          <a href="${process.env.APP_URL ?? 'http://localhost:5173'}"
             style="color:#7EB8F7;">Acessar o sistema</a>
        </p>
      </td>
    </tr>
  </table>

</body>
</html>`
}

// â”€â”€â”€ Template HTML de confirmaÃ§Ã£o ao cidadÃ£o â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function buildCitizenConfirmationHtml(data: OccurrenceEmailData): string {
  const adminUrl = `${process.env.APP_URL ?? 'http://localhost:5173'}/ocorrencias/${data.id}`
  const categoryLabel = CATEGORY_LABELS[data.category]

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F0F4FB;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A3560;">
    <tr><td align="center" style="padding:24px;">
      <h1 style="margin:0;color:#fff;font-size:22px;">ðŸ™ï¸ CidadeAlerta CE</h1>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:24px 16px;">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:12px;padding:32px;
                    box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr><td>
          <div style="text-align:center;margin-bottom:24px;">
            <div style="font-size:48px;">âœ…</div>
            <h2 style="margin:12px 0 4px;color:#1A3560;font-size:20px;">
              OcorrÃªncia registrada com sucesso!
            </h2>
            <p style="margin:0;color:#666;font-size:14px;">
              OlÃ¡, <strong>${data.citizen.name}</strong>! Sua denÃºncia foi recebida.
            </p>
          </div>
          <div style="background:#EBF1FB;border-radius:8px;padding:16px;margin-bottom:20px;">
            <p style="margin:0 0 6px;font-size:13px;color:#333;">
              <strong>TÃ­tulo:</strong> ${data.title}
            </p>
            <p style="margin:0 0 6px;font-size:13px;color:#333;">
              <strong>Categoria:</strong> ${categoryLabel}
            </p>
            <p style="margin:0;font-size:13px;color:#333;">
              <strong>Protocolo:</strong> ${data.id}
            </p>
          </div>
          <p style="font-size:13px;color:#555;line-height:1.6;">
            A Prefeitura de Horizonte foi notificada automaticamente. 
            VocÃª receberÃ¡ atualizaÃ§Ãµes por e-mail e notificaÃ§Ã£o no app 
            conforme o status mudar.
          </p>
          <div style="text-align:center;margin-top:24px;">
            <a href="${adminUrl}"
               style="display:inline-block;background:#2E5FA3;color:#fff;
                      text-decoration:none;font-size:13px;font-weight:bold;
                      padding:12px 32px;border-radius:8px;">
              Acompanhar minha ocorrÃªncia
            </a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A3560;">
    <tr><td align="center" style="padding:16px;">
      <p style="margin:0;color:#BDD3F5;font-size:11px;">
        CidadeAlerta CE â€” Horizonte, CE | Projeto AcadÃªmico 2026
      </p>
    </td></tr>
  </table>
</body>
</html>`
}

// â”€â”€â”€ Template de atualizaÃ§Ã£o de status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function buildStatusUpdateHtml(
  data: OccurrenceEmailData,
  newStatus: OccurrenceStatus,
  comment?: string,
): string {
  const adminUrl = `${process.env.APP_URL ?? 'http://localhost:5173'}/ocorrencias/${data.id}`
  const statusColor = STATUS_COLORS[newStatus]
  const statusLabel = STATUS_LABELS[newStatus]

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F0F4FB;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A3560;">
    <tr><td align="center" style="padding:24px;">
      <h1 style="margin:0;color:#fff;font-size:22px;">ðŸ™ï¸ CidadeAlerta CE</h1>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${statusColor};">
    <tr><td align="center" style="padding:12px;">
      <p style="margin:0;color:#fff;font-size:14px;font-weight:bold;">
        Status atualizado: ${statusLabel}
      </p>
    </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:24px 16px;">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:12px;padding:32px;">
        <tr><td>
          <p style="font-size:14px;color:#333;">
            OlÃ¡, <strong>${data.citizen.name}</strong>!
          </p>
          <p style="font-size:14px;color:#555;line-height:1.6;">
            Sua ocorrÃªncia <strong>"${data.title}"</strong> teve o status atualizado para:
          </p>
          <div style="text-align:center;margin:20px 0;">
            <span style="display:inline-block;background:${statusColor};color:#fff;
                         font-size:16px;font-weight:bold;padding:10px 28px;border-radius:24px;">
              ${statusLabel}
            </span>
          </div>
          ${comment ? `
          <div style="background:#F8F9FA;border-left:4px solid ${statusColor};
                      padding:14px;border-radius:0 8px 8px 0;margin:16px 0;">
            <p style="margin:0;font-size:13px;color:#333;">
              <strong>ComentÃ¡rio da Prefeitura:</strong><br/>${comment}
            </p>
          </div>` : ''}
          <div style="text-align:center;margin-top:24px;">
            <a href="${adminUrl}"
               style="display:inline-block;background:#2E5FA3;color:#fff;
                      text-decoration:none;font-size:13px;font-weight:bold;
                      padding:12px 32px;border-radius:8px;">
              Ver detalhes da ocorrÃªncia
            </a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// â”€â”€â”€ FunÃ§Ãµes pÃºblicas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Notifica a Prefeitura e a Secretaria sobre nova ocorrÃªncia.
 * Chamada logo apÃ³s salvar no banco.
 */
export async function notifyPrefeitura(data: OccurrenceEmailData): Promise<void> {
  const transporter = createTransporter()
  const recipients = getPrefeituraRecipients(data.category)
  const categoryLabel = CATEGORY_LABELS[data.category]

  await transporter.sendMail({
    from: `"CidadeAlerta CE" <${process.env.EMAIL_FROM}>`,
    to: recipients.join(', '),
    subject: `ðŸš¨ [CidadeAlerta CE] Nova OcorrÃªncia: ${data.title} â€” ${categoryLabel}`,
    html: buildPrefeituraEmailHtml(data),
    replyTo: data.citizen.email,
  })

  console.log(`ðŸ“§ Prefeitura notificada: ${recipients.join(', ')} â€” "${data.title}"`)
}

/**
 * Envia confirmaÃ§Ã£o de registro ao cidadÃ£o.
 */
export async function confirmCitizenRegistration(data: OccurrenceEmailData): Promise<void> {
  const transporter = createTransporter()

  await transporter.sendMail({
    from: `"CidadeAlerta CE" <${process.env.EMAIL_FROM}>`,
    to: data.citizen.email,
    subject: `âœ… OcorrÃªncia registrada: ${data.title} â€” CidadeAlerta CE`,
    html: buildCitizenConfirmationHtml(data),
  })

  console.log(`ðŸ“§ ConfirmaÃ§Ã£o enviada ao cidadÃ£o: ${data.citizen.email}`)
}

/**
 * Notifica o cidadÃ£o sobre mudanÃ§a de status.
 */
export async function notifyCitizenStatusUpdate(
  data: OccurrenceEmailData,
  newStatus: OccurrenceStatus,
  comment?: string,
): Promise<void> {
  const transporter = createTransporter()

  await transporter.sendMail({
    from: `"CidadeAlerta CE" <${process.env.EMAIL_FROM}>`,
    to: data.citizen.email,
    subject: `ðŸ“‹ AtualizaÃ§Ã£o: "${data.title}" â€” ${STATUS_LABELS[newStatus]} | CidadeAlerta CE`,
    html: buildStatusUpdateHtml(data, newStatus, comment),
  })

  console.log(`ðŸ“§ Status update enviado: ${data.citizen.email} â€” ${STATUS_LABELS[newStatus]}`)
}

/**
 * Envia todas as notificaÃ§Ãµes de uma nova ocorrÃªncia em paralelo.
 * NÃ£o lanÃ§a erro se o e-mail falhar (log apenas), para nÃ£o bloquear a criaÃ§Ã£o.
 */
export async function sendNewOccurrenceNotifications(data: OccurrenceEmailData): Promise<void> {
  await Promise.allSettled([
    notifyPrefeitura(data),
    confirmCitizenRegistration(data),
  ]).then((results) => {
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.error(`âŒ Falha no e-mail [${i}]:`, r.reason)
      }
    })
  })
}

