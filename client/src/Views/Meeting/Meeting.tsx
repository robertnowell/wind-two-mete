import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { IdentifyModal } from "./IdentifyModal";
import { Availability } from "../../Components";
import { Meeting } from "../../Types";
import { getDatabase, ref, child, get } from "firebase/database";

const STORAGE_KEY = "WIND_TO_MEET";

export function MeetingView() {
  const { id } = useParams<{ id: string }>();
  const [modalOpen, setModalOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState<Meeting | null>(null);

  useEffect(() => {
    //Check if meeting exists
    if (id) {
      const dbRef = ref(getDatabase());
      get(child(dbRef, `meetings/${id}`))
        .then((snapshot) => {
          if (snapshot.exists()) {
            setMeeting(snapshot.val());
          } else {
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
        });
    }
    return () => {};
  }, [id]);

  if (loading) {
    return (
      <header>
        <h3>
          <i>loading...</i>
        </h3>
      </header>
    );
  }

  if (!id || !meeting) {
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
    <main>
      <h2>{meeting.name}</h2>
      <input onChange={() => {}} value={`${window.location.host}/m/${id}`} />
      <button>Copy</button>
      <hr />
      <Availability name="Caleb" meeting={meeting} />
      {/* <IdentifyModal /> */}
    </main>
  );
}
