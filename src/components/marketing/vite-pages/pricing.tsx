"use client";

import { useState } from "react";

const SF = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

/* ─── DATA ───────────────────────────────────────────────────────────────── */

const PAYMENT_POINTS = [
  {
    title: 'Deposit = Wallet',
    desc: 'Funds are stored in your brand wallet, not immediately spent.',
  },
  {
    title: 'Lock and Release Rules',
    desc: 'Budget is locked only after influencer confirmation, released 10 days after delivery.',
  },
  {
    title: 'Flexible Refunds',
    desc: 'Unused funds can be refunded anytime, 100% guaranteed.',
  },
  {
    title: 'Transparent Pricing',
    desc: 'No subscriptions, no hidden fees — only pay for delivered influencer content.',
  },
  {
    title: 'Escrow-backed Protection',
    desc: 'Funds remain securely held in escrow until delivery, protecting both parties.',
  },
];

const FLOW_STEPS = [
  { icon: '🪙', label: 'Deposit', desc: 'Funds held securely in escrow.' },
  { icon: '🚀', label: 'Launch campaign', desc: 'Publish your campaign details.' },
  { icon: '🤝', label: 'Match creators', desc: 'Get matched with the right creators.' },
  { icon: '✅', label: 'Confirm creator', desc: 'Funds are locked in escrow.' },
  { icon: '📦', label: 'Delivery', desc: 'Creators publish approved content.' },
  { icon: '💸', label: 'Funds released', desc: 'Payment released after approval.' },
];

const FAQS = [
  {
    q: 'Why are creator prices on Mako Creator lower than agencies/in-house?',
    a: 'Mako Creator offers lower influencer prices by replacing costly manual work with AI. We charge just a 10% platform fee (vs. the industry\'s 20–50%), use AI to negotiate fairer rates, and rely on a large creator pool to keep prices competitive and quality stable.',
  },
  {
    q: 'What if the creator doesn\'t deliver or the content doesn\'t meet expectations?',
    a: 'Mako Creator offers full refunds if creators miss deadlines, deliver low-quality or fully AI-generated content, or use fake views. You\'re protected by a clear, performance-based policy and can cancel anytime if expectations aren\'t met.',
  },
  {
    q: 'What payment methods does Mako Creator accept?',
    a: 'Mako Creator supports both credit/debit card binding and funds top-up as payment methods. For bank transfers or other alternative options, please contact our support team for assistance.',
  },
  {
    q: 'How is the creator price calculated?',
    a: 'Mako Creator automatically sets the optimal price for you — calculated by multiplying the creator\'s estimated lowest CPM (based on their audience value) with the predicted views of their branded content.',
  },
  {
    q: 'Can I negotiate the price with the creator?',
    a: "Mako Creator negotiates the best price for you, so you don't have to. Some creators may even offer lower rates than the AI's suggestion to show their interest and commitment.",
  },
  {
    q: 'When will I be charged?',
    a: 'Make a one-time payment when you confirm a creator\'s application. The funds are held in escrow and released only after the collaboration is completed.',
  },
];

const BRAND_CATEGORIES = [
  { label: 'Food & Beverage', brands: ['Panda Express', 'Sweetgreen', 'Auntie Anne\'s', 'Kettlebell Kitchen'] },
  { label: 'Beauty & Wellness', brands: ['Glowlab', 'PurOxy', 'Manna', 'Derm HQ'] },
  { label: 'Consumer Tech', brands: ['SonicBeam', 'freebeat', 'vivago.ai', 'AiPP'] },
  { label: 'Lifestyle & Fashion', brands: ['Sportneer', 'SureThing', 'Roleza', 'VMEG'] },
  { label: 'AI & Software', brands: ['ONLYOFFICE', 'Presenti', 'Pixso', 'zeabur'] },
];

/* ─── HERO ───────────────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section style={{ textAlign: 'center', padding: '88px 24px 64px', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: -160, left: '50%', transform: 'translateX(-50%)',
        width: 800, height: 500, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(249,115,22,0.1) 0%, rgba(251,191,36,0.06) 40%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: '#fff', border: '1px solid #e8e3da', borderRadius: 999,
        padding: '6px 16px', marginBottom: 28,
        fontSize: 13, fontWeight: 500, color: '#4a4a4a', fontFamily: SF,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f97316', display: 'inline-block' }} />
        No subscriptions · No hidden fees
      </div>

      <h1 style={{
        fontSize: 'clamp(44px, 6.5vw, 80px)', fontWeight: 900,
        letterSpacing: '-0.04em', lineHeight: 1.05,
        color: '#1a1a1a', fontFamily: SF, marginBottom: 22,
      }}>
        Pay only for results.<br />
        <span style={{ color: '#f97316' }}>10% platform fee.</span>
      </h1>

      <p style={{
        fontSize: 18, color: '#6b6b6b', maxWidth: 540,
        margin: '0 auto 48px', lineHeight: 1.65, fontFamily: SF,
      }}>
        No subscriptions, no retainers. Deposit funds into your brand wallet and only pay when creators deliver. We take a simple 10% fee — that's it.
      </p>

      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href="/signup/brand" style={{
          background: '#f97316', color: '#fff',
          padding: '14px 32px', borderRadius: 999,
          fontWeight: 700, fontSize: 15, textDecoration: 'none', fontFamily: SF,
        }}>
          Start for free
        </a>
        <a href="/demo" style={{
          background: '#fff', color: '#1a1a1a',
          padding: '14px 32px', borderRadius: 999,
          fontWeight: 600, fontSize: 15, textDecoration: 'none', fontFamily: SF,
          border: '1px solid #e8e3da',
        }}>
          Book a demo
        </a>
      </div>
    </section>
  );
}

/* ─── COST ESTIMATOR ─────────────────────────────────────────────────────── */
function CostEstimator() {
  const BUDGETS = [1000, 2000, 3000, 5000, 10000, 20000, 50000];
  const [budgetIdx, setBudgetIdx] = useState(2);
  const budget = BUDGETS[budgetIdx];
  const fee = budget * 0.1;
  const total = budget + fee;

  return (
    <div style={{
      borderRadius: 20, overflow: 'hidden',
      border: '1px solid #e8e3da',
      boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
      background: '#fff',
      maxWidth: 440,
    }}>
      {/* gradient header banner */}
      <div style={{
        background: 'linear-gradient(135deg, #f97316 0%, #fb923c 40%, #a78bfa 100%)',
        padding: '12px 20px',
        fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: SF,
        textAlign: 'center', letterSpacing: '0.01em',
      }}>
        Funds are held in escrow and only released after creator delivery
      </div>

      <div style={{ padding: '28px 28px 32px' }}>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', fontFamily: SF, marginBottom: 4 }}>
          Campaign Cost Estimator
        </h3>
        <p style={{ fontSize: 13, color: '#888', fontFamily: SF, marginBottom: 24 }}>
          Best for brands looking to build awareness and trust
        </p>

        {/* what you pay */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#888', fontFamily: SF, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          You pay :
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {[
            { icon: '✓', text: 'One-time fee to creators', sub: '(per creator content)', color: '#555' },
            { icon: '✓', text: 'AI platform fee', sub: '(10% of the deal price)', color: '#555' },
            { icon: '⚡', text: 'No setup fees, monthly fees, or hidden fees.', sub: null, color: '#f97316' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ color: i === 2 ? '#f97316' : '#1a1a1a', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: item.color, fontFamily: SF }}>
                {item.text}
                {item.sub && <span style={{ color: '#aaa' }}> {item.sub}</span>}
              </span>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: '#f0ece5', marginBottom: 24 }} />

        {/* budget selector */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#555', fontFamily: SF, display: 'block', marginBottom: 10 }}>
            Budget
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {BUDGETS.map((b, i) => (
              <button
                key={b}
                onClick={() => setBudgetIdx(i)}
                style={{
                  fontFamily: SF, fontSize: 13, fontWeight: 600,
                  borderRadius: 8, padding: '7px 14px',
                  border: `1.5px solid ${budgetIdx === i ? '#f97316' : '#e8e3da'}`,
                  background: budgetIdx === i ? '#fff7f2' : '#fff',
                  color: budgetIdx === i ? '#f97316' : '#555',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                ${b.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* breakdown */}
        <div style={{ background: '#faf8f4', borderRadius: 12, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: '#888', fontFamily: SF }}>Creator budget</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', fontFamily: SF }}>${budget.toLocaleString()}.00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: '#888', fontFamily: SF }}>Platform fee (10%)</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', fontFamily: SF }}>${fee.toLocaleString()}.00</span>
          </div>
          <div style={{ height: 1, background: '#e8e3da' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', fontFamily: SF }}>Total</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', fontFamily: SF }}>${total.toLocaleString()} USD</span>
          </div>
        </div>

        {/* CTA */}
        <a href="/demo" style={{
          display: 'block', marginTop: 20, textAlign: 'center',
          background: 'linear-gradient(135deg, #f97316, #fb923c)',
          color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: SF,
          padding: '13px 24px', borderRadius: 999, textDecoration: 'none',
        }}>
          Book a demo →
        </a>
      </div>
    </div>
  );
}

/* ─── PAYMENT SECTION ────────────────────────────────────────────────────── */
function PaymentSection() {
  return (
    <section style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px 96px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 72, alignItems: 'center',
      }}>
        {/* left: copy */}
        <div>
          <h2 style={{
            fontSize: 'clamp(30px, 3.5vw, 46px)', fontWeight: 900,
            letterSpacing: '-0.03em', color: '#1a1a1a', fontFamily: SF,
            marginBottom: 14, lineHeight: 1.1,
          }}>
            Transparent &amp; Secure Payment
          </h2>
          <p style={{ fontSize: 15, color: '#6b6b6b', fontFamily: SF, lineHeight: 1.65, marginBottom: 36 }}>
            Budget is deposited into your wallet, held in escrow, and released only after creator delivery.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {PAYMENT_POINTS.map((pt) => (
              <div key={pt.title} style={{ display: 'flex', gap: 14 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: '#f97316', flexShrink: 0, marginTop: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1.5 4l2.3 2.3 4.7-4.7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', fontFamily: SF, marginBottom: 3 }}>{pt.title}</div>
                  <div style={{ fontSize: 14, color: '#777', fontFamily: SF, lineHeight: 1.55 }}>{pt.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* right: estimator */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <CostEstimator />
        </div>
      </div>
    </section>
  );
}

/* ─── HOW FUNDS FLOW ─────────────────────────────────────────────────────── */
function FundsFlowSection() {
  return (
    <section style={{ background: '#fff', borderTop: '1px solid #e8e3da', borderBottom: '1px solid #e8e3da', padding: '72px 24px' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{
            fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 900,
            letterSpacing: '-0.03em', color: '#1a1a1a', fontFamily: SF, marginBottom: 12,
          }}>
            How funds flow
          </h2>
          <p style={{ fontSize: 16, color: '#888', fontFamily: SF }}>
            Every step is safeguarded by the platform to protect both brands and creators.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 16,
        }}>
          {FLOW_STEPS.map((step, i) => (
            <div key={step.label} style={{ position: 'relative' }}>
              {/* connector line */}
              {i < FLOW_STEPS.length - 1 && (
                <div style={{
                  position: 'absolute', top: 28, right: -8, width: 16, height: 1,
                  background: '#e8e3da', zIndex: 1,
                  display: 'none', // hidden on mobile; visible via grid gap
                }} />
              )}
              <div style={{
                background: '#f5f3ef', borderRadius: 16, padding: '20px 16px',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{ fontSize: 22 }}>{step.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', fontFamily: SF }}>{step.label}</div>
                <div style={{ fontSize: 12, color: '#888', fontFamily: SF, lineHeight: 1.5 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ────────────────────────────────────────────────────────────────── */
function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section style={{ maxWidth: 800, margin: '0 auto', padding: '88px 24px 88px' }}>
      <h2 style={{
        fontSize: 'clamp(34px, 4vw, 54px)', fontWeight: 900,
        letterSpacing: '-0.03em', color: '#1a1a1a', fontFamily: SF,
        textAlign: 'center', marginBottom: 52,
      }}>
        FAQ
      </h2>

      <div>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ borderTop: '1px solid #e8e3da' }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                padding: '22px 0', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: SF, fontSize: 15, fontWeight: 700, color: '#1a1a1a', textAlign: 'left',
                gap: 20,
              }}
            >
              <span>{faq.q}</span>
              <span style={{
                flexShrink: 0,
                transform: open === i ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
                display: 'flex', alignItems: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 6.5l5 5 5-5" stroke="#aaa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
            {open === i && (
              <div style={{
                paddingBottom: 22, paddingRight: 40,
                fontSize: 14, color: '#666', lineHeight: 1.75,
                fontFamily: SF,
              }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
        <div style={{ borderTop: '1px solid #e8e3da' }} />
      </div>
    </section>
  );
}

/* ─── TRUST SECTION ──────────────────────────────────────────────────────── */
function TrustSection() {
  return (
    <section style={{ background: '#111', padding: '64px 24px' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>
        <h2 style={{
          fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 700,
          color: '#fff', fontFamily: SF, textAlign: 'center', marginBottom: 44,
          letterSpacing: '-0.02em',
        }}>
          Trusted by leading brands across global markets
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
        }}>
          {BRAND_CATEGORIES.map((cat) => (
            <div key={cat.label} style={{
              background: '#1a1a1a', borderRadius: 14,
              padding: '18px 20px', border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {/* traffic light */}
              <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
                {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
                  <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: '#888', fontWeight: 600, fontFamily: SF, marginBottom: 12, letterSpacing: '0.04em' }}>
                {cat.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cat.brands.map((b) => (
                  <div key={b} style={{ fontSize: 13, fontWeight: 600, color: '#ccc', fontFamily: SF }}>{b}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ────────────────────────────────────────────────────────────────── */
function BottomCTA() {
  return (
    <section style={{ background: '#1a1a1a', padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 560, height: 280, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(249,115,22,0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative' }}>
          <h2 style={{
            fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900,
            letterSpacing: '-0.04em', color: '#fff', fontFamily: SF,
            marginBottom: 18, lineHeight: 1.05,
          }}>
            Start your first<br />
            <span style={{ color: '#f97316' }}>campaign today</span>
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', fontFamily: SF, marginBottom: 40, lineHeight: 1.6 }}>
            No setup fee. No subscription. Deposit funds, find creators,<br />
            and only pay when results are delivered.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/signup/brand" style={{
              background: '#f97316', color: '#fff', padding: '14px 32px',
              borderRadius: 999, fontWeight: 700, fontSize: 15,
              textDecoration: 'none', fontFamily: SF,
            }}>
              Start for free
            </a>
            <a href="/demo" style={{
              background: 'rgba(255,255,255,0.08)', color: '#fff',
              padding: '14px 32px', borderRadius: 999,
              fontWeight: 600, fontSize: 15, textDecoration: 'none',
              fontFamily: SF, border: '1px solid rgba(255,255,255,0.12)',
            }}>
              Book a demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── PAGE ───────────────────────────────────────────────────────────────── */
export default function Pricing() {
  return (
    <div style={{ minHeight: '100vh', background: '#faf8f4', fontFamily: SF }}>
      <HeroSection />
      <PaymentSection />
      <FundsFlowSection />
      <FAQSection />
      <TrustSection />
      <BottomCTA />
    </div>
  );
}
