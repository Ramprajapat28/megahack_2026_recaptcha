import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Tiny helpers ─────────────────────────────── */
const useScrolled = (threshold = 24) => {
  const [v, set] = useState(false);
  useEffect(() => {
    const h = () => set(window.scrollY > threshold);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, [threshold]);
  return v;
};

const useInView = (ref, threshold = 0.25) => {
  const [v, set] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) set(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return v;
};

const useCounter = (target, duration = 1600, go = false) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!go) return;
    let start = null;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setN(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, go]);
  return n;
};

/* ─── Floating orbs background ─────────────────── */
const OrbBg = ({ count = 6 }) => (
  <div className="lp-orb-wrap" aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`lp-orb lp-orb-${i + 1}`} />
    ))}
  </div>
);

/* ─── Stat counter ──────────────────────────────── */
const Stat = ({ value, suffix, label, go }) => {
  const n = useCounter(value, 1800, go);
  return (
    <div className="lp-stat">
      <span className="lp-stat-n">{n.toLocaleString()}{suffix}</span>
      <span className="lp-stat-l">{label}</span>
    </div>
  );
};

/* ─── Exam badge pill ───────────────────────────── */
const ExamBadge = ({ label, color, icon }) => (
  <div className="lp-exam-badge" style={{ "--badge-color": color }}>
    <span className="lp-exam-badge-icon">{icon}</span>
    {label}
  </div>
);

/* ─── Feature card ──────────────────────────────── */
const FCard = ({ icon, title, desc, tag, delay = "0s" }) => (
  <div className="lp-fcard" style={{ animationDelay: delay }}>
    {tag && <div className="lp-fcard-tag">{tag}</div>}
    <div className="lp-fcard-icon">{icon}</div>
    <h3 className="lp-fcard-title">{title}</h3>
    <p className="lp-fcard-desc">{desc}</p>
  </div>
);

/* ─── Testimonial card ──────────────────────────── */
const TCard = ({ name, branch, year, text }) => (
  <div className="lp-tcard">
    <p className="lp-tcard-text">"{text}"</p>
    <div className="lp-tcard-meta">
      <div className="lp-tcard-avatar">{name[0]}</div>
      <div>
        <div className="lp-tcard-name">{name}</div>
        <div className="lp-tcard-sub">{branch} · {year}</div>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════
   LANDING PAGE
══════════════════════════════════════════════════ */
export default function LandingPage() {
  const nav = useNavigate();
  const scrolled = useScrolled();
  const statsRef = useRef(null);
  const statsGo = useInView(statsRef);

  return (
    <>
      {/* ══ GLOBAL STYLES ══════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; background: #f8fafc; color: #1e293b; overflow-x: hidden; }

        /* ── NAVBAR ── */
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 6%; height: 66px;
          background: rgba(10, 30, 55, 0.88);
          backdrop-filter: blur(18px) saturate(160%);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          transition: box-shadow 0.35s;
        }
        .lp-nav.lp-scrolled { box-shadow: 0 6px 40px rgba(0,0,0,0.35); }
        .lp-brand {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; user-select: none;
        }
        .lp-brand-logo {
          width: 34px; height: 34px; border-radius: 9px;
          background: linear-gradient(135deg, #1349c5, #60a5fa);
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; font-weight: 900; color: #fff;
          box-shadow: 0 4px 14px rgba(19,73,197,0.5);
        }
        .lp-brand-name { font-size: 1.15rem; font-weight: 800; color: #fff; letter-spacing: -0.4px; }
        .lp-brand-name span { color: #60a5fa; }
        .lp-nav-links { display: flex; align-items: center; gap: 32px; }
        .lp-nav-a {
          color: rgba(255,255,255,0.7); font-size: 0.88rem; font-weight: 500;
          text-decoration: none; transition: color 0.2s; white-space: nowrap;
        }
        .lp-nav-a:hover { color: #fff; }
        .lp-btn-nav {
          display: inline-flex; align-items: center; gap: 7px;
          background: linear-gradient(135deg, #1349c5 0%, #2563eb 100%);
          color: #fff; font-size: 0.88rem; font-weight: 700;
          padding: 9px 22px; border-radius: 10px; border: none; cursor: pointer;
          box-shadow: 0 4px 18px rgba(19,73,197,0.45);
          transition: transform 0.22s, box-shadow 0.22s;
          white-space: nowrap;
        }
        .lp-btn-nav:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(19,73,197,0.55); }

        /* ── ORB BG ── */
        .lp-orb-wrap { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
        .lp-orb { position: absolute; border-radius: 50%; filter: blur(85px); opacity: 0.22; }
        .lp-orb-1 { width: 520px; height: 520px; background: #1349c5; top: -100px; left: -120px; animation: orbFloat 14s ease-in-out infinite alternate; }
        .lp-orb-2 { width: 400px; height: 400px; background: #7c3aed; top: 40%; right: -80px; animation: orbFloat 18s ease-in-out infinite alternate-reverse; }
        .lp-orb-3 { width: 300px; height: 300px; background: #0e7490; bottom: 80px; left: 25%; animation: orbFloat 12s ease-in-out infinite alternate; }
        .lp-orb-4 { width: 260px; height: 260px; background: #1d4ed8; top: 55%; left: -60px; animation: orbFloat 20s ease-in-out infinite alternate-reverse; }
        .lp-orb-5 { width: 350px; height: 350px; background: #4f46e5; bottom: -100px; right: 20%; animation: orbFloat 16s ease-in-out infinite alternate; }
        .lp-orb-6 { width: 200px; height: 200px; background: #0d9488; top: 20%; left: 55%; animation: orbFloat 10s ease-in-out infinite alternate-reverse; }
        @keyframes orbFloat { from { transform: translate(0,0) scale(1); } to { transform: translate(30px, 40px) scale(1.08); } }

        /* ── HERO ── */
        .lp-hero {
          min-height: 100vh; position: relative; overflow: hidden;
          background: linear-gradient(160deg, #060e1f 0%, #091830 40%, #0a1e3d 70%, #0d2a54 100%);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 120px 6% 80px; text-align: center;
        }
        .lp-hero > * { position: relative; z-index: 1; }
        .lp-hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid rgba(96,165,250,0.35); background: rgba(96,165,250,0.08);
          color: #93c5fd; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; padding: 6px 18px; border-radius: 100px;
          margin-bottom: 28px; backdrop-filter: blur(8px);
          animation: fadeUp 0.7s ease both;
        }
        .lp-live-dot {
          width: 7px; height: 7px; background: #34d399; border-radius: 50%;
          box-shadow: 0 0 6px #34d399; animation: blink 1.6s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
        .lp-hero-h1 {
          font-size: clamp(2.6rem, 6vw, 5rem); font-weight: 900; color: #fff;
          line-height: 1.06; letter-spacing: -2.5px; margin-bottom: 20px;
          animation: fadeUp 0.75s 0.08s ease both;
        }
        .lp-hero-h1 .lp-grad {
          background: linear-gradient(95deg, #60a5fa 0%, #a78bfa 50%, #60a5fa 100%);
          background-size: 200%;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; animation: shimmer 4s linear infinite;
        }
        @keyframes shimmer { 0%{background-position:0%} 100%{background-position:200%} }
        .lp-hero-sub {
          color: rgba(255,255,255,0.62); font-size: clamp(1rem, 1.8vw, 1.2rem);
          max-width: 600px; line-height: 1.75; margin-bottom: 16px;
          animation: fadeUp 0.75s 0.15s ease both;
        }
        /* Exam pills row */
        .lp-exam-row {
          display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;
          margin-bottom: 40px; animation: fadeUp 0.75s 0.22s ease both;
        }
        .lp-exam-badge {
          display: inline-flex; align-items: center; gap: 7px;
          border: 1px solid color-mix(in srgb, var(--badge-color) 50%, transparent);
          background: color-mix(in srgb, var(--badge-color) 12%, transparent);
          color: var(--badge-color); font-size: 0.82rem; font-weight: 700;
          padding: 6px 16px; border-radius: 100px; letter-spacing: 0.02em;
          backdrop-filter: blur(6px);
          transition: background 0.2s, transform 0.2s;
        }
        .lp-exam-badge:hover { transform: translateY(-2px); background: color-mix(in srgb, var(--badge-color) 22%, transparent); }
        .lp-exam-badge-icon { font-size: 1rem; }
        /* CTA buttons */
        .lp-hero-cta {
          display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;
          animation: fadeUp 0.75s 0.28s ease both;
        }
        .lp-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #1349c5, #2563eb);
          color: #fff; font-size: 1rem; font-weight: 700;
          padding: 14px 34px; border-radius: 12px; border: none; cursor: pointer;
          box-shadow: 0 6px 28px rgba(19,73,197,0.55); text-decoration: none;
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .lp-btn-primary:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 12px 40px rgba(19,73,197,0.6); }
        .lp-btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.07); border: 1.5px solid rgba(255,255,255,0.22);
          color: #fff; font-size: 1rem; font-weight: 600;
          padding: 14px 34px; border-radius: 12px; cursor: pointer;
          backdrop-filter: blur(8px); text-decoration: none;
          transition: background 0.25s, border-color 0.25s, transform 0.25s;
        }
        .lp-btn-ghost:hover { background: rgba(255,255,255,0.13); border-color: rgba(255,255,255,0.45); transform: translateY(-2px); }

        /* ── SCROLL HINT ── */
        .lp-scroll-hint {
          position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          color: rgba(255,255,255,0.35); font-size: 0.72rem; letter-spacing: 0.1em;
          text-transform: uppercase; z-index: 1; animation: fadeUp 1s 0.6s ease both;
        }
        .lp-scroll-line {
          width: 1px; height: 36px;
          background: linear-gradient(to bottom, rgba(255,255,255,0.4), transparent);
          animation: scrollLine 1.6s ease-in-out infinite;
        }
        @keyframes scrollLine { 0%,100%{transform:scaleY(1);opacity:0.5;} 50%{transform:scaleY(0.5);opacity:1;} }

        /* ── STATS BAND ── */
        .lp-stats {
          background: #0e2a47;
          padding: 60px 6%;
          display: grid; grid-template-columns: repeat(auto-fit, minmax(160px,1fr));
          gap: 0; border-top: 1px solid rgba(255,255,255,0.07);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .lp-stat {
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          padding: 20px; border-right: 1px solid rgba(255,255,255,0.08);
          transition: background 0.25s;
        }
        .lp-stat:last-child { border-right: none; }
        .lp-stat:hover { background: rgba(255,255,255,0.04); }
        .lp-stat-n { font-size: 2.4rem; font-weight: 900; color: #fff; line-height: 1; }
        .lp-stat-l { font-size: 0.82rem; color: rgba(255,255,255,0.55); font-weight: 500; text-align: center; }

        /* ── SECTION SHARED ── */
        .lp-section { padding: 96px 6%; }
        .lp-section-inner { max-width: 1140px; margin: 0 auto; }
        .lp-section-label {
          display: inline-block; background: #eff6ff; color: #1349c5;
          font-size: 0.74rem; font-weight: 800; letter-spacing: 0.1em;
          text-transform: uppercase; padding: 5px 14px; border-radius: 100px; margin-bottom: 14px;
        }
        .lp-section-h2 {
          font-size: clamp(1.75rem, 3.5vw, 2.65rem); font-weight: 800;
          color: #0d1f3c; letter-spacing: -1.2px; margin-bottom: 12px; line-height: 1.18;
        }
        .lp-section-sub { color: #64748b; font-size: 1rem; line-height: 1.72; max-width: 480px; }

        /* ── FEATURES GRID ── */
        .lp-features { background: #f8fafc; }
        .lp-fgrid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr));
          gap: 20px; padding-top: 52px;
        }
        .lp-fcard {
          position: relative; background: #fff; border: 1px solid #e2e8f0;
          border-radius: 20px; padding: 32px 26px;
          transition: transform 0.3s cubic-bezier(.22,.61,.36,1), box-shadow 0.3s, border-color 0.3s;
          animation: fadeUp 0.6s ease both; overflow: hidden;
        }
        .lp-fcard::before {
          content: ''; position: absolute; inset: 0; border-radius: 20px; opacity: 0;
          background: linear-gradient(135deg, rgba(19,73,197,0.04), transparent);
          transition: opacity 0.3s;
        }
        .lp-fcard:hover { transform: translateY(-7px); box-shadow: 0 24px 56px rgba(19,73,197,0.1); border-color: #bfdbfe; }
        .lp-fcard:hover::before { opacity: 1; }
        .lp-fcard-tag {
          position: absolute; top: 18px; right: 18px;
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          color: #fff; font-size: 0.64rem; font-weight: 800; letter-spacing: 0.08em;
          text-transform: uppercase; padding: 3px 10px; border-radius: 100px;
        }
        .lp-fcard-icon {
          width: 52px; height: 52px; border-radius: 14px; background: #eff6ff;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem; margin-bottom: 18px;
          transition: transform 0.3s; position: relative; z-index: 1;
        }
        .lp-fcard:hover .lp-fcard-icon { transform: scale(1.1) rotate(-4deg); }
        .lp-fcard-title { font-size: 1.02rem; font-weight: 700; color: #0d1f3c; margin-bottom: 9px; position: relative; z-index: 1; }
        .lp-fcard-desc { color: #64748b; font-size: 0.9rem; line-height: 1.65; position: relative; z-index: 1; }

        /* ── EXAMS SECTION ── */
        .lp-exams { background: linear-gradient(180deg, #fff 0%, #eef2ff 100%); }
        .lp-exam-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px; padding-top: 52px;
        }
        .lp-exam-card {
          border-radius: 20px; padding: 36px 28px; position: relative; overflow: hidden;
          border: 1px solid transparent; cursor: default;
          transition: transform 0.3s cubic-bezier(.22,.61,.36,1), box-shadow 0.3s;
        }
        .lp-exam-card:hover { transform: translateY(-6px); box-shadow: 0 20px 52px rgba(0,0,0,0.14); }
        .lp-exam-card-bg { position: absolute; inset: 0; border-radius: 20px; opacity: 0.92; z-index: 0; }
        .lp-exam-card > *:not(.lp-exam-card-bg) { position: relative; z-index: 10; }
        .lp-exam-icon { font-size: 2.4rem; margin-bottom: 16px; display: block; }
        .lp-exam-name { font-size: 1.6rem; font-weight: 900; color: #fff; letter-spacing: -0.5px; margin-bottom: 6px; }
        .lp-exam-full { font-size: 0.82rem; font-weight: 500; color: rgba(255,255,255,0.7); margin-bottom: 14px; }
        .lp-exam-tags { display: flex; flex-wrap: wrap; gap: 6px; }
        .lp-exam-tag {
          background: rgba(255,255,255,0.2); color: #fff;
          font-size: 0.72rem; font-weight: 600; padding: 3px 10px; border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.25); backdrop-filter: blur(4px);
        }



        /* ── HOW IT WORKS ── */
        .lp-how { background: linear-gradient(180deg, #fff 0%, #eff6ff 100%); }
        .lp-steps {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(210px,1fr));
          gap: 0; padding-top: 52px; position: relative;
        }
        .lp-steps::before {
          content: ''; position: absolute; top: 88px; left: 10%; right: 10%; height: 2px;
          background: linear-gradient(90deg, #1349c5, #7c3aed, #1349c5);
          background-size: 200%; animation: shimmer 4s linear infinite;
          pointer-events: none;
        }
        @media (max-width: 640px) { .lp-steps::before { display: none; } }
        .lp-step {
          display: flex; flex-direction: column; align-items: center; text-align: center;
          padding: 0 20px 32px;
        }
        .lp-step-n {
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(135deg, #1349c5, #2563eb);
          color: #fff; font-size: 1.1rem; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px; box-shadow: 0 6px 22px rgba(19,73,197,0.4);
          position: relative; z-index: 1; border: 3px solid #fff;
        }
        .lp-step-t { font-size: 0.97rem; font-weight: 700; color: #0d1f3c; margin-bottom: 8px; }
        .lp-step-d { font-size: 0.86rem; color: #64748b; line-height: 1.6; }

        /* ── TESTIMONIALS ── */
        .lp-testimonials { background: #f8fafc; }
        .lp-tgrid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr));
          gap: 20px; padding-top: 52px;
        }
        .lp-tcard {
          background: #fff; border: 1px solid #e2e8f0; border-radius: 20px;
          padding: 28px; transition: transform 0.3s, box-shadow 0.3s;
        }
        .lp-tcard:hover { transform: translateY(-5px); box-shadow: 0 18px 44px rgba(19,73,197,0.09); }
        .lp-tcard-text {
          color: #334155; font-size: 0.95rem; line-height: 1.72; margin-bottom: 20px;
          font-style: italic;
        }
        .lp-tcard-meta { display: flex; align-items: center; gap: 12px; }
        .lp-tcard-avatar {
          width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #1349c5, #60a5fa);
          color: #fff; font-size: 1.1rem; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
        }
        .lp-tcard-name { font-size: 0.9rem; font-weight: 700; color: #0d1f3c; }
        .lp-tcard-sub { font-size: 0.78rem; color: #94a3b8; margin-top: 2px; }

        /* ── CTA FINAL ── */
        .lp-cta {
          background: linear-gradient(135deg, #060e1f 0%, #07183a 50%, #0d2a54 100%);
          padding: 100px 6%; text-align: center; position: relative; overflow: hidden;
        }
        .lp-cta-orb1 {
          position: absolute; width: 480px; height: 480px; border-radius: 50%;
          background: #1349c5; opacity: 0.12; filter: blur(90px);
          top: -120px; left: -80px; pointer-events: none;
        }
        .lp-cta-orb2 {
          position: absolute; width: 400px; height: 400px; border-radius: 50%;
          background: #7c3aed; opacity: 0.12; filter: blur(90px);
          bottom: -80px; right: -80px; pointer-events: none;
        }
        .lp-cta-inner { position: relative; z-index: 1; }
        .lp-cta-h2 {
          font-size: clamp(1.9rem, 4vw, 3rem); font-weight: 900; color: #fff;
          letter-spacing: -1.5px; margin-bottom: 16px;
        }
        .lp-cta-sub { color: rgba(255,255,255,0.62); font-size: 1.05rem; max-width: 500px; margin: 0 auto 40px; line-height: 1.72; }

        /* ── FOOTER ── */
        .lp-footer {
          background: #04090f; color: rgba(255,255,255,0.4);
          padding: 28px 6%; display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px; font-size: 0.83rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .lp-footer-brand { display: flex; align-items: center; gap: 8px; }
        .lp-footer-brand-logo {
          width: 26px; height: 26px; border-radius: 7px;
          background: linear-gradient(135deg, #1349c5, #60a5fa);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.7rem; font-weight: 900; color: #fff;
        }
        .lp-footer strong { color: rgba(255,255,255,0.7); }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 860px) {
          .lp-nav-links .lp-nav-a { display: none; }
        }
        @media (max-width: 600px) {
          .lp-stats { grid-template-columns: 1fr 1fr; }
          .lp-stat { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08); }
          .lp-stat:nth-child(2n) { border-right: none; }
        }
      `}</style>

      {/* ══ NAVBAR ═══════════════════════════════════ */}
      <nav className={`lp-nav${scrolled ? " lp-scrolled" : ""}`}>
        <a href="#" className="lp-brand">
          <div className="lp-brand-logo">P</div>
          <span className="lp-brand-name">Prep<span>Forge</span></span>
        </a>
        <div className="lp-nav-links">
          <a href="#features" className="lp-nav-a">Features</a>
          <a href="#exams" className="lp-nav-a">Exams</a>
          <a href="#coming" className="lp-nav-a">Roadmap</a>
          <a href="#how" className="lp-nav-a">How It Works</a>
          <button
            id="nav-login-btn"
            className="lp-btn-nav"
            onClick={() => nav("/login")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Login
          </button>
        </div>
      </nav>

      {/* ══ HERO ═════════════════════════════════════ */}
      <section className="lp-hero">
        <OrbBg count={6} />

        <div className="lp-hero-eyebrow">
          <div className="lp-live-dot" />
          PrepForge · Megahack 2026
        </div>

        <h1 className="lp-hero-h1">
          Your Complete<br />
          <span className="lp-grad">Exam Prep Platform</span>
        </h1>

        <p className="lp-hero-sub">
          Crack JEE, NEET &amp; GATE. Master DSA for interviews.
          Practise with AI-powered question banks and real-time analytics built for serious students.
        </p>

        <div className="lp-exam-row">
          <ExamBadge label="JEE" icon="⚛️" color="#60a5fa" />
          <ExamBadge label="NEET" icon="🧬" color="#34d399" />
          <ExamBadge label="GATE" icon="⚙️" color="#f59e0b" />
          <ExamBadge label="DSA Practice" icon="💡" color="#a78bfa" />
          <ExamBadge label="Interview Prep" icon="🎯" color="#f472b6" />
        </div>

        <div className="lp-hero-cta">
          <button
            id="hero-get-started-btn"
            className="lp-btn-primary"
            onClick={() => nav("/login")}
          >
            Get Started Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
          <a href="#features" className="lp-btn-ghost">
            Explore Features
          </a>
        </div>

        <div className="lp-scroll-hint">
          <div className="lp-scroll-line" />
          Scroll
        </div>
      </section>

      {/* ══ STATS ════════════════════════════════════ */}
      <div id="stats" ref={statsRef} className="lp-stats">
        <Stat value={1200} suffix="+" label="Students Enrolled" go={statsGo} />
        <Stat value={5000} suffix="+" label="AI MCQs Generated" go={statsGo} />
        <Stat value={300} suffix="+" label="Tests Conducted" go={statsGo} />
        <Stat value={98}  suffix="%" label="Platform Uptime"    go={statsGo} />
        <Stat value={3}   suffix=""  label="Competitive Exams"  go={statsGo} />
      </div>

      {/* ══ FEATURES ══════════════════════════════════ */}
      <section id="features" className="lp-section lp-features">
        <div className="lp-section-inner">
          <div className="lp-section-label">Platform Features</div>
          <h2 className="lp-section-h2">Everything to help you succeed</h2>
          <p className="lp-section-sub">
            From aptitude to coding — one platform, all the tools you need to prepare smarter.
          </p>
          <div className="lp-fgrid">
            <FCard
              icon="📊" title="Personalised Analytics"
              desc="Track your scores, identify weak topics, and visualise your growth with detailed performance charts across every test you attempt."
              delay="0s"
            />
            <FCard
              icon="📝" title="Adaptive Practice Tests"
              desc="Thousands of MCQs across Maths, Physics, Chemistry, Biology, and CS — curated for JEE, NEET, and GATE syllabi with difficulty levels."
              delay="0.07s"
            />
            <FCard
              icon="💻" title="DSA Problem Sets"
              desc="Solve handpicked Data Structures & Algorithms problems to sharpen your coding interview skills with topic-wise practice."
              delay="0.14s"
            />
            <FCard
              icon="🤖" title="AI-Powered MCQ Generator"
              desc="Upload a PDF, enter a topic — and let AI craft high-quality aptitude questions instantly, saving immense prep time."
              tag="Live"
              delay="0.21s"
            />
            <FCard
              icon="🎙️" title="AI Interview Coach"
              desc="Practise mock interviews with an AI that adapts to your answers, gives real-time feedback, and tracks your improvement over time."
              delay="0.28s"
            />
            <FCard
              icon="🧑‍🏫" title="AI Tutor"
              desc="Stuck on a concept? Ask your personal AI tutor for step-by-step explanations, worked examples, and concept summaries."
              delay="0.35s"
            />
          </div>
        </div>
      </section>

      {/* ══ EXAMS ════════════════════════════════════ */}
      <section id="exams" className="lp-section lp-exams">
        <div className="lp-section-inner">
          <div className="lp-section-label">Supported Exams</div>
          <h2 className="lp-section-h2">Crack India's toughest exams</h2>
          <p className="lp-section-sub">
            Purpose-built question banks and mock tests tailored to the exact syllabus of each exam.
          </p>
          <div className="lp-exam-grid">
            {/* JEE */}
            <div className="lp-exam-card">
              <div className="lp-exam-card-bg" style={{ background: "linear-gradient(135deg,#0f172a,#1e3a5f)" }} />
              <span className="lp-exam-icon">⚛️</span>
              <div className="lp-exam-name">JEE</div>
              <div className="lp-exam-full">Joint Entrance Examination</div>
              <div className="lp-exam-tags">
                <span className="lp-exam-tag">Physics</span>
                <span className="lp-exam-tag">Chemistry</span>
                <span className="lp-exam-tag">Maths</span>
              </div>
            </div>
            {/* NEET */}
            <div className="lp-exam-card">
              <div className="lp-exam-card-bg" style={{ background: "linear-gradient(135deg,#052e16,#14532d)" }} />
              <span className="lp-exam-icon">🧬</span>
              <div className="lp-exam-name">NEET</div>
              <div className="lp-exam-full">National Eligibility cum Entrance Test</div>
              <div className="lp-exam-tags">
                <span className="lp-exam-tag">Biology</span>
                <span className="lp-exam-tag">Physics</span>
                <span className="lp-exam-tag">Chemistry</span>
              </div>
            </div>
            {/* GATE */}
            <div className="lp-exam-card">
              <div className="lp-exam-card-bg" style={{ background: "linear-gradient(135deg,#1c1500,#451a03)" }} />
              <span className="lp-exam-icon">⚙️</span>
              <div className="lp-exam-name">GATE</div>
              <div className="lp-exam-full">Graduate Aptitude Test in Engineering</div>
              <div className="lp-exam-tags">
                <span className="lp-exam-tag">CS/IT</span>
                <span className="lp-exam-tag">ECE</span>
                <span className="lp-exam-tag">ME</span>
                <span className="lp-exam-tag">Civil</span>
              </div>
            </div>
            {/* DSA */}
            <div className="lp-exam-card">
              <div className="lp-exam-card-bg" style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81)" }} />
              <span className="lp-exam-icon">💡</span>
              <div className="lp-exam-name">DSA</div>
              <div className="lp-exam-full">Data Structures & Algorithms</div>
              <div className="lp-exam-tags">
                <span className="lp-exam-tag">Arrays</span>
                <span className="lp-exam-tag">Trees</span>
                <span className="lp-exam-tag">DP</span>
                <span className="lp-exam-tag">Graphs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════ */}
      <section id="how" className="lp-section lp-how">
        <div className="lp-section-inner">
          <div style={{ textAlign: "center" }}>
            <div className="lp-section-label">How It Works</div>
            <h2 className="lp-section-h2" style={{ textAlign: "center" }}>Start in under a minute</h2>
          </div>
          <div className="lp-steps">
            <div className="lp-step">
              <div className="lp-step-n">01</div>
              <div className="lp-step-t">Login with your credentials</div>
              <div className="lp-step-d">Your institution gives you access. Log in and land on your personalised dashboard instantly.</div>
            </div>
            <div className="lp-step">
              <div className="lp-step-n">02</div>
              <div className="lp-step-t">Choose your exam or topic</div>
              <div className="lp-step-d">Pick JEE, NEET, GATE, DSA or browse by subject — the question bank adapts to your goals.</div>
            </div>
            <div className="lp-step">
              <div className="lp-step-n">03</div>
              <div className="lp-step-t">Attempt & get instant feedback</div>
              <div className="lp-step-d">Submit answers and see detailed explanations, scores, and comparisons against peers in real time.</div>
            </div>
            <div className="lp-step">
              <div className="lp-step-n">04</div>
              <div className="lp-step-t">Track your growth</div>
              <div className="lp-step-d">Visit your analytics dashboard to see topic-wise improvement curves and focus areas over time.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ═════════════════════════════ */}
      <section className="lp-section lp-testimonials">
        <div className="lp-section-inner">
          <div className="lp-section-label">Student Stories</div>
          <h2 className="lp-section-h2">What our students say</h2>
          <div className="lp-tgrid">
            <TCard
              name="Arjun Mehta" branch="Computer Engineering" year="3rd Year"
              text="The AI MCQ generator is a game-changer. I upload my notes and it instantly creates practice questions I couldn't have thought of myself."
            />
            <TCard
              name="Sneha Patil" branch="Electronics" year="4th Year"
              text="The GATE mock tests felt exactly like the real exam. The analytics section showed me exactly where I was losing marks — my score jumped 20 points."
            />
            <TCard
              name="Rohit Sharma" branch="Mechanical" year="2nd Year"
              text="Being able to practise JEE problems and DSA questions on the same platform means I don't need five different apps anymore. Everything is right here."
            />
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ════════════════════════════════ */}
      <section className="lp-cta">
        <div className="lp-cta-orb1" />
        <div className="lp-cta-orb2" />
        <div className="lp-cta-inner">
          <h2 className="lp-cta-h2">Ready to start preparing smarter?</h2>
          <p className="lp-cta-sub">
            Join thousands of students using PrepForge to crack competitive exams and land their dream jobs.
          </p>
          <button
            id="cta-final-login-btn"
            className="lp-btn-primary"
            style={{ fontSize: "1.05rem", padding: "15px 40px" }}
            onClick={() => nav("/login")}
          >
            Login to PrepForge
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════ */}
      <footer className="lp-footer">
        <div className="lp-footer-brand">
          <div className="lp-footer-brand-logo">P</div>
          <span><strong>PrepForge</strong> · Megahack 2026</span>
        </div>
        <span>© 2026 All rights reserved · Built with ❤️ by the team</span>
      </footer>
    </>
  );
}
