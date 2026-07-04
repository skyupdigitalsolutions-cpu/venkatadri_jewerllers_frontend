// ─── TermsModal.jsx ────────────────────────────────────────────────────
// Reusable T&C modal. Three modes:
//
//   <TermsModal open={...} onClose={...} mode="view" shopCode="SKY-1234" />
//     → just displays terms, single "Close" button.
//
//   <TermsModal open={...} onClose={...} mode="agree" shopCode="SKY-1234"
//               onAgree={(version) => ...} />
//     → shows terms with required scroll-to-bottom + "I Agree" checkbox,
//       then enables the "I Agree & Continue" button. Calls onAgree(version)
//       when confirmed.
//
//   <TermsModal open={...} onClose={...} mode="admin-agree"
//               onAgree={() => ...} />
//     → fetches platform-level terms (no shopCode needed), same agree flow.
// ──────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

// Inline styles for the modal
const MODAL_CSS = `
  @keyframes tm-fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes tm-slideUp { from { opacity:0; transform:translateY(24px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }

  .tm-overlay {
    position: fixed; inset: 0;
    background: rgba(10, 15, 30, 0.72);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 2000; padding: 16px;
    animation: tm-fadeIn 0.2s ease both;
  }
  .tm-modal {
    background: #fff; border-radius: 20px;
    width: 100%; max-width: 740px; max-height: 92vh;
    display: flex; flex-direction: column;
    box-shadow: 0 32px 80px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.06);
    animation: tm-slideUp 0.28s cubic-bezier(0.22,1,0.36,1) both;
    overflow: hidden;
  }
  .tm-header {
    padding: 22px 28px 18px;
    border-bottom: 1px solid #f1f5f9;
    display: flex; align-items: flex-start; justify-content: space-between;
    background: linear-gradient(135deg, #0B1F3E 0%, #1A3A6E 100%);
    flex-shrink: 0;
  }
  .tm-header-badge {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(212,160,23,0.18); border: 1px solid rgba(212,160,23,0.35);
    border-radius: 20px; padding: 4px 12px;
    font-size: 10px; font-weight: 700; color: #F5C842;
    letter-spacing: 1px; margin-bottom: 10px;
  }
  .tm-title {
    font-family: 'Sora', 'DM Sans', sans-serif;
    font-size: 20px; font-weight: 800; color: #fff;
    letter-spacing: -0.4px; margin-bottom: 4px;
  }
  .tm-subtitle { font-size: 13px; color: rgba(255,255,255,0.55); }
  .tm-close-btn {
    background: rgba(255,255,255,0.1); border: none;
    width: 34px; height: 34px; border-radius: 10px; cursor: pointer;
    color: rgba(255,255,255,0.7); font-size: 18px; line-height: 1;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s, color 0.2s; flex-shrink: 0; margin-top: 2px;
  }
  .tm-close-btn:hover { background: rgba(255,255,255,0.2); color: #fff; }

  .tm-scroll-hint {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 28px; background: #FFFBEB;
    border-bottom: 1px solid rgba(212,160,23,0.2);
    font-size: 12.5px; color: #92400E; flex-shrink: 0;
  }
  .tm-scroll-hint.done {
    background: #ECFDF5; color: #065F46;
    border-bottom-color: rgba(34,197,94,0.2);
  }

  .tm-body {
    flex: 1; overflow-y: auto; padding: 24px 28px;
    background: #FAFAFA; min-height: 200px;
  }
  .tm-body::-webkit-scrollbar { width: 5px; }
  .tm-body::-webkit-scrollbar-track { background: transparent; }
  .tm-body::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 99px; }

  .tm-content-text {
    white-space: pre-wrap; font-family: 'DM Sans', sans-serif;
    font-size: 13.5px; color: #334155; margin: 0; line-height: 1.75;
  }
  .tm-content-text h1, .tm-content-text h2, .tm-content-text h3 {
    margin: 0 0 8px; color: #0B1F3E;
  }

  .tm-agree-row {
    display: flex; align-items: center; gap: 12px;
    padding: 16px 28px; border-top: 1px solid #f1f5f9;
    font-size: 14px; cursor: pointer; flex-shrink: 0;
    background: #fff;
    transition: background 0.2s;
  }
  .tm-agree-row:hover { background: #F8FAFC; }
  .tm-agree-row input[type="checkbox"] {
    width: 18px; height: 18px; flex-shrink: 0; cursor: pointer;
    accent-color: #1A7FD4;
  }

  .tm-footer {
    padding: 14px 28px; border-top: 1px solid #f1f5f9;
    display: flex; justify-content: flex-end; gap: 10px;
    background: #fff; flex-shrink: 0;
  }
  .tm-btn-cancel {
    padding: 10px 22px; border-radius: 10px;
    border: 1.5px solid #E2E8F0; background: #fff;
    color: #334155; cursor: pointer; font-weight: 600;
    font-family: inherit; font-size: 14px;
    transition: border-color 0.2s, background 0.2s;
  }
  .tm-btn-cancel:hover { border-color: #CBD5E1; background: #F8FAFC; }
  .tm-btn-agree {
    padding: 10px 22px; border-radius: 10px; border: none;
    background: linear-gradient(135deg, #1A7FD4 0%, #0F5FA8 100%);
    color: #fff; font-weight: 700; font-family: inherit; font-size: 14px;
    cursor: pointer; box-shadow: 0 4px 14px rgba(26,127,212,0.3);
    transition: all 0.2s; letter-spacing: 0.2px;
  }
  .tm-btn-agree:not(:disabled):hover { box-shadow: 0 6px 20px rgba(26,127,212,0.42); transform: translateY(-1px); }
  .tm-btn-agree:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; transform: none; }

  .tm-loading {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 60px 24px; gap: 14px; color: #94A3B8; font-size: 14px;
  }
  .tm-spinner {
    width: 36px; height: 36px; border-radius: 50%;
    border: 3px solid #E2E8F0; border-top-color: #1A7FD4;
    animation: tm-spin 0.8s linear infinite;
  }
  @keyframes tm-spin { to { transform: rotate(360deg); } }

  .tm-error {
    padding: 40px 24px; text-align: center; color: #DC2626; font-size: 14px;
  }
`;

export default function TermsModal({
    open,
    onClose,
    mode = "view",       // "view" | "agree" | "admin-agree" | "platform-agree"
    shopCode,            // required for "view"/"agree" modes
    onAgree,             // callback(version) — called when user clicks Agree
}) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [terms, setTerms] = useState(null);
    const [agreed, setAgreed] = useState(false);
    const [scrolledEnd, setScrolledEnd] = useState(false);
    const bodyRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        setError("");
        setAgreed(false);
        setScrolledEnd(false);

        // platform-agree and admin-agree both fetch the fixed SkyUp platform terms
        const url = (mode === "admin-agree" || mode === "platform-agree")
            ? `${API}/api/terms/platform`
            : `${API}/api/terms/shop/${shopCode}`;

        if (mode === "admin-agree" || mode === "platform-agree" || shopCode) {
            fetch(url)
                .then((r) => r.json())
                .then((j) => {
                    if (j.success) setTerms(j.data);
                    else setError(j.message || "Could not load terms");
                })
                .catch(() => setError("Network error — could not load terms"))
                .finally(() => setLoading(false));
        } else {
            setError("No shop code provided");
            setLoading(false);
        }
    }, [open, shopCode, mode]);
    
    // Auto-enable agree if content is too short to scroll
    useEffect(() => {
        if (!loading && !error && terms && bodyRef.current) {
            const el = bodyRef.current;
            if (el.scrollHeight <= el.clientHeight) {
                setScrolledEnd(true);
            }
        }
    }, [loading, error, terms]);

    // Detect when user scrolls to bottom
    const handleScroll = () => {
        const el = bodyRef.current;
        if (!el) return;
        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
        if (nearBottom) setScrolledEnd(true);
    };

    if (!open) return null;

    const isPlatformMode = mode === "platform-agree" || mode === "admin-agree";
    const isAgreeMode = mode === "agree" || isPlatformMode;
    const canAgree = isAgreeMode && agreed && scrolledEnd && !loading && !error;

    return (
        <>
            {/* Inject styles once */}
            <style>{MODAL_CSS}</style>

            <div className="tm-overlay" onClick={onClose}>
                <div className="tm-modal" onClick={(e) => e.stopPropagation()}>

                    {/* Header */}
                    <div className="tm-header">
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="tm-header-badge">
                                {isPlatformMode ? "🏢 SKYUP PLATFORM TERMS" : "📜 SCHEME TERMS"}
                            </div>
                            <div className="tm-title">
                                {terms?.title || "Terms and Conditions"}
                            </div>
                            {isPlatformMode ? (
                                <div className="tm-subtitle">SkyUp Digital Solutions · Platform Agreement · Effective 06 May 2025</div>
                            ) : terms?.shopName ? (
                                <div className="tm-subtitle">
                                    {terms.shopName}
                                    {terms.version ? ` · Version ${terms.version}` : ""}
                                    {terms.effectiveFrom
                                        ? ` · Effective ${new Date(terms.effectiveFrom).toLocaleDateString("en-IN")}`
                                        : ""}
                                </div>
                            ) : null}
                        </div>
                        <button className="tm-close-btn" onClick={onClose} aria-label="Close">✕</button>
                    </div>

                    {/* Scroll hint — only in agree modes */}
                    {isAgreeMode && !loading && !error && (
                        <div className={`tm-scroll-hint${scrolledEnd ? " done" : ""}`}>
                            {scrolledEnd
                                ? "✅ You've read all terms — you can now agree below"
                                : "⬇ Please scroll to the bottom to read all terms before agreeing"}
                        </div>
                    )}

                    {/* Body */}
                    <div ref={bodyRef} onScroll={handleScroll} className="tm-body">
                        {loading && (
                            <div className="tm-loading">
                                <div className="tm-spinner" />
                                Loading terms…
                            </div>
                        )}
                        {!loading && error && (
                            <div className="tm-error">⚠ {error}</div>
                        )}
                        {!loading && !error && terms?.content && (
                            <pre className="tm-content-text">{terms.content}</pre>
                        )}
                    </div>

                    {/* Agree checkbox row — only in agree modes */}
                    {isAgreeMode && !loading && !error && (
                        <label className="tm-agree-row">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                disabled={!scrolledEnd}
                            />
                            <span style={{
                                color: scrolledEnd ? "#0F172A" : "#94A3B8",
                                transition: "color 0.2s",
                                lineHeight: 1.5,
                            }}>
                                {scrolledEnd
                                    ? "I have read, understood and agree to the Terms and Conditions"
                                    : "Scroll to the bottom to enable agreement"}
                            </span>
                        </label>
                    )}

                    {/* Footer */}
                    <div className="tm-footer">
                        {isAgreeMode ? (
                            <>
                                <button onClick={onClose} className="tm-btn-cancel">Cancel</button>
                                <button
                                    disabled={!canAgree}
                                    onClick={() => canAgree && onAgree?.(terms?.version)}
                                    className="tm-btn-agree"
                                >
                                    ✓ I Agree &amp; Continue
                                </button>
                            </>
                        ) : (
                            <button onClick={onClose} className="tm-btn-agree">Close</button>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}
