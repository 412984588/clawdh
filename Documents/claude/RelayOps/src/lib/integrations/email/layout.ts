export interface EmailLayoutProps {
  title: string
  previewText?: string
  content: string
  showFooter?: boolean
  footerLinks?: { text: string; url: string }[]
}

const BRAND_COLOR = '#3B82F6'
const BRAND_COLOR_DARK = '#2563EB'
const TEXT_COLOR = '#1F2937'
const TEXT_COLOR_LIGHT = '#6B7280'
const BG_COLOR = '#F3F4F6'
const WHITE = '#FFFFFF'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function emailLayout(props: EmailLayoutProps): string {
  const { title, previewText, content, showFooter = true, footerLinks = [] } = props

  const preview = previewText ? escapeHtml(previewText) : escapeHtml(title)

  const defaultFooterLinks = [
    { text: 'RelayOps Portal', url: process.env.NEXT_PUBLIC_APP_URL || 'https://relayops.app' },
  ]

  const allFooterLinks = [...defaultFooterLinks, ...footerLinks]

  const footerLinksHtml = allFooterLinks
    .map((link, index) => {
      const separator = index < allFooterLinks.length - 1 ? ' · ' : ''
      return `<a href="${link.url}" style="color:${TEXT_COLOR_LIGHT};text-decoration:none;">${escapeHtml(link.text)}</a>${separator}`
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(title)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles for email clients */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    /* Responsive styles */
    @media screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .email-content {
        padding: 16px !important;
      }
      .email-header {
        padding: 20px 16px !important;
      }
      .email-footer {
        padding: 16px !important;
      }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BG_COLOR};font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Preview text (hidden) -->
  <div style="display:none;font-size:1px;color:${BG_COLOR};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preview}
  </div>
  
  <!-- Email container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${BG_COLOR};">
    <tr>
      <td align="center" style="padding:24px 0;">
        <!-- Main email table -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="max-width:600px;width:100%;background-color:${WHITE};border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td class="email-header" style="background:linear-gradient(135deg, ${BRAND_COLOR} 0%, ${BRAND_COLOR_DARK} 100%);padding:24px 32px;text-align:center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <!-- Logo/Brand -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-right:12px;">
                          <div style="width:32px;height:32px;background-color:${WHITE};border-radius:6px;display:inline-block;text-align:center;line-height:32px;font-weight:bold;color:${BRAND_COLOR};font-size:18px;">R</div>
                        </td>
                        <td>
                          <span style="color:${WHITE};font-size:24px;font-weight:bold;letter-spacing:-0.5px;">RelayOps</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td class="email-content" style="padding:32px;">
              ${content}
            </td>
          </tr>
          
          ${showFooter ? `
          <!-- Footer -->
          <tr>
            <td class="email-footer" style="background-color:${BG_COLOR};padding:24px 32px;text-align:center;border-top:1px solid #E5E7EB;">
              <p style="margin:0 0 12px 0;font-size:14px;color:${TEXT_COLOR_LIGHT};line-height:1.5;">
                ${footerLinksHtml}
              </p>
              <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.5;">
                © ${new Date().getFullYear()} RelayOps. All rights reserved.
              </p>
            </td>
          </tr>
          ` : ''}
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function createButton(props: {
  text: string
  url: string
  variant?: 'primary' | 'secondary'
}): string {
  const { text, url, variant = 'primary' } = props
  const bgColor = variant === 'primary' ? BRAND_COLOR : WHITE
  const textColor = variant === 'primary' ? WHITE : BRAND_COLOR
  const borderColor = variant === 'primary' ? BRAND_COLOR : BRAND_COLOR

  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
  <tr>
    <td style="border-radius:6px;background-color:${bgColor};text-align:center;">
      <a href="${url}" style="display:inline-block;padding:12px 24px;font-size:16px;font-weight:600;color:${textColor};text-decoration:none;border-radius:6px;border:2px solid ${borderColor};">
        ${escapeHtml(text)}
      </a>
    </td>
  </tr>
</table>`
}

export function createInfoBox(props: {
  title?: string
  content: string
  type?: 'info' | 'warning' | 'success'
}): string {
  const { title, content, type = 'info' } = props
  
  const colors = {
    info: { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF' },
    warning: { bg: '#FFFBEB', border: '#F59E0B', text: '#92400E' },
    success: { bg: '#ECFDF5', border: '#10B981', text: '#065F46' },
  }
  
  const color = colors[type]

  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:16px 0;background-color:${color.bg};border-left:4px solid ${color.border};border-radius:4px;">
  <tr>
    <td style="padding:16px;">
      ${title ? `<p style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:${color.text};">${escapeHtml(title)}</p>` : ''}
      <p style="margin:0;font-size:14px;color:${TEXT_COLOR};line-height:1.6;">${content}</p>
    </td>
  </tr>
</table>`
}

export function createTicketInfo(props: {
  title: string
  details: { label: string; value: string }[]
}): string {
  const { title, details } = props

  const detailsHtml = details
    .map(
      (detail) =>
        `<tr>
          <td style="padding:8px 0;font-size:14px;color:${TEXT_COLOR_LIGHT};width:120px;">${escapeHtml(detail.label)}</td>
          <td style="padding:8px 0;font-size:14px;color:${TEXT_COLOR};font-weight:500;">${escapeHtml(detail.value)}</td>
        </tr>`
    )
    .join('')

  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:16px 0;background-color:#F9FAFB;border-radius:8px;">
  <tr>
    <td style="padding:20px;">
      <p style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:${TEXT_COLOR};">${escapeHtml(title)}</p>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        ${detailsHtml}
      </table>
    </td>
  </tr>
</table>`
}

export function generatePlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
