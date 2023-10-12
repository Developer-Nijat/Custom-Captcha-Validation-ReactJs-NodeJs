const express = require("express");
const cors = require("cors");
const { generateMathCaptcha } = require("./helpers");

const app = express();
const port = 4000;

// Store CAPTCHA challenges and their solutions with timestamps
let captchas = [];

// CAPTCHA expiration time (in milliseconds)
const captchaExpirationTime = 300000; // 5 minutes

app.use(express.json());
app.use(cors());

// Middleware to verify CAPTCHA token and expiration
const verifyCaptchaToken = (req, res, next) => {

  const captchaToken = req.body.captchaToken;
  if (!captchaToken) {
    return res.status(400).json({ message: "No CAPTCHA token provided." });
  }
  const captcha = captchas.find((c) => c.token === captchaToken);

  if (!captcha) {
    return res.status(400).json({ message: "Invalid CAPTCHA token." });
  }
  // Check if the CAPTCHA has expired
  const currentTime = new Date();
  if (currentTime - captcha.timestamp > captchaExpirationTime) {
    captchas = captchas.filter(item => item.token !== captchaToken)
    return res.status(400).json({ message: "CAPTCHA has expired." });
  }
  req.captcha = captcha;
  next();
};

// Route to generate CAPTCHA challenges and return the CAPTCHA challenge
app.post("/generate-captcha", (req, res) => {
  const captchaToken = req.body.captchaToken;
  if (!captchaToken) {
    res.status(401).json({ succes:false, message:"captchaToken is required" });
    return;

  }
  const timestamp = req.body.timestamp;
  // Your CAPTCHA generation logic
  const { challenge, solution } = generateMathCaptcha();
  captchas.push({ token: captchaToken, solution, timestamp });
  res.json({ challenge });
});

// Route to validate CAPTCHA using the CAPTCHA token and timestamp
app.post("/validate-captcha", verifyCaptchaToken, (req, res) => {
  const userCaptchaInput = req.body.captchaInput;
  const captchaToken = req.body.captchaToken;
  const { solution } = req.captcha;
  if (userCaptchaInput === solution) {
    captchas = captchas.filter(item => item.token !== captchaToken)
    res.json({ message: "CAPTCHA validated successfully" });
  } else {
    res.status(400).json({ message: "CAPTCHA validation failed" });
  }
});

app.listen(port, () => console.log(`Server listening on ${port}`));
