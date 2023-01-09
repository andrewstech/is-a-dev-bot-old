import logo from './logo.svg';
import './App.css';
import banner from "./assets/banner.png";
import { GithubAuthProvider, OAuthCredential } from "firebase/auth";
import firebase from "firebase/compat/app";
import { useAuthState } from "react-firebase-hooks/auth";
import "firebase/compat/auth";
import axios from "axios";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

firebase.initializeApp({
  apiKey: "AIzaSyCqxZkqE4TqwCQbKRr2cHQ5tHCEVyufoB4",
  authDomain: "is-a.dev.open-domains.net",
  projectId: "is-a-dev-bot",
  storageBucket: "is-a-dev-bot.appspot.com",
  messagingSenderId: "872086985892",
  appId: "1:872086985892:web:a9b2ea66c2717128c11a31",
  measurementId: "G-JKKDWPWKEH"
});

// Initialize Firebase

const auth = firebase.auth();
const githubLoginProvider = new firebase.auth.GithubAuthProvider();

function App() {
  window.addEventListener("load", (event) => auth.signOut());
  const [user] = useAuthState(auth);
  return (
    <>
      <header>
        <img alt="banner" className="banner" src={banner}></img>
      </header>
      <main>{user ? <Dashboard /> : <SignIn />}</main>

      <footer>
        <h3>&copy; is-a.dev</h3>
        <div className="donate">
          <p>Consider donating here:</p>
          <div className="donate-links">
            <img onClick={() => window.location.href="https://www.buymeacoffee.com/phenax"} src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="28" width="119"/>
            <img onClick={() => window.location.href="https://liberapay.com/phenax"} src="https://img.shields.io/badge/liberapay-donate-yellow.svg?style=for-the-badge" alt="Liberapay recurring donation button"/>
          </div>
        </div>
      </footer>
    </>
  );
}

function SignIn() {
  const searchParams = new URLSearchParams(document.location.search)

  return (
    <button className="margin-top-15px"
      onClick={async () => {
        githubLoginProvider.addScope("public_repo");

        await auth.signInWithPopup(githubLoginProvider)
          .then((res) => {
            var token = res.credential.accessToken;
            var user = res.additionalUserInfo.username;
            var email = res.user.email;
            var discordid = searchParams.get("user");

            // make a GET request
            // fetch("https://register-bot.is-a.dev/login/api?user=" + discordid + "&token=" + token + "&email=" + email + "&username=" + user)
            axios({
              method: "GET",
              url: `https://register-bot.is-a.dev/login/api?user=${discordid}&token=${token}&email=${email}&username=${user}`
            })
            .then(async (res) => {
              if(res.status && res.status == "200") {
                console.log("Authenticated!");
              } else {
                alert("Error: " + res.status);
              }
            });
          });
      }}
    >Sign in with GitHub</button>
  );
}

function Dashboard() {
  const [user] = useAuthState(auth);
  return (
    <div className="dashboard">
      <h1>Welcome</h1>
      <h2>Logged in as {user.displayName}</h2>
      <p1>To signout do /logout</p1>
      <div className="btnBox">
                <button onClick={() => auth.signOut()}>reload</button>
            </div>
    </div>
  );
}

export default App;
