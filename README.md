// index.js
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const key = "6e7df7164a444ef585ac64167fb53a99"; // 商户私钥

app.get('/', (req, res) => {
  const { amount = "1.00" } = req.query;
  const order = "ORD" + Date.now();
  const mch_no = "6802724360b2d53b6ee06993";
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

  const signStr = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join("&") + `&key=${key}`;
  const sign = crypto.createHash('md5').update(signStr).digest("hex");

  const form = new URLSearchParams({ ...params, sign });

  fetch('https://api.xoxpay.net/api/v1/victory/pay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form
  })
    .then(r => r.json())
    .then(json => res.json(json))
    .catch(e => res.status(500).json({ error: e.message }));
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
