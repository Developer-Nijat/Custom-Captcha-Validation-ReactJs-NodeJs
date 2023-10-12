import { useEffect, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
// CUSTOM IMPORTS
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaChallenge, setCaptchaChallenge] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [validationResult, setValidationResult] = useState("");

  useEffect(() => {
    generateCaptchaToken();
  }, []);

  const generateCaptchaToken = () => {
    const newToken = uuidv4();
    setCaptchaToken(newToken);

    // Request a new CAPTCHA challenge from the server, including a timestamp
    axios
      .post("http://localhost:4000/generate-captcha", {
        captchaToken: newToken,
        timestamp: Date.now(),
      })
      .then((response) => {
        setCaptchaChallenge(response.data.challenge);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const validateCaptcha = () => {
    // Send the CAPTCHA token, user input, and timestamp to the server for validation
    axios
      .post("http://localhost:4000/validate-captcha", {
        captchaToken,
        captchaInput,
        timestamp: Date.now(),
      })
      .then((response) => {
        setValidationResult(response.data.message);

        setCaptchaChallenge("")
        setCaptchaInput("")
        generateCaptchaToken()
      })
      .catch((error) => {
        alert("Invalid CAPTCHA")
        console.error(error);
      });
  };

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h3>Vite + React | Custom Captcha Validation</h3>
      <div className="card">
        <div>
          <h1>Custom CAPTCHA Example</h1>
          <p>CAPTCHA Token: {captchaToken}</p>
          <p>CAPTCHA Challenge: {captchaChallenge}</p>
          <input
            type="text"
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
          />
          <button onClick={validateCaptcha}>Submit</button>
          <p>{validationResult}</p>
        </div>
      </div>
    </>
  );
}

export default App;
