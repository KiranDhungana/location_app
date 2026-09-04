import { ImageResponse } from "next/og";

export const alt = "Click me to connect me on WhatsApp";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          background: "#075E54",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 180,
            height: 180,
            borderRadius: 40,
            background: "#25D366",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 64,
            fontWeight: 700,
          }}
        >
          WA
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            paddingLeft: 80,
            paddingRight: 80,
            color: "white",
            fontSize: 48,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.25,
          }}
        >
          Click me to connect me on WhatsApp
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 16,
            color: "#D1F7E0",
            fontSize: 28,
          }}
        >
          Tap to start a chat
        </div>
      </div>
    ),
    { ...size },
  );
}
