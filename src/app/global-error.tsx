"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          background: "#f4f7f5",
          color: "#0f1c17",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: 28, margin: "0 0 12px" }}>EdgePilot AI crashed</h1>
          <p style={{ opacity: 0.75, lineHeight: 1.5 }}>
            An unexpected error occurred. This research app never places wagers. You can try
            reloading the page.
          </p>
          <p style={{ fontSize: 12, opacity: 0.5, marginTop: 8 }}>
            {error.digest ? `Ref ${error.digest}` : error.message}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 20,
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: "#0d7a5f",
              color: "#f4fffa",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
