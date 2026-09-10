"use client";

import { useState } from "react";
import { X, MapPin, User, Phone, Building, Navigation } from "lucide-react";
import { saveAddress } from "../../services/addressService";
import { useToast } from "../common/Toast";
import { Button } from "../ui";

export function AddAddressModal({ isOpen, onClose, userId, onAddressSaved }) {
  const toast = useToast();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("United Kingdom");
  const [isDefault, setIsDefault] = useState(false);

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  function resetForm() {
    setFullName("");
    setPhone("");
    setAddressLine1("");
    setAddressLine2("");
    setCity("");
    setPostcode("");
    setCountry("United Kingdom");
    setIsDefault(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!userId) {
      toast.error("Error", "Please sign in to save an address.");
      return;
    }

    setLoading(true);
    const addressData = {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      postcode,
      country,
      isDefault,
    };

    const res = await saveAddress(userId, addressData);
    setLoading(false);

    if (res.success) {
      toast.success("Address Saved", "Delivery address saved to your account!");
      if (onAddressSaved) onAddressSaved(res.addresses);
      resetForm();
      onClose();
    } else {
      toast.error("Save Failed", res.error || "Failed to save address.");
    }
  }

  return (
    <div className="modal-wrapper position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" style={{ zIndex: 1080 }}>
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
        style={{ maxWidth: "520px", zIndex: 1090, animation: "modalPop 0.25s ease-out forwards" }}
      >
        {/* Header */}
        <div className="p-4 border-bottom bg-light d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-primary text-white p-2 rounded-3">
              <MapPin size={20} />
            </div>
            <div>
              <h5 className="fw-bold text-primary mb-0">Add New Shipping Address</h5>
              <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                Saved directly to your MongoDB account
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

        {/* Body */}
        <div className="p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-dark">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-dark">Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <Phone size={16} />
                  </span>
                  <input
                    type="tel"
                    className="form-control border-start-0"
                    placeholder="+44 7700 900077"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold text-dark">Address Line 1</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <Building size={16} />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="House/Flat number and Street name"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold text-dark">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Apartment, suite, unit, etc."
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-dark">Town / City</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="London"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold text-dark">Postcode</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <Navigation size={16} />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 text-uppercase"
                    placeholder="SW1A 1AA"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="col-12">
                <label className="form-label small fw-semibold text-dark">Country</label>
                <select
                  className="form-select"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Ireland">Ireland</option>
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                </select>
              </div>

              <div className="col-12 mt-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isDefaultCheck"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                  />
                  <label className="form-check-label small fw-medium text-dark" htmlFor="isDefaultCheck">
                    Set as default delivery address
                  </label>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 pt-2 border-top">
              <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" loading={loading}>
                Save Address
              </Button>
            </div>
          </form>
        </div>
      </div>

      <style jsx global>{`
        @keyframes modalPop {
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

