/* =========================================================
   ĐẢO MÈO — LOGIC CHÍNH (IIFE #1)
   Toàn bộ logic từ Gốc.html, giữ NGUYÊN logic gốc
   ========================================================= */
(() => {
  "use strict";

  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzw3_4PFLROygfgO0-7bRPxWqdxFRUs6ll8hVF5GaW5OzIR-b0GiWk_-Sq1MgYkC9U/exec";

  // ===== Cache versioning =====
  const CACHE_SCHEMA_VERSION = 5;
  const CACHE_KEY = `srank_check_v${CACHE_SCHEMA_VERSION}`;
  const CACHE_MIGRATION_KEY = "srank_cache_migrated_to";

  // ===== Timing constants =====
  const TIMING = Object.freeze({
    WHEEL_OPEN_DELAY: 180,
    MESSAGE_NEXT_DELAY: 220,
    ROW_FLASH_MS: 1200,
    LUNCH_ROLL_START_MS: 55,
    LUNCH_ROLL_MAX_MS: 210,
    LUNCH_ROLL_TOTAL_MS: 2850,
    STATUS_TOAST_MS: 1400,
    LOCK_AFTER_SAVE_MS: 3000,
    LOCK_CHECK_INTERVAL_MS: 30000,
    LANDING_TICK_MS: 1000,
    CLOSE_ATTENDANCE_DELAY_MS: 500,
    CLOSE_ATTENDANCE_ERR_MS: 1400,
    LUNCH_STATUS_HINT_MS: 2200,
    FOCUS_DELAY_MS: 50,
    BUILDER_CLOSE_DELAY_MS: 500,
    NAME_WHEEL_STEP_PX: 58,
    QUIZ_TEACHER: 2
  });

  // ===== Admin session =====
  const ADMIN_TOKEN_KEY = "srank_admin_token_v1";
  const ADMIN_SESSION_TTL = 30 * 60 * 1000;
  const ADMIN_RATE_LIMIT_KEY = "srank_admin_rl_v1";
  const ADMIN_MAX_ATTEMPTS = 5;
  const ADMIN_LOCKOUT_MS = 5 * 60 * 1000;

  // ===== API timeout =====
  const TIMEOUT = Object.freeze({
    FAST:      8000,
    NORMAL:   12000,
    SLOW:     20000,
    DEFAULT:  12000
  });

  const root = document.getElementById("space");
  const question = document.getElementById("question");
  const counter = document.getElementById("counter");
  const wheelArea = document.getElementById("wheelArea");
  const itemsBox = document.getElementById("items");
  const confirm = document.getElementById("confirm");
  const hint = document.getElementById("hint");
  const message = document.getElementById("message");
  const checklistPanel = document.getElementById("checklistPanel");
  const checklistBody = document.querySelector("#checklist tbody");
  const status = document.getElementById("status");
  const syncBtn = document.getElementById("syncBtn");
  const homeBtn = document.getElementById("homeBtn");
  const checklistBtn = document.getElementById("checklistBtn");
  const topBtn = document.getElementById("topBtn");
  const topPanel = document.getElementById("topPanel");
  const topBody = document.querySelector("#topTable tbody");
  const topCloseBtn = document.getElementById("topCloseBtn");
  const topMonthSelect = document.getElementById("topMonthSelect");
  const topTitle = document.getElementById("topTitle");
  const adminBtn = document.getElementById("adminBtn");
  const monitorBtn = document.getElementById("monitorBtn");
  const monitorOverlay = document.getElementById("monitorOverlay");
  const monitorBody = document.querySelector("#monitorTable tbody");
  const monitorCloseBtn = document.getElementById("monitorCloseBtn");
  const quizBtn = document.getElementById("quizBtn");
  const quizAdminBtn = document.getElementById("quizAdminBtn");
  const secondaryNav = document.getElementById("secondaryNav");
  const quizOverlay = document.getElementById("quizOverlay");
  const quizClose = document.getElementById("quizClose");
  const quizLeaderboardBody = document.querySelector("#quizLeaderboard tbody");
  const quizEmpty = document.getElementById("quizEmpty");
  const startQuizBtn = document.getElementById("startQuizBtn");
  const quizNameOverlay = document.getElementById("quizNameOverlay");
  const quizNameClose = document.getElementById("quizNameClose");
  const quizNameList = document.getElementById("quizNameList");
  const quizTakeOverlay = document.getElementById("quizTakeOverlay");
  const quizProgress = document.getElementById("quizProgress");
  const quizQuestion = document.getElementById("quizQuestion");
  const quizAnswers = document.getElementById("quizAnswers");
  const quizNextBtn = document.getElementById("quizNextBtn");
  const quizResultOverlay = document.getElementById("quizResultOverlay");
  const quizResultName = document.getElementById("quizResultName");
  const quizResultScore = document.getElementById("quizResultScore");
  const quizResultDetail = document.getElementById("quizResultDetail");
  const quizResultClose = document.getElementById("quizResultClose");
  const quizBuilderOverlay = document.getElementById("quizBuilderOverlay");
  const quizBuilderClose = document.getElementById("quizBuilderClose");
  const quizBuilderList = document.getElementById("quizBuilderList");
  const addQuizQuestionBtn = document.getElementById("addQuizQuestionBtn");
  const saveQuizBtn = document.getElementById("saveQuizBtn");
  const quizBuilderStatus = document.getElementById("quizBuilderStatus");
  const kdvRulesBtn = document.getElementById("kdvRulesBtn");
  const kdvRulesOverlay = document.getElementById("kdvRulesOverlay");
  const kdvRulesClose = document.getElementById("kdvRulesClose");
  const lunchBtn = document.getElementById("lunchBtn");
  const lunchChoiceOverlay = document.getElementById("lunchChoiceOverlay");
  const lunchChoiceClose = document.getElementById("lunchChoiceClose");
  const lunchModeButtons = [...document.querySelectorAll(".lunchModeBtn")];
  const lunchAddBtn = document.getElementById("lunchAddBtn");
  const lunchAddForm = document.getElementById("lunchAddForm");
  const lunchAddInput = document.getElementById("lunchAddInput");
  const lunchAddStatus = document.getElementById("lunchAddStatus");
  const lunchResult = document.getElementById("lunchResult");
  const lunchDish = lunchResult.querySelector(".lunchDish");
  const lunchManageBtn = document.getElementById("lunchManageBtn");
  const lunchManageOverlay = document.getElementById("lunchManageOverlay");
  const lunchManageClose = document.getElementById("lunchManageClose");
  const lunchManageList = document.getElementById("lunchManageList");
  const lunchManageStatus = document.getElementById("lunchManageStatus");
  const linkEditorOverlay = document.getElementById("linkEditorOverlay");
  const linkEditorName = document.getElementById("linkEditorName");
  const linkEditorInput = document.getElementById("linkEditorInput");
  const linkEditorCancel = document.getElementById("linkEditorCancel");
  const linkEditorClear = document.getElementById("linkEditorClear");
  const linkEditorSave = document.getElementById("linkEditorSave");
  const adminOverlay = document.getElementById("adminOverlay");
  const adminPanel = document.getElementById("adminPanel");
  const resetTimeInput = document.getElementById("resetTimeInput");
  const checklistLockTimeInput = document.getElementById("checklistLockTimeInput");
  const adminStatus = document.getElementById("adminStatus");
  const adminCloseBtn = document.getElementById("adminCloseBtn");
  const adminSaveBtn = document.getElementById("adminSaveBtn");
  const adminChecklistRows = document.getElementById("adminChecklistRows");

  // Giờ reset luôn dùng định dạng 24 giờ HH:mm
  resetTimeInput.addEventListener("input", () => {
    let v = resetTimeInput.value.replace(/\D/g, "").slice(0, 4);
    if(v.length > 2) v = v.slice(0,2) + ":" + v.slice(2);
    resetTimeInput.value = v;
  });
  checklistLockTimeInput.addEventListener("input", () => {
    let v = checklistLockTimeInput.value.replace(/\D/g, "").slice(0, 4);
    if(v.length > 2) v = v.slice(0,2) + ":" + v.slice(2);
    checklistLockTimeInput.value = v;
  });
  const captureBtn = document.getElementById("captureBtn");

  let names = [];
  let checked = [];
  let times = [];
  let points = [];
  let ranks = [];
  let current = 0;
  let q1Opened = false;
  let dragging = false, startY = 0, dragOffset = 0;
  const ITEM_H = 58;

  // ===== Smooth auto-refresh =====
  let _lastUserActionAt = 0;
  const USER_ACTION_PAUSE_MS = 5000;

  const CHECKLIST_SYNC_MS = 30000;
  let _lastLockCheck = 0;
  let _cachedLocked = false;

  let _dataLoadResolve;
  const _dataLoadPromise = new Promise(r => { _dataLoadResolve = r; });
  let _dataLoadResolved = false;

  const SETTINGS_TTL = 5 * 60 * 1000;
  let settingsCache = null;
  let settingsFetchedAt = 0;
  let settingsFetchPromise = null;

  let requestSeq = 0;
  let syncInFlight = false;
  let autoSyncTimer = null;
  const AUTO_SYNC_MS = 120000;
  const AUTO_SYNC_MIN_GAP = 15000;
  let lastAutoSyncAt = 0;
  const Q1_CACHE_KEY = "srank_q1_answer_v1";
  const CHECKLIST_LOCK_KEY = "srank_checklist_lock_time_v1";
  try{ localStorage.removeItem(Q1_CACHE_KEY); }catch(_){}
  const connectionState = document.getElementById("connectionState");
  const connectionText = document.getElementById("connectionText");

  // ===== Admin Session Manager =====
  const AdminSession = (() => {
    let _token = null;
    let _expiresAt = 0;

    function load(){
      try{
        const raw = localStorage.getItem(ADMIN_TOKEN_KEY);
        if(!raw) return null;
        const data = JSON.parse(raw);
        if(!data || typeof data.token !== "string") return null;
        if(Date.now() > (data.expiresAt || 0)){
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          return null;
        }
        _token = data.token;
        _expiresAt = data.expiresAt;
        return _token;
      }catch(_){ return null; }
    }

    function save(token, expiresAt){
      _token = token;
      _expiresAt = expiresAt;
      try{
        localStorage.setItem(ADMIN_TOKEN_KEY, JSON.stringify({token, expiresAt}));
      }catch(_){}
    }

    function clear(){
      _token = null;
      _expiresAt = 0;
      try{ localStorage.removeItem(ADMIN_TOKEN_KEY); }catch(_){}
    }

    function isValid(){
      return !!_token && Date.now() < _expiresAt;
    }

    function get(){
      return isValid() ? _token : null;
    }

    function checkRateLimit(){
      try{
        const raw = localStorage.getItem(ADMIN_RATE_LIMIT_KEY);
        const data = raw ? JSON.parse(raw) : {attempts: 0, lockedUntil: 0};
        if(Date.now() < (data.lockedUntil || 0)){
          const remainSec = Math.ceil((data.lockedUntil - Date.now()) / 1000);
          return {allowed: false, remainSec};
        }
        return {allowed: true, data};
      }catch(_){
        return {allowed: true, data: {attempts: 0, lockedUntil: 0}};
      }
    }

    function recordFailure(){
      try{
        const raw = localStorage.getItem(ADMIN_RATE_LIMIT_KEY);
        const data = raw ? JSON.parse(raw) : {attempts: 0, lockedUntil: 0};
        data.attempts = (data.attempts || 0) + 1;
        if(data.attempts >= ADMIN_MAX_ATTEMPTS){
          data.lockedUntil = Date.now() + ADMIN_LOCKOUT_MS;
          data.attempts = 0;
        }
        localStorage.setItem(ADMIN_RATE_LIMIT_KEY, JSON.stringify(data));
      }catch(_){}
    }

    function recordSuccess(){
      try{ localStorage.removeItem(ADMIN_RATE_LIMIT_KEY); }catch(_){}
    }

    return {load, save, clear, isValid, get, checkRateLimit, recordFailure, recordSuccess};
  })();

  AdminSession.load();

  function setConnection(state, text){
    connectionState.className = state;
    connectionText.textContent = text;
  }
  
  // ===== API JSONP =====
  window.__srankApi = function(action, data = {}, timeout = TIMEOUT.DEFAULT){
    return new Promise((resolve,reject) => {
      setConnection("busy", "Đang đồng bộ…");
      const cb = "__srank_" + Date.now() + "_" + (++requestSeq);
      const script = document.createElement("script");
      const u = new URL(SCRIPT_URL);
      u.searchParams.set("action", action);
      u.searchParams.set("callback", cb);
      for(const [k,v] of Object.entries(data)) u.searchParams.set(k, v);

      let done = false;
      const finish = (fn, value) => {
        if(done) return;
        done = true;
        clearTimeout(timer);
        delete window[cb];
        script.remove();
        fn(value);
      };
      window[cb] = result => {
        setConnection("ok", "Đã kết nối");
        finish(resolve, result);
      };
      script.onerror = () => {
        setConnection("off", "Mất kết nối");
        finish(reject, new Error("Không kết nối được Google Sheet"));
      };
      const timer = setTimeout(() => {
        setConnection("off", "Phản hồi chậm");
        finish(reject, new Error("Google Sheet phản hồi chậm"));
      }, timeout);
      script.src = u.toString();
      document.head.appendChild(script);
    });
  };

  function todayKey(){
    const d = new Date();
    const parts = new Intl.DateTimeFormat("en-CA",{
      timeZone:"Asia/Ho_Chi_Minh",year:"numeric",month:"2-digit",day:"2-digit"
    }).formatToParts(d);
    const get = k => parts.find(x=>x.type===k)?.value || "";
    return `${get("year")}-${get("month")}-${get("day")}`;
  }

  let _cacheSaveTimer = null;
  function cacheSave(immediate = false){
    const doWrite = () => {
      try{
        const day = todayKey();
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          v: CACHE_SCHEMA_VERSION,
          names, checked, times, points, ranks, day,
          ts: Date.now()
        }));
      }catch(_){
        try{
          localStorage.removeItem(CACHE_KEY);
          const day = todayKey();
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            v: CACHE_SCHEMA_VERSION,
            names, checked, times, points, ranks, day,
            ts: Date.now()
          }));
        }catch(_){}
      }
    };

    if(immediate){
      clearTimeout(_cacheSaveTimer);
      _cacheSaveTimer = null;
      doWrite();
      return;
    }

    clearTimeout(_cacheSaveTimer);
    _cacheSaveTimer = setTimeout(doWrite, 250);
  }

  window.addEventListener("beforeunload", () => {
    if(_cacheSaveTimer){
      clearTimeout(_cacheSaveTimer);
      try{
        const day = todayKey();
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          v: CACHE_SCHEMA_VERSION,
          names, checked, times, points, ranks, day,
          ts: Date.now()
        }));
      }catch(_){}
    }
  });

  function cacheLoad(){
    try{
      const raw = localStorage.getItem(CACHE_KEY);
      if(!raw) return false;

      const x = JSON.parse(raw);
      if(!x || typeof x !== "object") {
        localStorage.removeItem(CACHE_KEY);
        return false;
      }

      if(x.v !== CACHE_SCHEMA_VERSION){
        localStorage.removeItem(CACHE_KEY);
        return false;
      }

      if(x.day !== todayKey()){
        localStorage.removeItem(CACHE_KEY);
        return false;
      }

      if(!Array.isArray(x.names) || !Array.isArray(x.checked)) return false;

      names = x.names.filter(n => typeof n === "string" && n.trim());
      checked = x.checked.slice(0, names.length).map(c => c === true);
      times = Array.isArray(x.times)
        ? x.times.slice(0, names.length).map(t => typeof t === "string" ? t : "")
        : names.map(() => "");
      points = Array.isArray(x.points)
        ? x.points.slice(0, names.length).map(p => Number.isFinite(Number(p)) ? Number(p) : 100)
        : names.map(() => 100);
      ranks = points.map(rankClient);
      return names.length > 0;
    }catch(_){
      try{ localStorage.removeItem(CACHE_KEY); }catch(_){}
    }
    return false;
  }

  let resetTime = "00:00";
  let resetTimer = null;
  let checklistLockTime = "21:00";
  let initialSheetLoaded = false;

  function isValid24hTime(value){
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value || "").trim());
  }

  async function getSettingsCached(force = false){
    const now = Date.now();

    if(!force && settingsCache && (now - settingsFetchedAt) < SETTINGS_TTL){
      return settingsCache;
    }

    if(settingsFetchPromise){
      return settingsFetchPromise;
    }

    settingsFetchPromise = (async () => {
      try{
        const r = await window.__srankApi("getSettings", {}, TIMEOUT.FAST);
        if(!r.ok) throw new Error(r.error || "Không tải được cài đặt");

        settingsCache = {
          resetTime: r.data.resetTime || "00:00",
          checklistLockTime: r.data.checklistLockTime || checklistLockTime
        };
        settingsFetchedAt = Date.now();
        return settingsCache;
      } finally {
        settingsFetchPromise = null;
      }
    })();

    return settingsFetchPromise;
  }

  function loadChecklistLockTime(){
    try{
      const saved = String(localStorage.getItem(CHECKLIST_LOCK_KEY) || "").trim();
      if(isValid24hTime(saved)) checklistLockTime = saved;
    }catch(_){ }
  }

  function saveChecklistLockTime(value){
    checklistLockTime = String(value || "21:00").trim();
    try{ localStorage.setItem(CHECKLIST_LOCK_KEY, checklistLockTime); }catch(_){ }
  }

  function scheduleNextReset(){
    if(resetTimer) clearTimeout(resetTimer);
    const now = new Date();
    const [hh,mm] = String(resetTime || "00:00").split(":").map(Number);
    const next = new Date(now);
    next.setHours(Number.isFinite(hh)?hh:0, Number.isFinite(mm)?mm:0, 3, 0);
    if(next.getTime() <= now.getTime()) next.setDate(next.getDate()+1);
    resetTimer = setTimeout(async()=>{
      try{
        const token = AdminSession.get();
        if(!token) {
          return;
        }
        const r = await window.__srankApi("resetNow", {token}, TIMEOUT.FAST);
        if(!r.ok) throw new Error(r.error || "Reset thất bại");
        checked = names.map(()=>false);
        times = names.map(()=>"");
        cacheSave();
        renderChecklist();

        if(adminOverlay.classList.contains("show")){
          renderAdminChecklistEditor();
        }

        setStatus("Checklist đã làm mới ✓");
      }catch(e){
        setStatus("Reset chưa thành công — sẽ thử lại ✓");
      }finally{
        scheduleNextReset();
      }
    }, Math.max(1000,next.getTime()-now.getTime()));
  }

  const MONITOR_FB_LINK = "https://facebook.com/kinya03";
  const MONITOR_DEFAULT_LINKS = {
    "Huong Lye": "https://www.facebook.com/groups/263510030791508/admin_activities/?activity_actor=61593390746763&with_note=false&automatic_action=false",
    "Quỳnh Trang": "https://www.facebook.com/groups/263510030791508/admin_activities/?activity_actor=100093857294560&with_note=false&automatic_action=false",
    "Phương Thảo": "https://www.facebook.com/groups/263510030791508/admin_activities/?activity_actor=61585575394411&with_note=false&automatic_action=false",
    "Thảo Uyên": "https://www.facebook.com/groups/263510030791508/admin_activities/?activity_actor=100006013845550&with_note=false&automatic_action=false",
    "Minh Thư": "https://www.facebook.com/groups/263510030791508/admin_activities/?activity_actor=100012882251402&with_note=false&automatic_action=false",
    "Như Dương": "https://www.facebook.com/groups/263510030791508/admin_activities/?activity_actor=100024250441939&with_note=false&automatic_action=false",
    "Rosalie": "https://www.facebook.com/groups/263510030791508/admin_activities/?activity_actor=100050294476265&with_note=false&automatic_action=false",
    "Tuan Nguyen": "https://www.facebook.com/groups/263510030791508/admin_activities/?activity_actor=100013605286802&with_note=false&automatic_action=false",
    "Minh Quân": "https://www.facebook.com/groups/263510030791508/admin_activities/?activity_actor=100021729860926&with_note=false&automatic_action=false",
    "Kim Chi": "https://www.facebook.com/groups/263510030791508/admin_activities/?activity_actor=61589092540444&with_note=false&automatic_action=false",
    "Mỹ Dung": "https://www.facebook.com/groups/263510030791508/admin_activities/?activity_actor=100092430943394&with_note=false&automatic_action=false",
    "Phạm Kim Chi": "https://www.facebook.com/groups/263510030791508/admin_activities/?activity_actor=100024183575661&with_note=false&automatic_action=false"
  };
  const MONITOR_LINKS_KEY = "srank_monitor_links_v1";
  let monitorLinks = {};
  let editingMonitorName = "";
  let adminUnlocked = false;

  function loadMonitorLinks(){
    try{
      const saved = JSON.parse(localStorage.getItem(MONITOR_LINKS_KEY) || "{}");
      const existing = saved && typeof saved === "object" ? saved : {};

      monitorLinks = Object.assign({}, existing, MONITOR_DEFAULT_LINKS);

      localStorage.setItem(MONITOR_LINKS_KEY, JSON.stringify(monitorLinks));
    }catch(_){
      monitorLinks = Object.assign({}, MONITOR_DEFAULT_LINKS);
    }
  }

  function saveMonitorLinks(){
    try{ localStorage.setItem(MONITOR_LINKS_KEY, JSON.stringify(monitorLinks)); }catch(_){}
  }

  function getMonitorLink(name){
    const key = String(name || "").trim();
    const custom = String(monitorLinks[key] || "").trim();
    return custom || String(MONITOR_DEFAULT_LINKS[key] || "").trim() || MONITOR_FB_LINK;
  }

  function normalizeMonitorLink(value){
    const v = String(value || "").trim();
    if(!v) return "";
    try{
      const u = new URL(v);
      if(u.protocol !== "http:" && u.protocol !== "https:") return "";
      return u.toString();
    }catch(_){ return ""; }
  }

  function openMonitorFacebook(name){
    const link = getMonitorLink(name);
    let win = null;
    try{ win = window.open("about:blank", "_blank"); }catch(_){}
    if(!win){ setStatus("Trình duyệt đang chặn tab mới."); return; }
    try{
      win.location.replace(link);
      try{ win.focus(); }catch(_){}
    }catch(e){
      try{ win.close(); }catch(_){}
      setStatus("Không mở được liên kết.");
    }
  }

  function openLinkEditor(name){
    editingMonitorName = String(name || "");
    linkEditorName.textContent = editingMonitorName || "Người chơi";
    linkEditorInput.value = String(monitorLinks[editingMonitorName] || "").trim();
    linkEditorOverlay.classList.add("show");
    linkEditorOverlay.setAttribute("aria-hidden","false");
    setTimeout(()=>linkEditorInput.focus(),50);
  }

  function closeLinkEditor(){
    linkEditorOverlay.classList.remove("show");
    linkEditorOverlay.setAttribute("aria-hidden","true");
    editingMonitorName = "";
  }

  function saveEditedMonitorLink(){
    const name = editingMonitorName;
    if(!name) return;
    const raw = linkEditorInput.value.trim();
    if(!raw){
      delete monitorLinks[name];
      saveMonitorLinks();
      closeLinkEditor();
      renderMonitor();
      setStatus("Đã dùng link mặc định ✓");
      return;
    }
    const link = normalizeMonitorLink(raw);
    if(!link){
      setStatus("Link không hợp lệ");
      linkEditorInput.focus();
      return;
    }
    monitorLinks[name] = link;
    saveMonitorLinks();
    closeLinkEditor();
    renderMonitor();
    setStatus("Đã gán link ✓");
  }

  function clearEditedMonitorLink(){
    const name = editingMonitorName;
    if(!name) return;
    delete monitorLinks[name];
    saveMonitorLinks();
    closeLinkEditor();
    renderMonitor();
    setStatus("Đã xoá link riêng ✓");
  }

  function renderMonitor(){
    if(!monitorBody) return;
    monitorBody.innerHTML = "";
    const frag = document.createDocumentFragment();

    if(!names.length){
      const tr = document.createElement("tr");
      tr.innerHTML = '<td colspan="2" class="monitorEmpty">Chưa có danh sách người chơi.</td>';
      frag.appendChild(tr);
      monitorBody.appendChild(frag);
      return;
    }

    names.forEach((name, i) => {
      const player = name || ("Người chơi " + (i+1));
      const customLink = String(monitorLinks[player] || "").trim();
      const defaultLink = String(MONITOR_DEFAULT_LINKS[player] || "").trim();
      const effectiveLink = customLink || defaultLink || MONITOR_FB_LINK;

      const tr = document.createElement("tr");

      const tdName = document.createElement("td");
      const nameWrap = document.createElement("div");
      nameWrap.className = "monitorName";
      const dot = document.createElement("span");
      dot.className = "monitorDot";

      const nameBox = document.createElement("div");
      nameBox.style.minWidth = "0";
      const nameText = document.createElement("div");
      nameText.className = "monitorNameText";
      nameText.textContent = player;
      const linkState = document.createElement("span");
      linkState.className = "monitorLinkState";
      linkState.textContent = effectiveLink;

      nameBox.appendChild(nameText);
      nameBox.appendChild(linkState);
      nameWrap.appendChild(dot);
      nameWrap.appendChild(nameBox);
      tdName.appendChild(nameWrap);

      const tdActions = document.createElement("td");
      const actions = document.createElement("div");
      actions.className = "monitorActions";

      if(adminUnlocked){
        const assignBtn = document.createElement("button");
        assignBtn.type = "button";
        assignBtn.className = "monitorAssignBtn";
        assignBtn.textContent = customLink ? "Sửa link" : "Gán link";
        assignBtn.addEventListener("click", () => openLinkEditor(player));
        actions.appendChild(assignBtn);
      }

      const checkBtn = document.createElement("button");
      checkBtn.type = "button";
      checkBtn.className = "monitorCheckBtn";
      checkBtn.textContent = "CHECK";
      checkBtn.addEventListener("click", () => openMonitorFacebook(player));
      actions.appendChild(checkBtn);
      tdActions.appendChild(actions);

      tr.appendChild(tdName);
      tr.appendChild(tdActions);
      frag.appendChild(tr);
    });

    monitorBody.appendChild(frag);
  }

  function openMonitor(){
    renderMonitor();
    monitorOverlay.classList.add("show");
    monitorOverlay.setAttribute("aria-hidden","false");
    syncQuickTools();
  }
  function closeMonitor(){
    monitorOverlay.classList.remove("show");
    monitorOverlay.setAttribute("aria-hidden","true");
    syncQuickTools();
  }

  function closeAdmin(){
    adminOverlay.classList.remove("show");
    adminOverlay.setAttribute("aria-hidden","true");
    if(typeof renderQuizAdminButton==="function") renderQuizAdminButton();
    syncQuickTools();
  }

  function adminLogout(){
    AdminSession.clear();
    adminUnlocked = false;
    renderQuizAdminButton();
    closeAdmin();
    syncQuickTools();
    setStatus("Đã đăng xuất admin");
  }

  window.__adminLogout = adminLogout;
  
  const adminPasswordOverlay = document.getElementById("adminPasswordOverlay");
  const adminPasswordInput = document.getElementById("adminPasswordInput");
  const adminPasswordMsg = document.getElementById("adminPasswordMsg");
  const adminPasswordOk = document.getElementById("adminPasswordOk");
  const adminPasswordCancel = document.getElementById("adminPasswordCancel");

  function openAdminPassword(){
    adminPasswordMsg.textContent="";
    adminPasswordInput.value="";
    adminPasswordOverlay.style.display="flex";
    adminPasswordOverlay.setAttribute("aria-hidden","false");
    setTimeout(()=>adminPasswordInput.focus(),50);
  }
  function closeAdminPassword(){
    adminPasswordOverlay.style.display="none";
    adminPasswordOverlay.setAttribute("aria-hidden","true");
  }
  function renderAdminChecklistEditor(){
    if(!adminChecklistRows) return;
    adminChecklistRows.innerHTML = "";
    const frag = document.createDocumentFragment();

    names.forEach((name, i) => {
      const row = document.createElement("div");
      row.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 10px;border-bottom:1px solid rgba(255,255,255,.06);";

      const label = document.createElement("div");
      label.style.cssText = "min-width:0;flex:1;color:rgba(255,255,255,.82);font-size:12px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
      label.textContent = name || ("Người chơi " + (i+1));

      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = checked[i] ? "✓ Đã check" : "○ Chưa check";
      btn.style.cssText = "min-width:96px;min-height:34px;padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:" +
        (checked[i] ? "linear-gradient(135deg,#4f9f76,#69b98d)" : "rgba(238,247,240,.95)") +
        ";color:" + (checked[i] ? "#fff" : "#47725b") + ";font-size:11px;font-weight:800;box-shadow:none;";

      btn.addEventListener("click", async () => {
        const next = !checked[i];
        btn.disabled = true;
        try{
          const token = AdminSession.get();
          if(!token) throw new Error("Phiên admin đã hết hạn — vui lòng đăng nhập lại");

          const r = await window.__srankApi("adminSetCheck", {
            token,
            name: names[i],
            checked: next ? "true" : "false"
          }, TIMEOUT.FAST);
          if(!r.ok) throw new Error(r.error || "Không cập nhật được checklist");

          checked[i] = next;
          times[i] = next
            ? ((r.data && r.data.time) || new Intl.DateTimeFormat("vi-VN", {
                timeZone:"Asia/Ho_Chi_Minh",
                hour:"2-digit",
                minute:"2-digit",
                hour12:false
              }).format(new Date()))
            : "";

          cacheSave();
          renderChecklist();
          renderAdminChecklistEditor();
          setStatus(next ? "Đã check ✓" : "Đã bỏ check ✓");
          adminStatus.textContent = next
            ? `Đã check ${names[i]}`
            : `Đã bỏ check ${names[i]}`;
        }catch(e){
          adminStatus.textContent = e.message || "Không cập nhật được checklist.";
        }finally{
          btn.disabled = false;
        }
      });

      row.appendChild(label);
      row.appendChild(btn);
      frag.appendChild(row);
    });

    adminChecklistRows.appendChild(frag);
  }

  async function openAdminSettings(){
    if(!AdminSession.isValid()){
      closeAdminPassword();
      adminUnlocked = false;
      openAdminPassword();
      return;
    }

    closeAdminPassword();
    adminUnlocked = true;
    renderMonitor();
    renderQuizAdminButton();
    syncQuickTools();
    adminStatus.textContent="Đang tải cài đặt…";
    adminOverlay.classList.add("show");
    adminOverlay.setAttribute("aria-hidden","false");
    checklistLockTimeInput.value = checklistLockTime;

    if(settingsCache){
      resetTimeInput.value = settingsCache.resetTime;
      checklistLockTimeInput.value = settingsCache.checklistLockTime;
    }

    try{
      const s = await getSettingsCached(false);
      resetTime = s.resetTime;
      resetTimeInput.value = resetTime;
      if(isValid24hTime(s.checklistLockTime)){
        checklistLockTime = s.checklistLockTime;
        saveChecklistLockTime(checklistLockTime);
      }
      checklistLockTimeInput.value = checklistLockTime;
      renderLandingState();
      renderAdminChecklistEditor();
      adminStatus.textContent = `Giờ reset: ${resetTime} • Giờ khoá Checklist: ${checklistLockTime}`;
    }catch(e){
      resetTimeInput.value = resetTime;
      checklistLockTimeInput.value = checklistLockTime;
      renderAdminChecklistEditor();
      adminStatus.textContent = "Không tải được giờ reset hiện tại. Giờ khoá Checklist vẫn dùng cài đặt trên trình duyệt này.";
    }
  }

  async function verifyAdmin(){
    const rl = AdminSession.checkRateLimit();
    if(!rl.allowed){
      adminPasswordMsg.textContent = `Quá nhiều lần thử. Vui lòng chờ ${rl.remainSec}s.`;
      return;
    }

    const password = adminPasswordInput.value.trim();
    if(!password){
      adminPasswordMsg.textContent = "Vui lòng nhập mật khẩu.";
      adminPasswordInput.focus();
      return;
    }

    adminPasswordOk.disabled = true;
    adminPasswordMsg.textContent = "Đang xác thực…";

    try{
      const r = await window.__srankApi("adminLogin", {password}, TIMEOUT.FAST);

      if(!r.ok){
        AdminSession.recordFailure();
        adminPasswordMsg.textContent = r.error || "Mật khẩu không đúng.";
        adminPasswordInput.value = "";
        adminPasswordInput.focus();
        return;
      }

      const token = String(r.data?.token || "");
      const expiresAt = Number(r.data?.expiresAt) || (Date.now() + ADMIN_SESSION_TTL);

      if(!token){
        adminPasswordMsg.textContent = "Server không trả token hợp lệ.";
        return;
      }

      AdminSession.save(token, expiresAt);
      AdminSession.recordSuccess();
      adminPasswordInput.value = "";
      await openAdminSettings();

    }catch(e){
      AdminSession.recordFailure();
      adminPasswordMsg.textContent = "Không kết nối được server. Thử lại sau.";
    }finally{
      adminPasswordOk.disabled = false;
    }
  }
  loadMonitorLinks();
  function openKdvRules(){
    kdvRulesOverlay.classList.add("show");
    kdvRulesOverlay.setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden";
    syncQuickTools();
  }

  function closeKdvRules(){
    kdvRulesOverlay.classList.remove("show");
    kdvRulesOverlay.setAttribute("aria-hidden","true");
    document.body.style.overflow="";
    syncQuickTools();
  }

  kdvRulesBtn.addEventListener("click",openKdvRules);
  kdvRulesClose.addEventListener("click",closeKdvRules);
  kdvRulesOverlay.addEventListener("click",e=>{
    if(e.target===kdvRulesOverlay) closeKdvRules();
  });

  monitorBtn.addEventListener("click",openMonitor);
  monitorCloseBtn.addEventListener("click",closeMonitor);
  linkEditorCancel.addEventListener("click",closeLinkEditor);
  linkEditorSave.addEventListener("click",saveEditedMonitorLink);
  linkEditorClear.addEventListener("click",clearEditedMonitorLink);
  linkEditorOverlay.addEventListener("click",e=>{if(e.target===linkEditorOverlay) closeLinkEditor();});
  linkEditorInput.addEventListener("keydown",e=>{if(e.key==="Enter") saveEditedMonitorLink();});
  monitorOverlay.addEventListener("click",e=>{if(e.target===monitorOverlay) closeMonitor()});
  adminBtn.addEventListener("click",()=>{
    if(adminUnlocked) openAdminSettings();
    else openAdminPassword();
  });
  adminPasswordOk.addEventListener("click",verifyAdmin);
  adminPasswordCancel.addEventListener("click",closeAdminPassword);
  adminPasswordOverlay.addEventListener("click",e=>{if(e.target===adminPasswordOverlay) closeAdminPassword()});
  adminPasswordInput.addEventListener("keydown",e=>{if(e.key==="Enter") verifyAdmin();});

  adminCloseBtn.addEventListener("click",closeAdmin);
  adminOverlay.addEventListener("click",e=>{if(e.target===adminOverlay) closeAdmin()});

  adminSaveBtn.addEventListener("click",async()=>{
    const time = resetTimeInput.value.trim();
    const lockTime = checklistLockTimeInput.value.trim();
    if(!isValid24hTime(time) || !isValid24hTime(lockTime)){
      adminStatus.textContent = "Giờ không hợp lệ.";
      return;
    }
    adminSaveBtn.disabled = true;
    adminStatus.textContent = "Đang lưu…";
    try{
      const token = AdminSession.get();
      if(!token) throw new Error("Phiên admin đã hết hạn");

      const r = await window.__srankApi("setSettings", {
        token,
        resetTime: time,
        checklistLockTime: lockTime
      }, TIMEOUT.FAST);
      if(!r.ok) throw new Error(r.error || "Không lưu được");

      resetTime = r.data.resetTime || time;
      checklistLockTime = r.data.checklistLockTime || lockTime;
      saveChecklistLockTime(checklistLockTime);
      checklistLockTimeInput.value = checklistLockTime;

      settingsCache = {
        resetTime: resetTime,
        checklistLockTime: checklistLockTime
      };
      settingsFetchedAt = Date.now();

      scheduleNextReset();

      _lastLockCheck = 0;
      _cachedLocked = isChecklistLocked();

      renderLandingState();
      adminStatus.textContent = `Đã lưu • Reset ${resetTime} • Khoá Checklist ${checklistLockTime}`;
    }catch(e){
      saveChecklistLockTime(lockTime);
      checklistLockTimeInput.value = checklistLockTime;
      renderLandingState();
      adminStatus.textContent = "Chưa lưu được lên hệ thống. Kiểm tra kết nối rồi thử lại.";
    }finally{
      adminSaveBtn.disabled = false;
    }
  });
// ===== Toast thông báo =====
  function showToast(message, type = ""){
    let container = document.getElementById("toastContainer");
    if(!container){
      container = document.createElement("div");
      container.id = "toastContainer";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = "toast" + (type ? " " + type : "");
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
      if(container.children.length === 0) container.remove();
    }, 3000);
  }
  function setStatus(t){
    status.textContent = t;
    status.classList.add("show");
    clearTimeout(setStatus.t);
    setStatus.t = setTimeout(() => status.classList.remove("show"), 1400);
  }

  function rankClient(value){
    return attendanceRankClient(value);
  }

  function attendanceRankClient(value){
    const score = Number(value) || 0;
    if(score >= 700) return "VIP";
    if(score >= 600) return "SSS";
    if(score >= 500) return "SS";
    if(score >= 400) return "S";
    if(score >= 300) return "A";
    if(score >= 200) return "B";
    if(score >= 100) return "C";
    return "D";
  }

  function initTopMonthSelect(){
    if(!topMonthSelect) return;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    topMonthSelect.innerHTML = '';
    for(let month=1; month<=12; month++){
      const option = document.createElement('option');
      option.value = String(month);
      option.textContent = `Tháng ${month}`;
      option.disabled = month > currentMonth;
      topMonthSelect.appendChild(option);
    }
    topMonthSelect.value = String(currentMonth);
  }

  function resetTopToCurrentMonth(){
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    if(topMonthSelect) topMonthSelect.value = String(currentMonth);
    if(topTitle) topTitle.textContent = `🏆 BXH TOP THÁNG ${currentMonth}`;
  }

  let topRenderToken = 0;

  function renderTopRows(employees, year, month){
    const daysInMonth = new Date(year, month, 0).getDate();
    const rows = (Array.isArray(employees) ? employees : []).map((employee,index)=>{
      const days = employee && employee.days ? employee.days : {};
      let tCount = 0;
      let pCount = 0;
      let qCount = 0;
      let xCount = 0;
      for(let day=1; day<=daysInMonth; day++){
        const status = String(days[String(day)] || '').toUpperCase();
        if(status === 'T') tCount++;
        else if(status === 'P') pCount++;
        else if(status === 'Q') qCount++;
        else if(status === 'X') xCount++;
      }
      const points = 300 + tCount * 40 - pCount * 10 - qCount * 100 - xCount * 200;
      return {
        name: String(employee?.name || '').trim(),
        points,
        tCount,
        pCount,
        qCount,
        xCount,
        index
      };
    }).filter(row=>row.name);

    rows.sort((a,b)=>b.points-a.points || a.index-b.index);

    const frag = document.createDocumentFragment();
    rows.forEach((row,i)=>{
      const tr = document.createElement('tr');
      if(i < 3) tr.classList.add('topRow' + (i + 1));
      tr.innerHTML = `<td>${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</td><td class="topName"></td><td class="topPoints"></td><td><span class="topRank"></span></td>`;
      tr.querySelector('.topName').textContent = row.name;
      tr.querySelector('.topPoints').textContent = Number(row.points || 0).toLocaleString('vi-VN');
      tr.querySelector('.topRank').textContent = attendanceRankClient(row.points);
      frag.appendChild(tr);
    });
    topBody.innerHTML = '';
    topBody.appendChild(frag);
  }

  async function renderTop(monthNumber){
    const now = new Date();
    const month = Number(monthNumber) || (now.getMonth() + 1);
    const token = ++topRenderToken;

    if(topMonthSelect) topMonthSelect.value = String(month);
    if(topTitle) topTitle.textContent = `🏆 BXH TOP THÁNG ${month}`;
    topBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:18px">Đang tải BXH…</td></tr>';

    try{
      const first = await window.__getAttendanceTopDataForMonth(month, false);
      if(token !== topRenderToken) return;
      renderTopRows(first.employees, first.year, first.month);

      if(first.cached){
        window.__getAttendanceTopDataForMonth(month, true).then(fresh=>{
          if(token !== topRenderToken) return;
          if(topMonthSelect && Number(topMonthSelect.value) !== month) return;
          renderTopRows(fresh.employees, fresh.year, fresh.month);
        }).catch(()=>{});
      }
    }catch(_){
      if(token !== topRenderToken) return;
      topBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:18px">Không tải được dữ liệu chấm công</td></tr>';
    }
  }

  function closeTop(){
    topPanel.classList.remove("show");
    topPanel.setAttribute("aria-hidden","true");
  }

  function renderChecklistSkeleton(){
    checklistBody.innerHTML = "";
    const frag = document.createDocumentFragment();
    for(let i = 0; i < 5; i++){
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><div class="skeleton skeleton-row medium"></div></td>
        <td><div class="skeleton skeleton-row short"></div></td>
        <td><div class="skeleton" style="width:25px;height:25px;border-radius:8px;margin:auto"></div></td>
      `;
      frag.appendChild(tr);
    }
    checklistBody.appendChild(frag);
  }

  function renderChecklist(){
    checklistBody.innerHTML = "";
    const frag = document.createDocumentFragment();

    const rows = names.map((name,i) => ({
      name,
      index: i,
      checked: !!checked[i],
      time: times[i] || ""
    }));

    rows.sort((a,b) => {
      if(a.checked !== b.checked) return a.checked ? -1 : 1;

      if(a.checked && b.checked){
        const ta = a.time || "99:99";
        const tb = b.time || "99:99";
        const cmp = ta.localeCompare(tb);
        if(cmp !== 0) return cmp;
      }

      return a.index - b.index;
    });

    rows.forEach(row => {
      const tr = document.createElement("tr");
      tr.dataset.index = row.index;
      tr.innerHTML = `<td class="playerName"></td><td class="checkTime"></td><td><div class="checkBox"></div></td>`;
      tr.firstChild.textContent = row.name;
      tr.querySelector(".checkTime").textContent = row.time || "—";
      if(row.checked) tr.querySelector(".checkBox").classList.add("checked");
      frag.appendChild(tr);
    });

    checklistBody.appendChild(frag);
  }

  function smoothUpdateChecklist(newData){
    if(!names.length) return false;

    const oldNames = names.slice();
    const oldChecked = checked.slice();
    const oldTimes = times.slice();

    if(oldNames.length !== newData.names.length) return false;

    const namesChanged = oldNames.some((n, i) => n !== newData.names[i]);
    if(namesChanged) return false;

    const changedIndexes = [];
    for(let i = 0; i < names.length; i++){
      const checkedChanged = oldChecked[i] !== newData.checked[i];
      const timeChanged = String(oldTimes[i] || "") !== String(newData.times[i] || "");
      if(checkedChanged || timeChanged){
        changedIndexes.push(i);
      }
    }

    if(changedIndexes.length === 0){
      return true;
    }

    checked = newData.checked;
    times = newData.times;
    points = newData.points;
    ranks = newData.ranks;

    changedIndexes.forEach((idx, i) => {
      const tr = checklistBody.querySelector(`tr[data-index="${idx}"]`);
      if(!tr) return;

      const timeCell = tr.querySelector(".checkTime");
      const box = tr.querySelector(".checkBox");

      const wasUnchecked = !oldChecked[idx];
      const nowChecked = !!newData.checked[idx];
      if(wasUnchecked && nowChecked){
        const playerName = String(names[idx] || "").trim();
        const playerTime = String(newData.times[idx] || "").trim();
        if(playerName){
          showToast(`🐱 ${playerName} vừa check lúc ${playerTime}`);
        }
      }

      if(timeCell) timeCell.textContent = times[idx] || "—";
      if(box) box.classList.toggle("checked", !!checked[idx]);

      if(i < 3){
        tr.classList.add("row-updated");
        setTimeout(() => tr.classList.remove("row-updated"), 1200);
      }
    });

    reorderChecklistRows();

    return true;
  }

  function reorderChecklistRows(){
    const scrollEl = document.getElementById("checklistScroll");
    const scrollTop = scrollEl ? scrollEl.scrollTop : 0;

    const rows = names.map((name, i) => ({
      name,
      index: i,
      checked: !!checked[i],
      time: times[i] || ""
    }));

    rows.sort((a, b) => {
      if(a.checked !== b.checked) return a.checked ? -1 : 1;
      if(a.checked && b.checked){
        const ta = a.time || "99:99";
        const tb = b.time || "99:99";
        const cmp = ta.localeCompare(tb);
        if(cmp !== 0) return cmp;
      }
      return a.index - b.index;
    });

    const frag = document.createDocumentFragment();
    rows.forEach(row => {
      const tr = checklistBody.querySelector(`tr[data-index="${row.index}"]`);
      if(tr) frag.appendChild(tr);
    });
    checklistBody.appendChild(frag);

    if(scrollEl) scrollEl.scrollTop = scrollTop;
  }

  function updateChecklistRow(index){
    const tr = checklistBody.querySelector(`tr[data-index="${index}"]`);
    if(!tr) return false;

    const timeCell = tr.querySelector(".checkTime");
    const box = tr.querySelector(".checkBox");

    if(timeCell) timeCell.textContent = times[index] || "—";
    if(box) box.classList.toggle("checked", !!checked[index]);

    return true;
  }

  function checklistOrderChanged(index){
    if(!checked[index]) {
      const tr = checklistBody.querySelector(`tr[data-index="${index}"]`);
      if(!tr) return true;
      const currentPosition = Array.from(checklistBody.children).indexOf(tr);
      let checkedCount = 0;
      for(let i=0; i<names.length; i++){
        if(i !== index && checked[i]) checkedCount++;
      }
      return currentPosition < checkedCount;
    }

    const tr = checklistBody.querySelector(`tr[data-index="${index}"]`);
    if(!tr) return true;

    const currentPosition = Array.from(checklistBody.children).indexOf(tr);
    const myTime = times[index] || "99:99";
    let shouldBeBefore = 0;
    for(let i=0; i<names.length; i++){
      if(i === index) continue;
      if(!checked[i]) continue;
      const t = times[i] || "99:99";
      if(t < myTime) shouldBeBefore++;
      else if(t === myTime && i < index) shouldBeBefore++;
    }

    return currentPosition !== shouldBeBefore;
  }

  function renderWheel(){
    if(!names.length) return;
    const mid = wheelArea.clientHeight / 2;
    const children = itemsBox.children;
    for(let i=0;i<children.length;i++){
      const el = children[i];
      const y = (i-current)*ITEM_H + mid + dragOffset;
      const d = Math.abs(y-mid);
      const n = Math.min(1,d/(ITEM_H*2.3));
      el.style.top = (y-ITEM_H/2) + "px";
      el.style.transform = `scale(${1-n*.28})`;
      el.style.opacity = .20 + (1-n)*.80;
      el.style.filter = `blur(${n*2.5}px)`;
      el.classList.toggle("selected", i===current && Math.abs(dragOffset)<ITEM_H*.35);
    }
  }

  function buildWheel(){
    itemsBox.innerHTML = "";
    const frag = document.createDocumentFragment();
    names.forEach(name => {
      const el = document.createElement("div");
      el.className = "item";
      el.textContent = name;
      frag.appendChild(el);
    });
    itemsBox.appendChild(frag);
    current = Math.min(current, Math.max(0,names.length-1));
    renderWheel();
  }
  
  async function loadData(showError = true, force = false){
    if(syncInFlight) return false;
    if(initialSheetLoaded && !force){
      renderChecklist();
      buildWheel();
      renderAdminChecklistEditor();
      return true;
    }

    syncInFlight = true;
    try{
      if(!names.length && cacheLoad()){
        renderChecklist();
        buildWheel();
      }else if(!names.length && checklistPanel.classList.contains("show")){
        renderChecklistSkeleton();
      }

      const r = await window.__srankApi("getData", {}, TIMEOUT.NORMAL);
      if(!r.ok) throw new Error(r.error || "getData lỗi");

      const rawNames = Array.isArray(r.data?.names) ? r.data.names : [];
      const serverNames = rawNames
        .map(n => String(n ?? "").trim())
        .filter(n => n.length > 0 && n.length <= 100);

      const rawPoints = Array.isArray(r.data?.points) ? r.data.points : [];
      const serverPoints = serverNames.map((_, i) => {
        const p = Number(rawPoints[i]);
        return Number.isFinite(p) && p >= 0 && p <= 100000 ? p : 100;
      });

      const rawChecks = Array.isArray(r.data?.checks) ? r.data.checks : [];
      const serverChecks = serverNames.map((_, i) => rawChecks[i] === true);

      const rawTimes = Array.isArray(r.data?.times) ? r.data.times : [];
      const serverTimes = serverNames.map((_, i) => {
        const t = String(rawTimes[i] ?? "").trim();
        return /^([01]\d|2[0-3]):[0-5]\d$/.test(t) ? t : "";
      });

      const canSmoothUpdate = initialSheetLoaded
        && !force
        && checklistPanel.classList.contains("show")
        && names.length > 0;

      if(canSmoothUpdate){
        const updated = smoothUpdateChecklist({
          names: serverNames,
          points: serverPoints,
          checked: serverChecks,
          times: serverTimes,
          ranks: serverPoints.map(rankClient)
        });

        if(updated){
          points = serverPoints;
          ranks = points.map(rankClient);
          lastAutoSyncAt = Date.now();
          window.syncAttendanceEmployees?.();
          cacheSave();
          setStatus("Đã cập nhật ✓");
          return true;
        }
      }

      names = serverNames;
      points = serverPoints;
      ranks = points.map(rankClient);

      if(!initialSheetLoaded || force){
        checked = serverChecks;
        times = serverTimes;
      }

      initialSheetLoaded = true;
      lastAutoSyncAt = Date.now();
      window.syncAttendanceEmployees?.();
      cacheSave();
      renderChecklist();
      buildWheel();

      if(adminOverlay.classList.contains("show")){
        renderAdminChecklistEditor();
      }

      hint.textContent = "Chạm vào câu hỏi";
      setStatus(force ? "Đã cập nhật ✓" : "Đã đồng bộ ✓");
      return true;
    }catch(e){
      if(showError && !names.length) hint.textContent = "Không tải được dữ liệu";
      if(names.length) setStatus("Đang dùng dữ liệu đã lưu");
      return false;
    }finally{
      syncInFlight = false;

      if(!_dataLoadResolved){
        _dataLoadResolved = true;
        _dataLoadResolve();
      }
    }
  }

  function startAutoSync(){
    if(autoSyncTimer){
      clearInterval(autoSyncTimer);
      autoSyncTimer = null;
    }
    restartAutoSync();
  }

  function restartAutoSync(){
    if(autoSyncTimer){
      clearInterval(autoSyncTimer);
      autoSyncTimer = null;
    }

    const interval = checklistPanel.classList.contains("show")
      ? CHECKLIST_SYNC_MS
      : AUTO_SYNC_MS;

    autoSyncTimer = setInterval(() => {
      if(document.hidden) return;

      if(wheelArea.classList.contains("show")) return;
      if(message.classList.contains("show")) return;
      if(topPanel.classList.contains("show")) return;
      if(document.getElementById("attendancePage")?.classList.contains("show")) return;

      if(Date.now() - lastAutoSyncAt < AUTO_SYNC_MIN_GAP) return;

      if(Date.now() - _lastUserActionAt < USER_ACTION_PAUSE_MS) return;

      if(syncInFlight) return;

      lastAutoSyncAt = Date.now();
      loadData(false, true);
    }, interval);
  }

  async function checkin(name, index){
    if(checked[index] === true && times[index]){
      setStatus(`Đã ghi ${times[index]} ✓`);
      return;
    }

    _lastUserActionAt = Date.now();

    const clientTime = new Intl.DateTimeFormat("vi-VN",{
      timeZone:"Asia/Ho_Chi_Minh",
      hour:"2-digit",minute:"2-digit",hour12:false
    }).format(new Date());

    times[index] = clientTime;
    checked[index] = true;
    cacheSave();

    if(!updateChecklistRow(index) || checklistOrderChanged(index)){
      renderChecklist();
    }

    if(!q1Opened && !checklistPanel.classList.contains("show")){
      renderLandingState();
    }

    setStatus(`Đã ghi ${clientTime} ✓`);

    try{
      const r = await window.__srankApi("checkin",{
        name,
        clientTime,
        clientEpoch:String(Date.now())
      }, TIMEOUT.NORMAL);
      if(!r.ok) throw new Error(r.error || "checkin lỗi");

      if(r.data && Number.isFinite(Number(r.data.points))) {
        points[index] = Number(r.data.points);
        ranks[index] = r.data.rank || rankClient(points[index]);
      }
      cacheSave();

      if(!updateChecklistRow(index)){
        renderChecklist();
      }

      setStatus(`Đã ghi ${clientTime} ✓`);
    }catch(e){
      setStatus("Máy chủ chưa xác nhận — trạng thái HTML vẫn giữ nguyên");
      cacheSave();
    }
  }


  function burst(){
    const f=document.createElement("div"); f.className="flash"; root.appendChild(f);
    setTimeout(()=>f.remove(),700);
    for(let i=0;i<20;i++){
      const h=document.createElement("div"); h.className="heart"; h.textContent=i%5===0?"💗":"♥";
      const a=Math.PI*2*i/20,r=80+Math.random()*200;
      h.style.setProperty("--x",Math.cos(a)*r+"px"); h.style.setProperty("--y",Math.sin(a)*r+"px");
      h.style.setProperty("--r",(Math.random()*120-60)+"deg");
      h.style.setProperty("--s",(0.7+Math.random()*1.3).toFixed(2));
      h.style.setProperty("--time",(0.7+Math.random()*.6).toFixed(2)+"s");
      root.appendChild(h); setTimeout(()=>h.remove(),1500);
    }
  }

  function showMessage(html,duration=2200,next=null){
    wheelArea.classList.remove("show");
    question.style.opacity="0";
    hint.textContent="";
    message.innerHTML=html;
    message.classList.remove("show"); void message.offsetWidth; message.classList.add("show");
    burst();
    if(next) setTimeout(()=>{message.classList.remove("show");setTimeout(next,220)},duration);
  }

  function snap(){
    const steps=Math.round(-dragOffset/ITEM_H);
    if(steps!==0){
      current=Math.max(0,Math.min(names.length-1,current+steps));
    }
    dragOffset=0;
    renderWheel();
    confirm.classList.add("show");
  }

  function moveSelection(delta){
    if(!wheelArea.classList.contains("show") || !names.length) return;
    current=Math.max(0,Math.min(names.length-1,current+delta));
    dragOffset=0;
    renderWheel();
    confirm.classList.add("show");
  }

  wheelArea.addEventListener("pointerdown",e=>{
    dragging=true;
    startY=e.clientY;
    dragOffset=0;
    wheelArea.setPointerCapture?.(e.pointerId);
  });
  wheelArea.addEventListener("pointermove",e=>{
    if(!dragging)return;
    dragOffset=e.clientY-startY;
    if((current===0&&dragOffset>0)||(current===names.length-1&&dragOffset<0)) dragOffset*=.25;
    renderWheel();
  });
  wheelArea.addEventListener("pointerup",e=>{
    if(dragging){
      dragging=false;
      snap();
      wheelArea.releasePointerCapture?.(e.pointerId);
    }
  });
  wheelArea.addEventListener("pointercancel",e=>{
    if(dragging){
      dragging=false;
      snap();
      wheelArea.releasePointerCapture?.(e.pointerId);
    }
  });

  wheelArea.addEventListener("wheel",e=>{
    if(!wheelArea.classList.contains("show") || !names.length) return;
    e.preventDefault();
    if(!e.deltaY) return;
    current += e.deltaY > 0 ? 1 : -1;
    current = Math.max(0, Math.min(names.length - 1, current));
    dragOffset=0;
    renderWheel();
    confirm.classList.add("show");
  },{passive:false});

  addEventListener("keydown",e=>{
    if(!wheelArea.classList.contains("show")) return;
    if(e.key==="ArrowDown"){
      e.preventDefault();
      moveSelection(1);
    }else if(e.key==="ArrowUp"){
      e.preventDefault();
      moveSelection(-1);
    }else if(e.key==="Enter" && confirm.classList.contains("show")){
      e.preventDefault();
      confirm.click();
    }
  });

  function checklistLockInfo(){
    const parts = new Intl.DateTimeFormat("en-US",{
      timeZone:"Asia/Ho_Chi_Minh",
      hour:"2-digit",minute:"2-digit",hour12:false
    }).formatToParts(new Date());
    const hour = Number(parts.find(p=>p.type==="hour")?.value || 0);
    const minute = Number(parts.find(p=>p.type==="minute")?.value || 0);
    const [lockHour, lockMinute] = String(checklistLockTime || "21:00").split(":").map(Number);
    const lockMinutes = (Number.isFinite(lockHour) ? lockHour : 21) * 60 + (Number.isFinite(lockMinute) ? lockMinute : 0);
    return { locked: (hour * 60 + minute) >= lockMinutes, time: checklistLockTime };
  }

  function isChecklistLocked(){
    return checklistLockInfo().locked;
  }

  function renderLandingState(){
    const locked = isChecklistLocked();
    question.classList.toggle("checklist-locked-home", locked);

    const checkedList = names
      .map((name, i) => ({
        name: String(name || "").trim(),
        time: String(times[i] || "").trim(),
        checked: !!checked[i]
      }))
      .filter(p => p.checked && p.time && p.name);

    checkedList.sort((a, b) => a.time.localeCompare(b.time));

    const top3 = checkedList.slice(0, 3);

    let top3HTML = "";

    if(top3.length === 0){
      top3HTML = `<div class="landing-top3-empty">Chưa có ai check hôm nay — hãy là người đầu tiên! 🐱</div>`;
    }else{
      const podiumOrder = [];
      if(top3[1]) podiumOrder.push({...top3[1], rank: 2, medal: "🥈"});
      if(top3[0]) podiumOrder.push({...top3[0], rank: 1, medal: "🥇"});
      if(top3[2]) podiumOrder.push({...top3[2], rank: 3, medal: "🥉"});

      top3HTML = `
        <span class="landing-top3-label">Top check sớm nhất</span>
        <div class="landing-top3">
          ${podiumOrder.map(p => `
            <div class="podium-slot rank-${p.rank}">
              <span class="podium-medal">${p.medal}</span>
              <span class="podium-name" title="${p.name.replace(/"/g, '&quot;')}">${p.name}</span>
              <span class="podium-time">${p.time}</span>
            </div>
          `).join("")}
        </div>
      `;
    }

    question.innerHTML = locked
      ? `<span class="landing-title">CHECKLIST ĐẢO MÈO</span>${top3HTML}<span class="landing-cta locked" role="button" aria-disabled="true" tabindex="-1">Tạm khoá Checklist</span><span class="landing-lock-note">Sau ${checklistLockTime} sẽ khoá Checklist nha mn 🥰</span>`
      : `<span class="landing-title">CHECKLIST ĐẢO MÈO</span>${top3HTML}<span class="landing-cta" role="button" tabindex="0">CLICK HERE</span>`;

    question.style.opacity = "1";
    question.style.transform = "scale(1)";
    question.style.pointerEvents = locked ? "none" : "auto";
  }

  function openQuestion1(e){
    e?.preventDefault();
    if(isChecklistLocked()){
      renderLandingState();
      return;
    }
    if(q1Opened || !names.length) return;
    q1Opened=true;
    question.style.pointerEvents="none";
    question.style.opacity="0";
    question.style.transform="scale(.8)";
    burst();
    setTimeout(()=>{
      wheelArea.style.opacity = "1";
      wheelArea.style.pointerEvents = "auto";
      wheelArea.classList.add("show");
      renderWheel();
      hint.textContent="Vuốt lên / xuống • ↑ ↓ để chọn • Enter để xác nhận";
      syncQuickTools();
    },180);
  }
  question.addEventListener("pointerup",openQuestion1,{passive:false});
  question.addEventListener("click",openQuestion1);

  question.addEventListener("keydown", (e) => {
    const cta = e.target.closest(".landing-cta");
    if(!cta) return;
    if(cta.classList.contains("locked")) return;
    if(e.key === "Enter" || e.key === " "){
      e.preventDefault();
      openQuestion1(e);
    }
  });

  confirm.addEventListener("click",()=>{
    if(isChecklistLocked()){
      resetHome();
      return;
    }
    const selected = names[current];
    if(!selected) return;
    showQuestion2();
  });

  function showQuestion2(){
    wheelArea.classList.remove("show");
    wheelArea.style.opacity = "0";
    wheelArea.style.pointerEvents = "none";
    confirm.classList.remove("show");

    counter.textContent="CÂU 2";
    question.innerHTML=`<div class="system-question">
      <div class="system-question-title">HỆ THỐNG ĐẢO MÈO</div>
      <div class="system-question-sub">Hôm nay bạn đã hoàn thành checklist chưa?</div>
    </div>`;
    question.style.opacity="1";question.style.pointerEvents="none";question.style.transform="scale(1)";
    const box=document.createElement("div");
    box.id="q2answers";
    box.innerHTML=`<button id="doneBtn">Tôi đã hoàn thành</button><button id="laterBtn">Tôi chưa hoàn thành</button>`;
    root.appendChild(box);
    Object.assign(box.style,{position:"absolute",left:"50%",top:"64%",transform:"translate(-50%,0)",zIndex:"22",
      display:"flex",flexDirection:"column",gap:"12px",width:"min(88vw,390px)",opacity:"0",transition:"opacity .25s"});
    [...box.children].forEach(b=>Object.assign(b.style,{minHeight:"50px",padding:"10px 18px",borderRadius:"999px",
      border:"1px solid rgba(255,255,255,.25)",color:"#fff",fontSize:"15px",fontWeight:"700",
      background:"rgba(255,255,255,.07)",backdropFilter:"blur(10px)"}));
    box.querySelector("#doneBtn").style.background="linear-gradient(135deg,#ff3c91,#ff70b9)";
    requestAnimationFrame(()=>box.style.opacity="1");

    box.querySelector("#doneBtn").addEventListener("click",()=>{
      const completedIndex=current, selected=names[current];
      box.remove();

      question.style.opacity = "0";
      question.style.pointerEvents = "none";
      hint.textContent = "";
      message.classList.remove("show");

      checkin(selected, completedIndex);

      checklistPanel.classList.add("show");
      checklistPanel.style.visibility = "visible";
      checklistPanel.style.opacity = "1";
      checklistPanel.style.pointerEvents = "auto";

      const row = checklistBody.querySelector(`tr[data-index="${completedIndex}"]`);
      if(row) {
        setTimeout(() => row.scrollIntoView({block:"center", behavior:"smooth"}), 80);
      }
    });

    box.querySelector("#laterBtn").addEventListener("click",()=>{
      box.remove();
      showMessage(`<div class="later-message"><span class="later-title">Không sao!</span><span class="later-name">Cố lên “${names[current]}” 💪</span></div>`,0);
    });
  }
  
  // ---------- Chụp checklist ----------
  let html2canvasPromise = null;
  function ensureHtml2Canvas(){
    if(typeof html2canvas === "function") return Promise.resolve();
    if(html2canvasPromise) return html2canvasPromise;
    html2canvasPromise = new Promise((resolve,reject)=>{
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
      s.onload = resolve;
      s.onerror = () => reject(new Error("Không tải được công cụ chụp"));
      document.head.appendChild(s);
    });
    return html2canvasPromise;
  }

  async function captureChecklist(){
    if(!checklistPanel.classList.contains("show")) return;

    captureBtn.disabled = true;
    const oldText = captureBtn.textContent;
    captureBtn.textContent = "⏳ Đang tải công cụ…";
    try{
      await ensureHtml2Canvas();
    }catch(e){
      setStatus(e.message || "Không tải được công cụ chụp");
      captureBtn.disabled = false;
      captureBtn.textContent = oldText;
      return;
    }

    captureBtn.textContent = "⏳ Đang tạo ảnh…";

    const clone = checklistPanel.cloneNode(true);
    clone.id = "checklistCaptureTemp";
    clone.querySelector("#checklistActions")?.remove();

    clone.style.cssText = `
      position:absolute !important;
      left:-100000px !important;
      top:0 !important;
      width:${Math.min(window.innerWidth * 0.90, 460)}px !important;
      max-height:none !important;
      height:auto !important;
      transform:none !important;
      opacity:1 !important;
      visibility:visible !important;
      pointer-events:none !important;
      background:linear-gradient(145deg,#ffffff,#f4faf3 55%,#edf6eb) !important;
      padding:22px !important;
      border-radius:26px !important;
      border:1px solid #cbdcc9 !important;
      box-shadow:0 16px 45px rgba(53,91,61,.12) !important;
      overflow:visible !important;
    `;

    const scroll = clone.querySelector("#checklistScroll");

    if(scroll){
      scroll.style.maxHeight = "none";
      scroll.style.height = "auto";
      scroll.style.overflow = "visible";
      scroll.style.borderRadius = "20px";
    }

    document.body.appendChild(clone);

    let blob = null;
    let imageUrl = null;

    try{
      await new Promise(r =>
        requestAnimationFrame(() =>
          requestAnimationFrame(r)
        )
      );

      const canvas = await html2canvas(clone,{
        backgroundColor:null,
        scale:Math.min(3, Math.max(2, window.devicePixelRatio || 2)),
        useCORS:true,
        allowTaint:false,
        logging:false,
        imageTimeout:10000,
        width:clone.offsetWidth,
        height:clone.scrollHeight,
        windowWidth:clone.offsetWidth,
        windowHeight:clone.scrollHeight
      });

      blob = await new Promise(resolve =>
        canvas.toBlob(resolve,"image/png",1)
      );

      if(!blob){
        throw new Error("Không tạo được ảnh");
      }

      imageUrl = URL.createObjectURL(blob);

      showCapturePreview(imageUrl, blob);

      setStatus("Đã tạo ảnh checklist ✓");

    }catch(err){

      console.error(err);
      setStatus("Chụp checklist thất bại");

      if(imageUrl){
        URL.revokeObjectURL(imageUrl);
        imageUrl = null;
      }

    }finally{

      clone.remove();
      captureBtn.disabled = false;
      captureBtn.textContent = oldText;
    }
  }

  async function captureTop(){
    if(!topPanel.classList.contains("show")) return;

    const btn = document.getElementById("topCaptureBtn");
    if(!btn) return;

    btn.disabled = true;
    const oldText = btn.textContent;
    btn.textContent = "⏳ Đang tạo ảnh…";

    let clone = null;
    let imageUrl = null;

    try{
      await ensureHtml2Canvas();

      clone = topPanel.cloneNode(true);
      clone.id = "topCaptureTemp";
      clone.querySelector("#topActions")?.remove();

      Object.assign(clone.style,{
        position:"absolute",
        left:"-100000px",
        top:"0",
        width:Math.min(window.innerWidth * 0.92,500) + "px",
        maxHeight:"none",
        height:"auto",
        transform:"none",
        opacity:"1",
        visibility:"visible",
        pointerEvents:"none",
        background:"linear-gradient(145deg,#ffffff,#f4faf3 55%,#edf6eb)",
        border:"1px solid #cbdcc9",
        boxShadow:"0 16px 45px rgba(53,91,61,.12)",
        overflow:"visible"
      });

      const select = clone.querySelector("#topMonthSelect");
      if(select){
        Object.assign(select.style,{
          background:"#f7fbf6",
          color:"#315744",
          borderColor:"#cbdcc9",
          boxShadow:"none",
          backgroundImage:"none",
          paddingRight:"14px"
        });
      }

      const scroll = clone.querySelector("#topScroll");
      if(scroll){
        scroll.style.maxHeight = "none";
        scroll.style.height = "auto";
        scroll.style.overflow = "visible";
      }

      document.body.appendChild(clone);
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));

      const canvas = await html2canvas(clone,{
        backgroundColor:null,
        scale:Math.min(3,Math.max(2,window.devicePixelRatio||2)),
        useCORS:true,
        allowTaint:false,
        logging:false,
        imageTimeout:10000,
        width:clone.offsetWidth,
        height:clone.scrollHeight,
        windowWidth:clone.offsetWidth,
        windowHeight:clone.scrollHeight
      });

      const blob = await new Promise(resolve=>canvas.toBlob(resolve,"image/png",1));
      if(!blob) throw new Error("Không tạo được ảnh BXH");

      imageUrl = URL.createObjectURL(blob);
      showCapturePreview(imageUrl,blob,"📸 BXH TOP đã chụp","bxh-top-dao-meo.png","Chrome / Cốc Cốc: bấm Lưu ảnh hoặc nhấn giữ vào ảnh để lưu.");
      setStatus("Đã tạo ảnh BXH ✓");
    }catch(err){
      console.error(err);
      setStatus(err?.message || "Chụp BXH thất bại");
      if(imageUrl){
        try{URL.revokeObjectURL(imageUrl)}catch(_){}
        imageUrl=null;
      }
    }finally{
      clone?.remove();
      btn.disabled=false;
      btn.textContent=oldText;
    }
  }

function showCapturePreview(imageUrl, blob, previewTitle="📸 Checklist đã chụp", filename="checklist-dao-meo.png", previewHint="Chrome / Cốc Cốc: bấm Lưu ảnh hoặc nhấn giữ vào ảnh để lưu."){

    document.getElementById("capturePreview")?.remove();

    const overlay = document.createElement("div");
    overlay.id = "capturePreview";
    overlay.innerHTML = `
      <div class="capturePreviewBox">
        <div class="capturePreviewTitle"></div>

        <div class="capturePreviewImageWrap">
          <img
            id="capturePreviewImage"
            src="${imageUrl}"
            alt="Checklist"
          >
        </div>

        <div class="capturePreviewHint"></div>

        <div class="capturePreviewActions">
          <button type="button" id="captureShareBtn">
            ↗ Chia sẻ
          </button>

          <a
            id="captureDownloadBtn"
            href="${imageUrl}"
            download="checklist-dao-meo.png"
          >
            ↓ Lưu ảnh
          </a>

          <button type="button" id="captureCloseBtn">
            Đóng
          </button>
        </div>
      </div>
    `;

    overlay.querySelector(".capturePreviewTitle").textContent = previewTitle;
    overlay.querySelector(".capturePreviewHint").textContent = previewHint;
    overlay.querySelector("#captureDownloadBtn").download = filename;

    document.body.appendChild(overlay);

    const cleanup = () => {
      overlay.remove();
      try{
        URL.revokeObjectURL(imageUrl);
      }catch(_){}
    };

    overlay.querySelector("#captureCloseBtn")
      .addEventListener("click",cleanup);

    overlay.addEventListener("click",e=>{
      if(e.target === overlay) cleanup();
    });

    overlay.querySelector("#captureDownloadBtn")
      .addEventListener("click",()=>{
        setStatus("Đang lưu ảnh…");
      });

    overlay.querySelector("#captureShareBtn")
      .addEventListener("click",async()=>{

        const shareBtn =
          overlay.querySelector("#captureShareBtn");

        shareBtn.disabled = true;
        shareBtn.textContent = "⏳ Đang mở…";

        try{

          const file = new File(
            [blob],
            "checklist-dao-meo.png",
            {type:"image/png"}
          );

          if(
            navigator.share &&
            (
              !navigator.canShare ||
              navigator.canShare({files:[file]})
            )
          ){

            await navigator.share({
              files:[file],
              title:"Checklist Đảo Mèo",
              text:"Checklist nhiệm vụ"
            });

            setStatus("Đã mở chia sẻ ✓");

          }else{

            setStatus(
              "Trình duyệt chưa hỗ trợ chia sẻ file. Hãy bấm Lưu ảnh."
            );

          }

        }catch(err){

          if(
            String(err?.name || "") !==
            "AbortError"
          ){
            console.error(err);
            setStatus("Không thể mở chia sẻ");
          }

        }finally{

          shareBtn.disabled = false;
          shareBtn.textContent = "↗ Chia sẻ";
        }
      });
  }

  captureBtn.addEventListener("click",captureChecklist);
  document.getElementById("topCaptureBtn")?.addEventListener("click",captureTop);


  // ---------- Navigation ----------
  function resetHome(){
    document.getElementById("q2answers")?.remove();
    closeTop();
    checklistPanel.classList.remove("show");
    checklistPanel.style.visibility = "hidden";
    checklistPanel.style.opacity = "0";
    checklistPanel.style.pointerEvents = "none";

    if(typeof restartAutoSync === "function") restartAutoSync();

    message.classList.remove("show");
    wheelArea.classList.remove("show");
    wheelArea.style.opacity = "0";
    wheelArea.style.pointerEvents = "none";
    confirm.classList.remove("show");

    syncQuickTools();

    q1Opened = false;
    current = 0;
    dragOffset = 0;
    dragging = false;

    counter.textContent = "CÂU 1";
    renderLandingState();

    hint.textContent = isChecklistLocked() ? "" : (names.length ? "Chạm vào câu hỏi" : "Đang tải dữ liệu…");
    renderWheel();
  }

  homeBtn.addEventListener("click", ()=>{resetHome();if(typeof syncQuickTools==="function")syncQuickTools()});

  checklistBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const willShow = !checklistPanel.classList.contains("show");

    if (willShow) {
      closeTop();
      checklistPanel.classList.add("show");
      checklistPanel.style.visibility = "visible";
      checklistPanel.style.opacity = "1";
      checklistPanel.style.pointerEvents = "auto";
      renderChecklist();
      if(!initialSheetLoaded) loadData(false);
      checklistBtn.setAttribute("aria-expanded", "true");
    } else {
      checklistPanel.classList.remove("show");
      checklistPanel.style.visibility = "hidden";
      checklistPanel.style.opacity = "0";
      checklistPanel.style.pointerEvents = "none";
      checklistBtn.setAttribute("aria-expanded", "false");
    }

    restartAutoSync();

    syncQuickTools();
  });

  topBtn.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    closeAdmin();
    checklistPanel.classList.remove("show");
    checklistPanel.style.visibility = "hidden";
    checklistPanel.style.opacity = "0";
    checklistPanel.style.pointerEvents = "none";

    resetTopToCurrentMonth();
    topPanel.classList.add("show");
    topPanel.setAttribute("aria-hidden","false");
    renderTop();
    syncQuickTools();
  });

  topMonthSelect?.addEventListener("change", ()=>{
    renderTop(Number(topMonthSelect.value));
  });

  initTopMonthSelect();

  topCloseBtn.addEventListener("click", ()=>{closeTop();if(typeof syncQuickTools==="function")syncQuickTools()});
  topPanel.addEventListener("click", e => { if(e.target === topPanel) closeTop(); });

  syncBtn.addEventListener("click",()=>{
    lastAutoSyncAt = Date.now();
    loadData(true, true);
  });

  loadChecklistLockTime();
  checklistLockTimeInput.value = checklistLockTime;
  renderLandingState();

  let _loadDataPromise = null;
  if(cacheLoad()){
    initialSheetLoaded = true;
    renderChecklist();
    buildWheel();
    renderAdminChecklistEditor();
    hint.textContent = names.length ? "Chạm vào câu hỏi" : "Đang tải dữ liệu…";
    setStatus("Đã tải dữ liệu lưu ✓");
    _loadDataPromise = loadData(false, true);
  }else{
    _loadDataPromise = loadData(true);
  }

  (async()=>{
    try{
      await _dataLoadPromise;

      const s = await getSettingsCached(false);
      if(isValid24hTime(s.resetTime)) resetTime = s.resetTime;
      if(isValid24hTime(s.checklistLockTime)){
        checklistLockTime = s.checklistLockTime;
        saveChecklistLockTime(checklistLockTime);
        checklistLockTimeInput.value = checklistLockTime;
      }
      renderLandingState();
    }catch(_){}
  })();

  scheduleNextReset();

  _cachedLocked = isChecklistLocked();

  setInterval(()=>{
    if(document.hidden) return;

    const now = Date.now();

    if(now - _lastLockCheck > 30000){
      _lastLockCheck = now;
      const nextLocked = isChecklistLocked();
      const lockChanged = nextLocked !== _cachedLocked;
      _cachedLocked = nextLocked;

      if(!q1Opened && !checklistPanel.classList.contains("show") && !topPanel.classList.contains("show")){
        if(lockChanged || names.length > 0){
          renderLandingState();
        }
      }
    }

    if(!q1Opened && !checklistPanel.classList.contains("show") && !topPanel.classList.contains("show")){
      if(_cachedLocked){
        if(hint.textContent !== "") hint.textContent = "";
      }else if(names.length){
        if(hint.textContent !== "Chạm vào câu hỏi") hint.textContent = "Chạm vào câu hỏi";
      }
    }
  }, 1000);

  startAutoSync();

  document.addEventListener("keydown", (e) => {
    if(e.key !== "Escape") return;

    const capturePreview = document.getElementById("capturePreview");
    if(capturePreview){ capturePreview.remove(); e.preventDefault(); return; }

    if(quizBuilderOverlay.classList.contains("show")){ closeQuizBuilder(); e.preventDefault(); return; }
    if(quizResultOverlay.classList.contains("show")){ closeQuizResult(); e.preventDefault(); return; }
    if(quizTakeOverlay.classList.contains("show")){
      if(confirm("Bạn đang làm bài kiểm tra. Thoát sẽ mất toàn bộ câu trả lời. Tiếp tục thoát?")){
        quizTakeOverlay.classList.remove("show");
        quizTakeOverlay.setAttribute("aria-hidden", "true");
        quizCurrentIndex = 0;
        quizCurrentScore = 0;
        quizSelectedAnswer = -1;
        syncQuickTools();
      }
      e.preventDefault();
      return;
    }
    if(quizNameOverlay.classList.contains("show")){ closeQuizNamePicker(); e.preventDefault(); return; }
    if(quizOverlay.classList.contains("show")){ closeQuiz(); e.preventDefault(); return; }
    const lunchPageEl = document.getElementById("lunchPage");
    if(lunchPageEl && lunchPageEl.classList.contains("show")){ closeLunchChoice(); e.preventDefault(); return; }
    if(lunchManageOverlay.classList.contains("show")){ closeLunchManage(); e.preventDefault(); return; }
    if(lunchChoiceOverlay.classList.contains("show")){ closeLunchChoice(); e.preventDefault(); return; }
    if(linkEditorOverlay.classList.contains("show")){ closeLinkEditor(); e.preventDefault(); return; }
    if(monitorOverlay.classList.contains("show")){ closeMonitor(); e.preventDefault(); return; }
    if(topPanel.classList.contains("show")){ closeTop(); if(typeof syncQuickTools === "function") syncQuickTools(); e.preventDefault(); return; }
    if(checklistPanel.classList.contains("show")){
      checklistPanel.classList.remove("show"); checklistPanel.style.visibility="hidden"; checklistPanel.style.opacity="0"; checklistPanel.style.pointerEvents="none";
      if(typeof syncQuickTools === "function") syncQuickTools(); e.preventDefault(); return;
    }
    if(kdvRulesOverlay.classList.contains("show")){ closeKdvRules(); e.preventDefault(); return; }
    if(adminOverlay.classList.contains("show")){ closeAdmin(); e.preventDefault(); return; }
    if(adminPasswordOverlay.style.display === "flex"){ closeAdminPassword(); e.preventDefault(); return; }

    const attendanceNameWheel = document.getElementById("attendanceNameWheel");
    if(attendanceNameWheel && attendanceNameWheel.classList.contains("show")){
      attendanceNameWheel.classList.remove("show"); attendanceNameWheel.setAttribute("aria-hidden", "true");
      if(typeof syncQuickTools === "function") syncQuickTools(); e.preventDefault(); return;
    }
    const attendanceStatusOverlay = document.getElementById("attendanceStatusOverlay");
    if(attendanceStatusOverlay && attendanceStatusOverlay.classList.contains("show")){
      attendanceStatusOverlay.classList.remove("show"); attendanceStatusOverlay.setAttribute("aria-hidden", "true"); e.preventDefault(); return;
    }
    const attendancePage = document.getElementById("attendancePage");
    if(attendancePage && attendancePage.classList.contains("show")){
      if(typeof window.__closeAttendancePage === "function") window.__closeAttendancePage(); else attendancePage.classList.remove("show");
      if(typeof syncQuickTools === "function") syncQuickTools(); e.preventDefault(); return;
    }
    if(wheelArea.classList.contains("show")){
      if(typeof resetHome === "function") resetHome(); e.preventDefault(); return;
    }
  });
  document.addEventListener("visibilitychange", () => {
    if(document.hidden) return;
    _lastLockCheck = 0;
  });

  const QUIZ_DATA_KEY="srank_quiz_questions_v1";
  const QUIZ_SCORE_KEY="srank_quiz_scores_v1";
  let quizQuestions=[];
  let quizScores={};
  let quizCurrentName="";
  let quizCurrentIndex=0;
  let quizCurrentScore=0;
  let quizSelectedAnswer=-1;

  function loadQuizStore(){
    try{
      const q=JSON.parse(localStorage.getItem(QUIZ_DATA_KEY)||"[]");
      const s=JSON.parse(localStorage.getItem(QUIZ_SCORE_KEY)||"{}");
      quizQuestions=Array.isArray(q)?q:[];
      quizScores=s&&typeof s==="object"?s:{};
    }catch(_){quizQuestions=[];quizScores={};}
  }
  function saveQuizStore(){
    try{
      localStorage.setItem(QUIZ_DATA_KEY,JSON.stringify(quizQuestions));
      localStorage.setItem(QUIZ_SCORE_KEY,JSON.stringify(quizScores));
    }catch(_){}
  }
  function normalizeQuizQuestion(q){
    return {
      question:String(q.question||"").trim(),
      answers:Array.isArray(q.answers)?q.answers.map(a=>({text:String(a.text||"").trim(),correct:!!a.correct})).filter(a=>a.text):[]
    };
  }
  function validQuizQuestions(){
    return quizQuestions.map(normalizeQuizQuestion).filter(q=>q.question&&q.answers.length>=2&&q.answers.some(a=>a.correct));
  }
  function renderQuizLeaderboard(){
    quizLeaderboardBody.innerHTML="";
    const rows=Object.entries(quizScores)
      .filter(([n,s])=>Number.isFinite(Number(s)))
      .sort((a,b)=>Number(b[1])-Number(a[1])||a[0].localeCompare(b[0],"vi"));
    quizEmpty.style.display=rows.length?"none":"block";
    rows.forEach(([name,score],i)=>{
      const tr=document.createElement("tr");
      const a=document.createElement("td");a.textContent=String(i+1);
      const b=document.createElement("td");b.textContent=name;
      const c=document.createElement("td");c.textContent=`${Number(score)} điểm`;
      tr.append(a,b,c);quizLeaderboardBody.appendChild(tr);
    });
  }
  function syncQuickTools(){
    renderQuizAdminButton();

    const otherViewOpen =
      kdvRulesOverlay.classList.contains("show") ||
      monitorOverlay.classList.contains("show") ||
      topPanel.classList.contains("show") ||
      checklistPanel.classList.contains("show") ||
      adminOverlay.classList.contains("show") ||
      adminPasswordOverlay.style.display === "flex" ||
      linkEditorOverlay.classList.contains("show") ||
      quizOverlay.classList.contains("show") ||
      quizNameOverlay.classList.contains("show") ||
      quizTakeOverlay.classList.contains("show") ||
      quizResultOverlay.classList.contains("show") ||
      quizBuilderOverlay.classList.contains("show") ||
      wheelArea.classList.contains("show") ||
      message.classList.contains("show") ||
      confirm.classList.contains("show") ||
      document.getElementById('attendanceNameWheel')?.classList.contains('show') ||
      document.getElementById('attendancePage')?.classList.contains('show') ||
      document.getElementById('lunchPage')?.classList.contains('show');

    secondaryNav.classList.toggle("nav-hidden", otherViewOpen);
    document.getElementById('pageNav')?.classList.toggle('nav-hidden', otherViewOpen);
    secondaryNav.setAttribute("aria-hidden", otherViewOpen ? "true" : "false");
    lunchResult.classList.toggle("show", !otherViewOpen && lunchResult.dataset.hasResult === "1");
    lunchResult.setAttribute("aria-hidden", otherViewOpen ? "true" : "false");
  }
  function renderQuizAdminButton(){
    quizAdminBtn.hidden=!adminUnlocked;
    secondaryNav.classList.toggle("admin-visible", !!adminUnlocked);
  }

  function openQuiz(){
    closeTop();
    closeMonitor();
    closeAdmin();
    checklistPanel.classList.remove("show");
    checklistPanel.style.visibility="hidden";
    checklistPanel.style.opacity="0";
    checklistPanel.style.pointerEvents="none";
    loadQuizStore();
    renderQuizLeaderboard();
    quizOverlay.classList.add("show");
    quizOverlay.setAttribute("aria-hidden","false");
    syncQuickTools();
  }
  function closeQuiz(){
    quizOverlay.classList.remove("show");
    quizOverlay.setAttribute("aria-hidden","true");
    syncQuickTools();
  }
  function renderQuizNameList(){
    quizNameList.innerHTML = "";
    if(!names.length){
      const e = document.createElement("div");
      e.className = "quizNoNames";
      e.textContent = "Chưa có danh sách người chơi.";
      quizNameList.appendChild(e);
      return;
    }
    names.forEach(name => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "quizNameItem";
      b.textContent = `👤 ${String(name).slice(0, 60)}`;
      b.addEventListener("click", () => startQuizForName(name));
      quizNameList.appendChild(b);
    });
  }
  function openQuizNamePicker(){
    const qs=validQuizQuestions();
    if(!qs.length){alert("Chưa có câu hỏi. Admin cần tạo bài kiểm tra trước.");return;}
    renderQuizNameList();
    quizNameOverlay.classList.add("show");
    quizNameOverlay.setAttribute("aria-hidden","false");
    syncQuickTools();
  }
  function closeQuizNamePicker(){
    quizNameOverlay.classList.remove("show");
    quizNameOverlay.setAttribute("aria-hidden","true");
    syncQuickTools();
  }
  function startQuizForName(name){
    quizQuestions=validQuizQuestions();
    quizCurrentName=String(name);
    quizCurrentIndex=0;quizCurrentScore=0;quizSelectedAnswer=-1;
    closeQuizNamePicker();
    quizTakeOverlay.classList.add("show");
    quizTakeOverlay.setAttribute("aria-hidden","false");
    renderQuizQuestion();syncQuickTools();
  }
  function renderQuizQuestion(){
    const q = quizQuestions[quizCurrentIndex];
    if(!q){ finishQuiz(); return; }

    quizProgress.textContent = `Câu ${quizCurrentIndex+1}/${quizQuestions.length}`;

    quizQuestion.textContent = String(q.question || "").slice(0, 500);

    quizAnswers.innerHTML = "";
    quizSelectedAnswer = -1;
    quizNextBtn.disabled = true;
    quizNextBtn.textContent = quizCurrentIndex === quizQuestions.length - 1 ? "Hoàn thành" : "Tiếp tục";

    q.answers.forEach((a, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "quizAnswer";

      const l = document.createElement("span");
      l.className = "quizAnswerLetter";
      l.textContent = String.fromCharCode(65 + i);

      const t = document.createElement("span");
      t.textContent = String(a.text || "").slice(0, 300);

      b.append(l, t);
      b.addEventListener("click", () => {
        quizSelectedAnswer = i;
        [...quizAnswers.children].forEach(x => x.classList.remove("selected"));
        b.classList.add("selected");
        quizNextBtn.disabled = false;
      });
      quizAnswers.appendChild(b);
    });
  }
  function submitQuizAnswer(){
    if(quizSelectedAnswer<0)return;
    const q=quizQuestions[quizCurrentIndex];
    if(q.answers[quizSelectedAnswer]?.correct)quizCurrentScore+=10;
    quizCurrentIndex++;
    if(quizCurrentIndex>=quizQuestions.length)finishQuiz();else renderQuizQuestion();
  }
  function finishQuiz(){
    quizScores[quizCurrentName]=quizCurrentScore;saveQuizStore();
    quizTakeOverlay.classList.remove("show");quizTakeOverlay.setAttribute("aria-hidden","true");
    quizResultName.textContent=quizCurrentName;
    quizResultScore.textContent=`${quizCurrentScore} điểm`;
    quizResultDetail.textContent=`Đúng ${Math.round(quizCurrentScore/10)}/${quizQuestions.length} câu • Mỗi câu đúng +10 điểm`;
    quizResultOverlay.classList.add("show");quizResultOverlay.setAttribute("aria-hidden","false");syncQuickTools();
  }
  function closeQuizResult(){
    quizResultOverlay.classList.remove("show");quizResultOverlay.setAttribute("aria-hidden","true");
    renderQuizLeaderboard();quizOverlay.classList.add("show");quizOverlay.setAttribute("aria-hidden","false");syncQuickTools();
  }

  function defaultQuizQuestion(){return {question:"",answers:[{text:"",correct:true},{text:"",correct:false}]}}
  function renderQuizBuilder(){
    quizBuilderList.innerHTML="";
    quizQuestions.forEach((q,qi)=>{
      const card=document.createElement("article");card.className="quizQuestionCard";
      const head=document.createElement("div");head.className="quizQuestionHead";
      const no=document.createElement("span");no.className="quizQuestionNo";no.textContent=`Câu ${qi+1}`;
      const remove=document.createElement("button");remove.type="button";remove.className="quizQuestionRemove";remove.textContent="Xoá câu";
      remove.addEventListener("click",()=>{quizQuestions.splice(qi,1);if(!quizQuestions.length)quizQuestions.push(defaultQuizQuestion());renderQuizBuilder()});
      head.append(no,remove);card.appendChild(head);
      const qin=document.createElement("textarea");qin.className="quizQuestionInput";qin.placeholder="Nhập nội dung câu hỏi…";qin.value=q.question||"";
      qin.addEventListener("input",e=>quizQuestions[qi].question=e.target.value);card.appendChild(qin);
      q.answers.forEach((a,ai)=>{
        const row=document.createElement("div");row.className="quizAnswerEdit";
        const letter=document.createElement("span");letter.className="letter";letter.textContent=String.fromCharCode(65+ai);
        const ain=document.createElement("input");ain.type="text";ain.className="quizAnswerInput";ain.placeholder=`Đáp án ${String.fromCharCode(65+ai)}`;ain.value=a.text||"";
        ain.addEventListener("input",e=>quizQuestions[qi].answers[ai].text=e.target.value);
        const radio=document.createElement("input");radio.type="radio";radio.className="quizCorrectRadio";radio.name=`quizCorrect_${qi}`;radio.checked=!!a.correct;radio.title="Đáp án đúng";
        radio.addEventListener("change",()=>quizQuestions[qi].answers.forEach((x,idx)=>x.correct=idx===ai));
        row.append(letter,ain,radio);card.appendChild(row);
      });
      const add=document.createElement("button");add.type="button";add.className="quizAddAnswer";add.textContent="＋ Thêm đáp án";
      add.addEventListener("click",()=>{quizQuestions[qi].answers.push({text:"",correct:false});renderQuizBuilder()});
      card.appendChild(add);quizBuilderList.appendChild(card);
    });
  }
  function openQuizBuilder(){
    if(!adminUnlocked){openAdminPassword();return}
    loadQuizStore();if(!quizQuestions.length)quizQuestions=[defaultQuizQuestion()];
    renderQuizBuilder();quizBuilderStatus.textContent="";
    quizBuilderOverlay.classList.add("show");quizBuilderOverlay.setAttribute("aria-hidden","false");syncQuickTools();
  }
  function closeQuizBuilder(){quizBuilderOverlay.classList.remove("show");quizBuilderOverlay.setAttribute("aria-hidden","true");syncQuickTools()}
  function saveQuizBuilder(){
    const clean=quizQuestions.map(normalizeQuizQuestion);let error="";
    clean.forEach((q,i)=>{
      if(!error&&!q.question)error=`Câu ${i+1} chưa có nội dung.`;
      else if(!error&&q.answers.length<2)error=`Câu ${i+1} phải có ít nhất 2 đáp án.`;
      else if(!error&&!q.answers.some(a=>a.correct))error=`Câu ${i+1} chưa chọn đáp án đúng.`;
    });
    if(error){quizBuilderStatus.textContent=error;return}
    quizQuestions=clean;saveQuizStore();quizBuilderStatus.textContent=`Đã lưu ${quizQuestions.length} câu hỏi ✓`;
    setTimeout(closeQuizBuilder,500);
  }


  const LUNCH_SAVORY = [
    "Thịt kho trứng","Thịt rang cháy cạnh","Thịt xào hành tây","Thịt xào sả ớt","Thịt xào rau củ","Thịt xào lá khế","Sườn xào chua ngọt","Sườn ram mặn","Sườn nướng","Sườn kho tiêu",
    "Gà chiên nước mắm","Gà kho gừng","Gà kho sả","Gà chiên giòn","Gà xào sả ớt","Gà nướng","Gà kho tiêu","Gà rim nước mắm","Gà rang gừng","Gà xào nấm",
    "Cá kho tộ","Cá kho tiêu","Cá chiên mắm","Cá chiên sốt cà","Cá nướng","Cá hấp gừng","Cá sốt cà chua","Cá kho nghệ","Cá chiên giòn","Cá kho riềng",
    "Tôm rim mặn ngọt","Tôm rang me","Tôm rang thịt","Tôm kho tàu","Mực xào rau củ","Mực chiên nước mắm","Mực xào cần tây","Trứng chiên thịt bằm","Trứng chiên cà chua","Trứng kho",
    "Đậu hũ sốt cà chua","Đậu hũ chiên sả ớt","Đậu hũ sốt thịt bằm","Rau muống xào tỏi","Rau muống xào thịt bò","Cải thìa xào tỏi","Bắp cải xào trứng","Khổ qua xào trứng","Cà tím xào thịt","Đậu que xào thịt bò"
  ];
  const LUNCH_SOUP = [
    "Canh chua cá","Canh chua tôm","Canh chua thịt","Canh bí đỏ nấu thịt bằm","Canh bí xanh nấu tôm","Canh bầu nấu tôm","Canh mồng tơi nấu tôm","Canh rau ngót thịt bằm","Canh cải xanh thịt bằm","Canh cải thìa thịt bằm",
    "Canh khổ qua nhồi thịt","Canh khổ qua nấu tôm","Canh bí đao thịt bằm","Canh bí đao nấu tôm","Canh khoai mỡ thịt bằm","Canh khoai mỡ tôm","Canh rau đay mồng tơi","Canh cua rau đay","Canh cua mồng tơi","Canh cua rau ngót",
    "Canh cải chua thịt bằm","Canh cải chua cá","Canh cải chua sườn","Canh cà chua trứng","Canh cà chua thịt bằm","Canh nấm thịt bằm","Canh nấm đậu hũ","Canh rong biển thịt bằm","Canh rong biển đậu hũ","Canh rong biển trứng",
    "Canh bắp cải thịt bằm","Canh bắp cải cuộn thịt","Canh rau củ thịt bằm","Canh rau củ hầm xương","Canh củ sen hầm sườn","Canh mướp nấu mồng tơi","Canh mướp nấu tôm","Canh mướp đắng nhồi thịt","Canh rau muống nấu chua","Canh rau muống nấu tôm",
    "Canh bí xanh thịt bằm","Canh cải ngọt thịt bằm","Canh cải ngọt nấu tôm","Canh cải thảo thịt bằm","Canh cải thảo nấu tôm","Canh đậu hũ cà chua","Canh giá đỗ thịt bằm","Canh bầu thịt bằm","Canh rau củ chay","Canh nấm rau củ"
  ];
  const LUNCH_OUT = [
    "Cơm tấm sườn","Cơm tấm sườn bì chả","Cơm gà xối mỡ","Cơm gà nướng","Cơm gà chiên mắm","Cơm bò lúc lắc","Cơm thịt nướng","Cơm heo quay","Cơm xá xíu","Cơm cá","Phở bò","Phở gà","Hủ tiếu Nam Vang","Hủ tiếu bò kho","Bún bò Huế","Bún thịt nướng","Bún chả","Bún riêu","Bún mắm","Bún đậu mắm tôm","Bún nem nướng","Bún bò xào","Bún hải sản","Mì Quảng","Cao lầu","Bánh canh cua","Bánh canh giò heo","Mì hoành thánh","Mì vịt tiềm","Mì cay","Mì trộn","Bánh mì thịt","Bánh mì xíu mại","Bánh mì chảo","Bò né","Bò kho + bánh mì","Bánh xèo","Bánh cuốn","Bánh ướt thịt nướng","Cháo gà","Cháo lòng","Súp cua","Gà rán","Gà nướng","Há cảo","Kimbap","Cơm trộn Hàn Quốc","Tokbokki","Pizza","Hamburger"
  ];
  const LUNCH_CUSTOM_KEY = "DAOMEo_LUNCH_CUSTOM_V2";
  let LUNCH_DATA = {savory:[...LUNCH_SAVORY],soup:[...LUNCH_SOUP],out:[...LUNCH_OUT]};
  try{
    const saved=JSON.parse(localStorage.getItem(LUNCH_CUSTOM_KEY)||"null");
    if(saved && Array.isArray(saved.savory) && Array.isArray(saved.soup) && Array.isArray(saved.out)){
      LUNCH_DATA={savory:saved.savory.filter(Boolean),soup:saved.soup.filter(Boolean),out:saved.out.filter(Boolean)};
      if(!LUNCH_DATA.savory.length) LUNCH_DATA.savory=[...LUNCH_SAVORY];
      if(!LUNCH_DATA.soup.length) LUNCH_DATA.soup=[...LUNCH_SOUP];
      if(!LUNCH_DATA.out.length) LUNCH_DATA.out=[...LUNCH_OUT];
      saveLunchData();
    }else{
      const old=JSON.parse(localStorage.getItem("DAOMEo_LUNCH_CUSTOM_V1")||"null");
      if(old && Array.isArray(old.home)) LUNCH_DATA.savory.push(...old.home.filter(Boolean));
      if(old && Array.isArray(old.out)) LUNCH_DATA.out.push(...old.out.filter(Boolean));
      localStorage.setItem(LUNCH_CUSTOM_KEY,JSON.stringify(LUNCH_DATA));
    }
  }catch(e){}
  function saveLunchData(){try{localStorage.setItem(LUNCH_CUSTOM_KEY,JSON.stringify(LUNCH_DATA));}catch(e){}}
  function updateLunchCounts(){
    const h=document.querySelector('.lunchModeBtn.home small'),o=document.querySelector('.lunchModeBtn.out small');
    if(h) h.textContent=LUNCH_DATA.savory.length+LUNCH_DATA.soup.length+" món";
    if(o) o.textContent=LUNCH_DATA.out.length+" món";
  }
  function randomFrom(list){return list[Math.floor(Math.random()*list.length)]||"";}
  function randomLunchChoice(mode){
    if(mode==="home") return {type:"home",savory:randomFrom(LUNCH_DATA.savory),soup:randomFrom(LUNCH_DATA.soup)};
    if(mode==="out") return {type:"out",out:randomFrom(LUNCH_DATA.out)};
    return Math.random()<0.5
      ? {type:"home",savory:randomFrom(LUNCH_DATA.savory),soup:randomFrom(LUNCH_DATA.soup)}
      : {type:"out",out:randomFrom(LUNCH_DATA.out)};
  }
  let lunchMode="all";
  let lunchRolling=false;
  let lunchTimer=null;
  function renderLunchChoice(choice){
    const body = document.getElementById("lunchResultBody");
    if(!body) return;
    const isHome = choice.type === "home";
    if(isHome){
      const savory = choice.savory || randomFrom(LUNCH_DATA.savory);
      const soup = choice.soup || randomFrom(LUNCH_DATA.soup);
      body.innerHTML = `
        <div class="lunch-result-line savory"><span class="line-label">Món mặn</span><span class="lunch-result-value"></span></div>
        <div class="lunch-result-line soup"><span class="line-label">Món canh</span><span class="lunch-result-value"></span></div>
      `;
      const values = body.querySelectorAll(".lunch-result-value");
      if(values[0]) values[0].textContent = savory;
      if(values[1]) values[1].textContent = soup;
    }else{
      const out = choice.out || randomFrom(LUNCH_DATA.out);
      body.innerHTML = `<div class="lunch-result-line out"><span class="line-label">Ăn ngoài</span><span class="lunch-result-value"></span></div>`;
      const v = body.querySelector(".lunch-result-value");
      if(v) v.textContent = out;
    }
  }
  function updateLunchAddStatus(msg){lunchAddStatus.textContent=msg;clearTimeout(updateLunchAddStatus.t);if(msg) updateLunchAddStatus.t=setTimeout(()=>lunchAddStatus.textContent="",2200);}
  function openLunchChoice(){
    updateLunchCounts();
    const page = document.getElementById("lunchPage");
    if(page){
      page.classList.add("show");
      document.body.style.overflow = "hidden";
    }
    syncQuickTools();
  }
  function closeLunchChoice(){
    const page = document.getElementById("lunchPage");
    if(page){
      page.classList.remove("show");
      document.body.style.overflow = "";
    }
    syncQuickTools();
  }
  function chooseLunchMode(mode){
    lunchMode = mode;
    pickLunch();
  }
  function pickLunch(){
    if(lunchRolling) return;
    lunchRolling = true;
    const card = document.getElementById("lunchResultCard");
    const rerollBtn = document.getElementById("lunchRerollBtn");
    if(card) card.classList.add("rolling");
    if(rerollBtn) rerollBtn.style.display = "none";
    let elapsed = 0, delay = 55;
    const roll = () => {
      if(elapsed >= 2850){
        renderLunchChoice(randomLunchChoice(lunchMode));
        if(card) card.classList.remove("rolling");
        if(rerollBtn) rerollBtn.style.display = "inline-flex";
        lunchRolling = false;
        return;
      }
      renderLunchChoice(randomLunchChoice(lunchMode));
      elapsed += delay;
      delay = Math.min(210, delay + 7);
      lunchTimer = setTimeout(roll, delay);
    };
    clearTimeout(lunchTimer);
    roll();
  }

  let lunchManageCategory="savory";
  function openLunchManage(){renderLunchManage();lunchManageOverlay.classList.add("show");lunchManageOverlay.setAttribute("aria-hidden","false");}
  function closeLunchManage(){lunchManageOverlay.classList.remove("show");lunchManageOverlay.setAttribute("aria-hidden","true");}
  function updateLunchManageStatus(msg){lunchManageStatus.textContent=msg;clearTimeout(updateLunchManageStatus.t);if(msg) updateLunchManageStatus.t=setTimeout(()=>lunchManageStatus.textContent="",1800);}
  function renderLunchManage(){
    document.querySelectorAll('.lunchManageTab').forEach(t=>t.classList.toggle('active',t.dataset.manageCategory===lunchManageCategory));
    const list=lunchManageList;list.innerHTML="";
    const arr=LUNCH_DATA[lunchManageCategory]||[];
    if(!arr.length){list.innerHTML='<div id="lunchManageEmpty">Danh sách đang trống.</div>';return;}
    arr.forEach((name,i)=>{
      const row=document.createElement('div');row.className='lunchManageRow';
      const no=document.createElement('div');no.className='lunchManageNo';no.textContent=String(i+1);
      const input=document.createElement('input');input.className='lunchManageInput';input.value=name;input.maxLength=60;input.dataset.index=i;
      const save=document.createElement('button');save.className='lunchManageSave';save.type='button';save.textContent='Lưu';save.addEventListener('click',()=>{
        const value=input.value.trim().replace(/\\s+/g,' ');if(!value){updateLunchManageStatus('Tên món không được để trống');return;}
        const duplicate=Object.entries(LUNCH_DATA).some(([cat,items])=>items.some((x,j)=>x.toLowerCase()===value.toLowerCase() && !(cat===lunchManageCategory && j===i)));
        if(duplicate){updateLunchManageStatus('Tên món này đã tồn tại');return;}
        LUNCH_DATA[lunchManageCategory][i]=value;saveLunchData();renderLunchManage();updateLunchCounts();updateLunchManageStatus('Đã cập nhật món ✓');
      });
      const del=document.createElement('button');del.className='lunchManageDelete';del.type='button';del.textContent='Xóa';del.addEventListener('click',()=>{
        if(LUNCH_DATA[lunchManageCategory].length<=1){updateLunchManageStatus('Danh sách cần có ít nhất 1 món');return;}
        if(!confirm('Xóa món “'+LUNCH_DATA[lunchManageCategory][i]+'” khỏi danh sách?')) return;
        LUNCH_DATA[lunchManageCategory].splice(i,1);saveLunchData();renderLunchManage();updateLunchCounts();updateLunchManageStatus('Đã xóa món ✓');
      });
      row.append(no,input,save,del);list.appendChild(row);
    });
  }

  function markNavButton(btn){
    document.querySelectorAll("#bottomNav button").forEach(b=>b.classList.remove("active"));
    if(btn) btn.classList.add("active");
  }
  kdvRulesBtn.addEventListener("click",()=>markNavButton(kdvRulesBtn));

  lunchBtn.addEventListener("click",openLunchChoice);
  lunchChoiceClose.addEventListener("click",closeLunchChoice);
  lunchChoiceOverlay.addEventListener("click",e=>{if(e.target===lunchChoiceOverlay)closeLunchChoice()});
  lunchModeButtons.forEach(btn=>btn.addEventListener("click",()=>chooseLunchMode(btn.dataset.mode)));

  document.getElementById("lunchBack")?.addEventListener("click", closeLunchChoice);
  document.querySelectorAll(".lunch-mode-card").forEach(btn => {
    btn.addEventListener("click", () => chooseLunchMode(btn.dataset.mode));
  });
  document.getElementById("lunchRerollBtn")?.addEventListener("click", () => {
    pickLunch();
  });
  document.getElementById("lunchAddBtn2")?.addEventListener("click", () => {
    const form = document.getElementById("lunchAddForm2");
    const input = document.getElementById("lunchAddInput2");
    if(form){
      form.classList.toggle("show");
      if(form.classList.contains("show")){
        setTimeout(() => input?.focus(), 100);
        const status = document.getElementById("lunchAddStatus2");
        if(status) status.textContent = "";
      }
    }
  });
  document.querySelectorAll(".lunch-add-cat").forEach(btn => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.addCategory;
      const input = document.getElementById("lunchAddInput2");
      const status = document.getElementById("lunchAddStatus2");
      if(!input) return;
      const name = input.value.trim().replace(/\s+/g, " ");
      if(!name){
        if(status){ status.textContent = "Vui lòng nhập tên món"; status.style.color = "#c05a3a"; }
        input.focus();
        return;
      }
      const all = Object.values(LUNCH_DATA).flat().map(x => x.toLowerCase());
      if(all.includes(name.toLowerCase())){
        if(status){ status.textContent = "Món này đã có trong danh sách"; status.style.color = "#c05a3a"; }
        return;
      }
      LUNCH_DATA[category].push(name);
      saveLunchData();
      updateLunchCounts();
      input.value = "";
      if(status){
        status.textContent = `Đã thêm "${name}" ✓`;
        status.style.color = "#4a8a58";
        setTimeout(() => { status.textContent = ""; }, 2200);
      }
    });
  });
  document.getElementById("lunchAddInput2")?.addEventListener("keydown", e => {
    if(e.key === "Enter"){
      e.preventDefault();
      document.querySelector('.lunch-add-cat.home')?.click();
    }
  });
  document.getElementById("lunchManageBtn2")?.addEventListener("click", () => {
    closeLunchChoice();
    openLunchManage();
  });
  lunchAddBtn.addEventListener("click",()=>{
    lunchAddForm.classList.toggle("show");
    if(lunchAddForm.classList.contains("show")){lunchAddInput.focus();updateLunchAddStatus("");}
  });
  document.querySelectorAll(".lunchAddCat").forEach(btn=>btn.addEventListener("click",()=>{
    const category=btn.dataset.addCategory;
    const name=lunchAddInput.value.trim().replace(/\s+/g," ");
    if(!name){updateLunchAddStatus("Vui lòng nhập tên món");lunchAddInput.focus();return;}
    const all=Object.values(LUNCH_DATA).flat().map(x=>x.toLowerCase());
    if(all.includes(name.toLowerCase())){updateLunchAddStatus("Món này đã có trong danh sách");return;}
    LUNCH_DATA[category].push(name);saveLunchData();updateLunchCounts();lunchAddInput.value="";
    updateLunchAddStatus("Đã thêm “"+name+"” vào "+(category==="savory"?"Món mặn":category==="soup"?"Món canh":"Ăn ngoài")+" ✓");
  }));
  lunchAddInput.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();document.querySelector('.lunchAddCat.savory')?.click();}});
  lunchManageBtn.addEventListener("click",openLunchManage);
  lunchManageClose.addEventListener("click",closeLunchManage);
  lunchManageOverlay.addEventListener("click",e=>{if(e.target===lunchManageOverlay)closeLunchManage()});
  document.querySelectorAll('.lunchManageTab').forEach(tab=>tab.addEventListener('click',()=>{lunchManageCategory=tab.dataset.manageCategory;renderLunchManage();}));
  quizBtn.addEventListener("click",openQuiz);
  quizClose.addEventListener("click",closeQuiz);
  quizOverlay.addEventListener("click",e=>{if(e.target===quizOverlay)closeQuiz()});
  startQuizBtn.addEventListener("click",openQuizNamePicker);
  quizNameClose.addEventListener("click",closeQuizNamePicker);
  quizNameOverlay.addEventListener("click",e=>{if(e.target===quizNameOverlay)closeQuizNamePicker()});
  quizNextBtn.addEventListener("click",submitQuizAnswer);
  quizResultClose.addEventListener("click",closeQuizResult);

  const quizTakeClose = document.getElementById("quizTakeClose");
  if(quizTakeClose){
    quizTakeClose.addEventListener("click", () => {
      if(confirm("Bạn đang làm bài kiểm tra. Thoát sẽ mất toàn bộ câu trả lời. Tiếp tục thoát?")){
        quizTakeOverlay.classList.remove("show");
        quizTakeOverlay.setAttribute("aria-hidden", "true");
        quizCurrentIndex = 0;
        quizCurrentScore = 0;
        quizSelectedAnswer = -1;
        syncQuickTools();
      }
    });
  }
  quizResultOverlay.addEventListener("click",e=>{if(e.target===quizResultOverlay)closeQuizResult()});
  quizAdminBtn.addEventListener("click",openQuizBuilder);
  quizBuilderClose.addEventListener("click",closeQuizBuilder);
  quizBuilderOverlay.addEventListener("click",e=>{if(e.target===quizBuilderOverlay)closeQuizBuilder()});
  addQuizQuestionBtn.addEventListener("click",()=>{
    quizQuestions.push(defaultQuizQuestion());renderQuizBuilder();
    setTimeout(()=>quizBuilderList.lastElementChild?.scrollIntoView({behavior:"smooth",block:"center"}),30);
  });
  saveQuizBtn.addEventListener("click",saveQuizBuilder);
  loadQuizStore();renderQuizAdminButton();syncQuickTools();

  window.__getChecklistNames = () => Array.isArray(names) ? names.slice() : [];

})();
