const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const fetch = require('node-fetch');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const key = "6e7df7164a444ef585ac64167fb53a99"; // 商户私钥
const mch_no = "6802724360b2d53b6ee06993"; // 商户号

app.get("/", async (req, res) => {
  const amount = req.query.amount || "1.00";
  const order = "ORD" + Date.now();
  const nation = "USD";
  const callback_url = "https://yourdomain.com/notify";
  const back_url = "https://yourdomain.com/thankyou";
  const client_ip = "127.0.0.1";
  const timestamp = Date.now().toString();

  const params = {
    amount,
    back_url,
    callback_url,
    client_ip,
    mch_no,
    nation,
    order,
    timestamp
  };

  const queryString = Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join("&") + `&key=${key}`;

  const sign = crypto.createHash('md5').update(queryString).digest("hex");
  const body = new URLSearchParams({ ...params, sign });

  try {
    const response = await fetch("https://api.xoxpay.net/api/v1/victory/pay", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Request failed", detail: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
