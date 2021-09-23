import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { IdentifyModal } from "./IdentifyModal";
import { Availability } from "../../Components";
import { Meeting, UserRecord } from "../../Types";
import { getDatabase, ref, child, get, set } from "firebase/database";
import { nanoid } from "nanoid";

const USER_ID_KEY = "USER_ID_KEY";
const USER_NAME_KEY = "USER_NAME_KEY";

export function MeetingView() {
  const { id } = useParams<{ id: string }>();
  const [modalOpen, setModalOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [name, setName] = useState("");
  const [userId, setUserId] = useState<string>(nanoid());

  const loadMeeting = () => {
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
  };

  useEffect(() => {
    //Check if meeting exists
    if (id) {
      // // Load ID
      // const userId = localStorage.getItem(USER_ID_KEY);
      // const newId = nanoid();
      // if (!userId) {
      //   localStorage.setItem(USER_ID_KEY, newId);
      // }
      // setUserId(userId || newId);
      // // setModalOpen(!userId);

      // // Load Name
      // const name = localStorage.getItem(USER_NAME_KEY);
      // if (name) {
      //   setName(name);
      // }
      loadMeeting();
    }
    return () => {};
  }, [id]);

  useEffect(() => {
    localStorage.setItem(USER_NAME_KEY, name);
  }, [name]);

  const submitTimes = async (availability: Record<number, boolean[]>) => {
    if (!meeting) {
      return;
    }

    const db = getDatabase();

    const user: UserRecord = {
      id: userId,
      name: name,
      windows: availability,
    };
    await set(ref(db, "meetings/" + meeting.id + "/users/" + user.id), user);
    loadMeeting();
  };

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
      {modalOpen && (
        <IdentifyModal
          meeting={meeting}
          name={name}
          setName={setName}
          setModalOpen={setModalOpen}
        />
      )}
      <h2>{meeting.name}</h2>
      <p>
        Editing availability for <b>{name}</b>
      </p>
      <input onChange={() => {}} value={`${window.location.host}/m/${id}`} />
      <button>Copy</button>
      <hr />
      <Availability name={name} meeting={meeting} submitTimes={submitTimes} />
    </main>
  );
}
