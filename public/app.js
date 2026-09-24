document.getElementById("year").textContent=new Date().getFullYear();const btn=document.querySelector(".menuBtn"),nav=document.querySelector(".nav nav");btn.onclick=()=>{const o=nav.classList.toggle("open");btn.textContent=o?"✕":"☰";btn.setAttribute("aria-expanded",o)};nav.querySelectorAll("a").forEach(a=>a.onclick=()=>nav.classList.remove("open"));const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("show");io.unobserve(e.target)}}),{threshold:.1});document.querySelectorAll(".reveal").forEach(e=>io.observe(e));
const CONTACT={whatsapp:"5592991102200"};document.getElementById("wa").href=`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent("Olá! Gostaria de solicitar uma proposta para administração do meu condomínio.")}`;
document.getElementById("leadForm").onsubmit=async e=>{e.preventDefault();const s=document.getElementById("status");s.textContent="Enviando...";try{const r=await fetch("/api/leads",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(Object.fromEntries(new FormData(e.target)))});const j=await r.json();if(!r.ok)throw Error(j.error);s.textContent="✓ Solicitação enviada com sucesso.";e.target.reset()}catch(x){s.textContent="Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp."}};

// PWA: registro do modo offline e instalação em computadores, Android e iOS.
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js"));
}

const installPwa = document.getElementById("installPwa");
let installPrompt;
const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);

window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    installPwa.hidden = false;
});

if (isIos && !isStandalone) installPwa.hidden = false;

installPwa?.addEventListener("click", async () => {
    if (installPrompt) {
        installPrompt.prompt();
        await installPrompt.userChoice;
        installPrompt = null;
        installPwa.hidden = true;
        return;
    }

    if (isIos) {
        alert('No Safari, toque em “Compartilhar” e depois em “Adicionar à Tela de Início”.');
    }
});

window.addEventListener("appinstalled", () => {
    installPwa.hidden = true;
});
