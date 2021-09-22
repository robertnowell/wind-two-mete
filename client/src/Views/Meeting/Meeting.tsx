import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { IdentifyModal } from "./IdentifyModal";
const STORAGE_KEY = "WIND_TO_MEET";

export function Meeting() {
  const { id } = useParams<{ id: string }>();
  const [modalOpen, setModalOpen] = useState(true);

  useEffect(() => {
    //Check if meeting exists
    return () => {};
  }, [id]);

  if (!id) {
    return (
      <header>
        <h1>We can't find that meeting D:</h1>
        <a href="/">
          <i>Take me back home!</i>
        </a>
      </header>
    );
  }

  return (
    <div>
      Meeting: {id}
      <IdentifyModal />
    </div>
  );
}
