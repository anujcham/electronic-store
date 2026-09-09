"use client";

import { useState } from "react";
import { Leaf, Recycle, Droplets, Zap, ShieldCheck } from "lucide-react";
import { Container } from "../ui";

export function EcoImpactSection() {
  const [deviceCount, setDeviceCount] = useState(1);

  // Environmental savings estimates per refurbished phone
  const co2SavedPerDevice = 70.5; // kg CO2
  const eWasteSavedPerDevice = 175; // grams of e-waste
  const waterSavedPerDevice = 910; // liters of water
  const rawMineralsSavedPerDevice = 120; // kg of raw mineral ores

  const totalCo2 = (deviceCount * co2SavedPerDevice).toFixed(1);
  const totalEwaste = ((deviceCount * eWasteSavedPerDevice) / 1000).toFixed(2);
  const totalWater = (deviceCount * waterSavedPerDevice).toLocaleString();
  const totalMinerals = (deviceCount * rawMineralsSavedPerDevice).toLocaleString();

  return (
    <section className="py-5 py-lg-6 bg-white border-top border-bottom">
      <Container>
        <div className="row align-items-center g-4 g-lg-5">
          {/* Left Column: Information */}
          <div className="col-12 col-lg-5">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1.5">
                <Leaf size={16} /> Eco Savings Calculator
              </span>
            </div>

            <h2 className="display-6 fw-bold text-primary mb-3">
              Buy Refurbished, Save Money & Protect the Planet
            </h2>

            <p className="text-secondary mb-4">
              Manufacturing a brand-new smartphone accounts for up to <strong>80% of its total lifetime carbon footprint</strong>. By choosing certified pre-owned devices, you actively prevent toxic electronic waste and conserve rare earth minerals.
            </p>

            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-start gap-3">
                <div className="bg-success text-white p-2.5 rounded-circle d-flex align-items-center justify-content-center">
                  <Recycle size={20} />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-1">Zero Plastic & Recyclable Packaging</h6>
                  <p className="small text-muted mb-0">Every phone is shipped in 100% biodegradable, eco-certified protective boxes.</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3">
                <div className="bg-primary text-white p-2.5 rounded-circle d-flex align-items-center justify-content-center">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-1">Circular Tech Economy</h6>
                  <p className="small text-muted mb-0">We extend device lifespans by an average of 3.2 additional years through expert repair.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Calculator */}
          <div className="col-12 col-lg-7">
            <div className="bg-soft border rounded-4 p-4 p-md-5 shadow-sm">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                  <h5 className="fw-bold text-primary mb-1">Interactive Eco-Impact Counter</h5>
                  <p className="small text-muted mb-0">Slide to see how much environmental impact you prevent</p>
                </div>
                <span className="badge bg-primary fs-6 px-3 py-2 rounded-pill">
                  {deviceCount} {deviceCount === 1 ? "Phone" : "Phones"}
                </span>
              </div>

              {/* Range Slider */}
              <div className="mb-4">
                <input
                  type="range"
                  className="form-range custom-range"
                  min="1"
                  max="10"
                  value={deviceCount}
                  onChange={(e) => setDeviceCount(parseInt(e.target.value))}
                  style={{ cursor: "pointer" }}
                />
                <div className="d-flex justify-content-between text-muted small fw-semibold">
                  <span>1 Device</span>
                  <span>5 Devices</span>
                  <span>10 Devices</span>
                </div>
              </div>

              {/* Dynamic Impact Cards */}
              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <div className="bg-white border rounded-3 p-3 text-center h-100 shadow-sm">
                    <Leaf className="text-success mx-auto mb-2" size={24} />
                    <div className="h4 fw-bold text-primary mb-0">{totalCo2} kg</div>
                    <div className="small text-muted" style={{ fontSize: "0.75rem" }}>CO₂ Prevented</div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="bg-white border rounded-3 p-3 text-center h-100 shadow-sm">
                    <Recycle className="text-warning mx-auto mb-2" size={24} />
                    <div className="h4 fw-bold text-primary mb-0">{totalEwaste} kg</div>
                    <div className="small text-muted" style={{ fontSize: "0.75rem" }}>E-Waste Saved</div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="bg-white border rounded-3 p-3 text-center h-100 shadow-sm">
                    <Droplets className="text-info mx-auto mb-2" size={24} />
                    <div className="h4 fw-bold text-primary mb-0">{totalWater} L</div>
                    <div className="small text-muted" style={{ fontSize: "0.75rem" }}>Water Saved</div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="bg-white border rounded-3 p-3 text-center h-100 shadow-sm">
                    <Zap className="text-primary mx-auto mb-2" size={24} />
                    <div className="h4 fw-bold text-primary mb-0">{totalMinerals} kg</div>
                    <div className="small text-muted" style={{ fontSize: "0.75rem" }}>Raw Ore Saved</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

