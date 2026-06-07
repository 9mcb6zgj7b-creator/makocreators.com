"use client";

const img_features1 = '/images/creator-feature-1.png';
const img_features2 = '/images/creator-feature-2.png';
const img_features3 = '/images/creator-feature-3.png';
const img_features4 = '/images/creator-feature-4.png';
const img_features5 = '/images/creator-feature-5.png';

const SF = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

const AVATARS = [
  '/avatars/food_amy.jpg',
  '/avatars/food_priya.jpg',
  '/avatars/food_jessica.jpg',
  '/avatars/food_mia.jpg',
  '/avatars/food_chloe.jpg',
  '/avatars/food_daniel.jpg',
  '/avatars/food_marco.jpg',
  '/avatars/food_kevin.jpg',
  '/avatars/food_sara.jpg',
];

const BRAND_LOGOS = ['EARART.AI', 'SonicBeam', 'freebeat', 'SureThing', 'PurOxy', 'Manna', 'vivago.ai', 'ONLYOFFICE', 'AiPP'];

const TESTIMONIALS = [
  { handle: '@nelson_miguel', followers: '376K followers', quote: 'Working with Mako Creator has been a great experience. The process is clear, communication is smooth, and payments are fast and transparent.', avatar: '/avatars/food_daniel.jpg' },
  { handle: '@rafael_brasil', followers: '184K followers', quote: "I've landed several partnerships through Mako Creator at competitive rates. The process is simple and much faster than email negotiations, and payments are always on time.", avatar: '/avatars/food_marco.jpg' },
  { handle: '@devops_foodbox', followers: '31K followers', quote: 'Working with Mako Creator was an absolute pleasure. Thanks to its in-depth knowledge of content creation, I was able to improve my content quality and fan engagement.', avatar: '/avatars/food_kevin.jpg' },
];

/* ─────────────────────────── HERO ─────────────────────────────────────── */
function HeroSection() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: '#faf8f4', minHeight: 680, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
      {/* gradient blob */}
      <div style={{ position: 'absolute', right: -120, top: -80, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle at 60% 40%, #f97316 0%, #fb923c 25%, #fbbf24 45%, #f472b6 65%, #a78bfa 85%, transparent 100%)', opacity: 0.55, filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', left: -100, bottom: -60, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, #a78bfa 0%, #818cf8 50%, transparent 100%)', opacity: 0.25, filter: 'blur(50px)', pointerEvents: 'none' }} />

      {/* floating earnings card */}
      <div style={{ position: 'absolute', top: 80, right: 60, background: '#fff', borderRadius: 16, padding: '14px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', minWidth: 180, zIndex: 2 }}>
        <div style={{ fontSize: 11, color: '#6b6b6b', fontWeight: 500, marginBottom: 4, fontFamily: SF }}>Earnings to date</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#f97316', fontFamily: SF }}>$8,746.2</div>
      </div>

      {/* floating opportunities card */}
      <div style={{ position: 'absolute', bottom: 100, left: 60, background: '#fff', borderRadius: 16, padding: '14px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316', display: 'inline-block' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#f97316', fontFamily: SF }}>Opportunities</span>
        </div>
        <div style={{ fontSize: 13, color: '#6b6b6b', fontFamily: SF }}>8 waiting</div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 720 }}>
        {/* pill badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #e8e3da', borderRadius: 999, padding: '6px 16px', marginBottom: 32, fontSize: 13, color: '#4a4a4a', fontWeight: 500, fontFamily: SF, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          Influencer Marketing Hub: 2026 <span style={{ color: '#f97316', fontWeight: 700 }}>Best AI Agents</span> for Influencer Marketing
        </div>

        <h1 style={{ fontSize: 'clamp(44px, 7vw, 86px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#1a1a1a', lineHeight: 1.0, marginBottom: 36, fontFamily: SF }}>
          Scale Brand Deals<br />
          For Every <span style={{ color: '#f97316' }}>Creator</span>
        </h1>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={{ background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer', padding: '15px 32px', borderRadius: 999, fontSize: 16, fontWeight: 700, fontFamily: SF, letterSpacing: '-0.01em', transition: 'background 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ea6c0a'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f97316'; }}
          >
            Join as Creator
          </button>
          <button style={{ background: '#fff', color: '#1a1a1a', border: '1.5px solid #e8e3da', cursor: 'pointer', padding: '15px 28px', borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: SF, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.38.07 2.32.75 3.13.8 1.19-.24 2.33-.94 3.6-.84 1.53.12 2.68.72 3.44 1.8-3.14 1.87-2.39 5.98.48 7.13-.57 1.52-1.32 3.03-2.65 3.99zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="#1a1a1a"/></svg>
            App Store
          </button>
          <button style={{ background: '#fff', color: '#1a1a1a', border: '1.5px solid #e8e3da', cursor: 'pointer', padding: '15px 28px', borderRadius: 999, fontSize: 15, fontWeight: 600, fontFamily: SF, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3.18 23.73c.23.13.5.14.75.04L15.62 12 3.93.23C3.68.13 3.41.14 3.18.27 2.71.54 2.4 1.07 2.4 1.73v20.54c0 .66.31 1.19.78 1.46zM19.6 9.4l-2.66-1.54-3.22 3.22L16.94 14.3l2.66-1.54c.76-.44 1.21-1.13 1.21-1.68 0-.55-.45-1.24-1.21-1.68zM4.93 1.73 15.1 12 4.93 22.27V1.73z" fill="#34A853"/></svg>
            Google Play
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── BRAND STATEMENT ───────────────────────────────── */
function BrandStatement() {
  return (
    <section style={{ background: '#faf8f4', padding: '80px 24px', borderTop: '1px solid #e8e3da' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 'clamp(18px, 2.5vw, 26px)', fontWeight: 600, color: '#1a1a1a', lineHeight: 1.55, fontFamily: SF }}>
          Brand collaborations shouldn&apos;t be limited by your audience scale, and should always respect your personal style.{' '}
          <span style={{ color: '#f97316', fontWeight: 800 }}>Mako Creator</span>{' '}
          connects you with best-fit brand deals so your creativity and content monetization can scale in tandem.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────── TRUST BAR ─────────────────────────────────────── */
function TrustBar() {
  return (
    <section style={{ background: '#faf8f4', padding: '48px 24px 72px', borderTop: '1px solid #e8e3da' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* badges */}
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 52, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 4, background: '#ff6154', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 10, fontWeight: 900, fontFamily: SF }}>P</span>
            </div>
            <span style={{ fontSize: 13, color: '#6b6b6b', fontWeight: 600, fontFamily: SF }}>PRODUCT HUNT</span>
            <span style={{ color: '#f97316', fontSize: 14 }}>★ ★ ★ ★ ★</span>
          </div>
          <div style={{ width: 1, height: 28, background: '#e8e3da' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#6b6b6b', fontWeight: 500, fontFamily: SF }}>Product of the day</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', fontFamily: SF }}>1st</div>
          </div>
        </div>

        <h2 style={{ textAlign: 'center', fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 800, color: '#1a1a1a', marginBottom: 36, fontFamily: SF, letterSpacing: '-0.02em' }}>
          Trusted by over 300+<br />leading companies worldwide
        </h2>

        <div style={{ display: 'flex', gap: 36, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          {BRAND_LOGOS.map(b => (
            <span key={b} style={{ fontSize: 14, fontWeight: 700, color: '#4a4a4a', letterSpacing: '-0.02em', fontFamily: SF, opacity: 0.7 }}>{b}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── CREATOR STORIES ───────────────────────────────── */
function CreatorStories() {
  return (
    <section style={{ background: '#faf8f4', padding: '80px 24px', borderTop: '1px solid #e8e3da' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 44px)', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 48, fontFamily: SF }}>
          How creators like you build<br />
          careers on <span style={{ color: '#f97316' }}>Mako Creator</span>
        </h2>

        <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #e8e3da', overflow: 'hidden', display: 'flex', gap: 0, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          {/* left: video thumbnail */}
          <div style={{ position: 'relative', width: 300, minHeight: 340, flexShrink: 0, overflow: 'hidden', background: '#1a1a1a' }}>
            <img src="/avatars/food_marco.jpg" alt="creator" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
            <div style={{ position: 'absolute', top: 12, left: 12, background: '#f97316', borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: SF }}>Featured story</div>
            <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="/avatars/food_marco.jpg" alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff' }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: SF }}>@marcoeatscreates</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontFamily: SF }}>Instagram</div>
              </div>
            </div>
          </div>

          {/* right: brand + stats */}
          <div style={{ flex: 1, padding: '40px 44px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 12, height: 12, background: '#f97316', borderRadius: 2 }} />
              <span style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.02em', fontFamily: SF }}>TRAE</span>
            </div>

            <p style={{ fontSize: 16, color: '#4a4a4a', lineHeight: 1.6, marginBottom: 32, maxWidth: 460, fontFamily: SF }}>
              Collaborated with an AI coding tool, a single video reached 210K+ views and 20K+ engagement.
            </p>

            <div style={{ display: 'flex', gap: 40, paddingTop: 24, borderTop: '1px solid #e8e3da', marginBottom: 32 }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#f97316', fontFamily: SF }}>210K+</div>
                <div style={{ fontSize: 12, color: '#6b6b6b', fontFamily: SF }}>Views</div>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#1a1a1a', fontFamily: SF }}>20K+</div>
                <div style={{ fontSize: 12, color: '#6b6b6b', fontFamily: SF }}>Engagement</div>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#1a1a1a', fontFamily: SF }}>188K</div>
                <div style={{ fontSize: 12, color: '#6b6b6b', fontFamily: SF }}>Followers</div>
              </div>
            </div>

            <button style={{ background: '#1a1a1a', color: '#fff', border: 'none', cursor: 'pointer', padding: '12px 24px', borderRadius: 999, fontSize: 14, fontWeight: 700, fontFamily: SF, display: 'flex', alignItems: 'center', gap: 6 }}>
              Learn more →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── FULL BLEED CTA ────────────────────────────────── */
function SupportCTA() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: '0 24px', background: '#faf8f4' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', borderRadius: 28, overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #f97316 0%, #fb923c 20%, #f472b6 50%, #a78bfa 75%, #818cf8 100%)', padding: '80px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', minHeight: 380 }}>
          {/* glass card */}
          <div style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: 24, padding: '52px 60px', maxWidth: 620 }}>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 32, fontFamily: SF }}>
              A Real Support Team Protecting Every Collaboration For You →
            </h2>
            <button style={{ background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer', padding: '15px 36px', borderRadius: 999, fontSize: 16, fontWeight: 700, fontFamily: SF, transition: 'background 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ea6c0a'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f97316'; }}
            >
              Join as Creator
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── FEATURE ROW ───────────────────────────────────── */
type FeatureRowProps = {
  eyebrow?: string;
  headline: string;
  body: string;
  bullets: string[];
  cta?: string;
  img: string;
  imgLeft?: boolean;
  imgBg?: string;
};

function FeatureRow({ eyebrow, headline, body, bullets, cta = 'Join as Creator', img, imgLeft = false, imgBg = 'linear-gradient(135deg,#fff8f3 0%,#ffe4cc 100%)' }: FeatureRowProps) {
  const textBlock = (
    <div style={{ flex: 1, minWidth: 0 }}>
      {eyebrow && <div style={{ fontSize: 12, fontWeight: 700, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16, fontFamily: SF }}>{eyebrow}</div>}
      <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 20, fontFamily: SF }}>
        {headline}
      </h2>
      <p style={{ fontSize: 15, color: '#4a4a4a', lineHeight: 1.65, marginBottom: 28, fontFamily: SF }}>
        {body}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
        {bullets.map(b => (
          <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', fontFamily: SF }}>{b}</span>
          </div>
        ))}
      </div>
      <button style={{ background: '#1a1a1a', color: '#fff', border: 'none', cursor: 'pointer', padding: '13px 28px', borderRadius: 999, fontSize: 15, fontWeight: 700, fontFamily: SF, transition: 'background 0.15s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#333'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1a'; }}
      >
        {cta}
      </button>
    </div>
  );

  const imgBlock = (
    <div style={{ flex: 1, minWidth: 0, borderRadius: 20, overflow: 'hidden', background: imgBg, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: 420 }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 64, alignItems: 'center', maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
      {imgLeft ? <>{imgBlock}{textBlock}</> : <>{textBlock}{imgBlock}</>}
    </div>
  );
}

/* ─────────────────────── SOCIAL PROOF ──────────────────────────────────── */
function SocialProof() {
  return (
    <section style={{ background: '#faf8f4', padding: '80px 24px', borderTop: '1px solid #e8e3da' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 44, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 900, color: '#f97316', fontFamily: SF, lineHeight: 1 }}>10W+</div>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 900, color: '#1a1a1a', fontFamily: SF, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              Verified creators<br />love Mako Creator
            </h2>
          </div>
          <button style={{ background: '#f97316', color: '#fff', border: 'none', cursor: 'pointer', padding: '13px 28px', borderRadius: 999, fontSize: 15, fontWeight: 700, fontFamily: SF, flexShrink: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#ea6c0a'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#f97316'; }}
          >
            Join as Creator
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {TESTIMONIALS.map(t => (
            <div key={t.handle} style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', minHeight: 400 }}>
              {/* photo bg */}
              <img src={t.avatar} alt={t.handle} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              {/* gradient overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 60%, rgba(0,0,0,0.85) 100%)' }} />
              {/* content */}
              <div style={{ position: 'relative', zIndex: 1, padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', boxSizing: 'border-box', minHeight: 400 }}>
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ color: '#f97316', fontSize: 16, marginBottom: 14, letterSpacing: 2 }}>★★★★★</div>
                  <p style={{ fontSize: 14, color: '#fff', lineHeight: 1.6, marginBottom: 20, fontFamily: SF }}>"{t.quote}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={t.avatar} alt={t.handle} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.5)' }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: SF }}>{t.handle}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontFamily: SF }}>{t.followers}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── AVATAR MARQUEE ────────────────────────────────── */
function AvatarMarquee() {
  const all = [...AVATARS, ...AVATARS, ...AVATARS];
  return (
    <section style={{ background: '#faf8f4', padding: '60px 0 80px', borderTop: '1px solid #e8e3da', overflow: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <p style={{ fontSize: 14, color: '#6b6b6b', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: SF }}>Join 10W+ creators already on the platform</p>
      </div>
      <div style={{ overflow: 'hidden', position: 'relative' }}>
        <div style={{
          display: 'flex',
          gap: 16,
          width: 'max-content',
          animation: 'marquee 28s linear infinite',
        }}>
          {all.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────── PAGE ───────────────────────────────────────────── */
export default function ForCreators() {
  return (
    <>
      <HeroSection />
      <BrandStatement />
      <TrustBar />
      <CreatorStories />
      <SupportCTA />

      <section style={{ background: '#faf8f4', borderTop: '1px solid #e8e3da' }}>
        <FeatureRow
          headline="Continuously discovering brand collaborations that truly fit you."
          body="Using multimodal AI, we understand your content style, audience engagement, and creative identity, helping you connect with brand partnerships that genuinely align with your voice and community."
          bullets={['Multimodal AI creator matching', 'Seamless brand fit']}
          img={img_features1}
          imgLeft={false}
          imgBg="linear-gradient(135deg, #fff8f3 0%, #ffe9d4 100%)"
        />
      </section>

      <section style={{ background: '#fff', borderTop: '1px solid #e8e3da' }}>
        <FeatureRow
          headline="Every creator deserves the opportunity to be discovered"
          body="At Mako Creator, we believe every creator who puts genuine effort into their content deserves to be seen. Whether you already have a large audience or are still growing your community, we help connect you with brand partnerships that truly align with your content and creative identity."
          bullets={['For creators of every size', 'Perfect-fit brand collaborations']}
          img={img_features2}
          imgLeft={true}
          imgBg="linear-gradient(135deg, #fdf4ff 0%, #ffe4d4 100%)"
        />
      </section>

      <section style={{ background: '#faf8f4', borderTop: '1px solid #e8e3da' }}>
        <FeatureRow
          headline="Just focus on creating, we help manage the collaboration flow."
          body="Creators should spend time creating. Mako Creator brings collaboration management, content submissions, and campaign tracking into one platform, actively helping move brand partnerships forward, reducing delays, and making every collaboration smoother and more efficient."
          bullets={['Centralized collaboration management', 'Less back-and-forth communication', 'Faster approvals and smoother workflows']}
          img={img_features3}
          imgLeft={false}
          imgBg="linear-gradient(135deg, #fff0f8 0%, #ffe4d0 100%)"
        />
      </section>

      <section style={{ background: '#fff', borderTop: '1px solid #e8e3da' }}>
        <FeatureRow
          headline="Efficient Collaboration with Creative Rights Protection"
          body="The personal brand and community trust you've built deserve to be protected. That's why every brand on Mako Creator is verified for legitimacy, brand safety, and secured budgets, so every collaboration feels safer."
          bullets={['Carefully vetted brand partners', 'Safe and transparent collaborations']}
          img={img_features4}
          imgLeft={true}
          imgBg="linear-gradient(135deg, #fff8f3 0%, #fde8d8 100%)"
        />
      </section>

      <section style={{ background: '#faf8f4', borderTop: '1px solid #e8e3da' }}>
        <FeatureRow
          headline="50% upfront fee, as a commitment to a trusted collaboration"
          body="We believe great collaborations start with trust. That's why creators can withdraw 50% of the payment as soon as a collaboration is confirmed, with the remaining 50% available 10 days after content is published."
          bullets={['Secured campaign funding', '50% upfront payout upon confirmation']}
          img={img_features5}
          imgLeft={false}
          imgBg="linear-gradient(135deg, #fff5f0 0%, #ffd4b8 100%)"
        />
      </section>

      <SocialProof />
      <AvatarMarquee />
    </>
  );
}
