import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

export function Meeting() {
  let { id } = useParams<{ id: string }>();

  useEffect(() => {
    //Check if meeting exists
    return () => {};
  }, [id]);

  return <div>Meeting: {id}</div>;
}
