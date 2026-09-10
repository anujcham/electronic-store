"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, message, duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (title, message) => addToast("success", title, message),
    error: (title, message) => addToast("error", title, message),
    info: (title, message) => addToast("info", title, message),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Top Right Toast Notification Container */}
      <div
        className="toast-container position-fixed top-0 end-0 p-3"
        style={{ zIndex: 9999, maxWidth: "400px", pointerEvents: "none" }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast-item show rounded-3 p-3 mb-2 shadow-lg text-white d-flex align-items-start gap-3 position-relative"
            style={{
              pointerEvents: "auto",
              animation: "toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              background:
                t.type === "success"
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : t.type === "error"
                  ? "linear-gradient(135deg, #ef4444, #dc2626)"
                  : "linear-gradient(135deg, #2563eb, #1d4ed8)",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div className="toast-icon pt-0.5">
              {t.type === "success" && <CheckCircle2 size={22} className="text-white" />}
              {t.type === "error" && <AlertTriangle size={22} className="text-white" />}
              {t.type === "info" && <Info size={22} className="text-white" />}
            </div>

            <div className="flex-fill me-2">
              <div className="fw-bold text-white mb-0.5" style={{ fontSize: "0.92rem" }}>
                {t.title}
              </div>
              {t.message && (
                <div className="text-white-50 small" style={{ fontSize: "0.82rem", lineHeight: "1.35" }}>
                  {t.message}
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn btn-link text-white p-0 border-0 opacity-75 hover-opacity-100"
              onClick={() => removeToast(t.id)}
              aria-label="Close toast"
              suppressHydrationWarning
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.92);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      success: (t, m) => console.log("[TOAST SUCCESS]", t, m),
      error: (t, m) => console.log("[TOAST ERROR]", t, m),
      info: (t, m) => console.log("[TOAST INFO]", t, m),
    };
  }
  return context;
}

