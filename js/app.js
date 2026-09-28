/* =========================================================
   ĐẢO MÈO — LOGIC
   Lấy danh sách tên từ Google Sheet (Check!C4:C17) qua Apps Script
   ========================================================= */
(() => {
  "use strict";

  // ====== CẤU HÌNH ======
  // URL Apps Script — nếu cần đổi, sửa dòng này
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwJ1ebyNNe7fxlNR6TObBYebp7zRORGZTO0kTzlFl-S39I2vIJjDx9h0quV84od9JAfeg/exec";

  const ITEM_H = 58;        // chiều cao 1 dòng trong wheel (khớp CSS)
  const TIMEOUT_MS = 12000; // timeout gọi API

  // ====== DOM ======
  const loginScreen   = document.getElementById("loginScreen");
  const profileScreen = document.getElementById("profileScreen");

  const wheelViewport = document.getElementById("wheelViewport");
  const wheelItems    = document.getElementById("wheelItems");
  const wheelShine    = document.getElementById("wheelShine");
  const loginBtn      = document.getElementById("loginBtn");
  const loginStatus   = document.getElementById("loginStatus");

  const logoutBtn     = document.getElementById("logoutBtn");
  const profileAvatar = document.getElementById("profileAvatar");
  const profileName   = document.getElementById("profileName");

  // ====== STATE ======
  let names = [];         // 14 tên từ Sheet
  let current = 0;        // index đang chọn trong wheel
  let dragging = false;
  let startY = 0;
  let dragOffset = 0;
  let currentUser = "";   // tên đăng nhập

  // =========================================================
  // API — JSONP (Apps Script không cho CORS nên phải dùng JSONP)
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

      window[cb] = (result) => {
        cleanup();
        resolve(result);
      };

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
  // WHEEL — hiển thị danh sách tên
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
      el.classList.toggle(
        "selected",
        i === current && Math.abs(dragOffset) < ITEM_H * 0.35
      );
    }
  }

  // Vệt sáng vàng chạy qua khi wheel dừng lại
  function flashShine(){
    if(!wheelShine) return;
    wheelShine.classList.remove("flash");
    void wheelShine.offsetWidth; // force reflow để restart animation
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

  // ---- Pointer events (mobile + desktop) ----
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

  // ---- Lăn chuột (desktop) ----
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

  // ---- Bàn phím ----
  document.addEventListener("keydown", (e) => {
    if(!loginScreen.classList.contains("screen--active")) return;
    if(!names.length) return;

    if(e.key === "ArrowDown"){
      e.preventDefault();
      const next = Math.min(names.length - 1, current + 1);
      if(next !== current){
        current = next;
        dragOffset = 0;
        renderWheel();
        flashShine();
      }
    } else if(e.key === "ArrowUp"){
      e.preventDefault();
      const next = Math.max(0, current - 1);
      if(next !== current){
        current = next;
        dragOffset = 0;
        renderWheel();
        flashShine();
      }
    } else if(e.key === "Enter" && !loginBtn.disabled){
      e.preventDefault();
      loginBtn.click();
    }
  });

  // =========================================================
  // LOAD DANH SÁCH TÊN từ Google Sheet
  // =========================================================
  function setLoginStatus(text, type = ""){
    loginStatus.textContent = text || "";
    loginStatus.className = "login-status" + (type ? " " + type : "");
  }

  async function loadNames(){
    setLoginStatus("Đang tải danh sách…");
    loginBtn.disabled = true;

    try{
      const r = await callApi("getData", {});
      if(!r || r.ok !== true){
        throw new Error((r && r.error) || "Không tải được danh sách");
      }

      // Lấy names[] từ response (Check!C4:C17)
      const raw = Array.isArray(r.data?.names) ? r.data.names : [];
      names = raw
        .map(n => String(n ?? "").trim())
        .filter(n => n.length > 0 && n.length <= 100);

      if(!names.length){
        throw new Error("Danh sách tên trống");
      }

      buildWheel();
      loginBtn.disabled = false;
      setLoginStatus(`Đã tải ${names.length} người chơi`, "ok");
    }catch(err){
      setLoginStatus(err.message || "Lỗi tải danh sách", "error");
      loginBtn.disabled = true;
    }
  }

  // =========================================================
  // ĐĂNG NHẬP / ĐĂNG XUẤT
  // =========================================================
  function goToProfile(name){
    currentUser = name;

    // Điền thông tin vào trang cá nhân
    profileName.textContent = name;
    profileAvatar.textContent = (name.charAt(0) || "?").toUpperCase();

    // Chuyển màn hình
    loginScreen.classList.remove("screen--active");
    profileScreen.classList.add("screen--active");
    document.title = "Trang cá nhân của " + name;

    // Cuộn lên đầu trang cá nhân
    profileScreen.scrollTop = 0;
  }

  function logout(){
    currentUser = "";
    profileName.textContent = "—";
    profileAvatar.textContent = "?";
    document.title = "Đảo Mèo";

    profileScreen.classList.remove("screen--active");
    loginScreen.classList.add("screen--active");

    // Reset wheel về đầu
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
  // KHỞI ĐỘNG
  // =========================================================
  loadNames();

  // Render lại khi xoay màn hình / đổi kích thước
  window.addEventListener("resize", () => {
    if(names.length) renderWheel();
  });

  // ===== API cho phần bổ sung sau =====
  // Khi bạn cần thêm chức năng vào trang cá nhân, dùng:
  //   window.__daomeo.currentUser  → tên đang đăng nhập
  //   window.__daomeo.callApi(...) → gọi API Sheets
  window.__daomeo = {
    get currentUser(){ return currentUser; },
    callApi,
  };
})();
