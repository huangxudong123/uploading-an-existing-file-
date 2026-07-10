const state = { inboxes: [], selectedInbox: null, messages: [], selectedMessageId: null, searchTimer: null };
const $ = (selector) => document.querySelector(selector);
const elements = {
  connectionStatus: $('#connectionStatus'), refreshAllButton: $('#refreshAllButton'), createInboxButton: $('#createInboxButton'),
  createResult: $('#createResult'), closeCreateResultButton: $('#closeCreateResultButton'), createdEmailName: $('#createdEmailName'),
  createdInboxUrl: $('#createdInboxUrl'), copyCreatedEmailButton: $('#copyCreatedEmailButton'), copyCreatedUrlButton: $('#copyCreatedUrlButton'),
  openCreatedUrlButton: $('#openCreatedUrlButton'), inboxList: $('#inboxList'), selectedInboxTitle: $('#selectedInboxTitle'),
  copyAddressButton: $('#copyAddressButton'), copyViewerUrlButton: $('#copyViewerUrlButton'), messageSearchInput: $('#messageSearchInput'),
  refreshMessagesButton: $('#refreshMessagesButton'), messageList: $('#messageList'), messageViewer: $('#messageViewer'), toast: $('#toast')
};
async function api(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { Accept:'application/json', ...(options.body ? {'Content-Type':'application/json'} : {}), ...(options.headers || {}) } });
  let payload; try { payload = await response.json(); } catch { payload = { error:'服务器返回了无法解析的内容。' }; }
  if (!response.ok) throw new Error(payload.error || `请求失败（${response.status}）`);
  return payload;
}
function escapeHtml(value='') { return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;'); }
function formatDate(value, includeTime=true) { if (!value) return '未知时间'; const d=new Date(value); if (Number.isNaN(d.getTime())) return String(value); return new Intl.DateTimeFormat('zh-CN',{month:'short',day:'numeric',...(includeTime?{hour:'2-digit',minute:'2-digit'}:{}),hour12:false}).format(d); }
function showToast(message) { elements.toast.textContent=message; elements.toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>elements.toast.classList.remove('show'),2400); }
function setBusy(button,busy,label) { button.disabled=busy; if(!button.dataset.originalText) button.dataset.originalText=button.textContent.trim(); button.textContent=busy?label:button.dataset.originalText; }
async function copyText(value,message) { try { await navigator.clipboard.writeText(value); showToast(message); } catch { showToast('复制失败，请手动复制'); } }
function showCreateResult(inbox) { elements.createdEmailName.textContent=inbox.email||inbox.inbox_id; elements.createdInboxUrl.value=inbox.viewer_url; elements.openCreatedUrlButton.href=inbox.viewer_url; elements.createResult.classList.remove('hidden'); }
function renderInboxes() {
  if(!state.inboxes.length){ elements.inboxList.innerHTML='<div class="loading-row">暂无邮箱，点击“创建随机邮箱”即可生成。</div>'; return; }
  elements.inboxList.innerHTML=state.inboxes.map(inbox=>{
    const address=inbox.email||inbox.inbox_id;
    const active=state.selectedInbox?.inbox_id===inbox.inbox_id;
    return `
    <article class="inbox-card ${active?'active':''}">
      <button class="inbox-select" type="button" data-select-inbox="${escapeHtml(inbox.inbox_id)}" aria-label="在管理页面查看 ${escapeHtml(address)}">
        <span class="inbox-card-label">${active?'当前邮箱':'邮箱地址'}</span>
        <span class="address" title="${escapeHtml(address)}">${escapeHtml(address)}</span>
        <span class="meta">创建于 ${formatDate(inbox.created_at,false)}</span>
      </button>
      <div class="inbox-actions" aria-label="邮箱操作">
        <button class="icon-action" type="button" data-copy-address="${escapeHtml(inbox.inbox_id)}">复制地址</button>
        <a class="icon-action open" href="${escapeHtml(inbox.viewer_url)}" target="_blank" rel="noopener noreferrer">查看邮件</a>
        <button class="icon-action delete" type="button" data-delete-inbox="${escapeHtml(inbox.inbox_id)}">删除</button>
      </div>
    </article>`;
  }).join('');
}
function renderMessages(){
  if(!state.selectedInbox){ elements.messageList.className='message-list empty-state'; elements.messageList.innerHTML='<div><div class="empty-icon">✉</div><p>选择一个邮箱后查看邮件</p></div>'; return; }
  elements.messageList.className='message-list';
  if(!state.messages.length){ elements.messageList.innerHTML='<div class="loading-row">这个邮箱暂时还没有邮件。</div>'; return; }
  elements.messageList.innerHTML=state.messages.map(message=>`
    <button class="message-item ${state.selectedMessageId===message.message_id?'active':''}" type="button" data-message-id="${escapeHtml(message.message_id)}">
      <span class="message-row"><span class="message-from">${escapeHtml(message.from||'未知发件人')}</span><span class="message-time">${formatDate(message.timestamp)}</span></span>
      <span class="message-subject">${escapeHtml(message.subject||'（无主题）')}</span><span class="message-preview">${escapeHtml(message.preview||'暂无预览')}</span>
    </button>`).join('');
}
function renderMessageDetail(message){
  const attachments=Array.isArray(message.attachments)&&message.attachments.length?`<div class="attachments"><strong>附件</strong><div>${message.attachments.map(a=>`<span class="attachment-chip">${escapeHtml(a.filename||'未命名附件')} (${Math.ceil((a.size||0)/1024)} KB)</span>`).join('')}</div></div>`:'';
  elements.messageViewer.className='message-detail'; elements.messageViewer.innerHTML=`<header class="message-detail-header"><h2>${escapeHtml(message.subject||'（无主题）')}</h2><div class="message-meta"><div><strong>发件人：</strong>${escapeHtml(message.from||'未知')}</div><div><strong>收件人：</strong>${escapeHtml((message.to||[]).join(', ')||'未知')}</div><div><strong>时间：</strong>${escapeHtml(formatDate(message.timestamp))}</div></div></header><div class="message-body"><pre>${escapeHtml(message.text||'这封邮件没有可显示的正文。')}</pre>${attachments}</div>`;
}
async function checkHealth(){ try{const data=await api('/api/admin/health'); elements.connectionStatus.textContent=data.configured?'服务已连接':'未配置密钥'; elements.connectionStatus.className=`status-pill ${data.configured?'online':'offline'}`;}catch{elements.connectionStatus.textContent='服务不可用';elements.connectionStatus.className='status-pill offline';}}
async function loadInboxes({selectFirst=true}={}){
  elements.inboxList.innerHTML='<div class="loading-row">正在加载邮箱…</div>';
  try{const data=await api('/api/admin/inboxes'); const selectedId=state.selectedInbox?.inbox_id; state.inboxes=data.inboxes||[]; state.selectedInbox=state.inboxes.find(x=>x.inbox_id===selectedId)||null; renderInboxes(); if(!state.selectedInbox&&selectFirst&&state.inboxes[0]) await selectInbox(state.inboxes[0].inbox_id);}catch(e){elements.inboxList.innerHTML=`<div class="error-box">${escapeHtml(e.message)}</div>`;showToast(e.message);}
}
async function selectInbox(id){const inbox=state.inboxes.find(x=>x.inbox_id===id);if(!inbox)return;state.selectedInbox=inbox;state.selectedMessageId=null;elements.selectedInboxTitle.textContent=inbox.email||inbox.inbox_id;elements.copyAddressButton.classList.remove('hidden');elements.copyViewerUrlButton.classList.remove('hidden');elements.messageViewer.className='viewer-empty';elements.messageViewer.innerHTML='<div><div class="empty-icon">⌁</div><p>点击一封邮件查看正文</p></div>';renderInboxes();await loadMessages();}
async function loadMessages(){if(!state.selectedInbox)return;elements.messageList.className='message-list';elements.messageList.innerHTML='<div class="loading-row">正在加载邮件…</div>';const q=elements.messageSearchInput.value.trim();try{const suffix=q?`?search=${encodeURIComponent(q)}`:'';const data=await api(`/api/admin/inboxes/${encodeURIComponent(state.selectedInbox.inbox_id)}/messages${suffix}`);state.messages=(data.messages||[]).sort((a,b)=>new Date(b.timestamp||0)-new Date(a.timestamp||0));renderMessages();}catch(e){elements.messageList.innerHTML=`<div class="error-box">${escapeHtml(e.message)}</div>`;showToast(e.message);}}
async function openMessage(id){if(!state.selectedInbox)return;state.selectedMessageId=id;renderMessages();elements.messageViewer.className='viewer-empty';elements.messageViewer.innerHTML='<div><p>正在加载邮件正文…</p></div>';try{const m=await api(`/api/admin/inboxes/${encodeURIComponent(state.selectedInbox.inbox_id)}/messages/${encodeURIComponent(id)}`);renderMessageDetail(m);}catch(e){elements.messageViewer.innerHTML=`<div class="error-box">${escapeHtml(e.message)}</div>`;showToast(e.message);}}
async function deleteInbox(id){const inbox=state.inboxes.find(x=>x.inbox_id===id);if(!inbox)return;const ok=window.confirm(`确定删除邮箱“${inbox.email||id}”吗？\n\n删除后该邮箱和邮件可能无法恢复，专属查看链接也会立即失效。`);if(!ok)return;try{await api(`/api/admin/inboxes/${encodeURIComponent(id)}`,{method:'DELETE'});showToast('邮箱已删除');if(state.selectedInbox?.inbox_id===id){state.selectedInbox=null;state.messages=[];elements.selectedInboxTitle.textContent='请选择一个邮箱';elements.copyAddressButton.classList.add('hidden');elements.copyViewerUrlButton.classList.add('hidden');elements.messageViewer.className='viewer-empty';elements.messageViewer.innerHTML='<div><div class="empty-icon">⌁</div><p>点击一封邮件查看正文</p></div>';}await loadInboxes();}catch(e){showToast(e.message);}}
elements.createInboxButton.addEventListener('click',async()=>{setBusy(elements.createInboxButton,true,'正在创建…');try{const inbox=await api('/api/admin/inboxes',{method:'POST',body:'{}'});showCreateResult(inbox);showToast(`已创建 ${inbox.email}`);await loadInboxes({selectFirst:false});if(!state.inboxes.some(x=>x.inbox_id===inbox.inbox_id))state.inboxes.unshift(inbox);await selectInbox(inbox.inbox_id);}catch(e){showToast(e.message);}finally{setBusy(elements.createInboxButton,false,'正在创建…');}});
elements.closeCreateResultButton.addEventListener('click',()=>elements.createResult.classList.add('hidden'));
elements.copyCreatedEmailButton.addEventListener('click',()=>copyText(elements.createdEmailName.textContent,'邮箱地址已复制'));
elements.copyCreatedUrlButton.addEventListener('click',()=>copyText(elements.createdInboxUrl.value,'专属链接已复制'));
elements.copyAddressButton.addEventListener('click',()=>state.selectedInbox&&copyText(state.selectedInbox.email,'邮箱地址已复制'));
elements.copyViewerUrlButton.addEventListener('click',()=>state.selectedInbox&&copyText(state.selectedInbox.viewer_url,'专属链接已复制'));
elements.inboxList.addEventListener('click',event=>{const select=event.target.closest('[data-select-inbox]');if(select)return selectInbox(select.dataset.selectInbox);const copy=event.target.closest('[data-copy-address]');if(copy){const inbox=state.inboxes.find(x=>x.inbox_id===copy.dataset.copyAddress);if(inbox)copyText(inbox.email||inbox.inbox_id,'邮箱地址已复制');return;}const del=event.target.closest('[data-delete-inbox]');if(del)deleteInbox(del.dataset.deleteInbox);});
elements.messageList.addEventListener('click',event=>{const button=event.target.closest('[data-message-id]');if(button)openMessage(button.dataset.messageId);});
elements.refreshMessagesButton.addEventListener('click',loadMessages);elements.refreshAllButton.addEventListener('click',async()=>{await checkHealth();await loadInboxes();});
elements.messageSearchInput.addEventListener('input',()=>{clearTimeout(state.searchTimer);state.searchTimer=setTimeout(loadMessages,350);});
await checkHealth();await loadInboxes();
