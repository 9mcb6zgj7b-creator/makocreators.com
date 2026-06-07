"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";

const SF = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

/* ─── NAV STRUCTURE ──────────────────────────────────────────────────────── */

const NAV = [
  {
    id: 'overview',
    label: 'Mako Creator Overview',
    icon: '◈',
    children: [],
  },
  {
    id: 'mako-101',
    label: 'Mako Creator 101',
    icon: '›',
    children: [
      { id: 'creating-campaign', label: 'Creating a campaign' },
      { id: 'creator-matching', label: 'Creator matching' },
      { id: 'outreach-pricing', label: 'Outreach & pricing' },
      { id: 'confirming-creators', label: 'Confirming creators' },
      { id: 'content-delivery', label: 'Content & delivery' },
      { id: 'tracking-results', label: 'Tracking results' },
    ],
  },
  {
    id: 'platform-features',
    label: 'Platform & Features',
    icon: '›',
    children: [
      { id: 'ai-matching', label: 'AI matching engine' },
      { id: 'escrow-payments', label: 'Escrow payment system' },
      { id: 'analytics', label: 'Analytics & reporting' },
    ],
  },
  {
    id: 'faq-section',
    label: 'FAQ',
    icon: '',
    children: [],
  },
];

/* ─── CONTENT ────────────────────────────────────────────────────────────── */

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff7f2', border: '1px solid #fed7aa',
      borderLeft: '3px solid #f97316',
      borderRadius: 8, padding: '14px 18px',
      fontSize: 14, color: '#555', lineHeight: 1.7, fontFamily: SF,
      margin: '20px 0',
    }}>
      {children}
    </div>
  );
}

function ExampleBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#f5f3ef', borderRadius: 12, padding: '18px 22px',
      margin: '16px 0', border: '1px solid #e8e3da',
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#888', fontFamily: SF, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function H1({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h1 id={id} style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#1a1a1a', fontFamily: SF, marginBottom: 16, marginTop: 0, lineHeight: 1.2 }}>
      {children}
    </h1>
  );
}

function H2({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2 id={id} style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: '#1a1a1a', fontFamily: SF, marginTop: 40, marginBottom: 12, lineHeight: 1.3 }}>
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', fontFamily: SF, marginTop: 24, marginBottom: 8 }}>
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 15, color: '#4a4a4a', lineHeight: 1.8, fontFamily: SF, marginBottom: 16 }}>
      {children}
    </p>
  );
}

function BulletList({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <ul style={{ margin: '12px 0 16px 0', paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#4a4a4a', lineHeight: 1.65, fontFamily: SF }}>
          <span style={{ color: '#f97316', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Divider() {
  return <div style={{ height: 1, background: '#e8e3da', margin: '48px 0' }} />;
}

/* ─── CONTENT SECTIONS ───────────────────────────────────────────────────── */

function OverviewSection() {
  return (
    <section id="overview">
      <H1>Mako Creator Overview</H1>
      <P>
        Mako Creator is an AI-powered influencer marketing platform built for food and lifestyle brands. Instead of spending weeks searching spreadsheets or briefing agencies, you get a curated shortlist of verified creators in minutes — matched by audience overlap, engagement quality, and brand fit.
      </P>
      <P>
        <strong>From a pool of 10M+ creators, Mako surfaces those who actually move the needle for your brand.</strong>
      </P>
      <P>
        Our AI engine is trained on millions of real brand–creator collaborations across Instagram, TikTok, and YouTube. It continuously adapts to real-time audience signals and trend data, so the creators you see today are the right ones for where your market is heading — not where it was six months ago.
      </P>

      <Callout>
        <strong>Why Mako Creator?</strong> A typical in-house team can review around 300–500 creator profiles per day. Mako can scan 10M+ profiles and generate a ranked shortlist within minutes — expanding your discovery capacity by 10,000×, without the agency markup.
      </Callout>

      <H2>What you can do on Mako Creator</H2>
      <BulletList items={[
        <><strong>Discover creators</strong> — search by niche, platform, follower tier, engagement rate, audience location, and brand affinity score.</>,
        <><strong>Run campaigns</strong> — publish a campaign brief, let creators apply, and manage the full pipeline from one dashboard.</>,
        <><strong>Pay securely</strong> — funds are held in escrow and released only after content is approved, with a flat 10% platform fee and no subscription.</>,
        <><strong>Track performance</strong> — monitor reach, impressions, engagement, and ROI for every creator in real time.</>,
        <><strong>Scale confidently</strong> — fake follower detection and audience quality scoring ensure every creator you work with is the real deal.</>,
      ]} />
    </section>
  );
}

function CreatingCampaignSection() {
  return (
    <section id="creating-campaign">
      <H1>Creating a Campaign</H1>
      <P>
        A well-structured campaign brief is the foundation of a successful creator collaboration. The more clearly you define your goals, the better Mako's AI can surface creators whose audience genuinely matches your ideal customer.
      </P>

      <H2>1. Set your campaign objective</H2>
      <P>
        Start by choosing what you want to achieve. Mako Creator supports three core objectives:
      </P>
      <BulletList items={[
        <><strong>Brand awareness</strong> — maximize reach and impressions across a target demographic.</>,
        <><strong>Product launch</strong> — drive excitement and traffic for a new menu item, product line, or location opening.</>,
        <><strong>Performance / conversions</strong> — track promo code redemptions, app installs, or online orders directly attributed to each creator.</>,
      ]} />
      <P>
        Your chosen objective shapes how Mako ranks and recommends creators — so pick the one that actually reflects how you'll measure success.
      </P>

      <H2>2. Write a compelling brief</H2>
      <P>
        Your brief is what creators read before deciding whether to apply. A strong brief gets more applications from higher-quality creators.
      </P>
      <ExampleBox label="Brief example">
        <P><strong>Brand introduction:</strong> We're a fast-casual Korean BBQ chain with 12 locations across the West Coast. Our audience is food-curious 25–35 year olds who care about quality ingredients and bold flavors.</P>
        <P><strong>What we're looking for:</strong> A creator who makes authentic food content — no scripted testimonials. We want real reactions, behind-the-scenes prep footage, or a "first visit" vlog format.</P>
        <P><strong>Deliverables:</strong> 1× TikTok video (60–90s), 3× Stories. Usage rights for 30 days.</P>
      </ExampleBox>

      <H2>3. Set your budget and timeline</H2>
      <P>
        Enter the total budget you want to allocate for this campaign. Mako will hold these funds in your brand wallet — they're only released to creators after content is approved. You can set an application deadline and a target go-live date so creators know your expected timeline upfront.
      </P>
      <Callout>
        <strong>Tip:</strong> Campaigns with a defined budget range tend to attract 40% more applications than those with no budget disclosed. Creators value transparency, and so do we.
      </Callout>
    </section>
  );
}

function CreatorMatchingSection() {
  return (
    <section id="creator-matching">
      <H1>Creator Matching</H1>
      <P>
        Once your campaign is live, Mako's recommendation engine gets to work. It doesn't just filter by follower count — it scores every creator against your specific campaign parameters and surfaces the ones most likely to drive results.
      </P>

      <H2>How the AI match score works</H2>
      <P>
        Each creator you see in your recommendations receives a <strong>match score</strong> from 0–100. This score is calculated from four weighted signals:
      </P>
      <BulletList items={[
        <><strong>Audience overlap (40%)</strong> — what percentage of the creator's followers match your target demographic by age, location, and interest category.</>,
        <><strong>Content relevance (30%)</strong> — how closely the creator's past content aligns with your brand category, using semantic analysis of captions, hashtags, and video transcripts.</>,
        <><strong>Engagement quality (20%)</strong> — real engagement rate adjusted for follower size, comment sentiment, and saves/shares ratio (not just likes).</>,
        <><strong>Brand affinity (10%)</strong> — whether the creator has historically worked with brands in adjacent categories and how those collaborations performed.</>,
      ]} />

      <H2>Audience quality checks</H2>
      <P>
        Every creator on Mako Creator goes through an automated audience audit before being surfaced to brands. This includes:
      </P>
      <BulletList items={[
        'Fake follower detection using growth pattern analysis and engagement anomaly scoring',
        'Bot comment filtering to ensure engagement metrics reflect real human interaction',
        'Audience location and age verification against platform-provided demographic data',
        'Historical partnership review to surface any brand safety concerns',
      ]} />
      <Callout>
        Mako Creator only surfaces creators with an audience quality score above 70. Creators who fall below this threshold are excluded from recommendations, regardless of follower count.
      </Callout>
    </section>
  );
}

function OutreachPricingSection() {
  return (
    <section id="outreach-pricing">
      <H1>Outreach & Pricing</H1>
      <P>
        Forget email threads and spreadsheet negotiations. Once Mako recommends a creator, you can invite them to your campaign directly through the platform. Creator pricing is estimated by Mako's AI before you even reach out, so there are no surprises.
      </P>

      <H2>How creator pricing is estimated</H2>
      <P>
        Mako calculates a recommended price for each creator based on:
      </P>
      <BulletList items={[
        <><strong>Estimated CPM</strong> — derived from the creator's average views per post multiplied by their audience quality score.</>,
        <><strong>Content format</strong> — short-form video, long-form review, Stories, and static posts each carry different market rates.</>,
        <><strong>Exclusivity window</strong> — whether you need the creator to avoid competitor brands during the campaign.</>,
        <><strong>Usage rights</strong> — extending rights beyond the standard 30 days increases the fee accordingly.</>,
      ]} />
      <ExampleBox label="Pricing example">
        <P>A food creator with 180K TikTok followers, 6.2% engagement rate, and a 30-day exclusivity window requesting a 60-second product video:</P>
        <P><strong>Estimated range: $800 – $1,200 per post</strong></P>
        <P>Mako surfaces this estimate before you invite them, so you can set expectations before any conversation begins.</P>
      </ExampleBox>

      <H2>Negotiation — done by AI</H2>
      <P>
        When a creator applies or responds to your invitation, Mako's AI negotiation agent handles the back-and-forth on your behalf. It aims to get you the best price within your budget while being fair to the creator. Some creators proactively offer lower rates to signal their commitment to the partnership.
      </P>
      <P>
        You're notified of the final agreed rate and can approve or decline before any funds are committed.
      </P>
    </section>
  );
}

function ConfirmingCreatorsSection() {
  return (
    <section id="confirming-creators">
      <H1>Confirming Creators</H1>
      <P>
        Once you're happy with a creator's application and the agreed rate, confirming them locks in the collaboration and moves funds from your brand wallet into escrow. This protects both sides: the creator knows they'll be paid, and you know funds won't be released until you approve the content.
      </P>

      <H2>What happens at confirmation</H2>
      <BulletList items={[
        'The agreed creator fee is moved from your wallet into a secure escrow account',
        'The creator receives a confirmation notification with full campaign details and deadlines',
        'A collaboration contract is auto-generated and signed digitally by both parties',
        'Content submission and approval timelines are set and tracked in your campaign dashboard',
      ]} />

      <H2>Managing multiple creators</H2>
      <P>
        If you're running a multi-creator campaign, each creator is confirmed individually. You can stagger confirmations — for example, confirming your top three picks first and holding budget for a backup — without affecting other active collaborations.
      </P>
      <Callout>
        <strong>Refund policy:</strong> If a confirmed creator fails to submit content by the agreed deadline, or if the submitted content is rejected after two revision rounds, the escrowed funds are automatically returned to your brand wallet in full.
      </Callout>
    </section>
  );
}

function ContentDeliverySection() {
  return (
    <section id="content-delivery">
      <H1>Content & Delivery</H1>
      <P>
        After confirmation, creators move into the content production phase. Mako's platform keeps everything organized — draft submissions, revision requests, and final approvals all happen in one place, with a clear audit trail.
      </P>

      <H2>The content review workflow</H2>
      <BulletList items={[
        <><strong>Draft submission</strong> — creator uploads a draft (script, storyboard, or rough cut) for your review before final production begins.</>,
        <><strong>Feedback round</strong> — you can leave timestamped comments on videos or annotate images directly in the platform. Up to two rounds of revisions are included.</>,
        <><strong>Final approval</strong> — once you approve, the creator publishes the content. Mako logs the publish timestamp and URL for performance tracking.</>,
        <><strong>Escrow release</strong> — funds are automatically released to the creator 10 days after content is published, giving you time to verify live performance.</>,
      ]} />

      <H2>Content standards</H2>
      <P>
        All content submitted through Mako Creator is reviewed against our content quality guidelines before you ever see it. Mako automatically flags:
      </P>
      <BulletList items={[
        'AI-generated voiceovers or fully synthetic content',
        'Misleading claims that don\'t align with your approved brief',
        'Copyright issues in background music or third-party footage',
        'Missing disclosure tags (e.g. #ad, #sponsored) required by FTC guidelines',
      ]} />
    </section>
  );
}

function TrackingResultsSection() {
  return (
    <section id="tracking-results">
      <H1>Tracking Results</H1>
      <P>
        Measuring what actually worked is as important as finding the right creators. Mako's analytics dashboard gives you a real-time view of every campaign's performance — across all creators, platforms, and content types.
      </P>

      <H2>Metrics tracked automatically</H2>
      <BulletList items={[
        <><strong>Reach & impressions</strong> — total unique accounts reached and total content views across all placements.</>,
        <><strong>Engagement rate</strong> — likes, comments, saves, and shares normalized by reach, not follower count.</>,
        <><strong>Click-through rate</strong> — via Mako tracking links embedded in creator bios or Stories swipe-ups.</>,
        <><strong>Promo code redemptions</strong> — if you issue creator-specific promo codes, redemption counts are tracked in real time.</>,
        <><strong>Estimated earned media value (EMV)</strong> — the equivalent cost of the same reach purchased as paid ads.</>,
      ]} />

      <H2>Exporting reports</H2>
      <P>
        Campaign reports can be exported as a branded PDF or raw CSV at any time. Each report includes a per-creator breakdown, a campaign-level summary, and an AI-generated narrative that highlights top performers and key insights.
      </P>
      <ExampleBox label="Sample report insight">
        <P><strong>Top performer:</strong> @foodie_marco drove 3.2× the average CTR for this campaign, likely due to the "day in my life" format resonating with his 25–34 female audience in Los Angeles — your primary target market.</P>
        <P><strong>Recommendation:</strong> Consider a long-term ambassador relationship with @foodie_marco for Q3.</P>
      </ExampleBox>
    </section>
  );
}

function PlatformFeaturesSection() {
  return (
    <section id="platform-features">
      <H1>Platform & Features</H1>
      <P>
        Mako Creator is built on three core pillars: discovery intelligence, payment security, and performance clarity. Here's a deeper look at how each one works under the hood.
      </P>

      <div id="ai-matching">
        <H2>AI Matching Engine</H2>
        <P>
          Mako's recommendation system uses a combination of natural language processing (NLP), graph-based audience modeling, and historical campaign outcome data to match brands with creators. Unlike simple keyword filters, the engine understands <em>context</em> — it knows that a fitness creator who frequently covers meal prep is a better fit for a healthy sauce brand than a general food blogger with more followers.
        </P>
        <P>
          The model is retrained weekly on new campaign outcome data, so match quality improves continuously as more brands and creators use the platform.
        </P>
      </div>

      <div id="escrow-payments">
        <H2>Escrow Payment System</H2>
        <P>
          Every payment on Mako Creator flows through a regulated escrow account. This isn't just a Stripe hold — it's a legally structured escrow that provides real protection for both brands and creators.
        </P>
        <BulletList items={[
          'Funds are deposited to your brand wallet via credit card or bank transfer',
          'Wallet balances earn no interest and are ring-fenced — they cannot be used for any purpose other than creator payments',
          'Escrow is triggered at creator confirmation and released automatically after the 10-day post-publish window',
          'Disputes trigger a 72-hour mediation window before any funds move',
        ]} />
      </div>

      <div id="analytics">
        <H2>Analytics & Reporting</H2>
        <P>
          Mako pulls performance data directly from platform APIs (Instagram Graph API, TikTok for Business, YouTube Data API) to ensure accuracy. Data is refreshed every 6 hours for active campaigns and every 24 hours for completed ones.
        </P>
        <P>
          Integrations with Shopify and WooCommerce allow Mako to correlate creator activity with actual purchase data, giving you a true ROAS figure — not just an engagement estimate.
        </P>
      </div>
    </section>
  );
}

function FAQDocSection() {
  const faqs = [
    { q: 'Do I need a subscription to use Mako Creator?', a: 'No. Mako Creator operates on a performance-based model — you deposit funds into your brand wallet and pay a flat 10% platform fee only when a creator delivers approved content. There are no monthly fees or setup costs.' },
    { q: 'How is the 10% platform fee calculated?', a: 'The fee is 10% of the agreed creator fee per collaboration. For example, if you confirm a creator at $1,000, you pay $1,100 total: $1,000 goes to the creator (via escrow) and $100 is the Mako platform fee.' },
    { q: 'What platforms are creators active on?', a: 'Mako Creator currently supports Instagram (Reels, Stories, Feed), TikTok, and YouTube. Platform-specific filtering is available in the discovery search.' },
    { q: 'What happens if I\'m not satisfied with the content?', a: 'Every collaboration includes up to two rounds of revision. If the final content still doesn\'t meet the agreed brief after revisions, you can raise a dispute and Mako will mediate. If the dispute is resolved in your favor, escrowed funds are returned in full.' },
    { q: 'Can I invite creators I already work with?', a: 'Yes. You can send a direct invitation to any creator by username, even if Mako didn\'t surface them in recommendations. They\'ll need to create a Mako Creator account if they don\'t already have one.' },
    { q: 'Is there a minimum campaign budget?', a: 'The minimum deposit is $500. Individual creator fees can be lower than this — you can use a single wallet balance to fund multiple creators across multiple campaigns.' },
  ];

  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq-section">
      <H1>FAQ</H1>
      <P>Common questions about how Mako Creator works.</P>
      <div style={{ marginTop: 24 }}>
        {faqs.map((faq, i) => (
          <div key={i} style={{ borderTop: '1px solid #e8e3da' }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: SF, fontSize: 15, fontWeight: 700, color: '#1a1a1a', textAlign: 'left', gap: 16,
              }}
            >
              <span>{faq.q}</span>
              <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 6l5 5 5-5" stroke="#aaa" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
            {open === i && (
              <div style={{ paddingBottom: 18, paddingRight: 32, fontSize: 14, color: '#666', lineHeight: 1.75, fontFamily: SF }}>
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

/* ─── SIDEBAR ────────────────────────────────────────────────────────────── */

function Sidebar({ activeId, onNav }: { activeId: string; onNav: (id: string) => void }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'mako-101': true,
    'platform-features': false,
  });

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  return (
    <nav style={{
      position: 'sticky', top: 84, height: 'calc(100vh - 100px)',
      overflowY: 'auto', paddingBottom: 40,
      width: 240, flexShrink: 0,
    }}>
      {/* Resources heading */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h12M2 12h7" stroke="#888" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#888', fontFamily: SF, letterSpacing: '0.04em' }}>
          Resources
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map((section) => (
          <div key={section.id}>
            {/* Section header */}
            {section.children.length > 0 ? (
              <button
                onClick={() => toggle(section.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '7px 8px', borderRadius: 8,
                  fontFamily: SF, fontSize: 14, fontWeight: 700,
                  color: '#1a1a1a', textAlign: 'left', gap: 6,
                }}
              >
                <span>{section.label}</span>
                <svg
                  width="14" height="14" viewBox="0 0 14 14" fill="none"
                  style={{ transform: expanded[section.id] ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}
                >
                  <path d="M5 3l4 4-4 4" stroke="#888" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => onNav(section.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  background: activeId === section.id ? '#fff7f2' : 'none',
                  border: 'none', cursor: 'pointer',
                  padding: '7px 8px', borderRadius: 8,
                  fontFamily: SF, fontSize: 14, fontWeight: activeId === section.id ? 700 : 600,
                  color: activeId === section.id ? '#f97316' : '#1a1a1a', textAlign: 'left',
                }}
              >
                {section.label}
              </button>
            )}

            {/* Children */}
            {section.children.length > 0 && expanded[section.id] && (
              <div style={{ marginLeft: 12, marginTop: 2, marginBottom: 4, borderLeft: '1.5px solid #e8e3da', paddingLeft: 12 }}>
                {section.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => onNav(child.id)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      background: activeId === child.id ? '#fff7f2' : 'none',
                      border: 'none', cursor: 'pointer',
                      padding: '6px 8px', borderRadius: 6,
                      fontFamily: SF, fontSize: 13,
                      fontWeight: activeId === child.id ? 700 : 400,
                      color: activeId === child.id ? '#f97316' : '#555',
                    }}
                  >
                    {child.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}

/* ─── PAGE ───────────────────────────────────────────────────────────────── */

const ALL_SECTIONS = [
  'overview', 'creating-campaign', 'creator-matching', 'outreach-pricing',
  'confirming-creators', 'content-delivery', 'tracking-results',
  'platform-features', 'faq-section',
];

export default function HowItWorks() {
  const [activeId, setActiveId] = useState('overview');
  const contentRef = useRef<HTMLDivElement>(null);

  // scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );

    ALL_SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setActiveId(id);
    // expand parent if needed
    if (['ai-matching', 'escrow-payments', 'analytics'].includes(id)) {
      setActiveId('platform-features');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#faf8f4', fontFamily: SF }}>
      {/* page wrapper */}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px 100px', display: 'flex', gap: 64, alignItems: 'flex-start' }}>

        {/* sidebar */}
        <Sidebar activeId={activeId} onNav={scrollTo} />

        {/* content */}
        <div ref={contentRef} style={{ flex: 1, minWidth: 0 }}>
          <OverviewSection />
          <Divider />
          <CreatingCampaignSection />
          <Divider />
          <CreatorMatchingSection />
          <Divider />
          <OutreachPricingSection />
          <Divider />
          <ConfirmingCreatorsSection />
          <Divider />
          <ContentDeliverySection />
          <Divider />
          <TrackingResultsSection />
          <Divider />
          <PlatformFeaturesSection />
          <Divider />
          <FAQDocSection />

          {/* bottom CTA */}
          <div style={{ marginTop: 64, background: '#1a1a1a', borderRadius: 20, padding: '48px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 200, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(249,115,22,0.35) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <h3 style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: SF, letterSpacing: '-0.03em', marginBottom: 12 }}>
                Ready to run your first campaign?
              </h3>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', fontFamily: SF, marginBottom: 32 }}>
                No subscription required. Deposit funds, find the right creators, and only pay when results are delivered.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="/signup/brand" style={{ background: '#f97316', color: '#fff', padding: '12px 28px', borderRadius: 999, fontWeight: 700, fontSize: 15, textDecoration: 'none', fontFamily: SF }}>
                  Start for free
                </a>
                <a href="/demo" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '12px 28px', borderRadius: 999, fontWeight: 600, fontSize: 15, textDecoration: 'none', fontFamily: SF, border: '1px solid rgba(255,255,255,0.15)' }}>
                  Book a demo
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
