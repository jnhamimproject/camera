/* Cross-origin isolation (multi-thread WASM) + offline cache for static hosts like GitHub Pages */
const C="app-v1";
const cacheable=u=>{try{const x=new URL(u).hostname;return x===self.location.hostname||x==="cdnjs.cloudflare.com"||x==="cdn.jsdelivr.net"}catch(e){return false}};
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{
  const r=e.request;
  if(r.cache==="only-if-cached"&&r.mode!=="same-origin")return;
  const req=r.mode==="no-cors"?new Request(r,{credentials:"omit"}):r;
  e.respondWith(fetch(req).then(res=>{
    if(res.status===0)return res;
    const h=new Headers(res.headers);
    h.set("Cross-Origin-Embedder-Policy","credentialless");
    h.set("Cross-Origin-Opener-Policy","same-origin");
    const out=new Response(res.body,{status:res.status,statusText:res.statusText,headers:h});
    if(r.method==="GET"&&res.status===200&&cacheable(r.url)){const cp=out.clone();caches.open(C).then(c=>c.put(r,cp)).catch(()=>{})}
    return out;
  }).catch(()=>caches.match(r).then(m=>m||Response.error())));
});
