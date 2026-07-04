import { useState, useEffect } from "react";

const COLORS = {
  navy: "#0B1F3E",
  navyDark: "#060F1E",
  navyLight: "#162D52",
  blue: "#1A7FD4",
  blueDark: "#0F5FA8",
  bluePale: "#E8F4FD",
  gold: "#D4A017",
  goldLight: "#F5C842",
  goldPale: "#FDF6DC",
  white: "#FFFFFF",
  offWhite: "#F8FAFC",
  gray200: "#E2E8F0",
  gray400: "#94A3B8",
  gray600: "#475569",
  danger: "#EF4444",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes float1 {
    0%, 100% { transform: translateY(0px) translateX(0px); }
    33%       { transform: translateY(-18px) translateX(8px); }
    66%       { transform: translateY(10px) translateX(-6px); }
  }
  @keyframes float2 {
    0%, 100% { transform: translateY(0px) translateX(0px); }
    50%       { transform: translateY(-24px) translateX(-12px); }
  }
  @keyframes float3 {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-14px) rotate(180deg); }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50%       { transform: scale(1.1); opacity: 1; }
  }
  @keyframes particleDrift {
    0%   { transform: translateY(0) translateX(0); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { transform: translateY(-130px) translateX(15px); opacity: 0; }
  }
  @keyframes borderGlow {
    0%, 100% { box-shadow: 0 0 0 3px rgba(26,127,212,.13); }
    50%       { box-shadow: 0 0 0 4px rgba(26,127,212,.25); }
  }
  @keyframes badgePop {
    0%   { transform: scale(0.8); opacity: 0; }
    60%  { transform: scale(1.06); }
    100% { transform: scale(1); opacity: 1; }
  }

  body {
    font-size: 14px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  @media (min-width: 768px) { body { font-size: 15px; } }
  @media (min-width: 1024px) { body { font-size: 16px; } }

  /* ─── Main Page ────────────────────────────────────────────────── */
  .al-page { min-height:100vh; display:flex; flex-direction:column; font-family:'DM Sans',sans-serif; background:#F8FAFC; overflow-x:hidden; }
  
  .al-mobile-header { order:-1; width:100%; height:120px; background:linear-gradient(160deg,#060D1A 0%,#0F1D36 100%); display:flex; align-items:center; justify-content:flex-start; padding-left:24px; position:relative; overflow:hidden; border-bottom:1px solid rgba(255,255,255,0.08); }
  @media(min-width:768px){ .al-mobile-header { display:none; } }

  .al-mobile-header::before {
    content:''; position:absolute; inset:0;
    background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 24px 24px;
    pointer-events:none;
  }

  @media (min-width: 768px) {
    .al-page { flex-direction: row; }
  }

  /* ─── Left Sidebar ─────────────────────────────────────────────── */
  .al-left {
    order: 2;
    display: flex;
    width: 100%;
    min-height: auto;
    background: linear-gradient(160deg, #060F1E 0%, #0B1F3E 45%, #162D52 100%);
    flex-direction: column;
    justify-content: space-between;
    padding: 32px 24px;
    position: relative;
    overflow: hidden;
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

  @media (min-width: 768px) {
    .al-left {
      order: unset;
      width: 44%;
      min-height: 100vh;
      padding: 32px 32px;
    }
  }

  @media (min-width: 1024px) {
    .al-left {
      padding: 44px 48px;
    }
  }

  .al-left::after {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.04)'/%3E%3C/svg%3E") repeat;
    pointer-events: none;
  }

  .al-orb1{position:absolute;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(26,127,212,0.1) 0%,transparent 70%);top:-80px;right:-80px;pointer-events:none;animation:float1 12s ease-in-out infinite}
  .al-orb2{position:absolute;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(212,160,23,0.08) 0%,transparent 70%);bottom:-40px;left:-60px;pointer-events:none;animation:float2 15s ease-in-out infinite}
  .al-orb3 {
    position: absolute; width: 160px; height: 160px; border-radius: 50%;
    background: radial-gradient(circle, rgba(26,127,212,0.1) 0%, transparent 70%);
    bottom: 200px; right: 40px; pointer-events: none;
    animation: float3 7s ease-in-out infinite;
  }
  .al-particle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    pointer-events: none;
    animation: particleDrift linear infinite;
  }

  .al-center { position: relative; z-index: 2; margin-top: 20px; }
  @media (min-width: 768px) { .al-center { margin-top: 0; } }

  .al-logo { position: relative; z-index: 2; animation: fadeUp 0.6s 0.1s both; }
  @media (max-width: 767px) { .al-logo { display: none; } }

  .al-logo-m { position: relative; z-index: 2; animation: fadeUp 0.6s both; }

  .al-logo-inner { display: flex; align-items: center; gap: 12px; }

  @media (min-width: 1024px) {
    .al-logo-inner { gap: 14px; }
  }

  .al-logo-placeholder { width: 45px; height: 45px; border-radius: 12px; }

  @media (min-width: 1024px) {
    .al-logo-placeholder { width: 50px; height: 50px; border-radius: 14px; }
  }

  .al-logo-text .name { font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 700;
    color: #fff; letter-spacing: 0.3px; line-height: 1; }

  @media (min-width: 1024px) {
    .al-logo-text .name { font-size: 19px; }
  }

  .al-logo-text .sub  { font-size: 9px; color: rgba(255,255,255,0.55);
    letter-spacing: 2px; text-transform: uppercase; margin-top: 3px; }

  @media (min-width: 1024px) {
    .al-logo-text .sub { font-size: 10px; letter-spacing: 2.5px; margin-top: 4px; }
  }

  .al-center { position: relative; z-index: 2; }
  .al-tagline {
    font-family: 'Sora', sans-serif;
    font-size: 24px; font-weight: 800; color: #fff;
    line-height: 1.22; margin-bottom: 12px; letter-spacing: -0.5px;
    animation: fadeUp 0.7s 0.25s both;
  }

  @media (min-width: 1024px) {
    .al-tagline { font-size: 30px; margin-bottom: 14px; letter-spacing: -0.6px; }
  }

  .al-tagline span { color: #F5C842; }
  .al-tagline-sub {
    font-size: 12px; color: rgba(255,255,255,0.62);
    line-height: 1.6; max-width: 280px;
    animation: fadeUp 0.7s 0.35s both;
  }

  @media (min-width: 1024px) {
    .al-tagline-sub { font-size: 13.5px; line-height: 1.72; max-width: 300px; }
  }

  .al-stats {
    display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap;
    animation: fadeUp 0.7s 0.45s both;
  }

  @media (min-width: 1024px) {
    .al-stats { gap: 12px; margin-top: 32px; }
  }

  .al-stat {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.13);
    border-radius: 12px; padding: 10px 14px;
    backdrop-filter: blur(6px);
    transition: transform 0.25s, background 0.25s; cursor: default;
    font-size: 12px;
  }

  @media (min-width: 1024px) {
    .al-stat { padding: 12px 18px; font-size: 14px; }
  }

  .al-stat:hover { transform: translateY(-3px); background: rgba(255,255,255,0.12); }
  .al-stat-val { font-family: 'Sora', sans-serif; font-size: 18px; font-weight: 700; color: #F5C842; }

  @media (min-width: 1024px) {
    .al-stat-val { font-size: 20px; }
  }

  .al-stat-lbl { font-size: 9px; color: rgba(255,255,255,0.52); margin-top: 2px; letter-spacing: 0.3px; }

  @media (min-width: 1024px) {
    .al-stat-lbl { font-size: 10px; letter-spacing: 0.4px; }
  }

  .al-divider-line {
    width: 100%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    margin: 18px 0; animation: fadeUp 0.7s 0.5s both;
  }

  @media (min-width: 1024px) {
    .al-divider-line { margin: 24px 0; }
  }

  .al-trust { display: flex; gap: 14px; flex-wrap: wrap; animation: fadeUp 0.7s 0.55s both; }

  @media (min-width: 1024px) {
    .al-trust { gap: 20px; }
  }

  .al-trust-item { display: flex; align-items: center; gap: 6px;
    font-size: 11px; color: rgba(255,255,255,0.5); }

  @media (min-width: 1024px) {
    .al-trust-item { gap: 7px; font-size: 12px; }
  }

  .al-trust-dot { width: 5px; height: 5px; border-radius: 50%; background: #F5C842; opacity: 0.7; }

  @media (min-width: 1024px) {
    .al-trust-dot { width: 6px; height: 6px; }
  }

  .al-footer { position: relative; z-index: 2;
    font-size: 10px; color: rgba(255,255,255,0.3);
    animation: fadeUp 0.7s 0.6s both; }

  @media (min-width: 1024px) {
    .al-footer { font-size: 11px; }
  }

  /* ─── Right Form Section ────────────────────────────────────────── */
  .al-right {
    order: 1;
    flex: none; display: flex; align-items: center; justify-content: center;
    padding: 40px 20px;
    animation: fadeSlideUp .7s cubic-bezier(.22,1,.36,1) both;
    overflow-y: visible;
    width: 100%;
    min-height: auto;
  }

  @media (min-width: 768px) {
    .al-right { order: unset; flex: 1; padding: 48px 36px; width: 56%; min-height: 100vh; overflow-y: auto; }
  }

  @media (min-width: 1024px) {
    .al-right { padding: 48px 52px; }
  }

  .al-form-card { width: 100%; max-width: 400px; }

  @media (min-width: 1024px) {
    .al-form-card { max-width: 420px; }
  }

  /* ─── Badge ────────────────────────────────────────────────────── */
  .al-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: #FDF6DC; border: 1px solid rgba(212,160,23,0.35);
    border-radius: 24px; padding: 5px 14px;
    font-size: 10px; font-weight: 700; color: #A37800;
    margin-bottom: 16px; letter-spacing: 0.8px;
    animation: badgePop 0.5s 0.65s both;
  }

  @media (minwidth: 1024px) {
    .al-badge { margin-bottom: 20px; padding: 5px 16px; font-size: 11px; letter-spacing: 1px; gap: 7px; }
  }

  .al-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #D4A017;
    animation: pulse 2s 1s ease-in-out infinite; }

  /* ─── Form Title ────────────────────────────────────────────────── */
  .al-title { font-family: 'Sora', sans-serif; font-size: 24px; font-weight: 800;
    color: #0B1F3E; margin-bottom: 4px; letter-spacing: -0.4px;
    animation: fadeUp 0.6s 0.72s both; }

  @media (min-width: 480px) {
    .al-title { font-size: 26px; }
  }

  @media (min-width: 1024px) {
    .al-title { font-size: 30px; margin-bottom: 5px; letter-spacing: -0.5px; }
  }

  .al-subtitle { font-size: 13px; color: #475569; margin-bottom: 24px;
    animation: fadeUp 0.6s 0.78s both; }

  @media (min-width: 1024px) {
    .al-subtitle { font-size: 13.5px; margin-bottom: 32px; }
  }

  /* ─── Form Fields ──────────────────────────────────────────────── */
  .al-field { margin-bottom: 16px; }

  @media (min-width: 1024px) {
    .al-field { margin-bottom: 18px; }
  }

  .al-field.f1 { animation: fadeUp 0.6s 0.84s both; }
  .al-field.f2 { animation: fadeUp 0.6s 0.90s both; }

  .al-label { display: block; font-size: 11px; font-weight: 600;
    color: #475569; margin-bottom: 6px; letter-spacing: 0.5px; text-transform: uppercase; }

  @media (min-width: 1024px) {
    .al-label { font-size: 12px; margin-bottom: 7px; letter-spacing: 0.6px; }
  }

  .al-input-wrap { position: relative; }
  .al-input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    font-size: 14px; color: #94A3B8; pointer-events: none; }

  @media (min-width: 1024px) {
    .al-input-icon { left: 14px; font-size: 15px; }
  }

  .al-input {
    width: 100%; padding: 12px 12px 12px 40px; font-size: 16px;
    font-family: 'DM Sans', sans-serif;
    border: 1.5px solid #E2E8F0; border-radius: 10px;
    background: #FAFAFA; color: #0B1F3E; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    min-height: 44px;
  }

  @media (min-width: 768px) {
    .al-input { font-size: 14px; padding: 13px 14px 13px 44px; border-radius: 12px; }
  }

  .al-input:focus {
    border-color: #1A7FD4; box-shadow: 0 0 0 4px rgba(26,127,212,0.1);
    background: #fff; animation: borderGlow 2s ease-in-out infinite;
  }
  .al-input.error { border-color: #EF4444; }
  
  .al-eye { position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    color: #94A3B8; font-size: 14px; padding: 4px; transition: color 0.2s; }

  @media (min-width: 1024px) {
    .al-eye { right: 12px; font-size: 15px; }
  }

  .al-eye:hover { color: #1A7FD4; }
  .al-error { font-size: 12px; color: #EF4444; margin-top: 4px; }

  /* ─── Forgot Password ───────────────────────────────────────────── */
  .al-forgot-row { display: flex; justify-content: flex-end; margin-top: 4px;
    animation: fadeUp 0.6s 1.0s both; }
  .al-forgot { font-size: 12px; color: #1A7FD4; background: none; border: none;
    cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 600; transition: opacity 0.2s; }

  @media (min-width: 1024px) {
    .al-forgot { font-size: 12.5px; }
  }

  .al-forgot:hover { opacity: 0.7; }

  /* ─── Submit Button ─────────────────────────────────────────────── */
  .al-submit {
    width: 100%; padding: 13px 0; font-size: 14px; font-weight: 700;
    font-family: 'Sora', sans-serif;
    border: none; border-radius: 10px; cursor: pointer;
    background: linear-gradient(135deg, #1A7FD4 0%, #0F5FA8 100%);
    color: #fff; letter-spacing: 0.3px;
    box-shadow: 0 6px 20px rgba(26,127,212,0.38);
    margin-top: 16px;
    transition: box-shadow 0.25s, transform 0.15s;
    animation: fadeUp 0.6s 1.05s both;
    position: relative; overflow: hidden;
    min-height: 44px;
  }

  @media (min-width: 768px) {
    .al-submit { padding: 14px 0; font-size: 15px; border-radius: 12px; margin-top: 18px; letter-spacing: 0.4px; }
  }

  .al-submit::before {
    content: ''; position: absolute; top: 0; left: -100%;
    width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
    transform: skewX(-20deg); transition: left 0s;
  }
  .al-submit:hover::before { left: 160%; transition: left 0.55s ease; }
  .al-submit:hover { box-shadow: 0 8px 28px rgba(26,127,212,0.48); transform: translateY(-1px); }
  .al-submit:active { transform: scale(0.98); }

  /* ─── Footer ────────────────────────────────────────────────────── */
  .al-footer-note { margin-top: 20px; text-align: center; font-size: 11px; color: #94A3B8;
    animation: fadeUp 0.6s 1.2s both; }

  @media (min-width: 1024px) {
    .al-footer-note { margin-top: 28px; font-size: 11.5px; }
  }

  /* ─── Touch Optimization ───────────────────────────────────────── */
  @media (orientation: landscape) and (max-height: 500px) {
    .al-page { overflow-y: auto; }
    .al-left { padding: 20px 24px; }
    .al-right { padding: 16px 12px; }
    .al-orb1, .al-orb2, .al-orb3 { display: none; }
  }
`;

const PARTICLES = [
  { left: "12%", dur: "9s", delay: "0s", size: 3 },
  { left: "30%", dur: "13s", delay: "2s", size: 2 },
  { left: "52%", dur: "10s", delay: "4s", size: 4 },
  { left: "71%", dur: "15s", delay: "1s", size: 2 },
  { left: "85%", dur: "11s", delay: "6s", size: 3 },
  { left: "40%", dur: "12s", delay: "3.5s", size: 2 },
];

const STATS = [
  { value: "2.4K+", label: "Active Loans" },
  { value: "98%", label: "Recovery Rate" },
  { value: "₹12Cr+", label: "Disbursed" },
];


const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
export default function AdminLogin({ onLogin, onSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Forgot Password States
  const [view, setView] = useState("login"); // "login" or "forgot"
  const [forgotStep, setForgotStep] = useState("send-otp"); // "send-otp", "verify-otp", "reset-password"
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPass, setForgotNewPass] = useState("");
  const [forgotConfirmPass, setForgotConfirmPass] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

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
    if (!email) {
      e.email = "Email or Phone is required";
    } else {
      const trimmed = email.trim();
      const isPhone = /^\d+$/.test(trimmed);
      if (isPhone) {
        if (trimmed.length < 10) {
          e.email = "Phone number must be at least 10 digits";
        }
      } else {
        if (!/\S+@\S+\.\S+/.test(trimmed)) {
          e.email = "Enter a valid email address or phone number";
        }
      }
    }
    if (!password) e.pass = "Password is required";
    else if (password.length < 6) e.pass = "Minimum 6 characters";
    return e;
  };

  const handleSendForgotOtp = async () => {
    if (!forgotPhone || forgotPhone.trim().length < 10) {
      setForgotError("Please enter a valid registered phone number");
      return;
    }
    setForgotError("");
    setForgotMessage("");
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/admin/forgot-password/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: forgotPhone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setForgotMessage("OTP sent successfully to your phone number!");
      setForgotStep("verify-otp");
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyForgotOtp = async () => {
    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      setForgotError("Please enter the 6-digit OTP");
      return;
    }
    setForgotError("");
    setForgotMessage("");
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/admin/forgot-password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: forgotPhone.trim(), otp: forgotOtp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP");
      setResetToken(data.resetToken);
      setForgotMessage("OTP verified! Please set your new password below.");
      setForgotStep("reset-password");
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotNewPass || forgotNewPass.length < 6) {
      setForgotError("Password must be at least 6 characters");
      return;
    }
    if (forgotNewPass !== forgotConfirmPass) {
      setForgotError("Passwords do not match");
      return;
    }
    setForgotError("");
    setForgotMessage("");
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/admin/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, password: forgotNewPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");
      
      // Success! Reset everything and go back to login
      setForgotPhone("");
      setForgotOtp("");
      setForgotNewPass("");
      setForgotConfirmPass("");
      setResetToken("");
      setForgotError("");
      setForgotMessage("");
      
      // Put a nice success message on the main login screen
      setErrors({ submit: "Password changed successfully! Please log in with your new password." });
      setView("login");
      setForgotStep("send-otp");
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      // Save token and admin info for sidebar display
      sessionStorage.setItem("adminToken", data.token);
      sessionStorage.setItem("adminInfo", JSON.stringify(data.admin || {}));
      onLogin();
    } catch (err) {
      setErrors(p => ({ ...p, submit: err.message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="al-page">
      {/* Mobile-only header with logo */}
      <div className="al-mobile-header">
        <div className="al-logo-m">
          <div className="al-logo-inner">
            <div className="al-logo-placeholder">
              {/* <img src="/logo.png" alt="Logo" className="al-logo-img" /> */}
            </div>
            <div className="al-logo-text">
              <div className="name">SkyUp Digital</div>
              <div className="sub">Solution</div>
            </div>
          </div>
        </div>
      </div>

      <div className="al-left">
        <div className="al-orb1" /><div className="al-orb2" /><div className="al-orb3" />

        {PARTICLES.map((p, i) => (
          <div key={i} className="al-particle" style={{
            left: p.left, bottom: "0",
            width: p.size, height: p.size,
            animationDuration: p.dur, animationDelay: p.delay,
          }} />
        ))}

        <div className="al-logo">
          <div className="al-logo-inner">
            <div className="al-logo-placeholder">
              {/* <img src="/logo.png" alt="Logo" className="al-logo-img" /> */}
            </div>
            <div className="al-logo-text">
              <div className="name">SkyUp Digital</div>
              <div className="sub">Solution</div>
            </div>
          </div>
        </div>

        <div className="al-center">
          <div className="al-tagline">
            Empowering <span>Financial</span><br />
            Growth & Smart Solutions
          </div>
          <div className="al-tagline-sub">
            A comprehensive micro-finance platform built to track
            loans, repayments, and growth — with total confidence.
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

      <div className="al-right">
        {view === "forgot" ? (
          <div className="al-form-card">
            <div className="al-badge">
              <div className="al-badge-dot" />
              PASSWORD RECOVERY
            </div>
            
            <div className="al-title" style={{ animation: "fadeUp 0.6s 0.72s both" }}>Reset Password 🔒</div>
            <div className="al-subtitle" style={{ animation: "fadeUp 0.6s 0.78s both", marginBottom: 24 }}>
              {forgotStep === "send-otp" && "Enter your registered phone number to receive an OTP via MSG91"}
              {forgotStep === "verify-otp" && "Enter the 6-digit OTP sent to your mobile number"}
              {forgotStep === "reset-password" && "Create a secure new password for your account"}
            </div>

            {forgotStep === "send-otp" && (
              <div className="al-field f1" style={{ animation: "fadeUp 0.6s 0.84s both" }}>
                <label className="al-label">Registered Phone Number</label>
                <div className="al-input-wrap">
                  <span className="al-input-icon">📞</span>
                  <input
                    type="text"
                    className="al-input"
                    placeholder="Enter 10-digit mobile number"
                    value={forgotPhone}
                    onChange={e => setForgotPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  />
                </div>
              </div>
            )}

            {forgotStep === "verify-otp" && (
              <div className="al-field f1" style={{ animation: "fadeUp 0.6s 0.84s both" }}>
                <label className="al-label">Enter 6-Digit OTP</label>
                <div className="al-input-wrap">
                  <span className="al-input-icon">🔑</span>
                  <input
                    type="text"
                    className="al-input"
                    placeholder="Enter 6-digit OTP"
                    value={forgotOtp}
                    onChange={e => setForgotOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                </div>
              </div>
            )}

            {forgotStep === "reset-password" && (
              <>
                <div className="al-field f1" style={{ animation: "fadeUp 0.6s 0.84s both" }}>
                  <label className="al-label">New Password</label>
                  <div className="al-input-wrap">
                    <span className="al-input-icon">🔒</span>
                    <input
                      type={showPwd ? "text" : "password"}
                      className="al-input"
                      placeholder="••••••••"
                      value={forgotNewPass}
                      style={{ paddingRight: 44 }}
                      onChange={e => setForgotNewPass(e.target.value)}
                    />
                    <button className="al-eye" onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                <div className="al-field f2" style={{ animation: "fadeUp 0.6s 0.90s both" }}>
                  <label className="al-label">Confirm New Password</label>
                  <div className="al-input-wrap">
                    <span className="al-input-icon">🔒</span>
                    <input
                      type={showPwd ? "text" : "password"}
                      className="al-input"
                      placeholder="••••••••"
                      value={forgotConfirmPass}
                      style={{ paddingRight: 44 }}
                      onChange={e => setForgotConfirmPass(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {forgotError && (
              <div style={{ color: "#EF4444", fontSize: 13, marginTop: 10, marginBottom: 10, textAlign: "center" }}>
                ⚠ {forgotError}
              </div>
            )}

            {forgotMessage && (
              <div style={{ color: "#10B981", fontSize: 13, marginTop: 10, marginBottom: 10, textAlign: "center" }}>
                ✓ {forgotMessage}
              </div>
            )}

            {forgotStep === "send-otp" && (
              <button
                className="al-submit"
                onClick={handleSendForgotOtp}
                disabled={forgotLoading}
                style={{ opacity: forgotLoading ? 0.82 : 1 }}
              >
                {forgotLoading ? "Sending OTP…" : "Send Verification OTP →"}
              </button>
            )}

            {forgotStep === "verify-otp" && (
              <button
                className="al-submit"
                onClick={handleVerifyForgotOtp}
                disabled={forgotLoading}
                style={{ opacity: forgotLoading ? 0.82 : 1 }}
              >
                {forgotLoading ? "Verifying OTP…" : "Verify OTP →"}
              </button>
            )}

            {forgotStep === "reset-password" && (
              <button
                className="al-submit"
                onClick={handleResetPassword}
                disabled={forgotLoading}
                style={{ opacity: forgotLoading ? 0.82 : 1 }}
              >
                {forgotLoading ? "Resetting…" : "Reset & Save Password →"}
              </button>
            )}

            <div style={{ marginTop: 24, textAlign: "center", animation: "fadeUp 0.6s 1.2s both" }}>
              <button
                onClick={() => {
                  setView("login");
                  setForgotStep("send-otp");
                  setForgotError("");
                  setForgotMessage("");
                }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#1A7FD4", fontWeight: 700, fontSize: 13,
                  fontFamily: "'DM Sans',sans-serif"
                }}
              >
                ← Back to Login
              </button>
            </div>
          </div>
        ) : (
          <div className="al-form-card">

            <div className="al-badge">
              <div className="al-badge-dot" />
              ADMIN PORTAL
            </div>

            <div className="al-title">Welcome back 👋</div>
            <div className="al-subtitle">Sign in to access the admin dashboard</div>

            <div className="al-field f1">
              <label className="al-label">Email Address / Phone Number</label>
              <div className="al-input-wrap">
                <span className="al-input-icon">✉</span>
                <input
                  type="text"
                  className={`al-input${errors.email ? " error" : ""}`}
                  placeholder="admin@skyupdigital.com or registered phone"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
                />
              </div>
              {errors.email && <div className="al-error">⚠ {errors.email}</div>}
            </div>

            <div className="al-field f2">
              <label className="al-label">Password</label>
              <div className="al-input-wrap">
                <span className="al-input-icon">🔒</span>
                <input
                  type={showPwd ? "text" : "password"}
                  className={`al-input${errors.pass ? " error" : ""}`}
                  placeholder="••••••••"
                  value={password}
                  style={{ paddingRight: 44 }}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, pass: "" })); }}
                />
                <button className="al-eye" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? "🙈" : "👁"}
                </button>
              </div>
              {errors.pass && <div className="al-error">⚠ {errors.pass}</div>}
            </div>

            <div className="al-forgot-row">
              <button className="al-forgot" onClick={() => { setView("forgot"); setForgotStep("send-otp"); setForgotError(""); setForgotMessage(""); }}>Forgot password?</button>
            </div>

            <button
              className="al-submit"
              onClick={handleSubmit}
              disabled={loading}
              style={{ opacity: loading ? 0.82 : 1 }}
            >
              {loading ? "Signing in…" : "Sign In to Admin Portal →"}
            </button>

            {errors.submit && (
              <div style={{ color: "#EF4444", fontSize: 12, marginTop: 10, textAlign: "center" }}>
                ⚠ {errors.submit}
              </div>
            )}

            <div style={{
              marginTop: 24, textAlign: "center", fontSize: 13, color: "#94A3B8",
              animation: "fadeUp 0.6s 1.25s both"
            }}>
              New jeweller shop?{" "}
              <button onClick={onSignup}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#1A7FD4", fontWeight: 700, fontSize: 13,
                  fontFamily: "'DM Sans',sans-serif"
                }}>
                Create Admin Account →
              </button>
            </div>

            <div className="al-footer-note">
              🔐 Secure login · Powered by SkyUp Digital Solution
            </div>

          </div>
        )}
      </div>
    </div>
  );
}