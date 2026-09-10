"use client";

import { useState, useRef, useEffect } from "react";
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, Sparkles, KeyRound, Phone, RotateCcw } from "lucide-react";
import { loginUser, loginDemoUser, registerUser, sendOtpApi, verifyOtpApi } from "../../services/authService";

export function AuthModal({ isOpen, onClose, onLoginSuccess, initialTab = "login" }) {
  const [activeTab, setActiveTab] = useState(initialTab); // "login" | "register" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
  // Registration OTP step state
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  // 59-second Resend OTP timer
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle countdown timer
  useEffect(() => {
    if (step === "otp") {
      startTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(59);
    setCanResend(false);

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  if (!isOpen) return null;

  function resetState() {
    setErrorMsg("");
    setSuccessMsg("");
    setStep("form");
    setOtpDigits(["", "", "", "", "", ""]);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    resetState();
  }

  async function handleDemoLogin() {
    setLoading(true);
    const user = await loginDemoUser();
    setLoading(false);
    if (onLoginSuccess) {
      onLoginSuccess(user);
    }
    onClose();
  }

  // Handle OTP digit box input
  function handleDigitChange(index, value) {
    const cleanVal = value.replace(/\D/g, ""); // Keep only numbers
    if (!cleanVal && value !== "") return;

    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal.slice(-1); // Take last digit if multiple entered
    setOtpDigits(newDigits);

    // Auto-focus next box if digit entered
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const newDigits = ["", "", "", "", "", ""];
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i];
      }
      setOtpDigits(newDigits);
      const targetIdx = Math.min(pastedData.length, 5);
      inputRefs.current[targetIdx]?.focus();
    }
  }

  async function handleResendOtp() {
    if (!canResend) return;
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const res = await sendOtpApi({ email, phone });
    setLoading(false);

    if (res.success) {
      setOtpDigits(["", "", "", "", "", ""]);
      setSuccessMsg("A new 6-digit OTP code has been sent! Previous OTP is now invalid.");
      startTimer();
      inputRefs.current[0]?.focus();
    } else {
      setErrorMsg(res.error || "Failed to resend OTP. Please try again.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    if (activeTab === "forgot") {
      setSuccessMsg("Password reset instructions sent to your email!");
      setLoading(false);
      setTimeout(() => {
        handleTabChange("login");
      }, 2000);
      return;
    }

    if (activeTab === "login") {
      const res = await loginUser({ email, password });
      setLoading(false);
      if (res.success && res.user) {
        if (onLoginSuccess) onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.error || "Account does not exist or invalid credentials.");
      }
      return;
    }

    if (activeTab === "register") {
      if (step === "form") {
        const res = await registerUser({ name, email, phone, password });
        setLoading(false);
        if (res.success) {
          setSuccessMsg(`OTP sent to ${email || "your email"}!`);
          setStep("otp");
        } else {
          setErrorMsg(res.error || "Registration failed. Account may already exist.");
        }
      } else if (step === "otp") {
        const fullOtp = otpDigits.join("");
        if (fullOtp.length < 6) {
          setLoading(false);
          setErrorMsg("Please enter all 6 digits of the OTP code.");
          return;
        }

        const res = await verifyOtpApi({ email, phone, otp: fullOtp });
        setLoading(false);
        if (res.success && res.user) {
          setSuccessMsg("Account created and verified successfully!");
          if (onLoginSuccess) onLoginSuccess(res.user);
          setTimeout(() => {
            onClose();
          }, 1000);
        } else {
          setErrorMsg(res.error || "Invalid OTP entered. Please check and try again.");
        }
      }
    }
  }

  return (
    <div className="auth-modal-wrapper position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" style={{ zIndex: 1080 }}>
      {/* Backdrop */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
        style={{ backdropFilter: "blur(4px)", transition: "opacity 0.3s ease" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className="bg-white rounded-4 shadow-lg overflow-hidden w-100 position-relative"
        style={{ maxWidth: "480px", zIndex: 1090, animation: "authModalPop 0.25s ease-out forwards" }}
      >
        {/* Modal Header */}
        <div className="p-4 border-bottom bg-light d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-primary text-white p-2 rounded-3">
              <Lock size={20} />
            </div>
            <div>
              <h5 className="fw-bold text-primary mb-0">
                {activeTab === "login" && "Welcome Back"}
                {activeTab === "register" && (step === "otp" ? "Verify OTP Code" : "Create Account")}
                {activeTab === "forgot" && "Reset Password"}
              </h5>
              <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                Access your refurbished orders & warranties
              </small>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-light btn-sm rounded-circle p-2 border-0"
            onClick={onClose}
            aria-label="Close modal"
            suppressHydrationWarning
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="d-flex border-bottom bg-white">
          <button
            type="button"
            className={`btn flex-fill py-2.5 fw-bold rounded-0 border-0 ${
              activeTab === "login" ? "text-primary border-bottom border-primary border-2 bg-light" : "text-muted"
            }`}
            style={{ fontSize: "0.88rem" }}
            onClick={() => handleTabChange("login")}
            suppressHydrationWarning
          >
            Log In
          </button>
          <button
            type="button"
            className={`btn flex-fill py-2.5 fw-bold rounded-0 border-0 ${
              activeTab === "register" ? "text-primary border-bottom border-primary border-2 bg-light" : "text-muted"
            }`}
            style={{ fontSize: "0.88rem" }}
            onClick={() => handleTabChange("register")}
            suppressHydrationWarning
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4">
          {/* Quick Demo Login Option */}
          {activeTab === "login" && (
            <div className="bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-3 p-3 mb-4 text-center">
              <div className="small fw-bold text-primary mb-1 d-flex align-items-center justify-content-center gap-1">
                <Sparkles size={14} /> Quick Demo Instant Login
              </div>
              <p className="small text-muted mb-2" style={{ fontSize: "0.78rem" }}>
                One-click access with pre-loaded demo orders & inspection certificates.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm w-100 rounded-pill fw-bold py-1.5 shadow-sm"
                onClick={handleDemoLogin}
                disabled={loading}
                suppressHydrationWarning
              >
                Log In as Demo Customer
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="alert alert-danger small py-2 px-3 mb-3 d-flex flex-column align-items-start gap-1">
              <div className="fw-semibold text-danger">{errorMsg}</div>
              {activeTab === "login" && errorMsg.toLowerCase().includes("not found") && (
                <button
                  type="button"
                  className="btn btn-link p-0 small text-primary fw-bold text-decoration-none"
                  onClick={() => handleTabChange("register")}
                  suppressHydrationWarning
                >
                  Don't have an account? Click here to Create Account →
                </button>
              )}
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success small py-2 text-center mb-3">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {activeTab === "register" && step === "form" && (
              <>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Your Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">Phone Number (Optional)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">
                      <Phone size={16} />
                    </span>
                    <input
                      type="tel"
                      className="form-control border-start-0"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {step === "form" && (
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {activeTab !== "forgot" && step === "form" && (
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-semibold text-dark mb-0">Password</label>
                  {activeTab === "login" && (
                    <button
                      type="button"
                      className="btn btn-link p-0 small text-primary text-decoration-none"
                      style={{ fontSize: "0.78rem" }}
                      onClick={() => handleTabChange("forgot")}
                      suppressHydrationWarning
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <KeyRound size={16} />
                  </span>
                  <input
                    type="password"
                    className="form-control border-start-0"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* 6-Box OTP Entry Step */}
            {activeTab === "register" && step === "otp" && (
              <div className="mb-3 text-center">
                <div className="bg-light p-3 rounded-3 mb-3 border">
                  <div className="fw-bold text-dark mb-1">Enter 6-Digit Verification Code</div>
                  <div className="text-muted small" style={{ fontSize: "0.82rem" }}>
                    We sent a verification code to <strong>{email}</strong>
                  </div>
                </div>

                {/* 6 Square Digit Input Boxes */}
                <div className="d-flex justify-content-center gap-2 mb-3" onPaste={handlePaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="form-control text-center font-monospace fw-bold fs-4 border-2 rounded-3 shadow-xs"
                      style={{
                        width: "48px",
                        height: "54px",
                        borderColor: digit ? "#2563eb" : "#cbd5e1",
                        backgroundColor: digit ? "#f0f6ff" : "#ffffff",
                        transition: "all 0.15s ease-in-out",
                      }}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                {/* 59-second Resend OTP Timer Controls */}
                <div className="d-flex align-items-center justify-content-between pt-2 px-1">
                  <button
                    type="button"
                    className={`btn btn-link p-0 small fw-semibold text-decoration-none d-inline-flex align-items-center gap-1 ${
                      canResend ? "text-primary" : "text-muted opacity-60"
                    }`}
                    style={{ fontSize: "0.82rem" }}
                    onClick={handleResendOtp}
                    disabled={!canResend || loading}
                    suppressHydrationWarning
                  >
                    <RotateCcw size={14} />
                    {canResend ? "Resend OTP Code" : `Resend OTP in 00:${timer < 10 ? `0${timer}` : timer}`}
                  </button>

                  <button
                    type="button"
                    className="btn btn-link p-0 small text-secondary text-decoration-none"
                    style={{ fontSize: "0.82rem" }}
                    onClick={() => setStep("form")}
                    suppressHydrationWarning
                  >
                    Change Email
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100 py-2.5 rounded-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 mt-4"
              disabled={loading}
              suppressHydrationWarning
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              ) : (
                <>
                  <span>
                    {activeTab === "login" && "Log In to Account"}
                    {activeTab === "register" && (step === "otp" ? "Verify OTP & Complete Signup" : "Register & Get OTP")}
                    {activeTab === "forgot" && "Send Reset Link"}
                  </span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Trust assurances footer */}
          <div className="pt-3 mt-3 border-top text-center text-muted small" style={{ fontSize: "0.75rem" }}>
            <span className="d-inline-flex align-items-center gap-1 text-success fw-medium">
              <ShieldCheck size={14} /> 256-Bit Encrypted Secure Connection
            </span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes authModalPop {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
