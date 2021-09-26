import React from "react";

export function Key() {
  return (
    <section>
      <div style={{ display: "flex" }}>
        <ColorBlock color="#06D6A0" /> Your availability
      </div>
      <div style={{ marginLeft: "5px", display: "flex" }}>
        <ColorBlock color="#FFD166" /> Group availability
      </div>
    </section>
  );
}

function ColorBlock({ color }: { color: string }) {
  return (
    <div
      style={{
        width: "1em",
        height: "1em",
        backgroundColor: color,
        display: "inline",
      }}
    ></div>
  );
}
