// FuZion wipe countdown (local device time zone)
// Edit WIPE_LOCAL to the exact wipe time you want.
// Example: "2026-01-30T14:00:00"  (2:00 PM local)
const WIPE_LOCAL = "2026-01-30T00:00:00";
const DISCORD_URL = "https://discord.gg/aUVKDV8nPk";
const SERVER_ID = "858c63d";

const $ = (id) => document.getElementById(id);
const pad2 = (n) => String(n).padStart(2, "0");

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

function formatTarget(d){
  return d.toLocaleString(undefined, {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit"
  });
}

// optional subtle parallax (mobile + desktop)
(function parallax(){
  const bg = document.querySelector(".bg");
  if (!bg) return;

  let tx = 0, ty = 0;
  function apply(){
    bg.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(1.03)`;
  }

  window.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth) - 0.5;
    const y = (e.clientY / window.innerHeight) - 0.5;
    tx = x * -10;
    ty = y * -10;
    apply();
  }, {passive:true});

  window.addEventListener("deviceorientation", (e) => {
    // iOS needs permission sometimes; if it doesn't fire, no problem.
    const x = (e.gamma || 0) / 45; // left-right
    const y = (e.beta || 0) / 45;  // front-back
    tx = clamp(x, -1, 1) * -8;
    ty = clamp(y, -1, 1) * -8;
    apply();
  }, {passive:true});
})();

function update(){
  const target = new Date(WIPE_LOCAL);
  $("targetText").textContent = formatTarget(target);

  const now = new Date();
  let diff = target - now;

  if (diff <= 0){
    $("d").textContent = "00";
    $("h").textContent = "00";
    $("m").textContent = "00";
    $("s").textContent = "00";
    $("pct").textContent = "100%";
    $("barFill").style.width = "100%";
    $("status").textContent = "WIPE LIVE";
    document.title = "FuZion • WIPE LIVE";
    return;
  }

  const sec = Math.floor(diff / 1000);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;

  $("d").textContent = pad2(days);
  $("h").textContent = pad2(hours);
  $("m").textContent = pad2(mins);
  $("s").textContent = pad2(secs);

  // Progress bar = how far into the last 48 hours before wipe (looks hype)
  const windowMs = 48 * 3600 * 1000;
  const start = new Date(target.getTime() - windowMs);
  const pct = clamp(((now - start) / windowMs) * 100, 0, 100);
  $("pct").textContent = `${Math.round(pct)}%`;
  $("barFill").style.width = `${pct}%`;

  $("status").textContent = days <= 0 ? "TODAY" : (days === 1 ? "TOMORROW" : "SOON");
  document.title = `FuZion • ${days}d ${pad2(hours)}:${pad2(mins)}:${pad2(secs)}`;
}

update();
setInterval(update, 250);
