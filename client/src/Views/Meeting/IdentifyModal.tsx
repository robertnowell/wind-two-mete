import React from "react";

export function IdentifyModal() {
  return (
    <div>
      <header
        style={{
          position: "relative",
          zIndex: 3,
          backgroundColor: "white",
          opacity: 1,
        }}
      >
        <h1>hello</h1>
      </header>
      <div
        style={{
          position: "fixed",
          width: "100vw",
          height: "100vh",
          backgroundColor: "black",
          left: 0,
          top: 0,
          opacity: 0.5,
        }}
      ></div>
    </div>
  );
}
