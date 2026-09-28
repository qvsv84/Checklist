/* =========================================================
   ĐẢO MÈO — LOGIC CHẤM CÔNG (IIFE #2)
   Toàn bộ logic từ Gốc.html, giữ NGUYÊN logic gốc
   ========================================================= */
(function(){
  const page = document.getElementById('attendancePage');
  const back = document.getElementById('attendanceBack');
  const employee = document.getElementById('attendanceEmployee');
  const grid = document.getElementById('attendanceGrid');
  const monthLabel = document.getElementById('attendanceMonthLabel');
  const yearLabel = document.getElementById('attendanceYearLabel');
  const badge = document.getElementById('attendanceMonthBadge');
  const workCount = document.getElementById('attendanceWorkCount');
  const offCount = document.getElementById('attendanceOffCount');
  const leaveCount = document.getElementById('attendanceLeaveCount');
  const prev = document.getElementById('attendancePrev');
  const next = document.getElementById('attendanceNext');
  const attendanceBtn = document.getElementById('attendanceBtn');
  const attendanceSyncBtn = document.getElementById('attendanceSyncBtn');
  const attendanceSyncStatus = document.getElementById('attendanceSyncStatus');
  if(!page || !employee || !grid) return;
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

  let ATTENDANCE_EMPLOYEES = [];

  const ATTENDANCE_DATA = {};
  const ATTENDANCE_CACHE_PREFIX = 'srank_attendance_check_v2_';
  const ATTENDANCE_RAW_MEMORY = new Map();
  let attendanceServerLoaded = false;
  let attendanceServerLoadedKey = '';
  let attendanceLoadToken = 0;
  let attendanceLoadPromise = null;
  let attendanceLoadPromiseKey = '';
  let attendanceEditingDay = 0;
  let attendanceMultiMode = false;
  const attendanceMultiDays = new Set();
  let attendanceLockUntil = 0;

  const attendanceStatusOverlay = document.getElementById('attendanceStatusOverlay');
  const attendanceMultiBtn = document.getElementById('attendanceMultiBtn');
  const attendanceMultiBar = document.getElementById('attendanceMultiBar');
  const attendanceMultiCount = document.getElementById('attendanceMultiCount');
  const attendanceMultiCancel = document.getElementById('attendanceMultiCancel');
  const attendanceStatusClose = document.getElementById('attendanceStatusClose');
  const attendanceStatusSub = document.getElementById('attendanceStatusSub');
  const attendanceStatusSaving = document.getElementById('attendanceStatusSaving');

  function setAttendanceSyncStatus(type, message){
    if(!attendanceSyncStatus) return;
    attendanceSyncStatus.className = type || '';
    attendanceSyncStatus.textContent = message || '';
  }

  function attendanceErrorText(error){
    const msg = String(error?.message || error || 'Lỗi không xác định').trim();
    return msg || 'Lỗi không xác định';
  }

  function attendanceCacheKey(year, month){
    return ATTENDANCE_CACHE_PREFIX + year + '-' + String(month + 1).padStart(2,'0');
  }

  function loadAttendanceCache(year, month){
    try{
      const raw = localStorage.getItem(attendanceCacheKey(year, month));
      if(!raw) return null;
      const data = JSON.parse(raw);
      return data && typeof data === 'object' ? data : null;
    }catch(_){ return null; }
  }

  function saveAttendanceCache(year, month, data){
    try{
      localStorage.setItem(
        attendanceCacheKey(year, month),
        JSON.stringify({month:month+1, year, employees:data})
      );
    }catch(_){}
  }

  function rememberAttendanceRaw(year, month, employees){
    ATTENDANCE_RAW_MEMORY.set(
      year + '-' + (month + 1),
      Array.isArray(employees) ? employees : []
    );
  }

  function getAttendanceRawMemory(year, month){
    return ATTENDANCE_RAW_MEMORY.get(year + '-' + (month + 1)) || null;
  }


  function applyAttendanceData(payload, year, month){
    const map = {};
    (payload?.employees || []).forEach(person => {
      const name = String(person?.name || '').trim();
      if(!name) return;
      map[name] = {};
      const days = person?.days || {};
      Object.keys(days).forEach(day => {
        const status = String(days[day] ?? '').trim().toUpperCase();
        if(status === 'P' || status === 'O' || status === 'T' || status === 'Q' || status === 'X'){
          map[name][key(year, month, Number(day))] = status;
        }
      });
    });

    Object.keys(ATTENDANCE_DATA).forEach(k => delete ATTENDANCE_DATA[k]);
    Object.keys(map).forEach(name => ATTENDANCE_DATA[name] = map[name]);

    ATTENDANCE_EMPLOYEES = (payload?.employees || [])
      .map(x => String(x?.name || '').trim())
      .filter(Boolean);
    ATTENDANCE_EMPLOYEES = [...new Set(ATTENDANCE_EMPLOYEES)];

    const rawEmployees = Array.isArray(payload?.employees) ? payload.employees : [];
    rememberAttendanceRaw(year, month, rawEmployees);
    saveAttendanceCache(year, month, rawEmployees);
    syncAttendanceEmployeeControls();
    setAttendanceSyncStatus(
      ATTENDANCE_EMPLOYEES.length ? 'ok' : 'error',
      ATTENDANCE_EMPLOYEES.length
        ? `Đã đồng bộ ${ATTENDANCE_EMPLOYEES.length} nhân viên • ${new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}`
        : 'Google Sheet trả về 0 nhân viên — kiểm tra Check!C19:C32.'
    );
  }

  function applyAttendanceCache(year, month){
    const cache = loadAttendanceCache(year, month);
    if(!cache || !Array.isArray(cache.employees)) return false;
    rememberAttendanceRaw(year, month, cache.employees);

    Object.keys(ATTENDANCE_DATA).forEach(k => delete ATTENDANCE_DATA[k]);
    ATTENDANCE_EMPLOYEES = [];

    cache.employees.forEach(person => {
      const name = String(person?.name || '').trim();
      if(!name) return;
      ATTENDANCE_EMPLOYEES.push(name);
      ATTENDANCE_DATA[name] = {};
      const days = person?.days || {};
      Object.keys(days).forEach(day => {
        const status = String(days[day] ?? '').trim().toUpperCase();
        if(status === 'P' || status === 'O' || status === 'T' || status === 'Q' || status === 'X'){
          ATTENDANCE_DATA[name][key(year, month, Number(day))] = status;
        }
      });
    });

    ATTENDANCE_EMPLOYEES = [...new Set(ATTENDANCE_EMPLOYEES)];
    syncAttendanceEmployeeControls();
    return true;
  }

  function statusInfo(status){
    const s = String(status || '').trim().toUpperCase();
    if(s === 'V') return {className:'work', label:'✓'};
    if(s === 'P') return {className:'leave', label:'Phép'};
    if(s === 'O') return {className:'off', label:'OFF'};
    if(s === 'T') return {className:'ot', label:'OT'};
    if(s === 'Q') return {className:'q', label:'Quên'};
    if(s === 'X') return {className:'x', label:'X'};
    return {className:'empty', label:'—'};
  }

  function rebuildAttendanceCacheFromCurrent(year, month){
    const employees = ATTENDANCE_EMPLOYEES.map(name => {
      const days = {};
      for(let d=1; d<=31; d++){
        const value = ATTENDANCE_DATA[name]?.[key(year, month, d)];
        if(value === 'P' || value === 'O' || value === 'T' || value === 'Q' || value === 'X') days[String(d)] = value;
      }
      return {name, days};
    });
    rememberAttendanceRaw(year, month, employees);
    saveAttendanceCache(year, month, employees);
  }

  function syncAttendanceEmployeeControls(){
    const current = selectedName;
    if(ATTENDANCE_EMPLOYEES.includes(current)){
      wheelIndex = ATTENDANCE_EMPLOYEES.indexOf(current);
    }else{
      selectedName = ATTENDANCE_EMPLOYEES[0] || '';
      wheelIndex = 0;
    }

    const sameList = employee.options.length === ATTENDANCE_EMPLOYEES.length &&
      ATTENDANCE_EMPLOYEES.every((name, i) => employee.options[i]?.value === name);

    if(!sameList){
      employee.innerHTML = '';
      const frag = document.createDocumentFragment();
      ATTENDANCE_EMPLOYEES.forEach(name => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        frag.appendChild(opt);
      });
      employee.appendChild(frag);
      buildNameWheel();
    }else{
      renderNameWheel();
    }

    employee.value = selectedName;
    updateWheelButton();
  }

  async function loadAttendanceMonth(force = false){
    if(!force && Date.now() < attendanceLockUntil){
      return Promise.resolve({ok:true, locked:true});
    }

    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const requestKey = y + '-' + (m + 1);

    if(attendanceLoadPromise && attendanceLoadPromiseKey === requestKey){
      if(force){
        setAttendanceSyncStatus('warn','Đang chờ đồng bộ từ Google Sheet…');
        attendanceSyncBtn?.classList.add('busy');
        if(attendanceSyncBtn) attendanceSyncBtn.textContent = '↻ Đang đồng bộ…';
      }
      return attendanceLoadPromise;
    }

    const token = ++attendanceLoadToken;

    if(!force && attendanceServerLoaded && attendanceServerLoadedKey === requestKey){
      return Promise.resolve({ok:true, cached:true});
    }

    if(force){
      setAttendanceSyncStatus('warn','Đang đồng bộ từ Google Sheet…');
      attendanceSyncBtn?.classList.add('busy');
      if(attendanceSyncBtn) attendanceSyncBtn.textContent = '↻ Đang đồng bộ…';
    }else{
      const hasCache = applyAttendanceCache(y, m);
      if(hasCache){
        setAttendanceSyncStatus('warn','Đang dùng dữ liệu đã lưu • đang kiểm tra máy chủ…');
      }else{
        setAttendanceSyncStatus('warn','Đang tải danh sách nhân viên…');
      }
      render();
    }

    const promise = (async()=>{
      try{
        const r = await window.__srankApi('getAttendance',{month:m+1, _ts:Date.now()}, 20000);
        if(!r || r.ok !== true) throw new Error(r?.error || 'Google Sheet trả về dữ liệu không hợp lệ');
        if(!r.data || !Array.isArray(r.data.employees)) throw new Error('Phản hồi getAttendance thiếu danh sách employees');

        if(viewDate.getFullYear() === y && viewDate.getMonth() === m){
          applyAttendanceData(r.data, y, m);
          attendanceServerLoaded = true;
          attendanceServerLoadedKey = requestKey;
          render();
        }
        return r;
      }catch(e){
        const msg = attendanceErrorText(e);
        const hasCache = applyAttendanceCache(y,m);
        setAttendanceSyncStatus(
          'error',
          hasCache
            ? `Lỗi đồng bộ: ${msg} • đang dùng dữ liệu đã lưu`
            : `Lỗi đồng bộ: ${msg}`
        );
        render();
        throw e;
      }finally{
        if(token === attendanceLoadToken){
          attendanceSyncBtn?.classList.remove('busy');
          if(attendanceSyncBtn) attendanceSyncBtn.textContent = '↻ Đồng bộ';
        }
        if(attendanceLoadPromiseKey === requestKey){
          attendanceLoadPromise = null;
          attendanceLoadPromiseKey = '';
        }
      }
    })();

    attendanceLoadPromise = promise;
    attendanceLoadPromiseKey = requestKey;
    return promise;
  }

  window.__getCurrentAttendanceScore = async function(name){
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    let result = null;
    if(window.__attendanceCurrentMonthReady){
      result = await window.__attendanceCurrentMonthReady;
    }
    if(!result){
      result = await window.__getAttendanceTopDataForMonth(month, false);
    }
    const person = (result?.employees || []).find(x=>String(x?.name || '').trim() === String(name || '').trim());
    if(!person) return null;

    const daysInMonth = new Date(year, month, 0).getDate();
    const days = person.days || {};
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
    const score = 300 + tCount * 40 - pCount * 10 - qCount * 100 - xCount * 200;
    return {score, rank:attendanceRankClient(score), tCount, pCount, qCount, xCount, off:daysInMonth - tCount - pCount - qCount - xCount, year, month};
  };

  window.__getAttendanceTopData = async function(){
    await loadAttendanceMonth(false).catch(()=>{});
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const rows = ATTENDANCE_EMPLOYEES.map((name, index) => {
      const data = ATTENDANCE_DATA[name] || {};
      let tCount = 0;
      let pCount = 0;
      let qCount = 0;
      let xCount = 0;
      for(let d=1; d<=daysInMonth; d++){
        const status = String(data[key(y,m,d)] || '').toUpperCase();
        if(status === 'T') tCount++;
        else if(status === 'P') pCount++;
        else if(status === 'Q') qCount++;
        else if(status === 'X') xCount++;
      }
      const points = 300 + tCount * 40 - pCount * 10 - qCount * 100 - xCount * 200;
      return {
        name,
        points,
        tCount,
        pCount,
        qCount,
        xCount,
        index
      };
    });
    return {year:y, month:m, rows};
  };

  window.__getAttendanceTopDataForMonth = async function(monthNumber, force = false){
    const now = new Date();
    const year = now.getFullYear();
    const month = Math.max(1, Math.min(12, Number(monthNumber) || (now.getMonth() + 1)));
    const monthIndex = month - 1;

    let employees = !force ? getAttendanceRawMemory(year, monthIndex) : null;
    let cached = false;

    if(!employees && !force){
      const cache = loadAttendanceCache(year, monthIndex);
      if(cache && Array.isArray(cache.employees)){
        employees = cache.employees;
        rememberAttendanceRaw(year, monthIndex, employees);
      }
    }

    if(Array.isArray(employees) && employees.length){
      cached = true;
    }else{
      const r = await window.__srankApi('getAttendance',{month, _ts:Date.now()}, 20000);
      if(!r || r.ok !== true) throw new Error(r?.error || 'Google Sheet trả về dữ liệu không hợp lệ');
      employees = Array.isArray(r.data?.employees) ? r.data.employees : [];
      rememberAttendanceRaw(year, monthIndex, employees);
      saveAttendanceCache(year, monthIndex, employees);
    }

    return {year, month, employees, cached};
  };

  window.__attendanceCurrentMonthReady = window.__getAttendanceTopDataForMonth((new Date()).getMonth() + 1, false).catch(()=>null);

  function updateAttendanceMultiUI(){
    attendanceMultiCount.textContent = `${attendanceMultiDays.size} ngày`;
    attendanceMultiBar.classList.toggle('show', attendanceMultiMode);
    attendanceMultiBar.setAttribute('aria-hidden', attendanceMultiMode ? 'false' : 'true');
    grid.querySelectorAll('.att-day[data-day]').forEach(el=>{
      el.classList.toggle('multi-selected', attendanceMultiDays.has(Number(el.dataset.day)));
    });
  }

  function startAttendanceMulti(){
    closeAttendanceStatus();
    attendanceMultiMode = true;
    attendanceMultiDays.clear();
    updateAttendanceMultiUI();
  }

  function cancelAttendanceMulti(){
    attendanceMultiMode = false;
    attendanceMultiDays.clear();
    updateAttendanceMultiUI();
  }

  function toggleAttendanceMultiDay(day){
    if(attendanceMultiDays.has(day)) attendanceMultiDays.delete(day);
    else attendanceMultiDays.add(day);
    updateAttendanceMultiUI();
  }

  async function saveAttendanceBatchStatus(status){
    const days = [...attendanceMultiDays].sort((a,b)=>a-b);
    if(!days.length || !selectedName) return;

    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const nameAtRequest = selectedName;
    const monthAtRequest = m + 1;
    const cleanStatus = String(status || '').trim().toUpperCase();
    if(cleanStatus && !['P','O','T','Q','X'].includes(cleanStatus)) return;

    attendanceMultiCount.textContent = 'Đang lưu…';

    try{
      const r = await window.__srankApi('setAttendanceBatch',{
        month: monthAtRequest, days, name: nameAtRequest, status: cleanStatus
      }, 20000);
      if(!r || r.ok !== true) throw new Error(r?.error || 'Google Sheet không xác nhận đã lưu');

      if(!ATTENDANCE_DATA[nameAtRequest]) ATTENDANCE_DATA[nameAtRequest] = {};
      days.forEach(day => {
        const k = key(y,m,day);
        if(cleanStatus) ATTENDANCE_DATA[nameAtRequest][k] = cleanStatus;
        else delete ATTENDANCE_DATA[nameAtRequest][k];
      });
      rebuildAttendanceCacheFromCurrent(y,m);
      attendanceLockUntil = Date.now() + 3000;
      if(viewDate.getFullYear() === y && viewDate.getMonth() === m && selectedName === nameAtRequest) render();

      attendanceMultiMode = false;
      attendanceMultiDays.clear();
      updateAttendanceMultiUI();
      setAttendanceSyncStatus('ok', `Đã lưu ${days.length} ngày vào Google Sheet`);
    }catch(e){
      try{
        await loadAttendanceMonth(true);
        const allConfirmed = days.every(day=>{
          const v = String(ATTENDANCE_DATA?.[nameAtRequest]?.[key(y,m,day)] || '').toUpperCase();
          return cleanStatus ? v === cleanStatus : !v;
        });
        if(allConfirmed){
          attendanceMultiMode = false;
          attendanceMultiDays.clear();
          updateAttendanceMultiUI();
          setAttendanceSyncStatus('ok', `Đã lưu ${days.length} ngày vào Google Sheet`);
          return;
        }
      }catch(_err){}
      attendanceMultiCount.textContent = 'Lưu thất bại';
      setAttendanceSyncStatus('error','Không ghi được Google Sheet: ' + attendanceErrorText(e));
    }
  }

  function openAttendanceStatus(day){
    if(!selectedName || !Number.isInteger(day)) return;
    attendanceEditingDay = day;
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const dateText = String(day).padStart(2,'0') + '/' + String(m+1).padStart(2,'0') + '/' + y;
    const current = ATTENDANCE_DATA[selectedName]?.[key(y,m,day)];
    const isFuture = new Date(y,m,day) > new Date();
    const info = current ? statusInfo(current) : (isFuture ? {label:'Chưa tới ngày'} : {label:'✓ — Đi làm bình thường'});
    attendanceStatusSub.textContent = selectedName + ' • ' + dateText + ' • ' + info.label;
    attendanceStatusSaving.textContent = '';
    attendanceStatusOverlay.classList.add('show');
    attendanceStatusOverlay.setAttribute('aria-hidden','false');
  }

  function closeAttendanceStatus(){
    attendanceStatusOverlay.classList.remove('show');
    attendanceStatusOverlay.setAttribute('aria-hidden','true');
    attendanceEditingDay = 0;
  }

  async function saveAttendanceStatus(status){
    const day = attendanceEditingDay;
    if(!day || !selectedName) return;

    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const cleanStatus = status === '__clear'
      ? ''
      : String(status || '').trim().toUpperCase();

    if(cleanStatus && !['P','O','T','Q','X'].includes(cleanStatus)) return;

    const nameAtRequest = selectedName;
    const monthAtRequest = m + 1;
    const dayAtRequest = day;

    attendanceStatusSaving.textContent = 'Đang lưu vào Google Sheet…';

    try{
      const payload = {
        month: monthAtRequest,
        day: dayAtRequest,
        name: nameAtRequest,
        status: cleanStatus
      };

      const r = await window.__srankApi(
        'setAttendance',
        payload,
        20000
      );

      if(!r || r.ok !== true){
        throw new Error(
          r?.error || 'Google Sheet không xác nhận đã lưu'
        );
      }

      const saved = r.data || {};

      if(
        saved &&
        saved.name &&
        String(saved.name).trim() === nameAtRequest &&
        Number(saved.month) === monthAtRequest
      ){
        const k = key(y, m, day);

        if(!ATTENDANCE_DATA[nameAtRequest]){
          ATTENDANCE_DATA[nameAtRequest] = {};
        }

        if(cleanStatus){
          ATTENDANCE_DATA[nameAtRequest][k] = cleanStatus;
        }else{
          delete ATTENDANCE_DATA[nameAtRequest][k];
        }

        rebuildAttendanceCacheFromCurrent(y, m);
        attendanceLockUntil = Date.now() + 3000;
        if(viewDate.getFullYear() === y && viewDate.getMonth() === m && selectedName === nameAtRequest) render();
      }

      attendanceStatusSaving.textContent = saved.cell
        ? ('Đã lưu ✓ • ' + saved.cell)
        : 'Đã lưu ✓';

      setTimeout(closeAttendanceStatus, 500);

    }catch(e){
      const msg = attendanceErrorText(e);

      let confirmedBySheet = false;

      try{
        await loadAttendanceMonth(true);

        const serverValue =
          ATTENDANCE_DATA?.[nameAtRequest]?.[key(y,m,day)] || '';

        confirmedBySheet =
          String(serverValue).trim().toUpperCase() === cleanStatus;
      }catch(_syncErr){}

      if(confirmedBySheet){
        render();
        attendanceStatusSaving.textContent = 'Đã lưu ✓';
        setAttendanceSyncStatus(
          'ok',
          'Đã lưu Google Sheet'
        );
      }else{
        attendanceStatusSaving.textContent =
          'Chưa lưu: ' + msg;

        setAttendanceSyncStatus(
          'error',
          'Không ghi được Google Sheet: ' + msg
        );
      }

      setTimeout(closeAttendanceStatus, confirmedBySheet ? 500 : 1400);
    }
  }

  let viewDate = new Date();
  viewDate.setDate(1);
  let selectedName = '';
  const wheelBtn = document.getElementById('attendanceEmployeeWheelBtn');
  const wheelOverlay = document.getElementById('attendanceNameWheel');
  const wheelViewport = document.getElementById('attendanceNameWheelViewport');
  const wheelItems = document.getElementById('attendanceNameWheelItems');
  const wheelClose = document.getElementById('attendanceNameWheelClose');
  const wheelConfirm = document.getElementById('attendanceNameWheelConfirm');
  let wheelIndex = 0;
  let wheelStartY = 0, wheelDragging = false, wheelOffset = 0;
  const wheelStep = 58;

  function syncAttendanceEmployees(){
    if(!ATTENDANCE_EMPLOYEES.length){
      loadAttendanceMonth(true);
      return;
    }

    syncAttendanceEmployeeControls();
    render();
  }
  window.syncAttendanceEmployees = syncAttendanceEmployees;

  function updateWheelButton(){
    const value = wheelBtn?.querySelector('.wheel-value');
    if(value) value.textContent = selectedName || 'Chọn nhân viên';
  }
  function buildNameWheel(){
    if(!wheelItems) return;
    wheelItems.innerHTML='';
    const frag = document.createDocumentFragment();
    ATTENDANCE_EMPLOYEES.forEach(name=>{
      const el=document.createElement('div');
      el.className='att-name-wheel-item';
      el.textContent=name;
      frag.appendChild(el);
    });
    wheelItems.appendChild(frag);
    renderNameWheel();
  }

  function renderNameWheel(){
    if(!wheelItems) return;

    const mid = (wheelViewport?.clientHeight || 292) / 2;
    const children = wheelItems.children;
    for(let i=0;i<children.length;i++){
      const el = children[i];
      const y = (i-wheelIndex)*wheelStep + mid + wheelOffset;
      const d = Math.abs(y-mid);
      const n = Math.min(1,d/(wheelStep*2.3));
      el.style.top = (y-wheelStep/2) + 'px';
      el.style.transform = `scale(${1-n*.28})`;
      el.style.opacity = .20 + (1-n)*.80;
      el.style.filter = `blur(${n*2.5}px)`;
      el.classList.toggle('selected', i===wheelIndex && Math.abs(wheelOffset)<wheelStep*.35);
    }
  }
  function settleNameWheel(){
    if(!ATTENDANCE_EMPLOYEES.length) return;

    const steps = Math.round(-wheelOffset / wheelStep);
    if(steps!==0){
      wheelIndex = Math.max(0, Math.min(ATTENDANCE_EMPLOYEES.length-1, wheelIndex + steps));
    }
    wheelOffset=0;
    renderNameWheel();
  }
  function openNameWheel(){
    wheelIndex=Math.max(0,ATTENDANCE_EMPLOYEES.indexOf(selectedName));
    wheelOffset=0;
    renderNameWheel();
    wheelOverlay.classList.add('show');
    wheelOverlay.setAttribute('aria-hidden','false');
    if(typeof syncQuickTools==='function') syncQuickTools();
  }
  function closeNameWheel(){
    wheelOverlay.classList.remove('show');
    wheelOverlay.setAttribute('aria-hidden','true');
    if(typeof syncQuickTools==='function') syncQuickTools();
    wheelOffset=0;
  }

  function pad(n){return String(n).padStart(2,'0')}
  function key(y,m,d){return `${y}-${pad(m+1)}-${pad(d)}`}
  function mondayIndex(date){return (date.getDay()+6)%7}
  function dataFor(date){
    const y=date.getFullYear(), m=date.getMonth(), d=date.getDate();
    const raw = String(ATTENDANCE_DATA[selectedName]?.[key(y,m,d)] || '').trim().toUpperCase();
    if(raw === 'P' || raw === 'O' || raw === 'T' || raw === 'Q' || raw === 'X') return {status:raw};

    const today = new Date();
    const dateOnly = new Date(y,m,d);
    const todayOnly = new Date(today.getFullYear(),today.getMonth(),today.getDate());
    if(dateOnly <= todayOnly) return {status:'V'};

    return null;
  }

  function render(){
    const y=viewDate.getFullYear(), m=viewDate.getMonth();
    monthLabel.childNodes[0].nodeValue=`Tháng ${m+1}`;
    yearLabel.textContent=String(y);
    badge.textContent=(y===new Date().getFullYear() && m===new Date().getMonth())?'THÁNG HIỆN TẠI':`THÁNG ${m+1}/${y}`;
    grid.innerHTML='';

    if(!selectedName){
      grid.innerHTML = '<div style="grid-column:1/-1;padding:28px 16px;text-align:center;opacity:.7">Đang tải danh sách nhân viên…</div>';
      workCount.textContent='0';
      offCount.textContent='0';
      leaveCount.textContent='0';
      return;
    }

    const first=new Date(y,m,1), days=new Date(y,m+1,0).getDate();
    const prevDays=new Date(y,m,0).getDate();
    const leading=mondayIndex(first);
    let work=0, off=0, leave=0;

    for(let i=leading-1;i>=0;i--){
      const cell=document.createElement('div');
      cell.className='att-day muted';
      cell.innerHTML=`<div class="att-day-num">${prevDays-i}</div>`;
      grid.appendChild(cell);
    }

    for(let d=1;d<=days;d++){
      const date=new Date(y,m,d), item=dataFor(date);
      const cell=document.createElement('button');
      cell.type='button';
      cell.className='att-day';
      cell.dataset.day=String(d);
      cell.setAttribute('aria-label',`Ngày ${d}`);
      const now=new Date();

      if(date.getFullYear()===now.getFullYear() &&
         date.getMonth()===now.getMonth() &&
         d===now.getDate()){
        cell.classList.add('today');
      }

      let status='empty', label='—';

      if(item){
        const info=statusInfo(item.status);
        status=info.className;
        label=info.label;

        if(item.status === 'V' || item.status === 'T') work++;
        else if(item.status === 'O') off++;
        else if(item.status === 'P') leave++;
      }

      cell.innerHTML=
        `<div class="att-day-num">${d}</div>`+
        `<div class="att-status ${status}">${label}</div>`;

      grid.appendChild(cell);
    }

    const total=leading+days, trailing=(7-total%7)%7;
    for(let d=1;d<=trailing;d++){
      const cell=document.createElement('div');
      cell.className='att-day muted';
      cell.innerHTML=`<div class="att-day-num">${d}</div>`;
      grid.appendChild(cell);
    }

    workCount.textContent=work;
    offCount.textContent=off;
    leaveCount.textContent=leave;
  }

  grid.addEventListener('click',e=>{
    const dayEl=e.target.closest('.att-day[data-day]');
    if(!dayEl) return;
    const day = Number(dayEl.dataset.day);
    if(attendanceMultiMode) toggleAttendanceMultiDay(day);
    else openAttendanceStatus(day);
  });

  attendanceStatusClose.addEventListener('click',closeAttendanceStatus);
  attendanceMultiBtn.addEventListener('click',startAttendanceMulti);
  attendanceMultiCancel.addEventListener('click',cancelAttendanceMulti);
  document.querySelectorAll('[data-multi-status]').forEach(btn=>{
    btn.addEventListener('click',()=>saveAttendanceBatchStatus(btn.dataset.multiStatus));
  });
  attendanceStatusOverlay.addEventListener('click',e=>{
    if(e.target===attendanceStatusOverlay) closeAttendanceStatus();
  });
  document.querySelectorAll('#attendanceStatusOptions [data-status]').forEach(btn=>{
    btn.addEventListener('click',()=>saveAttendanceStatus(btn.dataset.status));
  });

  async function openPage(){
    page.classList.add('show');
    if(typeof syncQuickTools==='function') syncQuickTools();
    render();
    await loadAttendanceMonth(false);
  }
  function closePage(){
    page.classList.remove('show');
    if(typeof syncQuickTools==='function') syncQuickTools();
  }
  attendanceBtn?.addEventListener('click',e=>{ e.preventDefault(); e.stopPropagation(); openPage(); });
  attendanceSyncBtn?.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    loadAttendanceMonth(true).catch(err=>{
      setAttendanceSyncStatus('error', 'Lỗi đồng bộ: ' + attendanceErrorText(err));
    });
  });
  window.__openAttendancePage = openPage;
  window.__closeAttendancePage = closePage;
  back.addEventListener('click',closePage);
  wheelBtn.addEventListener('click',openNameWheel);
  wheelClose.addEventListener('click',closeNameWheel);
  wheelOverlay.addEventListener('click',e=>{if(e.target===wheelOverlay)closeNameWheel()});
  wheelConfirm.addEventListener('click',()=>{
    selectedName=ATTENDANCE_EMPLOYEES[wheelIndex] || '';
    employee.value=selectedName;
    updateWheelButton();
    closeNameWheel();
    render();
  });
  document.addEventListener('keydown', (e) => {
    if(!wheelOverlay.classList.contains('show')) return;
    if(!ATTENDANCE_EMPLOYEES.length) return;

    if(e.key === 'ArrowDown'){
      e.preventDefault();
      wheelIndex = Math.min(ATTENDANCE_EMPLOYEES.length - 1, wheelIndex + 1);
      wheelOffset = 0;
      renderNameWheel();
    }else if(e.key === 'ArrowUp'){
      e.preventDefault();
      wheelIndex = Math.max(0, wheelIndex - 1);
      wheelOffset = 0;
      renderNameWheel();
    }else if(e.key === 'Enter'){
      e.preventDefault();
      selectedName = ATTENDANCE_EMPLOYEES[wheelIndex] || '';
      employee.value = selectedName;
      updateWheelButton();
      closeNameWheel();
      render();
    }
  });
  wheelViewport.addEventListener('pointerdown',e=>{
    wheelDragging=true;
    wheelStartY=e.clientY;
    wheelOffset=0;
    wheelViewport.setPointerCapture?.(e.pointerId);
  });
  wheelViewport.addEventListener('pointermove',e=>{
    if(!wheelDragging) return;
    wheelOffset=e.clientY-wheelStartY;
    if((wheelIndex===0 && wheelOffset>0) || (wheelIndex===ATTENDANCE_EMPLOYEES.length-1 && wheelOffset<0)){
      wheelOffset*=.25;
    }
    renderNameWheel();
  });
  wheelViewport.addEventListener('pointerup',e=>{
    if(!wheelDragging) return;
    wheelDragging=false;
    settleNameWheel();
    wheelViewport.releasePointerCapture?.(e.pointerId);
  });
  wheelViewport.addEventListener('pointercancel',e=>{
    if(!wheelDragging) return;
    wheelDragging=false;
    settleNameWheel();
    if(e.pointerId!=null) wheelViewport.releasePointerCapture?.(e.pointerId);
  });

  wheelViewport.addEventListener('wheel',e=>{
    if(!wheelOverlay.classList.contains('show') || !ATTENDANCE_EMPLOYEES.length) return;
    e.preventDefault();
    if(!e.deltaY) return;
    wheelIndex += e.deltaY > 0 ? 1 : -1;
    wheelIndex = Math.max(0, Math.min(ATTENDANCE_EMPLOYEES.length-1, wheelIndex));
    wheelOffset=0;
    renderNameWheel();
  },{passive:false});
  function goToMonth(delta){
    viewDate.setMonth(viewDate.getMonth() + delta);
    attendanceLoadPromise = null;
    attendanceLoadPromiseKey = '';
    loadAttendanceMonth(false);
  }

  prev.addEventListener('click',()=>{
    goToMonth(-1);
  });
  next.addEventListener('click',()=>{
    goToMonth(1);
  });

  employee.value=selectedName;
  updateWheelButton();
  buildNameWheel();
  render();
})();
