"use client";

import type React from "react";
import { useState } from "react";
const heroScreenshot = '/images/hero-dashboard.png';
const videoPoster = '/images/video-poster.png';
const featuresScreenshot = '/images/features-dashboard.png';

const SF = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

// Cloud card: consistent SVG cloud shape for all 4 corners
function CloudCard({
  top, bottom, left, right,
  flipV = false,
  flipH = false,
  children,
}: {
  top?: number | string; bottom?: number | string;
  left?: number | string; right?: number | string;
  flipV?: boolean; flipH?: boolean;
  children: React.ReactNode;
}) {
  // Cloud path in 240×155 viewBox — bumps on top, smooth bottom
  const path = "M24,128 C6,128 1,112 6,96 C0,74 14,58 32,63 C27,36 48,18 70,27 C72,6 98,-4 120,12 C140,-3 166,8 168,35 C186,20 212,35 210,60 C230,57 242,76 234,97 C240,114 226,132 205,128 Z";
  // SVG transform: translate to center, scale to flip, translate back
  const W = 240, H = 155;
  const cx = W / 2, cy = H / 2;
  const sx = flipH ? -1 : 1, sy = flipV ? -1 : 1;
  const svgTransform = (flipH || flipV)
    ? `translate(${cx}, ${cy}) scale(${sx}, ${sy}) translate(${-cx}, ${-cy})`
    : undefined;

  return (
    <div style={{
      position: 'absolute', top, bottom, left, right,
      width: W, height: H, zIndex: 10, fontFamily: SF,
    }}>
      <svg
        width={W} height={H} viewBox={`0 0 ${W} ${H}`}
        style={{
          position: 'absolute', inset: 0, overflow: 'visible',
          filter: 'drop-shadow(0 8px 22px rgba(0,0,0,0.13))',
        }}
      >
        <g transform={svgTransform}>
          <path
            fill="white" stroke="rgba(0,0,0,0.06)" strokeWidth="1"
            d={path}
          />
        </g>
      </svg>
      <div style={{
        position: 'relative', zIndex: 1,
        padding: flipV ? '10px 22px 26px' : '22px 22px 12px',
      }}>
        {children}
      </div>
    </div>
  );
}

function VideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section style={{ background: '#faf8f4', padding: '80px 24px 60px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', marginBottom: 40 }}>
        <h2 style={{ fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#1a1a1a', marginBottom: 12 }}>
          See Mako Creator in action
        </h2>
        <p style={{ fontSize: 16, color: '#6b6b6b' }}>Watch how 2,000+ brands find and manage creators in minutes.</p>
      </div>

      {/* Browser chrome frame */}
      <div style={{
        maxWidth: 860, margin: '0 auto',
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
        border: '1px solid #e0dbd2',
      }}>
        {/* Browser top bar */}
        <div style={{
          background: '#f0ece6', padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          borderBottom: '1px solid #e0dbd2',
        }}>
          <div style={{ display: 'flex', gap: 7 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
          </div>
          <div style={{ flex: 1, background: '#e4e0d8', borderRadius: 6, height: 26, display: 'flex', alignItems: 'center', paddingLeft: 12 }}>
            <span style={{ fontSize: 12, color: '#888' }}>makocreator.com/demo</span>
          </div>
        </div>

        {/* Video area */}
        <div
          style={{
            position: 'relative', cursor: 'pointer',
            background: '#0a0a0a', lineHeight: 0,
          }}
          onClick={() => setPlaying(p => !p)}
        >
          {/* Poster / thumbnail */}
          <img
            src={videoPoster}
            alt="Product demo video"
            style={{ display: 'block', width: '100%', objectFit: 'cover', opacity: playing ? 0.25 : 1, transition: 'opacity 0.3s' }}
          />

          {/* Overlay when not playing */}
          {!playing && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.15) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* Play button */}
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(255,255,255,0.95)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.10)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
                }}
              >
                {/* Triangle play icon */}
                <svg width="28" height="28" viewBox="0 0 24 24" style={{ marginLeft: 4 }}>
                  <polygon points="6,4 20,12 6,20" fill="#f97316" />
                </svg>
              </div>
            </div>
          )}

          {/* Playing state */}
          {playing && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
            }}>
              {/* Pause button */}
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(255,255,255,0.95)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                cursor: 'pointer',
              }}>
                <svg width="26" height="26" viewBox="0 0 24 24">
                  <rect x="5" y="4" width="4" height="16" fill="#1a1a1a" rx="1" />
                  <rect x="15" y="4" width="4" height="16" fill="#1a1a1a" rx="1" />
                </svg>
              </div>
              <span style={{ fontSize: 13, color: '#fff', fontWeight: 600, fontFamily: SF, background: 'rgba(0,0,0,0.5)', borderRadius: 999, padding: '6px 16px' }}>
                Video coming soon — click to pause
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const CREATORS = [
  { handle: '@amyeats_sf', name: 'Amy Chen', niche: 'Restaurants & Cafes', followers: '89.4K', platform: 'IG', color: ['#f97316','#ea580c'], avatar: '/avatars/food_amy.jpg' },
  { handle: '@priyasfooddiary', name: 'Priya Sharma', niche: 'Asian Cuisine', followers: '45.2K', platform: 'IG', color: ['#a78bfa','#7c3aed'], avatar: '/avatars/food_priya.jpg' },
  { handle: '@jessicafoodtours', name: 'Jessica Liu', niche: 'Food Tours', followers: '312K', platform: 'TK', color: ['#f472b6','#db2777'], avatar: '/avatars/food_jessica.jpg' },
  { handle: '@miabites', name: 'Mia Thompson', niche: 'Brunch & Cafes', followers: '28.7K', platform: 'IG', color: ['#34d399','#059669'], avatar: '/avatars/food_mia.jpg' },
  { handle: '@chloestreetfood', name: 'Chloe Park', niche: 'Street Food', followers: '156K', platform: 'TK', color: ['#fbbf24','#d97706'], avatar: '/avatars/food_chloe.jpg' },
  { handle: '@danieldines', name: 'Daniel Reyes', niche: 'Fine Dining', followers: '73.1K', platform: 'IG', color: ['#60a5fa','#2563eb'], avatar: '/avatars/food_daniel.jpg' },
  { handle: '@marcoeatsnyc', name: 'Marco Ricci', niche: 'Italian & Pizza', followers: '18.3K', platform: 'IG', color: ['#fb923c','#ea580c'], avatar: '/avatars/food_marco.jpg' },
  { handle: '@kevinfoodies', name: 'Kevin Wu', niche: 'BBQ & Grill', followers: '423K', platform: 'YT', color: ['#38bdf8','#0284c7'], avatar: '/avatars/food_kevin.jpg' },
  { handle: '@sarasips', name: 'Sara Mitchell', niche: 'Cocktails & Bars', followers: '67.8K', platform: 'IG', color: ['#f9a8d4','#ec4899'], avatar: '/avatars/food_sara.jpg' },
];

function PlatformIcon({ p }: { p: string }) {
  const src = p === 'YT'
    ? '/icons/youtube.svg'
    : p === 'IG'
    ? '/icons/instagram.png'
    : '/icons/tiktok.svg';
  return <img src={src} alt={p} style={{ width: 18, height: 18, objectFit: 'contain', display: 'block' }} />;
}

function CreatorNetworkSection() {
  const all = [...CREATORS, ...CREATORS]; // doubled for seamless loop

  return (
    <section style={{
      background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 25%, #a855f7 65%, #7c3aed 100%)',
      padding: '80px 0 64px', overflow: 'hidden', position: 'relative',
    }}>
      {/* Noise/grain overlay for texture */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.08, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        backgroundSize: '200px 200px',
      }} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '0 48px', marginBottom: 48 }}>
        <div style={{
          display: 'inline-block', background: 'rgba(255,255,255,0.2)', borderRadius: 999,
          padding: '5px 14px', fontSize: 12, fontWeight: 700, color: '#fff',
          letterSpacing: '0.04em', marginBottom: 16,
        }}>Chosen By Creators</div>
        <h2 style={{
          fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: '#fff',
          letterSpacing: '-0.03em', lineHeight: 1.1, maxWidth: 520,
          textShadow: '0 2px 12px rgba(0,0,0,0.15)',
        }}>
          The first of its kind Creator Network<br />for local services
        </h2>
      </div>

      {/* Creator cards marquee */}
      <div style={{ position: 'relative', zIndex: 1, overflow: 'hidden', marginBottom: 48,
        maskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
      }}>
        <div style={{ display: 'flex', gap: 16, width: 'max-content',
          animation: 'marquee 30s linear infinite',
          paddingLeft: 24,
        }}>
          {all.map((c, i) => {
            const isFeatured = i % CREATORS.length === 3;
            return (
              <div key={i} style={{
                flexShrink: 0,
                width: isFeatured ? 200 : 155,
                height: isFeatured ? 280 : 225,
                borderRadius: 20,
                position: 'relative', overflow: 'hidden',
                boxShadow: isFeatured
                  ? '0 24px 56px rgba(0,0,0,0.45)'
                  : '0 8px 28px rgba(0,0,0,0.30)',
                border: '2px solid rgba(255,255,255,0.18)',
                alignSelf: isFeatured ? 'center' : undefined,
                transform: isFeatured ? 'scale(1.06)' : 'none',
                background: `linear-gradient(145deg, ${c.color[0]}, ${c.color[1]})`,
              }}>
                {/* Full-card photo */}
                <img
                  src={c.avatar}
                  alt={c.name}
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
                {/* Platform badge */}
                <div style={{
                  position: 'absolute', top: 14, right: 12,
                  background: 'rgba(255,255,255,0.92)', borderRadius: 8,
                  padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(4px)',
                }}>
                  <PlatformIcon p={c.platform} />
                </div>
                {/* Info at bottom */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '32px 14px 14px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{c.handle}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>{c.niche}</div>
                  <div style={{
                    display: 'inline-block', background: 'rgba(255,255,255,0.2)',
                    borderRadius: 999, padding: '3px 10px',
                    fontSize: 11, fontWeight: 700, color: '#fff',
                  }}>{c.followers} Followers</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1100, margin: '0 auto', padding: '0 48px',
        display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap',
      }}>
        {[
          { value: '5M+', label: 'Vetted Creators' },
          { value: '10W+', label: 'Onboarded' },
          { value: '140+', label: 'Countries & Regions' },
        ].map((s, i) => (
          <div key={s.label} style={{
            display: 'flex', flexDirection: 'column',
            paddingRight: 48, marginRight: 48,
            borderRight: i < 2 ? '1px solid rgba(255,255,255,0.25)' : 'none',
          }}>
            <span style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500, marginTop: 4 }}>{s.label}</span>
          </div>
        ))}
        {/* Platform icons */}
        <div style={{ marginLeft: 'auto' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: 10 }}>Supports major platforms</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { src: '/icons/youtube.svg', label: 'YouTube' },
              { src: '/icons/instagram.png', label: 'Instagram' },
              { src: '/icons/tiktok-logo.png', label: 'TikTok' },
            ].map((p) => (
              <div key={p.label} title={p.label} style={{
                width: 36, height: 36, borderRadius: 9,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                padding: 4,
              }}>
                <img src={p.src} alt={p.label} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 6 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FindCreatorsSection() {
  return (
    <section style={{ background: '#faf8f4', padding: '100px 24px 80px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Heading */}
        <h2 style={{
          textAlign: 'center', fontSize: 'clamp(32px, 4vw, 56px)',
          fontWeight: 800, letterSpacing: '-0.03em', color: '#1a1a1a',
          marginBottom: 72, fontFamily: SF,
        }}>Our Features</h2>

        {/* Two-col */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          {/* Left: text */}
          <div>
            <h3 style={{
              fontSize: 'clamp(24px, 3vw, 38px)', fontWeight: 800,
              letterSpacing: '-0.03em', color: '#1a1a1a', lineHeight: 1.15,
              marginBottom: 24, fontFamily: SF,
            }}>
              Find the right creators.<br />Like a human expert.
            </h3>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: '#555', marginBottom: 32, maxWidth: 420 }}>
              Our AI doesn't just filter by follower count and country. It reads
              content with multimodal analysis, evaluates audience fit, detects
              fake engagement, across 5 million profiles simultaneously.
            </p>

            {/* Bullet list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
              {[
                'Fake follower detection',
                'Audience overlap analysis',
                'Smart match by brand DNA',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    background: '#f97316',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                      <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a', fontFamily: SF }}>{item}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button style={{
              background: '#1a1a1a', color: '#fff', border: 'none', cursor: 'pointer',
              padding: '14px 32px', borderRadius: 999,
              fontSize: 15, fontWeight: 700, fontFamily: SF,
              letterSpacing: '-0.01em',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#333'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1a'; }}
            >
              Book a demo
            </button>
          </div>

          {/* Right: gradient card + screenshot */}
          <div style={{
            borderRadius: 24, overflow: 'hidden', position: 'relative',
            background: 'linear-gradient(135deg, #ff6b35 0%, #f97316 30%, #a855f7 70%, #6d28d9 100%)',
            padding: '40px 32px 0',
            boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
            minHeight: 380,
            display: 'flex', alignItems: 'flex-end',
          }}>
            <img
              src={featuresScreenshot}
              alt="Product features"
              style={{
                display: 'block', width: '100%',
                borderRadius: '16px 16px 0 0',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.25)',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function GuaranteeSection() {
  const cards = [
    {
      pct: '100%',
      title: 'Refund\nGuarantee',
      desc: 'If a creator fails to deliver as agreed, you will receive a full refund.',
      bg: 'linear-gradient(135deg, #ff6b35 0%, #f97316 50%, #fb923c 100%)',
    },
    {
      pct: '100%',
      title: 'Brand Protection\nContract',
      desc: 'Every collaboration is secured by a legally binding contract.',
      bg: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)',
    },
    {
      pct: '100%',
      title: 'Organic',
      desc: 'All traffic and engagement are authenticated and fraud-free.',
      bg: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)',
    },
  ];

  return (
    <section style={{ background: '#faf8f4', padding: '100px 24px 80px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32, marginBottom: 16, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{
              fontSize: 'clamp(24px, 3.5vw, 44px)', fontWeight: 800,
              letterSpacing: '-0.03em', color: '#1a1a1a', lineHeight: 1.1,
              marginBottom: 0, fontFamily: SF,
            }}>
              Your growth, backed by{' '}
              <span style={{ color: '#f97316' }}>100%</span>{' '}
              guarantee
            </h2>
          </div>
          <button style={{
            flexShrink: 0,
            background: '#1a1a1a', color: '#fff', border: 'none', cursor: 'pointer',
            padding: '14px 28px', borderRadius: 999,
            fontSize: 15, fontWeight: 700, fontFamily: SF,
            letterSpacing: '-0.01em', whiteSpace: 'nowrap',
            alignSelf: 'center',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#333'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1a'; }}
          >
            Book a demo
          </button>
        </div>

        <p style={{ fontSize: 15, color: '#6b6b6b', lineHeight: 1.6, marginBottom: 48, maxWidth: 560 }}>
          Escrow protection and contract safeguards ensure that every influencer partnership remains safe, fair, and transparent.
        </p>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {cards.map(c => (
            <div key={c.title} style={{
              borderRadius: 20, padding: '36px 32px',
              background: c.bg,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              minHeight: 280,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}>
              <div>
                <div style={{
                  fontSize: 'clamp(48px, 6vw, 72px)', fontWeight: 900,
                  color: '#fff', lineHeight: 1, marginBottom: 8, fontFamily: SF,
                }}>
                  {c.pct}
                </div>
                <div style={{
                  fontSize: 'clamp(18px, 2vw, 24px)', fontWeight: 700,
                  color: '#fff', lineHeight: 1.25, marginBottom: 32, fontFamily: SF,
                  whiteSpace: 'pre-line',
                }}>
                  {c.title}
                </div>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, margin: 0 }}>
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#faf8f4', fontFamily: SF }}>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: 680, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 40, paddingBottom: 80 }}>

        {/* Radiating lines SVG */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1200 680"
          xmlns="http://www.w3.org/2000/svg"
        >
          {Array.from({ length: 20 }).map((_, i) => {
            const angle = (i / 20) * 360;
            const rad = (angle * Math.PI) / 180;
            const cx = 600; const cy = 340;
            const len = 700;
            return (
              <line
                key={i}
                x1={cx} y1={cy}
                x2={cx + Math.cos(rad) * len}
                y2={cy + Math.sin(rad) * len}
                stroke="#c8b89a"
                strokeWidth="0.6"
                strokeOpacity="0.4"
              />
            );
          })}
        </svg>

        {/* Decorative blobs - top right */}
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 260, height: 260,
          background: 'linear-gradient(135deg, #c084fc 0%, #818cf8 50%, #38bdf8 100%)',
          borderRadius: '50%', opacity: 0.55, filter: 'blur(2px)', zIndex: 0,
        }} />
        {/* Bottom right */}
        <div style={{
          position: 'absolute', bottom: -40, right: 120, width: 180, height: 180,
          background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
          borderRadius: '50%', opacity: 0.45, filter: 'blur(4px)', zIndex: 0,
        }} />
        {/* Bottom left */}
        <div style={{
          position: 'absolute', bottom: 0, left: -80, width: 220, height: 220,
          background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
          borderRadius: '50%', opacity: 0.4, filter: 'blur(6px)', zIndex: 0,
        }} />

        {/* ── Cloud card: TOP LEFT (chat assistant) */}
        <CloudCard top={24} left={-62}>
          <p style={{ fontSize: 10, color: '#888', marginBottom: 4, fontWeight: 600 }}>Tell Mako Creator what to assist today</p>
          <p style={{ fontSize: 11, color: '#555', marginBottom: 10 }}>Promote a new product launch.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ background: '#f5f0ea', borderRadius: 7, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
              <span style={{ color: '#dc2626', fontSize: 10 }}>⬛</span>
              <span style={{ fontSize: 9, fontWeight: 500, color: '#555' }}>Campaign Brief.pdf</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#fff7ed', borderRadius: 7, padding: '4px 7px', border: '1px solid #fed7aa' }}>
              <span style={{ fontSize: 9, color: '#f97316', fontWeight: 600 }}>AI Analyzing...</span>
              <div style={{ width: 15, height: 15, borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: 9, fontWeight: 700 }}>→</span>
              </div>
            </div>
          </div>
        </CloudCard>

        {/* ── Cloud card: TOP RIGHT (searching creator) — mirrored horizontally */}
        <CloudCard top={24} right={-62} flipH>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#1a1a1a' }}>Matching creator</span>
            <span style={{ fontSize: 12, color: '#888' }}>+</span>
          </div>
          <div style={{ height: 4, background: '#f0ebe3', borderRadius: 999, marginBottom: 10, overflow: 'hidden' }}>
            <div style={{ width: '72%', height: '100%', background: 'linear-gradient(90deg, #818cf8, #c084fc)', borderRadius: 999 }} />
          </div>
          <div style={{ background: '#faf8f4', borderRadius: 8, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, flexShrink: 0, background: 'linear-gradient(135deg, #f5d060, #e8a838)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 700, color: '#7a4f0a', textAlign: 'center', lineHeight: 1.3 }}>MATCH<br/>SCORE</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', lineHeight: 1 }}>4.6<span style={{ fontSize: 11 }}>/5</span></div>
              <div style={{ fontSize: 9, color: '#888' }}>Overall</div>
            </div>
          </div>
        </CloudCard>

        {/* ── Cloud card: BOTTOM LEFT (award badge) — flipped vertically */}
        <CloudCard bottom={24} left={-62} flipV>
          <div style={{ fontSize: 8, fontWeight: 700, color: '#f97316', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>BrandX Rankings</div>
          <div style={{ fontSize: 9, fontWeight: 800, color: '#1a1a1a', marginBottom: 4 }}>TOP PICK 2025</div>
          <div style={{ display: 'inline-block', background: '#1a1a1a', color: '#fff', fontSize: 7, fontWeight: 700, borderRadius: 3, padding: '2px 6px', marginBottom: 6, letterSpacing: '0.04em' }}>BEST AI FOR CREATORS</div>
          <div style={{ fontSize: 9, color: '#888', marginBottom: 6 }}>★★★★★</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#1a1a1a' }}>
            <span style={{ color: '#f97316' }}>Best AI</span> for creator marketing
          </div>
        </CloudCard>

        {/* ── Cloud card: BOTTOM RIGHT (results stats) — flipped both axes */}
        <CloudCard bottom={24} right={-62} flipV flipH>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#1a1a1a' }}>AI Deliver Results</span>
            <span style={{ fontSize: 12, color: '#f97316', fontWeight: 700 }}>+</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[
              { label: 'Views', value: '5M+', color: '#f97316' },
              { label: 'CPM', value: '$12', color: '#22c55e' },
              { label: 'Clicks', value: '+15%', color: '#3b82f6' },
              { label: 'CPC', value: '+11%', color: '#f59e0b' },
            ].map((s) => (
              <div key={s.label} style={{ background: '#faf8f4', borderRadius: 6, padding: '6px 8px' }}>
                <div style={{ fontSize: 8, color: '#888', marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </CloudCard>

        {/* ── Central headline ── */}
        <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', padding: '0 24px', maxWidth: 720 }}>
          <p style={{ fontSize: 15, color: '#6b6b6b', marginBottom: 20, letterSpacing: 0 }}>
            Move faster. Scale smarter. Stay in control.
          </p>
          <h1 style={{
            fontSize: 'clamp(52px, 7vw, 88px)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: '#1a1a1a',
            marginBottom: 40,
          }}>
            Your <span style={{ color: '#f97316' }}>24/7</span> Influencer<br />
            Marketing Platform
          </h1>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/signup/brand"
              style={{
                display: 'inline-block', borderRadius: 999,
                background: '#1a1a1a', color: '#fff',
                fontWeight: 700, fontSize: 16,
                padding: '14px 32px', textDecoration: 'none',
                transition: 'background 0.15s',
              }}
            >
              Sign up
            </a>
            <a
              href="/demo"
              style={{
                display: 'inline-block', borderRadius: 999,
                background: '#f97316', color: '#fff',
                fontWeight: 700, fontSize: 16,
                padding: '14px 32px', textDecoration: 'none',
                transition: 'background 0.15s',
              }}
            >
              Get a free 30 min demo
            </a>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR (marquee ticker) ──────────────────────────────── */}
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 22s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <section style={{ borderTop: '1px solid #e8e3da', borderBottom: '1px solid #e8e3da', background: '#fff', padding: '28px 0', overflow: 'hidden' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#bbb', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 20 }}>
          Trusted by 2,000+ growing brands
        </p>
        <div style={{ overflow: 'hidden', maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)' }}>
          <div className="marquee-track">
            {[...['OASIS', 'Lumina', 'VELOCITY', 'aura.', 'SYNAPSE', 'Bloom', 'CODEFLY', 'Presenti', 'zeabur', 'boardmix', 'ZAER', 'VMEG'],
               ...['OASIS', 'Lumina', 'VELOCITY', 'aura.', 'SYNAPSE', 'Bloom', 'CODEFLY', 'Presenti', 'zeabur', 'boardmix', 'ZAER', 'VMEG']
            ].map((b, i) => (
              <span key={i} style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: '#555', opacity: 0.5, padding: '0 40px', whiteSpace: 'nowrap', filter: 'grayscale(1)' }}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT VIDEO ────────────────────────────────────────────── */}
      <VideoSection />

      {/* ── CREATOR NETWORK ─────────────────────────────────────────── */}
      <CreatorNetworkSection />

      {/* ── FIND CREATORS ───────────────────────────────────────────── */}
      <FindCreatorsSection />

      {/* ── FEATURES ───────────────────────────────────────────────── */}
      <section style={{ padding: '100px 24px', background: '#faf8f4' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#1a1a1a', marginBottom: 16 }}>
              Everything you need to scale<br />creator marketing
            </h2>
            <p style={{ fontSize: 18, color: '#6b6b6b', maxWidth: 560, margin: '0 auto' }}>
              Built for small businesses who want agency-quality results without agency-sized budgets.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {[
              {
                emoji: '🎯',
                title: 'AI-Powered Discovery',
                desc: 'Find creators who actually convert. AI analyzes audience demographics, engagement rates, and past performance to find your perfect match.'
              },
              {
                emoji: '⚡',
                title: 'Automated Outreach',
                desc: 'Send personalized outreach sequences, negotiate rates, and manage contracts — all in one place, no spreadsheets.'
              },
              {
                emoji: '📈',
                title: 'Real-time ROI Tracking',
                desc: 'Track every view, click, and sale. Generate unique promo codes and affiliate links to measure exact campaign ROI.'
              },
            ].map((f) => (
              <div key={f.title} style={{
                background: '#fff', borderRadius: 20, padding: '36px 32px',
                border: '1px solid #e8e3da', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, background: '#fff7ed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, marginBottom: 20,
                }}>{f.emoji}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 12, letterSpacing: '-0.02em' }}>{f.title}</h3>
                <p style={{ fontSize: 15, color: '#6b6b6b', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
      <section style={{ padding: '100px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#1a1a1a', marginBottom: 16, lineHeight: 1.1 }}>
              Launch your first campaign in <span style={{ color: '#f97316' }}>minutes</span>, not weeks.
            </h2>
            <p style={{ fontSize: 17, color: '#6b6b6b', marginBottom: 40, lineHeight: 1.6 }}>
              We've simplified the entire influencer marketing workflow into three intuitive steps.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {[
                { step: '01', title: 'Search & Filter', desc: 'Search our database of 5M+ verified creators. Filter by niche, location, engagement rate, and price.' },
                { step: '02', title: 'Connect & Contract', desc: 'Send bulk outreach, negotiate rates, and sign built-in legal agreements without leaving the platform.' },
                { step: '03', title: 'Track & Pay', desc: 'Monitor deliverables, approve content, and process automated payouts when the job is done.' },
              ].map((s) => (
                <div key={s.step} style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                  <div style={{
                    flexShrink: 0, width: 44, height: 44, borderRadius: '50%',
                    background: '#fff7ed', border: '2px solid #fed7aa',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800, color: '#f97316',
                  }}>{s.step}</div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>{s.title}</div>
                    <div style={{ fontSize: 14, color: '#6b6b6b', lineHeight: 1.6 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <a
              href="/how-it-works"
              style={{
                display: 'inline-block', marginTop: 36, borderRadius: 999,
                background: '#f97316', color: '#fff', fontWeight: 700, fontSize: 15,
                padding: '13px 28px', textDecoration: 'none',
              }}
            >
              See how it works →
            </a>
          </div>
          <div style={{
            background: '#faf8f4', borderRadius: 24, padding: 32,
            border: '1px solid #e8e3da', minHeight: 380,
            display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center',
          }}>
            {[
              { name: '@foodie_sarah', followers: '245K', eng: '4.2%', niche: 'Food & Beverage' },
              { name: '@travel_mike', followers: '89K', eng: '6.8%', niche: 'Lifestyle' },
              { name: '@tech_reviewer', followers: '512K', eng: '3.1%', niche: 'Technology' },
            ].map((c, i) => (
              <div key={c.name} style={{
                background: '#fff', borderRadius: 14, padding: '14px 18px',
                border: '1px solid #e8e3da', display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: ['#fed7aa', '#bbf7d0', '#bfdbfe'][i],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 800, color: '#1a1a1a',
                }}>{c.name[1].toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{c.niche}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{c.followers}</div>
                  <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>{c.eng} eng</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────── */}
      <section style={{ background: '#1a1a1a', padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, textAlign: 'center' }}>
          {[
            { value: '5M+', label: 'Verified Creators' },
            { value: '2,000+', label: 'Active Brands' },
            { value: '$12 CPM', label: 'Average Cost' },
            { value: '4.6/5', label: 'Match Score' },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 44, fontWeight: 800, color: '#f97316', letterSpacing: '-0.03em', marginBottom: 8 }}>{s.value}</div>
              <div style={{ fontSize: 14, color: '#aaa', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── GUARANTEE ──────────────────────────────────────────────── */}
      <GuaranteeSection />

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: '#faf8f4', padding: '100px 24px', textAlign: 'center' }}>
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1200 400"
        >
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i / 16) * 360;
            const rad = (angle * Math.PI) / 180;
            return (
              <line key={i} x1={600} y1={200}
                x2={600 + Math.cos(rad) * 700}
                y2={200 + Math.sin(rad) * 700}
                stroke="#c8b89a" strokeWidth="0.6" strokeOpacity="0.35"
              />
            );
          })}
        </svg>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#1a1a1a', marginBottom: 20, maxWidth: 700, margin: '0 auto 20px' }}>
            Ready to scale your brand with creators?
          </h2>
          <p style={{ fontSize: 18, color: '#6b6b6b', marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
            Join thousands of small businesses driving real revenue. Start your 14-day free trial today.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/signup/brand" style={{
              display: 'inline-block', borderRadius: 999,
              background: '#f97316', color: '#fff', fontWeight: 700, fontSize: 16,
              padding: '15px 36px', textDecoration: 'none',
            }}>
              Start free trial
            </a>
            <a href="/demo" style={{
              display: 'inline-block', borderRadius: 999,
              background: '#1a1a1a', color: '#fff', fontWeight: 700, fontSize: 16,
              padding: '15px 36px', textDecoration: 'none',
            }}>
              Book a demo
            </a>
          </div>
          <p style={{ fontSize: 13, color: '#aaa', marginTop: 20 }}>No credit card required • Cancel anytime</p>
        </div>
      </section>
    </div>
  );
}
