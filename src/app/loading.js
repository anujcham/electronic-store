export default function RootLoading() {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center min-vh-50 py-5"
      style={{ minHeight: "60vh" }}
    >
      <div className="spinner-border text-primary mb-3" role="status" style={{ width: "2.5rem", height: "2.5rem" }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted small fw-medium">Loading content...</p>
    </div>
  );
}

