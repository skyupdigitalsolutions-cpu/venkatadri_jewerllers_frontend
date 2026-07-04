import React, { useState } from "react";

const ADMIN_API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const SECURITY_MODAL_CSS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export default function SecurityVerificationModal({ onClose, onVerified, actionName }) {
  const [method, setMethod] = useState(null); // 'otp', 'passkey', or 'preset'
  const [otp, setOtp] = useState("");
  const [passkeyText, setPasskeyText] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const token = sessionStorage.getItem("adminToken");

  const triggerPasskey = async () => {
    setMethod("passkey");
    setLoading(true);
    setError("");
    try {
      // Simulate Passkey/Biometric WebAuthn native prompt.
      // In a real WebAuthn flow, we would fetch challenge from server, 
      // then call navigator.credentials.get(), then send response back.
      if (!window.PublicKeyCredential) {
        throw new Error("Biometrics/Passkeys are not supported on this device/browser.");
      }

      // We do a dummy creation to trigger the native biometric prompt for demo purposes
      const dummyChallenge = new Uint8Array(32);
      window.crypto.getRandomValues(dummyChallenge);

      try {
        const available = await window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable?.();
        if (!available) {
          throw new Error("Biometric authentication is not available on this device.");
        }

        await navigator.credentials.create({
          publicKey: {
            challenge: dummyChallenge,
            rp: { name: "SkyUp Admin", id: window.location.hostname },
            user: {
              id: new Uint8Array(16),
              name: "admin",
              displayName: "Admin",
            },
            pubKeyCredParams: [{ type: "public-key", alg: -7 }],
            timeout: 60000,
            authenticatorSelection: { userVerification: "required" }
          }
        });
      } catch (e) {
        throw new Error("Biometric verification failed or was canceled.");
      }

      // If native prompt succeeds, verify with backend
      const res = await fetch(`${ADMIN_API}/api/auth/admin/verification/verify-passkey`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ passkeyPayload: { verified: true } }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setSuccess(true);
      setTimeout(() => {
        onVerified(data.verificationToken);
      }, 1000);
    } catch (err) {
      setError(err.message);
      setMethod(null);
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async () => {
    setMethod("otp");
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${ADMIN_API}/api/auth/admin/verification/send-otp`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setOtpSent(true);
    } catch (err) {
      setError(err.message);
      setMethod(null);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setError("Please enter the 6-digit code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${ADMIN_API}/api/auth/admin/verification/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setSuccess(true);
      setTimeout(() => {
        onVerified(data.verificationToken);
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyPasskeyText = async () => {
    if (!passkeyText) {
      setError("Please enter the preset passkey");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${ADMIN_API}/api/auth/admin/verification/verify-passkey`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ passkeyPayload: { text: passkeyText } }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setSuccess(true);
      setTimeout(() => {
        onVerified(data.verificationToken);
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999, display: "flex",
      alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(4px)"
    }}>
      <style>{SECURITY_MODAL_CSS}</style>
      <div style={{
        background: "var(--bg-card, #fff)", width: "95%", maxWidth: 420,
        borderRadius: 20, padding: 24, boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
        position: "relative", animation: "fadeUp 0.3s ease-out both"
      }}>

        {success && (
          <div style={{
            position: "absolute", inset: 0, background: "var(--bg-card, #fff)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            borderRadius: 20, zIndex: 10, animation: "tm-fadeIn 0.2s ease"
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 700, color: "var(--text-main)", fontSize: 18 }}>Verified Successfully</div>
            <div style={{ color: "var(--text-sub)", fontSize: 14, marginTop: 4 }}>Proceeding to save changes…</div>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, color: "var(--text-main, #1A1408)" }}>Security Verification</h2>
          <button onClick={onClose} style={{
            background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-sub, #5B5240)"
          }}>×</button>
        </div>

        <p style={{ fontSize: 14, color: "var(--text-sub, #5B5240)", marginBottom: 24, lineHeight: 1.5 }}>
          You are about to modify <strong>{actionName}</strong>.
          Please verify your identity to proceed.
        </p>

        {error && (
          <div style={{ background: "#FEF2F2", color: "#B91C1C", padding: 12, borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {!method && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={() => setMethod("preset")}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                padding: 14, borderRadius: 12, border: "1px solid var(--border-main, #E2E8F0)",
                background: "var(--bg-page, #F8FAFC)", cursor: "pointer", fontWeight: 600,
                fontSize: 14, color: "var(--text-main, #0F172A)", transition: "all 0.2s"
              }}
            >
              <span style={{ fontSize: 18 }}>🔑</span> Use Preset Passkey
            </button>
            <button
              onClick={triggerPasskey}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                padding: 14, borderRadius: 12, border: "1px solid var(--border-main, #E2E8F0)",
                background: "var(--bg-page, #F8FAFC)", cursor: "pointer", fontWeight: 600,
                fontSize: 14, color: "var(--text-main, #0F172A)", transition: "all 0.2s"
              }}
            >
              <span style={{ fontSize: 18 }}>🖐️</span> Biometric / Passkey
            </button>
            <button
              onClick={requestOtp}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                padding: 14, borderRadius: 12, border: "1px solid var(--border-main, #E2E8F0)",
                background: "var(--bg-page, #F8FAFC)", cursor: "pointer", fontWeight: 600,
                fontSize: 14, color: "var(--text-main, #0F172A)", transition: "all 0.2s"
              }}
            >
              <span style={{ fontSize: 18 }}>📱</span> Send OTP to Mobile
            </button>
          </div>
        )}

        {method === "otp" && (
          <div>
            {otpSent && (
              <div style={{ background: "#F0FDF4", color: "#166534", padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                ✅ OTP sent to your registered mobile number.
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text-sub)" }}>
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="000000"
                style={{
                  width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-alt)",
                  fontSize: 20, letterSpacing: 4, textAlign: "center", background: "var(--bg-input)"
                }}
                autoFocus
              />
            </div>
            <button
              onClick={verifyOtp}
              disabled={loading || otp.length < 6}
              style={{
                width: "100%", padding: 14, borderRadius: 10, border: "none",
                background: "var(--primary, #1A7FD4)", color: "#fff", fontWeight: 600,
                cursor: loading || otp.length < 6 ? "not-allowed" : "pointer",
                opacity: loading || otp.length < 6 ? 0.6 : 1
              }}
            >
              {loading ? "Verifying..." : "Verify & Save"}
            </button>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button onClick={() => { setMethod(null); setOtp(""); setError(""); }} style={{
                background: "none", border: "none", color: "var(--primary)", fontSize: 13, cursor: "pointer"
              }}>
                Choose another method
              </button>
            </div>
          </div>
        )}

        {method === "preset" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--text-sub)" }}>
                Enter Preset Passkey
              </label>
              <input
                type="password"
                value={passkeyText}
                onChange={e => setPasskeyText(e.target.value)}
                placeholder="••••••"
                style={{
                  width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid var(--border-alt)",
                  fontSize: 18, textAlign: "center", background: "var(--bg-input)"
                }}
                autoFocus
              />
            </div>
            <button
              onClick={verifyPasskeyText}
              disabled={loading || !passkeyText}
              style={{
                width: "100%", padding: 14, borderRadius: 10, border: "none",
                background: "var(--primary, #1A7FD4)", color: "#fff", fontWeight: 600,
                cursor: loading || !passkeyText ? "not-allowed" : "pointer",
                opacity: loading || !passkeyText ? 0.6 : 1
              }}
            >
              {loading ? "Verifying..." : "Verify & Save"}
            </button>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button onClick={() => { setMethod(null); setPasskeyText(""); setError(""); }} style={{
                background: "none", border: "none", color: "var(--primary)", fontSize: 13, cursor: "pointer"
              }}>
                Choose another method
              </button>
            </div>
          </div>
        )}

        {method === "passkey" && loading && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🖐️</div>
            <div style={{ fontSize: 14, color: "var(--text-main)", fontWeight: 500 }}>Waiting for Biometric Authentication...</div>
            <div style={{ fontSize: 12, color: "var(--text-sub)", marginTop: 8 }}>Please follow the system prompt.</div>
          </div>
        )}
      </div>
    </div>
  );
}