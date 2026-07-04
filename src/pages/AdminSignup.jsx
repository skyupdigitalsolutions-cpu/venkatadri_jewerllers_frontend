import { useState, useEffect } from "react";
import TermsModal from "./components/TermsModal";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideInLeft { from { opacity:0; transform:translateX(-40px); } to { opacity:1; transform:translateX(0); } }
  @keyframes slideInRight { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
  @keyframes float1 { 0%,100%{transform:translateY(0)translateX(0)} 33%{transform:translateY(-18px)translateX(8px)} 66%{transform:translateY(10px)translateX(-6px)} }
  @keyframes float2 { 0%,100%{transform:translateY(0)translateX(0)} 50%{transform:translateY(-24px)translateX(-12px)} }
  @keyframes float3 { 0%,100%{transform:translateY(0)rotate(0deg)} 50%{transform:translateY(-14px)rotate(180deg)} }
  @keyframes pulse  { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.1);opacity:1} }
  @keyframes particleDrift { 0%{transform:translateY(0)translateX(0);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translateY(-130px)translateX(15px);opacity:0} }
  @keyframes borderGlow { 0%,100%{box-shadow:0 0 0 3px rgba(26,127,212,.13)} 50%{box-shadow:0 0 0 4px rgba(26,127,212,.25)} }
  @keyframes badgePop { 0%{transform:scale(.8);opacity:0} 60%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
  @keyframes codePop { 0%{transform:scale(.9);opacity:0} 60%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }

  .al-page { min-height:100vh; display:flex; flex-direction:column; font-family:'DM Sans',sans-serif; background:#F8FAFC; overflow-x:hidden; }
  
  .al-mobile-header { order:-1; width:100%; height:120px; background:linear-gradient(160deg,#060D1A 0%,#0F1D36 100%); display:flex; align-items:center; justify-content:flex-start; padding-left:24px; position:relative; overflow:hidden; border-bottom:1px solid rgba(255,255,255,0.08); }
  @media(min-width:768px){ .al-mobile-header { display:none; } }

  .al-mobile-header::before {
    content:''; position:absolute; inset:0;
    background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 24px 24px;
    pointer-events:none;
  }

  .al-left { order:2; width:100%; min-height:auto; background:linear-gradient(160deg,#060F1E 0%,#0B1F3E 45%,#162D52 100%); display:flex; flex-direction:column; padding:32px 24px; position:relative; overflow:hidden; }
  
  @media(min-width:768px) {
    .al-page { flex-direction:row; }
    .al-left { order:unset; width:44%; min-height:100vh; padding:44px 48px; border-right:1px solid rgba(255,255,255,0.05); }
  }

  /* Professional Entrance Animations */
  @keyframes fadeSlideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  
  .al-stagger-in > * { animation: fadeSlideUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .al-stagger-in > *:nth-child(1) { animation-delay: 0.1s; }
  .al-stagger-in > *:nth-child(2) { animation-delay: 0.2s; }
  .al-stagger-in > *:nth-child(3) { animation-delay: 0.3s; }
  .al-stagger-in > *:nth-child(4) { animation-delay: 0.4s; }
  .al-stagger-in > *:nth-child(5) { animation-delay: 0.5s; }

  .al-orb1{position:absolute;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(26,127,212,0.1) 0%,transparent 70%);top:-80px;right:-80px;pointer-events:none;animation:float1 12s ease-in-out infinite}
  .al-orb2{position:absolute;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(212,160,23,0.08) 0%,transparent 70%);bottom:-40px;left:-60px;pointer-events:none;animation:float2 15s ease-in-out infinite}
  
  @media(min-width:768px) {
    .al-orb1 { width:360px; height:360px; }
    .al-orb2 { width:280px; height:280px; bottom:60px; }
  }

  .al-particle{position:absolute;border-radius:50%;background:rgba(255,255,255,0.2);pointer-events:none;animation:particleDrift linear infinite}
  
  .al-logo { position:relative; z-index:2; padding:8px; }
  @media(max-width:767px){ .al-logo { display:none; } }

  .al-logo-m { position:relative; z-index:2; margin-bottom: 4px; }

  .al-logo-inner{display:flex;align-items:center;gap:14px}
  .al-logo-placeholder{ 
    width:42px; height:42px; border-radius:12px; 
    background:linear-gradient(135deg,rgba(255,255,255,0.1) 0%,rgba(255,255,255,0.2) 50%,rgba(255,255,255,0.1) 100%);
    background-size: 200% 100%;
    animation: shimmer 3s infinite linear;
    display:flex; align-items:center; justify-content:center;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.1);
  }
  .al-logo-img { width:100%; height:100%; object-fit:contain; }

  @media(min-width:768px){ .al-logo-placeholder { width:52px; height:52px; border-radius:14px; } }

  .al-logo-text .name{font-family:'Sora',sans-serif;font-size:18px;font-weight:700;color:#fff;letter-spacing:.5px;line-height:1.1}
  @media(min-width:768px){ .al-logo-text .name { font-size:20px; } }

  .al-logo-text .sub{font-size:9px;color:rgba(255,255,255,0.5);letter-spacing:3px;text-transform:uppercase;margin-top:4px;font-weight:600}
  @media(min-width:768px){ .al-logo-text .sub { font-size:10px; letter-spacing:3.5px; } }

  .al-center{position:relative;z-index:2; margin-top:20px}
  @media(min-width:768px){ .al-center { margin-top:0; } }

  .al-tagline{font-family:'Sora',sans-serif;font-size:24px;font-weight:800;color:#fff;line-height:1.2;margin-bottom:12px;letter-spacing:-.8px; animation: fadeSlideUp 0.8s 0.2s both; }
  @media(min-width:768px){ .al-tagline { font-size:32px; margin-bottom:16px; } }

  .al-tagline span{color:#F5C842}
  .al-tagline-sub{font-size:13px;color:rgba(255,255,255,0.6);line-height:1.65;max-width:300px; animation: fadeSlideUp 0.8s 0.3s both; }
  @media(min-width:768px){ .al-tagline-sub { font-size:14px; line-height:1.75; } }

  .al-stats { display:flex; gap:12px; margin-top:24px; flex-wrap:wrap; animation: fadeSlideUp 0.8s 0.4s both; }
  .al-stat { background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.13); border-radius:12px; padding:10px 16px; backdrop-filter:blur(6px); transition:all 0.25s ease; cursor:default; }
  .al-stat:hover { transform:translateY(-3px); background:rgba(255,255,255,.12); border-color:rgba(255,255,255,0.2); }
  .al-stat-val { font-family:'Sora',sans-serif; font-size:18px; font-weight:700; color:#F5C842; }
  .al-stat-lbl { font-size:10px; color:rgba(255,255,255,.52); margin-top:2px; letter-spacing:.4px; }

  .al-divider-line { width:100%; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent); margin:24px 0; animation: fadeSlideUp 0.8s 0.5s both; }
  .al-trust { display:flex; gap:20px; flex-wrap:wrap; animation: fadeSlideUp 0.8s 0.6s both; }
  .al-trust-item { display:flex; align-items:center; gap:8px; font-size:11.5px; color:rgba(255,255,255,.4); }
  .al-trust-dot { width:6px; height:6px; border-radius:50%; background:#F5C842; opacity:.6; }
  
  .al-footer { position:relative; z-index:2; font-size:11.5px; color:rgba(255,255,255,.25); animation:fadeSlideUp 0.8s 0.7s both; padding-top:24px }

  .al-right { order:1; width:100%; flex:none; display:flex; align-items:center; justify-content:center; padding:40px 20px; animation:fadeSlideUp .7s cubic-bezier(.22,1,.36,1) both; overflow-y:visible; }
  @media(min-width:768px){
    .al-right { order:unset; flex:1; width:auto; padding:48px 52px; overflow-y:auto; }
  }

  .al-form-card { width:100%; max-width:440px; background:#fff; padding: 24px; border-radius:24px; box-shadow: 0 20px 50px rgba(0,0,0,0.04); }
  @media(min-width:768px){ .al-form-card { padding: 40px; } }
  
  .al-badge { display:inline-flex; align-items:center; gap:8px; background:#FEF9C3; border:1px solid rgba(255,200,0,0.25); border-radius:24px; padding:6px 18px; font-size:11px; font-weight:700; color:#854D0E; margin-bottom:24px; letter-spacing:1px; text-transform:uppercase }
  .al-badge-dot { width:7px; height:7px; border-radius:50%; background:#D4A017; animation:pulse 2s infinite; }
  
  @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; transform: scale(1.15); } 100% { opacity: 0.6; } }

  .al-title { font-family:'Sora',sans-serif; font-size:32px; font-weight:800; color:#0F172A; margin-bottom:8px; letter-spacing:-.8px }
  .al-subtitle { font-size:14.5px; color:#64748B; margin-bottom:32px; line-height:1.5 }
  
  .al-field { margin-bottom:20px; }
  .al-label { display:block; font-size:12.5px; font-weight:700; color:#475569; margin-bottom:8px; letter-spacing:.3px; text-transform:uppercase; }
  
  .al-input-wrap { position:relative; transition: transform .2s ease }
  .al-input-wrap:focus-within { transform: translateY(-1px); }
  .al-input-icon { position:absolute; left:16px; top:50%; transform:translateY(-50%); font-size:18px; color:#CBD5E1; pointer-events:none; transition:color .2s }
  .al-input-wrap:focus-within .al-input-icon { color:#1A7FD4; }
  
  .al-input { width:100%; padding:14px 16px 14px 50px; font-size:15px; font-family:'DM Sans',sans-serif; border:2px solid #F1F5F9; border-radius:16px; background:#F8FAFC; color:#0F172A; outline:none; transition:all .25s cubic-bezier(0.22, 1, 0.36, 1); }
  .al-input:focus { border-color:#1A7FD4; box-shadow:0 0 0 5px rgba(26,127,212,.08); background:#fff }
  .al-input.error { border-color:#EF4444; background:#FEF2F2 }
  
  .al-eye { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#CBD5E1; font-size:18px; padding:4px; transition:color .2s }
  .al-eye:hover { color:#1A7FD4; }
  
  .al-error { font-size:12px; color:#EF4444; margin-top:5px; }
  .al-alert { display:flex; align-items:center; gap:10px; padding:16px; margin-top:20px; border-radius:16px; background:#ECFDF5; color:#065F46; border:1px solid #A7F3D0; font-weight:600; animation:fadeSlideUp .45s ease both; }
  
  .al-submit { width:100%; padding:16px 0; font-size:15.5px; font-weight:700; font-family:'Sora',sans-serif; border:none; border-radius:16px; cursor:pointer; background:linear-gradient(135deg,#1A7FD4 0%,#0F5FA8 100%); color:#fff; letter-spacing:.5px; box-shadow:0 10px 25px rgba(26,127,212,.3); margin-top:24px; transition:all .25s ease; position:relative; overflow:hidden; }
  .al-submit:hover { box-shadow:0 12px 32px rgba(26,127,212,.42); transform:translateY(-2px); }
  .al-submit:active { transform:translateY(0) scale(.98); }
  .al-submit:disabled { opacity:.7; cursor:not-allowed; }

  /* Mobile Small (480px+) */
  @media(min-width:480px){
    .al-left { padding:40px 44px; }
    .al-right { padding:44px 48px; }
    .al-form-card { max-width:400px; }
  }

  /* Mobile Large / Tablet Small (640px+) */
  @media(min-width:640px){
    .al-left { width:42%; padding:42px 46px; }
    .al-right { padding:46px 50px; }
    .al-form-card { max-width:410px; }
    .al-stats { gap:14px; }
    .al-trust { gap:22px; }
  }

  /* Tablet / iPad (768px+) */
  @media(min-width:768px){
    .al-left { display:flex; width:44%; padding:44px 48px; }
    .al-right { width:auto; flex:1; padding:48px 52px; }
    .al-form-card { max-width:420px; }
    .al-title { font-size:30px; }
    .al-submit { font-size:15px; }
  }

  /* Laptop / Desktop (1024px+) */
  @media(min-width:1024px){
    .al-left { width:44%; padding:44px 48px; }
    .al-right { padding:48px 52px; }
    .al-form-card { max-width:420px; }
  }

  /* Large Monitors (1440px+) */
  @media(min-width:1440px){
    .al-left { width:42%; }
    .al-right { padding:52px 56px; }
    .al-form-card { max-width:440px; }
  }

  /* Ultra-wide / 4K (1920px+) */
  @media(min-width:1920px){
    .al-left { width:40%; }
    .al-right { padding:56px 60px; }
    .al-form-card { max-width:460px; }
  }

  /* Landscape Phones */
  @media(orientation:landscape) and (max-height:600px){
    .al-left { display:none; }
    .al-right { width:100%; min-height:100vh; padding:32px 24px 40px; animation:fadeUp .6s both; }
    .al-title { font-size:24px; }
    .al-submit { font-size:14px; padding:12px 0; }
    .al-form-card { max-width:100%; }
  }
`;

const PARTICLES = [
  { left: "12%", dur: "9s", delay: "0s", size: 3 },
  { left: "30%", dur: "13s", delay: "2s", size: 2 },
  { left: "52%", dur: "10s", delay: "4s", size: 4 },
  { left: "71%", dur: "15s", delay: "1s", size: 2 },
  { left: "85%", dur: "11s", delay: "6s", size: 3 },
];

const STATS = [
  { value: "2.4K+", label: "Active Loans" },
  { value: "98%", label: "Recovery Rate" },
  { value: "₹12Cr+", label: "Disbursed" },
];


const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
export default function AdminSignup({ onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [shopName, setShopName] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [shopCode, setShopCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Terms & Conditions
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  useEffect(() => {
    const id = "al-global-styles";
    if (!document.getElementById(id)) {
      const tag = document.createElement("style");
      tag.id = id; tag.textContent = GLOBAL_CSS;
      document.head.appendChild(tag);
    }
    return () => { const t = document.getElementById(id); if (t) t.remove(); };
  }, []);

  const validate = () => {
    const e = {};
    if (!name) e.name = "Name is required";
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.pass = "Password is required";
    else if (password.length < 6) e.pass = "Minimum 6 characters";
    if (!phone) e.phone = "Phone is required";
    else if (phone.length < 10) e.phone = "Enter valid 10-digit number";
    if (!shopName) e.shop = "Shop/Business name is required";
    if (!termsAgreed) e.terms = "You must agree to the Terms and Conditions";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, shopName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      // Show the shop code
      setShopCode(data.shopCode);
    } catch (err) {
      setErrors(p => ({ ...p, submit: err.message }));
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(shopCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="al-page">
      {/* Mobile-only header with logo */}
      <div className="al-mobile-header">
        <div className="al-logo-m">
          <div className="al-logo-inner">
            <div className="al-logo-placeholder" />
            <div className="al-logo-text">
              <div className="name">SkyUp Digital</div>
              <div className="sub">Solution</div>
            </div>
          </div>
        </div>
      </div>

      {/* Left panel */}
      <div className="al-left">
        <div className="al-orb1" /><div className="al-orb2" /><div className="al-orb3" />
        {PARTICLES.map((p, i) => (
          <div key={i} className="al-particle" style={{
            left: p.left, bottom: "0",
            width: p.size, height: p.size, animationDuration: p.dur, animationDelay: p.delay
          }} />
        ))}
        <div className="al-logo">
          <div className="al-logo-inner">
            <div className="al-logo-placeholder" />
            <div className="al-logo-text">
              <div className="name">SkyUp Digital</div>
              <div className="sub">Solution</div>
            </div>
          </div>
        </div>
        <div className="al-center">
          <div className="al-tagline">
            Register your <span>Gold Chit</span><br />Shop today
          </div>
          <div className="al-tagline-sub">
            Get your unique Shop Code and start managing your customers' gold savings scheme in minutes.
          </div>
          <div className="al-stats">
            {STATS.map(s => (
              <div className="al-stat" key={s.label}>
                <div className="al-stat-val">{s.value}</div>
                <div className="al-stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="al-divider-line" />
          <div className="al-trust">
            {["256-bit Encrypted", "ISO Certified", "RBI Compliant"].map(t => (
              <div className="al-trust-item" key={t}>
                <div className="al-trust-dot" />{t}
              </div>
            ))}
          </div>
        </div>
        <div className="al-footer">© 2025 SkyUp Digital Solution. All rights reserved.</div>
      </div>

      {/* Right panel */}
      <div className="al-right">
        <div className="al-form-card al-stagger-in">
          <div className="al-badge">
            <div className="al-badge-dot" />
            ADMIN REGISTRATION
          </div>

          {/* ── SUCCESS — show shop code ── */}
          {shopCode ? (
            <>
              <div className="al-title">🎉 Registration Done!</div>
              <div className="al-subtitle">Your unique Shop Code has been generated</div>

              <div className="shop-code-card">
                <div className="shop-code-label">Your Shop Code</div>
                <div className="shop-code-value">{shopCode}</div>
                <div className="shop-code-note">
                  Share this code with your customers.<br />
                  They will use it to register and send their<br />
                  approval request directly to your shop.
                </div>
                <button className="shop-code-copy" onClick={copyCode}>
                  {copied ? "✅ Copied!" : "📋 Copy Code"}
                </button>
              </div>

              <div style={{
                background: "#FFF8E8", border: "1px solid rgba(212,160,23,.3)",
                borderRadius: 12, padding: "14px 16px", marginBottom: 20,
                fontSize: 13, color: "#92400E", lineHeight: 1.7
              }}>
                <b>📌 Important:</b> Save this code safely.<br />
                Your login: <b>{email}</b><br />
                Use your password to log in as admin.
              </div>

              <button className="al-submit" onClick={onBack}>
                Go to Admin Login →
              </button>
            </>
          ) : (
            <>
              <div className="al-title">Create admin account</div>
              <div className="al-subtitle">Enter your details to get started</div>

              <div className="al-field f1">
                <label className="al-label">Full Name</label>
                <div className="al-input-wrap">
                  <span className="al-input-icon">👤</span>
                  <input
                    type="text"
                    autoComplete="name"
                    className={`al-input${errors.name ? " error" : ""}`}
                    placeholder="Your name" value={name}
                    onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }} />
                </div>
                {errors.name && <div className="al-error">⚠ {errors.name}</div>}
              </div>

              <div className="al-field f2">
                <label className="al-label">Shop / Business Name</label>
                <div className="al-input-wrap">
                  <span className="al-input-icon">🏬</span>
                  <input
                    type="text"
                    autoComplete="organization"
                    className={`al-input${errors.shop ? " error" : ""}`}
                    placeholder="e.g. Golden Jewels, Bangalore" value={shopName}
                    onChange={e => { setShopName(e.target.value); setErrors(p => ({ ...p, shop: "" })); }} />
                </div>
                {errors.shop && <div className="al-error">⚠ {errors.shop}</div>}
                <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 5 }}>
                  💡 Your Shop Code will be generated from this name
                </div>
              </div>

              <div className="al-field f3">
                <label className="al-label">Email Address</label>
                <div className="al-input-wrap">
                  <span className="al-input-icon">✉</span>
                  <input
                    type="email"
                    autoComplete="email"
                    className={`al-input${errors.email ? " error" : ""}`}
                    placeholder="admin@yourshop.com" value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }} />
                </div>
                {errors.email && <div className="al-error">⚠ {errors.email}</div>}
              </div>

              <div className="al-field f4">
                <label className="al-label">Phone Number</label>
                <div className="al-input-wrap">
                  <span className="al-input-icon">📞</span>
                  <input
                    type="tel"
                    autoComplete="tel"
                    inputMode="numeric"
                    className={`al-input${errors.phone ? " error" : ""}`}
                    placeholder="10-digit mobile number" value={phone}
                    maxLength={10}
                    onChange={e => { setPhone(e.target.value.replace(/\D/g, "")); setErrors(p => ({ ...p, phone: "" })); }} />
                </div>
                {errors.phone && <div className="al-error">⚠ {errors.phone}</div>}
              </div>

              <div className="al-field f5">
                <label className="al-label">Password</label>
                <div className="al-input-wrap">
                  <span className="al-input-icon">🔒</span>
                  <input
                    type={showPwd ? "text" : "password"}
                    autoComplete="new-password"
                    className={`al-input${errors.pass ? " error" : ""}`}
                    style={{ paddingRight: 44 }}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, pass: "" })); }} />
                  <button className="al-eye" onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? "🙈" : "👁"}
                  </button>
                </div>
                {errors.pass && <div className="al-error">⚠ {errors.pass}</div>}
              </div>

              {errors.submit && (
                <div className="al-error" style={{ marginTop: 12 }}>⚠ {errors.submit}</div>
              )}

              {/* ── Terms & Conditions agreement ── */}
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                padding: "14px 16px", background: termsAgreed ? "#ECFDF5" : "#F8FAFC",
                border: `1.5px solid ${termsAgreed ? "#A7F3D0" : errors.terms ? "#EF4444" : "#E2E8F0"}`,
                borderRadius: 14, marginTop: 18, marginBottom: 4,
                transition: "all 0.2s",
              }}>
                <input
                  type="checkbox"
                  id="admin-terms-cb"
                  checked={termsAgreed}
                  onChange={e => { setTermsAgreed(e.target.checked); setErrors(p => ({ ...p, terms: "" })); }}
                  style={{ width: 18, height: 18, flexShrink: 0, marginTop: 2, accentColor: "#1A7FD4", cursor: "pointer" }}
                />
                <label htmlFor="admin-terms-cb" style={{ flex: 1, fontSize: 13.5, color: "#334155", cursor: "pointer", lineHeight: 1.5 }}>
                  I have read and agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setTermsOpen(true)}
                    style={{
                      background: "none", border: "none", color: "#1A7FD4",
                      fontWeight: 700, cursor: "pointer", textDecoration: "underline",
                      fontFamily: "inherit", fontSize: 13.5, padding: 0,
                    }}
                  >
                    Terms and Conditions
                  </button>
                  {" "}of SkyUp Digital Solution.
                </label>
                {termsAgreed && <span style={{ fontSize: 18, flexShrink: 0 }}>✅</span>}
              </div>
              {errors.terms && (
                <div className="al-error" style={{ marginLeft: 4 }}>⚠ {errors.terms}</div>
              )}

              <button className="al-submit" onClick={handleSubmit} disabled={loading}>
                {loading ? "Creating account…" : "Register & Get Shop Code →"}
              </button>

              <div className="al-divider">
                <div className="al-divider-l" />
                <span className="al-divider-t">Already have an account?</span>
                <div className="al-divider-l" />
              </div>
              <button className="al-user-btn" onClick={onBack}>
                Back to Admin Sign In →
              </button>

              <div className="al-footer-note">
                🔐 Secure signup · Powered by SkyUp Digital Solution
              </div>
            </>
          )}
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      <TermsModal
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        mode="admin-agree"
        onAgree={() => {
          setTermsAgreed(true);
          setTermsOpen(false);
          setErrors(p => ({ ...p, terms: "" }));
        }}
      />
    </div>
  );
}