import { useState, useEffect, useRef } from "react";
import TermsModal from "./components/TermsModal";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideInLeft { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideInRight { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
  @keyframes float1 { 0%,100%{transform:translateY(0)translateX(0)} 33%{transform:translateY(-18px)translateX(8px)} 66%{transform:translateY(10px)translateX(-6px)} }
  @keyframes float2 { 0%,100%{transform:translateY(0)translateX(0)} 50%{transform:translateY(-24px)translateX(-12px)} }
  @keyframes float3 { 0%,100%{transform:translateY(0)rotate(0deg)} 50%{transform:translateY(-14px)rotate(180deg)} }
  @keyframes pulse { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.1);opacity:1} }
  @keyframes particleDrift { 0%{transform:translateY(0)translateX(0);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translateY(-130px)translateX(15px);opacity:0} }
  @keyframes borderGlow { 0%,100%{box-shadow:0 0 0 3px rgba(212,160,23,.13)} 50%{box-shadow:0 0 0 4px rgba(212,160,23,.28)} }
  @keyframes badgePop { 0%{transform:scale(.8);opacity:0} 60%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
  @keyframes shimmer { 0%{left:-100%} 100%{left:160%} }
  @keyframes successPop { 0%{transform:scale(.85);opacity:0} 60%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }

  .ul-page { min-height:100vh; display:flex; flex-direction:column; font-family:'DM Sans',sans-serif; background:#F8FAFC; overflow-x:hidden; }
  
  .ul-mobile-header { order:-1; width:100%; height:120px; background:linear-gradient(160deg,#060D1A 0%,#0F1D36 100%); display:flex; align-items:center; justify-content:flex-start; padding-left:24px; position:relative; overflow:hidden; border-bottom:1px solid rgba(255,255,255,0.08); }
  @media(min-width:768px){ .ul-mobile-header { display:none; } }

  .ul-mobile-header::before {
    content:''; position:absolute; inset:0;
    background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 24px 24px;
    pointer-events:none;
  }

  .ul-left { order:2; width:100%; min-height:auto; background:linear-gradient(160deg,#060F1E 0%,#0B1F3E 45%,#162D52 100%); display:flex; flex-direction:column; padding:32px 24px; position:relative; overflow:hidden; }
  
  @media(min-width:768px) {
    .ul-page { flex-direction:row; }
    .ul-left { order:unset; width:44%; min-height:100vh; padding:44px 48px; border-right:1px solid rgba(255,255,255,0.05); }
  }

  /* Professional Entrance Animations */
  @keyframes fadeSlideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  
  .ul-stagger-in > * { animation: fadeSlideUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .ul-stagger-in > *:nth-child(1) { animation-delay: 0.1s; }
  .ul-stagger-in > *:nth-child(2) { animation-delay: 0.2s; }
  .ul-stagger-in > *:nth-child(3) { animation-delay: 0.3s; }
  .ul-stagger-in > *:nth-child(4) { animation-delay: 0.4s; }
  .ul-stagger-in > *:nth-child(5) { animation-delay: 0.5s; }

  .ul-orb1{position:absolute;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(212,160,23,.1) 0%,transparent 70%);top:-80px;right:-80px;pointer-events:none;animation:float1 12s ease-in-out infinite}
  .ul-orb2{position:absolute;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(26,127,212,.08) 0%,transparent 70%);bottom:-40px;left:-60px;pointer-events:none;animation:float2 15s ease-in-out infinite}
  
  @media(min-width:768px) {
    .ul-orb1 { width:360px; height:360px; }
    .ul-orb2 { width:280px; height:280px; bottom:60px; }
  }

  .ul-particle{position:absolute;border-radius:50%;background:rgba(255,255,255,.2);pointer-events:none;animation:particleDrift linear infinite}
  
  .ul-logo { position:relative; z-index:2; padding:8px; }
  @media(max-width:767px){ .ul-logo { display:none; } }

  .ul-logo-m { position:relative; z-index:2; margin-bottom: 4px; }

  .ul-logo-inner{display:flex;align-items:center;gap:14px}
  .ul-logo-placeholder{ 
    width:42px; height:42px; border-radius:12px; 
    background:linear-gradient(135deg,#D4A017 0%,#F5C842 50%,#D4A017 100%);
    background-size: 200% 100%;
    animation: shimmer 3s infinite linear;
    display:flex; align-items:center; justify-content:center;
    overflow: hidden;
  }
  .ul-logo-img { width:100%; height:100%; object-fit:contain; }

  @media(min-width:768px){ .ul-logo-placeholder { width:52px; height:52px; border-radius:14px; } }

  .ul-logo-text .name{font-family:'Sora',sans-serif;font-size:18px;font-weight:700;color:#fff;letter-spacing:.5px;line-height:1.1}
  @media(min-width:768px){ .ul-logo-text .name { font-size:20px; } }

  .ul-logo-text .sub{font-size:9px;color:rgba(255,255,255,.5);letter-spacing:3px;text-transform:uppercase;margin-top:4px;font-weight:600}
  @media(min-width:768px){ .ul-logo-text .sub { font-size:10px; letter-spacing:3.5px; } }

  .ul-center{position:relative;z-index:2; margin-top:20px}
  @media(min-width:768px){ .ul-center { margin-top:0; } }

  .ul-tagline{font-family:'Sora',sans-serif;font-size:24px;font-weight:800;color:#fff;line-height:1.2;margin-bottom:12px;letter-spacing:-.8px; animation: fadeSlideUp 0.8s 0.2s both; }
  @media(min-width:768px){ .ul-tagline { font-size:32px; margin-bottom:16px; } }

  .ul-tagline span{color:#F5C842}
  .ul-tagline-sub{font-size:13px;color:rgba(255,255,255,.6);line-height:1.65;max-width:300px; animation: fadeSlideUp 0.8s 0.3s both; }
  @media(min-width:768px){ .ul-tagline-sub { font-size:14px; line-height:1.75; } }

  .ul-features{margin-top:24px;display:flex;flex-direction:column;gap:14px; animation: fadeSlideUp 0.8s 0.4s both; }
  @media(min-width:768px){ .ul-features { margin-top:36px; gap:16px; } }

  .ul-feature{display:flex;align-items:flex-start;gap:14px;transition:transform .2s ease}
  .ul-feature:hover{transform:translateX(5px)}
  .ul-feature-icon{width:34px;height:34px;border-radius:10px;flex-shrink:0;background:rgba(212,160,23,.12);border:1px solid rgba(212,160,23,.22);display:flex;align-items:center;justify-content:center;font-size:15px;color:#F5C842}
  @media(min-width:768px){ .ul-feature-icon { width:40px; height:40px; border-radius:12px; font-size:18px; } }

  .ul-feature-text .ft{font-size:13px;font-weight:600;color:#fff;margin-bottom:2px}
  .ul-feature-text .fs{font-size:11.5px;color:rgba(255,255,255,.45);line-height:1.4}

  .ul-divider-line{width:100%;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent);margin:24px 0; animation: fadeSlideUp 0.8s 0.5s both; }
  .ul-trust{display:flex;gap:20px;flex-wrap:wrap; animation: fadeSlideUp 0.8s 0.6s both; }
  .ul-trust-item{display:flex;align-items:center;gap:8px;font-size:11.5px;color:rgba(255,255,255,.4);transition:color .2s}
  .ul-trust-item:hover{color:rgba(255,255,255,.6)}
  .ul-trust-dot{width:6px;height:6px;border-radius:50%;background:#F5C842;opacity:.6}
  
  .ul-footer{position:relative;z-index:2;font-size:11.5px;color:rgba(255,255,255,.25);animation:fadeSlideUp 0.8s 0.7s both; margin-top:32px; border-top:1px solid rgba(255,255,255,0.05); padding-top:16px}
  @media(min-width:768px){ .ul-footer { margin-top:0; border-top:none; padding-top:0} }

  .ul-right{order:1;width:100%;flex:none;display:flex;align-items:center;justify-content:center;padding:40px 20px;animation:fadeSlideUp .7s cubic-bezier(.22,1,.36,1) both;overflow-y:visible}
  @media(min-width:768px){
    .ul-right { order:unset; flex:1; width:auto; padding:48px 52px; overflow-y:auto; }
  }
  .ul-form-card{width:100%;max-width:460px; background:#fff; padding: 24px; border-radius:24px; box-shadow: 0 20px 50px rgba(0,0,0,0.04); }
  @media(min-width:768px){ .ul-form-card { padding: 40px; } }

  .ul-badge{display:inline-flex;align-items:center;gap:8px;background:#FEF9C3;border:1px solid rgba(255,200,0,0.25);border-radius:24px;padding:6px 18px;font-size:11px;font-weight:700;color:#854D0E;margin-bottom:24px;letter-spacing:1px;text-transform:uppercase}
  .ul-badge-dot{width:7px;height:7px;border-radius:50%;background:#D4A017;animation:pulse 2s infinite}
  
  .ul-title{font-family:'Sora',sans-serif;font-size:32px;font-weight:800;color:#0F172A;margin-bottom:8px;letter-spacing:-.8px}
  .ul-subtitle{font-size:14.5px;color:#64748B;margin-bottom:32px;line-height:1.5}
  
  .ul-tabs{display:flex;background:#F8FAFC;border:1px solid #F1F5F9;border-radius:16px;padding:5px;margin-bottom:32px}
  .ul-tab{flex:1;padding:12px;text-align:center;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;border:none;font-family:'DM Sans',sans-serif;transition:all .25s ease;color:#94A3B8;background:transparent}
  .ul-tab.active{background:#fff;color:#0F172A;box-shadow:0 4px 12px rgba(0,0,0,0.06)}
  
  .ul-field{margin-bottom:20px}
  .ul-label{display:block;font-size:12.5px;font-weight:700;color:#475569;margin-bottom:8px;letter-spacing:.3px;text-transform:uppercase}
  
  .ul-input-wrap{position:relative; transition: transform .2s ease}
  .ul-input-wrap:focus-within { transform: translateY(-1px); }
  .ul-input-icon{position:absolute;left:16px;top:50%;transform:translateY(-50%);font-size:18px;color:#CBD5E1;pointer-events:none;transition:color .2s}
  .ul-input-wrap:focus-within .ul-input-icon { color:#D4A017; }
  
  .ul-input{width:100%;padding:14px 16px 14px 50px;font-size:15px;font-family:'DM Sans',sans-serif;border:2px solid #F1F5F9;border-radius:16px;background:#F8FAFC;color:#0F172A;outline:none;transition:all .25s cubic-bezier(0.22, 1, 0.36, 1)}
  .ul-input:focus{border-color:#D4A017;box-shadow:0 0 0 5px rgba(212,160,23,.08);background:#fff}
  .ul-input.error{border-color:#EF4444;background:#FEF2F2}
  
  .ul-submit{width:100%;padding:16px 0;font-size:15.5px;font-weight:700;font-family:'Sora',sans-serif;border:none;border-radius:16px;cursor:pointer;background:linear-gradient(135deg,#D4A017 0%,#B8860B 100%);color:#fff;letter-spacing:.5px;box-shadow:0 10px 25px rgba(212,160,23,.3);margin-top:24px;transition:all .25s ease;position:relative;overflow:hidden}
  .ul-submit:hover{box-shadow:0 12px 32px rgba(212,160,23,.42);transform:translateY(-2px)}
  .ul-submit:active{transform:translateY(0) scale(.98)}
  .ul-submit-blue{background:linear-gradient(135deg,#2563EB 0%,#1E40AF 100%);box-shadow:0 10px 25px rgba(37,99,235,0.25)}
  .ul-submit-blue:hover{box-shadow:0 12px 32px rgba(37,99,235,0.35)}
  
  @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; transform: scale(1.15); } 100% { opacity: 0.6; } }
  @keyframes successPop { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
  
  .ul-switch{margin-top:28px;text-align:center;font-size:14px;color:#94A3B8}
  .ul-switch button{background:none;border:none;color:#2563EB;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:14px;transition:color .2s}
  .ul-switch button:hover{color:#1E40AF}
  
  @media(orientation:landscape) and (max-height:600px){
    .ul-page { flex-direction: row; }
    .ul-left { width: 35%; display: flex; }
    .ul-right { width: 65%; padding: 24px 20px; }
    .ul-center { display: none; }
    .ul-logo { margin-bottom: 0; }
  }
  .ul-form-card{width:100%;max-width:460px}
  .ul-badge{display:inline-flex;align-items:center;gap:7px;background:#FDF6DC;border:1px solid rgba(212,160,23,.35);border-radius:24px;padding:5px 16px;font-size:11px;font-weight:700;color:#A37800;margin-bottom:20px;letter-spacing:1px;animation:badgePop .5s .65s both}
  .ul-badge-dot{width:7px;height:7px;border-radius:50%;background:#D4A017;animation:pulse 2s 1s ease-in-out infinite}
  .ul-title{font-family:'Sora',sans-serif;font-size:28px;font-weight:800;color:#0B1F3E;margin-bottom:5px;letter-spacing:-.5px;animation:fadeUp .6s .72s both}
  .ul-subtitle{font-size:13.5px;color:#475569;margin-bottom:28px;animation:fadeUp .6s .78s both}
  .ul-tabs{display:flex;background:#F1F5F9;border-radius:12px;padding:4px;margin-bottom:24px;animation:fadeUp .6s .80s both}
  .ul-tab{flex:1;padding:9px;text-align:center;border-radius:9px;font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:'DM Sans',sans-serif;transition:all .22s;color:#64748B;background:transparent}
  .ul-tab.active{background:#fff;color:#0B1F3E;box-shadow:0 2px 8px rgba(0,0,0,.1)}
  .ul-field{margin-bottom:16px}
  .ul-label{display:block;font-size:12px;font-weight:600;color:#475569;margin-bottom:7px;letter-spacing:.6px;text-transform:uppercase}
  .ul-input-wrap{position:relative}
  .ul-input-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:15px;color:#94A3B8;pointer-events:none}
  .ul-input{width:100%;padding:12px 14px 12px 44px;font-size:14px;font-family:'DM Sans',sans-serif;border:1.5px solid #E2E8F0;border-radius:12px;background:#FAFAFA;color:#0B1F3E;outline:none;transition:border-color .2s,box-shadow .2s,background .2s}
  .ul-input:focus{border-color:#D4A017;box-shadow:0 0 0 4px rgba(212,160,23,.1);background:#fff;animation:borderGlow 2s ease-in-out infinite}
  .ul-input.error{border-color:#EF4444}
  .ul-input.valid{border-color:#22C55E;background:#F0FDF4}
  .ul-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#94A3B8;font-size:15px;padding:4px;transition:color .2s}
  .ul-eye:hover{color:#D4A017}
  .ul-error{font-size:12px;color:#EF4444;margin-top:5px}
  .ul-upload-area{border:2px dashed #E2E8F0;border-radius:12px;padding:18px 14px;text-align:center;cursor:pointer;transition:all .2s;background:#FAFAFA;position:relative}
  .ul-upload-area:hover{border-color:#D4A017;background:#FFFBF0}
  .ul-upload-area.has-file{border-color:#22C55E;background:#F0FDF4}
  .ul-upload-area input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
  .ul-upload-icon{font-size:22px;margin-bottom:4px}
  .ul-upload-label{font-size:12px;font-weight:600;color:#475569}
  .ul-upload-sub{font-size:11px;color:#94A3B8;margin-top:2px}
  .ul-upload-name{font-size:11px;color:#16A34A;margin-top:4px;font-weight:600}
  .ul-grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .ul-submit{width:100%;padding:14px 0;font-size:15px;font-weight:700;font-family:'Sora',sans-serif;border:none;border-radius:12px;cursor:pointer;background:linear-gradient(135deg,#D4A017 0%,#B8860B 100%);color:#fff;letter-spacing:.4px;box-shadow:0 6px 20px rgba(212,160,23,.38);margin-top:18px;transition:box-shadow .25s,transform .15s;position:relative;overflow:hidden}
  .ul-submit::before{content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);transform:skewX(-20deg)}
  .ul-submit:hover::before{animation:shimmer .55s ease forwards}
  .ul-submit:hover{box-shadow:0 8px 28px rgba(212,160,23,.48);transform:translateY(-1px)}
  .ul-submit:active{transform:scale(.98)}
  .ul-submit:disabled{opacity:.75;cursor:not-allowed}
  .ul-submit-blue{background:linear-gradient(135deg,#1A7FD4 0%,#0F5FA8 100%);box-shadow:0 6px 20px rgba(26,127,212,.38)}
  .ul-submit-blue:hover{box-shadow:0 8px 28px rgba(26,127,212,.48)}
  .ul-switch{margin-top:20px;text-align:center;font-size:13px;color:#94A3B8}
  .ul-switch button{background:none;border:none;color:#1A7FD4;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px}
  .ul-success{text-align:center;padding:32px 20px;animation:successPop .5s both}
  .ul-success-icon{font-size:56px;margin-bottom:16px}
  .ul-success-title{font-family:'Sora',sans-serif;font-size:22px;font-weight:800;color:#0B1F3E;margin-bottom:8px}
  .ul-success-sub{font-size:13.5px;color:#475569;line-height:1.7;max-width:320px;margin:0 auto 24px}
  .ul-success-tag{display:inline-flex;align-items:center;gap:8px;background:#FEF9C3;border:1px solid rgba(212,160,23,.3);border-radius:24px;padding:8px 20px;font-size:12px;font-weight:700;color:#A37800}
  .ul-footer-note{margin-top:24px;text-align:center;font-size:11.5px;color:#94A3B8}
  .ul-progress{display:flex;align-items:center;gap:0;margin-bottom:24px}
  .ul-step{display:flex;flex-direction:column;align-items:center;flex:1}
  .ul-step-dot{width:28px;height:28px;border-radius:50%;border:2px solid #E2E8F0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#94A3B8;background:#fff;transition:all .3s;position:relative;z-index:1}
  .ul-step-dot.done{background:#D4A017;border-color:#D4A017;color:#fff}
  .ul-step-dot.active{background:#0B1F3E;border-color:#0B1F3E;color:#fff}
  .ul-step-label{font-size:10px;color:#94A3B8;margin-top:4px;text-align:center;font-weight:600;letter-spacing:.3px}
  .ul-step-label.active{color:#0B1F3E}
  .ul-step-label.done{color:#D4A017}
  .ul-step-line{flex:1;height:2px;background:#E2E8F0;margin-top:-14px;transition:background .3s}
  .ul-step-line.done{background:#D4A017}

  /* Shop code input special style */
  .shop-code-input{width:100%;padding:12px 14px 12px 48px;font-size:16px;font-weight:700;font-family:'Sora',sans-serif;border:2px solid #E2E8F0;border-radius:12px;background:#FAFAFA;color:#0B1F3E;outline:none;letter-spacing:3px;text-transform:uppercase;transition:border-color .2s,box-shadow .2s; min-height:50px}
  @media(min-width:768px){ .shop-code-input { padding:14px 14px 14px 50px; font-size:18px; letter-spacing:4px; } }
  .shop-code-input:focus{border-color:#D4A017;box-shadow:0 0 0 4px rgba(212,160,23,.1);background:#fff}
  .shop-code-input.valid{border-color:#22C55E;background:#F0FDF4}
  .shop-code-input.error{border-color:#EF4444}
  .shop-code-verified{display:flex;align-items:center;gap:8px;padding:10px 14px;background:#ECFDF5;border:1px solid #A7F3D0;border-radius:10px;font-size:13px;font-weight:600;color:#065F46;margin-top:8px}

  /* Landscape Phones */
  @media(orientation:landscape) and (max-height:600px){
    .ul-page { flex-direction: row; }
    .ul-left { width: 35%; display: flex; }
    .ul-right { width: 65%; padding: 24px 20px; }
    .ul-center { display: none; }
    .ul-logo { margin-bottom: 0; }
  }
`;

const PARTICLES = [
  { left: "12%", dur: "9s", delay: "0s", size: 3 },
  { left: "30%", dur: "13s", delay: "2s", size: 2 },
  { left: "52%", dur: "10s", delay: "4s", size: 4 },
  { left: "71%", dur: "15s", delay: "1s", size: 2 },
  { left: "85%", dur: "11s", delay: "6s", size: 3 },
];

const FEATURES = [
  { icon: "🥇", title: "Real-time Gold Rates", sub: "Live rate updates from admin every day" },
  { icon: "📊", title: "Track Your Investment", sub: "See gold grams, value & history anytime" },
  { icon: "🛡️", title: "Secure & Verified", sub: "KYC verified accounts, encrypted data" },
];

const STEPS = ["Shop Code", "Personal Info", "Documents", "Set Password"];

// ── File Upload Component ──
function FileUpload({ label, icon, name, file, onChange }) {
  return (
    <div>
      <label className="ul-label">{label}</label>
      <div className={`ul-upload-area${file ? " has-file" : ""}`}>
        <input type="file" accept="image/*,.pdf" onChange={e => onChange(name, e.target.files[0])} />
        <div className="ul-upload-icon">{file ? "✅" : icon}</div>
        <div className="ul-upload-label">{file ? "File selected" : "Click to upload"}</div>
        {file
          ? <div className="ul-upload-name">{file.name}</div>
          : <div className="ul-upload-sub">JPG, PNG or PDF · Max 5MB</div>}
      </div>
    </div>
  );
}

// ── Selfie Upload — with live camera option ──
function SelfieUpload({ file, onChange }) {
  const [mode, setMode] = useState("upload"); // "upload" | "camera"
  const [streaming, setStream] = useState(false);
  const [captured, setCaptured] = useState(false);
  const [camError, setCamError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    setCamError("");
    setCaptured(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStream(true);
    } catch (err) {
      setCamError("Camera access denied. Please allow camera permission and try again.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setStream(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth || 400;
    canvas.height = video.videoHeight || 300;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      const captured = new File([blob], `selfie_${Date.now()}.jpg`, { type: "image/jpeg" });
      onChange("userPhoto", captured);
      setCaptured(true);
      stopCamera();
    }, "image/jpeg", 0.92);
  };

  const retake = () => {
    onChange("userPhoto", null);
    setCaptured(false);
    startCamera();
  };

  const switchMode = (m) => {
    if (mode === m) return;
    if (m !== "camera") stopCamera();
    setMode(m);
    setCaptured(false);
    setCamError("");
    if (m === "camera") setTimeout(startCamera, 100);
  };

  // Cleanup camera on unmount
  useEffect(() => () => stopCamera(), []);

  // Attach stream to video element once both exist
  useEffect(() => {
    if (streaming && videoRef.current && streamRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play();
    }
  }, [streaming]);

  return (
    <div>
      <label className="ul-label">Your Selfie / Photo</label>

      {/* Mode tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {[
          { id: "upload", label: "📁 Upload File" },
          { id: "camera", label: "📷 Take Live Photo" },
        ].map(tab => (
          <button key={tab.id} type="button"
            onClick={() => switchMode(tab.id)}
            style={{
              padding: "8px 16px", fontSize: 12, fontWeight: 600,
              border: mode === tab.id ? "2px solid #D4A017" : "1.5px solid #E2E8F0",
              borderRadius: 9, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              background: mode === tab.id ? "#FDF6DC" : "#FAFAFA",
              color: mode === tab.id ? "#A37800" : "#64748B",
              transition: "all 0.2s",
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Upload mode */}
      {mode === "upload" && (
        <div className={`ul-upload-area${file ? " has-file" : ""}`}>
          <input type="file" accept="image/*" onChange={e => { onChange("userPhoto", e.target.files[0]); setCaptured(false); }} />
          <div className="ul-upload-icon">{file ? "✅" : "🤳"}</div>
          <div className="ul-upload-label">{file ? "File selected" : "Click to upload"}</div>
          {file ? <div className="ul-upload-name">{file.name}</div>
            : <div className="ul-upload-sub">JPG or PNG · Max 5MB</div>}
        </div>
      )}

      {/* Camera mode */}
      {mode === "camera" && (
        <div style={{ border: "2px dashed #D4A017", borderRadius: 12, overflow: "hidden", background: "#11182B", position: "relative", minHeight: 220 }}>
          {/* Live video preview */}
          {!captured && (
            <video
              ref={videoRef}
              autoPlay playsInline muted
              style={{ width: "100%", display: streaming ? "block" : "none", borderRadius: 10 }}
            />
          )}

          {/* Captured preview */}
          {captured && file && (
            <div style={{ textAlign: "center", padding: 12 }}>
              <img src={URL.createObjectURL(file)} alt="Captured selfie"
                style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 10 }} />
              <div style={{ color: "#22C55E", fontWeight: 600, fontSize: 13, marginTop: 8 }}>✅ Photo captured!</div>
            </div>
          )}

          {/* Camera not started */}
          {!streaming && !captured && !camError && (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "rgba(255,255,255,0.7)" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📷</div>
              <div style={{ fontSize: 13, marginBottom: 16 }}>Click to start your camera</div>
              <button type="button" onClick={startCamera}
                style={{
                  padding: "10px 24px", background: "#D4A017", color: "#fff",
                  border: "none", borderRadius: 9, cursor: "pointer", fontWeight: 600, fontSize: 13
                }}>
                Start Camera
              </button>
            </div>
          )}

          {camError && (
            <div style={{ padding: 16, color: "#EF4444", fontSize: 12.5, textAlign: "center", background: "rgba(255,255,255,0.97)" }}>
              ⚠ {camError}
              <br />
              <button type="button" onClick={startCamera}
                style={{
                  marginTop: 10, padding: "8px 18px", background: "#EF4444", color: "#fff",
                  border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 12
                }}>
                Try Again
              </button>
            </div>
          )}

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Capture button */}
          {streaming && !captured && (
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0", background: "rgba(0,0,0,0.65)" }}>
              <button type="button" onClick={capturePhoto}
                style={{
                  padding: "11px 32px", background: "#D4A017", color: "#fff",
                  border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14,
                  boxShadow: "0 4px 16px rgba(212,160,23,0.45)"
                }}>
                📸 Capture Photo
              </button>
            </div>
          )}

          {/* Retake button */}
          {captured && (
            <div style={{ display: "flex", justifyContent: "center", padding: "10px 0", background: "rgba(0,0,0,0.55)", gap: 10 }}>
              <button type="button" onClick={retake}
                style={{
                  padding: "9px 22px", background: "#475569", color: "#fff",
                  border: "none", borderRadius: 9, cursor: "pointer", fontWeight: 600, fontSize: 13
                }}>
                🔄 Retake
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Step 0: Shop Code ──
function Step0({ data, errors, onChange, onVerified }) {
  const [checking, setChecking] = useState(false);
  const [shopName, setShopName] = useState("");
  const [codeError, setCodeError] = useState("");

  const verifyCode = async (code) => {
    if (code.length < 6) { setShopName(""); onVerified(false); return; }
    setChecking(true);
    setCodeError("");
    onVerified(false); // reset until confirmed
    try {
      const res = await fetch(`${API_BASE}/api/auth/validate-shop/${code}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setShopName(data.shopName);
        onVerified(true); // ✅ valid
      } else {
        setShopName("");
        setCodeError("Invalid shop code. Please check with your jeweller.");
        onVerified(false);
      }
    } catch {
      setShopName("");
      setCodeError("Could not verify. Check your internet connection.");
      onVerified(false);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div>
      <div style={{
        background: "#FDF6DC", border: "1px solid rgba(212,160,23,.3)",
        borderRadius: 12, padding: "14px 16px", marginBottom: 20,
        fontSize: 13, color: "#92400E", lineHeight: 1.7
      }}>
        📌 Ask your <b>jeweller / gold shop</b> for their unique <b>Shop Code</b> and enter it below.
        Your registration will be sent directly to them for approval.
      </div>

      <div className="ul-field">
        <label className="ul-label">Shop Code</label>
        <div className="ul-input-wrap">
          <span className="ul-input-icon">🏪</span>
          <input
            className={`shop-code-input${errors.shopCode ? " error" : ""}${shopName ? " valid" : ""}`}
            placeholder="e.g. GOL-4821"
            value={data.shopCode}
            maxLength={8}
            onChange={e => {
              const val = e.target.value.toUpperCase();
              onChange("shopCode", val);
              setShopName("");
              setCodeError("");
              if (val.length >= 6) verifyCode(val);
            }}
          />
        </div>
        {checking && (
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 6 }}>🔍 Verifying shop code…</div>
        )}
        {shopName && (
          <div className="shop-code-verified">
            ✅ Verified — <b>{shopName}</b>
          </div>
        )}
        {(codeError || errors.shopCode) && (
          <div className="ul-error">⚠ {codeError || errors.shopCode}</div>
        )}
      </div>
    </div>
  );
}

// ── Step 1: Personal Info ──
function Step1({ data, errors, onChange }) {
  return (
    <>
      <div className="ul-grid2">
        <div className="ul-field">
          <label className="ul-label">Full Name</label>
          <div className="ul-input-wrap">
            <span className="ul-input-icon">👤</span>
            <input className={`ul-input${errors.name ? " error" : ""}`}
              placeholder="Ravi Kumar" value={data.name}
              onChange={e => onChange("name", e.target.value)} />
          </div>
          {errors.name && <div className="ul-error">⚠ {errors.name}</div>}
        </div>
        <div className="ul-field">
          <label className="ul-label">Phone</label>
          <div className="ul-input-wrap">
            <span className="ul-input-icon">📱</span>
            <input className={`ul-input${errors.phone ? " error" : ""}`}
              placeholder="9876543210" value={data.phone} maxLength={10}
              onChange={e => onChange("phone", e.target.value)} />
          </div>
          {errors.phone && <div className="ul-error">⚠ {errors.phone}</div>}
        </div>
      </div>

      <div className="ul-field">
        <label className="ul-label">Email Address</label>
        <div className="ul-input-wrap">
          <span className="ul-input-icon">✉</span>
          <input className={`ul-input${errors.email ? " error" : ""}`}
            type="email" placeholder="you@example.com" value={data.email}
            onChange={e => onChange("email", e.target.value)} />
        </div>
        {errors.email && <div className="ul-error">⚠ {errors.email}</div>}
      </div>

      <div className="ul-grid2">
        <div className="ul-field">
          <label className="ul-label">Date of Birth</label>
          <div className="ul-input-wrap" style={{ position: "relative" }}>
            <span className="ul-input-icon">📅</span>
            <input
              type="date"
              id="dob-input"
              className="ul-input"
              value={data.dateOfBirth}
              max={new Date().toISOString().split("T")[0]}
              onChange={e => onChange("dateOfBirth", e.target.value)}
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("dob-input");
                if (el) { el.showPicker && el.showPicker(); el.focus(); }
              }}
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "linear-gradient(135deg,#D4A017,#B8860B)", border: "none",
                borderRadius: 8, width: 30, height: 30, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, boxShadow: "0 2px 8px rgba(212,160,23,0.35)",
                transition: "opacity 0.15s",
              }}
              title="Pick date of birth"
            >
              📅
            </button>
          </div>
        </div>
        <div className="ul-field">
          <label className="ul-label">Occupation</label>
          <div className="ul-input-wrap">
            <span className="ul-input-icon">💼</span>
            <input className="ul-input" placeholder="e.g. Farmer" value={data.occupation}
              onChange={e => onChange("occupation", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="ul-field">
        <label className="ul-label">Address</label>
        <div className="ul-input-wrap">
          <span className="ul-input-icon">🏠</span>
          <input className="ul-input" placeholder="Street, City, State" value={data.address}
            onChange={e => onChange("address", e.target.value)} />
        </div>
      </div>
    </>
  );
}

// ── Step 2: Documents ──
function Step2({ data, errors, onFileChange }) {
  return (
    <>
      <div style={{
        fontSize: 13, color: "#475569", marginBottom: 18, lineHeight: 1.6,
        background: "#FDF6DC", border: "1px solid rgba(212,160,23,.25)",
        borderRadius: 10, padding: "12px 14px"
      }}>
        📋 Upload clear photos of your documents for KYC verification.
      </div>

      <div style={{ marginBottom: 14 }}>
        <FileUpload label="Aadhar Card" icon="📄" name="aadharCardPhoto"
          file={data.aadharCardPhoto} onChange={onFileChange} />
      </div>

      {/* Selfie — supports both file upload and live camera */}
      <SelfieUpload file={data.userPhoto} onChange={onFileChange} />

      {errors.docs && <div className="ul-error" style={{ marginTop: 10 }}>⚠ {errors.docs}</div>}
    </>
  );
}

// ── Step 3: Set Password ──
function Step3({ data, errors, onChange }) {
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  return (
    <>
      <div className="ul-field">
        <label className="ul-label">Create Password</label>
        <div className="ul-input-wrap">
          <span className="ul-input-icon">🔒</span>
          <input type={showPwd ? "text" : "password"}
            className={`ul-input${errors.password ? " error" : ""}`}
            style={{ paddingRight: 44 }} placeholder="Min. 6 characters"
            value={data.password} onChange={e => onChange("password", e.target.value)} />
          <button className="ul-eye" onClick={() => setShowPwd(!showPwd)}>
            {showPwd ? "🙈" : "👁"}
          </button>
        </div>
        {errors.password && <div className="ul-error">⚠ {errors.password}</div>}
      </div>

      <div className="ul-field">
        <label className="ul-label">Confirm Password</label>
        <div className="ul-input-wrap">
          <span className="ul-input-icon">🔒</span>
          <input type={showConfirm ? "text" : "password"}
            className={`ul-input${errors.confirm ? " error" : ""}`}
            style={{ paddingRight: 44 }} placeholder="Re-enter password"
            value={data.confirm} onChange={e => onChange("confirm", e.target.value)} />
          <button className="ul-eye" onClick={() => setShowConfirm(!showConfirm)}>
            {showConfirm ? "🙈" : "👁"}
          </button>
        </div>
        {errors.confirm && <div className="ul-error">⚠ {errors.confirm}</div>}
      </div>

      <div style={{
        fontSize: 12, color: "#64748B", background: "#F8FAFC",
        border: "1px solid #E2E8F0", borderRadius: 10, padding: "12px 14px", lineHeight: 1.8
      }}>
        ✅ Your account will be reviewed by the admin<br />
        ✅ You'll be able to log in once approved<br />
        ✅ All data is encrypted and secure
      </div>
    </>
  );
}

// ── Registration Form ──
function RegisterForm({ onBack }) {
  const [step, setStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isCodeVerified, setIsCodeVerified] = useState(false);

  // Scheme Terms (Shop ↔ User)
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [termsVersion, setTermsVersion] = useState(null);

  // Platform Terms (SkyUp ↔ User)
  const [platformTermsOpen, setPlatformTermsOpen] = useState(false);

  const [form, setForm] = useState({
    shopCode: "", name: "", email: "", phone: "", address: "",
    dateOfBirth: "", occupation: "", password: "", confirm: "",
    aadharCardPhoto: null, userPhoto: null,
  });

  const update = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); };
  const fileUpdate = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, docs: "" })); };

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.shopCode.trim())
        e.shopCode = "Shop code is required";
      else if (!isCodeVerified)
        e.shopCode = "Invalid shop code. Please enter a valid code from your jeweller.";
    }
    if (step === 1) {
      if (!form.name.trim()) e.name = "Full name is required";
      if (!form.phone || form.phone.length < 10) e.phone = "Valid 10-digit phone required";
      if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    }
    if (step === 2) {
      if (!form.aadharCardPhoto)
        e.docs = "Aadhar card photo is required";
      if (!form.userPhoto) e.docs = "User photo is required";
    }
    if (step === 3) {
      if (!form.password || form.password.length < 6) e.password = "Minimum 6 characters";
      if (form.password !== form.confirm) e.confirm = "Passwords do not match";
      if (!termsAgreed) e.terms = "You must agree to the Terms and Conditions";
    }
    return e;
  };

  const goNext = () => {
    const e = validateStep();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(s => s + 1);
  };

  const submit = async () => {
    const e = validateStep();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setLoading(true);

    try {
      const fd = new FormData();
      fd.append("shopCode", form.shopCode.toUpperCase());
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("phone", form.phone);
      fd.append("password", form.password);
      fd.append("address", form.address);
      fd.append("dateOfBirth", form.dateOfBirth);
      fd.append("occupation", form.occupation);
      fd.append("agreedToTerms", String(termsAgreed));          // Scheme Terms
      fd.append("agreedTermsVersion", String(termsVersion || 1));
      fd.append("agreedToPlatformTerms", String(termsAgreed));          // Platform Terms (Combined with same state)
      if (form.aadharCardPhoto) fd.append("aadharCardPhoto", form.aadharCardPhoto);
      if (form.userPhoto) fd.append("userPhoto", form.userPhoto);

      const res = await fetch(`${API_BASE}/api/auth/user/register`, {
        method: "POST", body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setSuccess(true);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="ul-success">
      <div className="ul-success-icon">🎉</div>
      <div className="ul-success-title">Application Submitted!</div>
      <div className="ul-success-sub">
        Your registration has been sent to <b>{form.shopCode.toUpperCase()}</b>.<br />
        The shop admin will review your documents and approve your account — usually within 24 hours.
      </div>
      <div className="ul-success-tag">⏳ Pending Admin Approval</div>
      <div style={{ marginTop: 20 }}>
        <button className="ul-submit ul-submit-blue" style={{ marginTop: 0 }} onClick={onBack}>
          ← Back to Login
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Progress bar */}
      <div className="ul-progress">
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? "1" : "0" }}>
            <div className="ul-step">
              <div className={`ul-step-dot${i < step ? " done" : i === step ? " active" : ""}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <div className={`ul-step-label${i < step ? " done" : i === step ? " active" : ""}`}>{s}</div>
            </div>
            {i < STEPS.length - 1 && <div className={`ul-step-line${i < step ? " done" : ""}`} />}
          </div>
        ))}
      </div>

      {step === 0 && <Step0 data={form} errors={errors} onChange={(k, v) => { update(k, v); if (k === "shopCode") setIsCodeVerified(false); }} onVerified={setIsCodeVerified} />}
      {step === 1 && <Step1 data={form} errors={errors} onChange={update} />}
      {step === 2 && <Step2 data={form} errors={errors} onChange={update} onFileChange={fileUpdate} />}
      {step === 3 && <Step3 data={form} errors={errors} onChange={update} />}

      {/* Terms & Conditions — shown on Step 3 */}
      {step === 3 && (
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>

          {/* ── Combined Terms & Conditions ── */}
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "14px 16px",
            background: termsAgreed ? "#ECFDF5" : "#F8FAFC",
            border: `1.5px solid ${termsAgreed ? "#A7F3D0" : errors.terms ? "#EF4444" : "#E2E8F0"}`,
            borderRadius: 14, transition: "all 0.2s",
          }}>
            <input
              type="checkbox"
              id="all-terms-cb"
              checked={termsAgreed}
              onChange={e => { setTermsAgreed(e.target.checked); if (e.target.checked) setErrors(p => ({ ...p, terms: "" })); }}
              style={{ width: 18, height: 18, flexShrink: 0, marginTop: 2, accentColor: "#D4A017", cursor: "pointer" }}
            />
            <div style={{ flex: 1 }}>
              <label htmlFor="all-terms-cb" style={{ fontSize: 13.5, color: "#334155", cursor: "pointer", lineHeight: 1.5 }}>
                I agree to the{" "}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setTermsOpen(true); }}
                  style={{
                    background: "none", border: "none", color: "#1A7FD4",
                    fontWeight: 700, cursor: "pointer", textDecoration: "underline",
                    fontFamily: "inherit", fontSize: 13.5, padding: 0,
                  }}
                >
                  Scheme Terms and Conditions
                </button>
                {" "}of this shop and the{" "}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPlatformTermsOpen(true); }}
                  style={{
                    background: "none", border: "none", color: "#1A7FD4",
                    fontWeight: 700, cursor: "pointer", textDecoration: "underline",
                    fontFamily: "inherit", fontSize: 13.5, padding: 0,
                  }}
                >
                  SkyUp Platform Terms
                </button>
                {" "}governing this platform.
              </label>
              <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>Between you, the shop owner & SkyUp Digital Solutions</div>
            </div>
            {termsAgreed && <span style={{ fontSize: 18, flexShrink: 0 }}>✅</span>}
          </div>
          {errors.terms && (
            <div className="ul-error" style={{ marginLeft: 4, marginTop: -4 }}>⚠ {errors.terms}</div>
          )}

        </div>
      )}

      {errors.submit && <div className="ul-error" style={{ marginTop: 12 }}>⚠ {errors.submit}</div>}

      <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
        {step > 0 && (
          <button className="ul-submit"
            style={{ background: "#F1F5F9", color: "#0B1F3E", boxShadow: "none", flex: "0 0 100px" }}
            onClick={() => setStep(s => s - 1)}>
            ← Back
          </button>
        )}
        <button className="ul-submit" style={{
          flex: 1,
          opacity: (loading || (step === 3 && !termsAgreed)) ? 0.6 : 1
        }}
          onClick={step === STEPS.length - 1 ? submit : goNext}
          disabled={loading || (step === 3 && !termsAgreed)}>
          {loading ? "Submitting…"
            : step === STEPS.length - 1 ? "Submit Application →"
              : "Continue →"}
        </button>
      </div>

      <div className="ul-switch">
        Already have an account? <button onClick={onBack}>Sign in</button>
      </div>

      {/* Scheme Terms Modal — shop-specific, editable by admin */}
      <TermsModal
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        mode="agree"
        shopCode={form.shopCode}
        onAgree={(version) => {
          setTermsAgreed(true);
          setTermsVersion(version);
          setTermsOpen(false);
          setErrors(p => ({ ...p, terms: "" }));
        }}
      />

      {/* Platform Terms Modal — fixed SkyUp terms, NOT editable by shops */}
      <TermsModal
        open={platformTermsOpen}
        onClose={() => setPlatformTermsOpen(false)}
        mode="platform-agree"
        onAgree={() => {
          setTermsAgreed(true);
          setPlatformTermsOpen(false);
          setErrors(p => ({ ...p, terms: "" }));
        }}
      />
    </>
  );
}

// ── Resubmit Form (shown when login returns status: "rejected") ──
function ResubmitForm({ rejectReason, token, userName, onBack }) {
  const [aadharFile, setAadharFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResubmit = async () => {
    if (!aadharFile && !photoFile) {
      setError("Please upload at least one updated document to resubmit.");
      return;
    }
    setError(""); setLoading(true);
    try {
      const fd = new FormData();
      if (aadharFile) fd.append("aadharCardPhoto", aadharFile);
      if (photoFile) fd.append("userPhoto", photoFile);

      const res = await fetch(`${API_BASE}/api/auth/user/resubmit`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Resubmission failed");
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="ul-success">
      <div className="ul-success-icon">🎉</div>
      <div className="ul-success-title">Resubmitted!</div>
      <div className="ul-success-sub">
        Your updated documents have been sent for review.<br />
        The shop admin will review and approve your account — usually within 24 hours.
      </div>
      <div className="ul-success-tag">⏳ Pending Admin Approval</div>
      <div style={{ marginTop: 20 }}>
        <button className="ul-submit ul-submit-blue" style={{ marginTop: 0 }} onClick={onBack}>
          ← Back to Login
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {/* Rejection Banner */}
      <div style={{
        background: "linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%)",
        border: "1.5px solid #FECACA", borderRadius: 14,
        padding: "16px 18px", marginBottom: 22,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 20 }}>❌</span>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#B91C1C", fontFamily: "'Sora', sans-serif" }}>
            Application Rejected
          </div>
        </div>
        <div style={{ fontSize: 13, color: "#7F1D1D", lineHeight: 1.6 }}>
          <b>Reason:</b> {rejectReason || "Contact your shop admin for details."}
        </div>
      </div>

      {/* Instruction */}
      <div style={{
        background: "#FDF6DC", border: "1px solid rgba(212,160,23,.3)",
        borderRadius: 12, padding: "12px 14px", marginBottom: 20,
        fontSize: 13, color: "#92400E", lineHeight: 1.65,
      }}>
        📋 Upload corrected documents below and resubmit for admin review.
        You only need to re-upload the documents that were flagged.
      </div>

      {/* Aadhaar Re-upload */}
      <div className="ul-field">
        <label className="ul-label">Aadhaar Card Photo <span style={{ color: "#94A3B8", fontWeight: 400 }}>(re-upload if rejected)</span></label>
        <div className={`ul-upload-area${aadharFile ? " has-file" : ""}`}>
          <input type="file" accept="image/*,.pdf" onChange={e => setAadharFile(e.target.files[0])} />
          <div className="ul-upload-icon">{aadharFile ? "✅" : "📄"}</div>
          <div className="ul-upload-label">{aadharFile ? "File selected" : "Click to upload Aadhaar"}</div>
          {aadharFile
            ? <div className="ul-upload-name">{aadharFile.name}</div>
            : <div className="ul-upload-sub">JPG, PNG or PDF · Max 5MB</div>}
        </div>
      </div>

      {/* Selfie Re-upload */}
      <div className="ul-field">
        <label className="ul-label">Your Selfie / Photo <span style={{ color: "#94A3B8", fontWeight: 400 }}>(re-upload if rejected)</span></label>
        <div className={`ul-upload-area${photoFile ? " has-file" : ""}`}>
          <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} />
          <div className="ul-upload-icon">{photoFile ? "✅" : "🤳"}</div>
          <div className="ul-upload-label">{photoFile ? "File selected" : "Click to upload selfie"}</div>
          {photoFile
            ? <div className="ul-upload-name">{photoFile.name}</div>
            : <div className="ul-upload-sub">JPG or PNG · Max 5MB</div>}
        </div>
      </div>

      {error && <div className="ul-error" style={{ marginBottom: 12 }}>⚠ {error}</div>}

      <button
        className="ul-submit"
        onClick={handleResubmit}
        disabled={loading}
        style={{ marginTop: 8 }}
      >
        {loading ? "Submitting…" : "🔄 Resubmit for Approval →"}
      </button>

      <div className="ul-switch" style={{ marginTop: 14 }}>
        <button onClick={onBack}>← Back to Login</button>
      </div>
    </div>
  );
}


function LoginForm({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // OTP Login additions
  const [loginMethod, setLoginMethod] = useState("password"); // "password" | "otp"
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");

  // Rejected-user resubmit state
  const [rejectedData, setRejectedData] = useState(null); // { rejectReason, token, userName }

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setErrors({ phone: "Valid 10-digit phone number is required" });
      return;
    }
    setErrors({});
    setSendingOtp(true);
    setOtpMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/user/login/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setOtpSent(true);
      setOtpMessage("✅ OTP sent successfully. Please check your SMS.");
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async () => {
    const e = {};
    if (!phone || phone.length < 10) e.phone = "Valid 10-digit phone required";
    
    if (loginMethod === "password") {
      if (!password || password.length < 6) e.pass = "Minimum 6 characters";
    } else {
      if (!otpCode || otpCode.length < 6) e.otp = "6-digit OTP code is required";
    }

    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setLoading(true);

    try {
      const endpoint = loginMethod === "password" 
        ? `${API_BASE}/api/auth/user/login` 
        : `${API_BASE}/api/auth/user/login/verify-otp`;

      const payload = loginMethod === "password"
        ? { phone, password }
        : { phone, otp: otpCode };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      // Rejected users get 200 + token — show resubmit UI
      if (data.status === "rejected") {
        setRejectedData({
          rejectReason: data.rejectReason || "",
          token: data.token,
          userName: data.user?.name || "",
        });
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error(data.message || "Login failed");
      sessionStorage.setItem("userToken", data.token);
      sessionStorage.setItem("userInfo", JSON.stringify(data.user || {}));
      onLogin(data);
    } catch (err) {
      setErrors(p => ({ ...p, submit: err.message }));
    } finally {
      setLoading(false);
    }
  };

  // Switch to resubmit form when login detects rejected status
  if (rejectedData) {
    return (
      <ResubmitForm
        rejectReason={rejectedData.rejectReason}
        token={rejectedData.token}
        userName={rejectedData.userName}
        onBack={() => setRejectedData(null)}
      />
    );
  }

  return (
    <>
      <div className="ul-field">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label className="ul-label">Phone Number</label>
          {otpSent && (
            <button type="button" 
              onClick={() => { setOtpSent(false); setOtpCode(""); setOtpMessage(""); }}
              style={{ background: "none", border: "none", color: "#D4A017", fontWeight: 700, fontSize: "11px", cursor: "pointer", fontFamily: "inherit", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "2px" }}>
              ✏️ Edit Number
            </button>
          )}
        </div>
        <div className="ul-input-wrap">
          <span className="ul-input-icon">📱</span>
          <input className={`ul-input${errors.phone ? " error" : ""}`}
            placeholder="10-digit phone number" value={phone} maxLength={10}
            disabled={otpSent}
            onChange={e => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: "" })); }} />
        </div>
        {errors.phone && <div className="ul-error">⚠ {errors.phone}</div>}
      </div>

      {loginMethod === "password" ? (
        <div className="ul-field">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label className="ul-label">Password</label>
            <button type="button" 
              onClick={() => { setLoginMethod("otp"); setErrors({}); setOtpSent(false); setOtpCode(""); }}
              style={{ background: "none", border: "none", color: "#1A7FD4", fontWeight: 700, fontSize: "11.5px", cursor: "pointer", fontFamily: "inherit", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "7px" }}>
              Login with OTP
            </button>
          </div>
          <div className="ul-input-wrap">
            <span className="ul-input-icon">🔒</span>
            <input type={showPwd ? "text" : "password"}
              className={`ul-input${errors.pass ? " error" : ""}`}
              style={{ paddingRight: 44 }} placeholder="••••••••" value={password}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, pass: "" })); }} />
            <button className="ul-eye" onClick={() => setShowPwd(!showPwd)}>
              {showPwd ? "🙈" : "👁"}
            </button>
          </div>
          {errors.pass && <div className="ul-error">⚠ {errors.pass}</div>}
          
          <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
            <button type="button" 
              onClick={() => { setLoginMethod("otp"); setErrors({}); setOtpSent(false); setOtpCode(""); }}
              style={{ background: "none", border: "none", color: "#D4A017", fontWeight: 600, fontSize: "13px", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "5px" }}>
              🔑 Don't know password? Login with OTP
            </button>
          </div>
        </div>
      ) : (
        <div className="ul-field">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label className="ul-label">Verification OTP</label>
            <button type="button" 
              onClick={() => { setLoginMethod("password"); setErrors({}); }}
              style={{ background: "none", border: "none", color: "#1A7FD4", fontWeight: 700, fontSize: "11.5px", cursor: "pointer", fontFamily: "inherit", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "7px" }}>
              Login with Password
            </button>
          </div>
          
          {otpSent ? (
            <>
              <div className="ul-input-wrap">
                <span className="ul-input-icon">🔑</span>
                <input className={`ul-input${errors.otp ? " error" : ""}`}
                  placeholder="Enter 6-digit OTP" value={otpCode} maxLength={6}
                  onChange={e => { setOtpCode(e.target.value); setErrors(p => ({ ...p, otp: "" })); }} />
              </div>
              {errors.otp && <div className="ul-error">⚠ {errors.otp}</div>}
              {otpMessage && <div style={{ fontSize: "12.5px", color: "#22C55E", fontWeight: 600, marginTop: "6px" }}>{otpMessage}</div>}
              
              <div style={{ textAlign: "right", marginTop: "8px" }}>
                <button type="button" onClick={handleSendOtp} disabled={sendingOtp}
                  style={{ background: "none", border: "none", color: "#D4A017", fontWeight: 700, fontSize: "12px", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
                  {sendingOtp ? "Resending..." : "Resend OTP"}
                </button>
              </div>
            </>
          ) : (
            <button className="ul-submit" onClick={handleSendOtp} disabled={sendingOtp}
              style={{ marginTop: "4px", background: "linear-gradient(135deg,#D4A017 0%,#B8860B 100%)", boxShadow: "0 6px 20px rgba(212,160,23,.38)" }}>
              {sendingOtp ? "Sending OTP..." : "⚡ Send OTP via SMS"}
            </button>
          )}
        </div>
      )}

      {(loginMethod === "password" || otpSent) && (
        <button className="ul-submit ul-submit-blue" onClick={handleSubmit}
          disabled={loading} style={{ opacity: loading ? .82 : 1 }}>
          {loading ? "Signing in…" : "Sign In →"}
        </button>
      )}

      {errors.submit && (
        <div style={{ marginTop: 14 }}>
          <div className="ul-error">⚠ {errors.submit}</div>
          {errors.submit === "Invalid credentials" && loginMethod === "password" && (
            <div style={{
              marginTop: 10, padding: "12px", background: "#FFFBEB", border: "1px solid #FDE68A",
              borderRadius: "10px", fontSize: "13px", color: "#B45309", lineHeight: "1.5", textAlign: "left"
            }}>
              💡 <b>Forgot your password?</b> You can log in instantly without a password by using OTP verification.
              <button type="button" 
                onClick={() => { setLoginMethod("otp"); setErrors({}); setOtpSent(false); setOtpCode(""); }}
                style={{ display: "block", marginTop: "8px", background: "#D4A017", color: "#fff", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
                Switch to OTP Login
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ── Main Export ──

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
export default function UserLogin({ onLogin, onAdminLogin }) {
  const [mode, setMode] = useState("login");

  useEffect(() => {
    const id = "ul-global-styles";
    if (!document.getElementById(id)) {
      const tag = document.createElement("style");
      tag.id = id; tag.textContent = GLOBAL_CSS;
      document.head.appendChild(tag);
    }
    return () => { const t = document.getElementById(id); if (t) t.remove(); };
  }, []);

  return (
    <div className="ul-page">
      {/* Mobile-only header with logo */}
      <div className="ul-mobile-header">
        <div className="ul-logo-m">
          <div className="ul-logo-inner">
            <div className="ul-logo-placeholder">
              {/* <img src="/logo.png" alt="Logo" className="ul-logo-img" /> */}
            </div>
            <div className="ul-logo-text">
              <div className="name">SkyUp Digital</div>
              <div className="sub">Solution</div>
            </div>
          </div>
        </div>
      </div>

      <div className="ul-left">
        <div className="ul-orb1" /><div className="ul-orb2" /><div className="ul-orb3" />
        {PARTICLES.map((p, i) => (
          <div key={i} className="ul-particle" style={{
            left: p.left, bottom: "0", width: p.size, height: p.size,
            animationDuration: p.dur, animationDelay: p.delay
          }} />
        ))}
        <div className="ul-logo">
          <div className="ul-logo-inner">
            <div className="ul-logo-placeholder">
              {/* <img src="/logo.png" alt="Logo" className="ul-logo-img" /> */}
            </div>
            <div className="ul-logo-text">
              <div className="name">SkyUp Digital</div>
              <div className="sub">Solution</div>
            </div>
          </div>
        </div>
        <div className="ul-center">
          <div className="ul-tagline">Your <span>Gold</span> Investment<br />Tracked & Secured</div>
          <div className="ul-tagline-sub">
            Join your jeweller's gold savings scheme and track your investment in real time.
          </div>
          <div className="ul-features">
            {FEATURES.map(f => (
              <div className="ul-feature" key={f.title}>
                <div className="ul-feature-icon">{f.icon}</div>
                <div className="ul-feature-text">
                  <div className="ft">{f.title}</div>
                  <div className="fs">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="ul-divider-line" />
          <div className="ul-trust">
            {["256-bit Encrypted", "KYC Verified", "RBI Compliant"].map(t => (
              <div className="ul-trust-item" key={t}>
                <div className="ul-trust-dot" />{t}
              </div>
            ))}
          </div>
        </div>
        <div className="ul-footer">© 2025 SkyUp Digital Solution. All rights reserved.</div>
      </div>

      <div className="ul-right">
        <div className="ul-form-card ul-stagger-in">
          <div className="ul-badge"><div className="ul-badge-dot" />USER PORTAL</div>

          {mode === "login" ? (
            <>
              <div className="ul-title">Welcome back 👋</div>
              <div className="ul-subtitle">Sign in to your investment account</div>
              <div className="ul-tabs">
                <button className="ul-tab active">Sign In</button>
                <button className="ul-tab" onClick={() => setMode("register")}>New Account</button>
              </div>
              <LoginForm onLogin={onLogin} />
              <div className="ul-switch" style={{ marginTop: 14 }}>
                Don't have an account? <button onClick={() => setMode("register")}>Register here</button>
              </div>
              {onAdminLogin && (
                <div className="ul-switch" style={{ marginTop: 8 }}>
                  <button onClick={onAdminLogin} style={{ color: "#94A3B8" }}>← Go to Admin Login</button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="ul-title">Create Account 📝</div>
              <div className="ul-subtitle">Apply for your investment account</div>
              <RegisterForm onBack={() => setMode("login")} />
            </>
          )}

          <div className="ul-footer-note">
            🔐 Secure login · Powered by SkyUp Digital Solution
          </div>
        </div>
      </div>
    </div>
  );
}