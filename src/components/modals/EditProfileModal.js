"use client";

import { useState, useEffect } from "react";
import { X, User, Check, Lock } from "lucide-react";
import { Button } from "../ui";
import { apiPut } from "../../services/apiClient";
import { updateStoredUser } from "../../services/authService";
import { useToast } from "../common/Toast";

export function EditProfileModal({ isOpen, onClose, currentUser, onProfileUpdated }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.name) {
      setName(currentUser.name);
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name Required", "Please enter your full name.");
      return;
    }

    setLoading(true);
    try {
      const userId = currentUser?.id || currentUser?._id;
      const res = await apiPut("/user/profile", {
        userId,
        name: name.trim(),
        email: currentUser?.email,
        phone: currentUser?.phone,
      });

      setLoading(false);
      if (res.success && res.user) {
        updateStoredUser(res.user);
        if (onProfileUpdated) {
          onProfileUpdated(res.user);
        }
        toast.success("Profile Updated", "Your name has been updated successfully.");
        onClose();
      } else {
        toast.error("Update Failed", res.error || "Failed to update profile.");
      }
    } catch (err) {
      setLoading(false);
      toast.error("Update Failed", err.message || "Failed to update profile.");
    }
  }

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header border-bottom px-4 py-3 bg-light d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3 d-flex align-items-center justify-content-center">
                <User size={18} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-dark fs-6 mb-0">Edit Profile</h5>
                <p className="text-secondary small mb-0" style={{ fontSize: "0.75rem" }}>
                  Update your display name
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">
                  Full Name <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Read Only Contact Fields */}
              <div className="bg-light rounded-3 p-3 mb-2 border">
                <div className="d-flex align-items-center gap-1 text-muted small fw-medium mb-2">
                  <Lock size={13} />
                  <span>Linked Account Information (Read Only)</span>
                </div>

                {currentUser?.phone && (
                  <div className="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                    <span className="text-secondary small">Phone:</span>
                    <span className="fw-semibold small text-dark">{currentUser.phone}</span>
                  </div>
                )}

                {currentUser?.email && (
                  <div className="d-flex justify-content-between align-items-center py-1">
                    <span className="text-secondary small">Email:</span>
                    <span className="fw-semibold small text-dark">{currentUser.email}</span>
                  </div>
                )}
              </div>
              <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                Phone number and email were verified during sign-in and cannot be edited.
              </small>
            </div>

            <div className="modal-footer border-top px-4 py-3 bg-light d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary px-3 py-2 rounded-3 small fw-medium"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="px-4 py-2 rounded-3 fw-medium"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

