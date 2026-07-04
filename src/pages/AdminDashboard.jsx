import { useState, useEffect, useRef } from "react";
import SecurityVerificationModal from "./components/SecurityVerificationModal";

const TODAY_GOLD_RATE = 6850;
const ADMIN_API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const getFileUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith("http") || filePath.startsWith("data:")) return filePath;
  const clean = filePath.replace(/\\/g, "/").replace(/^\//, "");
  return `${ADMIN_API}/${clean}`;
};

// ─── Data (legacy constants) ──────────────────────────────────────────────
const SCHEMES = [];
const PAYMENTS = [];
const GOLD_HISTORY = [];
const REMINDERS = [];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=DM+Sans:wght@400;500;600;700&display=swap');
  
  :root {
    --bg-page: #F8F4EA;
    --bg-card: #FFFFFF;
    --bg-alt: #FFFDF7;
    --bg-input: #FBF5E3;
    --text-main: #1A1408;
    --text-sub: #5B5240;
    --text-light: #8A8166;
    --border-main: rgba(139,105,20,0.15);
    --border-alt: rgba(11,15,28,0.08);
    --shadow-main: 0 14px 36px rgba(139,105,20,0.15);
    --gold: #D4A017;
    --gold-bg: rgba(212, 160, 23, 0.1);
    --primary: #A47B10;
    --primary-bg: rgba(164,123,16,0.14);
    --success: #22D3AA;
    --success-bg: rgba(34, 211, 170, 0.15);
    --warning: #A47B10;
    --warning-bg: rgba(164,123,16,0.14);
    --danger: #F87171;
    --danger-bg: rgba(248, 113, 113, 0.15);
  }

  .dash-page.dark {
    --bg-page: #05070F;
    --bg-card: #10152A;
    --bg-alt: #0B0F1C;
    --bg-input: #151B35;
    --text-main: #F5F7FB;
    --text-sub: #A7B0C3;
    --text-light: #5C6580;
    --border-main: rgba(232,185,72,0.12);
    --border-alt: rgba(148,163,184,0.10);
    --shadow-main: 0 14px 40px rgba(0,0,0,0.30);
    --primary: #E8B948;
    --primary-bg: rgba(232,185,72,0.12);
    --success: #22D3AA;
    --success-bg: rgba(34, 211, 170, 0.15);
  }

  /* ─── Animations ────────────────────────────────────────────────────── */
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes barGrow { from { height:0 !important; } }
  @keyframes progGrow { from { width:0 !important; } }
  
  /* ─── Base Styles ───────────────────────────────────────────────────── */
  * { box-sizing: border-box; margin:0; padding:0; }
  html { scroll-behavior: smooth; }
  body { 
    font-family: 'DM Sans', sans-serif; 
    background: var(--bg-page); 
    color: var(--text-main);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-size: 14px;
    transition: background 0.3s ease, color 0.3s ease;
  }
  @media (min-width: 768px) { body { font-size: 15px; } }
  @media (min-width: 1024px) { body { font-size: 16px; } }
  
  /* ─── Dashboard Page ────────────────────────────────────────────────── */
  .dash-page { 
    display:flex; 
    min-height:100vh; 
    flex-direction: column;
    font-family:'DM Sans',sans-serif; 
    background:#F1F5F9; 
    overflow-x: hidden;
  }
  @media (min-width: 768px) { 
    .dash-page { 
      flex-direction: row; 
      height: 100vh;
      overflow: hidden;
    } 
  }
  
  /* ─── Scrollbar ────────────────────────────────────────────────────── */
  ::-webkit-scrollbar { width:6px; height:6px; }
  ::-webkit-scrollbar-track { background:#F1F5F9; }
  ::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:99px; }
  ::-webkit-scrollbar-thumb:hover { background:#94A3B8; }
  
  /* ─── Interactive Elements ──────────────────────────────────────────── */
  .table-row:hover td { background:#F8FAFC !important; }
  .bar-fill { animation: barGrow 0.9s cubic-bezier(0.22,1,0.36,1) both; }
  .prog-fill { animation: progGrow 1s cubic-bezier(0.22,1,0.36,1) 0.3s both; }
  .nav-btn:hover { color:rgba(255,255,255,0.88) !important; background:rgba(255,255,255,0.06) !important; }
  .stat-card-wrap:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,0.09) !important; }
  .due-row-item:hover { background:#F0F7FF !important; }
  .action-btn:hover { opacity:0.82; transform:translateY(-1px); }
  .action-btn:active { transform: translateY(0); }
  .upload-box:hover { border-color:#1A7FD4 !important; background:#F0F7FF !important; }
  
  /* ─── Form Elements ────────────────────────────────────────────────── */
  input, select, textarea {
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    min-height: 44px;
  }
  @media (min-width: 768px) { input, select, textarea { font-size: 14px; min-height: 40px; } }
  input:focus, select:focus, textarea:focus { 
    outline:none; 
    border-color:#1A7FD4 !important; 
    box-shadow:0 0 0 3px rgba(26,127,212,0.12) !important; 
  }
  button, a { touch-action: manipulation; }
  
  /* ─── Responsive Stats Grid ─────────────────────────────────────────── */
  .stats-grid { 
    display: grid;
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 12px !important;
  }
  @media (min-width: 1024px) {
    .stats-grid { 
      grid-template-columns: repeat(4, 1fr) !important;
      gap: 14px !important;
    }
  }

  /* ─── 3-col mini stat grids (Schemes/Payments/Reminders/Reports) ──── */
  .mini-stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 12px !important;
  }
  @media (min-width: 640px) {
    .mini-stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
  }

  /* ─── 4-col report grid ─────────────────────────────────────────────── */
  .report-stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 12px !important;
  }
  @media (min-width: 1024px) {
    .report-stats-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 14px !important; }
  }

  /* ─── 3-col mini stats ──────────────────────────────────────────────── */
  .mini-stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  /* ─── 2-col form grids ──────────────────────────────────────────────── */
  .form-grid-2 {
    display: grid;
    grid-template-columns: 1fr !important;
    gap: 14px !important;
  }
  @media (min-width: 640px) {
    .form-grid-2 { grid-template-columns: repeat(2, 1fr) !important; gap: 16px !important; }
  }

  /* ─── 3-col upload grids ────────────────────────────────────────────── */
  .upload-grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 10px !important;
  }
  @media (max-width: 480px) {
    .upload-grid-3 { grid-template-columns: 1fr !important; }
  }

  /* ─── Approvals detail info grid ────────────────────────────────────── */
  .detail-grid-3 {
    display: grid;
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 10px !important;
  }
  @media (min-width: 640px) {
    .detail-grid-3 { grid-template-columns: repeat(3, 1fr) !important; }
  }

  /* ─── Gold rate 2-col grid ──────────────────────────────────────────── */
  .gold-grid-2 {
    display: grid;
    grid-template-columns: 1fr !important;
    gap: 16px !important;
  }
  @media (min-width: 768px) {
    .gold-grid-2 { grid-template-columns: repeat(2, 1fr) !important; }
  }

  /* ─── Mid-row layout ───────────────────────────────────────────────── */
  .mid-row { 
    display: grid;
    grid-template-columns: 1fr !important;
    gap: 14px !important;
  }
  @media (min-width: 768px) {
    .mid-row { 
      grid-template-columns: 1.4fr 1fr !important;
      gap: 16px !important;
    }
  }
  
  /* ─── Dark Theme ────────────────────────────────────────────────────── */
  .dash-page.dark .dash-sidebar { background: linear-gradient(135deg, #05070F 0%, #0B0F1C 100%) !important; }
  .dash-page.dark .dash-header { background: #10152A !important; border-color: rgba(148,163,184,0.1) !important; }
  .dash-page.dark .dash-content { background: #05070F !important; }
  .dash-page.dark { background: #05070F !important; }
  .dash-page.dark .ud-card-bg,
  .dash-page.dark .stat-card-wrap,
  .dash-page.dark .dash-card { background: #10152A !important; border-color: rgba(148,163,184,0.1) !important; color: #F5F7FB !important; }
  
  .lv-pay-modal{
    background:var(--bg-card);
    border-radius:24px;
    width:95%;
    max-width:520px;
    max-height: 90vh;
    display:flex; flex-direction:column;
    border:1px solid var(--border-alt);
    box-shadow:0 32px 80px rgba(0,0,0,0.6);
    animation:lvRise 0.4s cubic-bezier(0.22,1,0.36,1) both;
    position:relative;
  }
  @media(max-width:480px){
    .lv-pay-modal { border-radius: 20px; width: 98%; }
  }
  .lv-pay-head{
    padding:20px 24px; border-bottom:1px solid var(--border-alt);
    flex-shrink: 0;
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
  }
  @media(max-width:480px){
    .lv-pay-head { padding: 16px 20px; border-top-left-radius: 20px; border-top-right-radius: 20px; }
  }
  .lv-pay-body {
    padding: 24px 32px 80px;
    overflow-y: auto;
    flex: 1;
    overflow-x: visible;
  }

  
  .dash-page.dark table th { color: #A7B0C3 !important; border-color: rgba(148,163,184,0.1) !important; }
  .dash-page.dark table td { border-color: rgba(148,163,184,0.1) !important; color: #F5F7FB !important; }
  .dash-page.dark .table-row:hover td { background: #151B35 !important; }
  .dash-page.dark .header-title { color: #F5F7FB !important; }

  /* ─── Dashboard Sidebar ─────────────────────────────────────────────── */
  .dash-sidebar { 
    width: 100% !important;
    background: linear-gradient(135deg, #1A1408 0%, #291F0C 100%);
    color: white;
    flex-shrink: 0;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    display: flex;
    flex-direction: column;
  }
  /* Mobile sidebar: full-width top bar */
  .sidebar-brand {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .sidebar-gold-pill { display: none; }
  /* Mobile: hide regular nav, show hamburger */
  .sidebar-nav { display: none; }
  .sidebar-hamburger {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .mobile-menu-overlay {
    position: fixed; inset: 0; z-index: 500;
    background: rgba(0,0,0,0.5);
    animation: fadeUp 0.15s both;
  }
  .mobile-menu-dropdown {
    position: fixed;
    top: 58px; right: 12px;
    z-index: 600;
    background: #1A1408;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 14px;
    padding: 8px 0;
    min-width: 220px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    animation: fadeUp 0.18s cubic-bezier(0.22,1,0.36,1) both;
  }
  .mobile-menu-item {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 20px; color: rgba(255,255,255,0.75);
    background: none; border: none; width: 100%;
    font-size: 14px; font-weight: 500; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    text-align: left; transition: all 0.15s;
  }
  .mobile-menu-item:hover, .mobile-menu-item.active { 
    background: rgba(26,127,212,0.25); 
    color: #fff; 
  }
  .mobile-menu-divider {
    height: 1px; background: rgba(255,255,255,0.08);
    margin: 6px 0;
  }
  .mobile-gold-section {
    padding: 10px 20px 14px;
  }
  .nav-btn {
    white-space: nowrap;
    flex-direction: row !important;
    padding: 8px 14px !important;
    border-radius: 8px !important;
  }
  .nav-btn.nested-btn {
    padding-left: 36px !important;
  }
  .mobile-menu-item.nested-item {
    padding-left: 36px !important;
  }
  .sidebar-footer { display: none; }
  @media (min-width: 768px) {
    .dash-sidebar { 
      width: 240px !important;
      height: 100vh !important;
      border-bottom: none;
      border-right: 1px solid rgba(255,255,255,0.1);
      flex-direction: column;
      display: flex;
      position: sticky;
      top: 0;
      overflow: hidden;
    }
    .sidebar-brand {
      padding: 0 20px 20px;
      margin-top: 20px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      justify-content: flex-start;
      gap: 12px;
    }
    .sidebar-gold-pill {
      display: flex;
      margin: 14px 12px;
      background: rgba(212,160,23,0.12);
      border: 1px solid rgba(212,160,23,0.25);
      border-radius: 12px;
      padding: 10px 14px;
      align-items: center;
      gap: 10px;
    }
    /* Desktop: show regular nav, hide hamburger */
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      padding: 0;
      gap: 0;
      flex: 1;
    }
    .sidebar-nav::-webkit-scrollbar { width: 4px; }
    .sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
    .sidebar-hamburger { display: none; }
    .mobile-menu-dropdown { display: none !important; }
    .nav-btn {
      white-space: normal;
      flex-direction: row !important;
      padding: 11px 20px !important;
      border-radius: 0 !important;
      width: 100% !important;
    }
    .sidebar-footer {
      display: flex;
      border-top: 1px solid rgba(255,255,255,0.1);
      padding: 16px 20px;
      align-items: center;
      justify-content: space-between;
      background: rgba(0,0,0,0.15);
      backdrop-filter: blur(8px);
    }
  }
  @media (min-width: 1024px) {
    .dash-sidebar { width: 260px !important; }
    .sidebar-brand { padding: 0 24px 24px; margin-top: 24px; }
    .nav-btn { padding: 11px 24px !important; }
  }
  
  /* ─── Dashboard Main Header ─────────────────────────────────────────── */
  .dash-header {
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #E2E8F0;
    box-shadow: 0 1px 8px rgba(0,0,0,0.05);
    position: sticky;
    top: 0;
    z-index: 10;
    padding: 10px 14px;
    gap: 8px;
  }
  .header-gold-widget {
    display: none;
  }
  .header-title-date { display: flex; }
  .header-date { display: none; }
  @media (min-width: 480px) {
    .header-gold-widget { display: flex; }
  }
  @media (min-width: 640px) {
    .dash-header { padding: 12px 20px; }
    .header-date { display: block; }
  }
  @media (min-width: 768px) {
    .dash-header { padding: 14px 24px; }
  }
  @media (min-width: 1024px) {
    .dash-header { padding: 14px 28px; }
  }

  /* ─── Dashboard Content ─────────────────────────────────────────────── */
  .dash-content { 
    flex: 1;
    padding: 14px !important;
    overflow-y: auto;
    min-width: 0;
  }
  @media (min-width: 640px) { .dash-content { padding: 18px !important; } }
  @media (min-width: 768px) { .dash-content { padding: 22px !important; } }
  @media (min-width: 1024px) { .dash-content { padding: 26px !important; } }
  @media (min-width: 1440px) { .dash-content { padding: 32px !important; } }

  /* ─── Modals and Grids ──────────────────────────────────────────────── */
  .modal-body-padding { padding: 16px; }
  @media (min-width: 640px) { .modal-body-padding { padding: 24px; } }

  .profile-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
  @media (min-width: 768px) { .profile-grid { grid-template-columns: 1.2fr 1fr; } }

  .profile-right-panel { border-top: 1px solid var(--border-main); padding-top: 24px; }
  @media (min-width: 768px) { .profile-right-panel { border-top: none; padding-top: 0; border-left: 1px solid var(--border-main); padding-left: 24px; } }
  
  /* ─── Tables ────────────────────────────────────────────────────────── */
  table { width:100%; border-collapse:collapse; }
  @media (max-width: 640px) {
    table { font-size: 12px; }
    th, td { padding: 8px 8px !important; }
  }
  @media (min-width: 640px) {
    th, td { padding: 10px 12px !important; }
  }
  @media (min-width: 768px) {
    th, td { padding: 12px 13px !important; }
  }

  /* ─── Approval Modal ────────────────────────────────────────────────── */
  .approvals-modal {
    background: #fff;
    border-radius: 18px;
    width: 100%;
    max-width: 860px;
    box-shadow: 0 24px 64px rgba(11,31,62,0.25);
    overflow: hidden;
  }
  .approvals-panel-padding {
    padding: 12px 16px;
  }
  @media (min-width: 640px) {
    .approvals-panel-padding { padding: 16px 24px; }
  }
  @media (min-width: 768px) {
    .approvals-panel-padding { padding: 16px 28px; }
  }
  .approvals-list-padding {
    padding: 12px 16px;
    max-height: 60vh;
    overflow-y: auto;
  }
  @media (min-width: 640px) {
    .approvals-list-padding { padding: 16px 24px; max-height: 480px; }
  }
  @media (min-width: 768px) {
    .approvals-list-padding { padding: 16px 28px; }
  }
  .approval-row-wrap {
    flex-wrap: wrap;
    gap: 8px !important;
  }
  @media (min-width: 480px) {
    .approval-row-wrap { flex-wrap: nowrap; gap: 14px !important; }
  }
  .approval-meta {
    display: none;
  }
  @media (min-width: 480px) {
    .approval-meta { display: block; }
  }

  /* ─── Landscape Mobile ──────────────────────────────────────────────── */
  @media (orientation: landscape) and (max-height: 600px) {
    .dash-content { padding: 10px !important; }
    .stats-grid { gap: 8px !important; }
  }
  
  /* ─── Large Monitors ────────────────────────────────────────────────── */
  @media (min-width: 1920px) {
    .stats-grid { gap: 18px !important; }
    .mid-row { gap: 20px !important; }
    .dash-content { padding: 40px !important; }
  }

  /* ─── Table Container ────────────────────────────────────────────────── */
  .table-container {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin-bottom: 1rem;
    border-radius: 12px;
    border: 1px solid var(--border-alt);
  }
  .table-container table {
    min-width: 800px; /* Force scroll on mobile */
  }
  @media (min-width: 1024px) {
    .table-container table {
      min-width: auto; /* Reset on desktop */
    }
  }

  /* ─── Comprehensive Mobile Responsive Overrides ─────────────────────── */

  /* ── Card padding shrinks on mobile ── */
  @media (max-width: 640px) {
    .dash-card, .ud-card-bg { padding: 14px !important; border-radius: 12px !important; }
    .stat-card-wrap { padding: 12px 14px !important; border-radius: 12px !important; }
  }

  /* ── Chit management header row wraps on mobile ── */
  .chit-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }
  @media (max-width: 640px) {
    .chit-header-row { flex-direction: column; align-items: flex-start; }
    .chit-header-row > div:last-child { width: 100%; display: flex; gap: 8px; }
    .chit-header-row button { flex: 1; padding: 10px 12px !important; font-size: 13px !important; }
  }

  /* ── Enrollment requests modal ── */
  @media (max-width: 640px) {
    .enrollment-request-row {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 12px !important;
    }
    .enrollment-request-actions {
      width: 100% !important;
      flex-direction: row !important;
      justify-content: flex-end !important;
    }
  }

  /* ── User profile modal in User Management ── */
  @media (max-width: 520px) {
    .profile-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
    .profile-right-panel {
      border-top: 1px solid var(--border-main) !important;
      border-left: none !important;
      padding-top: 16px !important;
      padding-left: 0 !important;
    }
    .modal-body-padding { padding: 12px !important; }
    .approvals-modal { border-radius: 14px !important; }
    .approvals-modal > div:first-child { padding: 14px 16px !important; border-radius: 14px 14px 0 0 !important; }
  }

  /* ── Approval row items on very small screens ── */
  @media (max-width: 480px) {
    .approval-row-wrap { flex-direction: column !important; gap: 10px !important; }
    .approval-meta { display: block !important; }
    .detail-grid-3 { grid-template-columns: 1fr 1fr !important; }
  }

  /* ── Touch-friendly buttons ── */
  @media (max-width: 768px) {
    button { touch-action: manipulation; }
    .action-btn { min-height: 40px !important; padding: 8px 14px !important; }
    .nav-btn { min-height: 44px !important; }
  }

  /* ── Gold rate section ── */
  @media (max-width: 480px) {
    .gold-grid-2 { grid-template-columns: 1fr !important; }
  }

  /* ── Payments section table ── */
  @media (max-width: 640px) {
    .table-container { border-radius: 10px !important; }
    .table-container table { min-width: 700px; }
    th, td { padding: 8px 10px !important; font-size: 11px !important; }
  }

  /* ── Header gold widget on mobile ── */
  @media (max-width: 360px) {
    .header-gold-widget { display: none !important; }
    .dash-header { padding: 10px 12px !important; }
  }

  /* ── Reports & reminder cards on mobile ── */
  @media (max-width: 640px) {
    .report-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
    .mini-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
  }

  /* ── Mid-row (dashboard overview) ── */
  @media (max-width: 767px) {
    .mid-row { grid-template-columns: 1fr !important; gap: 12px !important; }
  }

  /* ── Modal backdrop and modal sizing on mobile ── */
  @media (max-width: 640px) {
    .lv-pay-modal { width: 98% !important; border-radius: 16px !important; }
    .approvals-modal { width: 100% !important; max-height: 95vh !important; }
    .approvals-list-padding { max-height: 50vh !important; }
  }

  /* ── Sidebar header (mobile bar) content ── */
  @media (max-width: 767px) {
    .sidebar-brand > div > div:first-child { font-size: 14px !important; }
  }
`;

const Avatar = ({ name, img, size = 30, fontSize = 11 }) => {
  if (img) {
    return (
      <img src={getFileUrl(img)} alt={name} style={{
        width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0,
        border: "1.5px solid var(--border-alt)"
      }} />
    );
  }
  const finalBg = "linear-gradient(135deg, var(--gold), var(--primary))";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: finalBg, display: "flex",
      alignItems: "center", justifyContent: "center", fontSize: fontSize, fontWeight: 700,
      color: "var(--bg-page)", fontFamily: "'Fraunces', serif", flexShrink: 0
    }}>
      {name.split(" ").map(w => w[0]).join("").slice(0, 2)}
    </div>
  );
};

const Badge = ({ status }) => {
  const map = {
    active: { bg: "var(--success-bg)", color: "var(--success)", label: "Active" },
    complete: { bg: "var(--success-bg)", color: "var(--success)", label: "Complete" },
    paid: { bg: "var(--success-bg)", color: "var(--success)", label: "Paid" },
    sent: { bg: "var(--primary-bg)", color: "var(--primary)", label: "Sent" },
    pending: { bg: "var(--warning-bg)", color: "var(--warning)", label: "Pending" },
    reject: { bg: "var(--danger-bg)", color: "var(--danger)", label: "Rejected" },
    overdue: { bg: "var(--danger-bg)", color: "var(--danger)", label: "Overdue" },
    early_exit: { bg: "var(--danger-bg)", color: "var(--danger)", label: "Early Exit" },
  };
  const s = map[status] || map.pending;
  return <span style={{
    fontSize: 10.5, fontWeight: 700, background: s.bg, color: s.color,
    borderRadius: 20, padding: "3px 12px", display: "inline-block", whiteSpace: "nowrap"
  }}>{s.label}</span>;
};

const Card = ({ children, style }) => (
  <div style={{
    background: "var(--bg-card)", borderRadius: 14, padding: "20px 22px",
    boxShadow: "var(--shadow-main)", border: "1px solid var(--border-main)", ...style
  }}>
    {children}
  </div>
);

const CardHeader = ({ title, right }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
    <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-main)", fontFamily: "'Fraunces',serif" }}>{title}</div>
    <div>{right}</div>
  </div>
);

const Input = ({ label, type = "text", placeholder, value, onChange, style, disabled, noMargin, autoComplete }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  return (
    <div style={{ marginBottom: noMargin ? 0 : (isMobile ? 14 : 16), ...style }}>
      {label && <label style={{
        display: "block", fontSize: isMobile ? 11 : 11.5, fontWeight: 600, color: "var(--text-sub)",
        marginBottom: isMobile ? 5 : 6, letterSpacing: 0.5, textTransform: "uppercase"
      }}>{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete={autoComplete}
        style={{
          width: "100%", padding: isMobile ? "11px 12px" : "10px 12px", fontSize: "16px", fontFamily: "'DM Sans',sans-serif",
          border: "1.5px solid var(--border-alt)", borderRadius: 10, background: disabled ? "#F1F5F9" : "var(--bg-input)", color: disabled ? "#64748B" : "var(--text-main)",
          outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", minHeight: "44px", cursor: disabled ? "not-allowed" : "text"
        }} />
    </div>
  );
};

const Btn = ({ children, onClick, color, style }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  return (
    <button onClick={onClick} className="action-btn"
      style={{
        padding: isMobile ? "12px 16px" : "10px 20px",
        fontSize: isMobile ? "13px" : "13.5px",
        fontWeight: 600,
        fontFamily: "'DM Sans',sans-serif",
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
        background: color || "var(--primary)",
        color: "#fff",
        minHeight: isMobile ? "44px" : "auto",
        transition: "opacity 0.2s, transform 0.15s",
        ...style
      }}>
      {children}
    </button>
  );
};

// ── DateInput — styled date picker with calendar icon button ──
const DateInput = ({ label, value, onChange, style, min, max }) => {
  const ref = useRef();
  return (
    <div style={{ ...style }}>
      {label && (
        <label style={{
          display: "block", fontSize: 11, fontWeight: 600, color: "#475569",
          marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5
        }}>{label}</label>
      )}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <input
          ref={ref}
          type="date"
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          style={{
            width: "100%", padding: "10px 12px", fontSize: 16,
            border: "1.5px solid #E2E8F0", borderRadius: 10,
            background: "#fff", outline: "none",
            fontFamily: "inherit", color: value ? "#0B1F3E" : "#94A3B8",
            cursor: "pointer", appearance: "none", WebkitAppearance: "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
            minHeight: 48,
            backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%231A7FD4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='4' width='18' height='18' rx='2' ry='2'/><line x1='16' y1='2' x2='16' y2='6'/><line x1='8' y1='2' x2='8' y2='6'/><line x1='3' y1='10' x2='21' y2='10'/></svg>\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
            backgroundSize: "18px"
          }}
          onFocus={e => { e.target.style.borderColor = "#1A7FD4"; e.target.style.boxShadow = "0 0 0 3px rgba(26,127,212,0.12)"; }}
          onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
        />


        <button
          type="button"
          onClick={() => { ref.current && ref.current.showPicker && ref.current.showPicker(); ref.current && ref.current.focus(); }}
          style={{
            position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
            background: "linear-gradient(135deg,#1A7FD4,#0B5FAB)", border: "none",
            borderRadius: 7, width: 28, height: 28, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 14, flexShrink: 0,
            boxShadow: "0 2px 8px rgba(26,127,212,0.25)",
            transition: "opacity 0.15s, transform 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          title="Pick a date"
        >
          📅
        </button>
      </div>
    </div>
  );
};

// ── Dashboard ──
function DashboardPage({ goldRate, stats, recentSchemes, loading }) {
  const displayStats = [
    { label: "Active Schemes", value: stats?.activeSchemes || "0", sub: "Live plans", icon: "◈", color: "#1A7FD4", bg: "#EEF6FD" },
    { label: "Today's Collection", value: `₹${(stats?.todayCollection || 0).toLocaleString()}`, sub: "Payments received", icon: "₹", color: "#059669", bg: "#ECFDF5" },
    { label: "Pending Payments", value: stats?.pendingPayments || "0", sub: "Needs attention", icon: "⏰", color: "#D97706", bg: "#FFFBEB" },
    { label: "Total Gold Saved", value: `${(stats?.totalGoldSaved || 0).toFixed(3)} g`, sub: "Across all members", icon: "◆", color: "#D4A017", bg: "#FDF6DC" },
  ];

  if (loading) return <div style={{ padding: 100, textAlign: "center", color: "var(--text-light)" }}>Loading dashboard data...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="stats-grid">
        {displayStats.map((s, i) => (
          <div key={s.label} className="stat-card-wrap" style={{
            background: "var(--bg-card)", borderRadius: 16,
            padding: "20px 24px", boxShadow: "var(--shadow-main)", border: "1px solid var(--border-main)",
            transition: "transform 0.2s, box-shadow 0.2s"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 10.5, color: "var(--text-light)", fontWeight: 700, letterSpacing: 0.5, marginBottom: 10, textTransform: "uppercase" }}>{s.label}</div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, color: "var(--text-main)", letterSpacing: -0.5 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--text-sub)", marginTop: 8, fontWeight: 500 }}>{s.sub}</div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--bg-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: s.color, border: `1px solid var(--border-alt)` }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader title="Scheme Progress"
          right={<span style={{ fontSize: 12, fontWeight: 600, color: "#1A7FD4" }}>Latest Activity</span>} />
        <div style={{ overflowX: "auto" }}>
          {recentSchemes.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-sub)" }}>No active schemes yet.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>{["Member", "Started", "Monthly Amount", "Gold Accumulated", "Progress", "Status"].map(h => (
                  <th key={h} style={{
                    padding: "9px 13px", fontSize: 11, fontWeight: 600, color: "#64748B",
                    textAlign: "left", letterSpacing: 0.4, borderBottom: "2px solid #F1F5F9",
                    textTransform: "uppercase", whiteSpace: "nowrap"
                  }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {recentSchemes.slice(0, 5).map(r => {
                  const progressTotal = (r.totalMonths || 13) - 1;
                  const pct = progressTotal > 0 ? Math.round(((r.currentMonth || 0) / progressTotal) * 100) : 0;
                  const userName = r.user?.name || "Unknown";
                  return (
                    <tr key={r._id} className="table-row">
                      <td style={{ padding: "12px 13px", borderBottom: "1px solid #F8FAFC" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <Avatar name={userName} img={r.user?.userPhoto} />
                          <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{userName}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 13px", borderBottom: "1px solid #F8FAFC", fontSize: 12, color: "var(--text-light)" }}>
                        {r.startDate ? new Date(r.startDate).toLocaleDateString("en-IN") : "—"}
                      </td>
                      <td style={{ padding: "12px 13px", borderBottom: "1px solid #F8FAFC" }}>
                        <span style={{ fontSize: 12, background: "#F0FDF4", color: "#059669", borderRadius: 20, padding: "3px 10px", fontWeight: 600 }}>₹{(r.monthlyAmount || 0).toLocaleString()}</span>
                      </td>
                      <td style={{ padding: "12px 13px", borderBottom: "1px solid #F8FAFC" }}>
                        <b style={{ color: "#D4A017" }}>{(r.totalGramsAccumulated || 0).toFixed(3)}g</b>
                      </td>
                      <td style={{ padding: "12px 13px", borderBottom: "1px solid #F8FAFC" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 7, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
                            <div className="prog-fill" style={{ height: "100%", width: pct + "%", background: "linear-gradient(90deg,#1A7FD4,#60B4F5)", borderRadius: 99 }} />
                          </div>
                          <span style={{ fontSize: 11.5, color: "#475569", fontWeight: 600, minWidth: 32 }}>{r.currentMonth || 0}/{progressTotal}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 13px", borderBottom: "1px solid #F8FAFC" }}><Badge status={r.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}

// ── User Management ──
const PENDING_APPROVALS = [
  {
    id: "REG001", name: "Pooja Sharma", phone: "91XX-XX-2233", email: "pooja@gmail.com",
    aadhar: "1234-5678-9090", dob: "15 Mar 1995", occupation: "Teacher",
    address: "12, MG Road, Bangalore", submittedAt: "09 Apr 2026 10:30 AM",
    aadharCardPhoto: "aadhar_pooja.jpg", userPhoto: "photo_pooja.jpg",
    status: "pending", rejectReason: "",
  },
  {
    id: "REG002", name: "Kiran Rao", phone: "92XX-XX-4455", email: "kiran@gmail.com",
    aadhar: "9876-5432-1010", dob: "22 Jul 1988", occupation: "Farmer",
    address: "45, Ring Road, Mysore", submittedAt: "09 Apr 2026 11:15 AM",
    aadharCardPhoto: "aadhar_kiran.jpg", userPhoto: "photo_kiran.jpg",
    status: "pending", rejectReason: "",
  },
  {
    id: "REG003", name: "Sundar Babu", phone: "93XX-XX-6677", email: "sundar@gmail.com",
    aadhar: "5432-1098-7654", dob: "01 Jan 1992", occupation: "Shop Owner",
    address: "7, Cross Street, Chennai", submittedAt: "10 Apr 2026 09:00 AM",
    aadharCardPhoto: "aadhar_sundar.jpg", userPhoto: "photo_sundar.jpg",
    status: "pending", rejectReason: "",
  },
];

function ApprovalsPanel({ onClose }) {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rejectBox, setRejectBox] = useState(false);
  const [reason, setReason] = useState("");
  const [filter, setFilter] = useState("pending");
  const [viewDoc, setViewDoc] = useState(null);

  const token = sessionStorage.getItem("adminToken");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setApprovals(data.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const doApprove = async (id) => {
    try {
      const res = await fetch(`${ADMIN_API}/api/users/${id}/approve`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setApprovals(p => p.map(a => a._id === id ? { ...a, status: "active" } : a));
        setSelected(null);
      }
    } catch (err) { console.error(err); }
  };

  const doReject = async (id) => {
    if (!reason.trim()) return alert("Please enter a rejection reason.");
    try {
      const res = await fetch(`${ADMIN_API}/api/users/${id}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        setApprovals(p => p.map(a => a._id === id ? { ...a, status: "rejected", rejectReason: reason } : a));
        setRejectBox(false);
        setReason("");
        setSelected(null);
      }
    } catch (err) { console.error(err); }
  };

  const filtered = approvals.filter(a => {
    if (filter === "pending") return a.status === "pending";
    if (filter === "approved") return a.status === "active";
    if (filter === "rejected") return a.status === "rejected";
    return true;
  });

  const counts = {
    pending: approvals.filter(a => a.status === "pending").length,
    approved: approvals.filter(a => a.status === "active").length,
    rejected: approvals.filter(a => a.status === "rejected").length,
  };

  const StatusBadge = ({ status }) => {
    const m = {
      pending: { bg: "#FEF3C7", color: "#D97706", label: "Pending" },
      active: { bg: "#ECFDF5", color: "#059669", label: "Approved" },
      rejected: { bg: "#FEF2F2", color: "#EF4444", label: "Rejected" },
    };
    const s = m[status] || m.pending;
    return <span style={{ fontSize: 11, fontWeight: 600, background: s.bg, color: s.color, borderRadius: 20, padding: "3px 11px" }}>{s.label}</span>;
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(11,31,62,0.55)", zIndex: 1000,
      display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto"
    }}>

      {/* ── Document Viewer Modal ── */}
      {viewDoc && (() => {
        const isPDF = viewDoc.url.toLowerCase().endsWith(".pdf");
        const fileName = viewDoc.url.split("/").pop() || viewDoc.label;
        return (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 2000,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24
          }}
            onClick={() => setViewDoc(null)}>
            <div style={{
              background: "#fff", borderRadius: 16, overflow: "hidden",
              width: "100%", maxWidth: isPDF ? 860 : 660,
              height: isPDF ? "90vh" : "auto", maxHeight: "90vh",
              display: "flex", flexDirection: "column"
            }}
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div style={{
                background: "#0B1F3E", padding: "14px 20px", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{isPDF ? "📄" : "🖼️"}</span>
                  <div>
                    <div style={{
                      fontFamily: "'Sora',sans-serif", fontSize: 15,
                      fontWeight: 700, color: "#fff"
                    }}>{viewDoc.label}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                      {isPDF ? "PDF Document" : "Image"} · {fileName}
                    </div>
                  </div>
                </div>
                <button onClick={() => setViewDoc(null)}
                  style={{
                    background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8,
                    width: 34, height: 34, cursor: "pointer", color: "#fff", fontSize: 18,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>✕</button>
              </div>

              {/* Content */}
              <div style={{
                flex: 1, overflow: "hidden", background: "#F1F5F9",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                {isPDF ? (
                  <iframe
                    src={viewDoc.url}
                    title={viewDoc.label}
                    style={{ width: "100%", height: "100%", border: "none" }}
                  />
                ) : (
                  <div style={{ padding: 20, textAlign: "center" }}>
                    <img
                      src={viewDoc.url}
                      alt={viewDoc.label}
                      style={{
                        maxWidth: "100%", maxHeight: "65vh",
                        borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                        objectFit: "contain"
                      }}
                      onError={e => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div style={{
                      display: "none", flexDirection: "column",
                      alignItems: "center", gap: 10, color: "#64748B", padding: 20
                    }}>
                      <div style={{ fontSize: 48 }}>🖼️</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>Image could not load</div>
                      <a href={viewDoc.url} target="_blank" rel="noreferrer"
                        style={{
                          padding: "8px 18px", background: "#1A7FD4", color: "#fff",
                          borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none"
                        }}>
                        ⬇ Open Image
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{
                padding: "12px 20px", borderTop: "1px solid #E2E8F0", flexShrink: 0,
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "#fff"
              }}>
                <div style={{ fontSize: 12, color: "#94A3B8" }}>
                  Click outside or ✕ to close
                </div>
                <a href={viewDoc.url} target="_blank" rel="noreferrer"
                  style={{
                    padding: "7px 18px", background: "#EEF6FD", color: "#1A7FD4",
                    borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none",
                    display: "flex", alignItems: "center", gap: 6
                  }}>
                  ⬇ Open / Download
                </a>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="approvals-modal">

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,#0B1F3E,#162D52)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px"
        }}>
          <div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 700, color: "#fff" }}>
              📋 User Approvals
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>
              Review and approve new user registrations
            </div>
          </div>
          <button onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8,
              width: 34, height: 34, cursor: "pointer", color: "#fff", fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>✕</button>
        </div>

        {/* Stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0,
          borderBottom: "1px solid #F1F5F9"
        }}>
          {[
            { label: "Pending", count: counts.pending, color: "#D97706", bg: "#FFFBEB", id: "pending" },
            { label: "Approved", count: counts.approved, color: "#059669", bg: "#ECFDF5", id: "approved" },
            { label: "Rejected", count: counts.rejected, color: "#EF4444", bg: "#FEF2F2", id: "rejected" },
          ].map(s => (
            <button key={s.id} onClick={() => setFilter(s.id)}
              style={{
                padding: "16px 20px", textAlign: "center", border: "none", cursor: "pointer",
                background: filter === s.id ? s.bg : "#fff",
                borderBottom: filter === s.id ? `3px solid ${s.color}` : "3px solid transparent",
                transition: "all 0.2s"
              }}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            </button>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="approvals-panel-padding" style={{
          borderBottom: "1px solid #F1F5F9",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ fontSize: 13, color: "#64748B" }}>
            Showing <b style={{ color: "#0B1F3E" }}>{filtered.length}</b> {filter} requests
          </div>
          <button onClick={() => setFilter("all")}
            style={{
              fontSize: 12, color: filter === "all" ? "#1A7FD4" : "#94A3B8",
              background: "none", border: "none", cursor: "pointer", fontWeight: 600
            }}>
            View All
          </button>
        </div>

        {/* List */}
        <div className="approvals-list-padding">
          {loading && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#94A3B8", fontSize: 14 }}>
              ⏳ Loading registrations…
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#94A3B8", fontSize: 14 }}>
              No {filter} requests found
            </div>
          )}
          {!loading && filtered.map(a => (
            <div key={a._id} style={{
              border: "1.5px solid #F1F5F9", borderRadius: 14,
              marginBottom: 12, overflow: "hidden",
              boxShadow: selected?._id === a._id ? "0 4px 20px rgba(26,127,212,0.15)" : "none"
            }}>

              {/* Row */}
              <div className="approval-row-wrap" style={{
                display: "flex", alignItems: "center", padding: "12px 16px",
                background: selected?._id === a._id ? "#F8FBFF" : "#fff", cursor: "pointer"
              }}
                onClick={() => setSelected(selected?._id === a._id ? null : a)}>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg,#1A7FD4,#0B1F3E)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, fontWeight: 700, color: "#fff"
                }}>
                  {(a.name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "#0B1F3E", fontSize: 14 }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
                    📱 {a.phone} &nbsp;·&nbsp; ✉ {a.email || "—"}
                  </div>
                </div>
                <div className="approval-meta" style={{ fontSize: 12, color: "#64748B", flexShrink: 0 }}>
                  {a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric"
                  }) : "—"}
                </div>
                <StatusBadge status={a.status} />
                <span style={{
                  fontSize: 16, color: "#94A3B8", transition: "transform 0.2s",
                  transform: selected?._id === a._id ? "rotate(180deg)" : "rotate(0deg)"
                }}>▾</span>
              </div>

              {/* Expanded detail */}
              {selected?._id === a._id && (
                <div style={{ padding: "0 18px 18px", borderTop: "1px solid #F1F5F9" }}>
                  <div className="detail-grid-3" style={{ marginTop: 16, marginBottom: 16 }}>
                    {[
                      { label: "Date of Birth", value: a.dateOfBirth ? new Date(a.dateOfBirth).toLocaleDateString("en-IN") : "—" },
                      { label: "Occupation", value: a.occupation || "—" },
                      { label: "Aadhar Number", value: a.aadharNumber || "—" },
                      { label: "Address", value: a.address || "—" },
                      { label: "User ID", value: a.userId || a._id?.slice(-6) },
                    ].map(f => (
                      <div key={f.label} style={{ background: "#F8FAFC", borderRadius: 10, padding: "10px 14px" }}>
                        <div style={{
                          fontSize: 10, fontWeight: 600, color: "#94A3B8", letterSpacing: 0.5,
                          textTransform: "uppercase", marginBottom: 4
                        }}>{f.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0B1F3E" }}>{f.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Documents */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{
                      fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase",
                      letterSpacing: 0.5, marginBottom: 10
                    }}>Uploaded Documents — Click to View</div>
                    <div className="upload-grid-3">
                      {[
                        { label: "Aadhar Card", file: a.aadharCardPhoto, icon: "📄" },
                        { label: "User Photo", file: a.userPhoto, icon: "🤳" },
                      ].map(d => (
                        <div key={d.label}
                          onClick={() => d.file && setViewDoc({ label: d.label, url: getFileUrl(d.file) })}
                          style={{
                            border: `1.5px solid ${d.file ? "#1A7FD4" : "#E2E8F0"}`,
                            borderRadius: 10, padding: "14px", textAlign: "center",
                            background: d.file ? "#EEF6FD" : "#FAFAFA",
                            cursor: d.file ? "pointer" : "default", transition: "all 0.2s"
                          }}>
                          <div style={{ fontSize: 24, marginBottom: 6 }}>{d.icon}</div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 4 }}>{d.label}</div>
                          {d.file
                            ? <div style={{ fontSize: 11, color: "#1A7FD4", fontWeight: 600 }}>👁 View Document</div>
                            : <div style={{ fontSize: 11, color: "#EF4444" }}>❌ Not uploaded</div>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rejection reason display */}
                  {a.status === "rejected" && a.rejectReason && (
                    <div style={{
                      background: "#FEF2F2", border: "1px solid #FECACA",
                      borderRadius: 10, padding: "12px 16px", marginBottom: 14
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#EF4444", marginBottom: 4 }}>❌ Rejection Reason:</div>
                      <div style={{ fontSize: 13, color: "#7F1D1D" }}>{a.rejectReason}</div>
                    </div>
                  )}

                  {/* Reject reason input */}
                  {rejectBox && selected?._id === a._id && (
                    <div style={{
                      background: "#FFF8F0", border: "1.5px solid #FED7AA",
                      borderRadius: 10, padding: "14px 16px", marginBottom: 14
                    }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#C2410C", marginBottom: 8 }}>
                        Rejection Reason (user will see this)
                      </div>
                      <textarea value={reason} onChange={e => setReason(e.target.value)}
                        placeholder="e.g. Aadhar card photo is blurry. Please re-upload a clear photo."
                        rows={3}
                        style={{
                          width: "100%", padding: "10px 12px", fontSize: 13, borderRadius: 8,
                          border: "1.5px solid #FED7AA", background: "#fff", resize: "vertical",
                          fontFamily: "'DM Sans',sans-serif", outline: "none", color: "#0B1F3E"
                        }} />
                      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                        <button onClick={() => doReject(a._id)}
                          style={{
                            padding: "8px 18px", background: "#EF4444", color: "#fff",
                            border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600
                          }}>
                          Confirm Reject
                        </button>
                        <button onClick={() => { setRejectBox(false); setReason(""); }}
                          style={{
                            padding: "8px 18px", background: "#F1F5F9", color: "#64748B",
                            border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600
                          }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  {a.status === "pending" && !rejectBox && (
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => doApprove(a._id)}
                        style={{
                          padding: "10px 24px", background: "#059669", color: "#fff",
                          border: "none", borderRadius: 10, cursor: "pointer",
                          fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6
                        }}>
                        ✅ Approve
                      </button>
                      <button onClick={() => setRejectBox(true)}
                        style={{
                          padding: "10px 24px", background: "#FEF2F2", color: "#EF4444",
                          border: "1.5px solid #FECACA", borderRadius: 10, cursor: "pointer",
                          fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6
                        }}>
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

function UserDetailsPanel({ userId, onClose, goldRate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewDoc, setViewDoc] = useState(null);
  const token = sessionStorage.getItem("adminToken");

  useEffect(() => {
    fetch(`${ADMIN_API}/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [userId]);

  const downloadClosedChitReceipt = (s, memberData) => {
    const rate = goldRate || TODAY_GOLD_RATE || 6850;
    const progressPaid = s.currentMonth || 0;
    const progressTotal = (s.totalMonths || 13) - 1;
    const isType2 = s.planType === "Type2";
    const currentGold = isType2 ? (s.totalAmountAccumulated || 0) / rate : (s.totalGramsAccumulated || 0);
    const currentValue = isType2 ? (s.totalAmountAccumulated || 0) : (s.totalGramsAccumulated || 0) * rate;
    const totalPaid = s.monthlyAmount * progressPaid;
    const bonusValue = s.monthlyAmount || 0;
    const bonusGold = rate > 0 ? (s.monthlyAmount || 0) / rate : 0;
    const expectedTotalGold = isType2 ? ((s.totalAmountAccumulated || 0) + bonusValue) / rate : (s.totalGramsAccumulated || 0) + bonusGold;
    const expectedTotalValue = isType2 ? (s.totalAmountAccumulated || 0) + bonusValue : ((s.totalGramsAccumulated || 0) + bonusGold) * rate;

    const receiptText = `--------------------------------------------
          GOLD CHIT MATURITY RECEIPT
--------------------------------------------
Chit ID         : ${s.schemeId || "N/A"}
Plan Type       : ${isType2 ? "Scheme 2 (Amount Conversion)" : "Scheme 1 (Gold Accumulation)"}
Start Date      : ${s.startDate ? new Date(s.startDate).toLocaleDateString("en-IN") : "N/A"}
Settlement Date : ${s.completionDate || s.earlyExitDate || s.updatedAt ? new Date(s.completionDate || s.earlyExitDate || s.updatedAt).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN")}

CUSTOMER DETAILS:
Name            : ${memberData?.name || "N/A"}
User ID         : ${memberData?.userId || "N/A"}
Phone           : ${memberData?.phone || "N/A"}

FINANCIAL BREAKDOWN:
Monthly Amount  : ₹${s.monthlyAmount?.toLocaleString()}
Months Paid     : ${progressPaid} / ${progressTotal}
Total Invested  : ₹${totalPaid.toLocaleString()}
Today's Gold Rate: ₹${rate.toLocaleString()}/g

ACCUMULATION DETAILS:
Gold Accumulated: ${currentGold.toFixed(4)}g
Current Value    : ₹${Math.round(currentValue).toLocaleString()}

MATURITY BONUS DETAILS:
Shop Owner Bonus : 1 Month Free Installment
Bonus Value     : ₹${bonusValue.toLocaleString()}
Bonus Gold Eq.  : ${bonusGold.toFixed(4)}g

FINAL SETTLEMENT PAYOUT:
Total Maturity Gold: ${expectedTotalGold.toFixed(4)}g
Estimated Payout   : ₹${Math.round(expectedTotalValue).toLocaleString()}

--------------------------------------------
    Chit enrollment successfully completed!
--------------------------------------------
`;

    const blob = new Blob([receiptText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Closed_Chit_Receipt_${s.schemeId || s._id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!loading && !data) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(11,31,62,0.55)", zIndex: 1000,
      display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px", overflowY: "auto"
    }}>
      {/* Document Viewer Integration */}
      {viewDoc && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 2000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24
        }} onClick={() => setViewDoc(null)}>
          <img src={viewDoc} alt="Document" style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: 8, boxShadow: "0 0 40px rgba(0,0,0,0.5)" }} />
        </div>
      )}

      <div className="approvals-modal" style={{ maxWidth: 800 }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg,var(--text-main),#162D52)",
          display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Avatar name={data?.name || "?"} img={data?.userPhoto} size={44} fontSize={18} />
            <div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 19, fontWeight: 800, color: "#fff" }}>{data?.name || "User Profile"}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 3, letterSpacing: 0.5, fontWeight: 600 }}>USER ID: {data?.userId || userId.slice(-6)}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, width: 34, height: 34, cursor: "pointer", color: "#fff", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--text-light)" }}>⌛ Retrieving full profile...</div>
        ) : (
          <div className="modal-body-padding">
            <div className="profile-grid">

              {/* Left Column: Basic Info */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", borderBottom: "1px solid var(--border-main)", paddingBottom: 8, marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>Account Information</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[
                    { label: "Phone", value: data.phone, icon: "📞" },
                    { label: "Email", value: data.email, icon: "✉" },
                    { label: "Date of Birth", value: data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString("en-IN") : "—", icon: "🎂" },
                    { label: "Occupation", value: data.occupation || "—", icon: "💼" },
                  ].map(f => (
                    <div key={f.label}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", marginBottom: 4 }}>{f.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>{f.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", marginBottom: 4 }}>Residential Address</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-sub)", lineHeight: 1.5 }}>{data.address || "No address provided"}</div>
                </div>

                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", borderBottom: "1px solid var(--border-main)", paddingBottom: 8, marginTop: 24, marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>KYC Verification</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", marginBottom: 4 }}>Aadhar Number</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: data.aadharNumber ? "var(--text-main)" : "#16A34A", letterSpacing: 0.5 }}>
                      {data.aadharNumber || (data.status === "approved" || data.status === "active" ? "VERIFIED ✅" : "PENDING")}
                    </div>
                  </div>

                </div>
              </div>

              {/* Right Column: Documents & Schemes */}
              <div className="profile-right-panel">
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", borderBottom: "1px solid var(--border-main)", paddingBottom: 8, marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>Enrollment Status</div>
                <div style={{ background: "var(--bg-alt)", borderRadius: 12, padding: 16, border: "1px solid var(--border-main)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-light)", marginBottom: 12 }}>
                    ACTIVE SCHEMES ({(data.schemes || []).filter(s => s.status === "active" || s.status === "pending").length})
                  </div>
                  {(data.schemes || []).filter(s => s.status === "active" || s.status === "pending").length === 0 ? (
                    <div style={{ fontSize: 13, color: "var(--text-light)", fontStyle: "italic" }}>Not enrolled in any active schemes.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {(data.schemes || []).filter(s => s.status === "active" || s.status === "pending").map(s => {
                        const paidMonths = s.currentMonth || 0;
                        const totalInstallments = (s.totalMonths || 13) - 1;
                        const remainingMonths = Math.max(0, totalInstallments - paidMonths);
                        const progress = totalInstallments > 0 ? (paidMonths / totalInstallments) * 100 : 0;

                        return (
                          <div key={s._id} style={{ background: "#fff", border: "1px solid var(--border-alt)", borderRadius: 10, padding: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-main)" }}>{s.template?.name || "Gold Plan"}</div>
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                  <div style={{ fontSize: 11, color: "var(--primary)", fontWeight: 700 }}>₹{(s.monthlyAmount || 0).toLocaleString()}/mo</div>
                                  <div style={{ fontSize: 10, color: "var(--text-light)", fontWeight: 500 }}>• Started: {s.startDate ? new Date(s.startDate).toLocaleDateString("en-IN") : "—"}</div>
                                </div>
                              </div>
                              <Badge status={s.status} />
                            </div>

                            <div style={{ background: "var(--bg-input)", height: 6, borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
                              <div style={{ background: "linear-gradient(90deg, #1A7FD4, #3B82F6)", height: "100%", width: `${progress}%`, transition: "width 1s ease" }} />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                              <div style={{ background: "#F8FAFC", padding: "6px 8px", borderRadius: 6 }}>
                                <div style={{ fontSize: 8, color: "var(--text-light)", fontWeight: 700, textTransform: "uppercase" }}>Paid</div>
                                <div style={{ fontSize: 11, fontWeight: 800, color: "#16A34A" }}>{paidMonths} Months (₹{(paidMonths * s.monthlyAmount).toLocaleString()})</div>
                              </div>
                              <div style={{ background: "#F8FAFC", padding: "6px 8px", borderRadius: 6 }}>
                                <div style={{ fontSize: 8, color: "var(--text-light)", fontWeight: 700, textTransform: "uppercase" }}>Remaining</div>
                                <div style={{ fontSize: 11, fontWeight: 800, color: "#EF4444" }}>{remainingMonths} Months (₹{(remainingMonths * s.monthlyAmount).toLocaleString()})</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", borderBottom: "1px solid var(--border-main)", paddingBottom: 8, marginTop: 24, marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>Closed Chits</div>
                <div style={{ background: "var(--bg-alt)", borderRadius: 12, padding: 16, border: "1px solid var(--border-main)", marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-light)", marginBottom: 12 }}>
                    CLOSED SCHEMES ({(data.schemes || []).filter(s => s.status === "complete" || s.status === "early_exit").length})
                  </div>
                  {(data.schemes || []).filter(s => s.status === "complete" || s.status === "early_exit").length === 0 ? (
                    <div style={{ fontSize: 13, color: "var(--text-light)", fontStyle: "italic" }}>No closed or completed chits.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {(data.schemes || []).filter(s => s.status === "complete" || s.status === "early_exit").map(s => {
                        const paidMonths = s.currentMonth || 0;
                        const totalInstallments = (s.totalMonths || 13) - 1;
                        const progress = totalInstallments > 0 ? (paidMonths / totalInstallments) * 100 : 0;

                        return (
                          <div key={s._id} style={{ background: "#fff", border: "1px solid var(--border-alt)", borderRadius: 10, padding: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-main)" }}>{s.template?.name || "Gold Plan"}</div>
                                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                  <div style={{ fontSize: 11, color: "var(--primary)", fontWeight: 700 }}>₹{(s.monthlyAmount || 0).toLocaleString()}/mo</div>
                                  <div style={{ fontSize: 10, color: "var(--text-light)", fontWeight: 500 }}>• Ended: {s.completionDate || s.earlyExitDate || s.updatedAt ? new Date(s.completionDate || s.earlyExitDate || s.updatedAt).toLocaleDateString("en-IN") : "—"}</div>
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <Badge status={s.status} />
                                <button
                                  onClick={() => downloadClosedChitReceipt(s, data)}
                                  title="Download Receipt"
                                  style={{
                                    background: "rgba(212, 160, 23, 0.1)",
                                    border: "1.5px solid rgba(212, 160, 23, 0.25)",
                                    color: "#D4A017",
                                    width: 32,
                                    height: 32,
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 15,
                                    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
                                  }}
                                  onMouseEnter={e => {
                                    e.currentTarget.style.background = "linear-gradient(135deg, #D4A017, #B3860F)";
                                    e.currentTarget.style.color = "#fff";
                                    e.currentTarget.style.borderColor = "transparent";
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(212, 160, 23, 0.2)";
                                  }}
                                  onMouseLeave={e => {
                                    e.currentTarget.style.background = "rgba(212, 160, 23, 0.1)";
                                    e.currentTarget.style.color = "#D4A017";
                                    e.currentTarget.style.borderColor = "rgba(212, 160, 23, 0.25)";
                                    e.currentTarget.style.transform = "none";
                                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.05)";
                                  }}
                                >
                                  📥
                                </button>
                              </div>
                            </div>

                            <div style={{ background: "var(--bg-input)", height: 6, borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
                              <div style={{ background: "linear-gradient(90deg, #10B981, #059669)", height: "100%", width: `${progress}%`, transition: "width 1s ease" }} />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                              <div style={{ background: "#F8FAFC", padding: "6px 8px", borderRadius: 6 }}>
                                <div style={{ fontSize: 8, color: "var(--text-light)", fontWeight: 700, textTransform: "uppercase" }}>Paid</div>
                                <div style={{ fontSize: 11, fontWeight: 800, color: "#16A34A" }}>{paidMonths} Months (₹{(paidMonths * s.monthlyAmount).toLocaleString()})</div>
                              </div>
                              <div style={{ background: "#F8FAFC", padding: "6px 8px", borderRadius: 6 }}>
                                <div style={{ fontSize: 8, color: "var(--text-light)", fontWeight: 700, textTransform: "uppercase" }}>Status</div>
                                <div style={{ fontSize: 11, fontWeight: 800, color: s.status === "complete" ? "#16A34A" : "#EF4444" }}>
                                  {s.status === "complete" ? "Completed" : "Early Exit"}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", borderBottom: "1px solid var(--border-main)", paddingBottom: 8, marginTop: 24, marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>Documents</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {[
                    { label: "Profile", file: data.userPhoto, icon: "🤳" },
                    { label: "Aadhar", file: data.aadharCardPhoto, icon: "📄" },
                  ].map(d => (
                    <div key={d.label} onClick={() => d.file && setViewDoc(getFileUrl(d.file))}
                      style={{
                        border: "1.5px solid var(--border-alt)", borderRadius: 10, padding: "10px 4px", textAlign: "center",
                        background: d.file ? "var(--primary-bg)" : "var(--bg-input)", cursor: d.file ? "pointer" : "default", transition: "all 0.2s"
                      }}>
                      <div style={{ fontSize: 18, marginBottom: 4 }}>{d.file ? "✅" : d.icon}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-sub)", textTransform: "uppercase" }}>{d.label}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end" }}>
              <Btn onClick={onClose} style={{ padding: "10px 32px" }}>Close Profile</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileApprovalsPanel({ onClose, onUpdate }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectBox, setRejectBox] = useState(null);
  const [reason, setReason] = useState("");
  const token = sessionStorage.getItem("adminToken");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}/api/users/profile-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.data || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const doApprove = async (id) => {
    try {
      const res = await fetch(`${ADMIN_API}/api/users/profile-requests/${id}/approve`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` }
      });
      const d = await res.json();
      if (d.success) {
        setRequests(p => p.filter(r => r._id !== id));
        if (onUpdate) onUpdate();
      } else alert(d.message);
    } catch (e) { alert("Error approving request"); }
  };

  const doReject = async (id) => {
    if (!reason.trim()) return alert("Enter a rejection reason.");
    try {
      const res = await fetch(`${ADMIN_API}/api/users/profile-requests/${id}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason })
      });
      const d = await res.json();
      if (d.success) {
        setRequests(p => p.filter(r => r._id !== id));
        setRejectBox(null); setReason("");
        if (onUpdate) onUpdate();
      } else alert(d.message);
    } catch (e) { alert("Error rejecting request"); }
  };

  const getFileUrl = (path) => path ? (path.startsWith("http") ? path : `${ADMIN_API}${path}`) : "";

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-alt)", borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
      <div style={{ padding: "16px 24px", background: "var(--bg-alt)", borderBottom: "1px solid var(--border-alt)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: 16, color: "var(--text-main)" }}>Profile Update Requests</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-sub)", cursor: "pointer", fontSize: 16 }}>✕ Close</button>
      </div>

      <div style={{ padding: 24, overflowX: "auto" }}>
        {loading ? <div style={{ textAlign: "center", color: "var(--text-light)" }}>Loading requests...</div> : requests.length === 0 ? <div style={{ textAlign: "center", color: "var(--text-sub)" }}>No pending profile updates.</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "var(--text-light)", fontSize: 11, textTransform: "uppercase", borderBottom: "1px solid var(--border-alt)" }}>User</th>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "var(--text-light)", fontSize: 11, textTransform: "uppercase", borderBottom: "1px solid var(--border-alt)" }}>Requested Changes</th>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "var(--text-light)", fontSize: 11, textTransform: "uppercase", borderBottom: "1px solid var(--border-alt)" }}>Date</th>
                <th style={{ textAlign: "left", padding: "12px 16px", color: "var(--text-light)", fontSize: 11, textTransform: "uppercase", borderBottom: "1px solid var(--border-alt)" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r._id}>
                  <td style={{ padding: "16px", borderBottom: "1px solid var(--border-alt)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={r.user?.name} img={r.user?.userPhoto} size={36} />
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--text-main)", fontSize: 14 }}>{r.user?.name}</div>
                        <div style={{ color: "var(--text-sub)", fontSize: 12 }}>{r.user?.userId} • {r.user?.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px", borderBottom: "1px solid var(--border-alt)" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {r.requestedChanges?.name && (
                        <div style={{ fontSize: 12 }}><span style={{ color: "var(--text-sub)" }}>Name:</span> <b style={{ color: "var(--primary)" }}>{r.requestedChanges.name}</b></div>
                      )}
                      {r.requestedChanges?.phone && (
                        <div style={{ fontSize: 12 }}><span style={{ color: "var(--text-sub)" }}>Phone:</span> <b style={{ color: "var(--primary)" }}>{r.requestedChanges.phone}</b></div>
                      )}
                      {r.requestedChanges?.userPhoto && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                          <span style={{ color: "var(--text-sub)" }}>Photo:</span>
                          <img src={getFileUrl(r.requestedChanges.userPhoto)} alt="New Photo" style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "16px", borderBottom: "1px solid var(--border-alt)", color: "var(--text-sub)", fontSize: 12 }}>
                    {new Date(r.createdAt).toLocaleString("en-IN")}
                  </td>
                  <td style={{ padding: "16px", borderBottom: "1px solid var(--border-alt)" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => doApprove(r._id)} style={{ padding: "6px 12px", background: "#10B981", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Approve</button>
                      <button onClick={() => setRejectBox(r._id)} style={{ padding: "6px 12px", background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA", borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Reject</button>
                    </div>
                    {rejectBox === r._id && (
                      <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                        <input type="text" placeholder="Reason..." value={reason} onChange={e => setReason(e.target.value)} style={{ flex: 1, padding: "4px 8px", fontSize: 11, borderRadius: 4, border: "1px solid var(--border-main)", background: "var(--bg-input)", color: "var(--text-main)" }} />
                        <button onClick={() => doReject(r._id)} style={{ background: "#EF4444", color: "#fff", border: "none", borderRadius: 4, padding: "4px 8px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>Confirm</button>
                        <button onClick={() => setRejectBox(null)} style={{ background: "none", border: "1px solid var(--border-alt)", color: "var(--text-sub)", borderRadius: 4, padding: "4px 8px", fontSize: 11, cursor: "pointer" }}>✕</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function UserManagementPage({ goldRate }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showApprovals, setShowApprovals] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", aadhar: "", dob: "" });
  const [files, setFiles] = useState({ aadharCardPhoto: null, userPhoto: null });
  const [formErrors, setFormErrors] = useState({});
  const token = sessionStorage.getItem("adminToken");

  const [showProfileApprovals, setShowProfileApprovals] = useState(false);
  const [pendingProfileCount, setPendingProfileCount] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
        const pending = (data.data || []).filter(u => u.status === "pending").length;
        setPendingCount(pending);
      }

      const pref = await fetch(`${ADMIN_API}/api/users/profile-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pdata = await pref.json();
      if (pdata.success) {
        setPendingProfileCount((pdata.data || []).length);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [showApprovals, showProfileApprovals]);

  const handleFile = (key, file) => {
    setFiles(p => ({ ...p, [key]: file }));
    setFormErrors(p => ({ ...p, [key]: "", photo: "", kyc: "" }));
  };

  const validateAndCreate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.password) e.password = "Password is required";
    if (!form.aadhar.trim()) e.kyc = "Aadhar number is required";
    if (!files.userPhoto) e.photo = "User photo is required";
    setFormErrors(e);
    if (Object.keys(e).length) return;
    const formData = new FormData();
    Object.keys(form).forEach(k => formData.append(k, form[k]));
    Object.keys(files).forEach(k => { if (files[k]) formData.append(k, files[k]); });

    fetch(`${ADMIN_API}/api/users`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          alert("✅ User created successfully!");
          resetForm();
          fetchUsers();
        } else alert(d.message || "Failed to create user");
      })
      .catch(() => alert("Network error"));
  };

  const resetForm = () => {
    setShowForm(false);
    setForm({ name: "", phone: "", email: "", password: "", aadhar: "", dob: "" });
    setFiles({ aadharCardPhoto: null, userPhoto: null });
    setFormErrors({});
  };

  const UPLOAD_FIELDS = [
    { label: "Aadhar Card Photo", key: "aadharCardPhoto", icon: "📄", required: false },
    { label: "User Photo ✱", key: "userPhoto", icon: "🤳", required: true },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {showApprovals && <ApprovalsPanel onClose={() => setShowApprovals(false)} />}
      {showProfileApprovals && <ProfileApprovalsPanel onClose={() => setShowProfileApprovals(false)} onUpdate={fetchUsers} />}
      {viewingUser && <UserDetailsPanel userId={viewingUser} goldRate={goldRate} onClose={() => setViewingUser(null)} />}

      <Card>
        <CardHeader title="All Users"
          right={
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button onClick={() => { setShowApprovals(false); setShowProfileApprovals(true); }}
                style={{
                  position: "relative", padding: "10px 18px", fontSize: 13.5, fontWeight: 600,
                  fontFamily: "'DM Sans',sans-serif", border: "1.5px solid #E2E8F0",
                  borderRadius: 10, cursor: "pointer", background: "#fff", color: "#0B1F3E",
                  display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#1A7FD4"; e.currentTarget.style.background = "#EEF6FD"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#fff"; }}>
                📝 Profiles
                {pendingProfileCount > 0 && (
                  <span style={{
                    background: "#8B5CF6", color: "#fff", borderRadius: "50%",
                    width: 18, height: 18, fontSize: 10, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    {pendingProfileCount}
                  </span>
                )}
              </button>

              <button onClick={() => { setShowProfileApprovals(false); setShowApprovals(true); }}
                style={{
                  position: "relative", padding: "10px 18px", fontSize: 13.5, fontWeight: 600,
                  fontFamily: "'DM Sans',sans-serif", border: "1.5px solid #E2E8F0",
                  borderRadius: 10, cursor: "pointer", background: "#fff", color: "#0B1F3E",
                  display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#1A7FD4"; e.currentTarget.style.background = "#EEF6FD"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#fff"; }}>
                📋 Registrations
                {pendingCount > 0 && (
                  <span style={{
                    background: "#EF4444", color: "#fff", borderRadius: "50%",
                    width: 18, height: 18, fontSize: 10, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    {pendingCount}
                  </span>
                )}
              </button>
              <Btn onClick={() => setShowForm(true)}>+ Add New User</Btn>
            </div>
          } />

        {showForm && (
          <div style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0B1F3E", fontFamily: "'Sora',sans-serif", marginBottom: 18 }}>
              Create New User
            </div>
            <div className="form-grid-2">
              <div>
                <Input label="Full Name" placeholder="e.g. Ravi Kumar"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                {formErrors.name && <div style={{ color: "#EF4444", fontSize: 12, marginTop: -10, marginBottom: 8 }}>⚠ {formErrors.name}</div>}
              </div>
              <div>
                <Input label="Phone Number" placeholder="e.g. 9876543210"
                  value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                {formErrors.phone && <div style={{ color: "#EF4444", fontSize: 12, marginTop: -10, marginBottom: 8 }}>⚠ {formErrors.phone}</div>}
              </div>
              <Input label="Email" type="email" placeholder="user@email.com"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              <div>
                <Input label="Password" type="password" placeholder="Set login password"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                {formErrors.password && <div style={{ color: "#EF4444", fontSize: 12, marginTop: -10, marginBottom: 8 }}>⚠ {formErrors.password}</div>}
              </div>
              <Input label="Date of Birth" type="date"
                value={form.dob} onChange={e => setForm(p => ({ ...p, dob: e.target.value }))} />
              <Input label="Aadhar Number" placeholder="e.g. 1234-5678-9012"
                value={form.aadhar} onChange={e => setForm(p => ({ ...p, aadhar: e.target.value }))} />
            </div>

            {formErrors.kyc && <div style={{ color: "#EF4444", fontSize: 12, marginBottom: 12, marginTop: -4 }}>⚠ {formErrors.kyc}</div>}

            <div className="upload-grid-3" style={{ marginBottom: 24 }}>
              {UPLOAD_FIELDS.map(item => (
                <div key={item.key} style={{ padding: 16, borderRadius: 12, border: "1.5px dashed #E2E8F0", background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#1A7FD4"; e.currentTarget.style.background = "#EEF6FD"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#fff"; }}
                  onClick={() => document.getElementById(`file-${item.key}`).click()}>
                  <input type="file" id={`file-${item.key}`} style={{ display: "none" }} onChange={e => handleFile(item.key, e.target.files[0])} />
                  <div style={{ fontSize: 20, marginBottom: 8 }}>{files[item.key] ? "✅" : item.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: files[item.key] ? "#059669" : "#475569", textAlign: "center" }}>
                    {files[item.key] ? files[item.key].name : item.label}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <Btn onClick={validateAndCreate} style={{ flex: 1 }}>Create Account</Btn>
              <button onClick={resetForm} style={{ padding: "10px 24px", background: "none", border: "none", color: "#64748B", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        )}

        <div className="table-container">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["User ID", "Member", "Phone", "Chits", "Status", "Joined", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 13px", fontSize: 11, fontWeight: 700, color: "#64748B", textAlign: "left", textTransform: "uppercase", borderBottom: "2px solid #F1F5F9" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "var(--text-light)" }}>⌛ Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "var(--text-light)" }}>📂 No users found.</td></tr>
              ) : users.filter(u => u.status !== "pending").map(u => (
                <tr key={u._id} className="table-row">
                  <td style={{ padding: "12px 13px", borderBottom: "1px solid var(--border-main)" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)", background: "var(--primary-bg)", borderRadius: 20, padding: "3px 12px" }}>{u.userId || u._id.slice(-6)}</span>
                  </td>
                  <td style={{ padding: "12px 13px", borderBottom: "1px solid var(--border-main)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={u.name} img={u.userPhoto} size={32} />
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--text-main)", fontSize: 13.5 }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-light)", marginTop: 1 }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 13px", borderBottom: "1px solid var(--border-main)", color: "var(--text-sub)", fontSize: 13 }}>{u.phone}</td>
                  <td style={{ padding: "12px 13px", borderBottom: "1px solid var(--border-main)" }}>
                    <span style={{ fontWeight: 800, color: "var(--primary)", fontSize: 14 }}>{u.schemes?.length || 0}</span>
                  </td>
                  <td style={{ padding: "12px 13px", borderBottom: "1px solid var(--border-main)" }}><Badge status={u.status} /></td>
                  <td style={{ padding: "12px 13px", borderBottom: "1px solid var(--border-main)", color: "var(--text-light)", fontSize: 12 }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td style={{ padding: "12px 13px", borderBottom: "1px solid var(--border-main)" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setViewingUser(u._id)} style={{ background: "var(--primary-bg)", color: "var(--primary)", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

}

function SchemesPage({ goldRate }) {
  const [schemes, setSchemes] = useState([]);
  const [chits, setChits] = useState([]);
  const [activeSubView, setActiveSubView] = useState("schemes");
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [chitForm, setChitForm] = useState({ name: "", monthlyAmount: "", duration: 12, bonusDetails: "", startDate: "", endDate: "" });
  const [formErr, setFormErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [viewingPlanMembers, setViewingPlanMembers] = useState(null);
  const [planMembersList, setPlanMembersList] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [schemeTerms, setSchemeTerms] = useState(null);
  const [editingTerms, setEditingTerms] = useState(false);
  const [termsDraft, setTermsDraft] = useState("");
  const [verifyingTerms, setVerifyingTerms] = useState(false);
  const [activeMainTermsTab, setActiveMainTermsTab] = useState("Type1");
  const [viewingChit, setViewingChit] = useState(null);
  const token = sessionStorage.getItem("adminToken");

  useEffect(() => {
    if (chitForm.startDate && chitForm.endDate) {
      const start = new Date(chitForm.startDate);
      const end = new Date(chitForm.endDate);
      if (end > start) {
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        // Adjust if end day is before start day (to be accurate with full months)
        const finalDuration = end.getDate() >= start.getDate() ? months : months - 1;
        setChitForm(p => ({ ...p, duration: Math.max(0, finalDuration + 1) }));
      }
    }
  }, [chitForm.startDate, chitForm.endDate]);

  const todayStr = new Date().toISOString().split('T')[0];

  const loadBaseData = async () => {
    setLoading(true);
    let finalSchemes = [];
    try {
      const sRes = await fetch(`${ADMIN_API}/api/categories`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
      if (sRes.success) {
        finalSchemes = sRes.data || [];
        setSchemes(finalSchemes);
        const hasT1 = finalSchemes.some(x => x.planType === "Type1");
        const hasT2 = finalSchemes.some(x => x.planType === "Type2");
        if (!hasT1 || !hasT2) {
          finalSchemes = await seedMissingSchemes(finalSchemes);
        }
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
    return finalSchemes;
  };

  const seedMissingSchemes = async (existing) => {
    const toSeed = [];
    if (!existing.some(x => x.planType === "Type1")) {
      toSeed.push({ name: "Scheme 1", description: "Monthly Gold Accumulation Logic", planType: "Type1" });
    }
    if (!existing.some(x => x.planType === "Type2")) {
      toSeed.push({ name: "Scheme 2", description: "Final Amount Conversion Logic", planType: "Type2" });
    }
    for (const s of toSeed) {
      try {
        await fetch(`${ADMIN_API}/api/categories`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(s)
        });
      } catch (err) { }
    }
    const r = await fetch(`${ADMIN_API}/api/categories`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json());
    if (r.success) {
      setSchemes(r.data || []);
      return r.data || [];
    }
    return existing;
  };


  const loadChits = async (planType) => {
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}/api/schemes/type/${planType}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json());
      if (res.success) setChits(res.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };


  useEffect(() => { loadBaseData(); }, []);

  const fetchSchemeTerms = async (type) => {
    try {
      const res = await fetch(`${ADMIN_API}/api/terms/type/${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json());
      if (res.success) {
        setSchemeTerms(res.data);
        setTermsDraft(res.data.content);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (selectedScheme) {
      fetchSchemeTerms(selectedScheme.planType);
    } else {
      fetchSchemeTerms(activeMainTermsTab);
    }
  }, [selectedScheme, activeMainTermsTab]);

  useEffect(() => {
    if (activeSubView === "chits" && selectedScheme) {
      loadChits(selectedScheme.planType);
    } else if (activeSubView === "schemes") {
      loadBaseData();
    }
  }, [activeSubView, selectedScheme]);


  const submitChit = async () => {
    if (!chitForm.name || !chitForm.monthlyAmount) return setFormErr("Name and amount are required");
    setSaving(true);
    try {
      const res = await fetch(`${ADMIN_API}/api/plans`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          ...chitForm,
          schemeCategoryId: selectedScheme._id,
          planType: selectedScheme.planType
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setChitForm({ name: "", monthlyAmount: "", duration: 12, bonusDetails: "" });
        loadChits(selectedScheme._id);
      }
      else setFormErr(data.message || "Failed to create chit");
    } catch { setFormErr("Network error"); } finally { setSaving(false); }
  };

  const deleteChit = async (id) => {
    if (!window.confirm("Are you sure you want to delete this chit?")) return;
    try {
      const res = await fetch(`${ADMIN_API}/api/plans/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json());
      if (res.success) loadChits(selectedScheme._id);
      else alert(res.message);
    } catch (e) { console.error(e); }
  };

  const fetchMembers = async (planId) => {
    setLoadingMembers(true);
    try {
      const res = await fetch(`${ADMIN_API}/api/plans/${planId}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json());
      if (res.success) setPlanMembersList(res.data || []);
    } catch (e) { } finally { setLoadingMembers(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {viewingPlanMembers && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(11,31,62,0.7)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 650, maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--primary)", color: "#fff" }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>Members: {viewingPlanMembers.name}</div>
              <button onClick={() => setViewingPlanMembers(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontWeight: 800 }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
              {loadingMembers ? (
                <div style={{ textAlign: "center", padding: 40, color: "#64748B" }}>Loading members...</div>
              ) : planMembersList.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>No users are currently enrolled in this chit plan.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {planMembersList.map(m => (
                    <div key={m._id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 16px", background: "#F8FAFC", borderRadius: 12, border: "1px solid #E2E8F0" }}>
                      <Avatar name={m.name} img={m.userPhoto} size={42} fontSize={16} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: "#0B1F3E" }}>{m.name}</div>
                        <div style={{ fontSize: 12, color: "#64748B" }}>{m.phone} · ID: {m.userId}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 11, background: "var(--primary-bg)", color: "var(--primary)", padding: "4px 10px", borderRadius: 8, fontWeight: 800 }}>{m.schemeId}</div>
                        <div style={{ fontSize: 12, color: "var(--text-sub)", marginTop: 4 }}>Month {m.currentMonth || 0} Paid</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ padding: 16, borderTop: "1px solid #E2E8F0", textAlign: "right" }}>
              <button onClick={() => setViewingPlanMembers(null)} style={{ padding: "10px 24px", background: "#F1F5F9", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Close</button>
            </div>
          </div>
        </div>
      )}



      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-card)", padding: "12px 20px", borderRadius: 14, alignSelf: "flex-start", border: "1px solid var(--border-main)", boxShadow: "var(--shadow-main)" }}>
        <button onClick={() => setActiveSubView("schemes")} style={{ border: "none", background: "none", cursor: "pointer", fontWeight: activeSubView === "schemes" ? 800 : 500, color: activeSubView === "schemes" ? "var(--primary)" : "var(--text-sub)", fontSize: 14 }}>Schemes</button>
        {selectedScheme && activeSubView === "chits" && (
          <>
            <span style={{ color: "var(--text-light)" }}>/</span>
            <span style={{ fontWeight: 800, color: "var(--primary)", fontSize: 14 }}>{selectedScheme.name} (Chits)</span>
          </>
        )}
      </div>

      {/* Back button when in chits view */}
      {activeSubView === "chits" && (
        <button
          onClick={() => { setActiveSubView("schemes"); setSelectedScheme(null); setShowTerms(false); setShowRequests(false); }}
          style={{
            alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 8,
            background: "var(--bg-card)", border: "1.5px solid var(--border-main)",
            borderRadius: 10, padding: "9px 18px", cursor: "pointer",
            fontSize: 13, fontWeight: 700, color: "var(--text-sub)",
            boxShadow: "var(--shadow-main)", transition: "all 0.2s"
          }}
        >
          ← Back to Schemes
        </button>
      )}

      {activeSubView === "schemes" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 10 }}>
          <div
            onClick={() => {
              setActiveMainTermsTab("Type1");
              setEditingTerms(false);
              document.getElementById('terms-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ background: "#fff", borderRadius: 20, padding: 40, textAlign: "center", cursor: "pointer", border: "2px solid #E2E8F0", transition: "all 0.3s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0B1F3E" }}>Scheme 1</div>
            <div style={{ fontSize: 14, color: "#64748B", marginTop: 8 }}>Monthly Gold Accumulation Logic</div>
          </div>
          <div
            onClick={() => {
              setActiveMainTermsTab("Type2");
              setEditingTerms(false);
              document.getElementById('terms-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{ background: "#fff", borderRadius: 20, padding: 40, textAlign: "center", cursor: "pointer", border: "2px solid #E2E8F0", transition: "all 0.3s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--gold)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏗️</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0B1F3E" }}>Scheme 2</div>
            <div style={{ fontSize: 14, color: "#64748B", marginTop: 8 }}>Final Amount Conversion</div>
          </div>
        </div>
      )}

      {activeSubView === "chits" && (
        <Card>
          <CardHeader
            title={`Managing: ${selectedScheme?.name}`}
            right={
              <button
                onClick={() => document.getElementById('terms-section')?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  position: "relative", padding: "10px 20px",
                  background: "rgba(5,150,105,0.12)",
                  color: "#059669",
                  border: "1.5px solid #059669", borderRadius: 10,
                  cursor: "pointer", fontWeight: 700, fontSize: 13,
                  transition: "all 0.2s"
                }}
              >
                📜 Terms & Conditions
              </button>
            }
          />

        {showForm && activeSubView === "chits" && (
          <div style={{ padding: 20, background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
            <div style={{ fontWeight: 700, marginBottom: 16 }}>Create New Chit Template</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>CHIT NAME</label>
                <input value={chitForm.name} onChange={e => setChitForm({ ...chitForm, name: e.target.value })} placeholder="e.g. ₹5000 Gold Plan" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>MONTHLY AMOUNT (₹)</label>
                <input type="number" value={chitForm.monthlyAmount} onChange={e => setChitForm({ ...chitForm, monthlyAmount: e.target.value })} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>START DATE</label>
                <input type="date" min={todayStr} value={chitForm.startDate} onChange={e => setChitForm({ ...chitForm, startDate: e.target.value })} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>END DATE</label>
                <input type="date" min={chitForm.startDate || todayStr} value={chitForm.endDate} onChange={e => setChitForm({ ...chitForm, endDate: e.target.value })} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #E2E8F0" }} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ background: "var(--primary-bg)", padding: "12px 16px", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>Calculated Duration</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "var(--primary)" }}>{chitForm.duration} Months</span>
                </div>
              </div>
            </div>
            {formErr && <div style={{ color: "#EF4444", fontSize: 12, marginTop: 12 }}>⚠ {formErr}</div>}
            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <Btn onClick={submitChit}>Create Chit</Btn>
              <Btn onClick={() => setShowForm(false)} color="#94A3B8">Cancel</Btn>
            </div>
          </div>
        )}

        {/* Level 2: Managed Table of Enrollments */}
        {activeSubView === "chits" && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Member", "Chit ID", "Amount", "View", "Status", "Joined"].map(h => (
                    <th key={h} style={{ padding: "14px", fontSize: 11, fontWeight: 700, color: "#64748B", textAlign: (h === "Status" || h === "View") ? "center" : "left", textTransform: "uppercase", borderBottom: "2px solid #F1F5F9" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chits.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>
                      No enrollments found for this scheme. Enrol users via the "New Chit" page.
                    </td>
                  </tr>
                ) : (
                  chits.map(p => (
                    <tr key={p._id} className="table-row">
                      <td style={{ padding: "14px", borderBottom: "1px solid #F1F5F9" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar name={p.user?.name} img={p.user?.userPhoto} size={32} fontSize={12} />
                          <div>
                            <div style={{ fontWeight: 700, color: "#0B1F3E" }}>{p.user?.name}</div>
                            <div style={{ fontSize: 10, color: "#64748B" }}>ID: {p.user?.userId}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px", borderBottom: "1px solid #F1F5F9", fontWeight: 700, color: "var(--primary)", fontFamily: "monospace", letterSpacing: 0.5 }}>
                        {p.schemeId}
                      </td>
                      <td style={{ padding: "14px", borderBottom: "1px solid #F1F5F9", fontWeight: 700, color: "var(--gold)" }}>₹{(p.monthlyAmount || 0).toLocaleString()}</td>
                      <td style={{ padding: "14px", borderBottom: "1px solid #F1F5F9", textAlign: "center" }}>
                        <button
                          onClick={() => setViewingChit(p)}
                          style={{
                            background: "var(--primary-bg)", color: "var(--primary)",
                            border: "1.5px solid var(--primary)", borderRadius: 8,
                            padding: "5px 14px", cursor: "pointer",
                            fontSize: 12, fontWeight: 700, transition: "all 0.2s"
                          }}
                        >👁 View</button>
                      </td>
                      <td style={{ padding: "14px", borderBottom: "1px solid #F1F5F9", textAlign: "center" }}>
                        <Badge status={p.status || "active"} />
                      </td>
                      <td style={{ padding: "14px", borderBottom: "1px solid #F1F5F9", color: "#64748B", fontSize: 13 }}>
                        {new Date(p.startDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </Card>
      )}

      {/* Inline Terms & Conditions Card */}
      {schemeTerms && (
        <Card id="terms-section" style={{ marginTop: 24 }}>
          <CardHeader
            title={`📜 Terms & Conditions — ${selectedScheme ? selectedScheme.name : (activeMainTermsTab === "Type1" ? "Scheme 1" : "Scheme 2")}`}
            right={
              selectedScheme ? (
                editingTerms ? (
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => { setEditingTerms(false); setTermsDraft(schemeTerms.content); }}
                      style={{
                        padding: "8px 16px", background: "var(--bg-input)",
                        border: "1.5px solid var(--border-alt)", color: "var(--text-sub)",
                        borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13
                      }}
                    >Cancel</button>
                    <button
                      onClick={() => setVerifyingTerms(true)}
                      style={{
                        padding: "8px 20px", background: "#059669", color: "#fff",
                        border: "none", borderRadius: 10, cursor: "pointer",
                        fontWeight: 700, fontSize: 13, boxShadow: "0 4px 12px rgba(5,150,105,0.3)"
                      }}
                    >🔑 Enter Passkey &amp; Save</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingTerms(true)}
                    style={{
                      padding: "8px 16px", background: "var(--primary-bg)",
                      color: "var(--primary)", border: "1.5px solid var(--primary)",
                      borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13
                    }}
                  >✏️ Edit Terms</button>
                )
              ) : (
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  {editingTerms ? (
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        onClick={() => { setEditingTerms(false); setTermsDraft(schemeTerms.content); }}
                        style={{
                          padding: "8px 16px", background: "var(--bg-input)",
                          border: "1.5px solid var(--border-alt)", color: "var(--text-sub)",
                          borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13
                        }}
                      >Cancel</button>
                      <button
                        onClick={() => setVerifyingTerms(true)}
                        style={{
                          padding: "8px 20px", background: "#059669", color: "#fff",
                          border: "none", borderRadius: 10, cursor: "pointer",
                          fontWeight: 700, fontSize: 13, boxShadow: "0 4px 12px rgba(5,150,105,0.3)"
                        }}
                      >🔑 Enter Passkey &amp; Save</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingTerms(true)}
                      style={{
                        padding: "8px 16px", background: "var(--primary-bg)",
                        color: "var(--primary)", border: "1.5px solid var(--primary)",
                        borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13
                      }}
                    >✏️ Edit Terms</button>
                  )}
                </div>
              )
            }
          />
          <div style={{ padding: 24 }}>
            <div style={{
              background: "#FFFBEB", padding: "12px 16px", borderRadius: 12,
              fontSize: 13, color: "#92400E", marginBottom: 20,
              border: "1px solid rgba(212,160,23,0.2)",
              lineHeight: 1.6, display: "flex", gap: 12, alignItems: "center"
            }}>
              <span style={{ fontSize: 20 }}>💡</span>
              <span>Changes saved here are shown to users during scheme browsing and enrollment requests.</span>
            </div>

            {editingTerms ? (
              <textarea
                value={termsDraft}
                onChange={e => setTermsDraft(e.target.value)}
                rows={12}
                style={{
                  width: "100%", padding: 18, borderRadius: 14,
                  border: "2px solid var(--primary)",
                  background: "var(--bg-input)", color: "var(--text-main)",
                  fontSize: 14, lineHeight: 1.7, outline: "none",
                  fontFamily: "'DM Sans', sans-serif", resize: "vertical",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)"
                }}
                placeholder="Enter the terms and conditions for this scheme..."
              />
            ) : (
              <div style={{
                background: "var(--bg-page)", padding: 24,
                borderRadius: 14, border: "1px solid var(--border-alt)"
              }}>
                <pre style={{
                  whiteSpace: "pre-wrap", fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14, color: "var(--text-sub)", lineHeight: 1.8, margin: 0
                }}>
                  {schemeTerms.content || "No terms specified for this scheme."}
                </pre>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Chit Detail View POPUP MODAL */}
      {viewingChit && (() => {
        const p = viewingChit;
        const totalMonths = p.totalMonths || 13;
        const paidMonths = p.currentMonth || 0;
        const remainingMonths = Math.max(0, totalMonths - 1 - paidMonths); // -1 for bonus month
        const isType1 = (p.planType === "Type1" || selectedScheme?.planType === "Type1");
        const goldRate = p.goldRateAtStart || 6869;
        const totalGold = isType1 ? (p.totalGramsAccumulated || ((p.monthlyAmount * paidMonths) / goldRate)) : 0;
        const totalPaid = p.monthlyAmount * paidMonths;
        const progressPct = totalMonths > 1 ? Math.round((paidMonths / (totalMonths - 1)) * 100) : 0;
        return (
          <div style={{
            position: "fixed", inset: 0,
            background: "rgba(11,31,62,0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 2000,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px 16px"
          }}>
            <div style={{
              background: "var(--bg-card)", borderRadius: 20,
              width: "100%", maxWidth: 560,
              display: "flex", flexDirection: "column",
              boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
              overflow: "hidden"
            }}>
              {/* Header */}
              <div style={{
                padding: "20px 24px",
                background: "var(--primary)",
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Chit Details</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "monospace", marginTop: 2 }}>{p.schemeId}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{p.user?.name} · {p.user?.userId}</div>
                </div>
                <button
                  onClick={() => setViewingChit(null)}
                  style={{
                    background: "rgba(255,255,255,0.18)", border: "none",
                    color: "#fff", width: 36, height: 36, borderRadius: "50%",
                    cursor: "pointer", fontSize: 18, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}
                >✕</button>
              </div>

              {/* Body */}
              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>

                {/* Progress bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-sub)", textTransform: "uppercase", letterSpacing: 0.5 }}>Payment Progress</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "var(--primary)" }}>{progressPct}%</span>
                  </div>
                  <div style={{ height: 10, background: "var(--bg-page)", borderRadius: 99, overflow: "hidden", border: "1px solid var(--border-alt)" }}>
                    <div className="prog-fill" style={{ height: "100%", width: `${progressPct}%`, background: "linear-gradient(90deg, var(--primary), var(--gold))", borderRadius: 99 }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "var(--text-light)" }}>
                    <span>{paidMonths} months paid</span>
                    <span>{remainingMonths} months remaining</span>
                  </div>
                </div>

                {/* Stat cards row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ background: "var(--bg-page)", borderRadius: 14, padding: "16px 18px", border: "1px solid var(--border-alt)" }}>
                    <div style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Monthly Amount</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--gold)", marginTop: 4 }}>₹{(p.monthlyAmount || 0).toLocaleString()}</div>
                  </div>
                  <div style={{ background: "var(--bg-page)", borderRadius: 14, padding: "16px 18px", border: "1px solid var(--border-alt)" }}>
                    <div style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Total Paid</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#059669", marginTop: 4 }}>₹{totalPaid.toLocaleString()}</div>
                  </div>
                  <div style={{ background: "var(--bg-page)", borderRadius: 14, padding: "16px 18px", border: "1px solid var(--border-alt)" }}>
                    <div style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Paid / Total Months</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--primary)", marginTop: 4 }}>{paidMonths} <span style={{ fontSize: 14, color: "var(--text-light)" }}>/ {totalMonths - 1} + 1 bonus</span></div>
                  </div>
                  {isType1 ? (
                    <div style={{ background: "linear-gradient(135deg, rgba(212,160,23,0.15), rgba(212,160,23,0.05))", borderRadius: 14, padding: "16px 18px", border: "1.5px solid rgba(212,160,23,0.3)" }}>
                      <div style={{ fontSize: 11, color: "#92400E", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Gold Accumulated</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "var(--gold)", marginTop: 4 }}>{totalGold.toFixed(4)} <span style={{ fontSize: 13 }}>g</span></div>
                      <div style={{ fontSize: 10, color: "var(--text-light)", marginTop: 2 }}>@ ₹{goldRate.toLocaleString()}/g</div>
                    </div>
                  ) : (
                    <div style={{ background: "linear-gradient(135deg, rgba(5,150,105,0.12), rgba(5,150,105,0.04))", borderRadius: 14, padding: "16px 18px", border: "1.5px solid rgba(5,150,105,0.25)" }}>
                      <div style={{ fontSize: 11, color: "#065F46", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Total Accumulation</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#059669", marginTop: 4 }}>₹{totalPaid.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: "var(--text-light)", marginTop: 2 }}>Converts at end of scheme</div>
                    </div>
                  )}
                </div>

                {/* Scheme info row */}
                <div style={{ background: "var(--bg-page)", borderRadius: 12, padding: "12px 16px", border: "1px solid var(--border-alt)", display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <div><span style={{ color: "var(--text-light)" }}>Started</span> <b style={{ color: "var(--text-main)" }}>{new Date(p.startDate).toLocaleDateString("en-IN")}</b></div>
                  <div><span style={{ color: "var(--text-light)" }}>Type</span> <b style={{ color: "var(--primary)" }}>{isType1 ? "Scheme 1" : "Scheme 2"}</b></div>
                  <div><span style={{ color: "var(--text-light)" }}>Status</span> <b style={{ color: p.status === "active" ? "#059669" : "#EF4444" }}>{p.status || "active"}</b></div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border-main)", display: "flex", justifyContent: "flex-end", background: "var(--bg-alt)" }}>
                <button
                  onClick={() => setViewingChit(null)}
                  style={{ padding: "10px 24px", background: "var(--bg-input)", border: "1.5px solid var(--border-alt)", color: "var(--text-sub)", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13 }}
                >Close</button>
              </div>
            </div>
          </div>
        );
      })()}





      {verifyingTerms && (
        <SecurityVerificationModal
          actionName={`Update Terms for ${selectedScheme ? selectedScheme.name : (activeMainTermsTab === "Type1" ? "Scheme 1" : "Scheme 2")}`}
          onClose={() => setVerifyingTerms(false)}
          onVerified={async (vToken) => {
            setVerifyingTerms(false);
            setSaving(true);
            try {
              const planType = selectedScheme ? selectedScheme.planType : activeMainTermsTab;
              const res = await fetch(`${ADMIN_API}/api/terms/type/${planType}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                  "x-verification-token": vToken
                },
                body: JSON.stringify({ content: termsDraft })
              }).then(r => r.json());
              if (res.success) {
                setEditingTerms(false);
                setShowTerms(false);
                fetchSchemeTerms(planType);
              } else alert(res.message);
            } catch (e) { alert("Network error"); }
            finally { setSaving(false); }
          }}
        />
      )}
    </div>
  );
}

// ── Payments ──
function PaymentsPage({ goldRate }) {
  const [tab, setTab] = useState("payments"); // payments, history, approvals, settings, cash
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewProof, setViewProof] = useState(null);

  // Data States
  const [groupedUpcoming, setGroupedUpcoming] = useState([]);
  const [flatUpcomingPayments, setFlatUpcomingPayments] = useState([]);
  const [groupedHistory, setGroupedHistory] = useState([]);
  const [expandedDates, setExpandedDates] = useState({});
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [approvals, setApprovals] = useState([]);
  const [settings, setSettings] = useState({
    shopName: "", name: "", phone: "", bankName: "", branch: "", accountNumber: "", ifscCode: "", accountName: ""
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [verificationAction, setVerificationAction] = useState(null);
  const [pendingPayAction, setPendingPayAction] = useState(null); // { id, type, label }
  const [cashUpdate, setCashUpdate] = useState(null); // { paymentId, date, mode, amount, userName, schemeName }
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(null); // payment id to reject
  const token = sessionStorage.getItem("adminToken");

  // Accordion States
  const [openUpcomingUser, setOpenUpcomingUser] = useState(null);
  const [openCashUser, setOpenCashUser] = useState(null);
  const [openCashChit, setOpenCashChit] = useState(null);
  const [openHistUser, setOpenHistUser] = useState(null);
  const [openHistScheme, setOpenHistScheme] = useState({}); // { userId_schemeId: boolean }

  const getFileUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `${ADMIN_API}${path}`;
  };

  const fetchUpcoming = async () => {
    setLoading(true);
    try {
      // Fetch all pending / overdue payments
      const res = await fetch(`${ADMIN_API}/api/payments/pending`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        const pendingData = data.data || [];
        const group = {};
        pendingData.forEach(p => {
          if (!p.user || !p.user._id) return; // Skip orphan payments
          const uid = p.user._id;
          if (!group[uid]) group[uid] = { user: p.user, schemes: {} };

          const sid = p.scheme?._id || "Unknown";
          if (!group[uid].schemes[sid]) {
            group[uid].schemes[sid] = {
              info: p.scheme,
              payments: []
            };
          }
          group[uid].schemes[sid].payments.push(p);
        });

        const final = Object.values(group).map(u => ({
          user: u.user,
          schemes: Object.values(u.schemes)
        }));
        setGroupedUpcoming(final);

        const flattened = pendingData
          .filter(p => p.user && p.user.name)
          .sort((a, b) => {
            const dateA = new Date(a.dueDate || a.createdAt || 0);
            const dateB = new Date(b.dueDate || b.createdAt || 0);
            if (dateA < dateB) return -1;
            if (dateA > dateB) return 1;
            const nameA = (a.user?.name || "").toLowerCase();
            const nameB = (b.user?.name || "").toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return (a.paymentId || "").localeCompare(b.paymentId || "");
          });
        setFlatUpcomingPayments(flattened);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}/api/payments`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        const allPayments = data.data || [];
        const past = allPayments.filter(p => p.status === "paid" || p.status === "complete");

        setGroupedHistory(past);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}/api/payments/awaiting`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setApprovals(data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}/api/auth/admin/shop-settings`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success && data.data) {
        setSettings({
          shopName: data.data.shopName || "",
          name: data.data.name || "",
          phone: data.data.phone || "",
          bankName: data.data.bankName || "",
          branch: data.data.branch || "",
          accountNumber: data.data.accountNumber || "",
          ifscCode: data.data.ifscCode || "",
          accountName: data.data.accountName || "",
        });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === "payments") fetchUpcoming();
    else if (tab === "history") fetchHistory();
    else if (tab === "approvals") fetchApprovals();
    else if (tab === "settings") fetchSettings();
    else if (tab === "cash") fetchUpcoming();
  }, [tab]);

  const markPaid = async (id, vToken, extraData = {}) => {
    try {
      const res = await fetch(`${ADMIN_API}/api/payments/${id}/mark-paid`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "x-verification-token": vToken,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(extraData)
      });
      const d = await res.json();
      if (d.success) {
        if (tab === "payments" || tab === "cash") fetchUpcoming();
        if (tab === "approvals") fetchApprovals();
      } else alert(d.message);
    } catch (e) { alert("Error approving payment"); }
  };

  const rejectPayment = async (id, reason, vToken) => {
    try {
      const res = await fetch(`${ADMIN_API}/api/payments/${id}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "x-verification-token": vToken },
        body: JSON.stringify({ reason })
      });
      const d = await res.json();
      if (d.success) {
        setShowRejectBox(null);
        setRejectReason("");
        fetchApprovals();
      } else alert(d.message);
    } catch (e) { alert("Error rejecting payment"); }
  };
  const executeSaveSettings = async (verificationToken) => {
    setVerificationAction(null);
    setSavingSettings(true);
    try {
      const fd = new FormData();
      Object.keys(settings).forEach(k => {
        if (settings[k] !== null && settings[k] !== undefined) {
          fd.append(k, settings[k]);
        }
      });
      fd.append("verificationToken", verificationToken);

      console.log("Saving settings with token:", verificationToken);

      const res = await fetch(`${ADMIN_API}/api/auth/admin/shop-settings`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      console.log("Save response:", data);

      if (data.success) {
        alert("✅ Payment settings updated successfully!");
        fetchSettings();
      } else {
        alert("⚠ Error: " + data.message);
      }
    } catch (err) {
      console.error("Save settings error:", err);
      alert("⚠ Network error while saving settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const saveSettings = () => {
    setVerificationAction("Payment Settings");
  };


  const toggleDateGroup = (dateStr) => {
    setExpandedDates(prev => ({ ...prev, [dateStr]: !prev[dateStr] }));
  };

  const renderHistoryTable = (paymentsList) => {
    return (
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Member", "Scheme", "Month", "Amount", "Gold", "Paid Time", "Proof"].map(h => (
                <th key={h} style={{
                  padding: "10px 16px", fontSize: 11, fontWeight: 700, color: "var(--text-light)",
                  textAlign: "left", letterSpacing: 0.5, borderBottom: "1px solid var(--border-alt)",
                  textTransform: "uppercase", whiteSpace: "nowrap"
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paymentsList.map(p => {
              const planName = p.scheme?.planType === "Type1" || p.joinRequest?.planType === "Type1"
                ? "Scheme 1 (Gold Accumulation)" 
                : "Scheme 2 (Final Conversion)";
              const schemeId = p.scheme?.schemeId || "Enrollment";
              return (
                <tr key={p._id} className="table-row">
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid var(--border-alt)` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={p.user?.name || "?"} img={p.user?.userPhoto} size={28} fontSize={11} />
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--text-main)", fontSize: 13 }}>{p.user?.name || "Unknown"}</div>
                        <div style={{ fontSize: 10, color: "var(--text-light)" }}>{p.user?.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid var(--border-alt)` }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: p.scheme?.planType === "Type1" ? "var(--gold)" : "var(--green)" }}>{planName}</span>
                      <span style={{ fontSize: 10, color: "var(--text-light)", fontWeight: 600 }}>ID: {schemeId}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid var(--border-alt)`, color: "var(--text-main)", fontSize: 13, fontWeight: 600 }}>
                    {p.monthNumber ? `Month ${p.monthNumber}` : "—"}
                  </td>
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid var(--border-alt)` }}>
                    <b style={{ color: "var(--text-main)", fontSize: 13 }}>₹{(p.amount || 0).toLocaleString()}</b>
                  </td>
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid var(--border-alt)` }}>
                    <b style={{ color: p.gramsAdded ? "#D4A017" : "var(--text-light)", fontSize: 13 }}>
                      {p.gramsAdded ? p.gramsAdded + "g" : "—"}
                    </b>
                  </td>
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid var(--border-alt)`, color: "var(--text-sub)", fontSize: 12 }}>
                    {new Date(p.paidDate || p.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: "12px 16px", borderBottom: `1px solid var(--border-alt)` }}>
                    {(p.screenshotUrl || p.utrNumber) ? (
                      <button onClick={() => setViewProof(p)} style={{
                        padding: "6px 12px", fontSize: 11, background: "transparent",
                        color: "var(--primary)", border: "1px solid var(--primary)",
                        borderRadius: 6, cursor: "pointer", fontWeight: 600
                      }}>👁 View Proof</button>
                    ) : <span style={{ color: "var(--text-light)", fontSize: 12 }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Proof Modal */}
      {viewProof && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 3000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24, flexDirection: "column"
        }} onClick={() => setViewProof(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--bg-page)", borderRadius: 16, padding: "24px", maxWidth: 600, width: "100%", boxShadow: "0 10px 40px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-main)", marginBottom: 16, borderBottom: "1px solid var(--border-alt)", paddingBottom: 12 }}>
              Payment Information
              <span style={{ float: "right", cursor: "pointer", color: "var(--text-light)" }} onClick={() => setViewProof(null)}>✕</span>
            </div>

            {viewProof.screenshotUrl ? (
              <div style={{ textAlign: "center", background: "#000", borderRadius: 8, overflow: "hidden" }}>
                <img src={getFileUrl(viewProof.screenshotUrl)} alt="Proof Screenshot" style={{ maxWidth: "100%", maxHeight: "500px", objectFit: "contain" }} />
              </div>
            ) : (
              <div style={{ background: "var(--bg-input)", padding: 40, borderRadius: 12, textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>UTR Transaction Number</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-main)", letterSpacing: 1 }}>{viewProof.utrNumber || "N/A"}</div>
              </div>
            )}

            {viewProof.userNote && (
              <div style={{ background: "var(--bg-input)", borderLeft: "4px solid var(--primary)", color: "var(--text-main)", padding: "14px 20px", borderRadius: "0 8px 8px 0", marginTop: 20 }}>
                <b style={{ color: "var(--primary)" }}>User Note:</b> {viewProof.userNote}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              {viewProof.screenshotUrl ? (
                <a
                  href={getFileUrl(viewProof.screenshotUrl)}
                  download={`Proof_${viewProof.paymentId}.jpg`}
                  target="_blank" rel="noreferrer"
                  style={{ textDecoration: "none", background: "rgba(26,127,212,0.1)", color: "var(--primary)", padding: "10px 24px", borderRadius: 8, border: "1px solid var(--primary)", cursor: "pointer", fontWeight: 600 }}>
                  ↓ Download Proof
                </a>
              ) : <div></div>}
              <button
                onClick={() => setViewProof(null)}
                style={{ background: "var(--bg-input)", color: "var(--text-main)", padding: "10px 24px", borderRadius: 8, border: "1px solid var(--border-alt)", cursor: "pointer", fontWeight: 600 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Tab Navigation */}
      <div style={{ display: "flex", gap: 12, background: "var(--bg-input)", padding: 8, borderRadius: 12, overflowX: "auto", border: "1px solid var(--border-alt)" }}>
        {[
          { id: "payments", label: "Upcoming Payments", icon: "💰" },
          { id: "history", label: "Payment History", icon: "🕒" },
          { id: "approvals", label: "Payment Approvals", icon: "📋" },
          { id: "cash", label: "Cash Payment", icon: "💵" },
          { id: "settings", label: "Payment Update", icon: "⚙️" }
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: "12px 24px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
              background: tab === t.id ? "var(--primary)" : "transparent",
              color: tab === t.id ? "#fff" : "var(--text-main)",
              transition: "all 0.2s", whiteSpace: "nowrap", flex: "1 1 auto",
              boxShadow: tab === t.id ? "0 4px 12px rgba(59, 154, 235, 0.3)" : "none"
            }}>
            {t.icon} {t.label}
            {t.id === "approvals" && approvals.length > 0 && tab !== "approvals" && (
              <span style={{ marginLeft: 8, background: "#EF4444", color: "#fff", padding: "2px 8px", borderRadius: 20, fontSize: 11 }}>New</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Payments (Upcoming/Remaining) */}
      {tab === "payments" && (
        <Card>
          <CardHeader title="Upcoming & Remaining Schedules"
            right={<span style={{ fontSize: 12, color: "var(--text-sub)" }}>Gold Rate Today: <b style={{ color: "#D4A017" }}>₹{goldRate.toLocaleString()}/g</b></span>} />
          {loading ? <div style={{ padding: 60, textAlign: "center", color: "var(--text-light)" }}>Loading schedules...</div> : flatUpcomingPayments.length === 0 ? <div style={{ padding: 60, textAlign: "center", color: "var(--text-sub)" }}>No pending payments found.</div> : (
            <div style={{ padding: "0 16px 16px" }}>
              <div className="table-container" style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["User Name", "Payment ID", "Chit ID", "Started", "Amount", "Month", "Due Date", "Status"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", fontSize: 10, fontWeight: 700, color: "var(--text-light)", textAlign: "left", letterSpacing: 0.5, borderBottom: "1px solid var(--border-alt)", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {flatUpcomingPayments.map(p => (
                      <tr key={p._id} className="table-row">
                        <td style={{ padding: "10px 16px", borderBottom: "1px solid var(--border-alt)", fontSize: 13, color: "var(--text-main)", fontWeight: 600 }}>{p.user?.name || "Unknown User"}</td>
                        <td style={{ padding: "10px 16px", borderBottom: "1px solid var(--border-alt)", fontSize: 11, color: "var(--text-sub)" }}>{p.paymentId || "—"}</td>
                        <td style={{ padding: "10px 16px", borderBottom: "1px solid var(--border-alt)", fontSize: 11, color: "var(--text-sub)" }}>{p.scheme?.schemeId || "—"}</td>
                        <td style={{ padding: "10px 16px", borderBottom: "1px solid var(--border-alt)", fontSize: 11, color: "var(--text-sub)" }}>{p.scheme?.startDate ? new Date(p.scheme.startDate).toLocaleDateString("en-IN") : "—"}</td>
                        <td style={{ padding: "10px 16px", borderBottom: "1px solid var(--border-alt)", fontSize: 13, color: "var(--text-main)", fontWeight: 700 }}>₹{(p.amount || 0).toLocaleString()}</td>
                        <td style={{ padding: "10px 16px", borderBottom: "1px solid var(--border-alt)", fontSize: 12, color: "var(--text-main)", fontWeight: 600 }}>Month {p.monthNumber}</td>
                        <td style={{ padding: "10px 16px", borderBottom: "1px solid var(--border-alt)", fontSize: 12, color: p.status === "overdue" ? "#EF4444" : "var(--text-sub)" }}>{p.dueDate ? new Date(p.dueDate).toLocaleDateString('en-IN') : "—"}</td>
                        <td style={{ padding: "10px 16px", borderBottom: "1px solid var(--border-alt)", fontSize: 12, fontWeight: 700, color: p.status === "overdue" ? "#EF4444" : "var(--text-main)" }}>{p.status?.toUpperCase() || "PENDING"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Tab 2: Payment History (New) */}
      {tab === "history" && (() => {
        const getLocalDateString = (dateObj) => {
          return dateObj.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
          });
        };

        const sortedPayments = [...groupedHistory].sort((a, b) => {
          return new Date(b.paidDate || b.createdAt) - new Date(a.paidDate || a.createdAt);
        });

        const query = (historySearchQuery || "").trim().toLowerCase();
        const filteredPayments = sortedPayments.filter(p => {
          if (!p.user) return false;
          const phone = (p.user?.phone || "").toLowerCase();
          const name = (p.user?.name || "").toLowerCase();
          const schemeId = (p.scheme?.schemeId || "").toLowerCase();
          const utr = (p.utrNumber || "").toLowerCase();
          const amount = String(p.amount || "");
          return phone.includes(query) || name.includes(query) || schemeId.includes(query) || utr.includes(query) || amount.includes(query);
        });

        const todayStr = getLocalDateString(new Date());

        const groupedByDate = {};
        filteredPayments.forEach(p => {
          if (!p.user) return;
          const dateStr = getLocalDateString(new Date(p.paidDate || p.createdAt));
          if (!groupedByDate[dateStr]) groupedByDate[dateStr] = [];
          groupedByDate[dateStr].push(p);
        });

        const dateKeys = Object.keys(groupedByDate);

        return (
          <Card>
            <CardHeader title="Payment History" />
            {loading ? (
              <div style={{ padding: 60, textAlign: "center", color: "var(--text-light)" }}>Loading history...</div>
            ) : groupedHistory.length === 0 ? (
              <div style={{ textAlign: "center", padding: 48, color: "var(--text-sub)", fontSize: 14 }}>No verified payment transactions found in history.</div>
            ) : (
              <div style={{ padding: "0 16px 16px" }}>
                {/* Search Bar Input */}
                <div style={{ marginBottom: 20, position: "relative" }}>
                  <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-light)", fontSize: 15 }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search by User Phone, Name, Scheme ID, or UTR..."
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px 12px 42px",
                      borderRadius: 10,
                      border: "1px solid var(--border-alt)",
                      background: "var(--bg-input)",
                      color: "var(--text-main)",
                      fontSize: 14,
                      outline: "none",
                      transition: "border-color 0.2s"
                    }}
                  />
                  {historySearchQuery && (
                    <span
                      onClick={() => setHistorySearchQuery("")}
                      style={{
                        position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                        cursor: "pointer", color: "var(--text-light)", fontSize: 14, fontWeight: "bold"
                      }}
                    >
                      ✕
                    </span>
                  )}
                </div>

                {filteredPayments.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 48, color: "var(--text-sub)", fontSize: 14 }}>
                    {"No payments found matching \""}<b>{historySearchQuery}</b>{"\"."}
                  </div>
                ) : (
                  dateKeys.map(dateStr => {
                    const isToday = dateStr === todayStr;
                    const dayPayments = groupedByDate[dateStr];

                    if (isToday) {
                      return (
                        <div key={dateStr} style={{ marginBottom: 28 }}>
                          <div style={{
                            padding: "14px 20px",
                            background: "linear-gradient(135deg, rgba(232,185,72,0.15), rgba(232,185,72,0.05))",
                            borderRadius: 14,
                            marginBottom: 16,
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            border: "1px solid rgba(232,185,72,0.25)",
                            boxShadow: "0 4px 20px rgba(232,185,72,0.05)"
                          }}>
                            <span style={{ fontSize: 22 }}>⚡</span>
                            <div>
                              <div style={{ fontWeight: 800, fontSize: 16, color: "var(--gold)", fontFamily: "'Fraunces', serif" }}>Today's Transactions</div>
                              <div style={{ fontSize: 11, color: "var(--text-light)", marginTop: 2, fontWeight: 500 }}>{todayStr} · Live activity</div>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", background: "rgba(232,185,72,0.1)", padding: "4px 10px", borderRadius: 20, marginLeft: "auto" }}>
                              {dayPayments.length} payments
                            </span>
                          </div>

                          <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border-main)", borderRadius: 14, padding: "16px 20px", overflow: "hidden" }}>
                            {renderHistoryTable(dayPayments)}
                          </div>
                        </div>
                      );
                    } else {
                      const isOpen = query !== "" || !!expandedDates[dateStr];
                      return (
                        <div key={dateStr} style={{ marginBottom: 16, border: "1px solid var(--border-alt)", borderRadius: 12, overflow: "hidden", transition: "all 0.3s ease" }}>
                          <div
                            onClick={() => toggleDateGroup(dateStr)}
                            style={{
                              background: isOpen ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                              padding: "16px 20px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              cursor: "pointer",
                              transition: "background 0.2s"
                            }}
                          >
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                              <div style={{
                                width: 36, height: 36, borderRadius: 10, background: "var(--primary-bg)",
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
                              }}>
                                📅
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-main)" }}>{dateStr}</div>
                                <div style={{ fontSize: 12, color: "var(--text-sub)", marginTop: 2 }}>
                                  {dayPayments.length} verified transaction{dayPayments.length > 1 ? "s" : ""}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-light)", background: "var(--bg-input)", padding: "3px 8px", borderRadius: 12 }}>
                                ₹{dayPayments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
                              </span>
                              <div style={{
                                fontWeight: 800,
                                color: "var(--text-light)",
                                fontSize: 12,
                                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "0.2s"
                              }}>▼</div>
                            </div>
                          </div>

                          {isOpen && (
                            <div style={{ background: "rgba(0,0,0,0.12)", padding: "16px 20px", borderTop: "1px solid var(--border-alt)" }}>
                              {renderHistoryTable(dayPayments)}
                            </div>
                          )}
                        </div>
                      );
                    }
                  })
                )}
              </div>
            )}
          </Card>
        );
      })()}

      {/* Tab 3: Approvals */}
      {tab === "approvals" && (
        <Card>
          <CardHeader title="Payments Awaiting Verification" />
          {loading ? <div style={{ padding: 60, textAlign: "center", color: "var(--text-light)" }}>Loading approvals...</div> : approvals.length === 0 ? <div style={{ padding: 60, textAlign: "center", color: "var(--text-sub)" }}>No payments are currently awaiting verification.</div> : (
            <div className="table-container">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["Member", "Scheme", "Amount", "Month", "Submitted At", "Proof", "Action"].map(h => (
                    <th key={h} style={{
                      padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "var(--text-light)",
                      textAlign: "left", letterSpacing: 0.5, borderBottom: "2px solid var(--border-main)",
                      textTransform: "uppercase", whiteSpace: "nowrap"
                    }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {approvals.map(p => (
                    <tr key={p._id} className="table-row">
                      <td style={{ padding: "14px 16px", borderBottom: `1px solid var(--border-alt)` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar name={p.user?.name || "?"} size={28} fontSize={10} />
                          <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{p.user?.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", borderBottom: `1px solid var(--border-alt)` }}>
                        {p.scheme ? (
                          <span style={{ fontSize: 12, background: "var(--primary-bg)", color: "var(--primary)", borderRadius: 8, padding: "4px 8px", fontWeight: 700 }}>{p.scheme?.schemeId}</span>
                        ) : (
                          <span style={{ fontSize: 10, background: "rgba(212,160,23,0.15)", color: "#D4A017", borderRadius: 8, padding: "4px 8px", fontWeight: 700, textTransform: "uppercase" }}>New Enrollment</span>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px", borderBottom: `1px solid var(--border-alt)` }}><b style={{ color: "var(--text-main)" }}>₹{(p.amount || 0).toLocaleString()}</b></td>
                      <td style={{ padding: "14px 16px", borderBottom: `1px solid var(--border-alt)`, color: "var(--text-main)", fontSize: 13, fontWeight: 600 }}>
                        {p.scheme ? `Month ${p.monthNumber}` : "First Payment"}
                      </td>
                      <td style={{ padding: "14px 16px", borderBottom: `1px solid var(--border-alt)`, color: "var(--text-sub)", fontSize: 13 }}>{new Date(p.screenshotUploadedAt || p.updatedAt).toLocaleString('en-IN')}</td>
                      <td style={{ padding: "14px 16px", borderBottom: `1px solid var(--border-alt)` }}>
                        <button onClick={() => setViewProof(p)} style={{ padding: "6px 12px", fontSize: 11, background: "var(--bg-input)", color: "var(--primary)", border: "1px solid var(--primary)", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>👁 Verify Proof</button>
                      </td>
                      <td style={{ padding: "14px 16px", borderBottom: `1px solid var(--border-alt)` }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => setPendingPayAction({ id: p._id, type: "markPaid", label: `Approve payment for ${p.user?.name} — Month ${p.monthNumber}` })}
                            style={{ padding: "8px 14px", fontSize: 12, background: "#16A34A", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, boxShadow: "0 2px 8px rgba(22, 163, 74, 0.3)" }}
                          >✓ Approve</button>
                          <button
                            onClick={() => setShowRejectBox(p._id)}
                            style={{ padding: "8px 14px", fontSize: 12, background: "#FEF2F2", color: "#EF4444", border: "1.5px solid #EF4444", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
                          >✕ Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 5: Cash Payment */}
      {tab === "cash" && (
        <Card>
          <CardHeader title="Cash Payment Entry"
            right={<span style={{ fontSize: 12, color: "var(--text-sub)" }}>Update payments received directly via Cash or other modes.</span>} />

          <div style={{ padding: "0 24px 24px" }}>
            <div style={{ position: "relative", marginBottom: 24 }}>
              <input
                type="text"
                placeholder="Search member by phone number or name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: "100%", padding: "12px 16px 12px 42px", borderRadius: 12, border: "1.5px solid var(--border-alt)", background: "var(--bg-input)", color: "var(--text-main)", fontSize: 14, outline: "none" }}
              />
              <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18, opacity: 0.5 }}>🔍</span>
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "var(--text-light)" }}>✕</button>
              )}
            </div>

            {loading ? (
              <div style={{ padding: 60, textAlign: "center", color: "var(--text-light)" }}>Loading members...</div>
            ) : groupedUpcoming.filter(g => g.user?.phone?.includes(searchQuery) || g.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
              <div style={{ padding: 60, textAlign: "center", color: "var(--text-sub)" }}>
                {searchQuery ? "No members matching your search." : "No pending payments at this time."}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {groupedUpcoming
                  .filter(g => g.user?.phone?.includes(searchQuery) || g.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(group => {
                    const isOpen = openCashUser === group.user?._id;
                    return (
                      <div key={group.user?._id} style={{ border: "1.5px solid var(--border-alt)", borderRadius: 16, overflow: "hidden", background: "var(--bg-alt)" }}>
                        <div
                          onClick={() => setOpenCashUser(isOpen ? null : group.user?._id)}
                          style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border-main)", cursor: "pointer" }}
                        >
                          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <Avatar name={group.user?.name || "?"} img={group.user?.userPhoto} size={40} fontSize={15} />
                            <div>
                              <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text-main)" }}>{group.user?.name}</div>
                              <div style={{ fontSize: 13, color: "var(--text-sub)", marginTop: 2 }}>📞 {group.user?.phone} · ID: {group.user?.userId}</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: 0.5 }}>Pending</div>
                              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--gold)" }}>{group.schemes.reduce((acc, s) => acc + s.payments.length, 0)} Months</div>
                            </div>
                            <div style={{ fontSize: 24, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▾</div>
                          </div>
                        </div>

                        {isOpen && (
                          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                            {group.schemes.map(s => {
                              const schemeKey = `${group.user?._id}_${s.info?._id || s.schemeId || s.info?.schemeId}`;
                              const schemeOpen = openCashChit === schemeKey;
                              return (
                                <div key={schemeKey} style={{ background: "var(--bg-card)", borderRadius: 12, border: "1px solid var(--border-main)", overflow: "hidden" }}>
                                  <div
                                    onClick={() => setOpenCashChit(schemeOpen ? null : schemeKey)}
                                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", cursor: "pointer", background: "rgba(255,255,255,0.04)", borderBottom: schemeOpen ? "1px solid var(--border-alt)" : "none" }}
                                  >
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      <span style={{ fontSize: 12, background: "var(--primary-bg)", color: "var(--primary)", padding: "4px 10px", borderRadius: 8, fontWeight: 800, letterSpacing: 0.5 }}>{s.info?.schemeId || "Scheme"}</span>
                                      <span style={{ fontWeight: 700, color: "var(--text-main)", fontSize: 14 }}>₹{s.info?.monthlyAmount?.toLocaleString()}/mo</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                      <span style={{ fontSize: 12, color: "var(--text-light)", fontWeight: 600 }}>Started: {new Date(s.info?.startDate).toLocaleDateString()}</span>
                                      <span style={{ fontSize: 24, transform: schemeOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▾</span>
                                    </div>
                                  </div>
                                  {schemeOpen && (
                                    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                                      {s.payments.sort((a, b) => a.monthNumber - b.monthNumber).map(p => (
                                        <div key={p._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--bg-input)", borderRadius: 10, border: "1px solid var(--border-alt)" }}>
                                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: p.status === "overdue" ? "var(--danger-bg)" : "var(--primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: p.status === "overdue" ? "var(--danger)" : "var(--primary)" }}>{p.monthNumber}</div>
                                            <div>
                                              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>Month {p.monthNumber}</div>
                                              <div style={{ fontSize: 11, color: p.status === "overdue" ? "var(--danger)" : "var(--text-sub)", fontWeight: 600 }}>
                                                {p.status === "overdue" ? "⚠ OVERDUE" : `Due: ${new Date(p.dueDate).toLocaleDateString()}`}
                                              </div>
                                            </div>
                                          </div>
                                          <button
                                            onClick={() => setCashUpdate({
                                              paymentId: p._id,
                                              amount: p.amount,
                                              monthNumber: p.monthNumber,
                                              userName: group.user?.name,
                                              schemeName: s.info?.schemeId,
                                              date: new Date().toISOString().split('T')[0],
                                              mode: "Cash"
                                            })}
                                            style={{ padding: "8px 16px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, boxShadow: "0 2px 6px rgba(26,127,212,0.2)" }}
                                          >
                                            Update Payment
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Tab 4: Payment Update Settings */}
      {tab === "settings" && (
        <Card>
          <CardHeader title="Payment Processing Settings" />
          <div style={{ padding: "0 24px 20px" }}>
            <div style={{ fontSize: 13, color: "var(--text-light)", marginBottom: 24 }}>Update the shop's receiving payment details. These are shown to customers when they attempt to make their monthly payments.</div>
            {loading ? <div style={{ padding: 40, textAlign: "center", color: "var(--text-light)" }}>Loading settings...</div> : (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                  <Input label="Owner Name" value={settings.name} onChange={e => setSettings(s => ({ ...s, name: e.target.value }))} />
                  <Input label="Shop Phone Number" value={settings.phone} onChange={e => setSettings(s => ({ ...s, phone: e.target.value }))} />
                  <Input label="Shop Display Name" value={settings.shopName} onChange={e => setSettings(s => ({ ...s, shopName: e.target.value }))} />
                  <Input label="Bank Name" value={settings.bankName} onChange={e => setSettings(s => ({ ...s, bankName: e.target.value }))} />
                  <Input label="Branch" value={settings.branch} onChange={e => setSettings(s => ({ ...s, branch: e.target.value }))} />
                  <Input label="Account Number" value={settings.accountNumber} onChange={e => setSettings(s => ({ ...s, accountNumber: e.target.value }))} />
                  <Input label="IFSC Code" value={settings.ifscCode} onChange={e => setSettings(s => ({ ...s, ifscCode: e.target.value.toUpperCase() }))} />
                  <Input label="Account Holder Name" value={settings.accountName} onChange={e => setSettings(s => ({ ...s, accountName: e.target.value }))} />
                </div>

                <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={saveSettings} disabled={savingSettings}
                    style={{ padding: "14px 32px", fontSize: 14, fontWeight: 700, background: "var(--primary)", color: "#fff", border: "none", borderRadius: 10, cursor: savingSettings ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(59,154,235,0.3)", opacity: savingSettings ? 0.7 : 1 }}>
                    {savingSettings ? "Saving Settings..." : "Save Payment Settings"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
      {verificationAction === "Payment Settings" && (
        <SecurityVerificationModal
          actionName="Payment Processing Settings"
          onClose={() => setVerificationAction(null)}
          onVerified={executeSaveSettings}
        />
      )}

      {/* Passkey gate for Mark Paid / Approve */}
      {pendingPayAction && pendingPayAction.type === "markPaid" && (
        <SecurityVerificationModal
          actionName={pendingPayAction.label}
          onClose={() => setPendingPayAction(null)}
          onVerified={async (vToken) => {
            const extra = {
              paidDate: pendingPayAction.paidDate,
              paymentMode: pendingPayAction.paymentMode,
              utrNumber: pendingPayAction.utrNumber
            };
            setPendingPayAction(null);
            await markPaid(pendingPayAction.id, vToken, extra);
          }}
        />
      )}

      {cashUpdate && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(11,31,62,0.6)",
          backdropFilter: "blur(4px)", zIndex: 2000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div style={{ background: "var(--bg-card)", borderRadius: 18, width: "100%", maxWidth: 440, overflow: "hidden", boxShadow: "0 24px 56px rgba(0,0,0,0.35)" }}>
            <div style={{ background: "var(--primary)", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "'Sora',sans-serif" }}>💵 Update Cash Payment</div>
              <button onClick={() => setCashUpdate(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: "var(--text-light)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Member</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-main)", marginTop: 4 }}>{cashUpdate.userName}</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: "var(--text-light)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Chit / Installment</div>
                <div style={{ fontSize: 13, color: "var(--text-sub)", marginTop: 4 }}>{cashUpdate.schemeName} — <span style={{ color: "var(--primary)", fontWeight: 700 }}>Month {cashUpdate.monthNumber}</span></div>
              </div>
              <div style={{ marginBottom: 20, background: "var(--primary-bg)", padding: 12, borderRadius: 10, border: "1px solid var(--border-main)" }}>
                <div style={{ fontSize: 10, color: "var(--primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Payable Amount</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--primary)", marginTop: 4 }}>₹{cashUpdate.amount.toLocaleString()}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Input label="Payment Date" type="date" value={cashUpdate.date} onChange={e => setCashUpdate(p => ({ ...p, date: e.target.value }))} />
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-sub)", marginBottom: 6, textTransform: "uppercase" }}>Payment Mode</label>
                  <select value={cashUpdate.mode} onChange={e => setCashUpdate(p => ({ ...p, mode: e.target.value }))}
                    style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1.5px solid var(--border-alt)", background: "var(--bg-input)", color: "var(--text-main)", fontSize: 14, outline: "none", minHeight: 44, fontFamily: "'DM Sans', sans-serif" }}>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              {(cashUpdate.mode === "UPI" || cashUpdate.mode === "Bank Transfer") && (
                <div style={{ marginTop: 4 }}>
                  <Input
                    label="Transaction ID / Reference Number"
                    placeholder="Enter UPI UTR or Bank Txn ID"
                    value={cashUpdate.transactionId || ""}
                    onChange={e => setCashUpdate(p => ({ ...p, transactionId: e.target.value }))}
                    noMargin
                  />
                </div>
              )}
            </div>
            <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border-main)", display: "flex", justifyContent: "flex-end", gap: 10, background: "var(--bg-alt)" }}>
              <button onClick={() => setCashUpdate(null)} style={{ padding: "10px 20px", background: "var(--bg-input)", border: "1.5px solid var(--border-alt)", color: "var(--text-sub)", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Cancel</button>
              {(!((cashUpdate.mode === "UPI" || cashUpdate.mode === "Bank Transfer") && !(cashUpdate.transactionId && cashUpdate.transactionId.trim()))) && (
                <button
                  onClick={() => {
                    setPendingPayAction({
                      id: cashUpdate.paymentId,
                      type: "markPaid",
                      label: `Record ${cashUpdate.mode} Payment of ₹${cashUpdate.amount}`,
                      paidDate: cashUpdate.date,
                      paymentMode: cashUpdate.mode,
                      utrNumber: cashUpdate.transactionId ? cashUpdate.transactionId.trim() : ""
                    });
                    setCashUpdate(null);
                  }}
                  style={{ padding: "10px 24px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13, boxShadow: "0 4px 12px rgba(26,127,212,0.3)" }}
                >Mark as Paid</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject box with reason + passkey */}
      {showRejectBox && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(11,31,62,0.6)",
          backdropFilter: "blur(4px)", zIndex: 2000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div style={{ background: "var(--bg-card)", borderRadius: 18, width: "100%", maxWidth: 440, overflow: "hidden", boxShadow: "0 24px 56px rgba(0,0,0,0.35)" }}>
            <div style={{ background: "#EF4444", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "'Sora',sans-serif" }}>✕ Reject Payment</div>
              <button onClick={() => { setShowRejectBox(null); setRejectReason(""); }} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: 13, color: "var(--text-sub)", marginBottom: 12 }}>Provide a reason for rejection. This will be shown to the user.</div>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
                placeholder="e.g. Screenshot unclear, UTR not matching..."
                style={{ width: "100%", padding: "12px 14px", border: "1.5px solid var(--border-main)", borderRadius: 10, fontSize: 13, outline: "none", fontFamily: "'DM Sans',sans-serif", background: "var(--bg-input)", color: "var(--text-main)", resize: "vertical" }}
              />
            </div>
            <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border-main)", display: "flex", justifyContent: "flex-end", gap: 10, background: "var(--bg-alt)" }}>
              <button onClick={() => { setShowRejectBox(null); setRejectReason(""); }} style={{ padding: "10px 20px", background: "var(--bg-input)", border: "1.5px solid var(--border-alt)", color: "var(--text-sub)", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Cancel</button>
              <button
                onClick={() => {
                  if (!rejectReason.trim()) { alert("Please enter a rejection reason."); return; }
                  setPendingPayAction({ id: showRejectBox, type: "reject", reason: rejectReason });
                  setShowRejectBox(null);
                }}
                style={{ padding: "10px 20px", background: "#EF4444", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13 }}
              >🔑 Enter Passkey &amp; Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* Passkey gate for Reject */}
      {pendingPayAction && pendingPayAction.type === "reject" && (
        <SecurityVerificationModal
          actionName={`Reject payment — ${pendingPayAction.reason}`}
          onClose={() => setPendingPayAction(null)}
          onVerified={async (vToken) => {
            setPendingPayAction(null);
            await rejectPayment(pendingPayAction.id, pendingPayAction.reason, vToken);
          }}
        />
      )}
    </div>
  );
}


// ── Gold Rate ──
function GoldRatePage({ goldRate, setGoldRate }) {
  const [input, setInput] = useState(goldRate);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = sessionStorage.getItem("adminToken");

  const fetchData = async () => {
    try {
      const histRes = await fetch(`${ADMIN_API}/api/goldrate/history?days=7`, { headers: { Authorization: `Bearer ${token}` } });
      const histData = await histRes.json();

      if (histData.success) setHistory(histData.data || []);
    } catch (e) { console.error("Error fetching gold rate data", e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
  }, [goldRate]); // refetch when live goldRate updates

  const handleSave = () => {
    setGoldRate(input);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="gold-grid-2">
        <Card>
          <CardHeader title="Update Today's Gold Rate" />
          <div style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>
            This rate will be used for all payment conversions today and will be visible on the user dashboard.
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <Input label="Gold Rate (₹ per gram)" type="number"
                value={input} onChange={e => setInput(+e.target.value)} />
            </div>
            <Btn onClick={handleSave} style={{ marginBottom: 16 }}>
              {saved ? "✓ Saved!" : "Update Rate"}
            </Btn>
          </div>
          <div style={{
            background: "#FDF6DC", border: "1px solid rgba(212,160,23,0.3)",
            borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14
          }}>
            <span style={{ fontSize: 24, color: "#D4A017" }}>◆</span>
            <div>
              <div style={{ fontSize: 12, color: "#A37800", fontWeight: 600, letterSpacing: 0.5 }}>CURRENT RATE</div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 28, fontWeight: 800, color: "#D4A017", marginTop: 2 }}>
                ₹{goldRate.toLocaleString()}/g
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Rate History (Last 7 Days)" />
          {loading ? (
            <div style={{ padding: 20, textAlign: "center", color: "#94A3B8" }}>Loading history...</div>
          ) : history.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "#94A3B8" }}>No history found.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {history.map(r => {
                const changeStr = r.change > 0 ? `+₹${r.change.toLocaleString()}` : r.change < 0 ? `-₹${Math.abs(r.change).toLocaleString()}` : `₹0`;
                return (
                  <div key={r.date} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", background: "#FAFAFA", borderRadius: 10, border: "1px solid #F1F5F9"
                  }}>
                    <div style={{ fontSize: 13, color: "#475569" }}>
                      {new Date(r.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                      {r.isSnapshot ? <span style={{ fontSize: 10, marginLeft: 6, background: '#EEF6FD', color: '#1A7FD4', padding: '2px 6px', borderRadius: 10, fontWeight: 600 }}>12 AM</span> : ''}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <b style={{ fontSize: 15, color: "#0B1F3E" }}>₹{r.ratePerGram.toLocaleString()}</b>
                      <span style={{
                        fontSize: 12, fontWeight: 600,
                        color: r.change > 0 ? "#059669" : r.change < 0 ? "#EF4444" : "#64748B",
                        background: r.change > 0 ? "#ECFDF5" : r.change < 0 ? "#FEF2F2" : "#F1F5F9",
                        borderRadius: 20, padding: "2px 8px"
                      }}>{changeStr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>


    </div>
  );
}

// ── Reminders ──
function RemindersPage() {
  const token = sessionStorage.getItem("adminToken");
  const [stats,        setStats]        = useState({ sentToday: 0, pending: 0, overdue: 0 });
  const [activeTab,    setActiveTab]    = useState(null);
  const [tabData,      setTabData]      = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [tabLoading,   setTabLoading]   = useState(false);
  const [sendingId,    setSendingId]    = useState(null);
  const [sendFeedback, setSendFeedback] = useState({});

  // WhatsApp state
  const [waContacts,  setWaContacts]  = useState([]);
  const [waLoading,   setWaLoading]   = useState(false);
  const [waFilter,    setWaFilter]    = useState("all");
  const [waSearch,    setWaSearch]    = useState("");
  const [waSelected,  setWaSelected]  = useState(null);
  const [waMsg,       setWaMsg]       = useState("");
  const [waSending,   setWaSending]   = useState(false);
  const [waFeedback,  setWaFeedback]  = useState({});
  const [bulkModal,   setBulkModal]   = useState(false);
  const [bulkMsg,     setBulkMsg]     = useState("");
  const [bulkFilter,  setBulkFilter]  = useState("all");
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkResult,  setBulkResult]  = useState(null);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res  = await fetch(`${ADMIN_API}/api/reminders/stats`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (e) { console.error(e); }
    finally { setStatsLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  const openTab = async (tabKey) => {
    setActiveTab(tabKey);
    setTabData([]);
    setSendFeedback({});
    if (tabKey === "whatsapp") {
      setWaLoading(true); setWaContacts([]); setWaSelected(null);
      try {
        const res  = await fetch(`${ADMIN_API}/api/reminders/whatsapp/contacts`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setWaContacts(data.data || []);
      } catch (e) { console.error(e); }
      finally { setWaLoading(false); }
      return;
    }
    setTabLoading(true);
    try {
      const url = tabKey === "sentToday"
        ? `${ADMIN_API}/api/reminders/sent-today`
        : `${ADMIN_API}/api/reminders/pending-list`;
      const res  = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setTabData(data.data || []);
    } catch (e) { console.error(e); }
    finally { setTabLoading(false); }
  };

  const filteredList = activeTab === "pending"
    ? tabData.filter(p => p._computedStatus === "pending" || (p.dueDate && new Date(p.dueDate) >= new Date()))
    : activeTab === "overdue"
    ? tabData.filter(p => p._computedStatus === "overdue" || (p.dueDate && new Date(p.dueDate) < new Date()))
    : tabData;

  const handleSend = async (paymentId) => {
    setSendingId(paymentId);
    try {
      const res  = await fetch(`${ADMIN_API}/api/reminders/send/${paymentId}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setSendFeedback(prev => ({ ...prev, [paymentId]: data.success ? "sent" : "failed" }));
      if (data.success) await fetchStats();
    } catch { setSendFeedback(prev => ({ ...prev, [paymentId]: "failed" })); }
    finally  { setSendingId(null); }
  };

  const handleWASend = async (contact) => {
    // If user has no pending/overdue payment, just send a custom message directly
    if (!contact._hasPayment && !waMsg.trim()) {
      alert("This user has no pending payment. Please type a custom message to send.");
      setWaSending(false);
      return;
    }
    setWaSending(true);
    const isOverdue = contact._isOverdue;
    const defMsg = contact._hasPayment
      ? `Dear ${contact.user?.name}, your Gold Chit payment of Rs.${(contact.amount||0).toLocaleString()} ` +
        `(Scheme ${contact.scheme?.schemeId}, Month ${contact.monthNumber}) is ${isOverdue ? "OVERDUE" : "due soon"}. ` +
        `Please pay immediately. - SkyUp Digital Solution`
      : waMsg;
    try {
      const res = await fetch(`${ADMIN_API}/api/reminders/whatsapp/send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: contact._paymentId || contact._id, customMessage: waMsg || defMsg }),
      });
      const data = await res.json();
      setWaFeedback(prev => ({ ...prev, [contact.user._id]: data.success ? "sent" : "failed" }));
      setWaMsg("");
    } catch { setWaFeedback(prev => ({ ...prev, [contact.user._id]: "failed" })); }
    finally { setWaSending(false); }
  };

  const handleWABulk = async () => {
    setBulkSending(true); setBulkResult(null);
    try {
      const res  = await fetch(`${ADMIN_API}/api/reminders/whatsapp/bulk`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ customMessage: bulkMsg || undefined, filter: bulkFilter }),
      });
      const data = await res.json();
      setBulkResult(data);
    } catch (e) { setBulkResult({ success: false, error: e.message }); }
    finally { setBulkSending(false); }
  };

  const allCount = waContacts.length;
  const pendingCount = waContacts.filter(c => c._isPending).length;
  const overdueCount = waContacts.filter(c => c._isOverdue).length;

  const waFiltered = waContacts.filter(c => {
    const q = waSearch.toLowerCase();
    const match = !q || c.user?.name?.toLowerCase().includes(q) || c.user?.phone?.includes(q);
    if (!match) return false;
    if (waFilter === "overdue")  return c._isOverdue;
    if (waFilter === "pending")  return c._isPending;
    return true; // "all" — show every user
  });

  const statCards = [
    { key: "sentToday", label: "Sent Today", value: stats.sentToday, color: "#1A7FD4", activeBg: "#EEF6FD", activeBorder: "#93C5FD", icon: "📤" },
    { key: "pending",   label: "Pending",    value: stats.pending,   color: "#D97706", activeBg: "#FFFBEB", activeBorder: "#FCD34D", icon: "⏳", sub: "Due in next 7 days" },
    { key: "overdue",   label: "Overdue",    value: stats.overdue,   color: "#EF4444", activeBg: "#FEF2F2", activeBorder: "#FCA5A5", icon: "🚨" },
  ];

  const panelMeta = {
    sentToday: { title: "📤 SMS Sent Today",                empty: "No SMS reminders were sent today.",       emptyIcon: "📭" },
    pending:   { title: "⏳ Pending Payments (Next 7 Days)", empty: "No pending payments in the next 7 days.", emptyIcon: "🎉" },
    overdue:   { title: "🚨 Overdue Payments",              empty: "No overdue payments — great job!",         emptyIcon: "✅" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Top row: 3 stat cards + WhatsApp button ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 16, alignItems: "stretch" }}>
        {statCards.map(s => {
          const isActive = activeTab === s.key;
          return (
            <button key={s.key}
              onClick={() => activeTab === s.key ? setActiveTab(null) : openTab(s.key)}
              style={{
                background: isActive ? s.activeBg : "#fff", borderRadius: 14, padding: "18px 22px",
                boxShadow: isActive ? `0 0 0 2px ${s.activeBorder}, 0 4px 16px rgba(0,0,0,0.10)` : "0 1px 8px rgba(0,0,0,0.07)",
                border: `2px solid ${isActive ? s.color : "#F1F5F9"}`, textAlign: "left", cursor: "pointer",
                transition: "all 0.18s ease", transform: isActive ? "translateY(-2px)" : "none", outline: "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 16 }}>{s.icon}</span>
                  <span style={{ fontSize: 11, color: isActive ? s.color : "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</span>
                </div>
                {isActive && <span style={{ fontSize: 10, fontWeight: 700, color: s.color, background: s.activeBg, border: `1px solid ${s.activeBorder}`, borderRadius: 20, padding: "2px 8px" }}>ACTIVE ▼</span>}
              </div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 36, fontWeight: 800, color: s.color, lineHeight: 1 }}>{statsLoading ? "—" : s.value}</div>
              {s.sub && <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 6 }}>{s.sub}</div>}
              {!isActive && <div style={{ fontSize: 10, color: s.color, marginTop: 8, fontWeight: 600, opacity: 0.7 }}>Click to view →</div>}
            </button>
          );
        })}

        {/* WhatsApp Card */}
        <button
          onClick={() => activeTab === "whatsapp" ? setActiveTab(null) : openTab("whatsapp")}
          style={{
            background: activeTab === "whatsapp" ? "#ECFDF5" : "#fff", borderRadius: 14, padding: "18px 22px",
            boxShadow: activeTab === "whatsapp" ? "0 0 0 2px #6EE7B7, 0 4px 16px rgba(0,0,0,0.10)" : "0 1px 8px rgba(0,0,0,0.07)",
            border: `2px solid ${activeTab === "whatsapp" ? "#25D366" : "#F1F5F9"}`,
            textAlign: "left", cursor: "pointer", transition: "all 0.18s ease",
            transform: activeTab === "whatsapp" ? "translateY(-2px)" : "none", outline: "none", minWidth: 160,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="16" fill="#25D366"/>
                <path d="M23.5 8.5C21.6 6.6 19.1 5.5 16.4 5.5C10.9 5.5 6.4 10 6.4 15.5C6.4 17.3 6.9 19.1 7.8 20.6L6.3 26L11.9 24.6C13.4 25.4 15.1 25.8 16.9 25.8H16.4C21.9 25.8 26.5 21.3 26.5 15.8C26.5 13.1 25.4 10.4 23.5 8.5ZM16.4 24.1H16.1C14.5 24.1 12.9 23.6 11.6 22.7L11.3 22.5L8.3 23.3L9.1 20.4L8.9 20.1C8 18.7 7.5 17.1 7.5 15.5C7.5 10.7 11.6 6.7 16.4 6.7C18.7 6.7 20.9 7.6 22.5 9.2C24.1 10.8 25.1 13 25 15.4C25.2 20.3 21.2 24.1 16.4 24.1ZM21.2 17.8C20.9 17.7 19.4 16.9 19.1 16.8C18.8 16.7 18.6 16.7 18.4 17C18.2 17.3 17.5 18 17.4 18.2C17.2 18.4 17.1 18.4 16.8 18.3C16.5 18.2 15.5 17.8 14.3 16.8C13.4 16 12.8 15.1 12.6 14.8C12.4 14.5 12.6 14.3 12.8 14.1C12.9 14 13.1 13.8 13.2 13.6C13.3 13.4 13.4 13.3 13.5 13.1C13.6 12.9 13.5 12.7 13.4 12.6C13.3 12.5 12.7 10.9 12.4 10.3C12.1 9.7 11.9 9.7 11.7 9.7H11.2C11 9.7 10.7 9.8 10.4 10.1C10.1 10.4 9.3 11.1 9.3 12.7C9.3 14.3 10.4 15.8 10.6 16C10.8 16.2 12.7 19.1 15.7 20.5C16.3 20.8 16.8 21 17.2 21.1C17.8 21.3 18.4 21.3 18.9 21.2C19.4 21.1 20.5 20.5 20.8 19.8C21 19.1 21 18.6 20.9 18.5C20.8 18.2 20.6 18.1 20.3 18L21.2 17.8Z" fill="white"/>
              </svg>
              <span style={{ fontSize: 11, color: activeTab === "whatsapp" ? "#25D366" : "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>WhatsApp</span>
            </div>
            {activeTab === "whatsapp" && <span style={{ fontSize: 10, fontWeight: 700, color: "#25D366", background: "#ECFDF5", border: "1px solid #6EE7B7", borderRadius: 20, padding: "2px 8px" }}>ACTIVE ▼</span>}
          </div>
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 700, color: "#25D366", lineHeight: 1.4 }}>
            Bulk Send<br /><span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>via MSG91</span>
          </div>
          {activeTab !== "whatsapp" && <div style={{ fontSize: 10, color: "#25D366", marginTop: 10, fontWeight: 600, opacity: 0.8 }}>Click to open →</div>}
        </button>
      </div>

      {/* ── WhatsApp Panel ── */}
      {activeTab === "whatsapp" && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", overflow: "hidden", display: "flex", height: 560 }}>

          {/* LEFT SIDEBAR */}
          <div style={{ width: 290, borderRight: "1px solid #E2E8F0", display: "flex", flexDirection: "column", background: "#FAFAFA" }}>
            <div style={{ padding: "14px 12px 8px" }}>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 14 }}>🔍</span>
                <input value={waSearch} onChange={e => setWaSearch(e.target.value)} placeholder="Search by name or number..."
                  style={{ width: "100%", padding: "8px 10px 8px 32px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff", boxSizing: "border-box", color: "#1A1A1A" }} />
              </div>
            </div>
            <div style={{ display: "flex", padding: "0 12px 8px", gap: 4 }}>
              {[[ "all", `All (${allCount})` ], [ "pending", `Pending (${pendingCount})` ], [ "overdue", `Overdue (${overdueCount})` ]].map(([v, l]) => (
                <button key={v} onClick={() => setWaFilter(v)} style={{
                  flex: 1, padding: "5px 0", fontSize: 11, fontWeight: 600,
                  background: waFilter === v ? (v === "overdue" ? "#FEF2F2" : v === "pending" ? "#FFFBEB" : "#ECFDF5") : "none",
                  border: `1px solid ${waFilter === v ? (v === "overdue" ? "#FECACA" : v === "pending" ? "#FDE68A" : "#6EE7B7") : "#E2E8F0"}`,
                  borderRadius: 6, cursor: "pointer",
                  color: waFilter === v ? (v === "overdue" ? "#EF4444" : v === "pending" ? "#D97706" : "#25D366") : "#64748B",
                }}>{l}</button>
              ))}
            </div>
            <div style={{ padding: "0 12px 10px" }}>
              <button onClick={() => setBulkModal(true)} style={{
                width: "100%", padding: "10px 0", background: "#25D366", color: "#fff", border: "none",
                borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                boxShadow: "0 2px 8px rgba(37,211,102,0.35)",
              }}>
                <span>👥</span> Bulk WhatsApp
              </button>
            </div>
            <div style={{ padding: "0 12px 6px", borderBottom: "1px solid #E2E8F0" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#25D366", borderBottom: "2px solid #25D366", paddingBottom: 4 }}>
                Chats ({waFiltered.length})
              </span>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {waLoading ? (
                <div style={{ padding: "32px 0", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>Loading…</div>
              ) : waFiltered.length === 0 ? (
                <div style={{ padding: "32px 12px", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>No contacts found</div>
              ) : waFiltered.map(c => {
                const uid        = c.user?._id || c._id;
                const isSelected = waSelected?.user?._id === uid;
                const isOver     = c._isOverdue;
                const isPend     = c._isPending;
                const hasPayment = c._hasPayment;
                const fb         = waFeedback[uid];
                const avatarBg   = isOver ? "linear-gradient(135deg,#EF4444,#F87171)"
                                 : isPend ? "linear-gradient(135deg,#D97706,#FCD34D)"
                                 : "linear-gradient(135deg,#25D366,#128C7E)";
                const statusLabel = isOver  ? "🚨 Overdue"
                                  : isPend  ? "⏳ Pending"
                                  : "✅ All Clear";
                const statusColor = isOver  ? "#EF4444"
                                  : isPend  ? "#D97706"
                                  : "#16A34A";
                const dotColor   = isOver ? "#EF4444" : isPend ? "#D97706" : "#25D366";
                return (
                  <div key={uid} onClick={() => { setWaSelected(c); setWaMsg(""); }}
                    style={{
                      padding: "12px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                      background: isSelected ? "#ECFDF5" : "transparent",
                      borderLeft: isSelected ? "3px solid #25D366" : "3px solid transparent",
                      borderBottom: "1px solid #F1F5F9", transition: "background 0.12s",
                    }}
                  >
                    <Avatar name={c.user?.name || "?"} bg={avatarBg} size={36} fontSize={13} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#0B1F3E", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.user?.name || "Unknown"}</div>
                      <div style={{ fontSize: 11, color: "#64748B", marginTop: 1, fontWeight: 500 }}>📱 {c.user?.phone || "—"}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: statusColor }}>{statusLabel}</div>
                      {hasPayment && c.amount > 0 && <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 1 }}>₹{c.amount.toLocaleString("en-IN")}</div>}
                      {fb && <div style={{ fontSize: 10, color: fb === "sent" ? "#16A34A" : "#DC2626", marginTop: 2, fontWeight: 700 }}>{fb === "sent" ? "✅ Sent" : "❌ Failed"}</div>}
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, marginLeft: "auto", marginTop: 4 }} />
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* RIGHT PANEL */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {waSelected ? (
              <>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 12, background: "#fff" }}>
                  <Avatar name={waSelected.user?.name || "?"}
                    bg={waSelected._isOverdue ? "linear-gradient(135deg,#EF4444,#F87171)" : waSelected._isPending ? "linear-gradient(135deg,#D97706,#FCD34D)" : "linear-gradient(135deg,#25D366,#128C7E)"}
                    size={40} fontSize={14} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#0B1F3E" }}>{waSelected.user?.name}</div>
                    <div style={{ fontSize: 12, color: "#94A3B8" }}>📱 +91 {waSelected.user?.phone}{waSelected._hasPayment ? ` · ${waSelected.scheme?.schemeId} · Month ${waSelected.monthNumber}` : " · No pending payment"}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {waSelected._hasPayment && <div style={{ fontWeight: 800, color: "#0B1F3E", fontSize: 16 }}>₹{(waSelected.amount||0).toLocaleString("en-IN")}</div>}
                    <div style={{ fontSize: 11, fontWeight: 700, marginTop: 2, color: waSelected._isOverdue ? "#EF4444" : waSelected._isPending ? "#D97706" : "#16A34A" }}>
                      {waSelected._isOverdue ? "🚨 OVERDUE" : waSelected._isPending ? "⏳ Pending" : "✅ All Clear"}
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", background: "#E5DDD5", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <div style={{ alignSelf: "flex-end", maxWidth: "80%" }}>
                    <div style={{ background: "#DCF8C6", borderRadius: "12px 12px 2px 12px", padding: "10px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.12)", fontSize: 13, color: "#1A1A1A", lineHeight: 1.5 }}>
                      {waMsg || (`Dear ${waSelected.user?.name}, your Gold Chit payment of ₹${(waSelected.amount||0).toLocaleString("en-IN")} (Scheme ${waSelected.scheme?.schemeId}, Month ${waSelected.monthNumber}) is ${waSelected._isOverdue ? "OVERDUE" : "due soon"}. Please pay immediately. - SkyUp Digital Solution`)}
                    </div>
                    <div style={{ fontSize: 10, color: "#94A3B8", textAlign: "right", marginTop: 3 }}>Preview · via MSG91 WhatsApp</div>
                  </div>
                  {waFeedback[waSelected.user?._id] && (
                    <div style={{ alignSelf: "center", marginTop: 12, background: waFeedback[waSelected.user?._id] === "sent" ? "#DCFCE7" : "#FEE2E2", color: waFeedback[waSelected.user?._id] === "sent" ? "#16A34A" : "#DC2626", padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                      {waFeedback[waSelected.user?._id] === "sent" ? "✅ WhatsApp Sent" : "❌ Failed to Send"}
                    </div>
                  )}
                </div>
                <div style={{ padding: "12px 20px", borderTop: "1px solid #E2E8F0", background: "#F0F0F0", display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <textarea value={waMsg} onChange={e => setWaMsg(e.target.value)}
                    placeholder={waSelected._hasPayment ? "Type a custom message (leave empty for default)…" : "This member has no pending payment. Type your message here…"}
                    rows={2}
                    style={{ flex: 1, resize: "none", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", background: "#fff", fontFamily: "inherit", color: "#1A1A1A" }} />
                  <button onClick={() => handleWASend(waSelected)} disabled={waSending}
                    style={{ background: waSending ? "#94A3B8" : "#25D366", color: "#fff", border: "none", borderRadius: 10, width: 46, height: 46, display: "flex", alignItems: "center", justifyContent: "center", cursor: waSending ? "not-allowed" : "pointer", fontSize: 18, flexShrink: 0, boxShadow: "0 2px 8px rgba(37,211,102,0.4)" }}>
                    {waSending ? "⏳" : "➤"}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: "#F0F2F5" }}>
                <svg width="60" height="60" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="16" fill="#25D366" opacity="0.15"/>
                  <path d="M23.5 8.5C21.6 6.6 19.1 5.5 16.4 5.5C10.9 5.5 6.4 10 6.4 15.5C6.4 17.3 6.9 19.1 7.8 20.6L6.3 26L11.9 24.6C13.4 25.4 15.1 25.8 16.9 25.8H16.4C21.9 25.8 26.5 21.3 26.5 15.8C26.5 13.1 25.4 10.4 23.5 8.5Z" fill="#25D366" opacity="0.6"/>
                </svg>
                <div style={{ fontWeight: 700, color: "#4A5568", fontSize: 16 }}>Select a conversation</div>
                <div style={{ color: "#94A3B8", fontSize: 13 }}>Choose a contact from the list to send a WhatsApp message</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Bulk WhatsApp Modal ── */}
      {bulkModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: 500, maxWidth: "90vw", boxShadow: "0 16px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#25D366"/><path d="M23.5 8.5C21.6 6.6 19.1 5.5 16.4 5.5C10.9 5.5 6.4 10 6.4 15.5C6.4 17.3 6.9 19.1 7.8 20.6L6.3 26L11.9 24.6C13.4 25.4 15.1 25.8 16.9 25.8H16.4C21.9 25.8 26.5 21.3 26.5 15.8C26.5 13.1 25.4 10.4 23.5 8.5Z" fill="white"/></svg>
              <span style={{ fontWeight: 800, fontSize: 18, color: "#0B1F3E" }}>Bulk WhatsApp</span>
              <span style={{ marginLeft: "auto", cursor: "pointer", color: "#94A3B8", fontSize: 20 }} onClick={() => { setBulkModal(false); setBulkResult(null); setBulkMsg(""); }}>✕</span>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>SEND TO</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[["all","All (Pending + Overdue)"],["pending","Pending Only"],["overdue","Overdue Only"],["all_users","All Registered Users"]].map(([v, l]) => (
                  <button key={v} onClick={() => setBulkFilter(v)} style={{ flex: "1 1 calc(50% - 6px)", padding: "8px 4px", fontSize: 11, fontWeight: 600, background: bulkFilter === v ? "#25D366" : "#F8FAFC", color: bulkFilter === v ? "#fff" : "#475569", border: `1px solid ${bulkFilter === v ? "#25D366" : "#E2E8F0"}`, borderRadius: 8, cursor: "pointer", transition: "all 0.15s" }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>CUSTOM MESSAGE <span style={{ color: "#94A3B8", fontWeight: 400 }}>(leave blank for default)</span></label>
              <textarea value={bulkMsg} onChange={e => setBulkMsg(e.target.value)}
                placeholder="e.g. Dear {name}, your payment is due. Please pay immediately. - SkyUp Digital Solution"
                rows={4} style={{ width: "100%", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#1A1A1A" }} />
            </div>
            {bulkResult && (
              <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 16, background: bulkResult.success ? "#DCFCE7" : "#FEE2E2", color: bulkResult.success ? "#15803D" : "#DC2626", fontSize: 13, fontWeight: 600 }}>
                {bulkResult.success ? `✅ Done! Sent: ${bulkResult.sent} | Failed: ${bulkResult.failed} | Total: ${bulkResult.total}` : `❌ Error: ${bulkResult.message || bulkResult.error}`}
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setBulkModal(false); setBulkResult(null); setBulkMsg(""); }}
                style={{ flex: 1, padding: "11px 0", border: "1px solid #E2E8F0", borderRadius: 10, background: "#fff", color: "#475569", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
                Cancel
              </button>
              <button onClick={handleWABulk} disabled={bulkSending}
                style={{ flex: 2, padding: "11px 0", background: bulkSending ? "#94A3B8" : "#25D366", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, cursor: bulkSending ? "not-allowed" : "pointer", fontSize: 14, boxShadow: bulkSending ? "none" : "0 4px 12px rgba(37,211,102,0.4)" }}>
                {bulkSending ? "⏳ Sending…" : "📤 Send Bulk WhatsApp"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SMS tab detail panel ── */}
      {activeTab && activeTab !== "whatsapp" && (() => {
        const meta = panelMeta[activeTab];
        return (
          <Card>
            <CardHeader title={meta.title}
              right={
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button onClick={() => openTab(activeTab)} style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "4px 10px", fontSize: 12, color: "#475569", cursor: "pointer" }}>🔄 Refresh</button>
                  <button onClick={() => setActiveTab(null)} style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 8, padding: "4px 10px", fontSize: 12, color: "#94A3B8", cursor: "pointer" }}>✕ Close</button>
                </div>
              }
            />
            {tabLoading ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "#94A3B8", fontSize: 14 }}><div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>Loading…</div>
            ) : filteredList.length === 0 ? (
              <div style={{ padding: "52px 0", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>{meta.emptyIcon}</div>
                <div style={{ fontWeight: 700, color: "#0B1F3E", fontSize: 15 }}>{meta.empty}</div>
              </div>
            ) : activeTab === "sentToday" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredList.map(r => {
                  const userName = r.user?.name || "Unknown"; const userPhone = r.user?.phone || r.phone || "—";
                  const amount = r.payment?.amount; const sentTime = r.sentAt ? new Date(r.sentAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";
                  const schemeName = r.scheme?.schemeId || "—"; const monthNo = r.payment?.monthNumber || "—";
                  return (
                    <div key={r._id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "#F0F9FF", borderRadius: 12, border: "1px solid #BAE6FD" }}>
                      <Avatar name={userName} bg="linear-gradient(135deg,#1A7FD4,#60A5FA)" size={40} fontSize={14} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: "#0B1F3E", fontSize: 14 }}>{userName}</div>
                        <div style={{ fontSize: 12, color: "#64748B", marginTop: 2, display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <span>📱 {userPhone}</span>
                          {schemeName !== "—" && <><span>·</span><span>Scheme: {schemeName}</span></>}
                          {monthNo    !== "—" && <><span>·</span><span>Month {monthNo}</span></>}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {amount != null && <div style={{ fontWeight: 700, color: "#0B1F3E", fontSize: 15 }}>₹{amount.toLocaleString("en-IN")}</div>}
                        <div style={{ fontSize: 11, color: "#1A7FD4", fontWeight: 600, marginTop: 3 }}>✅ Sent at {sentTime}</div>
                      </div>
                      <div style={{ padding: "4px 12px", borderRadius: 20, background: "#DCFCE7", color: "#16A34A", fontSize: 11, fontWeight: 700 }}>SMS Sent</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredList.map(p => {
                  const isOverdue = p._computedStatus === "overdue" || (p.dueDate && new Date(p.dueDate) < new Date() && p.status !== "paid");
                  const dueLabel  = p.dueDate ? new Date(p.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
                  const userName = p.user?.name || "Unknown"; const userPhone = p.user?.phone || "—";
                  const schemeName = p.scheme?.schemeId || "—"; const feedback = sendFeedback[p._id];
                  const accent = isOverdue ? "#EF4444" : "#D97706";
                  return (
                    <div key={p._id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: isOverdue ? "#FFF5F5" : "#FFFDF0", borderRadius: 12, border: `1px solid ${isOverdue ? "#FECACA" : "#FDE68A"}` }}>
                      <Avatar name={userName} bg={isOverdue ? "linear-gradient(135deg,#EF4444,#F87171)" : "linear-gradient(135deg,#D97706,#FCD34D)"} size={40} fontSize={14} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: "#0B1F3E", fontSize: 14 }}>{userName}</div>
                        <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2, display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <span>📱 {userPhone}</span><span>·</span><span>{schemeName}</span><span>·</span><span>Month {p.monthNumber}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", minWidth: 110 }}>
                        <div style={{ fontWeight: 700, color: "#0B1F3E", fontSize: 15 }}>₹{(p.amount||0).toLocaleString("en-IN")}</div>
                        <div style={{ fontSize: 11, marginTop: 3, fontWeight: 700, color: accent }}>{isOverdue ? "🚨 OVERDUE" : `⏳ Due ${dueLabel}`}</div>
                        {!isOverdue && <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 1 }}>{dueLabel}</div>}
                      </div>
                      {feedback && <div style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: feedback === "sent" ? "#DCFCE7" : "#FEE2E2", color: feedback === "sent" ? "#16A34A" : "#DC2626", whiteSpace: "nowrap" }}>{feedback === "sent" ? "✅ Sent" : "❌ Failed"}</div>}
                      <button onClick={() => handleSend(p._id)} disabled={sendingId === p._id}
                        style={{ background: sendingId === p._id ? "#94A3B8" : accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: sendingId === p._id ? "not-allowed" : "pointer", whiteSpace: "nowrap", boxShadow: `0 2px 8px ${accent}40` }}>
                        {sendingId === p._id ? "Sending…" : "📱 Send SMS"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })()}

      {/* ── Idle hint ── */}
      {!activeTab && (
        <div style={{ background: "#fff", borderRadius: 16, padding: "40px 24px", textAlign: "center", border: "1px dashed #CBD5E1", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>👆</div>
          <div style={{ fontWeight: 700, color: "#0B1F3E", fontSize: 15 }}>Select a card above to view details</div>
          <div style={{ color: "#94A3B8", fontSize: 13, marginTop: 6 }}>
            Click <strong>Sent Today</strong>, <strong>Pending</strong>, <strong>Overdue</strong> for SMS — or <strong style={{ color: "#25D366" }}>WhatsApp</strong> to send via MSG91
          </div>
        </div>
      )}
    </div>
  );
}


function ReportsPage() {
  const [payments, setPayments] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [searchPhone, setSearchPhone] = useState("");
  const token = sessionStorage.getItem("adminToken");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [payRes, statsRes] = await Promise.all([
          fetch(`${ADMIN_API}/api/payments`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${ADMIN_API}/api/reports/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const payData = await payRes.json();
        const statsData = await statsRes.json();
        if (payData.success) setPayments(payData.data || []);
        if (statsData.success) setDashboardStats(statsData.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const paidPayments = payments.filter(p => p.status === "paid");

  const totalCollected = paidPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalGoldSold = paidPayments.reduce((acc, p) => acc + (p.gramsAdded || 0), 0);

  const monthlyData = {};
  paidPayments.forEach(p => {
    if (!p.paidDate) return;
    const date = new Date(p.paidDate);
    const monthKey = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    const sortKey = date.getFullYear() * 100 + date.getMonth();

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        month: monthKey,
        sortKey,
        totalCollected: 0,
        scheme1Gold: 0,
        scheme2Money: 0,
        payments: []
      };
    }

    monthlyData[monthKey].totalCollected += (p.amount || 0);
    if (p.gramsAdded && p.gramsAdded > 0) {
      monthlyData[monthKey].scheme1Gold += p.gramsAdded;
    } else {
      monthlyData[monthKey].scheme2Money += (p.amount || 0);
    }
    monthlyData[monthKey].payments.push(p);
  });

  const monthlyArray = Object.values(monthlyData).sort((a, b) => b.sortKey - a.sortKey);

  const filteredPayments = selectedMonth?.payments.filter(p => {
    if (!searchPhone) return true;
    return p.user?.phone?.includes(searchPhone);
  }) || [];

  const handleExportCSV = (paymentsToExport, monthName) => {
    const headers = "Date,User Name,User ID,Chit ID,Amount (INR),Gold Added (g)\n";
    const rows = paymentsToExport.map(p => {
      const date = p.paidDate ? new Date(p.paidDate).toLocaleDateString("en-IN") : "";
      const userName = p.user?.name || "";
      const userId = p.user?.userId || "";
      const schemeId = p.scheme?.schemeId || "";
      const amount = p.amount || 0;
      const gold = p.gramsAdded || 0;
      return `"${date}","${userName}","${userId}","${schemeId}","${amount}","${gold}"`;
    }).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Payments_${monthName.replace(" ", "_")}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading reports...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="report-stats-grid">
        {[
          { label: "Total Collected", value: `₹${totalCollected.toLocaleString()}`, color: "#059669" },
          { label: "Total Gold Sold", value: `${totalGoldSold.toFixed(3)}g`, color: "#D4A017" },
          { label: "Total Members", value: dashboardStats?.totalUsers || 0, color: "#1A7FD4" },
          { label: "Active Chits", value: dashboardStats?.activeSchemes || 0, color: "#7C3AED" },
        ].map(s => (
          <div key={s.label} style={{
            background: "#fff", borderRadius: 14, padding: "18px 20px",
            boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9"
          }}>
            <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader title="Monthly Report" />
        <div style={{ overflowX: "auto" }}>
          {monthlyArray.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: "#64748B" }}>No payment data available.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>{["Month", "Total Collected", "Gold Saved (Scheme 1)", "Money Saved (Scheme 2)"].map(h => (
                  <th key={h} style={{
                    padding: "9px 13px", fontSize: 11, fontWeight: 600, color: "#64748B",
                    textAlign: "left", letterSpacing: 0.4, borderBottom: "2px solid #F1F5F9",
                    textTransform: "uppercase", whiteSpace: "nowrap"
                  }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {monthlyArray.map(r => (
                  <tr key={r.month} className="table-row" style={{ cursor: "pointer" }} onClick={() => { setSelectedMonth(r); setSearchPhone(""); }}>
                    <td style={{ padding: "13px", borderBottom: "1px solid #F8FAFC", fontWeight: 600, color: "#0B1F3E" }}>{r.month}</td>
                    <td style={{ padding: "13px", borderBottom: "1px solid #F8FAFC" }}><b style={{ color: "#059669" }}>₹{r.totalCollected.toLocaleString()}</b></td>
                    <td style={{ padding: "13px", borderBottom: "1px solid #F8FAFC" }}><b style={{ color: "#D4A017" }}>{r.scheme1Gold.toFixed(3)}g</b></td>
                    <td style={{ padding: "13px", borderBottom: "1px solid #F8FAFC" }}><b style={{ color: "#1A7FD4" }}>₹{r.scheme2Money.toLocaleString()}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Detail Modal */}
      {selectedMonth && (
        <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => { setSelectedMonth(null); setSearchPhone(""); }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 800, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "85vh" }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: "#0F172A", fontFamily: "'Sora',sans-serif" }}>Payments for {selectedMonth.month}</h3>
                <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Total: ₹{selectedMonth.totalCollected.toLocaleString()}</div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Search by phone number"
                  value={searchPhone}
                  onChange={e => setSearchPhone(e.target.value)}
                  style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #CBD5E1", fontSize: 14, outline: "none", width: 240, background: "#F8FAFC", color: "#0F172A" }}
                />
                <Btn color="#059669" onClick={() => handleExportCSV(filteredPayments, selectedMonth.month)} style={{ padding: "8px 16px", fontSize: 13 }}>⬇ Export CSV</Btn>
                <button onClick={() => { setSelectedMonth(null); setSearchPhone(""); }} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748B" }}>✕</button>
              </div>
            </div>
            <div style={{ padding: 20, overflowY: "auto", background: "#F8FAFC", flex: 1 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <thead>
                  <tr style={{ background: "#F1F5F9" }}>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: 12, color: "#475569", fontWeight: 600 }}>Date</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: 12, color: "#475569", fontWeight: 600 }}>User</th>
                    <th style={{ padding: "12px", textAlign: "left", fontSize: 12, color: "#475569", fontWeight: 600 }}>Chit ID</th>
                    <th style={{ padding: "12px", textAlign: "right", fontSize: 12, color: "#475569", fontWeight: 600 }}>Amount</th>
                    <th style={{ padding: "12px", textAlign: "right", fontSize: 12, color: "#475569", fontWeight: 600 }}>Gold Added</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "12px", fontSize: 13, color: "#475569" }}>{new Date(p.paidDate).toLocaleDateString("en-IN")}</td>
                      <td style={{ padding: "12px", fontSize: 13, color: "#0F172A" }}>
                        <div style={{ fontWeight: 500 }}>{p.user?.name}</div>
                        <div style={{ fontSize: 11, color: "#64748B" }}>{p.user?.userId}</div>
                      </td>
                      <td style={{ padding: "12px", fontSize: 13, color: "#3B82F6", fontWeight: 500 }}>{p.scheme?.schemeId}</td>
                      <td style={{ padding: "12px", fontSize: 13, textAlign: "right", color: "#059669", fontWeight: 600 }}>₹{(p.amount || 0).toLocaleString()}</td>
                      <td style={{ padding: "12px", fontSize: 13, textAlign: "right", color: "#D4A017", fontWeight: 600 }}>
                        {p.gramsAdded ? `${p.gramsAdded.toFixed(3)}g` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Scheme Plans Page (Admin: create/manage plan templates) ──


function SchemePlansPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", description: "", monthlyAmount: "" });
  const [formErr, setFormErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const token = sessionStorage.getItem("adminToken");

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}/api/scheme-templates`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setTemplates(data.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { fetchTemplates(); }, []);

  const createPlan = async () => {
    if (!form.name.trim()) return setFormErr("Plan name is required");
    if (!form.monthlyAmount || +form.monthlyAmount < 6000)
      return setFormErr("Minimum monthly amount is ₹6,000");
    setFormErr(""); setSaving(true);
    try {
      const res = await fetch(`${ADMIN_API}/api/scheme-templates`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), description: form.description.trim(), monthlyAmount: +form.monthlyAmount }),
      });
      const data = await res.json();
      if (data.success) {
        setForm({ name: "", description: "", monthlyAmount: "" });
        setShowForm(false);
        fetchTemplates();
      } else {
        setFormErr(data.message || "Failed to create plan");
      }
    } catch { setFormErr("Network error"); } finally { setSaving(false); }
  };

  const togglePlan = async (id) => {
    try {
      const res = await fetch(`${ADMIN_API}/api/scheme-templates/${id}/toggle`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) fetchTemplates();
    } catch (e) { console.error(e); }
  };

  const deletePlan = async (id) => {
    if (!window.confirm("Delete this scheme plan?")) return;
    try {
      const res = await fetch(`${ADMIN_API}/api/scheme-templates/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) fetchTemplates();
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header card */}
      <Card style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: "#0B1F3E" }}>Scheme Plans</div>
          <div style={{ fontSize: 12.5, color: "#64748B", marginTop: 4 }}>Create gold savings plans that users can browse and request to join.</div>
        </div>
        <Btn onClick={() => setShowForm(s => !s)} color="#D4A017">
          {showForm ? "✕ Cancel" : "+ Create New Plan"}
        </Btn>
      </Card>

      {/* Create form */}
      {showForm && (
        <Card>
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 700, color: "#0B1F3E", marginBottom: 16 }}>New Scheme Plan</div>
          <div className="form-grid-2" style={{ marginBottom: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase" }}>Plan Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder='e.g. "Gold Savings - ₹6,000/month"'
                style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: "1.5px solid #E2E8F0", borderRadius: 10, background: "#FAFAFA", outline: "none", fontFamily: "inherit" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase" }}>Monthly Amount (₹) *</label>
              <input type="number" min={6000} value={form.monthlyAmount} onChange={e => setForm(f => ({ ...f, monthlyAmount: e.target.value }))}
                placeholder="Min ₹6,000"
                style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: "1.5px solid #E2E8F0", borderRadius: 10, background: "#FAFAFA", outline: "none", fontFamily: "inherit" }} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase" }}>Description (optional)</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of the plan benefits…"
              rows={2}
              style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: "1.5px solid #E2E8F0", borderRadius: 10, background: "#FAFAFA", outline: "none", fontFamily: "inherit", resize: "vertical" }} />
          </div>
          {formErr && <div style={{ color: "#EF4444", fontSize: 12.5, marginBottom: 10 }}>⚠ {formErr}</div>}
          <Btn onClick={createPlan} color="#059669" style={{ opacity: saving ? 0.75 : 1 }}>
            {saving ? "Creating…" : "✓ Create Plan"}
          </Btn>
        </Card>
      )}

      {/* Plans list */}
      {loading ? (
        <Card><div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>Loading plans…</div></Card>
      ) : templates.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: 48, color: "#94A3B8" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No scheme plans yet</div>
            <div style={{ fontSize: 13 }}>Create your first plan above. Users will be able to browse and request to join.</div>
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
          {templates.map(t => (
            <Card key={t._id} style={{ border: t.isActive ? "2px solid #22C55E" : "1px solid #F1F5F9", position: "relative" }}>
              {/* Status ribbon */}
              <div style={{
                position: "absolute", top: 0, right: 0,
                background: t.isActive ? "#ECFDF5" : "#FEF2F2",
                color: t.isActive ? "#059669" : "#EF4444",
                fontSize: 10, fontWeight: 700, padding: "4px 12px", borderBottomLeftRadius: 10
              }}>
                {t.isActive ? "✓ ACTIVE" : "✗ INACTIVE"}
              </div>

              <div style={{ marginBottom: 12, paddingRight: 65 }}>
                <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: "#0B1F3E", marginBottom: 3 }}>{t.name}</div>
                {t.description && <div style={{ fontSize: 12.5, color: "#64748B", lineHeight: 1.6 }}>{t.description}</div>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 3 }}>Monthly</div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 800, color: "#D4A017" }}>₹{(t.monthlyAmount || 0).toLocaleString()}</div>
                </div>
                <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 3 }}>Total Value</div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 800, color: "#1A7FD4" }}>₹{((t.monthlyAmount || 0) * 12).toLocaleString()}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => togglePlan(t._id)}
                  style={{
                    flex: 1, padding: "9px 0", fontSize: 12, fontWeight: 600, border: "none", borderRadius: 9, cursor: "pointer",
                    background: t.isActive ? "#FEF2F2" : "#ECFDF5",
                    color: t.isActive ? "#EF4444" : "#059669"
                  }}>
                  {t.isActive ? "⏸ Deactivate" : "▶ Activate"}
                </button>
                <button onClick={() => deletePlan(t._id)}
                  style={{
                    padding: "9px 14px", fontSize: 12, fontWeight: 600, border: "none", borderRadius: 9, cursor: "pointer",
                    background: "#FEF2F2", color: "#EF4444"
                  }}>
                  🗑
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Join Requests Page (Admin: approve/reject user scheme requests) ──
function JoinRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [acting, setActing] = useState(null); // requestId being processed
  const [noteBox, setNoteBox] = useState(null); // { id, note } for reject
  const token = sessionStorage.getItem("adminToken");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}/api/scheme-join`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setRequests(data.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { fetchRequests(); }, []);

  const approve = async (id) => {
    setActing(id);
    try {
      const res = await fetch(`${ADMIN_API}/api/scheme-join/${id}/approve`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) fetchRequests();
      else alert(data.message || "Failed to approve");
    } catch { alert("Network error"); } finally { setActing(null); }
  };

  const reject = async (id, note) => {
    setActing(id);
    try {
      const res = await fetch(`${ADMIN_API}/api/scheme-join/${id}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      const data = await res.json();
      if (data.success) { setNoteBox(null); fetchRequests(); }
      else alert(data.message || "Failed to reject");
    } catch { alert("Network error"); } finally { setActing(null); }
  };

  const STATUS_COLORS = {
    pending: { bg: "#FEF3C7", color: "#D97706", label: "Pending" },
    awaiting_payment: { bg: "#E0E7FF", color: "#4F46E5", label: "Awaiting Verification" },
    payment_verified: { bg: "#ECFDF5", color: "#059669", label: "Payment Verified" },
    approved: { bg: "#ECFDF5", color: "#059669", label: "Approved" },
    rejected: { bg: "#FEF2F2", color: "#EF4444", label: "Rejected" },
  };

  const filtered = requests.filter(r => filter === "all" || r.status === filter);
  const counts = {
    pending: requests.filter(r => r.status === "pending").length,
    awaiting_payment: requests.filter(r => r.status === "awaiting_payment").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Reject note modal */}
      {noteBox && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(11,31,62,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "24px 20px", width: "95%", maxWidth: 440, boxShadow: "0 20px 60px rgba(11,31,62,0.3)" }}>

            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: "#0B1F3E", marginBottom: 6 }}>Reject Request</div>
            <div style={{ fontSize: 12.5, color: "#64748B", marginBottom: 16 }}>Add an optional note for the user explaining why their request was rejected.</div>
            <textarea value={noteBox.note} onChange={e => setNoteBox(b => ({ ...b, note: e.target.value }))}
              placeholder="Reason for rejection (optional)…"
              rows={3}
              style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: "1.5px solid #E2E8F0", borderRadius: 10, background: "#FAFAFA", outline: "none", fontFamily: "inherit", resize: "vertical" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => setNoteBox(null)}
                style={{ flex: 1, padding: "10px 0", background: "#F1F5F9", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                Cancel
              </button>
              <button onClick={() => reject(noteBox.id, noteBox.note)}
                disabled={acting === noteBox.id}
                style={{ flex: 1, padding: "10px 0", background: "#EF4444", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                {acting === noteBox.id ? "Rejecting…" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="mini-stats-grid">
        {[
          { label: "Pending", value: counts.pending, color: "#D97706", bg: "#FFFBEB" },
          { label: "Payment Proof", value: counts.awaiting_payment, color: "#4F46E5", bg: "#E0E7FF" },
          { label: "Approved", value: counts.approved, color: "#059669", bg: "#ECFDF5" },
          { label: "Rejected", value: counts.rejected, color: "#EF4444", bg: "#FEF2F2" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #F1F5F9" }}>
            <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", background: "#F1F5F9", borderRadius: 12, padding: 4, width: "fit-content", gap: 0 }}>
        {[
          { id: "pending", label: `Pending (${counts.pending})` },
          { id: "awaiting_payment", label: `Payment Proof (${counts.awaiting_payment})` },
          { id: "approved", label: `Approved (${counts.approved})` },
          { id: "rejected", label: `Rejected (${counts.rejected})` },
          { id: "all", label: "All" },
        ].map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)}
            style={{
              padding: "8px 18px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", borderRadius: 9,
              fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s",
              background: filter === t.id ? "#fff" : "transparent",
              color: filter === t.id ? "#0B1F3E" : "#64748B",
              boxShadow: filter === t.id ? "0 2px 8px rgba(0,0,0,0.1)" : "none"
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Requests list */}
      <Card>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>Loading requests…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48, color: "#94A3B8" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🙋</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No {filter} requests</div>
            <div style={{ fontSize: 13 }}>User join requests will appear here once users start browsing your scheme plans.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(r => {
              const sc = STATUS_COLORS[r.status] || STATUS_COLORS.pending;
              return (
                <div key={r._id} style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px 16px", display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
                  {/* User info */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flex: "1 1 200px" }}>
                    <Avatar name={r.user?.name || "?"} img={r.user?.userPhoto} size={40} fontSize={14} />
                    <div>
                      <div style={{ fontWeight: 600, color: "#0B1F3E", fontSize: 14 }}>{r.user?.name || "Unknown User"}</div>
                      <div style={{ fontSize: 12, color: "#64748B", marginTop: 1 }}>{r.user?.phone || "—"}</div>
                    </div>
                  </div>

                  {/* Plan info */}
                  <div style={{ flex: "1 1 180px" }}>
                    <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 3 }}>Plan Requested</div>
                    <div style={{ fontWeight: 600, color: "#0B1F3E", fontSize: 13 }}>{r.template?.name || (r.planType === "Type1" ? "Scheme 1 (Custom)" : "Scheme 2 (Custom)")}</div>
                    <div style={{ fontSize: 12, color: "#D4A017", fontWeight: 600, marginTop: 1 }}>₹{(r.monthlyAmount || r.template?.monthlyAmount || 0).toLocaleString()}/month</div>
                    {r.startDate && r.totalMonths && (
                      <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{r.totalMonths} Months | Starts: {new Date(r.startDate).toLocaleDateString()}</div>
                    )}
                  </div>

                  {/* Date */}
                  <div style={{ flex: "0 1 120px" }}>
                    <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 3 }}>Requested</div>
                    <div style={{ fontSize: 12.5, color: "#475569" }}>{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
                  </div>

                  {/* Status + actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "0 1 auto" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color, borderRadius: 20, padding: "4px 12px", whiteSpace: "nowrap" }}>
                      {sc.label}
                    </span>

                    {/* Proof Details */}
                    {(r.screenshotUrl || r.utrNumber) && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginRight: 8, alignItems: "flex-end" }}>
                        {r.utrNumber && <span style={{ fontSize: 11, color: "#475569", background: "#F1F5F9", padding: "2px 6px", borderRadius: 4 }}>UTR: <b>{r.utrNumber}</b></span>}
                        {r.screenshotUrl && (
                          <a href={getFileUrl(r.screenshotUrl)} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#1A7FD4", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                            🖼️ View Screenshot
                          </a>
                        )}
                      </div>
                    )}

                    {(r.status === "pending" || r.status === "awaiting_payment" || r.status === "payment_verified") && (
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        {r.status === "payment_verified" ? (
                          <button onClick={() => approve(r._id)} disabled={acting === r._id}
                            style={{ padding: "8px 16px", background: "#059669", color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(5,150,105,0.2)" }}>
                            {acting === r._id ? "…" : "✓ Final Approve"}
                          </button>
                        ) : (
                          <div style={{ textAlign: "right", marginRight: 5 }}>
                            <div style={{ fontSize: 9, fontWeight: 800, color: "#D4A017", marginBottom: 2 }}>PENDING PAYMENT APPROVAL</div>
                            <button disabled
                              style={{ padding: "8px 16px", background: "#94A3B8", color: "#fff", border: "none", borderRadius: 9, cursor: "not-allowed", fontWeight: 600, fontSize: 12, opacity: 0.6 }}>
                              ✓ Approve
                            </button>
                          </div>
                        )}
                        <button onClick={() => setNoteBox({ id: r._id, note: "" })}
                          style={{ padding: "8px 14px", background: "#FEF2F2", color: "#EF4444", border: "none", borderRadius: 9, cursor: "pointer", fontWeight: 600, fontSize: 12 }}>
                          Reject
                        </button>
                      </div>
                    )}
                    {r.status === "approved" && r.schemeCreated && (
                      <span style={{ fontSize: 11.5, color: "#059669", fontWeight: 600 }}>Scheme Created ✓</span>
                    )}
                    {r.status === "rejected" && r.adminNote && (
                      <span style={{ fontSize: 11.5, color: "#EF4444" }} title={r.adminNote}>Note: {r.adminNote.slice(0, 30)}{r.adminNote.length > 30 ? "…" : ""}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

    </div>
  );
}

// ── Terms Admin Page ──
function TermsAdminPage() {
  const [terms, setTerms] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [verificationAction, setVerificationAction] = useState(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success"); // "success" | "error"
  const [histOpen, setHistOpen] = useState(false);
  const token = sessionStorage.getItem("adminToken");

  const fetchTerms = async () => {
    setLoading(true);
    try {
      const [tRes, hRes] = await Promise.all([
        fetch(`${ADMIN_API}/api/terms`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${ADMIN_API}/api/terms/history`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const tData = await tRes.json();
      const hData = await hRes.json();
      if (tData.success) { setTerms(tData.data); setDraft(tData.data.content || ""); }
      if (hData.success) setHistory(hData.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTerms(); }, []);

  const executeSaveTerms = async (verificationToken) => {
    setVerificationAction(null);
    setSaving(true); setMsg("");
    try {
      const res = await fetch(`${ADMIN_API}/api/terms`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft, verificationToken }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`✅ ${data.message}`);
        setMsgType("success");
        setEditing(false);
        fetchTerms();
      } else {
        setMsg(`⚠ ${data.message}`);
        setMsgType("error");
      }
    } catch (e) {
      setMsg("⚠ Network error");
      setMsgType("error");
    } finally { setSaving(false); }
  };

  const saveTerms = () => {
    if (!draft.trim()) return;
    setVerificationAction("Terms and Conditions");
  };

  if (loading) return (
    <div style={{ padding: 60, textAlign: "center", color: "var(--text-light)" }}>
      Loading Terms & Conditions…
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header card */}
      <Card>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>📜 Terms &amp; Conditions</div>
            <div style={{ fontSize: 13, color: "var(--text-sub)" }}>
              Version: <b>v{terms?.version || 1}</b> · Effective:{" "}
              {terms?.effectiveFrom ? new Date(terms.effectiveFrom).toLocaleDateString("en-IN") : "N/A"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn
              onClick={() => setHistOpen(!histOpen)}
              color="#475569"
            >
              {histOpen ? "Hide History" : "📜 Version History"}
            </Btn>
            {!editing ? (
              <Btn onClick={() => { setEditing(true); setMsg(""); }}>
                ✏️ Edit Terms
              </Btn>
            ) : (
              <>
                <Btn onClick={() => { setEditing(false); setDraft(terms?.content || ""); setMsg(""); }} color="#475569">
                  Cancel
                </Btn>
                <Btn onClick={saveTerms} color="#059669" style={{ opacity: saving ? 0.75 : 1 }}>
                  {saving ? "Saving…" : "✅ Save Changes"}
                </Btn>
              </>
            )}
          </div>
        </div>

        {msg && (
          <div style={{
            marginTop: 14, padding: "10px 14px", borderRadius: 10, fontSize: 13.5, fontWeight: 600,
            background: msgType === "success" ? "#ECFDF5" : "#FEF2F2",
            color: msgType === "success" ? "#065F46" : "#DC2626",
            border: `1px solid ${msgType === "success" ? "#A7F3D0" : "#FECACA"}`,
          }}>{msg}</div>
        )}
      </Card>

      {/* Version History (collapsible) */}
      {histOpen && (
        <Card>
          <CardHeader title="Version History" />
          {history.length === 0 ? (
            <div style={{ color: "var(--text-sub)", fontSize: 13 }}>No previous versions.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {history.map(h => (
                <div key={h._id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px", background: h.isActive ? "var(--primary-bg)" : "var(--bg-alt)",
                  borderRadius: 10, border: "1px solid var(--border-alt)",
                  flexWrap: "wrap", gap: 8,
                }}>
                  <div>
                    <span style={{ fontWeight: 700, color: "var(--text-main)" }}>v{h.version}</span>
                    {h.isActive && (
                      <span style={{
                        marginLeft: 8, fontSize: 11, fontWeight: 700,
                        background: "var(--success-bg)", color: "var(--success)",
                        borderRadius: 20, padding: "2px 10px",
                      }}>ACTIVE</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-sub)" }}>
                    {new Date(h.effectiveFrom || h.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric", month: "short", day: "numeric"
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Main content editor / viewer */}
      <Card>
        <CardHeader title={editing ? "✏️ Edit Content" : "📌 Current Terms"} />

        {/* Info banner */}
        <div style={{
          background: "#FFFBEB", border: "1px solid rgba(212,160,23,.25)",
          borderRadius: 10, padding: "10px 14px", marginBottom: 16,
          fontSize: 12.5, color: "#92400E", lineHeight: 1.7,
        }}>
          💡 These Terms & Conditions are shown to your users during registration and scheme enrolment.
          Editing creates a new version — existing members will be asked to re-agree on their next login.
        </div>

        {editing ? (
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={28}
            style={{
              width: "100%", padding: "14px 16px", fontFamily: "'DM Sans', monospace",
              fontSize: 13.5, lineHeight: 1.75, border: "1.5px solid var(--border-alt)",
              borderRadius: 12, background: "var(--bg-input)", color: "var(--text-main)",
              outline: "none", resize: "vertical", minHeight: 400,
            }}
          />
        ) : (
          <pre style={{
            whiteSpace: "pre-wrap", fontFamily: "'DM Sans', sans-serif",
            fontSize: 13.5, color: "var(--text-sub)", lineHeight: 1.75,
            margin: 0, padding: 0,
            maxHeight: 500, overflowY: "auto",
          }}>
            {terms?.content || "No terms content found."}
          </pre>
        )}
      </Card>

      {verificationAction === "Terms and Conditions" && (
        <SecurityVerificationModal
          actionName="Terms and Conditions"
          onClose={() => setVerificationAction(null)}
          onVerified={executeSaveTerms}
        />
      )}
    </div>
  );
}

// ── Admin Profile Settings ──
function ProfileAdminPage({ adminInfo = {}, onAdminUpdate }) {
  const safeAdminInfo = adminInfo || {};
  const [form, setForm] = useState({
    name: safeAdminInfo.name || "",
    email: safeAdminInfo.email || "",
    phone: safeAdminInfo.phone || "",
    shopName: safeAdminInfo.shopName || "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(safeAdminInfo.adminPhoto || null);
  const [verifyingProfile, setVerifyingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    setForm({
      name: adminInfo.name || "",
      email: adminInfo.email || "",
      phone: adminInfo.phone || "",
      shopName: adminInfo.shopName || "",
    });
    if (!photoFile && !photoPreview?.startsWith?.("data:")) {
      setPhotoPreview(adminInfo.adminPhoto || null);
    }
  }, [adminInfo]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (evt) => setPhotoPreview(evt.target?.result);
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = () => {
    setProfileMessage({ type: "", text: "" });
    setVerifyingProfile(true);
  };

  const handleProfileVerified = async (verificationToken) => {
    setVerifyingProfile(false);
    setSavingProfile(true);
    setProfileMessage({ type: "", text: "" });

    const capturedDataUrl = photoFile ? photoPreview : null;

    try {
      let response;

      if (photoFile) {
        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("email", form.email);
        formData.append("phone", form.phone);
        formData.append("shopName", form.shopName);
        formData.append("adminPhoto", photoFile);

        response = await fetch(`${ADMIN_API}/api/auth/admin/shop-settings`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("adminToken")}`,
            "x-verification-token": verificationToken,
          },
          body: formData,
        });
      } else {
        response = await fetch(`${ADMIN_API}/api/auth/admin/shop-settings`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("adminToken")}`,
            "Content-Type": "application/json",
            "x-verification-token": verificationToken,
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            shopName: form.shopName,
          }),
        });
      }

      const data = await response.json();
      if (data.success) {
        const savedAdminInfo = {
          ...adminInfo,
          name: data.data.ownerName || form.name,
          email: data.data.email || form.email,
          phone: data.data.phone || form.phone,
          shopName: data.data.shopName || form.shopName,
          adminPhoto: data.data.adminPhoto || photoPreview || adminInfo.adminPhoto,
        };

        let refreshedAdminInfo = savedAdminInfo;
        try {
          const refreshResponse = await fetch(`${ADMIN_API}/api/auth/admin/shop-settings`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("adminToken")}`,
            },
          });
          const refreshData = await refreshResponse.json();
          if (refreshResponse.ok && refreshData.success) {
            refreshedAdminInfo = {
              ...savedAdminInfo,
              name: refreshData.data.ownerName || savedAdminInfo.name,
              email: refreshData.data.email || savedAdminInfo.email,
              phone: refreshData.data.phone || savedAdminInfo.phone,
              shopName: refreshData.data.shopName || savedAdminInfo.shopName,
              adminPhoto: refreshData.data.adminPhoto || savedAdminInfo.adminPhoto,
            };
          }
        } catch (refreshErr) {
          // keep savedAdminInfo if refresh fails
        }

        sessionStorage.setItem("adminInfo", JSON.stringify(refreshedAdminInfo));
        const adminInfoForDisplay = capturedDataUrl
          ? { ...refreshedAdminInfo, adminPhoto: capturedDataUrl }
          : refreshedAdminInfo;
        if (onAdminUpdate) onAdminUpdate(adminInfoForDisplay);
        setForm(prev => ({
          ...prev,
          name: refreshedAdminInfo.name,
          email: refreshedAdminInfo.email,
          phone: refreshedAdminInfo.phone,
          shopName: refreshedAdminInfo.shopName,
        }));
        setPhotoFile(null);
        setPhotoPreview(capturedDataUrl || refreshedAdminInfo.adminPhoto);
        setProfileMessage({ type: "success", text: "Profile updated successfully." });
      } else {
        setProfileMessage({ type: "error", text: data.message || "Unable to update profile." });
      }
    } catch (err) {
      setProfileMessage({ type: "error", text: "Network error while saving profile." });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px 0" }}>
      <Card>
        <CardHeader title="Admin Profile Details" />
        <div style={{ padding: "0 24px 24px" }}>
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Avatar / Photo */}
            <div style={{
              width: 120, height: 120, borderRadius: 20, flexShrink: 0,
              background: photoPreview ? "transparent" : "linear-gradient(135deg,#D4A017,#F5C842)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 48, color: "#0B1F3E",
              boxShadow: "0 10px 25px rgba(212,160,23,0.3)",
              overflow: "hidden",
              position: "relative"
            }}>
              {photoPreview ? (
                <img src={getFileUrl(photoPreview)} alt="Admin" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                adminInfo.name ? adminInfo.name.charAt(0).toUpperCase() : "S"
              )}
            </div>

            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
                <Input label="Owner Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                <Input label="Email Address" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                <Input label="Shop Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                <Input label="Shop Code" value={adminInfo.shopCode || ""} disabled style={{ opacity: 0.8 }} />
                <Input label="Shop Name" value={form.shopName} onChange={e => setForm(p => ({ ...p, shopName: e.target.value }))} />
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-sub)", marginBottom: 6, textTransform: "uppercase" }}>Profile Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{
                      width: "100%", padding: "11px 14px", fontSize: "14px",
                      borderRadius: 10, border: "1.5px solid var(--border-alt)",
                      background: "var(--bg-input)", color: "var(--text-main)"
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 32, display: "flex", alignItems: "center",
            justifyContent: "space-between", flexWrap: "wrap", gap: 16
          }}>
            <div style={{ color: "var(--text-sub)", fontSize: 13, lineHeight: 1.6, maxWidth: 520 }}>
              Shop code is permanent and cannot be changed. Update the owner name, email, phone, and shop name directly.
            </div>
            <button
              onClick={saveProfile}
              disabled={savingProfile}
              style={{
                padding: "12px 24px", background: "var(--primary)", color: "#fff",
                border: "none", borderRadius: 8, cursor: savingProfile ? "default" : "pointer", fontWeight: 700,
                fontSize: 13, boxShadow: "0 4px 12px rgba(26,127,212,0.3)"
              }}
            >
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </div>
          {profileMessage.text && (
            <div style={{
              marginTop: 16,
              padding: "14px 16px",
              borderRadius: 12,
              background: profileMessage.type === "success" ? "rgba(22,163,74,0.12)" : "rgba(254,226,226,0.9)",
              color: profileMessage.type === "success" ? "#166534" : "#991B1B",
              border: profileMessage.type === "success" ? "1px solid rgba(22,163,74,0.2)" : "1px solid rgba(248,113,113,0.25)"
            }}>
              {profileMessage.text}
            </div>
          )}
        </div>
      </Card>
      {verifyingProfile && (
        <SecurityVerificationModal
          actionName="Profile Details"
          onClose={() => setVerifyingProfile(false)}
          onVerified={handleProfileVerified}
        />
      )}
    </div>
  );
}

function NewChitPage({ goldRate, onSuccess }) {
  const [form, setForm] = useState({
    userId: "", phone: "", monthlyAmount: "",
    planType: "Type1", startDate: "",
    endDate: ""
  });
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [foundUser, setFoundUser] = useState(null);
  const [fetchingUser, setFetchingUser] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const fetchTimer = useRef(null);

  const fetchUserByQuery = async (field, value) => {
    if (value.length < 4) {
      setFoundUser(null);
      setFetchError("");
      return;
    }
    setFetchingUser(true);
    setFetchError("");
    try {
      const res = await fetch(`${ADMIN_API}/api/users/find-for-chit?query=${value}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("adminToken")}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setFoundUser(data.data);
        setFetchError("");
        // ONLY populate the other field if the user isn't currently typing in it or it's empty
        setForm(prev => ({
          ...prev,
          [field === "userId" ? "phone" : "userId"]: data.data[field === "userId" ? "phone" : "userId"]
        }));
      } else {
        setFoundUser(null);
        setFetchError(data.message || "No user registered with this ID/Phone");
      }
    } catch {
      setFoundUser(null);
      setFetchError("Error verifying user");
    }
    finally { setFetchingUser(false); }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
      // If user starts editing one, clear the other to avoid stale association
      [field === "userId" ? "phone" : "userId"]: ""
    }));
    setFoundUser(null); // Clear verification immediately
    setFetchError(""); // Clear error immediately
    if (fetchTimer.current) clearTimeout(fetchTimer.current);
    fetchTimer.current = setTimeout(() => {
      fetchUserByQuery(field, value);
    }, 600);
  };


  useEffect(() => {
    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      if (end > start) {
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        const finalDuration = end.getDate() >= start.getDate() ? months : months - 1;
        setDuration(Math.max(1, finalDuration + 1));
      } else {
        setDuration(0);
      }
    } else {
      setDuration(0);
    }
  }, [form.startDate, form.endDate]);

  const handleSubmit = async () => {
    if (!form.monthlyAmount || (!form.userId && !form.phone)) {
      return setMsg({ type: "error", text: "Please enter monthly amount and either User ID or Phone." });
    }
    if (!foundUser) {
      return setMsg({ type: "error", text: "User not verified. Please check User ID or Phone Number." });
    }
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      const res = await fetch(`${ADMIN_API}/api/schemes/direct-create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("adminToken")}`
        },
        body: JSON.stringify({ ...form, duration })
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ type: "success", text: data.message });
        setForm({ ...form, userId: "", phone: "", monthlyAmount: "", endDate: "" });
        setFoundUser(null);
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }
      } else {
        setMsg({ type: "error", text: data.message });
      }
    } catch (err) {
      setMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <Card>
        <CardHeader title="Create New Chit Enrollment" />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 13, color: "var(--text-sub)", background: "var(--bg-alt)", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border-alt)" }}>
            Directly enroll a user into a scheme. This will automatically generate the monthly payment schedule.
          </div>

          <div className="form-grid-2">
            <Input label="User ID (e.g. USR001)" placeholder="Enter User ID" noMargin
              value={form.userId} onChange={e => handleInputChange("userId", e.target.value)} />
            <Input label="Phone Number" placeholder="Enter Phone Number" noMargin autoComplete="off"
              value={form.phone} onChange={e => handleInputChange("phone", e.target.value)} />
          </div>

          {fetchingUser && <div style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>⌛ Verifying user...</div>}

          {fetchError && !fetchingUser && (
            <div style={{ padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 10, color: "#B91C1C", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
              <span>⚠️</span> {fetchError}
            </div>
          )}

          {foundUser && (
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: "#F0F9FF", borderRadius: 12, border: "1.5px solid #BAE6FD" }}>
              <Avatar name={foundUser.name} img={foundUser.userPhoto} size={50} fontSize={20} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#0369A1", textTransform: "uppercase", marginBottom: 2 }}>User Verified</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#0C4A6E" }}>{foundUser.name}</div>
                <div style={{ fontSize: 12, color: "#0EA5E9", fontWeight: 600 }}>ID: {foundUser.userId} · Shop: {foundUser.shopCode}</div>
              </div>
              <div style={{ background: foundUser.status === "active" ? "#DCFCE7" : "#FEE2E2", color: foundUser.status === "active" ? "#15803D" : "#B91C1C", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800 }}>
                {foundUser.status.toUpperCase()}
              </div>
            </div>
          )}

          <div className="form-grid-2">
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-sub)", marginBottom: 6, textTransform: "uppercase" }}>Scheme Type</label>
              <select value={form.planType} onChange={e => setForm({ ...form, planType: e.target.value })}
                style={{ width: "100%", padding: "11px 14px", fontSize: "14px", borderRadius: 10, border: "1.5px solid var(--border-alt)", background: "var(--bg-input)", color: "var(--text-main)", outline: "none", minHeight: 44 }}>
                <option value="Type1">Scheme 1 (Monthly Gold Accumulation)</option>
                <option value="Type2">Scheme 2 (Final Amount Conversion)</option>
              </select>
            </div>
            <Input label="Monthly Amount (₹)" type="number" placeholder="Enter amount" noMargin
              value={form.monthlyAmount} onChange={e => setForm({ ...form, monthlyAmount: e.target.value })} />
          </div>

          <div className="form-grid-2">
            <DateInput label="Start Date" min={new Date().toISOString().split('T')[0]} value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            <DateInput label="End Date (Auto-calculates Duration)" min={form.startDate || new Date().toISOString().split('T')[0]} value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
          </div>

          <div style={{ background: "var(--primary-bg)", padding: "16px 20px", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--primary)" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase" }}>Calculated Duration</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)", marginTop: 2 }}>
                {duration} Months {duration > 0 && <span style={{ fontSize: 13, opacity: 0.8 }}>+ 1 Bonus Month</span>}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase" }}>Total Commitment</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)", marginTop: 2 }}>₹{((form.monthlyAmount || 0) * duration).toLocaleString()}</div>
            </div>
          </div>

          {msg.text && (
            <div style={{ padding: "12px 16px", borderRadius: 10, fontSize: 14, fontWeight: 600, background: msg.type === "success" ? "var(--success-bg)" : "var(--danger-bg)", color: msg.type === "success" ? "var(--success)" : "var(--danger)", border: `1px solid ${msg.type === "success" ? "var(--success)" : "var(--danger)"}` }}>
              {msg.type === "success" ? "✅ " : "⚠️ "}{msg.text}
            </div>
          )}

          <Btn onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "16px", fontSize: 16 }}>
            {loading ? "Creating Chit..." : "Create Chit & Initialize Schedule"}
          </Btn>
        </div>
      </Card>
    </div>
  );
}

function ChitManagementPage({ goldRate }) {
  const [allChits, setAllChits] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [rejectBox, setRejectBox] = useState(null);
  const [acting, setActing] = useState(null);
  const [selectedClosureChit, setSelectedClosureChit] = useState(null);
  const [verifyingClosure, setVerifyingClosure] = useState(null);
  const token = sessionStorage.getItem("adminToken");

  const downloadChitReceipt = (c, goldRate) => {
    const progressPaid = c.currentMonth || 0;
    const progressTotal = (c.totalMonths || 13) - 1;
    const isType2 = c.planType === "Type2";
    const currentGold = isType2 ? (c.totalAmountAccumulated || 0) / goldRate : (c.totalGramsAccumulated || 0);
    const currentValue = isType2 ? (c.totalAmountAccumulated || 0) : (c.totalGramsAccumulated || 0) * goldRate;
    const totalPaid = c.monthlyAmount * progressPaid;
    const bonusValue = c.monthlyAmount;
    const bonusGold = c.monthlyAmount / goldRate;
    const expectedTotalGold = isType2 ? ((c.totalAmountAccumulated || 0) + bonusValue) / goldRate : (c.totalGramsAccumulated || 0) + bonusGold;
    const expectedTotalValue = isType2 ? (c.totalAmountAccumulated || 0) + bonusValue : ((c.totalGramsAccumulated || 0) + bonusGold) * goldRate;

    const receiptText = `--------------------------------------------
          GOLD CHIT MATURITY RECEIPT
--------------------------------------------
Chit ID         : ${c.schemeId}
Plan Type       : ${isType2 ? "Scheme 2 (Amount Conversion)" : "Scheme 1 (Gold Accumulation)"}
Start Date      : ${c.startDate ? new Date(c.startDate).toLocaleDateString("en-IN") : "N/A"}
Settlement Date : ${new Date().toLocaleDateString("en-IN")} ${new Date().toLocaleTimeString("en-IN")}

CUSTOMER DETAILS:
Name            : ${c.user?.name || "N/A"}
User ID         : ${c.user?.userId || "N/A"}
Phone           : ${c.user?.phone || "N/A"}

FINANCIAL BREAKDOWN:
Monthly Amount  : ₹${c.monthlyAmount?.toLocaleString()}
Months Paid     : ${progressPaid} / ${progressTotal}
Total Invested  : ₹${totalPaid.toLocaleString()}
Today's Gold Rate: ₹${goldRate.toLocaleString()}/g

ACCUMULATION DETAILS:
Gold Accumulated: ${currentGold.toFixed(4)}g
Current Value    : ₹${Math.round(currentValue).toLocaleString()}

MATURITY BONUS DETAILS:
Shop Owner Bonus : 1 Month Free Installment
Bonus Value     : ₹${bonusValue.toLocaleString()}
Bonus Gold Eq.  : ${bonusGold.toFixed(4)}g

FINAL SETTLEMENT PAYOUT:
Total Maturity Gold: ${expectedTotalGold.toFixed(4)}g
Estimated Payout   : ₹${Math.round(expectedTotalValue).toLocaleString()}

--------------------------------------------
    Chit enrollment successfully completed!
--------------------------------------------
`;

    const blob = new Blob([receiptText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Chit_Closure_Receipt_${c.schemeId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExecuteChitClosure = async (target, vToken) => {
    if (!target) return;
    try {
      const res = await fetch(`${ADMIN_API}/api/schemes/${target._id}/close`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "x-verification-token": vToken
        }
      }).then(r => r.json());

      if (res.success) {
        // Reload all data so that active chits reload
        loadAllUserChits();
        
        // Dynamically update the currently opened popup status to complete
        setSelectedClosureChit(prev => prev && prev._id === target._id ? { ...prev, status: "complete" } : prev);
        
        alert("Chit closed successfully!");
      } else {
        alert(res.message || "Failed to close chit.");
      }
    } catch (err) {
      console.error(err);
      alert("Error closing chit.");
    }
  };

  const loadAllUserChits = async () => {
    setLoading(true);
    try {
      const [res1, res2] = await Promise.all([
        fetch(`${ADMIN_API}/api/schemes/type/Type1`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch(`${ADMIN_API}/api/schemes/type/Type2`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
      ]);
      let combined = [];
      if (res1.success) combined = [...combined, ...(res1.data || [])];
      if (res2.success) combined = [...combined, ...(res2.data || [])];

      // Sort by createdAt desc
      combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAllChits(combined);
    } catch (err) {
      console.error("Failed to load user chits:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadJoinRequests = async () => {
    try {
      const res = await fetch(`${ADMIN_API}/api/scheme-join`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
      if (res.success) setJoinRequests(res.data || []);
    } catch (e) { console.error(e); }
  };

  const approveRequest = async (id) => {
    setActing(id);
    try {
      const res = await fetch(`${ADMIN_API}/api/scheme-join/${id}/approve`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        loadJoinRequests();
        loadAllUserChits();
      }
      else alert(data.message || "Failed to approve");
    } catch { alert("Network error"); } finally { setActing(null); }
  };

  const reopenRequest = async (id) => {
    setActing(id);
    try {
      const res = await fetch(`${ADMIN_API}/api/scheme-join/${id}/reopen`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        loadJoinRequests();
        loadAllUserChits();
      }
      else alert(data.message || "Failed to re-open");
    } catch { alert("Network error"); } finally { setActing(null); }
  };

  const rejectRequest = async (id, note) => {
    setActing(id);
    try {
      const res = await fetch(`${ADMIN_API}/api/scheme-join/${id}/reject`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      const data = await res.json();
      if (data.success) {
        setRejectBox(null);
        loadJoinRequests();
        loadAllUserChits();
      }
      else alert(data.message);
    } catch { alert("Network error"); } finally { setActing(null); }
  };

  const pendingCount = joinRequests.filter(r => r.status === "payment_verified").length;

  useEffect(() => {
    loadAllUserChits();
    loadJoinRequests();
  }, []);

  if (showCreateForm) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => { setShowCreateForm(false); loadAllUserChits(); }}
            style={{
              background: "none", border: "none", color: "var(--primary)",
              cursor: "pointer", display: "inline-flex", alignItems: "center",
              gap: 8, fontWeight: 700, fontSize: 14, outline: "none", padding: "8px 0"
            }}
          >
            ← Back to Chit List
          </button>
        </div>
        <NewChitPage goldRate={goldRate} onSuccess={() => { setShowCreateForm(false); loadAllUserChits(); }} />
      </div>
    );
  }

  const filteredChits = allChits.filter(c => {
    if (c.status === "complete" || c.status === "early_exit") return false;
    const query = searchQuery.toLowerCase();
    const userName = c.user?.name?.toLowerCase() || "";
    const userPhone = c.user?.phone?.toLowerCase() || "";
    const userId = c.user?.userId?.toLowerCase() || "";
    const chitId = c.schemeId?.toLowerCase() || "";
    return userName.includes(query) || userPhone.includes(query) || userId.includes(query) || chitId.includes(query);
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 0 20px" }}>
      <div className="chit-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "var(--text-main)" }}>Chit Management</h2>
          <p style={{ margin: "4px 0 0", color: "var(--text-sub)", fontSize: 13 }}>View, search and manage all active gold scheme chit enrollments.</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => setShowRequests(!showRequests)}
            style={{
              position: "relative", padding: "12px 24px",
              background: showRequests ? "var(--primary)" : "var(--primary-bg)",
              color: showRequests ? "#fff" : "var(--primary)",
              border: "1.5px solid var(--primary)", borderRadius: 10,
              cursor: "pointer", fontWeight: 700, fontSize: 14,
              transition: "transform 0.2s, box-shadow 0.2s, background 0.2s",
              display: "inline-flex",
              alignItems: "center",
              gap: 8
            }}
          >
            🙋 Enrollment Requests
            {pendingCount > 0 && (
              <span style={{
                position: "absolute", top: -8, right: -8,
                background: "#EF4444", color: "#fff",
                borderRadius: "50%", width: 22, height: 22,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, boxShadow: "0 2px 10px rgba(239,68,68,0.4)"
              }}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, var(--primary), var(--gold))",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 12px rgba(164,123,16,0.2)",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            + New Chit
          </button>
        </div>
      </div>

      <Card>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-alt)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-sub)", fontSize: 16 }}>🔍</span>
            <input
              type="text"
              placeholder="Search by name, phone number, user ID, or chit ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px 12px 42px",
                fontSize: 14,
                borderRadius: 10,
                border: "1.5px solid var(--border-alt)",
                background: "var(--bg-input)",
                color: "var(--text-main)",
                outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--primary)"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--border-alt)"}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-sub)", fontWeight: 600 }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>⌛</div>
            Loading user chits...
          </div>
        ) : filteredChits.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center", color: "var(--text-sub)" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📂</div>
            <h4 style={{ margin: "0 0 8px 0", color: "var(--text-main)", fontSize: 16 }}>No Chits Found</h4>
            <p style={{ margin: 0, fontSize: 13 }}>Try adjusting your search query or add a new chit enrollment.</p>
          </div>
        ) : (
          <div className="table-container">
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 860 }}>
              <thead>
                <tr style={{ background: "var(--bg-alt)", borderBottom: "1.5px solid var(--border-alt)" }}>
                  <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "var(--text-sub)", textTransform: "uppercase", borderBottom: "1px solid var(--border-alt)" }}>Chit ID</th>
                  <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "var(--text-sub)", textTransform: "uppercase", borderBottom: "1px solid var(--border-alt)" }}>Member Details</th>
                  <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "var(--text-sub)", textTransform: "uppercase", borderBottom: "1px solid var(--border-alt)" }}>Scheme</th>
                  <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "var(--text-sub)", textTransform: "uppercase", borderBottom: "1px solid var(--border-alt)" }}>Monthly Amount</th>
                  <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "var(--text-sub)", textTransform: "uppercase", borderBottom: "1px solid var(--border-alt)" }}>Start Date</th>
                  <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "var(--text-sub)", textTransform: "uppercase", borderBottom: "1px solid var(--border-alt)" }}>Progress</th>
                  <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "var(--text-sub)", textTransform: "uppercase", borderBottom: "1px solid var(--border-alt)" }}>Action</th>
                  <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 700, color: "var(--text-sub)", textTransform: "uppercase", borderBottom: "1px solid var(--border-alt)" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredChits.map(c => {
                  const progressPaid = c.currentMonth || 0;
                  const progressTotal = (c.totalMonths || 13) - 1;
                  const isCompleted = c.status === "complete";
                  const isEarlyExit = c.status === "early_exit";

                  let statusBg = "rgba(16,185,129,0.12)";
                  let statusColor = "#10B981";
                  let statusText = "Active";
                  if (isCompleted) {
                    statusBg = "rgba(245,200,66,0.15)";
                    statusColor = "#D4A017";
                    statusText = "Completed";
                  } else if (isEarlyExit) {
                    statusBg = "rgba(239,68,68,0.12)";
                    statusColor = "#EF4444";
                    statusText = "Early Exit";
                  }

                  return (
                    <tr key={c._id} style={{ borderBottom: "1px solid var(--border-alt)", transition: "background 0.2s" }}>
                      <td style={{ padding: "16px 20px", fontWeight: 700, color: "var(--primary)", fontFamily: "monospace", fontSize: 14, borderBottom: "1px solid var(--border-alt)" }}>
                        {c.schemeId}
                      </td>
                      <td style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-alt)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <Avatar name={c.user?.name} img={c.user?.userPhoto} size={36} fontSize={14} />
                          <div>
                            <div style={{ fontWeight: 700, color: "var(--text-main)", fontSize: 14 }}>{c.user?.name || "N/A"}</div>
                            <div style={{ fontSize: 12, color: "var(--text-sub)", marginTop: 2 }}>
                              ID: {c.user?.userId || "N/A"} · {c.user?.phone || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px", color: "var(--text-main)", fontSize: 13.5, fontWeight: 500, borderBottom: "1px solid var(--border-alt)" }}>
                        {c.planType === "Type2" ? "Scheme 2 (Final Amount)" : "Scheme 1 (Monthly Gold)"}
                      </td>
                      <td style={{ padding: "16px 20px", fontWeight: 700, color: "var(--text-main)", fontSize: 14, borderBottom: "1px solid var(--border-alt)" }}>
                        ₹{c.monthlyAmount?.toLocaleString()}
                      </td>
                      <td style={{ padding: "16px 20px", color: "var(--text-sub)", fontSize: 13, borderBottom: "1px solid var(--border-alt)" }}>
                        {c.startDate ? new Date(c.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                      </td>
                      <td style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-alt)" }}>
                        <div style={{ width: 120 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "var(--text-sub)", marginBottom: 4 }}>
                            <span>{progressPaid} / {progressTotal} Paid</span>
                            <span>{Math.round((progressPaid / progressTotal) * 100)}%</span>
                          </div>
                          <div style={{ width: "100%", height: 6, background: "var(--bg-alt)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${(progressPaid / progressTotal) * 100}%`, height: "100%", background: isCompleted ? "#D4A017" : "var(--primary)", borderRadius: 3 }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-alt)" }}>
                        <button
                          onClick={() => setSelectedClosureChit(c)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "8px 14px",
                            background: "var(--primary-bg)",
                            color: "var(--primary)",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 700,
                            transition: "all 0.2s",
                            boxShadow: "0 2px 4px rgba(26,127,212,0.1)"
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = "var(--primary)";
                            e.currentTarget.style.color = "#fff";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = "var(--primary-bg)";
                            e.currentTarget.style.color = "var(--primary)";
                          }}
                        >
                          <span>🔍 Closure Info</span>
                        </button>
                      </td>
                      <td style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-alt)" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "6px 12px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 800,
                          background: statusBg,
                          color: statusColor,
                          textTransform: "uppercase",
                          letterSpacing: 0.5
                        }}>
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* CHIT CLOSURE / MATURITY PREVIEW POPUP */}
      {selectedClosureChit && (() => {
        const c = selectedClosureChit;
        const progressPaid = c.currentMonth || 0;
        const progressTotal = (c.totalMonths || 13) - 1;
        const isCompleted = c.status === "complete";
        
        // Scheme accumulations
        const isType2 = c.planType === "Type2";
        const currentGold = isType2 ? (c.totalAmountAccumulated || 0) / goldRate : (c.totalGramsAccumulated || 0);
        const currentValue = isType2 ? (c.totalAmountAccumulated || 0) : (c.totalGramsAccumulated || 0) * goldRate;
        const totalPaid = c.monthlyAmount * progressPaid;
        
        // Shop Owner maturity bonus (1 installment worth)
        const bonusValue = c.monthlyAmount;
        const bonusGold = c.monthlyAmount / goldRate;
        
        // Final estimated payouts
        const expectedTotalGold = isType2 
          ? ((c.totalAmountAccumulated || 0) + bonusValue) / goldRate
          : (c.totalGramsAccumulated || 0) + bonusGold;
        
        const expectedTotalValue = isType2
          ? (c.totalAmountAccumulated || 0) + bonusValue
          : ((c.totalGramsAccumulated || 0) + bonusGold) * goldRate;

        const isEligible = progressPaid >= progressTotal;

        return (
          <div style={{
            position: "fixed", inset: 0,
            background: "rgba(11,31,62,0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 2100,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px 16px"
          }}>
            <div style={{
              background: "var(--bg-card)",
              borderRadius: 22,
              width: "100%", maxWidth: 520,
              boxShadow: "0 32px 72px rgba(0,0,0,0.45)",
              overflow: "hidden",
              border: "1px solid var(--border-main)",
              fontFamily: "'DM Sans', sans-serif"
            }}>
              {/* Header */}
              <div style={{
                background: "linear-gradient(135deg, #B38600 0%, #D4A017 100%)",
                padding: "20px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "#fff"
              }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Sora', sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                    💰 Maturity &amp; Closure Details
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.9, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
                    Chit ID: {c.schemeId}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedClosureChit(null)} 
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "none",
                    color: "#fff",
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    cursor: "pointer",
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                >✕</button>
              </div>

              {/* Body */}
              <div style={{ padding: "24px", maxHeight: "calc(90vh - 140px)", overflowY: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
                
                {/* Member Profile Card */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--bg-alt)", padding: 14, borderRadius: 14, border: "1px solid var(--border-alt)" }}>
                  <Avatar name={c.user?.name} img={c.user?.userPhoto} size={46} fontSize={16} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-main)" }}>{c.user?.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-sub)", marginTop: 2 }}>ID: {c.user?.userId} · {c.user?.phone}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 11, background: "var(--primary-bg)", color: "var(--primary)", padding: "4px 8px", borderRadius: 6, fontWeight: 800 }}>
                      {isType2 ? "Scheme 2" : "Scheme 1"}
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Details */}
                <div style={{ background: "var(--bg-input)", padding: 16, borderRadius: 14, border: "1px solid var(--border-alt)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>Installments Paid</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "var(--primary)" }}>{progressPaid} / {progressTotal} ({Math.round((progressPaid / progressTotal) * 100)}%)</span>
                  </div>
                  <div style={{ width: "100%", height: 8, background: "var(--border-main)", borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
                    <div style={{ width: `${(progressPaid / progressTotal) * 100}%`, height: "100%", background: isCompleted ? "#D4A017" : "var(--primary)", borderRadius: 4 }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
                    <div>
                      <span style={{ color: "var(--text-light)" }}>Monthly Installment: </span>
                      <strong style={{ color: "var(--text-main)" }}>₹{c.monthlyAmount?.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-light)" }}>Start Date: </span>
                      <strong style={{ color: "var(--text-main)" }}>{c.startDate ? new Date(c.startDate).toLocaleDateString("en-IN") : "N/A"}</strong>
                    </div>
                  </div>
                </div>

                {/* Financial Summary Title */}
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Estimated Financial Breakdown</div>
                  
                  {/* Stats Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ background: "var(--bg-alt)", padding: 12, borderRadius: 12, border: "1px solid var(--border-alt)" }}>
                      <div style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 600 }}>Amount Invested</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-main)", marginTop: 4 }}>₹{totalPaid.toLocaleString()}</div>
                    </div>
                    <div style={{ background: "var(--bg-alt)", padding: 12, borderRadius: 12, border: "1px solid var(--border-alt)" }}>
                      <div style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 600 }}>Current Value (Today)</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-main)", marginTop: 4 }}>₹{Math.round(currentValue).toLocaleString()}</div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                    <div style={{ background: "var(--bg-alt)", padding: 12, borderRadius: 12, border: "1px solid var(--border-alt)" }}>
                      <div style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 600 }}>Gold Accumulated</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#D4A017", marginTop: 4 }}>{currentGold.toFixed(4)}g</div>
                    </div>
                    <div style={{ background: "var(--bg-alt)", padding: 12, borderRadius: 12, border: "1px solid var(--border-alt)" }}>
                      <div style={{ fontSize: 11, color: "var(--text-light)", fontWeight: 600 }}>Live Gold Rate Today</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#D4A017", marginTop: 4 }}>₹{goldRate.toLocaleString()}/g</div>
                    </div>
                  </div>
                </div>

                {/* Shop Owner Bonus Info */}
                <div style={{ background: "rgba(212,160,23,0.08)", border: "1px dashed #D4A017", padding: 14, borderRadius: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#D4A017", textTransform: "uppercase", letterSpacing: 0.5 }}>🎁 Shop Owner Bonus ({c.totalMonths || 13}th Month)</span>
                    <span style={{ fontSize: 11, background: "#D4A017", color: "#fff", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>Free Installment</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text-sub)", lineHeight: 1.4 }}>
                    On mature completion (all {progressTotal} installments paid), the shop owner contributes a bonus of <strong style={{ color: "var(--text-main)" }}>1 extra month's installment</strong> (valued at <strong style={{ color: "var(--text-main)" }}>₹{bonusValue.toLocaleString()}</strong> or equivalent to <strong style={{ color: "var(--text-main)" }}>{bonusGold.toFixed(4)}g</strong> gold calculated at today's rate).
                  </p>
                </div>

                {/* Expected Payout Section */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(212,160,23,0.15) 0%, rgba(179,134,0,0.15) 100%)",
                  border: "1.5px solid #D4A017",
                  padding: "16px 20px",
                  borderRadius: 16,
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 12, color: "var(--text-light)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Estimated Final Settlement Payout</div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 30, marginTop: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-sub)", fontWeight: 600 }}>Total Maturity Gold</div>
                      <div style={{ fontSize: 22, fontWeight: 850, color: "#D4A017", marginTop: 4 }}>{expectedTotalGold.toFixed(4)}g</div>
                    </div>
                    <div style={{ borderLeft: "1px solid var(--border-alt)" }} />
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-sub)", fontWeight: 600 }}>Estimated Settlement Value</div>
                      <div style={{ fontSize: 22, fontWeight: 850, color: "var(--primary)", marginTop: 4 }}>₹{Math.round(expectedTotalValue).toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Maturity Banner Status */}
                <div>
                  {isCompleted ? (
                    <div style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.25)", padding: 12, borderRadius: 10, fontSize: 12.5, display: "flex", gap: 8, alignItems: "center" }}>
                      <span>✅</span>
                      <span><strong>Chit Fully Settled &amp; Closed!</strong> This scheme enrollment is successfully completed and payout has been finalized.</span>
                    </div>
                  ) : isEligible ? (
                    <div style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.25)", padding: 12, borderRadius: 10, fontSize: 12.5, display: "flex", gap: 8, alignItems: "center" }}>
                      <span>🎉</span>
                      <span><strong>Eligible for Maturity Payout!</strong> {progressTotal}/{progressTotal} installments have been paid. You can safely close this chit and reward the owner bonus!</span>
                    </div>
                  ) : (
                    <div style={{ background: "rgba(59,130,246,0.08)", color: "var(--primary)", border: "1px solid rgba(59,130,246,0.2)", padding: 12, borderRadius: 10, fontSize: 12.5, display: "flex", gap: 8, alignItems: "center" }}>
                      <span>⏳</span>
                      <span><strong>Installments Incomplete.</strong> User has paid {progressPaid} of {progressTotal} installments. To unlock the full {c.totalMonths || 13}th-month maturity bonus, the user must pay the remaining {progressTotal - progressPaid} installments.</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Footer */}
              <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border-main)", display: "flex", justifyContent: "flex-end", gap: 12, background: "var(--bg-alt)" }}>
                {!isCompleted ? (
                  <>
                    <button 
                      onClick={() => setSelectedClosureChit(null)} 
                      style={{
                        padding: "10px 20px", 
                        background: "none", 
                        color: "var(--text-sub)", 
                        border: "1.5px solid var(--border-main)", 
                        borderRadius: 10, 
                        cursor: "pointer", 
                        fontWeight: 700, 
                        fontSize: 13
                      }}
                    >Cancel</button>
                    <button 
                      onClick={() => {
                        downloadChitReceipt(c, goldRate);
                        setVerifyingClosure(c);
                      }} 
                      style={{
                        padding: "10px 24px", 
                        background: "linear-gradient(135deg, #B38600 0%, #D4A017 100%)", 
                        color: "#fff", 
                        border: "none", 
                        borderRadius: 10, 
                        cursor: "pointer", 
                        fontWeight: 700, 
                        fontSize: 13,
                        boxShadow: "0 4px 12px rgba(212,160,23,0.3)"
                      }}
                    >Close &amp; Settle Chit</button>
                  </>
                ) : (
                  <button 
                    onClick={() => setSelectedClosureChit(null)} 
                    style={{
                      padding: "10px 24px", 
                      background: "var(--primary)", 
                      color: "#fff", 
                      border: "none", 
                      borderRadius: 10, 
                      cursor: "pointer", 
                      fontWeight: 700, 
                      fontSize: 13,
                      boxShadow: "0 4px 12px rgba(26,127,212,0.25)"
                    }}
                  >Close Preview</button>
                )}
              </div>

            </div>
          </div>
        );
      })()}

      {verifyingClosure && (
        <SecurityVerificationModal
          actionName={`Close & Settle Chit ${verifyingClosure.schemeId}`}
          onClose={() => setVerifyingClosure(null)}
          onVerified={async (vToken) => {
            const target = verifyingClosure;
            setVerifyingClosure(null);
            await handleExecuteChitClosure(target, vToken);
          }}
        />
      )}

      {/* Enrollment Requests POPUP MODAL */}
      {showRequests && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(11,31,62,0.65)",
          backdropFilter: "blur(4px)",
          zIndex: 2000,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px 16px"
        }}>
          <div style={{
            background: "var(--bg-card)",
            borderRadius: 20,
            width: "100%", maxWidth: 700,
            maxHeight: "90vh",
            display: "flex", flexDirection: "column",
            boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
            overflow: "hidden"
          }}>
            {/* Header */}
            <div style={{
              padding: "20px 28px",
              borderBottom: "1px solid var(--border-main)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "var(--primary)"
            }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", fontFamily: "'Sora',sans-serif" }}>
                  🙋 Enrollment Requests
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 3 }}>
                  {pendingCount > 0 ? `${pendingCount} pending approval` : "All requests reviewed"}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {pendingCount > 0 && (
                  <div style={{
                    background: "#EF4444", color: "#fff", borderRadius: "50%",
                    width: 28, height: 28, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 13, fontWeight: 800
                  }}>{pendingCount}</div>
                )}
                <button
                  onClick={() => setShowRequests(false)}
                  style={{
                    background: "rgba(255,255,255,0.18)", border: "none",
                    color: "#fff", width: 36, height: 36, borderRadius: "50%",
                    cursor: "pointer", fontSize: 18, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}
                >✕</button>
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
              {joinRequests.filter(r => r.status === "payment_verified").length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-light)" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-main)" }}>All caught up!</div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>No pending enrollment requests at this time.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {joinRequests.filter(r => r.status === "payment_verified").map(r => (
                    <div key={r._id} className="enrollment-request-row" style={{
                      background: "var(--bg-page)", padding: "16px 20px", borderRadius: 14,
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      border: "1px solid var(--border-alt)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: "50%",
                          background: "linear-gradient(135deg, var(--primary), var(--gold))",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0
                        }}>
                          {(r.user?.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-main)" }}>
                            {r.user?.name}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-sub)", marginTop: 2 }}>
                            📞 {r.user?.phone}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 2 }}>
                            {r.planType === "Type1" ? "Scheme 1 – Gold Accumulation" : "Scheme 2 – Final Conversion"} · ₹{r.monthlyAmount?.toLocaleString()}/mo
                          </div>
                        </div>
                      </div>
                      <div className="enrollment-request-actions" style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, alignItems: "flex-end" }}>
                        {/* Show Proof if available */}
                        {(r.screenshotUrl || r.utrNumber) && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginRight: 8, alignItems: "flex-end" }}>
                            {r.utrNumber && <span style={{ fontSize: 11, color: "#475569", background: "#F1F5F9", padding: "2px 6px", borderRadius: 4 }}>UTR: <b>{r.utrNumber}</b></span>}
                            {r.screenshotUrl && (
                              <a href={getFileUrl(r.screenshotUrl)} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#1A7FD4", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                                🖼️ View Screenshot
                              </a>
                            )}
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {r.status === "payment_verified" ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                              <span style={{ fontSize: 11, fontWeight: 800, color: "#059669", background: "rgba(5,150,105,0.1)", padding: "4px 10px", borderRadius: 8 }}>Payment Verified ✓</span>
                              <button
                                onClick={() => approveRequest(r._id)}
                                disabled={acting === r._id}
                                style={{
                                  background: "#059669", color: "#fff", border: "none",
                                  borderRadius: 8, padding: "8px 16px", cursor: "pointer",
                                  fontWeight: 700, fontSize: 13, boxShadow: "0 4px 12px rgba(5,150,105,0.3)"
                                }}
                              >✓ Final Approve</button>
                            </div>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                              <span style={{ fontSize: 10, fontWeight: 700, color: "#D4A017", background: "rgba(212,160,23,0.1)", padding: "4px 10px", borderRadius: 8, textAlign: "right" }}>
                                Approve Payment in <br /> Payments Tab First
                              </span>
                              <button
                                disabled
                                style={{
                                  background: "#94A3B8", color: "#fff", border: "none",
                                  borderRadius: 8, padding: "8px 16px", cursor: "not-allowed",
                                  fontWeight: 700, fontSize: 13, opacity: 0.6
                                }}
                              >✓ Approve</button>
                            </div>
                          )}
                          <button
                            onClick={() => setRejectBox({ id: r._id, note: "" })}
                            disabled={acting === r._id}
                            style={{
                              background: "#FEF2F2", color: "#EF4444",
                              border: "1.5px solid #EF4444", borderRadius: 8,
                              padding: "8px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13
                            }}
                          >✕ Reject</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* All requests history (non-pending) */}
              {(() => {
                const reviewed = joinRequests
                  .filter(r => ["approved", "rejected"].includes(r.status))
                  .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
                  .slice(0, 3);
                if (reviewed.length === 0) return null;
                return (
                  <div style={{ marginTop: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-light)", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 }}>
                      Previously Reviewed
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {reviewed.map(r => (
                        <div key={r._id} style={{
                          background: "var(--bg-page)", padding: "12px 16px", borderRadius: 12,
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          border: "1px solid var(--border-alt)", opacity: 0.9
                        }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-main)" }}>{r.user?.name}</div>
                            <div style={{ fontSize: 12, color: "var(--text-light)" }}>₹{r.monthlyAmount?.toLocaleString()}/mo</div>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            {r.status === "rejected" && (
                              <button
                                onClick={() => reopenRequest(r._id)}
                                disabled={acting === r._id}
                                style={{ padding: "6px 12px", fontSize: 11, background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}
                              >
                                {acting === r._id ? "..." : "Re-Review"}
                              </button>
                            )}
                            <div style={{
                              fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8,
                              background: r.status === "approved" ? "rgba(5,150,105,0.1)" : "rgba(239,68,68,0.1)",
                              color: r.status === "approved" ? "#059669" : "#EF4444"
                            }}>
                              {r.status === "approved" ? "✓ Approved" : "✕ Rejected"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div style={{
              padding: "14px 24px",
              borderTop: "1px solid var(--border-main)",
              display: "flex", justifyContent: "flex-end",
              background: "var(--bg-alt)"
            }}>
              <button
                onClick={() => setShowRequests(false)}
                style={{
                  padding: "10px 24px", background: "var(--bg-input)",
                  border: "1.5px solid var(--border-alt)", color: "var(--text-sub)",
                  borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13
                }}
              >Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Request confirmation box modal */}
      {rejectBox && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(11,31,62,0.55)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(11,31,62,0.3)" }}>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: "#0B1F3E", marginBottom: 6 }}>Reject Request</div>
            <textarea value={rejectBox.note} onChange={e => setRejectBox(b => ({ ...b, note: e.target.value }))}
              placeholder="Reason for rejection…" rows={3}
              style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: "1.5px solid #E2E8F0", borderRadius: 10, background: "#FAFAFA", outline: "none", fontFamily: "inherit", resize: "vertical" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button onClick={() => setRejectBox(null)}
                style={{ flex: 1, padding: "10px 0", background: "#F1F5F9", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Cancel</button>
              <button onClick={() => rejectRequest(rejectBox.id, rejectBox.note)} disabled={acting === rejectBox.id}
                style={{ flex: 1, padding: "10px 0", background: "#EF4444", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ── Sidebar ──

function Sidebar({ active, setActive, onLogout, adminInfo, dark, toggleDark, goldRate, rateInput, setRateInput, editRate, setEditRate, setGoldRate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: "⊞" },
    { id: "users", label: "User Management", icon: "👥" },
    { id: "schemes", label: "Schemes", icon: "◈" },
    { id: "chit-mgmt", label: "Chit Management", icon: "💼" },
    { id: "payments", label: "Payments", icon: "₹" },
    { id: "goldrate", label: "Gold Rate", icon: "◆" },
    { id: "reminders", label: "Reminders", icon: "🔔" },
    { id: "reports", label: "Reports", icon: "📊" },
    { id: "terms", label: "Terms & Conditions", icon: "📜" },
    { id: "profile", label: "My Profile", icon: "👤" },
  ];

  const handleNav = (id) => { setActive(id); setMenuOpen(false); };

  return (
    <aside className="dash-sidebar">

      {/* Brand row */}
      <div className="sidebar-brand">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: adminInfo?.adminPhoto ? "transparent" : "linear-gradient(135deg,#D4A017,#F5C842)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 17, color: "#0B1F3E",
            overflow: "hidden",
          }}>
            {adminInfo?.adminPhoto ? (
              <img src={getFileUrl(adminInfo.adminPhoto)} alt={adminInfo?.shopName?.charAt(0) || "S"} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; e.target.parentElement.style.background = "linear-gradient(135deg,#D4A017,#F5C842)"; }} />
            ) : "S"}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
              {adminInfo?.shopName || "AgriZip Microfinance"}
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: 1.5, marginTop: 4 }}>
              {adminInfo?.shopCode || "PREMIUM DASHBOARD"}
            </div>
          </div>
        </div>

        {/* Mobile right: theme + 3-dot menu */}
        <div className="sidebar-hamburger">
          {/* Theme toggle */}
          <button onClick={toggleDark}
            title={dark ? "Light mode" : "Dark mode"}
            style={{
              background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8,
              width: 34, height: 34, cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
            {dark ? "☀️" : "🌙"}
          </button>
          {/* 3-dot menu */}
          <button onClick={() => setMenuOpen(o => !o)}
            style={{
              background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8,
              width: 34, height: 34, cursor: "pointer", color: "#fff", fontSize: 20,
              display: "flex", alignItems: "center", justifyContent: "center",
              letterSpacing: 0, lineHeight: 1
            }}>⋮</button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)} />
          <div className="mobile-menu-dropdown">
            {/* Nav items */}
            {NAV.map(n => (
              <button key={n.id} className={`mobile-menu-item${active === n.id ? " active" : ""}`}
                onClick={() => handleNav(n.id)}>
                <span style={{ fontSize: 16, width: 22 }}>{n.icon}</span>
                {n.label}
              </button>
            ))}

            <div className="mobile-menu-divider" />

            {/* Gold Rate inline editor */}
            <div className="mobile-gold-section">
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: 0.5, marginBottom: 8 }}>
                ◆ TODAY'S GOLD RATE
              </div>
              {editRate ? (
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input type="number" value={rateInput}
                    onChange={e => setRateInput(+e.target.value)}
                    style={{
                      flex: 1, padding: "6px 10px", fontSize: 13, background: "rgba(255,255,255,0.1)",
                      border: "1.5px solid #1A7FD4", borderRadius: 8, outline: "none",
                      color: "#fff", fontFamily: "'DM Sans',sans-serif", minHeight: 36
                    }} />
                  <button onClick={() => { setGoldRate(rateInput); setEditRate(false); }}
                    style={{
                      padding: "6px 12px", background: "#1A7FD4", color: "#fff",
                      border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600
                    }}>Save</button>
                  <button onClick={() => setEditRate(false)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "rgba(255,255,255,0.5)" }}>✕</button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "#F5C842" }}>₹{goldRate.toLocaleString()}/g</span>
                  <button onClick={() => setEditRate(true)}
                    style={{
                      fontSize: 12, fontWeight: 600, color: "#1A7FD4",
                      background: "rgba(26,127,212,0.2)", border: "none", borderRadius: 6,
                      cursor: "pointer", padding: "4px 10px"
                    }}>Edit</button>
                </div>
              )}
            </div>

            <div className="mobile-menu-divider" />

            {/* Theme + Logout */}
            <button className="mobile-menu-item" onClick={toggleDark}>
              <span style={{ fontSize: 16, width: 22 }}>{dark ? "☀️" : "🌙"}</span>
              {dark ? "Light Mode" : "Dark Mode"}
            </button>
            <button className="mobile-menu-item" onClick={onLogout} style={{ color: "#EF4444" }}>
              <span style={{ fontSize: 16, width: 22 }}>⎗</span>
              Logout
            </button>
          </div>
        </>
      )}

      {/* Gold rate pill — desktop only */}
      <div className="sidebar-gold-pill">
        <span style={{ fontSize: 16, color: "#F5C842" }}>◆</span>
        <div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: 0.5 }}>Today's Gold Rate</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#F5C842", marginTop: 2 }}>₹{goldRate.toLocaleString()}/g</div>
        </div>
      </div>

      {/* Desktop Nav */}
      <nav className="sidebar-nav">
        {NAV.map(n => (
          <button key={n.id} className="nav-btn"
            onClick={() => setActive(n.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: active === n.id ? "rgba(26,127,212,0.25)" : "none",
              border: "none", cursor: "pointer",
              color: active === n.id ? "#fff" : "rgba(255,255,255,0.6)",
              fontSize: 13.5, fontWeight: 500,
              position: "relative", transition: "all 0.2s",
              fontFamily: "'DM Sans',sans-serif"
            }}>
            <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{n.icon}</span>
            {n.label}
            {active === n.id && (
              <div style={{
                position: "absolute", right: 0, top: "20%", bottom: "20%",
                width: 3, background: "#1A7FD4", borderRadius: "3px 0 0 3px"
              }} />
            )}
          </button>
        ))}
      </nav>

      {/* Footer — desktop only */}
      <div className="sidebar-footer">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: adminInfo?.adminPhoto ? "transparent" : "linear-gradient(135deg,#1A7FD4,#0F5FA8)",
            overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#fff"
          }}>
            {adminInfo?.adminPhoto ? (
              <img src={getFileUrl(adminInfo.adminPhoto)} alt={adminInfo.name || "Owner"} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; e.target.parentElement.innerHTML = (adminInfo?.name || "V").charAt(0).toUpperCase(); e.target.parentElement.style.background = "linear-gradient(135deg,#1A7FD4,#0F5FA8)"; }} />
            ) : (
              (adminInfo?.name || "V").charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", lineHeight: 1 }}>
              {adminInfo?.name || "Virat"}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Owner</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={toggleDark} title={dark ? "Light mode" : "Dark mode"}
            style={{
              background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 8,
              width: 32, height: 32, cursor: "pointer", fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
            {dark ? "☀️" : "🌙"}
          </button>
          <button onClick={onLogout}
            style={{
              background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 8,
              width: 32, height: 32, cursor: "pointer", color: "rgba(255,255,255,0.5)",
              fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center"
            }}>⏻</button>
        </div>
      </div>
    </aside>
  );
}

// ── Main Dashboard ──
export default function AdminDashboard({ onLogout }) {
  const [active, setActive] = useState("dashboard");
  const [goldRate, setGoldRate] = useState(TODAY_GOLD_RATE);
  const [editRate, setEditRate] = useState(false);
  const [rateInput, setRateInput] = useState(TODAY_GOLD_RATE);
  const [dark, setDark] = useState(() => localStorage.getItem("adminTheme") === "dark");
  const [stats, setStats] = useState(null);
  const [recentSchemes, setRecentSchemes] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [adminInfo, setAdminInfo] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("adminInfo") || "{}"); }
    catch { return {}; }
  });

  useEffect(() => {
    const adminToken = sessionStorage.getItem("adminToken");
    if (!adminToken) return;

    // Load full admin profile so phone and shop details are always current
    fetch(`${ADMIN_API}/api/auth/admin/shop-settings`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          const updatedAdminInfo = {
            name: d.data.name || d.data.ownerName || "",
            email: d.data.email || "",
            phone: d.data.phone || "",
            shopName: d.data.shopName || "",
            shopCode: d.data.shopCode || "",
            adminPhoto: d.data.adminPhoto || null,
          };
          setAdminInfo(updatedAdminInfo);
          sessionStorage.setItem("adminInfo", JSON.stringify(updatedAdminInfo));
        }
      })
      .catch(() => {});

    // Fetch Gold Rate
    fetch(`${ADMIN_API}/api/goldrate/today`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setGoldRate(d.data.ratePerGram);
          setRateInput(d.data.ratePerGram);
        }
      })
      .catch(console.error);

    // Fetch Dashboard Stats
    setLoadingStats(true);
    Promise.all([
      fetch(`${ADMIN_API}/api/reports/dashboard`, { headers: { Authorization: `Bearer ${adminToken}` } }).then(r => r.json()),
      fetch(`${ADMIN_API}/api/reports/gold-summary`, { headers: { Authorization: `Bearer ${adminToken}` } }).then(r => r.json())
    ])
      .then(([statsRes, schemesRes]) => {
        if (statsRes.success) setStats(statsRes.data);
        if (schemesRes.success) setRecentSchemes(schemesRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoadingStats(false));
  }, []);

  const handleUpdateGoldRate = async (newRate) => {
    setGoldRate(newRate);
    setEditRate(false);
    try {
      const r = await fetch(`${ADMIN_API}/api/goldrate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("adminToken")}`
        },
        body: JSON.stringify({ ratePerGram: newRate })
      });
      const data = await r.json();

      if (r.status === 401 || (data && data.message === "Token invalid")) {
        alert("Your session has expired or is invalid. Please log in again.");
        onLogout();
        return;
      }

      if (!r.ok || !data.success) {
        alert("Failed to save gold rate: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      alert("Failed to update gold rate: " + err.message);
      console.error("Failed to update gold rate", err);
    }
  };

  const toggleDark = () => setDark(d => {
    const next = !d;
    localStorage.setItem("adminTheme", next ? "dark" : "light");
    return next;
  });

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });

  const PAGE_TITLES = {
    dashboard: "Dashboard", users: "User Management",
    schemes: "Schemes", payments: "Payments",
    goldrate: "Gold Rate", reminders: "Reminders",
    reports: "Reports", terms: "Terms & Conditions",
    "chit-mgmt": "Chit Management", profile: "My Profile",
  };

  const renderPage = () => {
    switch (active) {
      case "dashboard": return <DashboardPage goldRate={goldRate} stats={stats} recentSchemes={recentSchemes} loading={loadingStats} />;
      case "users": return <UserManagementPage goldRate={goldRate} />;
      case "schemes": return <SchemesPage goldRate={goldRate} />;
      case "chit-mgmt": return <ChitManagementPage goldRate={goldRate} />;
      case "payments": return <PaymentsPage goldRate={goldRate} />;
      case "goldrate": return <GoldRatePage goldRate={goldRate} setGoldRate={handleUpdateGoldRate} />;
      case "reminders": return <RemindersPage />;
      case "reports": return <ReportsPage />;
      case "terms": return <TermsAdminPage />;
      case "profile": return <ProfileAdminPage adminInfo={adminInfo} onAdminUpdate={setAdminInfo} />;
      default: return <DashboardPage goldRate={goldRate} />;
    }
  };

  return (
    <div className={`dash-page${dark ? " dark" : ""}`}>
      <style>{CSS}</style>

      <Sidebar
        active={active} setActive={setActive}
        onLogout={onLogout} adminInfo={adminInfo}
        dark={dark} toggleDark={toggleDark}
        goldRate={goldRate} rateInput={rateInput}
        setRateInput={setRateInput} editRate={editRate}
        setEditRate={setEditRate} setGoldRate={handleUpdateGoldRate}
      />

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <header className="dash-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{ minWidth: 0 }}>
              <div className="header-title" style={{
                fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 700,
                color: dark ? "#e2e8f0" : "#0B1F3E",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
              }}>{PAGE_TITLES[active]}</div>
              <div className="header-date" style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>{today}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div className="header-gold-widget" style={{
              alignItems: "center", gap: 8, background: dark ? "rgba(212,160,23,0.15)" : "#FFFBEB",
              border: "1px solid rgba(212,160,23,0.3)", borderRadius: 10, padding: "6px 12px"
            }}>
              <span style={{ fontSize: 12, color: "#D4A017", fontWeight: 600, whiteSpace: "nowrap" }}>◆ Gold:</span>
              {editRate ? (
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  <input type="number" value={rateInput}
                    onChange={e => setRateInput(+e.target.value)}
                    style={{
                      width: 80, padding: "3px 7px", fontSize: 13,
                      border: "1.5px solid #1A7FD4", borderRadius: 7, outline: "none",
                      fontFamily: "inherit", minHeight: 32,
                      background: dark ? "#0f1c2e" : "#fff",
                      color: dark ? "#e2e8f0" : "#0B1F3E"
                    }} />
                  <button onClick={() => { handleUpdateGoldRate(rateInput); }}
                    style={{
                      padding: "3px 9px", background: "#1A7FD4", color: "#fff",
                      border: "none", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600
                    }}>Save</button>
                  <button onClick={() => setEditRate(false)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#94A3B8" }}>✕</button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: dark ? "#F5C842" : "#0B1F3E", whiteSpace: "nowrap" }}>₹{goldRate.toLocaleString()}/g</span>
                  <button onClick={() => setEditRate(true)}
                    style={{
                      fontSize: 11, fontWeight: 600, color: "#1A7FD4",
                      background: "none", border: "none", cursor: "pointer", padding: "2px 5px"
                    }}>Edit</button>
                </div>
              )}
            </div>
            <button style={{ position: "relative", background: "none", border: "none", cursor: "pointer", fontSize: 20, padding: "4px" }}>
              🔔
              <span style={{
                position: "absolute", top: 0, right: 0, background: "#EF4444",
                color: "#fff", borderRadius: "50%", fontSize: 9, fontWeight: 700,
                width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center"
              }}>5</span>
            </button>
          </div>
        </header>

        <div className="dash-content" style={{ flex: 1, overflowY: "auto" }}>
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
