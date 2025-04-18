/*  Cash‑App (XoPay) 下单代理  */
const CASHAPP_MCH_NO  = "6802724360b2d53b6ee06993";
const CASHAPP_PRIVKEY = "6e7df7164a444ef585ac64167fb53a99";

export default {
  async fetch(req) {
    if (req.method !== "POST")
      return new Response("Method Not Allowed", { status: 405 });

    let body;
    try { body = await req.json(); } catch { return new Response("Bad JSON", { status: 400 }); }

    const { amount, orderId } = body || {};
    if (!amount || !orderId)
      return new Response("Missing amount / orderId", { status: 400 });

    const ts = Date.now().toString();
    const back = encodeURIComponent("https://loverplayground.com/#thankYouCash");
    const cb   = encodeURIComponent("https://loverplayground.com/cashapp-webhook");

    const params = {
      amount, back_url: back, callback_url: cb, client_ip: "0.0.0.0",
      mch_no: CASHAPP_MCH_NO, nation: "USD", order: orderId, timestamp: ts
    };
    const query = Object.keys(params).sort().map(k=>`${k}=${params[k]}`).join("&");
    const sign  = await md5(query + `&key=${CASHAPP_PRIVKEY}`);
    const bodyStr = query + `&sign=${sign}`;

    const xo = await fetch("https://api.xoxpay.net/api/v1/victory/pay", {
      method:"POST",
      headers:{ "Content-Type":"application/x-www-form-urlencoded" },
      body: bodyStr
    }).then(r=>r.json()).catch(()=>null);

    if (!xo || xo.code !== 200)
      return new Response(JSON.stringify(xo||{msg:"network"}), { status:502 });

    return Response.json({ url: xo.data.url });
  }
};

async function md5(str){
  const buf = await crypto.subtle.digest("MD5", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("");
}
