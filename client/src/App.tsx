import React from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { initializeApp } from "firebase/app";

import { Meeting, CreateMeeting } from "./Views";

const firebaseConfig = {
  apiKey: "AIzaSyBQMtR069j8LpyGTwU3JnfCwPyrnMoDoiU",
  authDomain: "wind-to-meet.firebaseapp.com",
  projectId: "wind-to-meet",
  storageBucket: "wind-to-meet.appspot.com",
  messagingSenderId: "1069835024691",
  appId: "1:1069835024691:web:55721df34ddaee2237e646",
  measurementId: "G-BQNMTZCHMW",
};

// Initialize Firebase
initializeApp(firebaseConfig);

function App() {
  return (
    <main>
      <Router>
        <div>
          <Switch>
            <Route path="/m/:id">
              <Meeting />
            </Route>
            <Route path="/">
              <CreateMeeting />
            </Route>
          </Switch>
        </div>
      </Router>
    </main>
  );
}

export default App;
