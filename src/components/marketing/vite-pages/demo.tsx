"use client";

const SF = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

const CALENDLY_URL = 'https://calendly.com/mike_liu/30min';

const TRUST_ITEMS = [
  { stat: '10M+', label: 'Verified creators' },
  { stat: '3.8×', label: 'Average ROI' },
  { stat: '10%', label: 'Flat platform fee' },
  { stat: '< 48h', label: 'First creator match' },
];

const WHAT_TO_EXPECT = [
  { num: '01', title: 'See the platform live', desc: 'We walk you through creator discovery, campaign setup, and escrow payments in real time.' },
  { num: '02', title: 'Get your questions answered', desc: 'Our team knows influencer marketing inside out — no scripts, just real conversation.' },
  { num: '03', title: 'Leave with a plan', desc: "You'll walk away with a concrete creator strategy tailored to your brand and budget." },
];

export default function Demo() {
  return (
    <div style={{ background: '#faf8f4', minHeight: '100vh', fontFamily: SF }}>

      {/* hero */}
      <div style={{ background: '#1a1a1a', padding: '72px 24px 56px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)',
          borderRadius: 999, padding: '5px 16px', fontSize: 12, fontWeight: 700,
          color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24,
        }}>
          Free · No commitment
        </div>
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, letterSpacing: '-0.04em',
          color: '#fff', lineHeight: 1.1, marginBottom: 16,
        }}>
          Book a free 30-min<br />
          <span style={{ color: '#f97316' }}>expert demo call</span>
        </h1>
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', maxWidth: 520, margin: '0 auto 48px', lineHeight: 1.65 }}>
          See how Mako Creator can help you find the right creators, run campaigns, and pay only when content is delivered.
        </p>

        {/* trust stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 0, flexWrap: 'wrap', maxWidth: 640, margin: '0 auto' }}>
          {TRUST_ITEMS.map((item, i) => (
            <div key={item.stat} style={{
              flex: '1 1 130px', padding: '20px 16px',
              borderRight: i < TRUST_ITEMS.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
            }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#f97316', letterSpacing: '-0.03em' }}>{item.stat}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4, fontWeight: 500 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* main content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px', display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 56, alignItems: 'start' }}>

        {/* left — what to expect */}
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.02em', marginBottom: 32 }}>
            What to expect
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {WHAT_TO_EXPECT.map((item) => (
              <div key={item.num} style={{ display: 'flex', gap: 16 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: 'rgba(249,115,22,0.1)',
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: '#f97316',
                }}>
                  {item.num}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>{item.title}</div>
                  <div style={{ fontSize: 14, color: '#6b6b6b', lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* social proof */}
          <div style={{
            marginTop: 48, background: '#fff', borderRadius: 16, padding: '24px',
            border: '1px solid #e8e3da',
          }}>
            <div style={{ fontSize: 13, color: '#f97316', fontWeight: 700, marginBottom: 12 }}>★★★★★</div>
            <p style={{ fontSize: 14, color: '#3a3a3a', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 16 }}>
              "Within a week of the demo, we had our first creator campaign live. The team really understood our brand."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', background: '#1a1a1a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 14, color: '#f97316',
              }}>J</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>Jessica T.</div>
                <div style={{ fontSize: 12, color: '#999' }}>Marketing Manager, Bloom Kitchen</div>
              </div>
            </div>
          </div>
        </div>

        {/* right — Calendly embed */}
        <div style={{
          background: '#fff', borderRadius: 20, border: '1px solid #e8e3da',
          overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          minHeight: 660,
        }}>
          <iframe
            src={`${CALENDLY_URL}?hide_gdpr_banner=1&primary_color=f97316`}
            width="100%"
            height="660"
            frameBorder="0"
            title="Book a demo"
            style={{ display: 'block', border: 'none' }}
          />
        </div>
      </div>

      {/* bottom CTA strip */}
      <div style={{ background: '#fff', borderTop: '1px solid #e8e3da', padding: '40px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: '#888', lineHeight: 1.7 }}>
          Prefer email?{' '}
          <a href="mailto:hello@makocreator.com" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>
            hello@makocreator.com
          </a>
          {' '}· No spam, we promise.
        </p>
      </div>
    </div>
  );
}
