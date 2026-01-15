import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const OPENAI_API_KEY = "ВСТАВЬ_СЮДА_API_KEY";

app.get("/", (req, res) => {
res.send(`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>salim AI</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
:root {
  --bg:#0d0d0d;--panel:#000;--user:#1f1f1f;
  --ai:#111;--border:#222;--accent:#19c37d;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);font-family:system-ui;color:#fff}
header{height:56px;background:var(--panel);display:flex;
align-items:center;justify-content:center;font-weight:600;
border-bottom:1px solid var(--border)}
#chat{padding:20px;height:calc(100vh - 116px);overflow-y:auto}
.msg{max-width:85%;padding:12px 14px;margin:10px 0;
border-radius:14px;white-space:pre-wrap;line-height:1.4}
.user{background:var(--user);margin-left:auto}
.ai{background:var(--ai);border:1px solid var(--border)}
footer{height:60px;display:flex;gap:10px;padding:10px;
background:var(--panel);border-top:1px solid var(--border)}
input{flex:1;padding:12px 14px;border-radius:12px;border:none;
background:#111;color:#fff;font-size:15px;outline:none}
button{padding:0 18px;border-radius:12px;border:none;
background:var(--accent);font-weight:700;cursor:pointer}
.cursor{animation:blink 1s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
</style>
</head>
<body>

<header>salim AI</header>
<div id="chat"></div>

<footer>
<input id="input" placeholder="Напиши сообщение…">
<button onclick="send()">➤</button>
</footer>

<script>
const chat=document.getElementById("chat");
const input=document.getElementById("input");

function typeMessage(text,cls){
 const el=document.createElement("div");
 el.className="msg "+cls;chat.appendChild(el);
 let i=0;const c=document.createElement("span");
 c.textContent="▍";c.className="cursor";el.appendChild(c);
 const t=setInterval(()=>{
  c.remove();el.textContent+=text[i]||"";el.appendChild(c);
  i++;chat.scrollTop=chat.scrollHeight;
  if(i>=text.length){clearInterval(t);c.remove()}
 },15);
}

async function send(){
 if(!input.value.trim())return;
 const text=input.value;input.value="";
 typeMessage(text,"user");

 const r=await fetch("/api/chat",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({message:text})
 });
 const d=await r.json();
 typeMessage(d.reply,"ai");
}

input.addEventListener("keydown",e=>{
 if(e.key==="Enter")send();
});
</script>
</body>
</html>`);
});

app.post("/api/chat", async (req, res) => {
 try {
  const response = await fetch(
   "https://api.openai.com/v1/chat/completions",
   {
    method:"POST",
    headers:{
     "Authorization":"Bearer "+OPENAI_API_KEY,
     "Content-Type":"application/json"
    },
    body:JSON.stringify({
     model:"gpt-4o-mini",
     messages:[
      {role:"system",content:"Ты умный AI ассистент salim AI."},
      {role:"user",content:req.body.message}
     ]
    })
   }
  );
  const data=await response.json();
  res.json({reply:data.choices[0].message.content});
 } catch {
  res.json({reply:"Ошибка подключения 😢"});
 }
});

app.listen(3000,()=>console.log("🚀 http://localhost:3000"));
