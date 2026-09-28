/* =========================================================
   ĐẢO MÈO — LOGIC
   - Đăng nhập bằng wheel chọn tên (API: getData từ Sheet Check!C4:C17)
   - Trang cá nhân có menu 5 mục
   - Checklist / Luật KDV / Chấm công / BXH TOP / Bữa trưa
   ========================================================= */
(() => {
  "use strict";

  // ====== CẤU HÌNH ======
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwJ1ebyNNe7fxlNR6TObBYebp7zRORGZTO0kTzlFl-S39I2vIJjDx9h0quV84od9JAfeg/exec";
  const ITEM_H = 58;              // chiều cao 1 dòng trong wheel (khớp CSS)
  const TIMEOUT_MS = 12000;       // timeout gọi API
  const CACHE_KEY = "daomeo_cache_v1";
  const LUNCH_CUSTOM_KEY = "daomeo_lunch_v1";

  // ====== DOM — MÀN ĐĂNG NHẬP ======
  const loginScreen   = document.getElementById("loginScreen");
  const profileScreen = document.getElementById("profileScreen");
  const wheelViewport = document.getElementById("wheelViewport");
  const wheelItems    = document.getElementById("wheelItems");
  const wheelShine    = document.getElementById("wheelShine");
  const loginBtn      = document.getElementById("loginBtn");
  const loginStatus   = document.getElementById("loginStatus");

  // ====== DOM — MÀN TRANG CÁ NHÂN ======
  const logoutBtn     = document.getElementById("logoutBtn");
  const profileAvatar = document.getElementById("profileAvatar");
  const profileName   = document.getElementById("profileName");

  // ====== STATE ======
  let names = [];       // 14 tên từ Sheet
  let checks = [];      // true/false đã check chưa
  let times = [];       // "HH:mm" giờ check
  let points = [];      // điểm
  let current = 0;      // index đang chọn trong wheel
  let dragging = false;
  let startY = 0;
  let dragOffset = 0;
  let currentUser = ""; // tên đăng nhập
  let currentUserIdx = -1;

  // =========================================================
  // API — JSONP (Apps Script không cho CORS)
  // =========================================================
  let requestSeq = 0;
  function callApi(action, data = {}, timeout = TIMEOUT_MS){
    return new Promise((resolve, reject) => {
      const cb = "__daomeo_cb_" + Date.now() + "_" + (++requestSeq);
      const url = new URL(SCRIPT_URL);
      url.searchParams.set("action", action);
      url.searchParams.set("callback", cb);
      for(const [k, v] of Object.entries(data)){
        url.searchParams.set(k, v);
      }

      const script = document.createElement("script");
      let done = false;

      const cleanup = () => {
        if(done) return;
        done = true;
        clearTimeout(timer);
        try { delete window[cb]; } catch(_){}
        script.remove();
      };

      window[cb] = (result) => { cleanup(); resolve(result); };

      script.onerror = () => {
        cleanup();
        reject(new Error("Không kết nối được máy chủ"));
      };

      const timer = setTimeout(() => {
        cleanup();
        reject(new Error("Máy chủ phản hồi chậm"));
      }, timeout);

      script.src = url.toString();
      document.head.appendChild(script);
    });
  }

  // =========================================================
  // TIỆN ÍCH
  // =========================================================
  function todayKey(){
    const d = new Date();
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(d);
    const get = k => parts.find(x => x.type === k)?.value || "";
    return `${get("year")}-${get("month")}-${get("day")}`;
  }

  function cacheSave(){
    try{
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        names, checks, times, points,
        day: todayKey(),
        ts: Date.now()
      }));
    }catch(_){}
  }

  function cacheLoad(){
    try{
      const raw = localStorage.getItem(CACHE_KEY);
      if(!raw) return false;
      const x = JSON.parse(raw);
      if(!x || x.day !== todayKey()) return false;
      if(!Array.isArray(x.names) || !x.names.length) return false;

      names  = x.names;
      checks = Array.isArray(x.checks)  ? x.checks.slice(0, names.length)  : names.map(() => false);
      times  = Array.isArray(x.times)   ? x.times.slice(0, names.length)   : names.map(() => "");
      points = Array.isArray(x.points)  ? x.points.slice(0, names.length)  : names.map(() => 100);
      return true;
    }catch(_){ return false; }
  }

  // Chuyển màn hình (dùng chung cho mọi screen)
  function showScreen(id){
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("screen--active"));
    const el = document.getElementById(id);
    if(el){
      el.classList.add("screen--active");
      // Reset scroll về đầu
      const wrap = el.querySelector(".page-wrap, .profile-wrap, .login-wrap");
      if(wrap) wrap.scrollTop = 0;
    }
  }

  // =========================================================
  // WHEEL CHỌN TÊN (MÀN ĐĂNG NHẬP)
  // =========================================================
  function buildWheel(){
    wheelItems.innerHTML = "";
    const frag = document.createDocumentFragment();

    names.forEach(name => {
      const el = document.createElement("div");
      el.className = "wheel-item";
      el.textContent = name;
      frag.appendChild(el);
    });

    wheelItems.appendChild(frag);
    if(current >= names.length) current = Math.max(0, names.length - 1);
    renderWheel();
  }

  function renderWheel(){
    const mid = wheelViewport.clientHeight / 2;
    const children = wheelItems.children;

    for(let i = 0; i < children.length; i++){
      const el = children[i];
      const y = (i - current) * ITEM_H + mid + dragOffset;
      const d = Math.abs(y - mid);
      const n = Math.min(1, d / (ITEM_H * 2.3));

      el.style.top = (y - ITEM_H / 2) + "px";
      el.style.transform = `scale(${1 - n * 0.28})`;
      el.style.opacity = String(0.20 + (1 - n) * 0.80);
      el.style.filter = `blur(${n * 2.5}px)`;
      el.classList.toggle("selected",
        i === current && Math.abs(dragOffset) < ITEM_H * 0.35);
    }
  }

  function flashShine(){
    if(!wheelShine) return;
    wheelShine.classList.remove("flash");
    void wheelShine.offsetWidth;
    wheelShine.classList.add("flash");
  }

  function snapWheel(){
    const steps = Math.round(-dragOffset / ITEM_H);
    let changed = false;
    if(steps !== 0){
      const next = Math.max(0, Math.min(names.length - 1, current + steps));
      if(next !== current) changed = true;
      current = next;
    }
    dragOffset = 0;
    renderWheel();
    if(changed) flashShine();
  }

  wheelViewport.addEventListener("pointerdown", (e) => {
    if(!names.length) return;
    dragging = true;
    startY = e.clientY;
    dragOffset = 0;
    wheelViewport.setPointerCapture?.(e.pointerId);
  });

  wheelViewport.addEventListener("pointermove", (e) => {
    if(!dragging) return;
    dragOffset = e.clientY - startY;
    if((current === 0 && dragOffset > 0) ||
       (current === names.length - 1 && dragOffset < 0)){
      dragOffset *= 0.25;
    }
    renderWheel();
  });

  wheelViewport.addEventListener("pointerup", (e) => {
    if(!dragging) return;
    dragging = false;
    snapWheel();
    wheelViewport.releasePointerCapture?.(e.pointerId);
  });

  wheelViewport.addEventListener("pointercancel", (e) => {
    if(!dragging) return;
    dragging = false;
    snapWheel();
    wheelViewport.releasePointerCapture?.(e.pointerId);
  });

  wheelViewport.addEventListener("wheel", (e) => {
    if(!names.length) return;
    e.preventDefault();
    if(!e.deltaY) return;
    const next = Math.max(0, Math.min(names.length - 1,
      current + (e.deltaY > 0 ? 1 : -1)));
    if(next !== current){
      current = next;
      dragOffset = 0;
      renderWheel();
      flashShine();
    }
  }, { passive: false });

  document.addEventListener("keydown", (e) => {
    if(!loginScreen.classList.contains("screen--active")) return;
    if(!names.length) return;

    if(e.key === "ArrowDown"){
      e.preventDefault();
      const next = Math.min(names.length - 1, current + 1);
      if(next !== current){ current = next; dragOffset = 0; renderWheel(); flashShine(); }
    } else if(e.key === "ArrowUp"){
      e.preventDefault();
      const next = Math.max(0, current - 1);
      if(next !== current){ current = next; dragOffset = 0; renderWheel(); flashShine(); }
    } else if(e.key === "Enter" && !loginBtn.disabled){
      e.preventDefault();
      loginBtn.click();
    }
  });

  // =========================================================
  // LOAD DANH SÁCH TÊN TỪ SHEET
  // =========================================================
  function setLoginStatus(text, type = ""){
    loginStatus.textContent = text || "";
    loginStatus.className = "login-status" + (type ? " " + type : "");
  }

  async function loadNames(){
    // 1. Thử cache trước → hiện ngay
    if(cacheLoad()){
      buildWheel();
      loginBtn.disabled = false;
      setLoginStatus(`Đã tải ${names.length} người chơi`, "ok");
    }else{
      setLoginStatus("Đang tải danh sách…");
      loginBtn.disabled = true;
    }

    // 2. Gọi API cập nhật
    try{
      const r = await callApi("getData", {});
      if(!r || r.ok !== true){
        throw new Error((r && r.error) || "Không tải được danh sách");
      }

      const raw = Array.isArray(r.data?.names) ? r.data.names : [];
      names = raw.map(n => String(n ?? "").trim())
                 .filter(n => n.length > 0 && n.length <= 100);

      if(!names.length) throw new Error("Danh sách tên trống");

      const rawChecks  = Array.isArray(r.data?.checks) ? r.data.checks : [];
      const rawTimes   = Array.isArray(r.data?.times)  ? r.data.times  : [];
      const rawPoints  = Array.isArray(r.data?.points) ? r.data.points : [];

      checks = names.map((_, i) => rawChecks[i] === true);
      times  = names.map((_, i) => {
        const t = String(rawTimes[i] ?? "").trim();
        return /^([01]\d|2[0-3]):[0-5]\d$/.test(t) ? t : "";
      });
      points = names.map((_, i) => {
        const p = Number(rawPoints[i]);
        return Number.isFinite(p) ? p : 100;
      });

      cacheSave();
      buildWheel();
      loginBtn.disabled = false;
      setLoginStatus(`Đã tải ${names.length} người chơi`, "ok");
    }catch(err){
      if(!names.length){
        setLoginStatus(err.message || "Lỗi tải danh sách", "error");
        loginBtn.disabled = true;
      }
    }
  }

  // =========================================================
  // ĐĂNG NHẬP / ĐĂNG XUẤT
  // =========================================================
  function goToProfile(name){
    currentUser = name;
    currentUserIdx = names.indexOf(name);

    profileName.textContent = name;
    profileAvatar.textContent = (name.charAt(0) || "?").toUpperCase();

    showScreen("profileScreen");
    document.title = "Trang cá nhân của " + name;
  }

  function logout(){
    currentUser = "";
    currentUserIdx = -1;
    profileName.textContent = "—";
    profileAvatar.textContent = "?";
    document.title = "Đảo Mèo";

    showScreen("loginScreen");

    // Reset wheel
    current = 0;
    dragOffset = 0;
    renderWheel();
  }

  loginBtn.addEventListener("click", () => {
    if(!names.length) return;
    const selected = names[current];
    if(!selected) return;
    goToProfile(selected);
  });

  logoutBtn.addEventListener("click", logout);

  // =========================================================
  // MENU — CHUYỂN SANG CÁC TRANG CON
  // =========================================================
  document.querySelectorAll(".menu-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const page = btn.dataset.page;
      if(page === "checklist")  openChecklist();
      else if(page === "kdv")   openKdv();
      else if(page === "attendance") openAttendance();
      else if(page === "top")   openTop();
      else if(page === "lunch") openLunch();
    });
  });

  // Nút "← Quay lại" ở mọi trang con
  document.querySelectorAll("[data-back]").forEach(btn => {
    btn.addEventListener("click", () => {
      showScreen("profileScreen");
      document.title = "Trang cá nhân của " + currentUser;
    });
  });

  // =========================================================
  // TRANG CHECKLIST
  // =========================================================
  const checklistBody   = document.getElementById("checklistBody");
  const checklistStatus = document.getElementById("checklistStatus");
  const checklistSyncBtn= document.getElementById("checklistSyncBtn");

  function setChecklistStatus(text, type = ""){
    checklistStatus.textContent = text || "";
    checklistStatus.className = "page-status" + (type ? " " + type : "");
  }

  function renderChecklistSkeleton(){
    let html = "";
    for(let i = 0; i < 6; i++){
      html += `<tr>
        <td><span class="skeleton skeleton-row w-70"></span></td>
        <td class="col-time"><span class="skeleton skeleton-row w-40"></span></td>
        <td class="col-status"><span class="skeleton sk-box"></span></td>
      </tr>`;
    }
    checklistBody.innerHTML = html;
  }

  function renderChecklist(){
    if(!names.length){
      checklistBody.innerHTML = `<tr><td colspan="3" class="checklist-empty">Chưa có danh sách người chơi.</td></tr>`;
      return;
    }

    // Sắp xếp hiển thị: đã check lên trên, trong nhóm đã check sắp theo giờ sớm → muộn
    const rows = names.map((name, i) => ({
      name, index: i,
      checked: !!checks[i],
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
      const tr = document.createElement("tr");
      tr.dataset.index = row.index;
      if(row.index === currentUserIdx) tr.classList.add("highlight");

      const tdName = document.createElement("td");
      tdName.textContent = row.name;

      const tdTime = document.createElement("td");
      tdTime.className = "col-time";
      tdTime.textContent = row.time || "—";

      const tdStatus = document.createElement("td");
      tdStatus.className = "col-status";
      const box = document.createElement("span");
      box.className = "check-box" + (row.checked ? " checked" : "");

      // Cho phép click nếu là chính mình + chưa check
      if(row.index === currentUserIdx && !row.checked){
        box.classList.add("clickable");
        box.title = "Bấm để check-in";
        box.addEventListener("click", () => doCheckIn(row.index));
      }else{
        box.textContent = row.checked ? "✓" : "";
      }

      tdStatus.appendChild(box);

      tr.append(tdName, tdTime, tdStatus);
      frag.appendChild(tr);
    });

    checklistBody.innerHTML = "";
    checklistBody.appendChild(frag);
  }

  async function doCheckIn(index){
    if(index !== currentUserIdx) return;
    if(checks[index]) return;

    const name = names[index];
    const clientTime = new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit", minute: "2-digit", hour12: false
    }).format(new Date());

    // Optimistic UI
    checks[index] = true;
    times[index]  = clientTime;
    cacheSave();
    renderChecklist();
    setChecklistStatus(`Đã check-in lúc ${clientTime} ✓`, "ok");

    try{
      const r = await callApi("checkin", {
        name,
        clientTime,
        clientEpoch: String(Date.now())
      });
      if(!r || r.ok !== true) throw new Error((r && r.error) || "checkin lỗi");

      if(r.data && Number.isFinite(Number(r.data.points))){
        points[index] = Number(r.data.points);
      }
      cacheSave();
      setChecklistStatus(`Đã ghi ${clientTime} ✓`, "ok");
    }catch(err){
      setChecklistStatus("Máy chủ chưa xác nhận — trạng thái vẫn giữ nguyên", "error");
    }
  }

  async function refreshChecklist(){
    setChecklistStatus("Đang đồng bộ…");
    try{
      const r = await callApi("getData", {});
      if(!r || r.ok !== true) throw new Error("Không đồng bộ được");

      const rawNames  = Array.isArray(r.data?.names)  ? r.data.names  : [];
      const rawChecks = Array.isArray(r.data?.checks) ? r.data.checks : [];
      const rawTimes  = Array.isArray(r.data?.times)  ? r.data.times  : [];
      const rawPoints = Array.isArray(r.data?.points) ? r.data.points : [];

      const newNames = rawNames.map(n => String(n ?? "").trim()).filter(Boolean);

      // Nếu danh sách tên thay đổi → rebuild wheel
      const namesChanged = newNames.length !== names.length ||
        newNames.some((n, i) => n !== names[i]);

      names = newNames;
      checks = names.map((_, i) => rawChecks[i] === true);
      times  = names.map((_, i) => {
        const t = String(rawTimes[i] ?? "").trim();
        return /^([01]\d|2[0-3]):[0-5]\d$/.test(t) ? t : "";
      });
      points = names.map((_, i) => {
        const p = Number(rawPoints[i]);
        return Number.isFinite(p) ? p : 100;
      });

      cacheSave();
      if(namesChanged){
        currentUserIdx = names.indexOf(currentUser);
        buildWheel();
      }
      renderChecklist();
      setChecklistStatus("Đã đồng bộ ✓", "ok");
    }catch(err){
      setChecklistStatus(err.message || "Đồng bộ thất bại", "error");
    }
  }

  function openChecklist(){
    showScreen("checklistScreen");
    document.title = "Checklist — Đảo Mèo";
    if(names.length) renderChecklist();
    else renderChecklistSkeleton();

    // Auto refresh nếu chưa có dữ liệu mới
    if(!names.length) refreshChecklist();
  }

  checklistSyncBtn.addEventListener("click", refreshChecklist);

  // =========================================================
  // TRANG LUẬT KDV
  // =========================================================
  function openKdv(){
    showScreen("kdvScreen");
    document.title = "Luật KDV — Đảo Mèo";
  }

  // =========================================================
  // TRANG CHẤM CÔNG
  // =========================================================
  const attendanceEmployee = document.getElementById("attendanceEmployee");
  const attendanceGrid     = document.getElementById("attendanceGrid");
  const attendanceMonthLbl = document.getElementById("attendanceMonthLabel");
  const attendanceWorkCnt  = document.getElementById("attendanceWorkCount");
  const attendanceOffCnt   = document.getElementById("attendanceOffCount");
  const attendanceLeaveCnt = document.getElementById("attendanceLeaveCount");
  const attendancePrev     = document.getElementById("attendancePrev");
  const attendanceNext     = document.getElementById("attendanceNext");
  const attendanceSyncBtn  = document.getElementById("attendanceSyncBtn");
  const attendanceStatus   = document.getElementById("attendanceStatus");

  let attendanceViewDate = new Date();
  attendanceViewDate.setDate(1);
  let attendanceData = {};        // { name: { "2026-09-15": "P" } }
  let attendanceEmployees = [];   // danh sách tên nhân viên
  let attendanceLoaded = false;

  function setAttStatus(text, type = ""){
    attendanceStatus.textContent = text || "";
    attendanceStatus.className = "page-status" + (type ? " " + type : "");
  }

  function attKey(y, m, d){
    const pad = n => String(n).padStart(2, "0");
    return `${y}-${pad(m + 1)}-${pad(d)}`;
  }

  function mondayIndex(date){
    return (date.getDay() + 6) % 7;
  }

  function attStatusInfo(status){
    const s = String(status || "").toUpperCase();
    if(s === "V") return { cls: "work",  label: "✓" };
    if(s === "P") return { cls: "leave", label: "Phép" };
    if(s === "O") return { cls: "off",   label: "OFF" };
    if(s === "T") return { cls: "ot",    label: "OT" };
    if(s === "Q") return { cls: "q",     label: "Quên" };
    if(s === "X") return { cls: "x",     label: "X" };
    return { cls: "empty", label: "—" };
  }

  function renderAttendanceCalendar(){
    const y = attendanceViewDate.getFullYear();
    const m = attendanceViewDate.getMonth();

    attendanceMonthLbl.textContent = `Tháng ${m + 1}/${y}`;
    attendanceGrid.innerHTML = "";

    const selectedName = attendanceEmployee.value;
    if(!selectedName){
      attendanceGrid.innerHTML = `<div style="grid-column:1/-1;padding:28px 16px;text-align:center;color:#83968b;font-weight:800">Đang tải nhân viên…</div>`;
      attendanceWorkCnt.textContent = "0";
      attendanceOffCnt.textContent = "0";
      attendanceLeaveCnt.textContent = "0";
      return;
    }

    const first = new Date(y, m, 1);
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const prevDays = new Date(y, m, 0).getDate();
    const leading = mondayIndex(first);
    const today = new Date();

    let work = 0, off = 0, leave = 0;

    // Ngày cuối tháng trước (mờ)
    for(let i = leading - 1; i >= 0; i--){
      const cell = document.createElement("div");
      cell.className = "att-day muted";
      cell.innerHTML = `<div class="att-day-num">${prevDays - i}</div>`;
      attendanceGrid.appendChild(cell);
    }

    const days = attendanceData[selectedName] || {};

    for(let d = 1; d <= daysInMonth; d++){
      const date = new Date(y, m, d);
      const key = attKey(y, m, d);
      const raw = String(days[key] || "").toUpperCase();

      let status = "empty", label = "—";
      if(raw && ["P","O","T","Q","X"].includes(raw)){
        const info = attStatusInfo(raw);
        status = info.cls;
        label = info.label;
      }else if(date <= new Date(today.getFullYear(), today.getMonth(), today.getDate())){
        // Ngày đã qua nhưng không có mã trong Sheet → coi như ✓ đi làm
        status = "work";
        label = "✓";
      }

      if(status === "work" || status === "ot") work++;
      else if(status === "off") off++;
      else if(status === "leave") leave++;

      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "att-day";
      if(date.getFullYear() === today.getFullYear() &&
         date.getMonth() === today.getMonth() &&
         d === today.getDate()){
        cell.classList.add("today");
      }
      cell.innerHTML = `<div class="att-day-num">${d}</div>
                        <div class="att-status ${status}">${label}</div>`;
      attendanceGrid.appendChild(cell);
    }

    // Ngày đầu tháng sau (mờ)
    const total = leading + daysInMonth;
    const trailing = (7 - total % 7) % 7;
    for(let d = 1; d <= trailing; d++){
      const cell = document.createElement("div");
      cell.className = "att-day muted";
      cell.innerHTML = `<div class="att-day-num">${d}</div>`;
      attendanceGrid.appendChild(cell);
    }

    attendanceWorkCnt.textContent = work;
    attendanceOffCnt.textContent = off;
    attendanceLeaveCnt.textContent = leave;
  }

  function applyAttendancePayload(payload){
    const map = {};
    const emps = [];
    (payload?.employees || []).forEach(person => {
      const name = String(person?.name || "").trim();
      if(!name) return;
      emps.push(name);
      map[name] = {};
      const days = person?.days || {};
      Object.keys(days).forEach(day => {
        const s = String(days[day] ?? "").trim().toUpperCase();
        if(["P","O","T","Q","X"].includes(s)){
          const y = attendanceViewDate.getFullYear();
          const m = attendanceViewDate.getMonth();
          map[name][attKey(y, m, Number(day))] = s;
        }
      });
    });

    attendanceEmployees = [...new Set(emps)];
    attendanceData = map;

    // Cập nhật select
    const currentVal = attendanceEmployee.value;
    attendanceEmployee.innerHTML = "";
    attendanceEmployees.forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      attendanceEmployee.appendChild(opt);
    });
    if(attendanceEmployees.includes(currentVal)){
      attendanceEmployee.value = currentVal;
    }else if(attendanceEmployees.length){
      // Ưu tiên chọn người đang đăng nhập
      if(attendanceEmployees.includes(currentUser)){
        attendanceEmployee.value = currentUser;
      }else{
        attendanceEmployee.value = attendanceEmployees[0];
      }
    }

    renderAttendanceCalendar();
  }

  async function loadAttendance(force = false){
    if(attendanceLoaded && !force){
      renderAttendanceCalendar();
      return;
    }
    setAttStatus("Đang tải dữ liệu chấm công…");
    try{
      const m = attendanceViewDate.getMonth() + 1;
      const r = await callApi("getAttendance", { month: m }, 20000);
      if(!r || r.ok !== true) throw new Error((r && r.error) || "Không tải được chấm công");
      applyAttendancePayload(r.data);
      attendanceLoaded = true;
      setAttStatus(`Đã đồng bộ ${attendanceEmployees.length} nhân viên`, "ok");
    }catch(err){
      setAttStatus(err.message || "Lỗi tải chấm công", "error");
    }
  }

  function openAttendance(){
    showScreen("attendanceScreen");
    document.title = "Chấm công — Đảo Mèo";
    if(attendanceLoaded) renderAttendanceCalendar();
    loadAttendance(false);
  }

  attendanceEmployee.addEventListener("change", renderAttendanceCalendar);
  attendancePrev.addEventListener("click", () => {
    attendanceViewDate.setMonth(attendanceViewDate.getMonth() - 1);
    attendanceLoaded = false;
    loadAttendance(true);
  });
  attendanceNext.addEventListener("click", () => {
    attendanceViewDate.setMonth(attendanceViewDate.getMonth() + 1);
    attendanceLoaded = false;
    loadAttendance(true);
  });
  attendanceSyncBtn.addEventListener("click", () => loadAttendance(true));

  // =========================================================
  // TRANG BXH TOP
  // =========================================================
  const topBody        = document.getElementById("topBody");
  const topMonthSelect = document.getElementById("topMonthSelect");
  const topStatus      = document.getElementById("topStatus");
  const topSyncBtn     = document.getElementById("topSyncBtn");

  let topData = {};

  function setTopStatus(text, type = ""){
    topStatus.textContent = text || "";
    topStatus.className = "page-status" + (type ? " " + type : "");
  }

  function rankClient(score){
    score = Number(score) || 0;
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
    const now = new Date();
    const curMonth = now.getMonth() + 1;
    topMonthSelect.innerHTML = "";
    for(let m = 1; m <= 12; m++){
      const opt = document.createElement("option");
      opt.value = String(m);
      opt.textContent = `Tháng ${m}`;
      opt.disabled = m > curMonth;
      topMonthSelect.appendChild(opt);
    }
    topMonthSelect.value = String(curMonth);
  }

  function renderTopRows(employees, year, month){
    const daysInMonth = new Date(year, month, 0).getDate();
    const rows = (employees || []).map((emp, index) => {
      const days = emp.days || {};
      let tCount = 0, pCount = 0, qCount = 0, xCount = 0;
      for(let d = 1; d <= daysInMonth; d++){
        const s = String(days[String(d)] || "").toUpperCase();
        if(s === "T") tCount++;
        else if(s === "P") pCount++;
        else if(s === "Q") qCount++;
        else if(s === "X") xCount++;
      }
      const pts = 300 + tCount * 40 - pCount * 10 - qCount * 100 - xCount * 200;
      return { name: String(emp.name || "").trim(), pts, index };
    }).filter(r => r.name);

    rows.sort((a, b) => b.pts - a.pts || a.index - b.index);

    if(!rows.length){
      topBody.innerHTML = `<tr><td colspan="4" class="checklist-empty">Chưa có dữ liệu tháng này.</td></tr>`;
      return;
    }

    const frag = document.createDocumentFragment();
    rows.forEach((row, i) => {
      const tr = document.createElement("tr");
      if(i < 3) tr.classList.add("top-row-" + (i + 1));
      if(row.name === currentUser) tr.classList.add("highlight");

      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : String(i + 1);

      const tdRank = document.createElement("td");
      tdRank.textContent = medal;

      const tdName = document.createElement("td");
      tdName.className = "top-name";
      tdName.textContent = row.name;

      const tdPts = document.createElement("td");
      tdPts.className = "top-points";
      tdPts.textContent = Number(row.pts).toLocaleString("vi-VN");

      const tdBadge = document.createElement("td");
      tdBadge.className = "top-rank";
      const badge = document.createElement("span");
      badge.className = "top-badge";
      badge.textContent = rankClient(row.pts);
      tdBadge.appendChild(badge);

      tr.append(tdRank, tdName, tdPts, tdBadge);
      frag.appendChild(tr);
    });

    topBody.innerHTML = "";
    topBody.appendChild(frag);
  }

  async function loadTop(month){
    const m = Number(month) || (new Date().getMonth() + 1);
    topMonthSelect.value = String(m);
    topBody.innerHTML = `<tr><td colspan="4" class="checklist-empty">Đang tải BXH…</td></tr>`;
    setTopStatus("");

    try{
      const r = await callApi("getAttendance", { month: m }, 20000);
      if(!r || r.ok !== true) throw new Error((r && r.error) || "Không tải được BXH");

      const employees = Array.isArray(r.data?.employees) ? r.data.employees : [];
      const y = new Date().getFullYear();
      renderTopRows(employees, y, m);
      setTopStatus(`Đã cập nhật BXH tháng ${m}`, "ok");
    }catch(err){
      topBody.innerHTML = `<tr><td colspan="4" class="checklist-empty">Không tải được BXH.</td></tr>`;
      setTopStatus(err.message || "Lỗi tải BXH", "error");
    }
  }

  function openTop(){
    showScreen("topScreen");
    document.title = "BXH TOP — Đảo Mèo";
    initTopMonthSelect();
    loadTop(new Date().getMonth() + 1);
  }

  topMonthSelect.addEventListener("change", () => {
    loadTop(Number(topMonthSelect.value));
  });
  topSyncBtn.addEventListener("click", () => {
    loadTop(Number(topMonthSelect.value));
  });

  // =========================================================
  // TRANG BỮA TRƯA (gọn — không thêm/xóa món)
  // =========================================================
  const lunchResultBody = document.getElementById("lunchResultBody");
  const lunchRerollBtn  = document.getElementById("lunchRerollBtn");

  const LUNCH_SAVORY = [
    "Thịt kho trứng","Thịt rang cháy cạnh","Thịt xào hành tây","Thịt xào sả ớt","Thịt xào rau củ","Sườn xào chua ngọt","Sườn ram mặn","Sườn nướng","Sườn kho tiêu","Gà chiên nước mắm",
    "Gà kho gừng","Gà kho sả","Gà chiên giòn","Gà xào sả ớt","Gà nướng","Gà kho tiêu","Cá kho tộ","Cá kho tiêu","Cá chiên mắm","Cá chiên sốt cà",
    "Cá nướng","Cá hấp gừng","Cá sốt cà chua","Tôm rim mặn ngọt","Tôm rang me","Tôm rang thịt","Tôm kho tàu","Mực xào rau củ","Mực chiên nước mắm","Trứng chiên thịt bằm",
    "Trứng chiên cà chua","Đậu hũ sốt cà chua","Đậu hũ chiên sả ớt","Đậu hũ sốt thịt bằm","Rau muống xào tỏi","Rau muống xào thịt bò","Cải thìa xào tỏi","Bắp cải xào trứng","Khổ qua xào trứng","Cà tím xào thịt"
  ];
  const LUNCH_SOUP = [
    "Canh chua cá","Canh chua tôm","Canh chua thịt","Canh bí đỏ thịt bằm","Canh bí xanh nấu tôm","Canh bầu nấu tôm","Canh mồng tơi nấu tôm","Canh rau ngót thịt bằm","Canh cải xanh thịt bằm","Canh cải thìa thịt bằm",
    "Canh khổ qua nhồi thịt","Canh khổ qua nấu tôm","Canh bí đao thịt bằm","Canh bí đao nấu tôm","Canh khoai mỡ thịt bằm","Canh rau đay mồng tơi","Canh cua rau đay","Canh cua mồng tơi","Canh cua rau ngót","Canh cải chua thịt bằm",
    "Canh cải chua cá","Canh cải chua sườn","Canh cà chua trứng","Canh cà chua thịt bằm","Canh nấm thịt bằm","Canh nấm đậu hũ","Canh rong biển thịt bằm","Canh rong biển đậu hũ","Canh bắp cải thịt bằm","Canh rau củ thịt bằm",
    "Canh rau củ hầm xương","Canh củ sen hầm sườn","Canh mướp nấu mồng tơi","Canh mướp nấu tôm","Canh rau muống nấu chua","Canh rau muống nấu tôm","Canh bí xanh thịt bằm","Canh cải ngọt thịt bằm","Canh cải thảo thịt bằm","Canh đậu hũ cà chua"
  ];
  const LUNCH_OUT = [
    "Cơm tấm sườn","Cơm tấm sườn bì chả","Cơm gà xối mỡ","Cơm gà nướng","Cơm bò lúc lắc","Cơm thịt nướng","Cơm heo quay","Cơm xá xíu","Phở bò","Phở gà",
    "Hủ tiếu Nam Vang","Hủ tiếu bò kho","Bún bò Huế","Bún thịt nướng","Bún chả","Bún riêu","Bún mắm","Bún đậu mắm tôm","Bún nem nướng","Bún bò xào",
    "Mì Quảng","Cao lầu","Bánh canh cua","Bánh canh giò heo","Mì hoành thánh","Mì vịt tiềm","Mì cay","Mì trộn","Bánh mì thịt","Bánh mì xíu mại",
    "Bánh mì chảo","Bò né","Bò kho + bánh mì","Bánh xèo","Bánh cuốn","Bánh ướt thịt nướng","Cháo gà","Cháo lòng","Súp cua","Gà rán",
    "Gà nướng","Há cảo","Kimbap","Cơm trộn Hàn Quốc","Tokbokki","Pizza","Hamburger","Cơm chiên dương châu","Mì xào bò","Bún xào"
  ];

  let lunchMode = "all";
  let lunchRolling = false;
  let lunchTimer = null;

  function randomFrom(list){
    return list[Math.floor(Math.random() * list.length)] || "";
  }

  function randomLunchChoice(mode){
    if(mode === "home"){
      return { type: "home", savory: randomFrom(LUNCH_SAVORY), soup: randomFrom(LUNCH_SOUP) };
    }
    if(mode === "out"){
      return { type: "out", out: randomFrom(LUNCH_OUT) };
    }
    // all
    return Math.random() < 0.5
      ? { type: "home", savory: randomFrom(LUNCH_SAVORY), soup: randomFrom(LUNCH_SOUP) }
      : { type: "out",  out: randomFrom(LUNCH_OUT) };
  }

  function renderLunchChoice(choice){
    if(!choice){ return; }
    if(choice.type === "home"){
      lunchResultBody.innerHTML = `
        <div class="lunch-dish-line">
          <span class="lunch-dish-label">Món mặn</span>
          <span class="lunch-dish-name"></span>
        </div>
        <div class="lunch-dish-line">
          <span class="lunch-dish-label">Món canh</span>
          <span class="lunch-dish-name"></span>
        </div>
      `;
      const names = lunchResultBody.querySelectorAll(".lunch-dish-name");
      names[0].textContent = choice.savory;
      names[1].textContent = choice.soup;
    }else{
      lunchResultBody.innerHTML = `
        <div class="lunch-dish-line">
          <span class="lunch-dish-label">Ăn ngoài</span>
          <span class="lunch-dish-name"></span>
        </div>
      `;
      lunchResultBody.querySelector(".lunch-dish-name").textContent = choice.out;
    }
  }

  function pickLunch(){
    if(lunchRolling) return;
    lunchRolling = true;
    const card = document.querySelector(".lunch-result-card");
    if(card) card.classList.add("rolling");
    if(lunchRerollBtn) lunchRerollBtn.style.display = "none";

    let elapsed = 0;
    let delay = 55;

    const tick = () => {
      if(elapsed >= 2200){
        renderLunchChoice(randomLunchChoice(lunchMode));
        if(card) card.classList.remove("rolling");
        if(lunchRerollBtn) lunchRerollBtn.style.display = "inline-flex";
        lunchRolling = false;
        return;
      }
      renderLunchChoice(randomLunchChoice(lunchMode));
      elapsed += delay;
      delay = Math.min(200, delay + 8);
      lunchTimer = setTimeout(tick, delay);
    };

    clearTimeout(lunchTimer);
    tick();
  }

  function openLunch(){
    showScreen("lunchScreen");
    document.title = "Bữa trưa — Đảo Mèo";
  }

  document.querySelectorAll(".lunch-mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      lunchMode = btn.dataset.mode;
      pickLunch();
    });
  });

  if(lunchRerollBtn){
    lunchRerollBtn.addEventListener("click", pickLunch);
  }

  // =========================================================
  // KHỞI ĐỘNG
  // =========================================================
  loadNames();

  window.addEventListener("resize", () => {
    if(names.length) renderWheel();
  });

  // Expose API cho debug / mở rộng sau này
  window.__daomeo = {
    get currentUser(){ return currentUser; },
    get names(){ return names.slice(); },
    callApi
  };
})();
