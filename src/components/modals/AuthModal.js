"use client";

import { useState, useRef, useEffect } from "react";
import { X, Lock, Mail, User, ArrowRight, Phone, RotateCcw, CheckCircle2 } from "lucide-react";
import { sendOtpApi, verifyOtpApi, completeSignupApi } from "../../services/authService";
import { useToast } from "../common/Toast";

export function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const toast = useToast();

  // Modal Step: "identifier" | "otp" | "profile"
  const [step, setStep] = useState("identifier");

  // Tab for identifier: "phone" | "email"
  const [authMethod, setAuthMethod] = useState("phone");
  const [countryCode] = useState("+44");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  // OTP State
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  // Resend OTP Countdown Timer
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);

  // Profile Form State (Single Full Name + counterpart contact)
  const [name, setName] = useState("");
  const [extraEmail, setExtraEmail] = useState("");
  const [extraPhone, setExtraPhone] = useState("");

  const [loading, setLoading] = useState(false);

  // UK formatted phone helper
  const getFullPhone = () => {
    if (!phoneNumber) return "";
    const clean = phoneNumber.trim().replace(/\s+/g, "");
    if (clean.startsWith("+")) return clean;
    if (clean.startsWith("0")) return `${countryCode} ${clean.slice(1)}`;
    return `${countryCode} ${clean}`;
  };

  // Current identifier string
  const currentIdentifierString = authMethod === "phone" ? getFullPhone() : email;

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setStep("identifier");
      setAuthMethod("phone");
      setPhoneNumber("");
      setEmail("");
      setOtpDigits(["", "", "", "", "", ""]);
      setName("");
      setExtraEmail("");
      setExtraPhone("");
      setLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen]);

  // Start Resend OTP timer when entering "otp" step
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

  // Handle OTP digit box input
  function handleDigitChange(index, value) {
    const cleanVal = value.replace(/\D/g, "");
    if (!cleanVal && value !== "") return;

    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal.slice(-1);
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

  // STEP 1: Send OTP handler
  async function handleSendOtp(e) {
    if (e) e.preventDefault();

    if (authMethod === "phone") {
      const clean = phoneNumber.replace(/\D/g, "");
      if (clean.length < 8) {
        toast.error("Invalid Phone Number", "Please enter a valid UK mobile phone number.");
        return;
      }
    } else {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error("Invalid Email", "Please enter a valid email address.");
        return;
      }
    }

    setLoading(true);
    const payload = authMethod === "phone" ? { phone: getFullPhone() } : { email };
    const res = await sendOtpApi(payload);
    setLoading(false);

    if (res.success) {
      setStep("otp");
      setOtpDigits(["", "", "", "", "", ""]);
      toast.success(
        "Verification Code Sent",
        `A 6-digit OTP code has been sent to ${authMethod === "phone" ? getFullPhone() : email}.`
      );
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    } else {
      toast.error("Send Failed", res.error || "Could not send OTP code. Please try again.");
    }
  }

  // Resend OTP
  async function handleResendOtp() {
    if (!canResend) return;
    setLoading(true);
    const payload = authMethod === "phone" ? { phone: getFullPhone() } : { email };
    const res = await sendOtpApi(payload);
    setLoading(false);

    if (res.success) {
      setOtpDigits(["", "", "", "", "", ""]);
      startTimer();
      toast.success(
        "New OTP Sent",
        `A fresh code was sent to ${authMethod === "phone" ? getFullPhone() : email}. Previous code is now invalid.`
      );
      inputRefs.current[0]?.focus();
    } else {
      toast.error("Resend Failed", res.error || "Failed to resend OTP.");
    }
  }

  // STEP 2: Verify OTP handler
  async function handleVerifyOtp(e) {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join("");

    if (fullOtp.length < 6) {
      toast.error("Incomplete Code", "Please enter all 6 digits of the OTP code.");
      return;
    }

    setLoading(true);
    const payload = {
      ...(authMethod === "phone" ? { phone: getFullPhone() } : { email }),
      otp: fullOtp,
    };

    const res = await verifyOtpApi(payload);
    setLoading(false);

    if (res.success) {
      // CASE 1: Existing User -> Auto logged in!
      if (!res.isNewUser && res.user) {
        toast.success("Welcome Back!", `Logged in successfully as ${res.user.name || "Customer"}`);
        if (onLoginSuccess) onLoginSuccess(res.user);
        onClose();
        return;
      }

      // CASE 2: New User -> Move to Profile Completion step inside same modal
      if (res.isNewUser) {
        toast.info("OTP Verified", "Please enter your name to complete account setup.");
        setStep("profile");
        return;
      }
    } else {
      toast.error("Verification Failed", res.error || "Invalid OTP code entered. Please try again.");
    }
  }

  // STEP 3: Complete Profile & Register handler
  async function handleCompleteSignup(e) {
    if (e) e.preventDefault();

    if (!name.trim()) {
      toast.error("Name Required", "Please enter your full name.");
      return;
    }

    const finalEmail = authMethod === "email" ? email : extraEmail.trim();
    const finalPhone = authMethod === "phone" ? getFullPhone() : extraPhone.trim();

    if (authMethod === "phone") {
      if (!finalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalEmail)) {
        toast.error("Email Required", "Please provide a valid email address.");
        return;
      }
    } else {
      if (!finalPhone || finalPhone.replace(/\D/g, "").length < 7) {
        toast.error("Phone Required", "Please provide a valid mobile phone number.");
        return;
      }
    }

    setLoading(true);
    const res = await completeSignupApi({
      name: name.trim(),
      email: finalEmail,
      phone: finalPhone,
    });
    setLoading(false);

    if (res.success && res.user) {
      toast.success("Account Created!", `Welcome to ElectroVault, ${res.user.name}!`);
      if (onLoginSuccess) onLoginSuccess(res.user);
      onClose();
    } else {
      toast.error("Registration Failed", res.error || "Could not complete signup. Please try again.");
    }
  }

  return (
    <div
      className="auth-modal-wrapper position-fixed top-0 start-0 w-100 h-100 d-flex align-items-end align-items-md-center justify-content-center p-0 p-md-3"
      style={{ zIndex: 1080 }}
    >
      {/* Backdrop */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-60"
        style={{ backdropFilter: "blur(6px)", transition: "opacity 0.3s ease" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container (Bottom-sheet on mobile, centered modal on desktop) */}
      <div
        className="auth-modal-card bg-white shadow-lg overflow-hidden position-relative d-flex flex-column flex-md-row"
        style={{ zIndex: 1090 }}
      >
        {/* Mobile Pull Handle */}
        <div className="d-flex d-md-none justify-content-center pt-2.5 pb-1 flex-shrink-0 w-100">
          <div style={{ width: "38px", height: "4px", backgroundColor: "#cbd5e1", borderRadius: "2px" }} />
        </div>

        {/* Close Button */}
        <button
          type="button"
          className="btn btn-light btn-sm rounded-circle p-2 border-0 position-absolute top-0 end-0 m-3 d-flex align-items-center justify-content-center"
          style={{ zIndex: 20, width: "34px", height: "34px", backgroundColor: "#f1f5f9" }}
          onClick={onClose}
          aria-label="Close modal"
          suppressHydrationWarning
        >
          <X size={18} className="text-secondary" />
        </button>

        {/* LEFT SIDE: Lifestyle Visual Banner (Desktop only) */}
        <div
          className="d-none d-md-flex flex-column justify-content-between position-relative text-white p-4"
          style={{
            flex: "0 0 42%",
            backgroundColor: "#0f172a",
            backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.55) 0%, rgba(15, 23, 42, 0.92) 100%), url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=900&auto=format&fit=crop')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Brand Header */}
          <div className="d-flex align-items-center gap-2">
            <div className="bg-primary text-white p-1.5 rounded-3 d-flex align-items-center justify-content-center shadow-sm">
              <Lock size={16} />
            </div>
            <span className="fw-bold fs-6 tracking-wide text-white">ElectroVault</span>
          </div>

          {/* Value Highlights */}
          <div className="mt-auto">
            <span className="badge bg-primary text-white fw-bold mb-2 px-2.5 py-1.5 rounded-pill shadow-sm">
              100% Certified Tech
            </span>
            <h5 className="fw-bold text-white mb-2" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
              Certified Refurbished &amp; Verified Electronics
            </h5>
            <p className="text-light small mb-0 opacity-90" style={{ fontSize: "0.82rem", lineHeight: "1.4" }}>
              Enjoy 1-Year Comprehensive Warranty, instant UK delivery &amp; dedicated support.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Auth Form Container */}
        <div className="p-4 p-lg-5 flex-grow-1 d-flex flex-column justify-content-center">
          {/* Top Title & Subtitle */}
          <div className="mb-4">
            <h4 className="fw-bold text-dark mb-1" style={{ fontSize: "1.45rem" }}>
              Login / Signup
            </h4>
            <p className="text-muted small mb-0" style={{ fontSize: "0.88rem" }}>
              {step === "identifier" && "Enter your mobile number or email to proceed."}
              {step === "otp" && "Enter the 6-digit OTP code sent to verify."}
              {step === "profile" && "Complete your profile to finish setup."}
            </p>
          </div>

          {/* ============================================================ */}
          {/* STEP 1: IDENTIFIER SELECTION & INPUT                        */}
          {/* ============================================================ */}
          {step === "identifier" && (
            <form onSubmit={handleSendOtp}>
              {/* Method Switcher Tabs */}
              <div className="d-flex p-1 bg-light rounded-3 mb-3 border">
                <button
                  type="button"
                  className={`btn flex-fill py-2 fw-semibold rounded-2 border-0 transition-all ${
                    authMethod === "phone"
                      ? "btn-primary shadow-sm"
                      : "text-muted hover:text-dark"
                  }`}
                  style={{ fontSize: "0.85rem" }}
                  onClick={() => setAuthMethod("phone")}
                  suppressHydrationWarning
                >
                  <Phone size={14} className="me-1.5 d-inline" />
                  Phone Number
                </button>
                <button
                  type="button"
                  className={`btn flex-fill py-2 fw-semibold rounded-2 border-0 transition-all ${
                    authMethod === "email"
                      ? "btn-primary shadow-sm"
                      : "text-muted hover:text-dark"
                  }`}
                  style={{ fontSize: "0.85rem" }}
                  onClick={() => setAuthMethod("email")}
                  suppressHydrationWarning
                >
                  <Mail size={14} className="me-1.5 d-inline" />
                  Email Address
                </button>
              </div>

              {/* Phone Input View */}
              {authMethod === "phone" && (
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Mobile Phone Number <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 fw-bold text-dark px-3" style={{ fontSize: "0.9rem" }}>
                      {countryCode}
                    </span>
                    <input
                      type="tel"
                      className="form-control form-control-lg border-start-0 fs-6 py-2.5"
                      placeholder="07700 900077"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>
                  <small className="text-muted mt-1 d-block" style={{ fontSize: "0.75rem" }}>
                    We will send a 6-digit verification code via SMS.
                  </small>
                </div>
              )}

              {/* Email Input View */}
              {authMethod === "email" && (
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted px-3">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      className="form-control form-control-lg border-start-0 fs-6 py-2.5"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>
                  <small className="text-muted mt-1 d-block" style={{ fontSize: "0.75rem" }}>
                    We will send a 6-digit verification code to your email.
                  </small>
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                className="btn btn-primary w-100 py-2.5 rounded-3 fw-semibold shadow-sm d-flex align-items-center justify-content-center gap-2 mt-4"
                style={{ fontSize: "0.95rem", minHeight: "46px" }}
                disabled={loading}
                suppressHydrationWarning
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ============================================================ */}
          {/* STEP 2: OTP VERIFICATION                                    */}
          {/* ============================================================ */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp}>
              {/* Selected Identifier without background div (clean white border card) */}
              <div className="d-flex align-items-center justify-content-between py-2 px-3 border rounded-3 mb-3 bg-white">
                <div className="d-flex align-items-center gap-2 text-truncate">
                  {authMethod === "phone" ? (
                    <Phone size={17} className="text-primary flex-shrink-0" />
                  ) : (
                    <Mail size={17} className="text-primary flex-shrink-0" />
                  )}
                  <span className="fw-medium text-dark text-truncate" style={{ fontSize: "0.9rem" }}>
                    {currentIdentifierString}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-link p-0 fw-semibold text-decoration-none text-primary"
                  style={{ fontSize: "0.85rem" }}
                  onClick={() => setStep("identifier")}
                  suppressHydrationWarning
                >
                  Change
                </button>
              </div>

              {/* 6 Square Digit Inputs */}
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
                      width: "44px",
                      height: "50px",
                      borderColor: digit ? "#2563eb" : "#cbd5e1",
                      backgroundColor: digit ? "#eff6ff" : "#ffffff",
                      transition: "all 0.15s ease-in-out",
                    }}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {/* Resend Controls */}
              <div className="d-flex align-items-center justify-content-between pt-1 mb-3">
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
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="btn btn-primary w-100 py-2.5 rounded-3 fw-semibold shadow-sm d-flex align-items-center justify-content-center gap-2"
                style={{ fontSize: "0.95rem", minHeight: "46px" }}
                disabled={loading}
                suppressHydrationWarning
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                ) : (
                  <>
                    <span>Verify OTP</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ============================================================ */}
          {/* STEP 3: COMPLETE YOUR PROFILE (NEW USERS)                   */}
          {/* ============================================================ */}
          {step === "profile" && (
            <form onSubmit={handleCompleteSignup}>
              {/* Selected Identifier without background div (clean white border card) */}
              <div className="d-flex align-items-center justify-content-between py-2 px-3 border rounded-3 mb-2.5 bg-white">
                <div className="d-flex align-items-center gap-2 text-truncate">
                  {authMethod === "phone" ? (
                    <Phone size={17} className="text-primary flex-shrink-0" />
                  ) : (
                    <Mail size={17} className="text-primary flex-shrink-0" />
                  )}
                  <span className="fw-medium text-dark text-truncate" style={{ fontSize: "0.9rem" }}>
                    {currentIdentifierString}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-link p-0 fw-semibold text-decoration-none text-primary"
                  style={{ fontSize: "0.85rem" }}
                  onClick={() => setStep("identifier")}
                  suppressHydrationWarning
                >
                  Change
                </button>
              </div>

              {/* Verified Status Banner */}
              <div className="d-flex align-items-center gap-2 p-2 px-3 rounded-3 bg-success-subtle text-success border border-success-subtle mb-3.5 small fw-medium" style={{ fontSize: "0.8rem" }}>
                <CheckCircle2 size={16} className="flex-shrink-0" />
                <span>OTP verified! Please complete your details below.</span>
              </div>

              {/* Full Name Input Field */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark mb-1">
                  Full Name <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted px-3">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 py-2.5 fs-6"
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Counterpart Contact Field */}
              {authMethod === "phone" ? (
                <div className="mb-4">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted px-3">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0 py-2.5 fs-6"
                      placeholder="e.g. john.doe@example.co.uk"
                      value={extraEmail}
                      onChange={(e) => setExtraEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Mobile Phone Number <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted px-3">
                      <Phone size={18} />
                    </span>
                    <input
                      type="tel"
                      className="form-control border-start-0 py-2.5 fs-6"
                      placeholder="07700 900077"
                      value={extraPhone}
                      onChange={(e) => setExtraPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                className="btn btn-primary w-100 py-2.5 rounded-3 fw-semibold shadow-sm d-flex align-items-center justify-content-center gap-2"
                style={{ fontSize: "0.95rem", minHeight: "46px" }}
                disabled={loading}
                suppressHydrationWarning
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                ) : (
                  <>
                    <span>Complete Signup</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Legal / Terms & Conditions Footer */}
          <div className="pt-3 mt-3 border-top text-center text-muted" style={{ fontSize: "0.74rem" }}>
            <span>
              By continuing, I agree to ElectroVault&apos;s{" "}
              <a href="/terms" className="text-decoration-underline text-secondary">
                Terms &amp; Conditions
              </a>{" "}
              &amp;{" "}
              <a href="/privacy" className="text-decoration-underline text-secondary">
                Privacy Policy
              </a>
              .
            </span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Mobile-first bottom sheet: flush with bottom and edges, space from top */
        .auth-modal-card {
          width: 100% !important;
          max-width: 100% !important;
          max-height: 85vh;
          border-top-left-radius: 20px !important;
          border-top-right-radius: 20px !important;
          border-bottom-left-radius: 0 !important;
          border-bottom-right-radius: 0 !important;
          animation: authModalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          overflow-y: auto !important;
          margin: 0 !important;
        }

        /* Desktop: Centered card with fixed max-width and min-height */
        @media (min-width: 768px) {
          .auth-modal-card {
            max-width: 760px !important;
            max-height: none !important;
            min-height: 480px;
            border-radius: 1rem !important;
            animation: authModalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            overflow: hidden !important;
          }
        }

        @keyframes authModalSlideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes authModalPop {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
