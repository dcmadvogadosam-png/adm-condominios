const form=document.querySelector('#loginForm'),statusEl=document.querySelector('#loginStatus');
async function api(url,opt={}){const r=await fetch(url,{...opt,headers:{'content-type':'application/json',...(opt.headers||{})}});let j={};try{j=await r.json()}catch{}if(!r.ok)throw new Error(j.error||'Erro na solicitação.');return j}
(async()=>{try{const s=await api('/api/admin/session');if(s.authenticated)location.replace('/painel.html')}catch{}})();
form.onsubmit=async e=>{e.preventDefault();statusEl.textContent='Entrando...';try{await api('/api/admin/login',{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(form)))});location.replace('/painel.html')}catch(err){statusEl.textContent=err.message}};
