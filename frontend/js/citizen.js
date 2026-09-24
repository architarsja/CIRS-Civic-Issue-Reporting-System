async function loadCitizen(){
if(!guard('CITIZEN'))return;
const u=user();document.querySelectorAll('[data-user]').forEach(x=>x.textContent=u.name);
try{const r=await api('/complaints/my');const cs=r.data;const count=s=>cs.filter(c=>c.status===s).length;
['total','pending','progress','resolved'].forEach((k,i)=>{const el=document.getElementById(k);if(el)el.textContent=[cs.length,count('Pending'),count('In Progress'),count('Resolved')][i]});
const list=document.getElementById('complaintList');if(list)list.innerHTML=cs.map(c=>`<div class="card complaint-card"><div><b>#${c.id} · ${c.title}</b><p class="muted">${c.category} · ${c.location||'Location not set'}</p><span class="badge ${c.status.replaceAll(' ','-')}">${c.status}</span></div><a class="btn btn-secondary" href="complaint-details.html?id=${c.id}">View</a></div>`).join('')||'<p class="muted">No complaints yet.</p>';
}catch(e){toast(e.message)}}
