import React, { useEffect } from "react";

export function Message({
  message,
  errorMessage = false,
  open,
  setOpen,
}: {
  message: string;
  errorMessage?: boolean;
  open: boolean;
  setOpen: (b: boolean) => void;
}) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      setOpen(false);
    }, 3000);
    return () => {
      clearTimeout(timeout);
    };
  }, [open, setOpen]);

  return (
    <sup
      style={{
        position: "fixed",
        top: open ? "5px" : "-50px",
        left: "50vw",
        fontSize: "15px",
        transform: "translate(-50%)",
        padding: "10px 30px",
        boxShadow: "2px 4px 10px rgba(0, 0, 0, 0.25)",
        zIndex: 50,
        backgroundColor: errorMessage ? "#D6066A" : "#06D6A0",
        transitionDuration: "400ms",
      }}
    >
      {message}
    </sup>
  );
}
