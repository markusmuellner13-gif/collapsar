import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(ellipse at top, #181229 0%, #05040a 65%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "radial-gradient(circle at 38% 35%, #c99bff 0%, #7c4dff 45%, #ff6b3d 100%)",
            marginBottom: 32,
            boxShadow: "0 0 120px 20px rgba(124,77,255,0.45)",
          }}
        />
        <div style={{ fontSize: 84, fontWeight: 900, color: "white", letterSpacing: -2 }}>COLLAPSAR</div>
        <div style={{ fontSize: 28, color: "rgba(255,255,255,0.5)", marginTop: 12 }}>merge to the void</div>
      </div>
    ),
    { ...size }
  );
}
