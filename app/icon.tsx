import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 35% 30%, #1c1533 0%, #05040a 70%)",
          borderRadius: 96,
        }}
      >
        <div
          style={{
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: "radial-gradient(circle at 38% 35%, #c99bff 0%, #7c4dff 45%, #ff6b3d 100%)",
            boxShadow: "0 0 90px 10px rgba(124,77,255,0.55)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
