import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const getFileUrl = (filePath) => {
  if (!filePath) return null;
  const clean = filePath.replace(/\\/g, "/");
  if (clean.startsWith("http")) return clean;
  if (clean.startsWith("uploads/")) return API + "/" + clean;
  return API + "/uploads/" + clean.split("/").pop();
};

/* ════════════════════════════════════════════════════════════════════════════
   "PRIVATE VAULT" — Premium gold-scheme dashboard
   Design language: editorial serif + trading-floor mono, 18k gold accents
   over midnight surfaces, circular progress, shimmer, film grain, staggered
   choreography on mount.
   ══════════════════════════════════════════════════════════════════════════ */

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=DM+Sans:wght@400;500;600;700&display=swap');

  :root{
    --bg:#05070F;
    --bg-elev:#0B0F1C;
    --surface:#10152A;
    --surface-2:#151B35;
    --line:rgba(232,185,72,0.12);
    --line-strong:rgba(232,185,72,0.28);
    --line-cool:rgba(148,163,184,0.10);
    --gold:#E8B948;
    --gold-bright:#F5D678;
    --gold-deep:#8B6914;
    --gold-glow:rgba(232,185,72,0.35);
    --text:#F5F7FB;
    --text-dim:#A7B0C3;
    --text-mute:#5C6580;
    --green:#22D3AA;
    --red:#F87171;
    --amber:#F59E0B;
  }

  .lv.light{
    --bg:#F8F4EA;
    --bg-elev:#FFFDF7;
    --surface:#FFFFFF;
    --surface-2:#FBF5E3;
    --line:rgba(139,105,20,0.15);
    --line-strong:rgba(139,105,20,0.28);
    --line-cool:rgba(11,15,28,0.08);
    --gold:#A47B10;
    --gold-bright:#D4A017;
    --gold-deep:#6B4E0C;
    --gold-glow:rgba(164,123,16,0.22);
    --text:#1A1408;
    --text-dim:#5B5240;
    --text-mute:#8A8166;
  }

  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--bg)}

  /* Number cells — simple, classy, tabular-aligned */
  .lv-num{ font-variant-numeric:tabular-nums; font-feature-settings:"tnum"; letter-spacing:-0.005em }
  .lv-meta{
    font-family:'DM Sans',sans-serif; font-weight:500;
    text-transform:uppercase; letter-spacing:0.11em;
  }

  .lv{
    min-height:100vh;
    background:var(--bg);
    color:var(--text);
    font-family:'DM Sans',sans-serif;
    position:relative;
    overflow-x:hidden;
  }

  /* ─── Atmospheric layers ───────────────────────────── */
  .lv-aurora{
    position:fixed; inset:0; pointer-events:none; z-index:0;
    background:
      radial-gradient(900px 600px at 15% -10%, rgba(232,185,72,0.10), transparent 60%),
      radial-gradient(700px 500px at 95% 10%, rgba(139,105,20,0.08), transparent 60%),
      radial-gradient(800px 700px at 50% 110%, rgba(232,185,72,0.06), transparent 60%);
  }
  .lv.light .lv-aurora{
    background:
      radial-gradient(900px 600px at 15% -10%, rgba(164,123,16,0.12), transparent 60%),
      radial-gradient(700px 500px at 95% 10%, rgba(212,160,23,0.10), transparent 60%);
  }
  .lv-grain{
    position:fixed; inset:0; pointer-events:none; z-index:1; opacity:0.35;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.7'/></svg>");
    mix-blend-mode:overlay;
  }

  /* ─── Shimmer ───────────────────────────────── */
  .lv-shimmer{
    background:linear-gradient(100deg,
      var(--gold) 0%, var(--gold) 38%,
      var(--gold-bright) 48%, #FFF4C7 50%,
      var(--gold-bright) 52%, var(--gold) 62%,
      var(--gold) 100%);
    background-size:250% 100%;
    -webkit-background-clip:text; background-clip:text;
    -webkit-text-fill-color:transparent; color:transparent;
    animation:lvShimmer 5.5s linear infinite;
  }
  @keyframes lvShimmer{
    0%{background-position:200% 0}
    100%{background-position:-50% 0}
  }

  /* ─── Keyframes ───────────────────────────── */
  @keyframes lvRise{
    from{opacity:0; transform:translateY(16px)}
    to{opacity:1; transform:translateY(0)}
  }
  @keyframes lvRiseSmall{
    from{opacity:0; transform:translateY(6px)}
    to{opacity:1; transform:translateY(0)}
  }
  @keyframes lvFade{ from{opacity:0} to{opacity:1} }
  @keyframes lvPulse{
    0%,100%{opacity:1; transform:scale(1)}
    50%{opacity:0.4; transform:scale(0.85)}
  }
  @keyframes lvRingDraw{
    from{stroke-dashoffset:var(--lv-ring-full)}
    to{stroke-dashoffset:var(--lv-ring-offset)}
  }
  @keyframes lvBarFill{ from{width:0 !important} }
  @keyframes lvSpin{ to{transform:rotate(360deg)} }
  @keyframes lvSheen{
    0%{transform:translateX(-120%) skewX(-20deg)}
    100%{transform:translateX(220%) skewX(-20deg)}
  }

  /* ─── Header ───────────────────────────────── */
  .lv-header{
    position:sticky; top:0; z-index:50;
    backdrop-filter:blur(18px) saturate(140%);
    -webkit-backdrop-filter:blur(18px) saturate(140%);
    background:linear-gradient(to bottom, rgba(5,7,15,0.90), rgba(5,7,15,0.70));
    border-bottom:1px solid var(--line);
  }
  .lv.light .lv-header{
    background:linear-gradient(to bottom, rgba(248,244,234,0.92), rgba(248,244,234,0.70));
  }
  .lv-header-inner{
    max-width:1240px; margin:0 auto;
    padding:11px 22px;
    display:flex; align-items:center; justify-content:space-between;
    gap:14px;
  }
  .lv-user{ display:flex; align-items:center; gap:11px; min-width:0 }
  .lv-avatar{
    width:36px; height:36px; border-radius:11px; flex-shrink:0;
    background:linear-gradient(135deg, var(--gold-bright), var(--gold) 55%, var(--gold-deep));
    display:flex; align-items:center; justify-content:center;
    color:#1A1408; font-family:'Fraunces',serif; font-weight:700; font-size:16px;
    box-shadow:0 4px 14px rgba(232,185,72,0.28), inset 0 1px 0 rgba(255,255,255,0.35);
    position:relative; overflow:hidden;
  }
  .lv-avatar::after{
    content:""; position:absolute; inset:0;
    background:linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%);
    animation:lvSheen 6s ease-in-out infinite;
  }
  .lv-user-meta{ min-width:0 }
  .lv-user-name{
    font-family:'Fraunces',serif; font-weight:600; font-size:15px;
    letter-spacing:-0.01em; color:var(--text);
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }
  .lv-user-id{
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:10px;
    color:var(--text-mute); letter-spacing:0.08em; margin-top:1px;
    text-transform:uppercase;
    font-variant-numeric:tabular-nums;
  }

  .lv-header-right{ display:flex; align-items:center; gap:8px; flex-shrink:0; position:relative }

  .lv-ticker{
    display:none; align-items:center; gap:10px;
    padding:6px 11px; border-radius:10px;
    background:linear-gradient(135deg, rgba(232,185,72,0.10), rgba(139,105,20,0.04));
    border:1px solid var(--line-strong);
  }
  @media(min-width:720px){ .lv-ticker{ display:flex } }
  .lv-ticker-label{
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:9px;
    color:var(--text-dim); letter-spacing:0.14em; text-transform:uppercase;
    display:flex; align-items:center; gap:6px;
  }
  .lv-live-dot{
    width:5px; height:5px; border-radius:50%;
    background:var(--gold); box-shadow:0 0 8px var(--gold);
    animation:lvPulse 1.8s ease-in-out infinite;
  }
  .lv-ticker-price{
    font-family:'Fraunces',serif; font-weight:600; font-size:14px;
    color:var(--gold-bright); letter-spacing:-0.01em;
    font-variant-numeric:tabular-nums;
  }

  .lv-iconbtn{
    width:34px; height:34px; border-radius:10px;
    background:rgba(232,185,72,0.06); border:1px solid var(--line);
    color:var(--text); font-size:14px; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    transition:all 0.2s;
  }
  .lv-iconbtn:hover{ background:rgba(232,185,72,0.14); border-color:var(--line-strong) }
  
  .lv-input {
    width: 100%;
    background: var(--bg-elev);
    border: 1.5px solid var(--line);
    border-radius: 12px;
    padding: 12px 16px;
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    transition: all 0.2s ease;
    outline: none;
  }
  .lv-input:hover { border-color: var(--line-strong); background: var(--surface); }
  .lv-input:focus { border-color: var(--gold); background: var(--surface); box-shadow: 0 0 0 4px var(--gold-glow); }
  .lv-input::placeholder { color: var(--text-mute); }
  
  /* Date input specific fixes */
  .lv-input[type="date"] {
    position: relative;
    color-scheme: dark;
    -webkit-appearance: none;
    min-height: 48px;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23E8B948' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='4' width='18' height='18' rx='2' ry='2'/><line x1='16' y1='2' x2='16' y2='6'/><line x1='8' y1='2' x2='8' y2='6'/><line x1='3' y1='10' x2='21' y2='10'/></svg>");
    background-repeat: no-repeat;
    background-position: right 14px center;
    background-size: 18px;
  }
  .lv.light .lv-input[type="date"] { 
    color-scheme: light; 
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23A47B10' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='4' width='18' height='18' rx='2' ry='2'/><line x1='16' y1='2' x2='16' y2='6'/><line x1='8' y1='2' x2='8' y2='6'/><line x1='3' y1='10' x2='21' y2='10'/></svg>");
  }
  .lv-input::-webkit-calendar-picker-indicator {
    position: absolute;
    right: 0;
    top: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    opacity: 0;
    cursor: pointer;
  }
  
  .lv-form-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  @media(max-width:520px){
    .lv-form-grid-2 { grid-template-columns: 1fr; }
  }

  
  /* Table wrappers for responsiveness */
  .lv-table-wrap {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin-bottom: 20px;
    border-radius: 12px;
    border: 1px solid var(--line-cool);
    background: var(--surface);
  }
  .lv-table-wrap::-webkit-scrollbar { height: 4px; }
  .lv-table-wrap::-webkit-scrollbar-thumb { background: var(--line-strong); border-radius: 10px; }


  .lv-menu-overlay{ position:fixed; inset:0; background:rgba(0,0,0,0.55); z-index:40 }
  .lv-menu{
    position:absolute; top:calc(100% + 12px); right:0; z-index:70;
    min-width:200px; padding:6px 0; border-radius:12px;
    background:var(--surface); border:1px solid var(--line-strong);
    box-shadow:0 16px 40px rgba(0,0,0,0.5);
    animation:lvRiseSmall 0.2s ease both;
  }
  .lv-menu-rate{
    padding:11px 16px 10px;
    border-bottom:1px solid var(--line);
  }
  .lv-menu-rate-label{
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:9px;
    color:var(--text-mute); letter-spacing:0.14em; text-transform:uppercase;
    margin-bottom:3px;
  }
  .lv-menu-rate-val{
    font-family:'Fraunces',serif; font-weight:600; font-size:17px;
    color:var(--gold-bright); font-variant-numeric:tabular-nums;
    letter-spacing:-0.01em;
  }
  .lv-menu-item{
    display:flex; align-items:center; gap:11px; width:100%;
    padding:9px 16px; background:none; border:none; cursor:pointer;
    font-family:'DM Sans',sans-serif; font-size:12.5px; font-weight:500;
    color:var(--text-dim); text-align:left; transition:all 0.15s;
  }
  .lv-menu-item:hover{ background:rgba(232,185,72,0.08); color:var(--text) }

  /* ─── Main ─────────────────────────────────── */
  .lv-main{
    position:relative; z-index:2;
    max-width:1240px; margin:0 auto;
    padding:22px 22px 48px;
    min-width:0;
  }
  @media(max-width:640px){ .lv-main{ padding:18px 14px 48px; } }

  /* ─── Error banner ─────────────────────────── */
  .lv-error{
    display:flex; align-items:flex-start; gap:12px;
    padding:12px 16px; margin-bottom:18px;
    border-radius:12px;
    background:linear-gradient(135deg, rgba(248,113,113,0.10), rgba(248,113,113,0.04));
    border:1px solid rgba(248,113,113,0.28);
    animation:lvRiseSmall 0.35s ease both;
  }
  .lv-error-icon{ font-size:17px; color:var(--red); flex-shrink:0 }
  .lv-error-body{ flex:1; min-width:0 }
  .lv-error-title{ font-weight:700; font-size:13px; color:var(--red); margin-bottom:2px }
  .lv-error-msg{ font-size:12px; color:var(--text-dim) }
  .lv-error-btn{
    padding:7px 14px; border-radius:9px; border:none; cursor:pointer;
    background:var(--red); color:#fff; font-weight:600; font-size:11.5px;
    font-family:'DM Sans',sans-serif; flex-shrink:0;
    transition:transform 0.15s;
  }
  .lv-error-btn:hover{ transform:translateY(-1px) }
  .lv-error-btn:active{ transform:scale(0.97) }

  /* ─── Welcome ─────────────────────────────── */
  .lv-welcome{ margin-bottom:20px; animation:lvRise 0.6s 0.05s ease both }
  .lv-eyebrow{
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:10px;
    color:var(--text-mute); letter-spacing:0.22em; text-transform:uppercase;
    margin-bottom:8px;
    display:flex; align-items:center; gap:10px;
  }
  .lv-eyebrow::before{
    content:""; width:24px; height:1px; background:var(--gold);
  }
  .lv-greeting{
    font-family:'Fraunces',serif; font-weight:500;
    font-size:clamp(26px, 4.5vw, 38px); line-height:1.05;
    letter-spacing:-0.025em; color:var(--text);
  }
  .lv-greeting .lv-name{
    font-style:italic; font-weight:600;
    background:linear-gradient(105deg, var(--gold-bright), var(--gold) 50%, var(--gold-deep));
    -webkit-background-clip:text; background-clip:text;
    -webkit-text-fill-color:transparent;
  }
  .lv-date{
    font-family:'DM Sans',sans-serif; font-size:12.5px;
    color:var(--text-dim); margin-top:8px;
  }

  /* ─── Hero: gold rate ─────────────────────── */
  .lv-hero{
    position:relative; overflow:hidden;
    border-radius:18px; padding:20px 22px; margin-bottom:18px;
    background:
      radial-gradient(600px 300px at 85% -20%, rgba(232,185,72,0.18), transparent 70%),
      linear-gradient(135deg, #0D1327 0%, #151B35 100%);
    border:1px solid var(--line-strong);
    box-shadow:0 14px 40px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.04);
    animation:lvRise 0.7s 0.1s ease both;
    display:flex; flex-direction:column; gap:16px;
  }
  .lv.light .lv-hero{
    background:
      radial-gradient(600px 300px at 85% -20%, rgba(212,160,23,0.22), transparent 70%),
      linear-gradient(135deg, #FFF8E6 0%, #FDF3D4 100%);
    box-shadow:0 14px 36px rgba(139,105,20,0.15), inset 0 1px 0 rgba(255,255,255,0.6);
  }
  .lv-hero::before{
    content:""; position:absolute; top:-50%; right:-20%;
    width:320px; height:320px; border-radius:50%;
    background:radial-gradient(closest-side, var(--gold-glow), transparent 70%);
    pointer-events:none; filter:blur(30px);
  }
  .lv-hero-top{
    display:flex; flex-wrap:wrap; gap:16px;
    justify-content:space-between; align-items:flex-end;
    position:relative; z-index:2;
  }
  .lv-hero-label{
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:10px;
    color:var(--text-dim); letter-spacing:0.18em; text-transform:uppercase;
    display:flex; align-items:center; gap:9px;
    margin-bottom:10px;
  }
  .lv.light .lv-hero-label{ color:#8B6914 }
  .lv-hero-price{
    font-family:'Fraunces',serif; font-weight:500;
    font-size:clamp(34px, 6vw, 52px); line-height:1;
    letter-spacing:-0.035em;
    display:flex; align-items:baseline; gap:1px;
    font-variant-numeric:tabular-nums;
  }
  .lv-hero-rupee{ font-weight:400; opacity:0.9 }
  .lv-hero-unit{
    font-family:'DM Sans',sans-serif; font-size:11.5px; font-weight:500;
    color:var(--text-dim); letter-spacing:0.1em; text-transform:uppercase;
    margin-left:11px; margin-bottom:7px;
  }
  .lv.light .lv-hero-unit{ color:#8B6914 }
  .lv-hero-empty{
    font-family:'Fraunces',serif; font-style:italic; font-weight:400;
    font-size:clamp(20px, 3.6vw, 26px); color:var(--text-mute);
  }
  .lv-hero-updated{
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:10px;
    color:var(--text-mute); letter-spacing:0.08em; margin-top:8px;
    text-transform:uppercase;
  }
  .lv-hero-qtys{
    display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;
    position:relative; z-index:2;
    padding-top:14px;
    border-top:1px solid var(--line);
  }
  .lv-qty{
    padding:10px 13px; border-radius:11px;
    background:rgba(232,185,72,0.04);
    border:1px solid var(--line);
    transition:all 0.3s cubic-bezier(0.22,1,0.36,1);
  }
  .lv.light .lv-qty{ background:rgba(255,255,255,0.6) }
  .lv-qty:hover{
    background:rgba(232,185,72,0.10);
    border-color:var(--line-strong);
    transform:translateY(-2px);
  }
  .lv-qty-label{
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:9.5px;
    color:var(--text-mute); letter-spacing:0.14em; margin-bottom:4px;
    text-transform:uppercase;
  }
  .lv-qty-val{
    font-family:'Fraunces',serif; font-weight:600; font-size:15px;
    color:var(--gold-bright); letter-spacing:-0.01em;
    font-variant-numeric:tabular-nums;
  }
  .lv.light .lv-qty-val{ color:#8B6914 }

  /* ─── Stats ───────────────────────────────── */
  .lv-stats{
    display:grid; gap:10px; margin-bottom:22px;
    grid-template-columns:repeat(1, 1fr);
  }
  @media(min-width:560px){ .lv-stats{ grid-template-columns:repeat(2, 1fr) } }
  @media(min-width:960px){ .lv-stats{ grid-template-columns:repeat(4, 1fr) } }
  .lv-stat{
    position:relative; overflow:hidden;
    padding:14px 16px; border-radius:14px;
    background:var(--surface);
    border:1px solid var(--line-cool);
    opacity:0; animation:lvRise 0.55s ease both;
    transition:all 0.35s cubic-bezier(0.22,1,0.36,1);
  }
  .lv-stat:hover{
    transform:translateY(-3px);
    border-color:var(--line-strong);
    box-shadow:0 14px 28px rgba(0,0,0,0.28);
  }
  .lv.light .lv-stat:hover{ box-shadow:0 14px 28px rgba(139,105,20,0.10) }
  .lv-stat::before{
    content:""; position:absolute; top:0; left:0; right:0; height:1px;
    background:linear-gradient(90deg, transparent, var(--gold), transparent);
    opacity:0; transition:opacity 0.3s;
  }
  .lv-stat:hover::before{ opacity:1 }
  .lv-stat-head{
    display:flex; justify-content:space-between; align-items:flex-start;
    margin-bottom:10px;
  }
  .lv-stat-label{
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:9.5px;
    color:var(--text-mute); letter-spacing:0.16em; text-transform:uppercase;
  }
  .lv-stat-icon{
    width:28px; height:28px; border-radius:8px;
    display:flex; align-items:center; justify-content:center;
    font-size:13px; flex-shrink:0;
  }
  .lv-stat-value{
    font-family:'Fraunces',serif; font-weight:600;
    font-size:22px; line-height:1.3; letter-spacing:-0.02em;
    margin-bottom:4px;
    font-variant-numeric:tabular-nums;
    padding-top: 2px;
  }
  .lv-stat-sub{
    font-size:11px; color:var(--text-mute);
    letter-spacing:0.02em;
  }

  /* ─── Tabs ─────────────────────────────── */
  .lv-tabs{
    display:flex; gap:3px; padding:4px;
    border-radius:12px;
    background:var(--surface); border:1px solid var(--line-cool);
    margin-bottom:16px; width:fit-content;
    animation:lvRiseSmall 0.5s 0.3s ease both; opacity:0;
    overflow-x:auto; max-width:100%;
    scrollbar-width:none;
  }
  .lv-tabs::-webkit-scrollbar{ display:none }
  .lv-tab{
    padding:8px 16px; border:none; cursor:pointer;
    font-family:'DM Sans',sans-serif; font-size:12.5px; font-weight:600;
    color:var(--text-mute); background:transparent;
    border-radius:9px; transition:all 0.25s;
    white-space:nowrap;
  }
  .lv-tab:hover{ color:var(--text) }
  .lv-tab.active{
    background:linear-gradient(135deg, var(--gold), var(--gold-deep));
    color:#1A1408;
    box-shadow:0 4px 14px rgba(232,185,72,0.25);
  }
  .lv.light .lv-tab.active{
    background:linear-gradient(135deg, var(--gold-bright), var(--gold));
    color:#1A1408;
  }

  /* ─── Scheme cards ──────────────────────── */
  .lv-schemes{ display:flex; flex-direction:column; gap:12px }
  .lv-scheme{
    position:relative; overflow:hidden;
    padding:18px 20px; border-radius:16px;
    background:var(--surface);
    border:1px solid var(--line-cool);
    opacity:0; animation:lvRise 0.6s ease both;
    transition:all 0.4s cubic-bezier(0.22,1,0.36,1);
  }
  .lv-scheme:hover{
    border-color:var(--line-strong);
    transform:translateY(-2px);
    box-shadow:0 18px 36px rgba(0,0,0,0.32);
  }
  .lv.light .lv-scheme:hover{ box-shadow:0 18px 36px rgba(139,105,20,0.10) }
  .lv-scheme::before{
    content:""; position:absolute; left:0; top:0; bottom:0; width:3px;
    background:linear-gradient(180deg, var(--gold-bright), var(--gold), var(--gold-deep));
    opacity:0.75;
  }
  .lv-scheme-head{
    display:flex; flex-wrap:wrap; gap:16px;
    justify-content:space-between; align-items:flex-start;
    margin-bottom:14px;
  }
  .lv-scheme-headL{ flex:1; min-width:0 }
  .lv-scheme-tags{ display:flex; align-items:center; gap:7px; margin-bottom:8px; flex-wrap:wrap }
  .lv-scheme-id{
    font-family:'DM Sans',sans-serif; font-weight:600; font-size:10px;
    padding:3px 9px; border-radius:20px;
    background:rgba(232,185,72,0.12); color:var(--gold-bright);
    letter-spacing:0.1em; text-transform:uppercase;
  }
  .lv.light .lv-scheme-id{ color:var(--gold-deep); background:rgba(164,123,16,0.14) }
  .lv-scheme-label{
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:9.5px;
    color:var(--text-mute); letter-spacing:0.16em; margin-bottom:3px;
    text-transform:uppercase;
  }
  .lv-scheme-monthly{
    font-family:'Fraunces',serif; font-weight:600;
    font-size:22px; line-height:1.2; letter-spacing:-0.02em;
    color:var(--text); font-variant-numeric:tabular-nums;
    padding-top: 2px;
  }
  .lv-scheme-gold{
    font-family:'Fraunces',serif; font-weight:600; font-size:16px;
    letter-spacing:-0.01em; margin-top:4px;
    line-height: 1.4;
    font-variant-numeric:tabular-nums;
    padding-top: 4px;
  }
  .lv-scheme-gold-em{
    font-family:'DM Sans',sans-serif; font-size:11px;
    color:var(--text-mute); margin-top:1px;
    font-variant-numeric:tabular-nums;
  }

  /* Circular progress ring */
  .lv-ring-wrap{
    position:relative; width:96px; height:96px; flex-shrink:0;
  }
  .lv-ring{ transform:rotate(-90deg) }
  .lv-ring-bg{ stroke:var(--line-cool); fill:none }
  .lv-ring-fg{
    fill:none; stroke:url(#goldGrad);
    stroke-linecap:round;
    animation:lvRingDraw 1.4s cubic-bezier(0.22,1,0.36,1) 0.3s both;
  }
  .lv-ring-center{
    position:absolute; inset:0;
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    text-align:center;
  }
  .lv-ring-pct{
    font-family:'Fraunces',serif; font-weight:600;
    font-size:19px; line-height:1.2; letter-spacing:-0.02em;
    color:var(--gold-bright); font-variant-numeric:tabular-nums;
    padding-top: 1px;
  }
  .lv.light .lv-ring-pct{ color:var(--gold-deep) }
  .lv-ring-sub{
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:9px;
    color:var(--text-mute); letter-spacing:0.12em; margin-top:2px;
    text-transform:uppercase;
  }

  .lv-scheme-actions{
    display:flex; gap:9px; margin-top:6px;
  }
  .lv-btn-ghost{
    padding:7px 13px; border-radius:9px;
    background:rgba(232,185,72,0.08); border:1px solid var(--line);
    color:var(--text); font-family:'DM Sans',sans-serif;
    font-weight:600; font-size:11.5px; cursor:pointer;
    display:inline-flex; align-items:center; gap:7px;
    transition:all 0.2s;
  }
  .lv-btn-ghost:hover{
    background:rgba(232,185,72,0.16); border-color:var(--line-strong);
    transform:translateY(-1px);
  }
  .lv-btn-ghost:active{ transform:scale(0.97) }

  .lv-scheme-bar{
    height:6px; border-radius:99px; overflow:hidden;
    background:var(--line-cool);
    margin:3px 0 12px;
  }
  .lv-scheme-bar-fill{
    height:100%; border-radius:99px;
    background:linear-gradient(90deg, var(--gold-deep), var(--gold) 50%, var(--gold-bright));
    box-shadow:0 0 12px rgba(232,185,72,0.45);
    animation:lvBarFill 1.3s cubic-bezier(0.22,1,0.36,1) 0.3s both;
    position:relative; overflow:hidden;
  }
  .lv-scheme-bar-fill::after{
    content:""; position:absolute; inset:0;
    background:linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
    animation:lvSheen 3.5s ease-in-out infinite;
  }
  .lv-scheme-barmeta{
    display:flex; justify-content:space-between;
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:10.5px;
    color:var(--text-mute); letter-spacing:0.05em; margin-bottom:12px;
    font-variant-numeric:tabular-nums;
  }
  .lv-scheme-stats{
    display:grid; gap:8px;
    grid-template-columns:repeat(1, 1fr);
  }
  @media(min-width:560px){ .lv-scheme-stats{ grid-template-columns:repeat(3, 1fr) } }
  .lv-scheme-mini{
    padding:9px 12px; border-radius:10px;
    background:var(--surface-2); border:1px solid var(--line-cool);
  }
  .lv-scheme-mini-label{
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:9px;
    color:var(--text-mute); letter-spacing:0.16em; margin-bottom:3px;
    text-transform:uppercase;
  }
  .lv-scheme-mini-val{
    font-family:'DM Sans',sans-serif; font-weight:600; font-size:12.5px;
    color:var(--text); font-variant-numeric:tabular-nums;
  }

  /* ─── Empty state ────────────────────────── */
  .lv-empty{
    text-align:center; padding:42px 22px; border-radius:16px;
    background:var(--surface); border:1px dashed var(--line-strong);
  }
  .lv-empty-icon{
    font-size:36px; color:var(--gold); margin-bottom:10px; opacity:0.85;
    font-family:'Fraunces',serif;
  }
  .lv-empty-title{
    font-family:'Fraunces',serif; font-weight:600; font-size:18px;
    color:var(--text); margin-bottom:4px; letter-spacing:-0.01em;
  }
  .lv-empty-sub{ color:var(--text-dim); font-size:12.5px; margin-bottom:16px }
  .lv-btn-gold{
    padding:10px 22px; border:none; border-radius:10px; cursor:pointer;
    background:linear-gradient(135deg, var(--gold-bright), var(--gold), var(--gold-deep));
    color:#1A1408; font-family:'DM Sans',sans-serif;
    font-weight:700; font-size:12.5px;
    box-shadow:0 6px 18px rgba(232,185,72,0.32);
    transition:all 0.2s;
    position:relative; overflow:hidden;
  }
  .lv-btn-gold::after{
    content:""; position:absolute; top:0; left:0; bottom:0; width:30%;
    background:linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
    animation:lvSheen 3s ease-in-out infinite;
  }
  .lv-btn-gold:hover{ transform:translateY(-2px); box-shadow:0 10px 22px rgba(232,185,72,0.4) }
  .lv-btn-gold:active{ transform:scale(0.97) }
  .lv-btn-gold:disabled{ opacity:0.6; cursor:not-allowed; transform:none }

  /* ─── Browse grid ─────────────────────── */
  .lv-browse-head{
    margin-bottom:14px; animation:lvRiseSmall 0.5s ease both;
  }
  .lv-browse-title{
    font-family:'Fraunces',serif; font-weight:600; font-size:18px;
    color:var(--text); letter-spacing:-0.02em; margin-bottom:3px;
  }
  .lv-browse-sub{ font-size:12.5px; color:var(--text-dim) }

  .lv-browse-grid{
    display:grid; gap:12px;
    grid-template-columns:repeat(auto-fill, minmax(270px, 1fr));
  }
  .lv-plan{
    position:relative; overflow:hidden;
    padding:16px 18px; border-radius:14px;
    background:var(--surface);
    border:1px solid var(--line-cool);
    transition:all 0.35s cubic-bezier(0.22,1,0.36,1);
    opacity:0; animation:lvRise 0.55s ease both;
  }
  .lv-plan:hover{
    transform:translateY(-3px);
    border-color:var(--line-strong);
    box-shadow:0 16px 32px rgba(0,0,0,0.26);
  }
  .lv-plan.approved{ border-color:rgba(34,211,170,0.45) }
  .lv-plan.pending{ border-color:var(--line-strong) }
  .lv-plan.rejected{ border-color:rgba(248,113,113,0.45) }
  .lv-plan-id{
    position:absolute; top:0; right:0;
    font-family:'DM Sans',sans-serif; font-weight:600; font-size:9.5px;
    padding:4px 11px; border-bottom-left-radius:10px;
    background:rgba(232,185,72,0.14); color:var(--gold-bright);
    letter-spacing:0.12em; text-transform:uppercase;
  }
  .lv.light .lv-plan-id{ color:var(--gold-deep) }
  .lv-plan-title{
    font-family:'Fraunces',serif; font-weight:600; font-size:16px;
    color:var(--text); letter-spacing:-0.01em;
    margin:6px 56px 2px 0; line-height:1.25;
  }
  .lv-plan-date{
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:10px;
    color:var(--text-mute); letter-spacing:0.08em; margin-bottom:12px;
    text-transform:uppercase;
  }
  .lv-plan-duo{
    display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px;
  }
  .lv-plan-cell{
    padding:9px 11px; border-radius:10px;
    background:var(--surface-2); border:1px solid var(--line-cool);
  }
  .lv-plan-cell-label{
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:9px;
    color:var(--text-mute); letter-spacing:0.16em; margin-bottom:3px;
    text-transform:uppercase;
  }
  .lv-plan-cell-val{
    font-family:'Fraunces',serif; font-weight:600; font-size:15px;
    letter-spacing:-0.01em; font-variant-numeric:tabular-nums;
  }
  .lv-plan-highlight{
    padding:10px 12px; border-radius:12px; margin-bottom:10px;
    background:linear-gradient(135deg, rgba(232,185,72,0.10), rgba(139,105,20,0.04));
    border:1px solid var(--line);
    display:grid; grid-template-columns:1fr auto 1fr auto 1fr; align-items:center; gap:6px;
  }
  .lv-plan-h-col{ min-width:0 }
  .lv-plan-h-label{
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:8px;
    color:var(--text-mute); letter-spacing:0.16em; margin-bottom:2px;
    text-transform:uppercase;
  }
  .lv-plan-h-val{
    font-family:'Fraunces',serif; font-weight:600; font-size:12px;
    color:var(--gold-bright); letter-spacing:-0.01em;
    font-variant-numeric:tabular-nums;
  }
  .lv.light .lv-plan-h-val{ color:var(--gold-deep) }
  .lv-plan-h-plus{
    font-family:'Fraunces',serif; font-size:15px;
    color:var(--text-mute);
  }
  .lv-plan-state{
    padding:9px 12px; border-radius:9px; text-align:center;
    font-size:12px; font-weight:600;
  }
  .lv-plan-state.approved{
    background:rgba(34,211,170,0.12); color:var(--green);
    border:1px solid rgba(34,211,170,0.3);
  }
  .lv-plan-state.pending{
    background:rgba(245,158,11,0.12); color:var(--amber);
    border:1px solid rgba(245,158,11,0.3);
  }
  .lv-plan-state.rejected{
    background:rgba(248,113,113,0.12); color:var(--red);
    border:1px solid rgba(248,113,113,0.3);
  }
  .lv-plan-join{
    width:100%; padding:10px; border:none; border-radius:10px; cursor:pointer;
    background:linear-gradient(135deg, var(--gold-bright), var(--gold) 55%, var(--gold-deep));
    color:#1A1408; font-family:'DM Sans',sans-serif;
    font-weight:700; font-size:12.5px;
    box-shadow:0 6px 18px rgba(232,185,72,0.28);
    transition:all 0.2s;
    position:relative; overflow:hidden;
  }
  .lv-plan-join::after{
    content:""; position:absolute; top:0; left:0; bottom:0; width:30%;
    background:linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
    animation:lvSheen 3s ease-in-out infinite;
  }
  .lv-plan-join:hover{ transform:translateY(-2px); box-shadow:0 10px 22px rgba(232,185,72,0.38) }
  .lv-plan-join:active{ transform:scale(0.98) }
  .lv-plan-join:disabled{ opacity:0.6; cursor:not-allowed; transform:none }
  .lv-plan-msg{
    margin-top:8px; font-size:11.5px; font-weight:600; text-align:center;
  }
  .lv-plan-msg.ok{ color:var(--green) }
  .lv-plan-msg.err{ color:var(--red) }

  /* ─── Payment history ─────────────────── */
  .lv-payments{
    padding:18px 20px; border-radius:16px;
    background:var(--surface); border:1px solid var(--line-cool);
    animation:lvRiseSmall 0.5s ease both;
  }
  .lv-payments-title{
    font-family:'Fraunces',serif; font-weight:600; font-size:17px;
    color:var(--text); letter-spacing:-0.01em; margin-bottom:14px;
  }
  .lv-tbl-wrap{ overflow-x:auto; -webkit-overflow-scrolling:touch }
  .lv-tbl{ width:100%; border-collapse:collapse; min-width:620px }
  .lv-tbl th{
    padding:8px 12px; text-align:left;
    font-family:'DM Sans',sans-serif; font-size:9.5px; font-weight:600;
    color:var(--text-mute); letter-spacing:0.16em;
    border-bottom:1px solid var(--line-cool);
    white-space:nowrap; text-transform:uppercase;
  }
  .lv-tbl td{
    padding:11px 12px; font-size:12.5px; color:var(--text-dim);
    border-bottom:1px solid var(--line-cool);
    vertical-align:middle;
    font-variant-numeric:tabular-nums;
  }

  /* ─── Scheme Square Cards ────────────────── */
  .lv-scheme-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    margin-top: 20px;
    animation: lvRise 0.6s ease both;
  }
  .lv-scheme-card {
    background: var(--surface);
    border: 1px solid var(--line-cool);
    border-radius: 20px;
    padding: 22px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
    position: relative;
  }
  .lv-scheme-card:hover {
    transform: translateY(-5px);
    border-color: var(--gold);
    box-shadow: 0 15px 30px rgba(0,0,0,0.25);
  }
  .lv-scheme-card.active {
    border-color: var(--gold);
    background: rgba(232,185,72,0.05);
    box-shadow: inset 0 0 0 2px var(--gold);
  }
  .lv-scheme-card-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }
  .lv-scheme-card-title {
    font-family: 'Fraunces', serif;
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 6px;
  }
  .lv-scheme-card-desc {
    font-size: 11px;
    color: var(--text-dim);
    line-height: 1.4;
  }

  /* ─── Custom Request Form ────────────────── */
  .lv-join-form {
    margin-top: 32px;
    padding: 38px;
    background: var(--surface);
    border-radius: 28px;
    border: 1px solid var(--line-strong);
    animation: lvRiseSmall 0.5s both;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    max-width: 600px;
  }
  .lv-form-head { margin-bottom: 28px }
  .lv-form-title {
    font-family: 'Fraunces', serif;
    font-size: 22px;
    color: var(--gold-bright);
    margin-bottom: 8px;
  }
  .lv-form-info {
    font-size: 13px;
    color: var(--text-dim);
    line-height: 1.6;
    padding: 12px 16px;
    background: rgba(232,185,72,0.06);
    border-radius: 12px;
    border-left: 3px solid var(--gold);
  }
  .lv-input-group { margin-top: 24px; margin-bottom: 24px; }
  .lv-input-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    color: var(--text-mute);
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
  }
  .lv-main-input-wrap { position: relative; display: flex; align-items: center; }
  .lv-input-prefix {
    position: absolute; left: 18px;
    font-size: 18px; font-weight: 600; color: var(--gold);
  }
  .lv-main-input {
    width: 100%;
    background: var(--bg-elev);
    border: 1.5px solid var(--line-cool);
    border-radius: 14px;
    padding: 16px 18px 16px 42px;
    color: var(--text);
    font-size: 18px;
    font-family: inherit;
    font-weight: 600;
    outline: none;
    transition: all 0.3s;
  }
  .lv-main-input:focus {
    border-color: var(--gold);
    box-shadow: 0 0 0 4px rgba(232,185,72,0.15);
  }
  .lv-form-actions { display: flex; gap: 12px; align-items: center; }
  .lv-btn-submit {
    flex: 1;
    padding: 16px; border: none; border-radius: 14px; cursor: pointer;
    background: linear-gradient(135deg, var(--gold-bright), var(--gold) 55%, var(--gold-deep));
    color: #1A1408; font-family: inherit; font-weight: 700; font-size: 14px;
    box-shadow: 0 10px 20px rgba(232,185,72,0.3);
    transition: all 0.2s;
  }
  .lv-btn-submit:hover { transform: translateY(-2px); box-shadow: 0 14px 28px rgba(232,185,72,0.45); }
  .lv-btn-submit:active { transform: scale(0.98); }
  .lv-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .lv-tbl tbody tr{ transition:background 0.2s }
  .lv-tbl tbody tr:hover{ background:rgba(232,185,72,0.04) }
  .lv-num{ font-variant-numeric:tabular-nums }
  .lv-gold-text{ color:var(--gold-bright); font-weight:600 }
  .lv.light .lv-gold-text{ color:var(--gold-deep) }

  /* ─── Badge ───────────────────────────── */
  .lv-badge{
    display:inline-flex; align-items:center; gap:5px;
    font-family:'DM Sans',sans-serif; font-weight:600; font-size:9.5px;
    padding:3px 9px; border-radius:20px;
    letter-spacing:0.12em; text-transform:uppercase;
  }
  .lv-badge::before{
    content:""; width:4px; height:4px; border-radius:50%;
    background:currentColor;
  }
  .lv-badge.active   { background:rgba(34,211,170,0.14);  color:var(--green) }
  .lv-badge.complete { background:rgba(59,130,246,0.14);  color:#60A5FA }
  .lv-badge.paid     { background:rgba(34,211,170,0.14);  color:var(--green) }
  .lv-badge.pending  { background:rgba(245,158,11,0.14);  color:var(--amber) }
  .lv-badge.overdue  { background:rgba(248,113,113,0.14); color:var(--red) }
  .lv-badge.approved { background:rgba(34,211,170,0.14);  color:var(--green) }
  .lv-badge.rejected { background:rgba(248,113,113,0.14); color:var(--red) }

  /* ─── Loading screen ──────────────────── */
  .lv-loader{
    min-height:100vh; display:flex; align-items:center; justify-content:center;
    background:var(--bg); position:relative; overflow:hidden;
  }
  .lv-loader-inner{ text-align:center; position:relative; z-index:2 }
  .lv-spinner{
    width:44px; height:44px; margin:0 auto 16px;
    border-radius:50%;
    border:2px solid rgba(232,185,72,0.15);
    border-top-color:var(--gold);
    animation:lvSpin 0.9s linear infinite;
  }
  .lv-loader-text{
    font-family:'Fraunces',serif; font-style:italic;
    font-size:14px; color:var(--text-dim);
  }

  /* ─── Modal ───────────────────────────── */
  .lv-modal-backdrop{
    position:fixed; inset:0; z-index:500;
    background:rgba(5,7,15,0.75);
    backdrop-filter:blur(8px);
    display:flex; align-items:center; justify-content:center;
    padding:18px 14px;
    animation:lvFade 0.25s ease both;
  }
  .lv-modal{
    width:100%; max-width:680px; max-height:85vh;
    border-radius:16px; overflow:hidden;
    background:var(--surface); border:1px solid var(--line-strong);
    box-shadow:0 30px 60px rgba(0,0,0,0.55);
    display:flex; flex-direction:column;
    animation:lvRise 0.4s cubic-bezier(0.22,1,0.36,1) both;
  }
  .lv-modal-head{
    padding:15px 20px;
    background:linear-gradient(135deg, #0D1327 0%, #151B35 100%);
    border-bottom:1px solid var(--line);
    display:flex; justify-content:space-between; align-items:flex-start; gap:14px;
  }
  .lv.light .lv-modal-head{
    background:linear-gradient(135deg, #FFF8E6 0%, #FDF3D4 100%);
  }
  .lv-modal-title{
    font-family:'Fraunces',serif; font-weight:600; font-size:16px;
    color:var(--text); letter-spacing:-0.01em;
  }
  .lv-modal-sub{
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:10.5px;
    color:var(--text-mute); letter-spacing:0.08em; margin-top:3px;
    text-transform:uppercase;
  }
  .lv-modal-close{
    width:28px; height:28px; border-radius:8px;
    background:rgba(232,185,72,0.08); border:1px solid var(--line);
    color:var(--text); font-size:14px; cursor:pointer;
    flex-shrink:0; transition:all 0.2s;
  }
  .lv-modal-close:hover{ background:rgba(232,185,72,0.16) }
  .lv-modal-body{
    flex:1; overflow-y:auto;
    padding:14px 18px;
  }
  .lv-modal-summary{
    margin-top:12px; padding:11px 14px;
    border-radius:12px;
    background:var(--surface-2); border:1px solid var(--line-cool);
    display:grid; grid-template-columns:1fr; gap:11px;
  }
  @media(min-width:520px){ .lv-modal-summary{ grid-template-columns:repeat(3, 1fr) } }
  .lv-sum-label{
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:9px;
    color:var(--text-mute); letter-spacing:0.16em; margin-bottom:3px;
    text-transform:uppercase;
  }
  .lv-sum-val{
    font-family:'Fraunces',serif; font-weight:600; font-size:15px;
    letter-spacing:-0.01em; font-variant-numeric:tabular-nums;
  }

  /* ─── Payment modal ─────────────────────── */
  .lv-pay-modal{
    width:95%; max-width:520px; max-height:92vh;
    border-radius:24px;
    background:var(--surface); border:1px solid var(--line-strong);
    box-shadow:0 40px 100px rgba(0,0,0,0.7);
    display:flex; flex-direction:column;
    animation:lvRise 0.4s cubic-bezier(0.22,1,0.36,1) both;
    position:relative;
  }
  @media(max-width:520px){
    .lv-pay-modal { width: 98%; border-radius: 20px; }
  }


  .lv-pay-head{
    position:relative; padding:20px 22px 18px;
    background:
      radial-gradient(400px 200px at 100% -20%, rgba(232,185,72,0.22), transparent 70%),
      linear-gradient(135deg, #0D1327 0%, #151B35 100%);
    border-bottom:1px solid var(--line);
  }
  .lv.light .lv-pay-head{
    background:
      radial-gradient(400px 200px at 100% -20%, rgba(212,160,23,0.25), transparent 70%),
      linear-gradient(135deg, #FFF8E6 0%, #FDF3D4 100%);
  }
  .lv-pay-head-row{
    display:flex; justify-content:space-between; align-items:flex-start; gap:12px;
  }
  .lv-pay-eyebrow{
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:9.5px;
    color:var(--text-mute); letter-spacing:0.18em; text-transform:uppercase;
    display:flex; align-items:center; gap:8px;
    margin-bottom:6px;
  }
  .lv-pay-title{
    font-family:'Fraunces',serif; font-weight:600; font-size:19px;
    color:var(--text); letter-spacing:-0.015em; line-height:1.2;
  }
  .lv-pay-amount{
    font-family:'Fraunces',serif; font-weight:600; font-size:26px;
    color:var(--gold-bright); letter-spacing:-0.02em;
    font-variant-numeric:tabular-nums; margin-top:8px;
  }
  .lv.light .lv-pay-amount{ color:var(--gold-deep) }
  .lv-pay-scheme-tag{
    display:inline-block; margin-top:5px;
    font-family:'DM Sans',sans-serif; font-weight:600; font-size:10px;
    padding:3px 9px; border-radius:20px;
    background:rgba(232,185,72,0.14); color:var(--gold-bright);
    letter-spacing:0.1em; text-transform:uppercase;
  }
  .lv.light .lv-pay-scheme-tag{ color:var(--gold-deep) }

  .lv-pay-body{
    flex:1; overflow-y:auto; overflow-x:visible;
    padding:24px 32px 60px; /* Added 60px bottom padding for pickers */
  }
  @media(max-width:520px){
    .lv-pay-body { padding: 20px 16px 80px; } /* Even more on mobile */
  }


  .lv-pay-step-label{
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:9.5px;
    color:var(--text-mute); letter-spacing:0.18em; text-transform:uppercase;
    margin-bottom:10px; text-align:center;
  }

  /* ─── QR Card — PhonePe-inspired dark card with gold accents ─── */
  .lv-qr-card{
    position:relative;
    width:260px; margin:0 auto;
    border-radius:22px; padding:16px 14px 14px;
    background:linear-gradient(165deg, #1A2038 0%, #0A0E1C 100%);
    box-shadow:
      0 20px 50px rgba(0,0,0,0.5),
      0 0 0 1px rgba(232,185,72,0.25),
      inset 0 1px 0 rgba(255,255,255,0.05);
    animation:lvRiseSmall 0.45s ease both;
  }
  /* Light mode: keep the card dark for authentic UPI feel, just soften the glow */
  .lv.light .lv-qr-card{
    box-shadow:
      0 20px 40px rgba(139,105,20,0.25),
      0 0 0 1px rgba(212,160,23,0.4),
      inset 0 1px 0 rgba(255,255,255,0.05);
  }
  /* Gold accent border glow */
  .lv-qr-card::before{
    content:""; position:absolute; inset:-1px;
    border-radius:22px; padding:1px;
    background:linear-gradient(135deg, var(--gold-bright), transparent 40%, transparent 60%, var(--gold-deep));
    -webkit-mask:linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite:xor; mask-composite:exclude;
    pointer-events:none; opacity:0.7;
  }

  /* Bank row at the top — "Axis Bank - 7317" */
  .lv-qr-bank{
    display:flex; align-items:center; gap:10px;
    padding:6px 6px 10px;
    margin-bottom:10px;
  }
  .lv-qr-bank-logo{
    width:32px; height:32px; border-radius:50%; flex-shrink:0;
    background:linear-gradient(135deg, var(--gold-bright), var(--gold) 55%, var(--gold-deep));
    display:flex; align-items:center; justify-content:center;
    color:#1A1408; font-family:'Fraunces',serif; font-weight:700; font-size:16px;
    box-shadow:0 2px 8px rgba(232,185,72,0.35);
    font-style:italic;
  }
  .lv-qr-bank-name{
    font-family:'DM Sans',sans-serif; font-weight:600; font-size:15px;
    color:#F5F7FB; letter-spacing:-0.005em;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }

  /* QR image container */
  .lv-qr-inner{
    position:relative;
    width:100%; aspect-ratio:1;
    border-radius:14px;
    background:#fff; padding:10px;
    overflow:hidden;
  }
  .lv-qr-inner img{
    display:block; width:100%; height:100%;
    object-fit:contain;
  }

  /* Center logo overlay — sits in the middle of the QR */
  .lv-qr-center{
    position:absolute; top:50%; left:50%;
    transform:translate(-50%, -50%);
    width:48px; height:48px; border-radius:50%;
    background:#0A0E1C;
    display:flex; align-items:center; justify-content:center;
    border:3px solid #fff;
    box-shadow:0 3px 10px rgba(0,0,0,0.4);
  }
  .lv-qr-center-inner{
    font-family:'Fraunces',serif; font-weight:700; font-size:22px;
    background:linear-gradient(135deg, var(--gold-bright), var(--gold-deep));
    -webkit-background-clip:text; background-clip:text;
    -webkit-text-fill-color:transparent;
    line-height:1;
  }

  /* Gold corner brackets on the dark card */
  .lv-qr-corner{
    position:absolute; width:22px; height:22px;
    border:2px solid var(--gold);
    z-index:3;
  }
  .lv-qr-corner.tl{ top:8px;    left:8px;    border-right:none; border-bottom:none; border-top-left-radius:6px }
  .lv-qr-corner.tr{ top:8px;    right:8px;   border-left:none;  border-bottom:none; border-top-right-radius:6px }
  .lv-qr-corner.bl{ bottom:8px; left:8px;    border-right:none; border-top:none;    border-bottom-left-radius:6px }
  .lv-qr-corner.br{ bottom:8px; right:8px;   border-left:none;  border-top:none;    border-bottom-right-radius:6px }

  /* Empty state — no QR uploaded yet */
  .lv-qr-empty{
    width:260px; margin:0 auto;
    border-radius:22px;
    background:linear-gradient(165deg, #1A2038 0%, #0A0E1C 100%);
    border:1.5px dashed rgba(232,185,72,0.3);
    padding:44px 22px;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    color:var(--text-mute); text-align:center;
  }
  .lv-qr-empty-icon{
    font-size:34px; margin-bottom:10px; opacity:0.55;
    font-family:'Fraunces',serif; color:var(--gold);
  }
  .lv-qr-empty-title{
    font-family:'Fraunces',serif; font-weight:600; font-size:14px;
    color:#E2E8F0; margin-bottom:4px;
  }
  .lv-qr-empty-sub{ font-size:11px; letter-spacing:0.02em; color:#94A3B8 }

  .lv-pay-shop{
    margin-top:22px; text-align:center;
    display:flex; flex-direction:column; align-items:center;
  }
  .lv-pay-shop-name{
    font-family:'Fraunces',serif; font-weight:600; font-size:18px;
    color:var(--text); letter-spacing:-0.01em; margin-bottom:3px;
  }
  .lv-pay-shop-owner{
    font-family:'DM Sans',sans-serif; font-size:12.5px;
    color:var(--text-dim); margin-bottom:14px;
  }
  .lv-pay-shop-owner .lv-pay-shop-owner-label{
    font-style:italic; color:var(--text-mute);
  }

  /* UPI payee name — shown between "Owner · X" and the phone pill.
     This is the name that UPI apps display when users scan the QR. */
  .lv-pay-payee{
    display:inline-flex; align-items:center; gap:9px;
    padding:9px 16px; margin-bottom:12px;
    border-radius:10px;
    background:rgba(232,185,72,0.06);
    border:1px solid var(--line);
    max-width:320px;
    width:fit-content;
  }
  .lv-pay-payee-icon{
    width:22px; height:22px; border-radius:6px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    background:linear-gradient(135deg, var(--gold-bright), var(--gold-deep));
    color:#1A1408; font-family:'Fraunces',serif; font-weight:700; font-size:11px;
    box-shadow:0 2px 6px rgba(232,185,72,0.3);
  }
  .lv-pay-payee-text{
    display:flex; flex-direction:column; align-items:flex-start; min-width:0;
  }
  .lv-pay-payee-label{
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:8.5px;
    color:var(--text-mute); letter-spacing:0.16em; text-transform:uppercase;
    margin-bottom:1px;
  }
  .lv-pay-payee-name{
    font-family:'Fraunces',serif; font-weight:600; font-size:14px;
    color:var(--text); letter-spacing:-0.005em;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    max-width:240px;
  }

  .lv-pay-phone{
    display:flex; align-items:stretch; gap:8px;
    padding:4px 4px 4px 16px; border-radius:12px;
    background:var(--surface-2); border:1px solid var(--line);
    max-width:300px; width:100%; margin:0 auto;
    transition:border-color 0.2s;
  }
  .lv-pay-phone:hover{ border-color:var(--line-strong) }
  .lv-pay-phone-val{
    flex:1; display:flex; align-items:center; gap:8px;
    font-family:'Fraunces',serif; font-weight:600; font-size:17px;
    color:var(--text); letter-spacing:-0.005em;
    font-variant-numeric:tabular-nums;
  }
  .lv-pay-phone-icon{
    font-size:14px; color:var(--gold); opacity:0.85;
  }
  .lv-pay-copy{
    padding:8px 14px; border:none; border-radius:9px;
    background:linear-gradient(135deg, var(--gold-bright), var(--gold) 55%, var(--gold-deep));
    color:#1A1408; font-family:'DM Sans',sans-serif;
    font-weight:700; font-size:11.5px;
    cursor:pointer; transition:all 0.2s;
    display:inline-flex; align-items:center; gap:6px;
    letter-spacing:0.04em;
    flex-shrink:0;
  }
  .lv-pay-copy:hover{ transform:translateY(-1px); box-shadow:0 6px 14px rgba(232,185,72,0.35) }
  .lv-pay-copy:active{ transform:scale(0.96) }
  .lv-pay-copy.copied{
    background:linear-gradient(135deg, #22D3AA, #10B981);
    color:#fff;
  }

  .lv-pay-bank-card{
    margin-top:14px; border-radius:14px;
    background:rgba(232,185,72,0.06); border:1px solid var(--line);
    overflow:hidden;
  }
  .lv-pay-bank-header{
    display:flex; align-items:center; gap:12px;
    padding:14px 16px 10px;
    border-bottom:1px solid var(--line);
  }
  .lv-pay-bank-icon{ font-size:22px; line-height:1; }
  .lv-pay-bank-name{
    font-family:'Fraunces',serif; font-weight:700; font-size:15px;
    color:var(--text);
  }
  .lv-pay-bank-branch{
    font-size:11px; color:var(--text-mute); margin-top:1px;
  }
  .lv-pay-bank-rows{ padding:12px 16px; display:flex; flex-direction:column; gap:10px; }
  .lv-pay-bank-row{
    display:flex; flex-direction:column; gap:2px;
  }
  .lv-pay-bank-label{
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:9.5px;
    color:var(--text-mute); letter-spacing:0.15em; text-transform:uppercase;
  }
  .lv-pay-bank-val{
    font-size:13px; color:var(--text); font-weight:500;
  }
  .lv-pay-bank-mono{
    font-family:'Courier New',monospace; letter-spacing:0.08em;
  }
  .lv-pay-bank-copy-row{
    display:flex; align-items:center; justify-content:space-between; gap:8px;
  }

  .lv-pay-note{
    margin-top:20px; padding:13px 15px;
    border-radius:12px;
    background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.2);
    display:flex; align-items:flex-start; gap:10px;
  }
  .lv-pay-note-icon{
    font-size:14px; color:#60A5FA; flex-shrink:0; line-height:1.5;
  }
  .lv-pay-note-body{
    font-size:12px; color:var(--text-dim); line-height:1.5;
  }
  .lv-pay-note-body b{ color:var(--text); font-weight:600 }

  /* ─── Step 2: Upload screenshot ─────────────────────────── */
  .lv-pay-divider{
    display:flex; align-items:center; gap:12px;
    margin:22px 0 16px;
  }
  .lv-pay-divider::before, .lv-pay-divider::after{
    content:""; flex:1; height:1px;
    background:linear-gradient(90deg, transparent, var(--line-strong), transparent);
  }
  .lv-pay-divider-text{
    font-family:'DM Sans',sans-serif; font-weight:500; font-size:9.5px;
    color:var(--text-mute); letter-spacing:0.18em; text-transform:uppercase;
    flex-shrink:0;
  }

  .lv-pay-upload{
    position:relative;
    border:1.5px dashed var(--line-strong);
    border-radius:14px;
    padding:22px 20px;
    text-align:center; cursor:pointer;
    transition:all 0.25s cubic-bezier(0.22,1,0.36,1);
    background:rgba(232,185,72,0.03);
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    width:100%; box-sizing:border-box;
  }
  .lv-pay-upload:hover{
    border-color:var(--gold);
    background:rgba(232,185,72,0.08);
    transform:translateY(-1px);
  }
  .lv-pay-upload.has-file{
    border-style:solid;
    border-color:rgba(34,211,170,0.45);
    background:rgba(34,211,170,0.06);
  }
  .lv-pay-upload input[type="file"]{
    position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%;
  }
  .lv-pay-upload-icon{
    width:44px; height:44px; margin:0 auto 10px;
    border-radius:12px;
    background:linear-gradient(135deg, var(--gold-bright), var(--gold) 55%, var(--gold-deep));
    display:flex; align-items:center; justify-content:center;
    color:#1A1408; font-size:20px; font-weight:700;
    box-shadow:0 4px 12px rgba(232,185,72,0.3);
    flex-shrink:0;
  }
  .lv-pay-upload.has-file .lv-pay-upload-icon{
    background:linear-gradient(135deg, #22D3AA, #10B981);
    color:#fff;
  }
  .lv-pay-upload-title{
    font-family:'Fraunces',serif; font-weight:600; font-size:14px;
    color:var(--text); letter-spacing:-0.005em; margin-bottom:3px; text-align:center;
  }
  .lv-pay-upload-sub{
    font-family:'DM Sans',sans-serif; font-size:11px;
    color:var(--text-mute); letter-spacing:0.02em; text-align:center;
  }
  .lv-pay-upload-filename{
    font-family:'DM Sans',sans-serif; font-weight:600; font-size:12px;
    color:var(--green); margin-top:4px; word-break:break-all; text-align:center;
  }

  .lv-pay-preview{
    margin-top:12px; padding:6px;
    border-radius:12px;
    background:var(--surface-2);
    border:1px solid var(--line-cool);
    position:relative;
  }
  .lv-pay-preview img{
    display:block; width:100%; max-height:220px;
    object-fit:contain; border-radius:8px;
    background:#000;
  }
  .lv-pay-preview-close{
    position:absolute; top:10px; right:10px;
    width:26px; height:26px; border-radius:50%;
    background:rgba(0,0,0,0.65); color:#fff;
    border:none; cursor:pointer; font-size:13px;
    display:flex; align-items:center; justify-content:center;
    backdrop-filter:blur(4px);
  }
  .lv-pay-preview-close:hover{ background:rgba(0,0,0,0.85) }

  .lv-pay-textarea{
    width:100%; margin-top:10px; padding:10px 12px;
    font-family:'DM Sans',sans-serif; font-size:12.5px;
    color:var(--text); background:var(--surface-2);
    border:1px solid var(--line-cool); border-radius:10px;
    resize:vertical; min-height:60px;
    transition:border-color 0.2s;
  }
  .lv-pay-textarea:focus{
    outline:none; border-color:var(--gold);
    background:var(--surface);
  }
  .lv-pay-textarea::placeholder{ color:var(--text-mute) }

  /* ─── Proof type tabs ───────────────────────────── */
  .lv-pay-proof-tabs{
    display:flex; gap:8px; margin-bottom:14px;
  }
  .lv-pay-proof-tab{
    flex:1; padding:9px 12px;
    border-radius:10px; border:1.5px solid var(--line-strong);
    background:transparent; cursor:pointer;
    font-family:'DM Sans',sans-serif; font-weight:600; font-size:11.5px;
    color:var(--text-mute); letter-spacing:0.03em;
    transition:all 0.2s;
    display:flex; align-items:center; justify-content:center; gap:6px;
  }
  .lv-pay-proof-tab.active{
    border-color:var(--gold);
    background:rgba(232,185,72,0.10);
    color:var(--gold-bright);
  }
  .lv.light .lv-pay-proof-tab.active{ color:var(--gold-deep) }
  .lv-pay-proof-tab:hover:not(.active){
    border-color:var(--line-strong);
    background:rgba(232,185,72,0.04);
    color:var(--text-dim);
  }
  /* ─── UTR input ───────────────────────────── */
  .lv-pay-utr-wrap{
    position:relative;
  }
  .lv-pay-utr-input{
    width:100%; padding:13px 46px 13px 14px;
    box-sizing:border-box;
    font-family:'DM Sans',sans-serif; font-weight:600; font-size:14px;
    color:var(--text);
    background:var(--surface-2);
    border:1.5px solid var(--line-strong);
    border-radius:12px;
    letter-spacing:0.04em;
    transition:border-color 0.2s, background 0.2s;
  }
  .lv-pay-utr-input:focus{
    outline:none;
    border-color:var(--gold);
    background:var(--surface);
  }
  .lv-pay-utr-input::placeholder{
    color:var(--text-mute); font-weight:400; font-size:13px; letter-spacing:0.01em;
  }
  .lv-pay-utr-input.valid{
    border-color:rgba(34,211,170,0.55);
    background:rgba(34,211,170,0.04);
  }
  .lv-pay-utr-icon{
    position:absolute; right:13px; top:50%; transform:translateY(-50%);
    font-size:16px; color:var(--gold); opacity:0.7; pointer-events:none;
  }
  .lv-pay-utr-hint{
    font-family:'DM Sans',sans-serif; font-size:11px;
    color:var(--text-mute); margin-top:6px; letter-spacing:0.02em;
  }

  .lv-pay-submit{
    width:100%; margin-top:12px;
    padding:13px; border:none; border-radius:12px; cursor:pointer;
    background:linear-gradient(135deg, var(--gold-bright), var(--gold) 55%, var(--gold-deep));
    color:#1A1408; font-family:'DM Sans',sans-serif;
    font-weight:700; font-size:13.5px; letter-spacing:0.04em;
    box-shadow:0 8px 20px rgba(232,185,72,0.32);
    transition:all 0.2s;
    position:relative; overflow:hidden;
    display:block; box-sizing:border-box;
  }
  .lv-pay-submit::after{
    content:""; position:absolute; top:0; left:0; bottom:0; width:30%;
    background:linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
    animation:lvSheen 3s ease-in-out infinite;
  }
  .lv-pay-submit:hover:not(:disabled){
    transform:translateY(-2px);
    box-shadow:0 12px 26px rgba(232,185,72,0.4);
  }
  .lv-pay-submit:active:not(:disabled){ transform:scale(0.98) }
  .lv-pay-submit:disabled{
    opacity:0.5; cursor:not-allowed;
    background:var(--surface-2);
    color:var(--text-mute);
    box-shadow:none;
  }
  .lv-pay-submit:disabled::after{ display:none }

  .lv-pay-result{
    margin-top:12px; padding:12px 14px;
    border-radius:10px; font-size:12px; font-weight:600;
    line-height:1.5;
    animation:lvRiseSmall 0.3s ease both;
  }
  .lv-pay-result.ok{
    background:rgba(34,211,170,0.10);
    color:var(--green);
    border:1px solid rgba(34,211,170,0.3);
  }
  .lv-pay-result.err{
    background:rgba(248,113,113,0.10);
    color:var(--red);
    border:1px solid rgba(248,113,113,0.3);
  }

  .lv-pay-loading{
    padding:60px 20px; text-align:center;
  }

  /* Pay button on scheme cards */
  .lv-btn-pay{
    padding:7px 14px; border-radius:9px; border:none; cursor:pointer;
    background:linear-gradient(135deg, var(--gold-bright), var(--gold) 55%, var(--gold-deep));
    color:#1A1408; font-family:'DM Sans',sans-serif;
    font-weight:700; font-size:11.5px; letter-spacing:0.03em;
    display:inline-flex; align-items:center; gap:6px;
    box-shadow:0 4px 12px rgba(232,185,72,0.28);
    transition:all 0.2s;
    position:relative; overflow:hidden;
  }
  .lv-btn-pay::after{
    content:""; position:absolute; top:0; left:0; bottom:0; width:30%;
    background:linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
    animation:lvSheen 3s ease-in-out infinite;
  }
  .lv-btn-pay:hover{ transform:translateY(-1px); box-shadow:0 7px 16px rgba(232,185,72,0.38) }
  .lv-btn-pay:active{ transform:scale(0.97) }

  /* ─── Scrollbars ─────────────────────── */
  ::-webkit-scrollbar{ width:6px; height:6px }
  ::-webkit-scrollbar-thumb{ background:rgba(232,185,72,0.25); border-radius:99px }
  ::-webkit-scrollbar-thumb:hover{ background:rgba(232,185,72,0.4) }

  /* ─── Mobile tweaks ──────────────────── */
  @media(max-width:560px){
    .lv-header-inner{ padding:10px 14px }
    .lv-avatar{ width:34px; height:34px; border-radius:10px; font-size:14px }
    .lv-user-name{ font-size:14px }
    .lv-welcome{ margin-bottom:16px }
    .lv-hero{ padding:16px 16px; border-radius:14px }
    .lv-scheme{ padding:15px 16px }
    .lv-scheme-head{ flex-direction:column; align-items:stretch }
    .lv-ring-wrap{ width:84px; height:84px; align-self:center }
    .lv-ring-pct{ font-size:17px }
    .lv-hero-qtys{ gap:7px }
    .lv-qty{ padding:8px 10px }
    /* Button actions on scheme cards */
    .lv-scheme-actions{ flex-wrap:wrap; gap:8px }
    .lv-btn-pay{ flex:1; min-width:0; justify-content:center; padding:10px 10px; font-size:12px }
    .lv-btn-ghost{ flex:1; min-width:0; justify-content:center; padding:10px 10px; font-size:11px }
    /* Tabs bar — full width + equal spacing */
    .lv-tabs{ width:100%; max-width:100% }
    .lv-tab{ flex:1; text-align:center; padding:8px 6px; font-size:11.5px }
    /* Join form */
    .lv-join-form{ padding:20px 16px; border-radius:18px }
    /* Stats */
    .lv-stat-value{ font-size:20px }
    /* Modals */
    .lv-modal{ max-height:96vh; border-radius:14px }
    .lv-pay-modal{ max-height:96vh; border-radius:16px; width:98% }
    .lv-modal-body{ padding:12px 14px }
    /* Payment modal body */
    .lv-pay-body{ padding:16px 14px 80px }
    /* QR card fits small screens */
    .lv-qr-card{ width:100%; max-width:280px }
    .lv-qr-empty{ width:100%; max-width:280px }
    /* Scheme mini stat grid on mobile: 2 col */
    .lv-scheme-stats{ grid-template-columns:repeat(2, 1fr) }
    /* Past chit inner grid */
    .lv-hero-updated{ font-size:9px }
    /* Browse scheme cards */
    .lv-scheme-card{ padding:16px }
    .lv-scheme-card-icon{ font-size:26px; margin-bottom:8px }
    .lv-scheme-card-title{ font-size:16px }
  }

  @media(max-width:400px){
    /* Very small phones */
    .lv-hero-qtys{ grid-template-columns:1fr }
    .lv-greeting{ font-size:22px }
    .lv-hero-price{ font-size:30px }
    .lv-tabs{ gap:1px }
    .lv-tab{ padding:7px 4px; font-size:10.5px }
    .lv-scheme-stats{ grid-template-columns:1fr }
    .lv-scheme-actions{ flex-direction:column }
    .lv-btn-pay, .lv-btn-ghost{ width:100%; justify-content:center }
  }

  /* Touch-friendly tap targets everywhere */
  @media(max-width:768px){
    .lv-btn-pay, .lv-btn-ghost, .lv-btn-gold, .lv-btn-submit, .lv-plan-join{ min-height:44px }
    .lv-tab{ min-height:40px }
    .lv-iconbtn{ width:40px; height:40px }
    /* Scheme card grid: 1 col on small tablet */
    .lv-scheme-card-grid{ grid-template-columns:1fr }
    /* Join form container max-width */
    .lv-join-form{ max-width:100%; margin:0 }
    /* Payment history table wrapper */
    .lv-tbl-wrap{ border-radius:12px; border:1px solid var(--line-cool) }
  }
`;

/* ═══════════════════════ Badge ═══════════════════════ */
const Badge = ({ status }) => {
  const labels = {
    active: "Active", complete: "Complete",
    paid: "Paid", pending: "Pending", overdue: "Overdue",
    approved: "Approved", rejected: "Rejected",
  };
  return <span className={`lv-badge ${status || "pending"}`}>{labels[status] || "Pending"}</span>;
};

/* ═══════════════════════ Circular progress ring ═══════════════════════ */
const ProgressRing = ({ value, max = 13, size = 96, stroke = 8 }) => {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = Math.min(100, Math.round((value / max) * 100));
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="lv-ring-wrap">
      <svg className="lv-ring" width={size} height={size}>
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5D678" />
            <stop offset="55%" stopColor="#E8B948" />
            <stop offset="100%" stopColor="#8B6914" />
          </linearGradient>
        </defs>
        <circle className="lv-ring-bg" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} />
        <circle className="lv-ring-fg"
          cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{
            "--lv-ring-full": circ,
            "--lv-ring-offset": offset,
          }}
        />
      </svg>
      <div className="lv-ring-center">
        <div className="lv-ring-pct">{pct}%</div>
        <div className="lv-ring-sub">M {value}/{max}</div>
      </div>
    </div>
  );
};

/* ═══════════════════════ Chit Wizard Modal ═══════════════════════ */
function ChitWizardModal({ wizard, setWizard, shopInfo, loadingShop, token, onSubmitted }) {
  // wizard shape: { step: 1|2|3|4, schemeType, form: { monthlyAmount, startDate, endDate }, terms: null, termsAgreed: false, file, utrNumber, submitting, error, requestId }

  const nextStep = () => setWizard({ ...wizard, step: wizard.step + 1 });
  const prevStep = () => setWizard({ ...wizard, step: Math.max(1, wizard.step - 1) });
  const close = () => setWizard(null);

  // Step 1: Fetch Terms automatically when moving to step 2
  const goToTerms = async () => {
    if (!wizard.form.monthlyAmount || !wizard.form.startDate || !wizard.form.endDate) {
      setWizard({ ...wizard, error: "Please fill all fields" });
      return;
    }
    setWizard({ ...wizard, submitting: true, error: null });
    try {
      const res = await fetch(`${API}/api/terms/user/scheme/${wizard.schemeType}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setWizard({ ...wizard, step: 2, terms: data.data, submitting: false });
      } else {
        setWizard({ ...wizard, submitting: false, error: "Failed to load Terms. Please try again." });
      }
    } catch {
      setWizard({ ...wizard, submitting: false, error: "Network error loading terms" });
    }
  };

  // Step 2 -> 3: Create request
  const submitRequest = async () => {
    setWizard({ ...wizard, submitting: true, error: null });
    try {
      const res = await fetch(`${API}/api/scheme-join/request-type`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          planType: wizard.schemeType,
          monthlyAmount: wizard.form.monthlyAmount,
          startDate: wizard.form.startDate,
          endDate: wizard.form.endDate,
          termsAccepted: wizard.termsAgreed,
          termsVersion: wizard.terms?.version || 1
        })
      });
      const data = await res.json();
      if (data.success) {
        setWizard({ ...wizard, step: 3, requestId: data.data._id, submitting: false });
      } else {
        setWizard({ ...wizard, submitting: false, error: data.message });
      }
    } catch {
      setWizard({ ...wizard, submitting: false, error: "Network error submitting request" });
    }
  };

  // Step 3: Upload Payment
  const submitPaymentProof = async () => {
    if (!wizard.file && !wizard.utrNumber) {
      setWizard({ ...wizard, error: "Please provide a screenshot or UTR number" });
      return;
    }
    setWizard({ ...wizard, submitting: true, error: null });
    try {
      const fd = new FormData();
      if (wizard.file) fd.append("screenshot", wizard.file);
      if (wizard.utrNumber) fd.append("utrNumber", wizard.utrNumber);

      const res = await fetch(`${API}/api/scheme-join/${wizard.requestId}/first-payment`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        setWizard({ ...wizard, step: 4, submitting: false });
      } else {
        setWizard({ ...wizard, submitting: false, error: data.message });
      }
    } catch {
      setWizard({ ...wizard, submitting: false, error: "Network error uploading proof" });
    }
  };

  return (
    <div className="lv-modal-backdrop" onClick={close} style={{ zIndex: 100 }}>
      <div className="lv-pay-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div className="lv-pay-head">
          <div className="lv-pay-head-row">
            <div>
              <div className="lv-pay-eyebrow">
                <span className="lv-live-dot" /> Step {wizard.step} of 4
              </div>
              <div className="lv-pay-title">
                {wizard.step === 1 && "Configure Your Chit"}
                {wizard.step === 2 && "Terms & Conditions"}
                {wizard.step === 3 && "First Payment"}
                {wizard.step === 4 && "Request Submitted"}
              </div>
            </div>
            <button className="lv-modal-close" onClick={close}>✕</button>
          </div>
        </div>

        <div className="lv-pay-body">

          {wizard.error && (
            <div style={{ background: "rgba(248,113,113,0.1)", color: "var(--red)", padding: 12, borderRadius: 10, fontSize: 13, marginBottom: 24, border: "1px solid rgba(248,113,113,0.2)" }}>
              {wizard.error}
            </div>
          )}

          {/* STEP 1: Details */}
          {wizard.step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, fontWeight: 700 }}>
                  <span style={{ color: "var(--gold)" }}>●</span> Monthly Amount (₹)
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 20, color: "var(--gold)", fontWeight: 700 }}>₹</span>
                  <input
                    type="number" className="lv-input" placeholder="5,000"
                    value={wizard.form.monthlyAmount}
                    onChange={e => setWizard({ ...wizard, form: { ...wizard.form, monthlyAmount: e.target.value } })}
                    style={{ fontSize: 28, fontWeight: 800, padding: "18px 18px 18px 42px", fontFamily: "'Fraunces', serif", letterSpacing: "-0.02em" }}
                  />
                </div>
              </div>

              <div className="lv-form-grid-2">

                <div>
                  <label style={{ display: "block", fontSize: 11, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, fontWeight: 700 }}>Start Date</label>
                  <input
                    type="date" className="lv-input"
                    min={new Date().toISOString().split('T')[0]}
                    value={wizard.form.startDate}
                    onChange={e => setWizard({ ...wizard, form: { ...wizard.form, startDate: e.target.value } })}
                    style={{ padding: "14px 16px", fontWeight: 600 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10, fontWeight: 700 }}>End Date</label>
                  <input
                    type="date" className="lv-input"
                    min={wizard.form.startDate || new Date().toISOString().split('T')[0]}
                    value={wizard.form.endDate}
                    onChange={e => setWizard({ ...wizard, form: { ...wizard.form, endDate: e.target.value } })}
                    style={{ padding: "14px 16px", fontWeight: 600 }}
                  />
                </div>
              </div>


              <div style={{ marginTop: 8 }}>
                <button
                  className="lv-btn-submit"
                  onClick={goToTerms}
                  disabled={wizard.submitting}
                  style={{ width: "100%", padding: "18px", borderRadius: 16, fontSize: 15, fontWeight: 700, boxShadow: "0 10px 25px rgba(232,185,72,0.25)" }}
                >
                  {wizard.submitting ? "Loading..." : "Continue to Terms & Conditions →"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Terms */}
          {wizard.step === 2 && wizard.terms && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ background: "var(--surface)", border: "1px solid var(--line-strong)", borderRadius: 12, padding: 20, maxHeight: 300, overflowY: "auto", fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>
                <h3 style={{ color: "var(--text)", marginBottom: 12 }}>{wizard.terms.title}</h3>
                <div style={{ whiteSpace: "pre-wrap" }}>{wizard.terms.content}</div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: 12, border: "1px solid var(--line)", borderRadius: 12, background: "var(--bg-elev)" }}>
                <input
                  type="checkbox"
                  checked={wizard.termsAgreed}
                  onChange={e => setWizard({ ...wizard, termsAgreed: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: "var(--gold)" }}
                />
                <span style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>I agree to the {wizard.terms.shopName} Terms & Conditions</span>
              </label>
              <div style={{ display: "flex", gap: 12 }}>
                <button className="lv-btn-ghost" onClick={prevStep} style={{ flex: 1 }}>← Back</button>
                <button className="lv-btn-submit" onClick={submitRequest} disabled={!wizard.termsAgreed || wizard.submitting} style={{ flex: 2 }}>
                  {wizard.submitting ? "Processing..." : "Agree & Continue"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment */}
          {wizard.step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {loadingShop ? (
                <div style={{ textAlign: "center", padding: 20 }}><div className="lv-spinner" /></div>
              ) : shopInfo?.error ? (
                <div style={{ color: "var(--red)", textAlign: "center" }}>{shopInfo.error}</div>
              ) : (
                <div style={{ background: "var(--bg-elev)", padding: 20, borderRadius: 16, border: "1px solid var(--line)" }}>
                  <div style={{ fontSize: 13, color: "var(--text-mute)", marginBottom: 12 }}>Transfer ₹{wizard.form.monthlyAmount} to the bank account below</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {shopInfo?.bankName && <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{shopInfo.bankName}{shopInfo.branch ? ` — ${shopInfo.branch}` : ""}</div>}
                    {shopInfo?.accountName && <div style={{ fontSize: 13, color: "var(--text-dim)" }}>A/C Name: {shopInfo.accountName}</div>}
                    {shopInfo?.accountNumber && <div style={{ fontSize: 13, color: "var(--text-dim)", fontFamily: "monospace" }}>A/C No: {shopInfo.accountNumber}</div>}
                    {shopInfo?.ifscCode && <div style={{ fontSize: 13, color: "var(--text-dim)", fontFamily: "monospace" }}>IFSC: {shopInfo.ifscCode}</div>}
                    {shopInfo?.phone && <div style={{ fontSize: 13, color: "var(--text-dim)" }}>Ph: {shopInfo.phone}</div>}
                  </div>
                </div>
              )}

              <div style={{ borderTop: "1px dashed var(--line)", margin: "8px 0" }} />

              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, color: "var(--text-mute)", marginBottom: 8 }}>Upload Screenshot</label>
                  <div style={{ border: "2px dashed var(--line-strong)", borderRadius: 12, padding: "20px 12px", textAlign: "center", cursor: "pointer", position: "relative" }}>
                    <input
                      type="file" accept="image/*"
                      onChange={e => setWizard({ ...wizard, file: e.target.files[0] })}
                      style={{ opacity: 0, position: "absolute", inset: 0, cursor: "pointer" }}
                    />
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{wizard.file ? "🖼️" : "📤"}</div>
                    <div style={{ fontSize: 12, color: "var(--gold-bright)", fontWeight: 600 }}>
                      {wizard.file ? wizard.file.name : "Tap to upload"}
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, color: "var(--text-mute)", marginBottom: 8 }}>Or enter UTR No.</label>
                  <input
                    type="text" className="lv-input" placeholder="12-digit UTR"
                    value={wizard.utrNumber}
                    onChange={e => setWizard({ ...wizard, utrNumber: e.target.value })}
                  />
                </div>
              </div>

              <button className="lv-btn-submit" onClick={submitPaymentProof} disabled={wizard.submitting || (!wizard.file && !wizard.utrNumber)} style={{ marginTop: 8 }}>
                {wizard.submitting ? "Uploading..." : "Submit Payment Proof"}
              </button>
            </div>
          )}

          {/* STEP 4: Success */}
          {wizard.step === 4 && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Request Completed!</div>
              <div style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 32, lineHeight: 1.5 }}>
                Your chit request and payment proof have been successfully submitted. Once the admin verifies the payment, your chit will be activated.
              </div>
              <button className="lv-btn-submit" onClick={() => { close(); onSubmitted(); }} style={{ width: "100%" }}>
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ Payment Modal ═══════════════════════ */
function PaymentModal({ scheme, shopInfo, loading, onClose, token, onSubmitted }) {
  const [copied, setCopied] = useState(null); // "acc" | "ifsc" | "ph" | null
  // Proof tab: "screenshot" | "utr"
  const [proofTab, setProofTab] = useState("screenshot");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { ok, text }

  // At least one proof required
  const canSubmit = proofTab === "screenshot" ? !!file : utrNumber.trim().length >= 6;

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // 5MB max
    if (f.size > 5 * 1024 * 1024) {
      setResult({ ok: false, text: "File too large. Max 5MB." });
      return;
    }
    if (!/^image\//.test(f.type)) {
      setResult({ ok: false, text: "Please upload an image file (JPG or PNG)." });
      return;
    }
    setFile(f);
    setResult(null);
    // Create preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("schemeId", scheme._id);
      fd.append("monthNumber", (scheme.currentMonth || 0) + 1);
      fd.append("userNote", note);
      if (file) fd.append("screenshot", file);
      if (utrNumber.trim()) fd.append("utrNumber", utrNumber.trim());

      const res = await fetch(`${API}/api/payments/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult({ ok: true, text: data.message || "✓ Payment recorded! You can update your proof within 10 minutes." });
        if (onSubmitted) onSubmitted();
        setTimeout(() => onClose(), 2500);
      } else {
        setResult({ ok: false, text: data.message || "Submission failed. Please try again." });
      }
    } catch {
      setResult({ ok: false, text: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="lv-modal-backdrop" onClick={onClose}>
      <div className="lv-pay-modal" onClick={e => e.stopPropagation()}>
        <div className="lv-pay-head">
          <div className="lv-pay-head-row">
            <div>
              <div className="lv-pay-eyebrow">
                <span className="lv-live-dot" />
                Secure Payment
              </div>
              <div className="lv-pay-title">Pay Monthly Due</div>
              <div className="lv-pay-amount">₹{(scheme.monthlyAmount || 0).toLocaleString()}</div>
              <div className="lv-pay-scheme-tag">{scheme.schemeId}</div>
            </div>
            <button className="lv-modal-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="lv-pay-body">
          {loading ? (
            <div className="lv-pay-loading">
              <div className="lv-spinner" />
              <div className="lv-loader-text">Loading payment details…</div>
            </div>
          ) : (
            <>
              <div className="lv-pay-step-label">Step 1 · Transfer to Bank Account</div>

              <div className="lv-pay-bank-card">
                <div className="lv-pay-bank-header">
                  <div className="lv-pay-bank-icon">🏦</div>
                  <div>
                    <div className="lv-pay-bank-name">{shopInfo?.bankName || "Bank Details"}</div>
                    {shopInfo?.branch && <div className="lv-pay-bank-branch">{shopInfo.branch} Branch</div>}
                  </div>
                </div>

                <div className="lv-pay-bank-rows">
                  {shopInfo?.accountName && (
                    <div className="lv-pay-bank-row">
                      <span className="lv-pay-bank-label">Account Name</span>
                      <span className="lv-pay-bank-val">{shopInfo.accountName}</span>
                    </div>
                  )}
                  {shopInfo?.accountNumber && (
                    <div className="lv-pay-bank-row">
                      <span className="lv-pay-bank-label">Account Number</span>
                      <div className="lv-pay-bank-copy-row">
                        <span className="lv-pay-bank-val lv-pay-bank-mono">{shopInfo.accountNumber}</span>
                        <button
                          className={`lv-pay-copy ${copied === "acc" ? "copied" : ""}`}
                          onClick={() => { navigator.clipboard.writeText(shopInfo.accountNumber); setCopied("acc"); setTimeout(() => setCopied(null), 2000); }}>
                          {copied === "acc" ? "✓ Copied" : "⧉ Copy"}
                        </button>
                      </div>
                    </div>
                  )}
                  {shopInfo?.ifscCode && (
                    <div className="lv-pay-bank-row">
                      <span className="lv-pay-bank-label">IFSC Code</span>
                      <div className="lv-pay-bank-copy-row">
                        <span className="lv-pay-bank-val lv-pay-bank-mono">{shopInfo.ifscCode}</span>
                        <button
                          className={`lv-pay-copy ${copied === "ifsc" ? "copied" : ""}`}
                          onClick={() => { navigator.clipboard.writeText(shopInfo.ifscCode); setCopied("ifsc"); setTimeout(() => setCopied(null), 2000); }}>
                          {copied === "ifsc" ? "✓ Copied" : "⧉ Copy"}
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="lv-pay-bank-row">
                    <span className="lv-pay-bank-label">Contact</span>
                    <div className="lv-pay-bank-copy-row">
                      <span className="lv-pay-bank-val">{shopInfo?.phone || "Not available"}</span>
                      {shopInfo?.phone && (
                        <button
                          className={`lv-pay-copy ${copied === "ph" ? "copied" : ""}`}
                          onClick={() => { navigator.clipboard.writeText(shopInfo.phone); setCopied("ph"); setTimeout(() => setCopied(null), 2000); }}>
                          {copied === "ph" ? "✓ Copied" : "⧉ Copy"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Step 2: Proof of Payment ─────────────────────────── */}
              <div className="lv-pay-divider">
                <span className="lv-pay-divider-text">Step 2 · Submit Proof</span>
              </div>

              {/* Proof type toggle tabs */}
              <div className="lv-pay-proof-tabs">
                <button
                  className={`lv-pay-proof-tab ${proofTab === "screenshot" ? "active" : ""}`}
                  onClick={() => { setProofTab("screenshot"); setResult(null); }}
                  disabled={submitting}>
                  📷 Screenshot
                </button>
                <button
                  className={`lv-pay-proof-tab ${proofTab === "utr" ? "active" : ""}`}
                  onClick={() => { setProofTab("utr"); setResult(null); }}
                  disabled={submitting}>
                  # UTR Number
                </button>
              </div>

              {proofTab === "screenshot" ? (
                <>
                  <label className={`lv-pay-upload ${file ? "has-file" : ""}`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={submitting}
                    />
                    <div className="lv-pay-upload-icon">{file ? "✓" : "↑"}</div>
                    <div className="lv-pay-upload-title">
                      {file ? "Screenshot Ready" : "Upload Payment Screenshot"}
                    </div>
                    <div className="lv-pay-upload-sub">
                      {file ? "Click to change file" : "JPG or PNG · Max 5MB"}
                    </div>
                    {file && (
                      <div className="lv-pay-upload-filename">{file.name}</div>
                    )}
                  </label>

                  {preview && (
                    <div className="lv-pay-preview">
                      <button className="lv-pay-preview-close" onClick={clearFile} disabled={submitting}>✕</button>
                      <img src={preview} alt="Payment screenshot preview" />
                    </div>
                  )}
                </>
              ) : (
                <div className="lv-pay-utr-wrap">
                  <input
                    className={`lv-pay-utr-input ${utrNumber.trim().length >= 6 ? "valid" : ""}`}
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter UTR / Transaction Reference No."
                    value={utrNumber}
                    onChange={(e) => { setUtrNumber(e.target.value); setResult(null); }}
                    disabled={submitting}
                    maxLength={40}
                  />
                  <span className="lv-pay-utr-icon">🔑</span>
                  <div className="lv-pay-utr-hint">
                    {utrNumber.trim().length >= 6
                      ? `✓ UTR entered — ${utrNumber.trim().length} characters`
                      : "12-digit UTR number found in your bank / UPI app transaction history"}
                  </div>
                </div>
              )}

              {/* Optional note — always visible */}
              <textarea
                className="lv-pay-textarea"
                style={{ marginTop: 10 }}
                placeholder="Optional note to admin (e.g., payment date, amount sent)…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={submitting}
                maxLength={200}
              />

              <button
                className="lv-pay-submit"
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}>
                {submitting
                  ? "Submitting…"
                  : canSubmit
                    ? "Submit for Verification"
                    : proofTab === "screenshot"
                      ? "Upload Screenshot First"
                      : "Enter UTR Number First"}
              </button>

              {result && (
                <div className={`lv-pay-result ${result.ok ? "ok" : "err"}`}>
                  {result.text}
                </div>
              )}

              <div className="lv-pay-note">
                <span className="lv-pay-note-icon">ⓘ</span>
                <div className="lv-pay-note-body">
                  Your payment is recorded <b>immediately</b> after submitting proof.
                  You can update the proof within <b>10 minutes</b> if needed.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ Pending Payment Card (with 10-min edit) ═══════════════════════ */
function PendingPaymentCard({ payment, token, onEdited, editProofPayment, setEditProofPayment, API }) {
  const EDIT_WINDOW_MS = 10 * 60 * 1000;
  const submittedAt = payment.screenshotUploadedAt || payment.createdAt;
  const expiresAt = submittedAt ? new Date(new Date(submittedAt).getTime() + EDIT_WINDOW_MS) : null;

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!expiresAt) return;
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  const isEditing = editProofPayment === payment._id;
  const canEdit = payment.status === "paid" && expiresAt && now < expiresAt.getTime();
  const secsLeft = expiresAt ? Math.max(0, Math.floor((expiresAt.getTime() - now) / 1000)) : 0;
  const minsLeft = Math.floor(secsLeft / 60);
  const secsPart = secsLeft % 60;

  const [editFile, setEditFile] = useState(null);
  const [editUtr, setEditUtr] = useState(payment.utrNumber || "");
  const [editNote, setEditNote] = useState(payment.userNote || "");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleEdit = async () => {
    if (!editFile && !editUtr.trim()) { setMsg({ ok: false, text: "Provide an updated screenshot or UTR number" }); return; }
    setSubmitting(true); setMsg(null);
    try {
      const fd = new FormData();
      if (editFile) fd.append("screenshot", editFile);
      if (editUtr.trim()) fd.append("utrNumber", editUtr.trim());
      if (editNote.trim()) fd.append("userNote", editNote.trim());
      const res = await fetch(`${API}/api/payments/${payment._id}/edit-proof`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ ok: true, text: "Proof updated!" });
        setEditProofPayment(null);
        onEdited();
      } else {
        setMsg({ ok: false, text: data.message || "Update failed" });
      }
    } catch { setMsg({ ok: false, text: "Network error" }); }
    finally { setSubmitting(false); }
  };

  const statusColor = "#22c55e";
  const statusLabel = "Paid — Proof Editable";

  return (
    <div style={{ border: `1px solid ${statusColor}40`, borderRadius: 14, background: "var(--bg-elev)", overflow: "hidden" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
        <div>
          <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>Month {payment.monthNumber}</div>
          <div style={{ fontSize: 12, color: "var(--text-mute)", marginTop: 2 }}>₹{(payment.amount || 0).toLocaleString()}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "inline-block", padding: "4px 10px", borderRadius: 6, background: `${statusColor}18`, color: statusColor, fontSize: 11, fontWeight: 700, letterSpacing: 0.3 }}>{statusLabel}</div>
          {payment.gramsAdded > 0 && (
            <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 4 }}>+{payment.gramsAdded}g gold @ ₹{payment.goldRateOnPaymentDay?.toLocaleString()}/g</div>
          )}
        </div>
      </div>

      {/* Proof info */}
      <div style={{ padding: "12px 16px" }}>
        {payment.screenshotUrl && (
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>
            Screenshot submitted {submittedAt ? new Date(submittedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""}
          </div>
        )}
        {payment.utrNumber && (
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 6, fontFamily: "monospace" }}>UTR: {payment.utrNumber}</div>
        )}
        {payment.userNote && (
          <div style={{ fontSize: 12, color: "var(--text-mute)" }}>Note: {payment.userNote}</div>
        )}

        {/* Edit window UI */}
        {payment.status === "paid" && expiresAt && (
          canEdit ? (
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontSize: 12, color: "#f59e0b", fontWeight: 600 }}>
                ⏱ Edit window: {minsLeft}:{secsPart.toString().padStart(2, "0")} left
              </div>
              <button
                onClick={() => setEditProofPayment(isEditing ? null : payment._id)}
                style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid #f59e0b", background: isEditing ? "#f59e0b22" : "transparent", color: "#f59e0b", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                {isEditing ? "Cancel" : "Edit Proof"}
              </button>
            </div>
          ) : (
            <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-mute)" }}>🔒 Edit window expired — under admin review</div>
          )
        )}
      </div>

      {/* Inline edit form */}
      {isEditing && canEdit && (
        <div style={{ padding: "14px 16px", borderTop: "1px solid var(--line)", background: "var(--bg-page)", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: 0.4 }}>Replace Proof</div>

          {/* Screenshot upload */}
          <label style={{ display: "block", border: "1.5px dashed var(--line-strong)", borderRadius: 10, padding: "14px", textAlign: "center", cursor: "pointer", position: "relative", background: editFile ? "rgba(245,158,11,0.05)" : "transparent" }}>
            <input type="file" accept="image/*,.pdf" onChange={e => setEditFile(e.target.files[0])} style={{ opacity: 0, position: "absolute", inset: 0, cursor: "pointer" }} />
            <div style={{ fontSize: 18, marginBottom: 4 }}>{editFile ? "🖼️" : "📤"}</div>
            <div style={{ fontSize: 12, color: editFile ? "#f59e0b" : "var(--text-mute)" }}>{editFile ? editFile.name : "Upload new screenshot"}</div>
          </label>

          {/* UTR */}
          <input
            type="text" placeholder="Update UTR number (optional)"
            value={editUtr} onChange={e => setEditUtr(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg-input)", color: "var(--text)", fontSize: 13, boxSizing: "border-box", fontFamily: "monospace" }}
          />

          {/* Note */}
          <input
            type="text" placeholder="Note to admin (optional)"
            value={editNote} onChange={e => setEditNote(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--bg-input)", color: "var(--text)", fontSize: 13, boxSizing: "border-box" }}
          />

          {msg && (
            <div style={{ fontSize: 12, color: msg.ok ? "#22c55e" : "#ef4444", fontWeight: 600 }}>{msg.text}</div>
          )}

          <button
            onClick={handleEdit} disabled={submitting || (!editFile && !editUtr.trim())}
            style={{ padding: "12px", borderRadius: 10, border: "none", background: "#f59e0b", color: "#000", fontWeight: 700, fontSize: 13, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "Updating..." : "Update Proof"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ 13-Month Schedule Modal ═══════════════════════ */
function MonthScheduleModal({ scheme, payments, goldRate, onClose }) {
  const isType2 = scheme.planType === "Type2";
  const totalMonths = scheme.totalMonths || 13;

  const monthPayments = Array.from({ length: totalMonths }, (_, i) => {
    const monthNum = i + 1;
    if (monthNum === totalMonths) {
      return {
        monthNumber: totalMonths,
        isOwnerMonth: true,
        status: scheme.ownerPaymentDone ? "paid" : "pending",
        gramsAdded: scheme.ownerPaymentGrams || 0,
        amount: scheme.monthlyAmount,
      };
    }
    const p = payments.find(x => x.monthNumber === monthNum && (x.scheme?._id || x.scheme) === scheme._id);
    return p || { monthNumber: monthNum, status: "pending", amount: scheme.monthlyAmount, gramsAdded: 0 };
  });

  return (
    <div className="lv-modal-backdrop" onClick={onClose}>
      <div className="lv-modal" onClick={e => e.stopPropagation()}>
        <div className="lv-modal-head">
          <div>
            <div className="lv-modal-title">{totalMonths}-Month Schedule — {scheme.schemeId}</div>
            <div className="lv-modal-sub">
              {isType2 ? "Currency Conversion" : "Gold Accumulation"} &nbsp;·&nbsp;
              Monthly · ₹{(scheme.monthlyAmount || 0).toLocaleString()} &nbsp;·&nbsp;
              Started · {scheme.startDate ? new Date(scheme.startDate).toLocaleDateString("en-IN") : "—"}
            </div>
          </div>
          <button className="lv-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="lv-modal-body">
          <div className="lv-tbl-wrap">
            <table className="lv-tbl">
              <thead>
                <tr>
                  {["Month", "Type", "Amount", "Gold", "Due Date", "Status"].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthPayments.map(p => (
                  <tr key={p.monthNumber} style={p.isOwnerMonth ? { background: "rgba(232,185,72,0.06)" } : {}}>
                    <td className="lv-mono" style={{ color: "var(--text)", fontWeight: 600 }}>M{p.monthNumber}</td>
                    <td>
                      {p.isOwnerMonth
                        ? <span className="lv-badge complete" style={{ background: "rgba(232,185,72,0.14)", color: "var(--gold-bright)" }}>Bonus</span>
                        : <span className="lv-badge pending" style={{ background: "rgba(59,130,246,0.14)", color: "#60A5FA" }}>Payment</span>}
                    </td>
                    <td className="lv-mono" style={{ color: "var(--text)" }}>
                      ₹{(p.amount || scheme.monthlyAmount || 0).toLocaleString()}
                    </td>
                    <td className="lv-mono lv-gold-text">
                      {p.gramsAdded ? `${Number(p.gramsAdded).toFixed(3)}g` : "—"}
                    </td>
                    <td className="lv-mono">
                      {p.dueDate ? new Date(p.dueDate).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td><Badge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lv-modal-summary">
            <div>
              <div className="lv-sum-label">{isType2 ? "Amount Accumulated" : "Gold Saved"}</div>
              <div className="lv-sum-val" style={{ color: "var(--gold-bright)" }}>
                {isType2 ? `₹${(scheme.totalAmountAccumulated || 0).toLocaleString()}` : `${(scheme.totalGramsAccumulated || 0).toFixed(3)}g`}
              </div>
            </div>
            {goldRate && !isType2 && (
              <div>
                <div className="lv-sum-label">Current Value</div>
                <div className="lv-sum-val" style={{ color: "var(--green)" }}>
                  ≈ ₹{((scheme.totalGramsAccumulated || 0) * goldRate).toLocaleString()}
                </div>
              </div>
            )}
            <div>
              <div className="lv-sum-label">Installments Paid</div>
              <div className="lv-sum-val" style={{ color: "var(--text)" }}>
                {scheme.currentMonth || 0} / {totalMonths - 1}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── User Profile Settings ──
function ProfileSettingsTab({ profile, token, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: profile?.name || "", phone: profile?.phone || "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(profile?.userPhoto ? getFileUrl(profile.userPhoto) : null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() && !form.phone.trim() && !file) {
      return setMsg({ type: "error", text: "Please make at least one change." });
    }

    setSubmitting(true);
    setMsg({ type: "", text: "" });

    try {
      const formData = new FormData();
      if (form.name.trim() && form.name !== profile.name) formData.append("name", form.name);
      if (form.phone.trim() && form.phone !== profile.phone) formData.append("phone", form.phone);
      if (file) formData.append("userPhoto", file);

      // If nothing appended
      if (![...formData.keys()].length) {
        setSubmitting(false);
        return setMsg({ type: "error", text: "No actual changes made." });
      }

      const res = await fetch(`${API}/api/users/profile-update-request`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: "Profile update requested. Awaiting admin approval." });
        setEditing(false);
        setFile(null);
        if (onUpdate) onUpdate();
      } else {
        setMsg({ type: "error", text: data.message || "Failed to submit request." });
      }
    } catch (err) {
      setMsg({ type: "error", text: "Network error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="lv-payments" style={{ animation: "lvRise 0.5s ease both", maxWidth: 600, margin: "0 auto" }}>

      {msg.text && (
        <div className={`lv-error ${msg.type === "success" ? "lv-msg-success" : ""}`} style={{ marginBottom: 20, background: msg.type === "success" ? "rgba(34,211,170,0.1)" : undefined, borderColor: msg.type === "success" ? "rgba(34,211,170,0.3)" : undefined }}>
          <div className="lv-error-body">
            <div className="lv-error-title" style={{ color: msg.type === "success" ? "var(--green)" : undefined }}>
              {msg.type === "success" ? "Request Submitted" : "Error"}
            </div>
            <div className="lv-error-msg">{msg.text}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Photo */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%", overflow: "hidden",
            background: "var(--surface-2)", border: "2px solid var(--line)", flexShrink: 0
          }}>
            {preview ? (
              <img src={preview} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "var(--text-mute)" }}>
                👤
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8 }}>PROFILE PICTURE</label>
            {editing ? (
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: 13, color: "var(--text)" }} />
            ) : (
              <div style={{ fontSize: 14, color: "var(--text-mute)" }}>{profile?.userPhoto ? "Custom photo set" : "No photo set"}</div>
            )}
          </div>
        </div>

        {/* Name */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8 }}>FULL NAME</label>
          {editing ? (
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--line-cool)", color: "var(--text)", fontSize: 14 }}
            />
          ) : (
            <div style={{ fontSize: 15, color: "var(--text)", fontWeight: 500 }}>{profile?.name}</div>
          )}
        </div>

        {/* Phone */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-dim)", marginBottom: 8 }}>PHONE NUMBER</label>
          {editing ? (
            <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--line-cool)", color: "var(--text)", fontSize: 14 }}
            />
          ) : (
            <div style={{ fontSize: 15, color: "var(--text)", fontWeight: 500 }}>{profile?.phone}</div>
          )}
        </div>

        {/* Info Box */}
        {editing && (
          <div style={{ padding: 12, borderRadius: 8, background: "rgba(232,185,72,0.1)", border: "1px solid var(--line)", fontSize: 12, color: "var(--text-dim)", lineHeight: 1.5 }}>
            <b style={{ color: "var(--gold-bright)" }}>Note:</b> Any changes made here will be sent to your shop administrator for approval. Your profile will be updated once approved.
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          {editing ? (
            <>
              <button type="button" onClick={() => { setEditing(false); setPreview(profile?.userPhoto ? getFileUrl(profile.userPhoto) : null); setForm({ name: profile?.name || "", phone: profile?.phone || "" }); setFile(null); }} className="lv-btn-ghost" style={{ flex: 1, justifyContent: "center" }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="lv-btn-gold" style={{ flex: 2 }}>
                {submitting ? "Submitting..." : "Submit for Approval"}
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setEditing(true)} className="lv-btn-gold" style={{ width: "100%" }}>
              ✏️ Request Profile Update
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

/* ═══════════════════════ Main dashboard ═══════════════════════ */
export default function UserDashboard({ onLogout }) {
  const plansRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [goldRate, setGoldRate] = useState(null);
  const [goldRateData, setGoldRateData] = useState(null);
  const [activeTab, setActiveTab] = useState("schemes");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showShopDetails, setShowShopDetails] = useState(false);
  const [adminShopDetails, setAdminShopDetails] = useState(null);
  const [loadingShopDetails, setLoadingShopDetails] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("userTheme") !== "light");
  const [scheduleScheme, setScheduleScheme] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // Payment modal state
  const [paymentScheme, setPaymentScheme] = useState(null);
  const [shopInfo, setShopInfo] = useState(null);
  const [shopInfoLoading, setShopInfoLoading] = useState(false);

  // Browse Schemes state
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categoryPlans, setCategoryPlans] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [joining, setJoining] = useState(null);
  const [joinMsg, setJoinMsg] = useState({});
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Predefined Scheme state (legacy)
  const [selectedSchemeType, setSelectedSchemeType] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isTypeRequesting, setIsTypeRequesting] = useState(false);
  const [typeRequestMsg, setTypeRequestMsg] = useState(null);

  // Self-service chit wizard state
  const [chitWizard, setChitWizard] = useState(null);
  // chitWizard shape: { step: 1|2|3|4, schemeType, form: { monthlyAmount, startDate, endDate },
  //                    terms: null|{title, content, version}, termsAgreed, file, utrNumber,
  //                    submitting, error, requestId }

  // Payment History View State
  const [historyChitId, setHistoryChitId] = useState(null);
  const [historyFilter, setHistoryFilter] = useState("paid"); // "paid", "pending", "upcoming", "due"
  const [editProofPayment, setEditProofPayment] = useState(null); // payment being edited

  const refreshProfile = () => {
    fetch(`${API}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setProfile(d.data); })
      .catch(() => {});
  };

  useEffect(() => {
    if (selectedSchemeType) {
      const cat = categories.find(c => c.planType === selectedSchemeType);
      if (cat) fetchPlans(cat._id);
      else setCategoryPlans([]);

      // Smooth scroll to plans
      setTimeout(() => {
        if (plansRef.current) {
          plansRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [selectedSchemeType, categories]);

  const fetchPlans = async (catId) => {
    setLoadingPlans(true);
    try {
      const res = await fetch(`${API}/api/plans/public/${catId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json());
      if (res.success) setCategoryPlans(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoadingPlans(false); }
  };

  const toggleDark = () => setDark(d => {
    const next = !d;
    localStorage.setItem("userTheme", next ? "dark" : "light");
    return next;
  });

  const userInfo = (() => {
    try { return JSON.parse(sessionStorage.getItem("userInfo") || "{}"); }
    catch { return {}; }
  })();
  const token = sessionStorage.getItem("userToken");

  // Refresh data when switching back to schemes tab
  useEffect(() => {
    if (activeTab === "schemes" && !loading) {
      const authHeaders = { Authorization: `Bearer ${token}` };
      const safeFetch = (url) => fetch(url, { headers: authHeaders }).then(r => r.json());

      Promise.all([
        safeFetch(`${API}/api/users/me`),
        safeFetch(`${API}/api/scheme-join/my`),
      ]).then(([profileData, joinData]) => {
        if (profileData.success) setProfile(profileData.data);
        if (joinData.success) setJoinRequests(joinData.data || []);
      }).catch(err => console.error("Tab refresh error:", err));
    }
  }, [activeTab]);

  useEffect(() => {
    setFetchError(null);
    const authHeaders = { Authorization: `Bearer ${token}` };

    const safeFetch = (url) =>
      fetch(url, { headers: authHeaders }).then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(data.message || `Request failed (${r.status})`);
        return data;
      });

    Promise.all([
      safeFetch(`${API}/api/users/me`),
      safeFetch(`${API}/api/goldrate/user/today`).catch(() => ({ success: false })),
      safeFetch(`${API}/api/categories/public`).catch(() => ({ success: false })),
      safeFetch(`${API}/api/scheme-join/my`).catch(() => ({ success: false })),
    ])
      .then(([profileData, rateData, schemesData, joinData]) => {
        if (profileData.success) {
          setProfile(profileData.data);
        } else {
          setFetchError(profileData.message || "Failed to load profile data");
        }
        if (rateData.success && rateData.data) {
          setGoldRate(rateData.data.ratePerGram);
          setGoldRateData(rateData.data);
        }
        if (schemesData.success) setCategories(schemesData.data || []);
        if (joinData.success) setJoinRequests(joinData.data || []);
      })
      .catch(err => {
        console.error("Dashboard Fetch Error:", err);
        if (err.message && err.message.toLowerCase().includes("failed to fetch")) {
          setFetchError("Unable to connect to server. Please make sure the backend is running on port 5000.");
        } else {
          setFetchError(err.message || "Something went wrong. Please try again.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Poll gold rate every 5 seconds for instant updates
  useEffect(() => {
    if (!token) return;
    const fetchLiveRate = async () => {
      try {
        const res = await fetch(`${API}/api/goldrate/user/today`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          setGoldRate(data.data.ratePerGram);
          setGoldRateData(data.data);
        }
      } catch (e) { }
    };

    const intervalId = setInterval(fetchLiveRate, 5000);
    return () => clearInterval(intervalId);
  }, [token]);

  useEffect(() => {
    if (selectedCategoryId) {
      const loadPlans = async () => {
        setLoadingPlans(true);
        try {
          const res = await fetch(`${API}/api/plans/public/${selectedCategoryId}`);
          const data = await res.json();
          if (data.success) setCategoryPlans(data.data || []);
        } catch (e) { console.error(e); }
        finally { setLoadingPlans(false); }
      };
      loadPlans();
    }
  }, [selectedCategoryId]);

  // Fetch admin shop details when modal opens
  useEffect(() => {
    if (showShopDetails) {
      setLoadingShopDetails(true);
      fetch(`${API}/api/auth/shop-payment-info`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(d => {
          if (d.success && d.data) {
            setAdminShopDetails(d.data);
          } else {
            setAdminShopDetails(null);
          }
        })
        .catch(err => {
          console.error("Failed to fetch shop details:", err);
          setAdminShopDetails(null);
        })
        .finally(() => setLoadingShopDetails(false));
    } else {
      setAdminShopDetails(null);
    }
  }, [showShopDetails, token]);

  const schemes = profile?.schemes || [];
  const payments = profile?.payments || [];

  const activeChits = schemes.filter(s => s.status !== "complete" && s.status !== "early_exit");
  const pastChits = schemes.filter(s => s.status === "complete" || s.status === "early_exit");

  const totalGrams = schemes.reduce((s, sc) => s + (sc.totalGramsAccumulated || 0), 0).toFixed(3);
  const activeSchemes = schemes.filter(s => s.status === "active").length;
  const nextDue = payments.find(p => p.status === "pending");
  const totalPaid = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);

  const handleLogout = () => {
    sessionStorage.removeItem("userToken");
    sessionStorage.removeItem("userInfo");
    onLogout();
  };

  const downloadPastChit = (scheme) => {
    const isType2 = scheme.planType === "Type2";
    const startD = scheme.startDate ? new Date(scheme.startDate).toLocaleDateString("en-IN") : "—";
    const closeD = (scheme.completionDate || scheme.earlyExitDate || scheme.updatedAt) 
      ? new Date(scheme.completionDate || scheme.earlyExitDate || scheme.updatedAt).toLocaleDateString("en-IN") 
      : "—";
    const totalPaidAmt = payments
      .filter(p => p.status === "paid" && (p.scheme?._id === scheme._id || p.scheme === scheme._id))
      .reduce((sum, p) => sum + p.amount, 0);
    
    const textContent = `
==================================================
        GOLD INVESTMENT SAVINGS SCHEME
              CLOSURE STATEMENT
==================================================
Scheme ID         : ${scheme.schemeId}
Status            : ${scheme.status === "complete" ? "MATURED" : "CLOSED (EARLY EXIT)"}
Scheme Type       : ${isType2 ? "Currency Conversion (Type 2)" : "Gold Accumulation (Type 1)"}
Monthly Commitment: Rs. ${(scheme.monthlyAmount || 0).toLocaleString()}
--------------------------------------------------
Start Date        : ${startD}
Closure Date      : ${closeD}
--------------------------------------------------
Total Amount Paid : Rs. ${totalPaidAmt.toLocaleString()}
Total Gold Saved  : ${isType2 ? "—" : `${(scheme.totalGramsAccumulated || 0).toFixed(3)}g`}
Accumulated Value : Rs. ${(scheme.totalAmountAccumulated || 0).toLocaleString()}
--------------------------------------------------
Thank you for investing with us!
==================================================`;
    const blob = new Blob([textContent.trim()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Statement_${scheme.schemeId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const joinScheme = async (planId) => {
    setJoining(planId);
    setJoinMsg(m => ({ ...m, [planId]: null }));
    try {
      const res = await fetch(`${API}/api/scheme-join/request-plan`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setJoinMsg(m => ({ ...m, [planId]: { ok: true, text: "✓ Request sent! Admin will review shortly." } }));
        const jr = await fetch(`${API}/api/scheme-join/my`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
        if (jr.success) setJoinRequests(jr.data || []);
      } else {
        setJoinMsg(m => ({ ...m, [planId]: { ok: false, text: `⚠ ${data.message}` } }));
      }
    } catch {
      setJoinMsg(m => ({ ...m, [planId]: { ok: false, text: "⚠ Network error. Try again." } }));
    } finally {
      setJoining(null);
    }
  };

  const getRequestForPlan = (planId) =>
    joinRequests.find(r => (r.plan?._id === planId || r.plan === planId) && r.status !== "approved");

  const getRequestForType = (type) =>
    joinRequests.find(r => r.planType === type && r.status !== "approved");

  const joinByType = async () => {
    if (!selectedSchemeType || !customAmount) return;
    setIsTypeRequesting(true);
    setTypeRequestMsg(null);
    try {
      const res = await fetch(`${API}/api/scheme-join/request-type`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ planType: selectedSchemeType, monthlyAmount: customAmount }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTypeRequestMsg({ ok: true, text: "✓ Request submitted! Admin will review shortly." });
        const jr = await fetch(`${API}/api/scheme-join/my`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
        if (jr.success) setJoinRequests(jr.data || []);
        // Reset form after delay
        setTimeout(() => {
          setSelectedSchemeType(null);
          setCustomAmount("");
          setTypeRequestMsg(null);
        }, 3000);
      } else {
        setTypeRequestMsg({ ok: false, text: `⚠ ${data.message}` });
      }
    } catch {
      setTypeRequestMsg({ ok: false, text: "⚠ Network error. Try again." });
    } finally {
      setIsTypeRequesting(false);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm("Are you sure you want to cancel and remove this request?")) return;
    try {
      const res = await fetch(`${API}/api/scheme-join/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const jr = await fetch(`${API}/api/scheme-join/my`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
        if (jr.success) setJoinRequests(jr.data || []);
      } else {
        alert(data.message || "Failed to cancel request");
      }
    } catch (e) {
      alert("Network error");
    }
  };

  // Open payment modal — lazy-fetch shop info on first open, then cache it
  const handlePayClick = async (scheme) => {
    setPaymentScheme(scheme);
    if (shopInfo) return; // already cached
    setShopInfoLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/shop-payment-info`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShopInfo(data.data);
      } else {
        setShopInfo({ error: data.message || "Could not load shop info" });
      }
    } catch {
      setShopInfo({ error: "Network error. Please try again." });
    } finally {
      setShopInfoLoading(false);
    }
  };

  const setWizardStateAndFetchShopInfo = async (newState) => {
    setChitWizard(newState);
    if (newState && newState.step === 3 && !shopInfo && !shopInfoLoading) {
      setShopInfoLoading(true);
      try {
        const res = await fetch(`${API}/api/auth/shop-payment-info`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setShopInfo(data.data);
        } else {
          setShopInfo({ error: data.message || "Could not load shop info" });
        }
      } catch {
        setShopInfo({ error: "Network error. Please try again." });
      } finally {
        setShopInfoLoading(false);
      }
    }
  };

  /* ─── Loading screen ─── */
  if (loading) return (
    <div className={`lv ${dark ? "" : "light"}`}>
      <style>{CSS}</style>
      <div className="lv-aurora" />
      <div className="lv-grain" />
      <div className="lv-loader">
        <div className="lv-loader-inner">
          <div className="lv-spinner" />
          <div className="lv-loader-text">Opening your vault…</div>
        </div>
      </div>
    </div>
  );

  const displayName = (profile?.name || userInfo.name || "").split(" ")[0] || "User";

  return (
    <div className={`lv ${dark ? "" : "light"}`}>
      <style>{CSS}</style>

      {/* Atmosphere */}
      <div className="lv-aurora" />
      <div className="lv-grain" />

      {/* Modal */}
      {scheduleScheme && (
        <MonthScheduleModal
          scheme={scheduleScheme}
          payments={payments}
          goldRate={goldRate}
          onClose={() => setScheduleScheme(null)}
        />
      )}

      {/* Payment Modal */}
      {paymentScheme && (
        <PaymentModal
          scheme={paymentScheme}
          shopInfo={shopInfo}
          loading={shopInfoLoading}
          token={token}
          onSubmitted={() => { refreshProfile(); setPaymentScheme(null); }}
          onClose={() => setPaymentScheme(null)}
        />
      )}

      {/* Chit Wizard Modal */}
      {chitWizard && (
        <ChitWizardModal
          wizard={chitWizard}
          setWizard={setWizardStateAndFetchShopInfo}
          shopInfo={shopInfo}
          loadingShop={shopInfoLoading}
          token={token}
          onSubmitted={() => { refreshProfile(); setChitWizard(null); }}
        />
      )}

      {/* Profile Settings Modal */}
      {showProfile && (
        <div className="lv-modal-backdrop" onClick={() => setShowProfile(false)} style={{ zIndex: 100 }}>
          <div className="lv-pay-modal" style={{ maxWidth: 600, padding: 0 }} onClick={e => e.stopPropagation()}>
            <div className="lv-pay-head">
              <div className="lv-pay-head-row">
                <div>
                  <div className="lv-pay-eyebrow">
                    <span className="lv-live-dot" />
                    Settings
                  </div>
                  <div className="lv-pay-title">My Profile</div>
                </div>
                <button className="lv-modal-close" onClick={() => setShowProfile(false)}>✕</button>
              </div>
            </div>
            <div style={{ padding: 24, maxHeight: "80vh", overflowY: "auto" }}>
              <ProfileSettingsTab
                profile={profile}
                token={token}
                onUpdate={() => {
                  fetch(`${API}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } })
                    .then(r => r.json())
                    .then(d => { if (d.success) setProfile(d.data); });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Shop Details Modal */}
      {showShopDetails && (
        <div className="lv-modal-backdrop" onClick={() => setShowShopDetails(false)} style={{ zIndex: 100 }}>
          <div className="lv-pay-modal" style={{ maxWidth: 600, padding: 0, borderRadius: 16 }} onClick={e => e.stopPropagation()}>
            <div className="lv-pay-head" style={{ borderRadius: "16px 16px 0 0" }}>
              <div className="lv-pay-head-row">
                <div>
                  <div className="lv-pay-eyebrow">
                    <span className="lv-live-dot" />
                    Shop Information
                  </div>
                  <div className="lv-pay-title">Shop Details</div>
                </div>
                <button className="lv-modal-close" onClick={() => setShowShopDetails(false)}>✕</button>
              </div>
            </div>
            <div style={{ padding: 24, maxHeight: "80vh", overflowY: "auto" }}>
              {loadingShopDetails ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-light)" }}>
                  Loading shop details...
                </div>
              ) : (
                <>
                  {/* Admin Photo + Basic Info */}
                  <div style={{ display: "flex", gap: 20, marginBottom: 24, alignItems: "flex-start" }}>
                    <div style={{
                      width: 100, height: 100, borderRadius: 12, flexShrink: 0,
                      background: adminShopDetails?.adminPhoto ? "transparent" : "linear-gradient(135deg,#D4A017,#F5C842)",
                      overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 36, fontWeight: 700, color: "#0B1F3E", boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}>
                      {adminShopDetails?.adminPhoto ? (
                        <img src={getFileUrl(adminShopDetails.adminPhoto)} alt="Shop Owner" 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        (adminShopDetails?.ownerName || "S").charAt(0).toUpperCase()
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-light)", letterSpacing: 0.5, marginBottom: 4 }}>
                          OWNER NAME
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-main)" }}>
                          {adminShopDetails?.ownerName || adminShopDetails?.name || "—"}
                        </div>
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-light)", letterSpacing: 0.5, marginBottom: 4 }}>
                          SHOP CODE
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-main)" }}>
                          {adminShopDetails?.shopCode || "—"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email and Phone */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-light)", letterSpacing: 0.5, marginBottom: 6 }}>
                        EMAIL ADDRESS
                      </div>
                      <div style={{
                        fontSize: 14, color: "var(--text-main)", background: "var(--bg-input)",
                        padding: "10px 12px", borderRadius: 8, wordBreak: "break-all"
                      }}>
                        {adminShopDetails?.email || "—"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-light)", letterSpacing: 0.5, marginBottom: 6 }}>
                        SHOP PHONE
                      </div>
                      <div style={{
                        fontSize: 14, color: "var(--text-main)", background: "var(--bg-input)",
                        padding: "10px 12px", borderRadius: 8
                      }}>
                        {adminShopDetails?.phone || "—"}
                      </div>
                    </div>
                  </div>

                  {/* Shop Name */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-light)", letterSpacing: 0.5, marginBottom: 6 }}>
                      SHOP NAME
                    </div>
                    <div style={{
                      fontSize: 14, color: "var(--text-main)", background: "var(--bg-input)",
                      padding: "10px 12px", borderRadius: 8, width: "100%", wordBreak: "break-word"
                    }}>
                      {adminShopDetails?.shopName || "—"}
                    </div>
                  </div>

                  <button
                    onClick={() => setShowShopDetails(false)}
                    style={{
                      width: "100%", padding: "12px 16px",
                      background: "var(--primary)", color: "#fff", border: "none",
                      borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={e => e.target.style.background = "var(--gold)"}
                    onMouseLeave={e => e.target.style.background = "var(--primary)"}
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="lv-header">
        <div className="lv-header-inner">
          <div className="lv-user">
            <div className="lv-avatar" style={{ padding: profile?.userPhoto ? 0 : undefined }}>
              {profile?.userPhoto ? (
                <img src={getFileUrl(profile.userPhoto)} alt={profile.name} style={{ width: "100%", height: "100%", borderRadius: "inherit", objectFit: "cover" }} />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="lv-user-meta">
              <div className="lv-user-name">{profile?.name || userInfo.name || "User"}</div>
              <div className="lv-user-id">ID · {profile?.userId || userInfo.userId || "—"}</div>
            </div>
          </div>

          <div className="lv-header-right">
            {goldRate && (
              <div className="lv-ticker">
                <div className="lv-ticker-label">
                  <span className="lv-live-dot" />
                  LIVE · GOLD/G
                </div>
                <div className="lv-ticker-price">₹{goldRate.toLocaleString()}</div>
              </div>
            )}
            <button className="lv-iconbtn" onClick={toggleDark} title={dark ? "Light" : "Dark"}>
              {dark ? "☀" : "◐"}
            </button>
            <button className="lv-iconbtn" onClick={() => setMenuOpen(o => !o)}>⋮</button>

            {menuOpen && (
              <div className="lv-menu">
                {goldRate && (
                  <div className="lv-menu-rate">
                    <div className="lv-menu-rate-label">TODAY'S GOLD RATE</div>
                    <div className="lv-menu-rate-val">₹{goldRate.toLocaleString()}/g</div>
                  </div>
                )}
                <button className="lv-menu-item" onClick={() => { toggleDark(); setMenuOpen(false); }}>
                  <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{dark ? "☀" : "◐"}</span>
                  {dark ? "Light Mode" : "Dark Mode"}
                </button>
                <button className="lv-menu-item" onClick={() => { setMenuOpen(false); setShowProfile(true); }}>
                  <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>⚙️</span>
                  Profile Settings
                </button>
                <button className="lv-menu-item" onClick={() => { setMenuOpen(false); setShowShopDetails(true); }}>
                  <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>🏪</span>
                  Shop Details
                </button>
                <button className="lv-menu-item" onClick={() => { setMenuOpen(false); handleLogout(); }}>
                  <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>⏻</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile dropdown overlay */}
      {menuOpen && (
        <div className="lv-menu-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <main className="lv-main">

        {/* Error banner */}
        {fetchError && (
          <div className="lv-error">
            <span className="lv-error-icon">⚠</span>
            <div className="lv-error-body">
              <div className="lv-error-title">Connection Issue</div>
              <div className="lv-error-msg">{fetchError}</div>
            </div>
            <button className="lv-error-btn" onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {/* Welcome */}
        <section className="lv-welcome">
          <div className="lv-eyebrow">YOUR PRIVATE VAULT</div>
          <h1 className="lv-greeting">
            Welcome back,<br />
            <span className="lv-name">{displayName}.</span>
          </h1>
          <div className="lv-date">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </section>

        {/* Hero — gold rate */}
        <section className="lv-hero">
          <div className="lv-hero-top">
            <div>
              <div className="lv-hero-label">
                <span className="lv-live-dot" />
                TODAY'S GOLD RATE · SET BY YOUR SHOP
              </div>
              {goldRate ? (
                <div className="lv-hero-price">
                  <span className="lv-hero-rupee lv-shimmer">₹</span>
                  <span className="lv-shimmer">{goldRate.toLocaleString()}</span>
                  <span className="lv-hero-unit">per gram</span>
                </div>
              ) : (
                <div className="lv-hero-empty">Rate not set today</div>
              )}
              {goldRateData?.updatedAt && (
                <div className="lv-hero-updated">
                  Updated · {new Date(goldRateData.updatedAt).toLocaleString("en-IN", {
                    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="lv-hero-qtys">
            {[1, 5, 10].map(g => (
              <div className="lv-qty" key={g}>
                <div className="lv-qty-label">{g}g</div>
                <div className="lv-qty-val">
                  {goldRate ? `₹${(goldRate * g).toLocaleString()}` : "—"}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats grid */}
        <section className="lv-stats">
          {[
            {
              label: "TOTAL GOLD SAVED", value: `${totalGrams}g`,
              sub: goldRate ? `≈ ₹${(parseFloat(totalGrams) * goldRate).toLocaleString()}` : "Current value",
              icon: "◆", iconBg: "rgba(232,185,72,0.14)", iconColor: "var(--gold-bright)", valueColor: "var(--gold-bright)"
            },
            {
              label: "ACTIVE SCHEMES", value: activeSchemes, sub: "Currently running",
              icon: "◈", iconBg: "rgba(59,130,246,0.14)", iconColor: "#60A5FA", valueColor: "#60A5FA"
            },
            {
              label: "TOTAL AMOUNT PAID", value: `₹${totalPaid.toLocaleString()}`,
              sub: `${payments.filter(p => p.status === "paid").length} payments made`,
              icon: "₹", iconBg: "rgba(34,211,170,0.14)", iconColor: "var(--green)", valueColor: "var(--green)"
            },
            {
              label: "NEXT DUE", value: nextDue ? `₹${nextDue.amount?.toLocaleString()}` : "All Clear",
              sub: nextDue ? `Month ${nextDue.monthNumber}` : "No pending dues",
              icon: nextDue ? "⏳" : "✓",
              iconBg: nextDue ? "rgba(245,158,11,0.14)" : "rgba(34,211,170,0.14)",
              iconColor: nextDue ? "var(--amber)" : "var(--green)",
              valueColor: nextDue ? "var(--amber)" : "var(--green)"
            },
          ].map((s, i) => (
            <article key={s.label} className="lv-stat" style={{ animationDelay: `${0.2 + i * 0.08}s` }}>
              <div className="lv-stat-head">
                <div className="lv-stat-label">{s.label}</div>
                <div className="lv-stat-icon" style={{ background: s.iconBg, color: s.iconColor }}>{s.icon}</div>
              </div>
              <div className="lv-stat-value" style={{ color: s.valueColor }}>{s.value}</div>
              <div className="lv-stat-sub">{s.sub}</div>
            </article>
          ))}
        </section>

        {/* Tabs */}
        <nav className="lv-tabs">
          {[
            { id: "schemes", label: "My Schemes" },
            { id: "browse", label: "Browse Plans" },
            { id: "payments", label: "Payment History" },
            { id: "past_chits", label: "Past Chits" },
          ].map(t => (
            <button key={t.id}
              className={`lv-tab ${activeTab === t.id ? "active" : ""}`}
              onClick={() => { setActiveTab(t.id); if (t.id === "payments" || t.id === "past_chits") setHistoryChitId(null); }}>
              {t.label}
            </button>
          ))}
        </nav>

        {/* MY SCHEMES */}
        {activeTab === "schemes" && (
          <div className="lv-schemes">
            {activeChits.length === 0 ? (
              <div className="lv-empty-state" style={{ animation: "fadeUp 0.6s both", textAlign: "center", padding: "60px 20px" }}>
                <div className="lv-empty-icon" style={{ fontSize: 64, marginBottom: 20 }}>💰</div>
                <h2 className="lv-empty-title" style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: "var(--text)", marginBottom: 12 }}>Your Vault is Empty</h2>
                <p className="lv-empty-sub" style={{ color: "var(--text-dim)", maxWidth: 440, margin: "0 auto 32px", lineHeight: 1.6 }}>
                  You haven't joined any gold schemes yet. Start your journey today and secure your future with gold.
                </p>
                <button className="lv-btn-primary" onClick={() => setActiveTab("browse")} style={{ padding: "16px 32px", borderRadius: 14, background: "var(--gold-bright)", color: "#000", fontWeight: 800, border: "none", cursor: "pointer", boxShadow: "0 10px 25px rgba(232,185,72,0.3)" }}>
                  Browse Investment Plans →
                </button>
              </div>
            ) : activeChits.map((s, i) => {
              const isType2 = s.planType === "Type2";
              const totalInstallments = (s.totalMonths || 13) - 1;
              const pct = Math.min(100, Math.round(((s.currentMonth || 0) / totalInstallments) * 100));
              const goldValue = goldRate ? (s.totalGramsAccumulated * goldRate) : 0;
              return (
                <article key={s._id} className="lv-scheme" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                  <div className="lv-scheme-head">
                    <div className="lv-scheme-headL">
                      <div className="lv-scheme-tags">
                        <span className="lv-scheme-id">{s.schemeId}</span>
                        <Badge status={s.status} />
                      </div>

                      <div className="lv-scheme-label">MONTHLY COMMITMENT</div>
                      <div className="lv-scheme-monthly">₹{(s.monthlyAmount || 0).toLocaleString()}</div>

                      <div className="lv-stat-group" style={{ marginTop: 20 }}>
                        <div className="lv-scheme-label">{isType2 ? "CASH VALUE ACCUMULATED" : "GOLD ACCUMULATED"}</div>
                        <div className="lv-scheme-gold lv-shimmer" style={{ fontSize: isType2 ? 32 : 36, color: isType2 ? "var(--text)" : "var(--gold-bright)" }}>
                          {isType2 ? `₹${(s.totalAmountAccumulated || 0).toLocaleString()}` : `${(s.totalGramsAccumulated || 0).toFixed(3)}g`}
                        </div>
                        {!isType2 && goldRate && (
                          <div className="lv-scheme-gold-em" style={{ fontSize: 14 }}>≈ ₹{goldValue.toLocaleString()}</div>
                        )}
                        {isType2 && s.totalGramsAccumulated > 0 && (
                          <div className="lv-scheme-gold-em" style={{ color: "var(--green)", fontWeight: 700 }}>✓ Conversion Ready: {s.totalGramsAccumulated.toFixed(3)}g</div>
                        )}
                      </div>

                      <div className="lv-scheme-actions">
                        <button className="lv-btn-pay" onClick={() => handlePayClick(s)}>
                          <span>₹</span> Pay Now
                        </button>
                        <button className="lv-btn-ghost" onClick={() => setScheduleScheme(s)}>
                          <span>📅</span> {s.totalMonths || 13}-Month Schedule
                        </button>
                      </div>
                    </div>

                    <ProgressRing value={s.currentMonth || 0} max={totalInstallments} />
                  </div>

                  <div className="lv-scheme-barmeta">
                    <span>Started · {s.startDate ? new Date(s.startDate).toLocaleDateString("en-IN") : "—"}</span>
                    <span>{pct}% complete</span>
                  </div>

                  <div className="lv-scheme-bar">
                    <div className="lv-scheme-bar-fill" style={{ width: `${pct}%` }} />
                  </div>

                  <div className="lv-scheme-stats">
                    {[
                      { label: "RATE AT START", value: `₹${(s.goldRateAtStart || 0).toLocaleString()}/g` },
                      { label: "SCHEME TYPE", value: isType2 ? "Currency Conversion" : "Gold Accumulation" },
                      { label: "TIME REMAINING", value: s.status === "complete" || (s.currentMonth || 0) >= totalInstallments ? "Complete" : `${totalInstallments - (s.currentMonth || 0)} months` },
                    ].map(f => (
                      <div key={f.label} className="lv-scheme-mini">
                        <div className="lv-scheme-mini-label">{f.label}</div>
                        <div className="lv-scheme-mini-val">{f.value}</div>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* PAST CHITS */}
        {activeTab === "past_chits" && (
          <div className="lv-schemes">
            {pastChits.length === 0 ? (
              <div className="lv-empty-state" style={{ animation: "fadeUp 0.6s both", textAlign: "center", padding: "60px 20px" }}>
                <div className="lv-empty-icon" style={{ fontSize: 64, marginBottom: 20 }}>📜</div>
                <h2 className="lv-empty-title" style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: "var(--text)", marginBottom: 12 }}>No Past Chits</h2>
                <p className="lv-empty-sub" style={{ color: "var(--text-dim)", maxWidth: 440, margin: "0 auto 32px", lineHeight: 1.6 }}>
                  You don't have any closed or matured chits yet. Once a scheme is completed or settled, it will appear here.
                </p>
              </div>
            ) : pastChits.map((s, i) => {
              const isType2 = s.planType === "Type2";
              const totalPaidAmt = payments
                .filter(p => p.status === "paid" && p.scheme?._id === s._id)
                .reduce((sum, p) => sum + p.amount, 0);
              
              const startD = s.startDate ? new Date(s.startDate).toLocaleDateString("en-IN") : "—";
              const closeD = (s.completionDate || s.earlyExitDate || s.updatedAt) 
                ? new Date(s.completionDate || s.earlyExitDate || s.updatedAt).toLocaleDateString("en-IN") 
                : "—";

              return (
                <article key={s._id} className="lv-scheme" style={{ animationDelay: `${0.1 + i * 0.1}s`, borderLeft: "4px solid var(--gold-bright)" }}>
                  <div className="lv-scheme-head" style={{ marginBottom: 0 }}>
                    <div className="lv-scheme-headL" style={{ width: "100%" }}>
                      <div className="lv-scheme-tags">
                        <span className="lv-scheme-id">{s.schemeId}</span>
                        <span className="lv-badge" style={{ 
                          background: s.status === "complete" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", 
                          color: s.status === "complete" ? "var(--green)" : "var(--gold-bright)",
                          fontSize: "12px",
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: "20px",
                          textTransform: "uppercase"
                        }}>
                          {s.status === "complete" ? "Matured" : "Closed / Early Exit"}
                        </span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "24px", marginTop: "20px" }}>
                        <div>
                          <div className="lv-scheme-label">TOTAL AMOUNT PAID</div>
                          <div className="lv-scheme-monthly" style={{ fontSize: 28, color: "var(--text)" }}>₹{totalPaidAmt.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="lv-scheme-label">{isType2 ? "CASH VALUE ACCUMULATED" : "TOTAL GOLD SAVED"}</div>
                          <div className="lv-scheme-gold" style={{ fontSize: 28, color: isType2 ? "var(--text)" : "var(--gold-bright)" }}>
                            {isType2 ? `₹${(s.totalAmountAccumulated || 0).toLocaleString()}` : `${(s.totalGramsAccumulated || 0).toFixed(3)}g`}
                          </div>
                        </div>
                        <div>
                          <div className="lv-scheme-label">START DATE</div>
                          <div style={{ fontSize: 18, color: "var(--text)", fontWeight: 600, marginTop: 4 }}>{startD}</div>
                        </div>
                        <div>
                          <div className="lv-scheme-label">CLOSURE DATE</div>
                          <div style={{ fontSize: 18, color: "var(--text)", fontWeight: 600, marginTop: 4 }}>{closeD}</div>
                        </div>
                      </div>

                      <div className="lv-scheme-actions" style={{ marginTop: "24px" }}>
                        <button className="lv-btn-pay" onClick={() => downloadPastChit(s)} style={{ background: "linear-gradient(135deg, #1e1b18 0%, #3a3227 100%)", border: "1px solid var(--gold-bright)", color: "var(--gold-bright)", padding: "12px 24px", borderRadius: "12px", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>📥</span> Download Statement
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* BROWSE PLANS */}
        {activeTab === "browse" && (
          <div>
            {/* Approved chit notification — shown when a request was recently approved */}
            {joinRequests.some(r => r.status === "approved") && (
              <div style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
                marginBottom: 18, borderRadius: 14,
                background: "linear-gradient(135deg, rgba(34,211,170,0.12), rgba(34,211,170,0.04))",
                border: "1px solid rgba(34,211,170,0.3)",
                animation: "fadeUp 0.5s ease both"
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>🎉</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: "var(--green)", fontSize: 14, marginBottom: 2 }}>Chit Approved &amp; Active!</div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)" }}>Your chit enrollment has been approved. View it in My Schemes.</div>
                </div>
                <button
                  onClick={() => setActiveTab("schemes")}
                  style={{
                    padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer",
                    background: "var(--green)", color: "#0D1327", fontWeight: 700, fontSize: 12,
                    flexShrink: 0, whiteSpace: "nowrap"
                  }}
                >
                  View My Schemes →
                </button>
              </div>
            )}

            <div className="lv-browse-head">
              <div className="lv-browse-title">Predefined Schemes</div>
              <div className="lv-browse-sub">Choose a scheme logic and set your monthly contribution.</div>
            </div>

            <div className="lv-scheme-card-grid">
              {/* Card 1: Scheme 1 */}
              <div
                className={`lv-scheme-card ${selectedSchemeType === "Type1" ? "active" : ""}`}
                onClick={() => setSelectedSchemeType("Type1")}
              >
                <div>
                  <div className="lv-scheme-card-icon">💰</div>
                  <div className="lv-scheme-card-title">Scheme 1</div>
                  <div className="lv-scheme-card-desc">
                    <b>Monthly Gold Accumulation</b>. Every month you pay, gold is credited to your account based on that day's gold rate. You can redeem the total gold at the end of the term.
                  </div>
                </div>
              </div>

              {/* Card 2: Scheme 2 */}
              <div
                className={`lv-scheme-card ${selectedSchemeType === "Type2" ? "active" : ""}`}
                onClick={() => setSelectedSchemeType("Type2")}
              >
                <div>
                  <div className="lv-scheme-card-icon">🏗️</div>
                  <div className="lv-scheme-card-title">Scheme 2</div>
                  <div className="lv-scheme-card-desc">
                    <b>Final Currency Conversion</b>. Accumulate your monthly payments in cash value. At the end of the term, the total amount is converted to gold at the final rate, including a bonus month benefit.
                  </div>
                </div>
              </div>
            </div>

            {selectedSchemeType && (
              <div style={{ maxWidth: 800, margin: "40px auto" }} ref={plansRef}>
                {/* 2) Available Plans (Hierarchical) */}
                {categoryPlans.length > 0 && (
                  <div style={{ marginBottom: 40 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 }}>Available {selectedSchemeType === "Type1" ? "Scheme 1" : "Scheme 2"} Plans</div>
                    <div style={{ display: "grid", gap: 16 }}>
                      {categoryPlans.map(p => (
                        <div key={p._id} className="lv-plan" style={{ opacity: 1, animation: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{p.name}</div>
                            <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                              ₹{p.monthlyAmount.toLocaleString()} / month · {p.duration} Months {p.bonusDetails && `· ${p.bonusDetails}`}
                            </div>
                          </div>
                          <button
                            className="lv-btn-gold"
                            style={{ padding: "8px 24px", minWidth: 100 }}
                            onClick={() => setChitWizard({
                              step: 1,
                              schemeType: selectedSchemeType,
                              form: { monthlyAmount: p.monthlyAmount.toString(), startDate: "", endDate: "" },
                              terms: null, termsAgreed: false, file: null, utrNumber: "", submitting: false, error: null, requestId: null
                            })}
                          >
                            Join Plan
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3) The Create Button (Custom Amount) */}
                <div style={{ textAlign: "center", marginBottom: 40, padding: 32, background: "var(--surface)", border: "1px dashed var(--line-strong)", borderRadius: 20 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Want a custom amount?</div>
                  <div style={{ fontSize: 13, color: "var(--text-mute)", marginBottom: 20 }}>Set your own monthly contribution and start saving.</div>
                  <button
                    className="lv-btn-submit"
                    style={{ padding: "14px 40px", borderRadius: 100, fontSize: 15, fontWeight: 700, cursor: "pointer" }}
                    onClick={() => setChitWizard({ step: 1, schemeType: selectedSchemeType, form: { monthlyAmount: "", startDate: "", endDate: "" }, terms: null, termsAgreed: false, file: null, utrNumber: "", submitting: false, error: null, requestId: null })}
                  >
                    ✨ Create Custom {selectedSchemeType === "Type1" ? "Scheme 1" : "Scheme 2"} Chit →
                  </button>
                </div>

                {/* 4) List all pending/rejected requests for this type */}
                <div style={{ borderTop: "1px solid var(--line)", paddingTop: 32 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-mute)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16, textAlign: "center" }}>Recent Requests</div>
                  {joinRequests
                    .filter(r => r.planType === selectedSchemeType && r.status !== "approved")
                    .map(r => {
                      const isAwaitingPayment = r.status === "awaiting_payment";
                      const isVerified = r.status === "payment_verified";
                      const isRejected = r.status === "rejected";

                      if (isRejected) {
                        return (
                          <div key={r._id} style={{ maxWidth: 520, margin: "24px auto", padding: "24px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 20, textAlign: "center", marginBottom: 20 }}>
                            <div style={{ fontSize: 32, marginBottom: 12 }}>❌</div>
                            <div style={{ fontWeight: 800, color: "#EF4444", fontSize: 18, marginBottom: 8 }}>Request Rejected</div>
                            <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5, marginBottom: 16 }}>
                              Enrollment for {selectedSchemeType === "Type1" ? "Scheme 1" : "Scheme 2"} (₹{r.monthlyAmount}) was rejected.
                              {r.adminNote && <div style={{ marginTop: 8, fontStyle: "italic" }}>"{r.adminNote}"</div>}
                            </div>
                            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                              <button
                                className="lv-btn-ghost"
                                style={{ padding: "8px 16px", fontSize: 12 }}
                                onClick={() => setChitWizard({ step: 1, schemeType: selectedSchemeType, form: { monthlyAmount: r.monthlyAmount, startDate: "", endDate: "" }, terms: null, termsAgreed: false, file: null, utrNumber: "", submitting: false, error: null, requestId: null })}
                              >
                                Try Again
                              </button>
                              <button
                                onClick={() => handleDeleteRequest(r._id)}
                                style={{ background: "transparent", color: "var(--text-mute)", border: "none", fontSize: 12, textDecoration: "underline", cursor: "pointer" }}
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={r._id} style={{ maxWidth: 520, margin: "20px auto", padding: "18px 24px", background: "var(--surface)", border: "1px solid var(--line-strong)", borderRadius: 18, textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", marginBottom: 16 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8 }}>
                            <span style={{ fontSize: 24 }}>{isAwaitingPayment ? "💳" : isVerified ? "✅" : "⏳"}</span>
                            <span style={{ fontWeight: 700, color: "var(--text)", fontSize: 16 }}>
                              {isAwaitingPayment ? "Payment Pending" : isVerified ? "Payment Verified!" : "Request Pending"}
                            </span>
                          </div>
                          <div style={{ fontSize: 13, color: "var(--text-mute)", marginBottom: 12 }}>
                            {selectedSchemeType === "Type1" ? "Scheme 1" : "Scheme 2"} · ₹{r.monthlyAmount}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.4, marginBottom: 16 }}>
                            {isAwaitingPayment
                              ? "Admin is verifying your proof. activation soon."
                              : isVerified
                                ? "Payment verified! Final activation in progress."
                                : "Waiting for admin review."
                            }
                          </div>
                          <button
                            onClick={() => handleDeleteRequest(r._id)}
                            style={{ background: "transparent", color: "var(--text-mute)", border: "none", fontSize: 11, textDecoration: "underline", cursor: "pointer" }}
                          >
                            Cancel Request
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PAYMENT HISTORY */}
        {activeTab === "payments" && (
          <div className="lv-payments">
            <div className="lv-payments-title">Payment History</div>

            {/* 1) List of Chits (Always visible when tab is active) */}
            {schemes.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "var(--text-mute)" }}>
                <div style={{ fontSize: 44, marginBottom: 12, fontFamily: "'Fraunces',serif", color: "var(--gold)" }}>💰</div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
                  No Chits Found
                </div>
                <div style={{ fontSize: 13 }}>You are not enrolled in any schemes yet.</div>
              </div>
            ) : (
              <div className="lv-tbl-wrap">
                <table className="lv-tbl">
                  <thead>
                    <tr>
                      <th>Scheme ID</th>
                      <th>Started On</th>
                      <th>Monthly Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schemes.map(s => (
                      <tr key={s._id}>
                        <td className="lv-mono" style={{ color: "var(--text)", fontWeight: 600 }}>{s.schemeId}</td>
                        <td className="lv-mono">{s.startDate ? new Date(s.startDate).toLocaleDateString("en-IN") : "—"}</td>
                        <td className="lv-mono" style={{ color: "var(--gold)" }}><b>₹{(s.monthlyAmount || 0).toLocaleString()}</b></td>
                        <td>
                          <button
                            className="lv-btn-ghost"
                            onClick={() => {
                              setHistoryChitId(s._id);
                              const TEN_MIN = 10 * 60 * 1000;
                              const hasEditable = payments.some(p => {
                                if ((p.scheme?._id || p.scheme) !== s._id || p.status !== "paid") return false;
                                const t = p.screenshotUploadedAt || p.paidDate || p.createdAt;
                                return t && (Date.now() - new Date(t).getTime()) < TEN_MIN;
                              });
                              setHistoryFilter(hasEditable ? "pending" : "paid");
                            }}
                            style={{ padding: "6px 14px", fontSize: 11 }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 2) Detailed View Modal for Selected Chit */}
        {historyChitId && (
          <div className="lv-modal-backdrop" onClick={() => setHistoryChitId(null)}>
            <div className="lv-pay-modal" style={{ maxWidth: 800 }} onClick={e => e.stopPropagation()}>
              <div className="lv-pay-head">
                <div className="lv-pay-head-row">
                  <div>
                    <div className="lv-pay-eyebrow">
                      <span className="lv-live-dot" />
                      Detailed History
                    </div>
                    <div className="lv-pay-title">Payment Breakdown</div>
                  </div>
                  <button className="lv-modal-close" onClick={() => setHistoryChitId(null)}>✕</button>
                </div>
              </div>

              <div style={{ padding: "24px" }}>
                {/* Sub-tabs: Pending, Paid, Upcoming, Due */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                  {[
                    { id: "pending", label: "Pending" },
                    { id: "paid", label: "Paid" },
                    { id: "upcoming", label: "Upcoming" },
                    { id: "due", label: "Due" },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setHistoryFilter(f.id)}
                      style={{
                        padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                        fontWeight: 600, fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                        border: historyFilter === f.id ? "1px solid var(--gold)" : "1px solid var(--line)",
                        background: historyFilter === f.id ? "var(--gold-glow)" : "transparent",
                        color: historyFilter === f.id ? "var(--gold-bright)" : "var(--text-mute)",
                        transition: "all 0.2s"
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {(() => {
                  const now = new Date();
                  const schemePayments = payments.filter(p => p.scheme?._id === historyChitId);

                  if (historyFilter === "pending") {
                    const TEN_MIN = 10 * 60 * 1000;
                    const pendingPayments = schemePayments.filter(p => {
                      if (p.status !== "paid") return false;
                      const submittedAt = p.screenshotUploadedAt || p.paidDate || p.createdAt;
                      return submittedAt && (Date.now() - new Date(submittedAt).getTime()) < TEN_MIN;
                    });
                    if (pendingPayments.length === 0) {
                      return (
                        <div style={{ textAlign: "center", padding: 40, color: "var(--text-mute)" }}>
                          <div style={{ fontSize: 13 }}>No pending payments for this scheme.</div>
                        </div>
                      );
                    }
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {pendingPayments.map(p => (
                          <PendingPaymentCard
                            key={p._id}
                            payment={p}
                            token={token}
                            onEdited={() => { refreshProfile(); }}
                            editProofPayment={editProofPayment}
                            setEditProofPayment={setEditProofPayment}
                            API={API}
                          />
                        ))}
                      </div>
                    );
                  }

                  const filteredPayments = schemePayments.filter(p => {
                    if (historyFilter === "paid") {
                      return p.status === "paid";
                    } else if (historyFilter === "upcoming") {
                      if (p.status === "paid") return false;
                      const schemeStart = p.scheme?.startDate ? new Date(p.scheme.startDate) : null;
                      if (!schemeStart) return false;
                      const dueDate = new Date(schemeStart);
                      dueDate.setMonth(schemeStart.getMonth() + p.monthNumber - 1);
                      return dueDate > now;
                    } else if (historyFilter === "due") {
                      if (p.status === "paid" || p.status === "awaiting_verification") return false;
                      const schemeStart = p.scheme?.startDate ? new Date(p.scheme.startDate) : null;
                      if (!schemeStart) return true;
                      const dueDate = new Date(schemeStart);
                      dueDate.setMonth(schemeStart.getMonth() + p.monthNumber - 1);
                      return dueDate <= now;
                    }
                    return true;
                  });

                  return filteredPayments.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 40, color: "var(--text-mute)" }}>
                      <div style={{ fontSize: 13 }}>No payments found in this category.</div>
                    </div>
                  ) : (
                    <div className="lv-tbl-wrap">
                      <table className="lv-tbl">
                        <thead>
                          <tr>
                            <th>Month</th>
                            <th>Amount</th>
                            {historyFilter === "paid" && <th>Gold</th>}
                            {historyFilter === "paid" && <th>Rate</th>}
                            {historyFilter === "paid" && <th>Date Paid</th>}
                            {(historyFilter === "upcoming" || historyFilter === "due") && <th>Due Date</th>}
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPayments.map(p => {
                            let dueStr = "—";
                            if (p.scheme?.startDate) {
                              const dDate = new Date(p.scheme.startDate);
                              dDate.setMonth(dDate.getMonth() + p.monthNumber - 1);
                              dueStr = dDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
                            }
                            return (
                              <tr key={p._id}>
                                <td className="lv-mono" style={{ color: "var(--text)", fontWeight: 600 }}>M{p.monthNumber}</td>
                                <td className="lv-mono" style={{ color: "var(--text)" }}><b>₹{(p.amount || 0).toLocaleString()}</b></td>
                                {historyFilter === "paid" && (
                                  <td className="lv-mono lv-gold-text">
                                    {p.gramsAdded ? `${p.gramsAdded}g` : "—"}
                                  </td>
                                )}
                                {historyFilter === "paid" && (
                                  <td className="lv-mono">
                                    {p.goldRateOnPaymentDay ? `₹${p.goldRateOnPaymentDay.toLocaleString()}/g` : "—"}
                                  </td>
                                )}
                                {historyFilter === "paid" && (
                                  <td className="lv-mono">
                                    {p.paidDate ? new Date(p.paidDate).toLocaleDateString("en-IN") : "—"}
                                  </td>
                                )}
                                {(historyFilter === "upcoming" || historyFilter === "due") && (
                                  <td className="lv-mono" style={{ color: "var(--text-dim)" }}>
                                    {dueStr}
                                  </td>
                                )}
                                <td>
                                  <Badge status={historyFilter === "due" && p.status === "pending" ? "due" : p.status} />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}