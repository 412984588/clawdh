import { ImageResponse } from 'next/og'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function opengraphImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          height: '100%',
          width: '100%',
          background: 'linear-gradient(135deg, #09090b 0%, #111827 52%, #2563eb 100%)',
          color: 'white',
          padding: '72px',
          fontFamily: 'Arial',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '76px',
              height: '76px',
              borderRadius: '24px',
              background: '#3b82f6',
              fontSize: '34px',
              fontWeight: 800,
            }}
          >
            R
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ fontSize: '24px', letterSpacing: '0.34em', textTransform: 'uppercase' }}>
              RelayOps
            </div>
            <div style={{ fontSize: '18px', color: '#bfdbfe' }}>
              Revenue ops fulfillment for agency delivery teams
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            maxWidth: '860px',
          }}
        >
          <div style={{ fontSize: '76px', fontWeight: 900, lineHeight: 1.02 }}>
            White-label CRM cleanup with a 48-hour delivery promise.
          </div>
          <div style={{ fontSize: '30px', color: '#d4d4d8', lineHeight: 1.4 }}>
            Request Access to scope, QA, and deliver faster without turning cleanup work into margin
            leakage.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '18px',
            flexWrap: 'wrap',
          }}
        >
          {['2-day SLA', '810+ tests', 'SOC2-ready', 'White-label delivery'].map((item) => (
            <div
              key={item}
              style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.16)',
                padding: '14px 22px',
                fontSize: '24px',
                color: '#e4e4e7',
                background: 'rgba(255,255,255,0.08)',
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}
