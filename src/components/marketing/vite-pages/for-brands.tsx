"use client";

const sf = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

export default function ForBrands() {
  return (
    <div style={{ minHeight: '100vh', background: '#faf8f4', fontFamily: sf, paddingTop: 60, paddingBottom: 100 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center', marginBottom: 100 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#1a1a1a', lineHeight: 1.08, marginBottom: 24 }}>
              Agencies are <span style={{ color: '#f97316' }}>slow</span>.<br />
              Mako is <span style={{ color: '#f97316' }}>fast</span>.
            </h1>
            <p style={{ fontSize: 17, color: '#6b6b6b', lineHeight: 1.7, marginBottom: 36 }}>
              For too long, small businesses have been priced out of influencer marketing by massive agency retainers and opaque pricing. We're changing that.
            </p>
            <a href="/signup/brand" style={{
              display: 'inline-block', borderRadius: 999, background: '#f97316',
              color: '#fff', fontWeight: 700, fontSize: 16, padding: '14px 32px', textDecoration: 'none',
            }}>
              Take control of your growth →
            </a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: '#fff', borderRadius: 18, padding: '24px 28px',
              border: '1px solid #e8e3da', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: '#ef4444', textTransform: 'uppercase', marginBottom: 8 }}>Traditional Agency</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: '#888' }}>Monthly Retainer</span>
                <span style={{ fontSize: 34, fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.03em' }}>$5,000+</span>
              </div>
            </div>
            <div style={{
              background: '#fff7ed', borderRadius: 18, padding: '24px 28px',
              border: '2px solid #f97316', boxShadow: '0 8px 24px rgba(249,115,22,0.15)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: '#f97316', textTransform: 'uppercase', marginBottom: 8 }}>Mako Creator</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: '#555', fontWeight: 500 }}>Flat platform fee</span>
                <span style={{ fontSize: 44, fontWeight: 800, color: '#f97316', letterSpacing: '-0.03em' }}>10%</span>
              </div>
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', color: '#1a1a1a', textAlign: 'center', marginBottom: 48 }}>
          Why brands choose software over services
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            {
              title: 'Direct Relationships',
              desc: "When you use an agency, they own the creator relationship. If you leave the agency, you lose your top performers. With Mako, you build and own direct relationships with every creator you work with.",
            },
            {
              title: 'Transparent Pricing',
              desc: 'Agencies take a 20–50% cut on top of their retainer — and you rarely know where your money goes. Mako charges a flat 10% platform fee, period. No subscription, no hidden markups, and every dollar above that goes directly to the creator delivering your content.',
            },
            {
              title: 'Data Ownership',
              desc: 'Stop waiting for end-of-month PDF reports. Access real-time dashboards showing CPC, CPA, and ROI. Connect your Shopify store and see exactly which creators are driving actual revenue.',
            },
          ].map((item) => (
            <div key={item.title} style={{
              background: '#fff', borderRadius: 20, padding: '32px 36px',
              border: '1px solid #e8e3da', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginBottom: 12, letterSpacing: '-0.01em' }}>{item.title}</h3>
              <p style={{ fontSize: 16, color: '#6b6b6b', lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
