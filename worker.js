const INDEX_HTML = "<!doctype html>\n<html lang=\"zh-CN\">\n<head>\n  <meta charset=\"utf-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n  <meta name=\"color-scheme\" content=\"light dark\" />\n  <meta name=\"description\" content=\"一键创建随机 AgentMail 邮箱并通过专属 URL 查看邮件。\" />\n  <title>随机邮箱控制台</title>\n  <link rel=\"stylesheet\" href=\"/style.css\" />\n</head>\n<body>\n  <div class=\"app-shell\">\n    <header class=\"topbar\">\n      <div>\n        <p class=\"eyebrow\">AGENTMAIL 邮箱控制台</p>\n        <h1>随机邮箱控制台</h1>\n      </div>\n      <div class=\"topbar-actions\">\n        <span id=\"connectionStatus\" class=\"status-pill\">正在检查连接…</span>\n        <button id=\"refreshAllButton\" class=\"button ghost\" type=\"button\">刷新</button>\n      </div>\n    </header>\n\n    <main class=\"layout\">\n      <aside class=\"sidebar panel\">\n        <div class=\"panel-header create-header\">\n          <div>\n            <p class=\"label\">邮箱列表</p>\n            <h2>我的邮箱</h2>\n          </div>\n          <button id=\"createInboxButton\" class=\"button primary create-random-button\" type=\"button\">\n            ＋ 创建随机邮箱\n          </button>\n        </div>\n\n        <section id=\"createResult\" class=\"create-result hidden\" aria-live=\"polite\">\n          <div class=\"result-heading\">\n            <div>\n              <p class=\"label success-label\">创建成功</p>\n              <h3>随机邮箱已生成</h3>\n            </div>\n            <button id=\"closeCreateResultButton\" class=\"result-close\" type=\"button\" aria-label=\"关闭创建结果\">×</button>\n          </div>\n\n          <div class=\"result-field\">\n            <span>邮箱名称</span>\n            <div class=\"result-value-row\">\n              <code id=\"createdEmailName\"></code>\n              <button id=\"copyCreatedEmailButton\" class=\"button ghost compact\" type=\"button\">复制</button>\n            </div>\n          </div>\n\n          <div class=\"result-field\">\n            <span>查看邮件链接</span>\n            <div class=\"result-url-box\">\n              <input id=\"createdInboxUrl\" type=\"text\" readonly aria-label=\"查看邮件链接\" />\n              <div class=\"result-actions\">\n                <button id=\"copyCreatedUrlButton\" class=\"button ghost\" type=\"button\">复制链接</button>\n                <a id=\"openCreatedUrlButton\" class=\"button primary link-button\" href=\"#\" target=\"_blank\" rel=\"noopener noreferrer\">打开查看</a>\n              </div>\n            </div>\n          </div>\n        </section>\n\n        <div id=\"inboxList\" class=\"inbox-list\" aria-live=\"polite\"></div>\n      </aside>\n\n      <section class=\"messages panel\">\n        <div class=\"panel-header messages-header\">\n          <div class=\"truncate\">\n            <p class=\"label\">当前邮箱</p>\n            <h2 id=\"selectedInboxTitle\">请选择一个邮箱</h2>\n          </div>\n          <button id=\"copyAddressButton\" class=\"button ghost hidden\" type=\"button\">复制地址</button>\n        </div>\n\n        <div class=\"toolbar\">\n          <input id=\"messageSearchInput\" type=\"search\" placeholder=\"搜索发件人或主题\" aria-label=\"搜索邮件\" />\n          <button id=\"refreshMessagesButton\" class=\"button ghost\" type=\"button\">刷新邮件</button>\n        </div>\n\n        <div id=\"messageList\" class=\"message-list empty-state\">\n          <div>\n            <div class=\"empty-icon\">✉</div>\n            <p>选择左侧邮箱后查看邮件</p>\n          </div>\n        </div>\n      </section>\n\n      <section class=\"viewer panel\">\n        <div id=\"messageViewer\" class=\"viewer-empty\">\n          <div>\n            <div class=\"empty-icon\">⌁</div>\n            <p>点击一封邮件查看正文</p>\n          </div>\n        </div>\n      </section>\n    </main>\n  </div>\n\n  <div id=\"toast\" class=\"toast\" role=\"status\" aria-live=\"polite\"></div>\n  <script type=\"module\" src=\"/app.js\"></script>\n</body>\n</html>\n";
const STYLE_CSS = ":root {\n  --bg: #f5f7fb;\n  --panel: rgba(255, 255, 255, 0.94);\n  --panel-strong: #ffffff;\n  --text: #172033;\n  --muted: #6c768a;\n  --border: #e3e8f1;\n  --primary: #635bff;\n  --primary-strong: #5147f2;\n  --primary-soft: #efefff;\n  --success: #0f9f68;\n  --danger: #d9485f;\n  --shadow: 0 16px 45px rgba(31, 45, 73, 0.08);\n}\n\n* { box-sizing: border-box; }\nhtml, body { min-height: 100%; }\nbody {\n  margin: 0;\n  font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif;\n  color: var(--text);\n  background:\n    radial-gradient(circle at 10% 0%, rgba(99, 91, 255, 0.12), transparent 28rem),\n    var(--bg);\n}\nbutton, input { font: inherit; }\nbutton { cursor: pointer; }\n\n.app-shell { max-width: 1600px; margin: 0 auto; padding: 24px; }\n.topbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 20px;\n  margin-bottom: 18px;\n}\n.topbar h1 { margin: 2px 0 0; font-size: clamp(24px, 3vw, 34px); letter-spacing: -0.04em; }\n.eyebrow, .label {\n  margin: 0;\n  color: var(--muted);\n  font-size: 11px;\n  font-weight: 800;\n  letter-spacing: 0.12em;\n  text-transform: uppercase;\n}\n.topbar-actions { display: flex; align-items: center; gap: 10px; }\n\n.layout {\n  display: grid;\n  grid-template-columns: minmax(260px, 0.8fr) minmax(320px, 1fr) minmax(420px, 1.55fr);\n  gap: 14px;\n  min-height: calc(100vh - 120px);\n}\n.panel {\n  min-width: 0;\n  overflow: hidden;\n  border: 1px solid rgba(227, 232, 241, 0.9);\n  border-radius: 20px;\n  background: var(--panel);\n  box-shadow: var(--shadow);\n  backdrop-filter: blur(18px);\n}\n.panel-header {\n  min-height: 82px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  padding: 18px;\n  border-bottom: 1px solid var(--border);\n}\n.panel-header h2 { margin: 4px 0 0; font-size: 18px; }\n\n.button, .icon-button {\n  border: 0;\n  border-radius: 12px;\n  font-weight: 700;\n  transition: 160ms ease;\n}\n.button { padding: 10px 14px; }\n.button:disabled, .icon-button:disabled { opacity: 0.5; cursor: not-allowed; }\n.button.primary { background: var(--primary); color: #fff; }\n.button.primary:hover:not(:disabled) { background: var(--primary-strong); transform: translateY(-1px); }\n.button.ghost { background: #f1f3f8; color: var(--text); }\n.button.ghost:hover:not(:disabled) { background: #e8ebf2; }\n.icon-button {\n  width: 38px;\n  height: 38px;\n  display: grid;\n  place-items: center;\n  background: var(--primary);\n  color: #fff;\n  font-size: 24px;\n  line-height: 1;\n}\n\n.status-pill {\n  display: inline-flex;\n  align-items: center;\n  gap: 7px;\n  border-radius: 999px;\n  padding: 8px 11px;\n  background: #eef1f6;\n  color: var(--muted);\n  font-size: 12px;\n  font-weight: 800;\n}\n.status-pill::before { content: \"\"; width: 8px; height: 8px; border-radius: 50%; background: currentColor; }\n.status-pill.online { color: var(--success); background: #e9f8f2; }\n.status-pill.offline { color: var(--danger); background: #fff0f2; }\n\n.create-form {\n  display: grid;\n  gap: 12px;\n  padding: 16px 18px;\n  background: #fafbfe;\n  border-bottom: 1px solid var(--border);\n}\n.create-form label { display: grid; gap: 6px; }\n.create-form label span { font-size: 12px; color: var(--muted); font-weight: 700; }\ninput {\n  width: 100%;\n  border: 1px solid var(--border);\n  border-radius: 12px;\n  padding: 11px 12px;\n  color: var(--text);\n  background: var(--panel-strong);\n  outline: none;\n}\ninput:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99, 91, 255, 0.12); }\n.form-actions { display: flex; justify-content: flex-end; gap: 8px; }\n.hidden { display: none !important; }\n\n.inbox-list, .message-list { overflow-y: auto; }\n.inbox-list { max-height: calc(100vh - 205px); padding: 8px; }\n.inbox-item, .message-item {\n  width: 100%;\n  text-align: left;\n  border: 0;\n  background: transparent;\n  color: inherit;\n}\n.inbox-item {\n  display: grid;\n  gap: 4px;\n  padding: 13px 12px;\n  border-radius: 14px;\n}\n.inbox-item:hover { background: #f3f5fa; }\n.inbox-item.active { background: var(--primary-soft); }\n.inbox-item .address { font-weight: 800; overflow-wrap: anywhere; }\n.inbox-item .meta { color: var(--muted); font-size: 12px; }\n\n.messages { display: grid; grid-template-rows: auto auto 1fr; }\n.messages-header { min-width: 0; }\n.truncate { min-width: 0; }\n.truncate h2 { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.toolbar { display: flex; gap: 8px; padding: 12px; border-bottom: 1px solid var(--border); }\n.toolbar input { min-width: 0; }\n.message-list { min-height: 0; }\n.message-item {\n  display: grid;\n  gap: 7px;\n  padding: 15px 16px;\n  border-bottom: 1px solid var(--border);\n}\n.message-item:hover { background: #f8f9fc; }\n.message-item.active { background: var(--primary-soft); }\n.message-row { display: flex; justify-content: space-between; gap: 12px; }\n.message-from, .message-subject { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.message-from { font-weight: 800; }\n.message-time { flex: 0 0 auto; font-size: 12px; color: var(--muted); }\n.message-subject { font-weight: 700; }\n.message-preview { color: var(--muted); font-size: 13px; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }\n\n.viewer { overflow-y: auto; }\n.viewer-empty, .empty-state {\n  min-height: 100%;\n  display: grid;\n  place-items: center;\n  color: var(--muted);\n  text-align: center;\n}\n.empty-icon { font-size: 42px; opacity: 0.5; margin-bottom: 8px; }\n.message-detail { min-height: 100%; }\n.message-detail-header { padding: 24px; border-bottom: 1px solid var(--border); }\n.message-detail-header h2 { margin: 0 0 16px; font-size: 24px; line-height: 1.25; }\n.message-meta { display: grid; gap: 7px; color: var(--muted); font-size: 13px; }\n.message-meta strong { color: var(--text); }\n.message-body { padding: 24px; line-height: 1.7; overflow-wrap: anywhere; }\n.message-body pre { white-space: pre-wrap; font: inherit; margin: 0; }\n.message-body a { color: var(--primary); }\n.message-body table { max-width: 100%; border-collapse: collapse; }\n.message-body td, .message-body th { border: 1px solid var(--border); padding: 6px; }\n.attachments { margin-top: 18px; padding-top: 16px; border-top: 1px dashed var(--border); }\n.attachment-chip { display: inline-flex; margin: 5px 5px 0 0; padding: 7px 9px; border-radius: 999px; background: #f1f3f8; font-size: 12px; }\n\n.loading-row, .error-box { margin: 14px; padding: 14px; border-radius: 12px; color: var(--muted); text-align: center; }\n.error-box { background: #fff0f2; color: var(--danger); }\n.toast {\n  position: fixed;\n  left: 50%;\n  bottom: 24px;\n  transform: translate(-50%, 18px);\n  opacity: 0;\n  pointer-events: none;\n  z-index: 10;\n  max-width: min(520px, calc(100vw - 32px));\n  padding: 12px 16px;\n  border-radius: 12px;\n  background: #172033;\n  color: #fff;\n  box-shadow: var(--shadow);\n  transition: 180ms ease;\n}\n.toast.show { opacity: 1; transform: translate(-50%, 0); }\n\n@media (max-width: 1050px) {\n  .layout { grid-template-columns: 300px 1fr; }\n  .viewer { grid-column: 1 / -1; min-height: 520px; }\n}\n@media (max-width: 720px) {\n  .app-shell { padding: 12px; }\n  .topbar { align-items: flex-start; }\n  .topbar-actions { flex-direction: column; align-items: flex-end; }\n  .layout { display: block; }\n  .panel { margin-bottom: 12px; min-height: 420px; }\n  .sidebar { min-height: auto; }\n  .inbox-list { max-height: 340px; }\n  .viewer { min-height: 520px; }\n}\n\n@media (prefers-color-scheme: dark) {\n  :root {\n    --bg: #0f1320;\n    --panel: rgba(21, 27, 43, 0.94);\n    --panel-strong: #171d2c;\n    --text: #eef1f7;\n    --muted: #99a3b7;\n    --border: #2a3348;\n    --primary-soft: rgba(99, 91, 255, 0.18);\n    --shadow: 0 16px 45px rgba(0, 0, 0, 0.22);\n  }\n  body { background: radial-gradient(circle at 10% 0%, rgba(99, 91, 255, 0.2), transparent 28rem), var(--bg); }\n  .button.ghost, .attachment-chip, .status-pill { background: #242c3f; }\n  .button.ghost:hover:not(:disabled) { background: #2d374d; }\n  .create-form { background: #131928; }\n  .inbox-item:hover, .message-item:hover { background: #1d2435; }\n}\n\n/* 一键随机创建与创建结果 */\n.create-header {\n  align-items: center;\n}\n.create-random-button {\n  white-space: nowrap;\n}\n.create-result {\n  margin: 12px;\n  padding: 16px;\n  border: 1px solid rgba(15, 159, 104, 0.28);\n  border-radius: 16px;\n  background: rgba(15, 159, 104, 0.08);\n}\n.result-heading {\n  display: flex;\n  align-items: flex-start;\n  justify-content: space-between;\n  gap: 12px;\n  margin-bottom: 14px;\n}\n.result-heading h3 {\n  margin: 4px 0 0;\n  font-size: 16px;\n}\n.success-label { color: var(--success); }\n.result-close {\n  width: 30px;\n  height: 30px;\n  display: grid;\n  place-items: center;\n  border: 0;\n  border-radius: 9px;\n  background: transparent;\n  color: var(--muted);\n  font-size: 22px;\n  line-height: 1;\n}\n.result-close:hover { background: rgba(15, 159, 104, 0.12); }\n.result-field {\n  display: grid;\n  gap: 7px;\n  margin-top: 12px;\n}\n.result-field > span {\n  color: var(--muted);\n  font-size: 12px;\n  font-weight: 800;\n}\n.result-value-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.result-value-row code {\n  min-width: 0;\n  flex: 1;\n  overflow-wrap: anywhere;\n  padding: 10px 11px;\n  border-radius: 11px;\n  background: var(--panel-strong);\n  color: var(--text);\n  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\n  font-size: 13px;\n}\n.result-url-box {\n  display: grid;\n  gap: 8px;\n}\n.result-url-box input {\n  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;\n  font-size: 12px;\n}\n.result-actions {\n  display: flex;\n  gap: 8px;\n}\n.result-actions > * { flex: 1; }\n.button.compact { padding: 8px 10px; }\n.link-button {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  text-decoration: none;\n}\n\n@media (max-width: 1250px) {\n  .create-header {\n    align-items: flex-start;\n    flex-direction: column;\n  }\n  .create-random-button { width: 100%; }\n}\n\n@media (max-width: 720px) {\n  .create-header {\n    flex-direction: row;\n    align-items: center;\n  }\n  .create-random-button {\n    width: auto;\n    padding: 9px 11px;\n    font-size: 13px;\n  }\n}\n";
const APP_JS = "const state = {\n  inboxes: [],\n  selectedInbox: null,\n  messages: [],\n  selectedMessageId: null,\n  searchTimer: null,\n  requestedInboxId: new URLSearchParams(window.location.search).get('inbox')\n};\n\nconst elements = {\n  connectionStatus: document.querySelector('#connectionStatus'),\n  refreshAllButton: document.querySelector('#refreshAllButton'),\n  createInboxButton: document.querySelector('#createInboxButton'),\n  createResult: document.querySelector('#createResult'),\n  closeCreateResultButton: document.querySelector('#closeCreateResultButton'),\n  createdEmailName: document.querySelector('#createdEmailName'),\n  createdInboxUrl: document.querySelector('#createdInboxUrl'),\n  copyCreatedEmailButton: document.querySelector('#copyCreatedEmailButton'),\n  copyCreatedUrlButton: document.querySelector('#copyCreatedUrlButton'),\n  openCreatedUrlButton: document.querySelector('#openCreatedUrlButton'),\n  inboxList: document.querySelector('#inboxList'),\n  selectedInboxTitle: document.querySelector('#selectedInboxTitle'),\n  copyAddressButton: document.querySelector('#copyAddressButton'),\n  messageSearchInput: document.querySelector('#messageSearchInput'),\n  refreshMessagesButton: document.querySelector('#refreshMessagesButton'),\n  messageList: document.querySelector('#messageList'),\n  messageViewer: document.querySelector('#messageViewer'),\n  toast: document.querySelector('#toast')\n};\n\nasync function api(path, options = {}) {\n  const response = await fetch(path, {\n    ...options,\n    headers: {\n      Accept: 'application/json',\n      ...(options.body ? { 'Content-Type': 'application/json' } : {}),\n      ...options.headers\n    }\n  });\n\n  let payload;\n  try {\n    payload = await response.json();\n  } catch {\n    payload = { error: '服务器返回了无法解析的内容。' };\n  }\n\n  if (!response.ok) {\n    throw new Error(payload.error || `请求失败（${response.status}）`);\n  }\n  return payload;\n}\n\nfunction escapeHtml(value = '') {\n  return String(value)\n    .replaceAll('&', '&amp;')\n    .replaceAll('<', '&lt;')\n    .replaceAll('>', '&gt;')\n    .replaceAll('\"', '&quot;')\n    .replaceAll(\"'\", '&#039;');\n}\n\nfunction formatDate(value, includeTime = true) {\n  if (!value) return '未知时间';\n  const date = new Date(value);\n  if (Number.isNaN(date.getTime())) return String(value);\n  return new Intl.DateTimeFormat('zh-CN', {\n    month: 'short',\n    day: 'numeric',\n    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),\n    hour12: false\n  }).format(date);\n}\n\nfunction showToast(message) {\n  elements.toast.textContent = message;\n  elements.toast.classList.add('show');\n  window.clearTimeout(showToast.timer);\n  showToast.timer = window.setTimeout(() => elements.toast.classList.remove('show'), 2400);\n}\n\nfunction setBusy(button, busy, label) {\n  button.disabled = busy;\n  if (!button.dataset.originalText) button.dataset.originalText = button.textContent.trim();\n  button.textContent = busy ? label : button.dataset.originalText;\n}\n\nfunction buildInboxUrl(inboxId) {\n  const url = new URL(window.location.href);\n  url.search = '';\n  url.hash = '';\n  url.searchParams.set('inbox', inboxId);\n  return url.toString();\n}\n\nfunction updateBrowserInboxUrl(inboxId) {\n  const url = new URL(window.location.href);\n  url.searchParams.set('inbox', inboxId);\n  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);\n}\n\nasync function copyText(value, successMessage) {\n  try {\n    await navigator.clipboard.writeText(value);\n    showToast(successMessage);\n  } catch {\n    showToast('复制失败，请手动复制');\n  }\n}\n\nfunction showCreateResult(inbox) {\n  const email = inbox.email || inbox.inbox_id;\n  const viewerUrl = buildInboxUrl(inbox.inbox_id);\n  elements.createdEmailName.textContent = email;\n  elements.createdInboxUrl.value = viewerUrl;\n  elements.openCreatedUrlButton.href = viewerUrl;\n  elements.createResult.classList.remove('hidden');\n}\n\nfunction renderInboxes() {\n  if (!state.inboxes.length) {\n    elements.inboxList.innerHTML = '<div class=\"loading-row\">暂无邮箱，点击“创建随机邮箱”立即生成。</div>';\n    return;\n  }\n\n  elements.inboxList.innerHTML = state.inboxes.map((inbox) => `\n    <button class=\"inbox-item ${state.selectedInbox?.inbox_id === inbox.inbox_id ? 'active' : ''}\"\n      type=\"button\" data-inbox-id=\"${escapeHtml(inbox.inbox_id)}\">\n      <span class=\"address\">${escapeHtml(inbox.email || inbox.inbox_id)}</span>\n      <span class=\"meta\">${escapeHtml(inbox.display_name || '随机邮箱')} · ${formatDate(inbox.created_at, false)}</span>\n    </button>\n  `).join('');\n}\n\nfunction renderMessages() {\n  if (!state.selectedInbox) {\n    elements.messageList.className = 'message-list empty-state';\n    elements.messageList.innerHTML = '<div><div class=\"empty-icon\">✉</div><p>选择左侧邮箱后查看邮件</p></div>';\n    return;\n  }\n\n  elements.messageList.className = 'message-list';\n  if (!state.messages.length) {\n    elements.messageList.innerHTML = '<div class=\"loading-row\">这个邮箱暂时还没有邮件。</div>';\n    return;\n  }\n\n  elements.messageList.innerHTML = state.messages.map((message) => `\n    <button class=\"message-item ${state.selectedMessageId === message.message_id ? 'active' : ''}\"\n      type=\"button\" data-message-id=\"${escapeHtml(message.message_id)}\">\n      <span class=\"message-row\">\n        <span class=\"message-from\">${escapeHtml(message.from || '未知发件人')}</span>\n        <span class=\"message-time\">${formatDate(message.timestamp || message.created_at)}</span>\n      </span>\n      <span class=\"message-subject\">${escapeHtml(message.subject || '（无主题）')}</span>\n      <span class=\"message-preview\">${escapeHtml(message.preview || '暂无预览')}</span>\n    </button>\n  `).join('');\n}\n\nfunction renderMessageDetail(message) {\n  const textBody = message.text || message.preview || '这封邮件没有可显示的正文。';\n  const body = `<div class=\"message-body\"><pre>${escapeHtml(textBody)}</pre></div>`;\n  const attachments = Array.isArray(message.attachments) && message.attachments.length\n    ? `<div class=\"attachments\"><strong>附件</strong><div>${message.attachments.map((item) =>\n      `<span class=\"attachment-chip\">${escapeHtml(item.filename || '未命名附件')} (${Math.ceil((item.size || 0) / 1024)} KB)</span>`\n    ).join('')}</div></div>`\n    : '';\n\n  elements.messageViewer.className = 'message-detail';\n  elements.messageViewer.innerHTML = `\n    <header class=\"message-detail-header\">\n      <h2>${escapeHtml(message.subject || '（无主题）')}</h2>\n      <div class=\"message-meta\">\n        <div><strong>发件人：</strong>${escapeHtml(message.from || '未知')}</div>\n        <div><strong>收件人：</strong>${escapeHtml((message.to || []).join(', ') || '未知')}</div>\n        <div><strong>时间：</strong>${escapeHtml(formatDate(message.timestamp || message.created_at))}</div>\n      </div>\n    </header>\n    ${body}\n    <div class=\"message-body\">${attachments}</div>\n  `;\n}\n\nasync function checkHealth() {\n  try {\n    const result = await api('/api/health');\n    if (result.configured) {\n      elements.connectionStatus.textContent = '服务已连接';\n      elements.connectionStatus.className = 'status-pill online';\n    } else {\n      elements.connectionStatus.textContent = '未配置密钥';\n      elements.connectionStatus.className = 'status-pill offline';\n    }\n  } catch {\n    elements.connectionStatus.textContent = '服务不可用';\n    elements.connectionStatus.className = 'status-pill offline';\n  }\n}\n\nasync function loadInboxes({ preserveSelection = true, autoSelect = true } = {}) {\n  elements.inboxList.innerHTML = '<div class=\"loading-row\">正在加载邮箱…</div>';\n  try {\n    const data = await api('/api/inboxes?limit=100');\n    state.inboxes = data.inboxes || [];\n\n    if (preserveSelection && state.selectedInbox) {\n      state.selectedInbox = state.inboxes.find((item) => item.inbox_id === state.selectedInbox.inbox_id) || null;\n    }\n    renderInboxes();\n\n    if (!state.selectedInbox && autoSelect) {\n      const requestedInbox = state.requestedInboxId\n        ? state.inboxes.find((item) => item.inbox_id === state.requestedInboxId)\n        : null;\n      const inboxToSelect = requestedInbox || state.inboxes[0];\n      if (inboxToSelect) await selectInbox(inboxToSelect.inbox_id);\n      if (state.requestedInboxId && !requestedInbox) showToast('链接对应的邮箱不存在或已不可用');\n      state.requestedInboxId = null;\n    }\n  } catch (error) {\n    elements.inboxList.innerHTML = `<div class=\"error-box\">${escapeHtml(error.message)}</div>`;\n    showToast(error.message);\n  }\n}\n\nasync function selectInbox(inboxId) {\n  const inbox = state.inboxes.find((item) => item.inbox_id === inboxId);\n  if (!inbox) return;\n  state.selectedInbox = inbox;\n  state.selectedMessageId = null;\n  elements.selectedInboxTitle.textContent = inbox.email || inbox.inbox_id;\n  elements.copyAddressButton.classList.remove('hidden');\n  elements.messageViewer.className = 'viewer-empty';\n  elements.messageViewer.innerHTML = '<div><div class=\"empty-icon\">⌁</div><p>点击一封邮件查看正文</p></div>';\n  updateBrowserInboxUrl(inbox.inbox_id);\n  renderInboxes();\n  await loadMessages();\n}\n\nasync function loadMessages() {\n  if (!state.selectedInbox) return;\n  elements.messageList.className = 'message-list';\n  elements.messageList.innerHTML = '<div class=\"loading-row\">正在加载邮件…</div>';\n  const search = elements.messageSearchInput.value.trim();\n  const params = new URLSearchParams({ limit: '100' });\n\n  try {\n    let data;\n    if (search) {\n      // AgentMail 同时按发件人和主题搜索时会要求两个条件都匹配，因此这里分别搜索后合并去重。\n      const subjectParams = new URLSearchParams({ limit: '100', subject: search });\n      const fromParams = new URLSearchParams({ limit: '100', from: search });\n      const [subjectResult, fromResult] = await Promise.all([\n        api(`/api/inboxes/${encodeURIComponent(state.selectedInbox.inbox_id)}/messages?${subjectParams}`),\n        api(`/api/inboxes/${encodeURIComponent(state.selectedInbox.inbox_id)}/messages?${fromParams}`)\n      ]);\n      const combined = [...(subjectResult.messages || []), ...(fromResult.messages || [])];\n      data = { messages: [...new Map(combined.map((item) => [item.message_id, item])).values()] };\n    } else {\n      data = await api(`/api/inboxes/${encodeURIComponent(state.selectedInbox.inbox_id)}/messages?${params}`);\n    }\n    state.messages = (data.messages || []).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));\n    renderMessages();\n  } catch (error) {\n    elements.messageList.innerHTML = `<div class=\"error-box\">${escapeHtml(error.message)}</div>`;\n    showToast(error.message);\n  }\n}\n\nasync function openMessage(messageId) {\n  if (!state.selectedInbox) return;\n  state.selectedMessageId = messageId;\n  renderMessages();\n  elements.messageViewer.className = 'viewer-empty';\n  elements.messageViewer.innerHTML = '<div><p>正在加载邮件正文…</p></div>';\n\n  try {\n    const message = await api(\n      `/api/inboxes/${encodeURIComponent(state.selectedInbox.inbox_id)}/messages/${encodeURIComponent(messageId)}`\n    );\n    renderMessageDetail(message);\n  } catch (error) {\n    elements.messageViewer.className = 'viewer-empty';\n    elements.messageViewer.innerHTML = `<div class=\"error-box\">${escapeHtml(error.message)}</div>`;\n    showToast(error.message);\n  }\n}\n\nelements.createInboxButton.addEventListener('click', async () => {\n  setBusy(elements.createInboxButton, true, '正在创建…');\n  try {\n    // 不指定邮箱前缀和域名，让 AgentMail 自动生成随机邮箱。\n    const inbox = await api('/api/inboxes', {\n      method: 'POST',\n      body: JSON.stringify({})\n    });\n\n    showCreateResult(inbox);\n    showToast(`已创建 ${inbox.email || inbox.inbox_id}`);\n    await loadInboxes({ preserveSelection: false, autoSelect: false });\n\n    const exists = state.inboxes.some((item) => item.inbox_id === inbox.inbox_id);\n    if (!exists) state.inboxes.unshift(inbox);\n    await selectInbox(inbox.inbox_id);\n  } catch (error) {\n    showToast(error.message);\n  } finally {\n    setBusy(elements.createInboxButton, false, '正在创建…');\n  }\n});\n\nelements.closeCreateResultButton.addEventListener('click', () => {\n  elements.createResult.classList.add('hidden');\n});\n\nelements.copyCreatedEmailButton.addEventListener('click', () => {\n  copyText(elements.createdEmailName.textContent, '邮箱名称已复制');\n});\n\nelements.copyCreatedUrlButton.addEventListener('click', () => {\n  copyText(elements.createdInboxUrl.value, '查看邮件链接已复制');\n});\n\nelements.inboxList.addEventListener('click', (event) => {\n  const button = event.target.closest('[data-inbox-id]');\n  if (button) selectInbox(button.dataset.inboxId);\n});\n\nelements.messageList.addEventListener('click', (event) => {\n  const button = event.target.closest('[data-message-id]');\n  if (button) openMessage(button.dataset.messageId);\n});\n\nelements.copyAddressButton.addEventListener('click', () => {\n  if (state.selectedInbox?.email) copyText(state.selectedInbox.email, '邮箱地址已复制');\n});\n\nelements.refreshMessagesButton.addEventListener('click', loadMessages);\nelements.refreshAllButton.addEventListener('click', async () => {\n  await checkHealth();\n  await loadInboxes();\n});\n\nelements.messageSearchInput.addEventListener('input', () => {\n  window.clearTimeout(state.searchTimer);\n  state.searchTimer = window.setTimeout(loadMessages, 350);\n});\n\nawait checkHealth();\nawait loadInboxes();\n";

const DEFAULT_AGENTMAIL_BASE_URL = 'https://api.agentmail.to/v0';
const API_TIMEOUT_MS = 15_000;
const JSON_BODY_LIMIT = 32 * 1024;

const SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "connect-src 'self'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Referrer-Policy': 'same-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY'
};

function json(payload, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...SECURITY_HEADERS,
      ...extraHeaders
    }
  });
}

function text(message, status = 200, extraHeaders = {}) {
  return new Response(message, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      ...SECURITY_HEADERS,
      ...extraHeaders
    }
  });
}

function withSecurityHeaders(response, isApi = false) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) headers.set(name, value);
  if (isApi) headers.set('Cache-Control', 'no-store');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function unauthorized() {
  return text('需要登录或用户名、密码错误。', 401, {
    'WWW-Authenticate': 'Basic realm="邮箱控制台", charset="UTF-8"'
  });
}

async function constantTimeEqual(left, right) {
  const encoder = new TextEncoder();
  const [leftDigest, rightDigest] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(String(left))),
    crypto.subtle.digest('SHA-256', encoder.encode(String(right)))
  ]);
  const leftBytes = new Uint8Array(leftDigest);
  const rightBytes = new Uint8Array(rightDigest);
  let difference = leftBytes.length ^ rightBytes.length;
  for (let index = 0; index < leftBytes.length; index += 1) {
    difference |= leftBytes[index] ^ rightBytes[index];
  }
  return difference === 0;
}

async function isAuthorized(request, env) {
  const username = env.APP_USERNAME?.trim();
  const password = env.APP_PASSWORD;
  if (!username || !password) return true;

  const authorization = request.headers.get('Authorization') || '';
  if (!authorization.startsWith('Basic ')) return false;

  try {
    const decoded = atob(authorization.slice(6));
    const separatorIndex = decoded.indexOf(':');
    if (separatorIndex < 0) return false;
    const suppliedUsername = decoded.slice(0, separatorIndex);
    const suppliedPassword = decoded.slice(separatorIndex + 1);
    const [usernameMatches, passwordMatches] = await Promise.all([
      constantTimeEqual(suppliedUsername, username),
      constantTimeEqual(suppliedPassword, password)
    ]);
    return usernameMatches && passwordMatches;
  } catch {
    return false;
  }
}

function createHttpError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function safeId(value, fieldName) {
  if (
    typeof value !== 'string' ||
    value.length < 1 ||
    value.length > 256 ||
    value.includes('/') ||
    value.includes('\\') ||
    !/^[\p{L}\p{N}_.+@:=\-]+$/u.test(value)
  ) {
    throw createHttpError(`${fieldName} 格式不正确。`, 400);
  }
  return value;
}

function boundedInteger(value, fallback, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.trunc(parsed), min), max);
}

async function readJsonBody(request) {
  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > JSON_BODY_LIMIT) throw createHttpError('请求内容过大。', 413);

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > JSON_BODY_LIMIT) {
    throw createHttpError('请求内容过大。', 413);
  }
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
      throw new Error('not an object');
    }
    return parsed;
  } catch {
    throw createHttpError('请求数据格式不正确。', 400);
  }
}

function cleanOptionalText(value, maxLength, fieldName) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') throw createHttpError(`${fieldName} 必须是文本。`, 400);
  const cleaned = value.trim();
  if (!cleaned || cleaned.length > maxLength) {
    throw createHttpError(`${fieldName} 长度不正确。`, 400);
  }
  return cleaned;
}

function decodeHtmlEntities(value) {
  const named = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' '
  };
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    const lower = entity.toLowerCase();
    if (lower.startsWith('#x')) {
      const code = Number.parseInt(lower.slice(2), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    if (lower.startsWith('#')) {
      const code = Number.parseInt(lower.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return named[lower] ?? match;
  });
}

function htmlToPlainText(html) {
  if (typeof html !== 'string' || !html) return '';
  return decodeHtmlEntities(
    html
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<(script|style|svg|math|iframe|object|embed|form)[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
      .replace(/<(br|hr)\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|tr|h[1-6])\s*>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\r/g, '')
    .replace(/[\t ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function sanitizeMessage(message) {
  const plainText =
    message.text ||
    message.extracted_text ||
    htmlToPlainText(message.html || message.extracted_html || '') ||
    message.preview ||
    '';

  const { html, extracted_html, headers, raw, ...safeMessage } = message;
  return {
    ...safeMessage,
    text: String(plainText).slice(0, 500_000),
    extracted_text: undefined
  };
}

async function agentMailRequest(env, endpoint, options = {}) {
  const apiKey = env.AGENTMAIL_API_KEY?.trim();
  if (!apiKey) throw createHttpError('服务端尚未配置 AGENTMAIL_API_KEY。', 503);

  const baseUrl = (env.AGENTMAIL_BASE_URL || DEFAULT_AGENTMAIL_BASE_URL).replace(/\/$/, '');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {})
      },
      signal: controller.signal
    });

    const contentType = response.headers.get('Content-Type') || '';
    let payload;
    if (contentType.includes('application/json')) {
      payload = await response.json().catch(() => ({}));
    } else {
      payload = { message: await response.text() };
    }

    if (!response.ok) {
      const errorMessage =
        payload?.message || payload?.detail || payload?.error || `AgentMail 接口返回 ${response.status}`;
      const exposedStatus = response.status >= 400 && response.status < 500 ? response.status : 502;
      throw createHttpError(String(errorMessage), exposedStatus);
    }

    return payload;
  } catch (error) {
    if (error?.name === 'AbortError' || error === 'timeout') {
      throw createHttpError('AgentMail 接口响应超时。', 504);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function pathParts(pathname) {
  return pathname
    .split('/')
    .filter(Boolean)
    .map((part) => {
      try {
        return decodeURIComponent(part);
      } catch {
        throw createHttpError('URL 编码不正确。', 400);
      }
    });
}

async function handleApi(request, env, url) {
  const parts = pathParts(url.pathname);

  if (request.method === 'GET' && url.pathname === '/api/health') {
    return json({
      ok: true,
      configured: Boolean(env.AGENTMAIL_API_KEY?.trim()),
      provider: 'AgentMail',
      runtime: 'Cloudflare Workers（云端运行环境）'
    });
  }

  if (request.method === 'GET' && parts.length === 2 && parts[0] === 'api' && parts[1] === 'inboxes') {
    const query = new URLSearchParams({
      limit: String(boundedInteger(url.searchParams.get('limit'), 50, 1, 100))
    });
    const pageToken = url.searchParams.get('page_token');
    if (pageToken) query.set('page_token', pageToken.slice(0, 500));
    return json(await agentMailRequest(env, `/inboxes?${query}`));
  }

  if (request.method === 'POST' && parts.length === 2 && parts[0] === 'api' && parts[1] === 'inboxes') {
    const requestBody = await readJsonBody(request);
    const username = cleanOptionalText(requestBody.username, 64, '邮箱前缀');
    const domain = cleanOptionalText(requestBody.domain, 253, '域名');
    const displayName = cleanOptionalText(requestBody.display_name, 100, '显示名称');

    if (username && !/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(username)) {
      throw createHttpError('邮箱前缀只能包含字母、数字、点、下划线和短横线。', 400);
    }
    if (
      domain &&
      !/^(?=.{1,253}$)([A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/.test(domain)
    ) {
      throw createHttpError('域名格式不正确。', 400);
    }

    const body = Object.fromEntries(
      Object.entries({ username, domain, display_name: displayName })
        .filter(([, value]) => value !== undefined)
    );
    const data = await agentMailRequest(env, '/inboxes', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    return json(data, 201);
  }

  if (
    request.method === 'GET' &&
    parts.length === 4 &&
    parts[0] === 'api' &&
    parts[1] === 'inboxes' &&
    parts[3] === 'messages'
  ) {
    const inboxId = safeId(parts[2], '邮箱编号');
    const query = new URLSearchParams({
      limit: String(boundedInteger(url.searchParams.get('limit'), 50, 1, 100))
    });
    const pageToken = url.searchParams.get('page_token');
    const subject = url.searchParams.get('subject');
    const from = url.searchParams.get('from');
    if (pageToken) query.set('page_token', pageToken.slice(0, 500));
    if (subject) query.append('subject', subject.slice(0, 100));
    if (from) query.append('from', from.slice(0, 100));

    const data = await agentMailRequest(
      env,
      `/inboxes/${encodeURIComponent(inboxId)}/messages?${query}`
    );
    return json(data);
  }

  if (
    request.method === 'GET' &&
    parts.length === 5 &&
    parts[0] === 'api' &&
    parts[1] === 'inboxes' &&
    parts[3] === 'messages'
  ) {
    const inboxId = safeId(parts[2], '邮箱编号');
    const messageId = safeId(parts[4], '邮件编号');
    const data = await agentMailRequest(
      env,
      `/inboxes/${encodeURIComponent(inboxId)}/messages/${encodeURIComponent(messageId)}`
    );
    return json(sanitizeMessage(data));
  }

  return json({ error: '接口不存在。' }, 404);
}

export default {
  async fetch(request, env) {
    try {
      if (!(await isAuthorized(request, env))) return unauthorized();

      const url = new URL(request.url);
      if (url.pathname.startsWith('/api/')) {
        return await handleApi(request, env, url);
      }

      if (url.pathname === '/style.css') {
        return new Response(STYLE_CSS, {
          headers: {
            'Content-Type': 'text/css; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
            ...SECURITY_HEADERS
          }
        });
      }

      if (url.pathname === '/app.js') {
        return new Response(APP_JS, {
          headers: {
            'Content-Type': 'text/javascript; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
            ...SECURITY_HEADERS
          }
        });
      }

      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return text('请求方式不支持。', 405, { Allow: 'GET, HEAD' });
      }

      return new Response(request.method === 'HEAD' ? null : INDEX_HTML, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache',
          ...SECURITY_HEADERS
        }
      });
    } catch (error) {
      console.error('请求处理失败', error);
      const status = Number.isInteger(error?.status) ? error.status : 500;
      const message = status >= 500 && status !== 503 && status !== 504
        ? '服务器处理请求时发生错误。'
        : error?.message || '请求失败。';
      return json({ error: message }, status);
    }
  }
};
