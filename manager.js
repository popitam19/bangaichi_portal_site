// 業務リストの定義
const TASKS = [
  { id: "task1", name: "【ラーメン】オーダー受付・レジ対応" },
  { id: "task2", name: "【ラーメン】提供" },
  { id: "task3", name: "【飲み】オーダー受付" },
  { id: "task4", name: "【飲み】オーダー入力(iPad)" },
  { id: "task5", name: "【飲み】おつまみ提供" },
  { id: "task6", name: "【飲み】ドリンク提供" },
  { id: "task7", name: "【飲み】会計対応" },
  { id: "task8", name: "【業務】ラストオーダー確認" },
  { id: "task9", name: "【業務】閉店作業" },
  { id: "task10", name: "【業務】レジ締め" },
  { id: "task11", name: "【共通】キッチン指示品(補充・運搬)" },
  { id: "task12", name: "【調理】ドリンク作成" },
  { id: "task13", name: "【調理】餃子調理" },
];

// 画面読み込み時の処理
window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get("auth") === "true") {
    document.getElementById("secret-area").style.display = "block";

    // 一括管理機能と既存機能の初期化
    renderAllMemberSelects();
    renderEvalForm();
    renderMatrixTable();
    initPayrollSystem();
  } else {
    alert("正規の画面からアクセスしてください。");
    window.location.href = "index.html";
  }
});

/* ==========================================================================
   共通メンバー管理機能（一括追加＆一括削除）
   ========================================================================== */

// すべてのドロップダウンを一括更新
function renderAllMemberSelects() {
  const members = JSON.parse(localStorage.getItem('staff_members')) || [];

  const deleteSelect = document.getElementById('common-delete-select');
  const payrollSelect = document.getElementById('payroll-member-select');
  const evalSelect = document.getElementById('member-select');

  // 1. メンバー削除用セレクト
  if (deleteSelect) {
    const cur = deleteSelect.value;
    deleteSelect.innerHTML = '<option value="">-- 削除するメンバーを選択 --</option>';
    members.forEach(name => {
      deleteSelect.innerHTML += `<option value="${name}">${name}</option>`;
    });
    deleteSelect.value = cur;
  }

  // 2. 給料計算用セレクト
  if (payrollSelect) {
    const cur = payrollSelect.value;
    payrollSelect.innerHTML = '<option value="">-- メンバーを選択 --</option>';
    members.forEach(name => {
      payrollSelect.innerHTML += `<option value="${name}">${name}</option>`;
    });
    payrollSelect.value = cur;
  }

  // 3. 業務評価用セレクト
  if (evalSelect) {
    const cur = evalSelect.value;
    evalSelect.innerHTML = '<option value="">-- メンバーを選択 --</option>';
    members.forEach(name => {
      evalSelect.innerHTML += `<option value="${name}">${name}</option>`;
    });
    evalSelect.value = cur;
  }
}

// 共通メンバー追加
function addCommonMember() {
  const input = document.getElementById('common-member-name');
  const name = input.value.trim();

  if (!name) {
    alert('メンバーの名前を入力してください。');
    return;
  }

  const members = JSON.parse(localStorage.getItem('staff_members')) || [];
  if (members.includes(name)) {
    alert('そのメンバーは既に追加されています。');
    return;
  }

  members.push(name);
  localStorage.setItem('staff_members', JSON.stringify(members));

  input.value = '';
  renderAllMemberSelects();
  renderMatrixTable();

  alert(`${name} さんをアルバイトメンバーに追加しました！`);
}

// 共通メンバー削除（最上部で一括実行）
function deleteCommonMember() {
  const select = document.getElementById('common-delete-select');
  const selectedName = select.value;

  if (!selectedName) {
    alert('削除するメンバーを選択してください。');
    return;
  }

  if (confirm(`「${selectedName}」さんをメンバー一覧から削除してもよろしいですか？\n※保存されている給料データおよび業務評価データも消去されます。`)) {
    let members = JSON.parse(localStorage.getItem('staff_members')) || [];
    members = members.filter(name => name !== selectedName);
    localStorage.setItem('staff_members', JSON.stringify(members));

    // 該当メンバーの保存データ（給料・評価）も削除
    localStorage.removeItem('payroll_' + selectedName);
    localStorage.removeItem('eval_' + selectedName);

    // 選択中だった場合はフォームを非表示にする
    if (document.getElementById('payroll-member-select').value === selectedName) {
      document.getElementById('payroll-form-container').style.display = 'none';
    }
    if (document.getElementById('member-select').value === selectedName) {
      document.getElementById('eval-form-container').style.display = 'none';
    }

    renderAllMemberSelects();
    renderMatrixTable();

    alert(`「${selectedName}」さんを削除しました。`);
  }
}

/* ==========================================================================
   給料計算ツール
   ========================================================================== */
function initPayrollSystem() {
  renderAllMemberSelects();
}

function loadPayrollMemberData() {
  const select = document.getElementById('payroll-member-select');
  const memberName = select.value;
  const container = document.getElementById('payroll-form-container');
  const tbody = document.getElementById('payroll-tbody');

  if (!memberName) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';
  document.getElementById('current-member-display').textContent = memberName;

  const savedData = JSON.parse(localStorage.getItem('payroll_' + memberName)) || {};

  const hourlyWageInput = document.getElementById('hourly-wage');
  const transportInput = document.getElementById('transport-one-way');

  hourlyWageInput.value = savedData.hourlyWage !== undefined ? savedData.hourlyWage : 0;
  transportInput.value = savedData.transportOneWay !== undefined ? savedData.transportOneWay : 0;

  hourlyWageInput.oninput = () => {
    calculateAllPayroll();
    savePayrollMemberDataSilent();
  };
  transportInput.oninput = () => {
    calculateAllPayroll();
    savePayrollMemberDataSilent();
  };

  const addBtn = document.getElementById('add-payroll-row-btn');
  if (addBtn) {
    addBtn.onclick = () => {
      createPayrollRow();
      savePayrollMemberDataSilent();
    };
  }

  tbody.innerHTML = '';
  const rowsData = savedData.rows || [];
  if (rowsData.length > 0) {
    rowsData.forEach(rowData => {
      createPayrollRow(rowData);
    });
  } else {
    for (let i = 0; i < 10; i++) {
      createPayrollRow();
    }
  }

  calculateAllPayroll();
}

function createPayrollRow(data = {}) {
  const tbody = document.getElementById('payroll-tbody');
  const rowCount = tbody.children.length + 1;
  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td class="row-no">${rowCount}</td>
    <td><input type="time" class="time-in" value="${data.timeIn || ''}"></td>
    <td><input type="time" class="break-start" value="${data.breakStart || ''}"></td>
    <td><input type="time" class="break-end" value="${data.breakEnd || ''}"></td>
    <td><input type="time" class="time-out" value="${data.timeOut || ''}"></td>
    <td class="bound-time out-cell">00:00</td>
    <td class="break-time out-cell">00:00</td>
    <td class="work-time out-cell">00:00</td>
    <td class="base-pay out-cell">¥0</td>
    <td class="transport-pay out-cell">¥0</td>
    <td class="total-pay pay-cell">¥0</td>
    <td><button type="button" class="delete-row-btn">削除</button></td>
  `;

  const timeInputs = tr.querySelectorAll('input[type="time"]');
  timeInputs.forEach(input => {
    input.addEventListener('input', () => {
      calculatePayrollRow(tr);
      calculateAllPayroll();
      savePayrollMemberDataSilent();
    });
  });

  tr.querySelector('.delete-row-btn').addEventListener('click', () => {
    tr.remove();
    updatePayrollRowNumbers();
    calculateAllPayroll();
    savePayrollMemberDataSilent();
  });

  tbody.appendChild(tr);

  if (data.timeIn || data.timeOut) {
    calculatePayrollRow(tr);
  }
}

function updatePayrollRowNumbers() {
  const tbody = document.getElementById('payroll-tbody');
  Array.from(tbody.children).forEach((tr, index) => {
    tr.querySelector('.row-no').textContent = index + 1;
  });
}

function timeToMinutes(timeStr) {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTimeString(minutes) {
  if (minutes <= 0 || isNaN(minutes)) return "00:00";
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function calculatePayrollRow(tr) {
  const timeIn = timeToMinutes(tr.querySelector('.time-in').value);
  const breakStart = timeToMinutes(tr.querySelector('.break-start').value);
  const breakEnd = timeToMinutes(tr.querySelector('.break-end').value);
  const timeOut = timeToMinutes(tr.querySelector('.time-out').value);

  const hourlyWage = parseFloat(document.getElementById('hourly-wage').value) || 0;
  const transportOneWay = parseFloat(document.getElementById('transport-one-way').value) || 0;

  let boundMinutes = 0;
  let breakMinutes = 0;

  if (timeIn !== null && timeOut !== null && timeOut >= timeIn) {
    boundMinutes = timeOut - timeIn;
  }
  if (breakStart !== null && breakEnd !== null && breakEnd >= breakStart) {
    breakMinutes = breakEnd - breakStart;
  }

  const workMinutes = Math.max(0, boundMinutes - breakMinutes);

  const basePayExact = workMinutes * (hourlyWage / 60);
  const transportPay = (timeIn !== null && timeOut !== null) ? (transportOneWay * 2) : 0;

  tr.querySelector('.bound-time').textContent = minutesToTimeString(boundMinutes);
  tr.querySelector('.break-time').textContent = minutesToTimeString(breakMinutes);
  tr.querySelector('.work-time').textContent = minutesToTimeString(workMinutes);
  tr.querySelector('.base-pay').textContent = `¥${Math.round(basePayExact).toLocaleString()}`;
  tr.querySelector('.transport-pay').textContent = `¥${transportPay.toLocaleString()}`;
  tr.querySelector('.total-pay').textContent = `¥${Math.round(basePayExact + transportPay).toLocaleString()}`;

  tr.dataset.basePay = basePayExact;
  tr.dataset.transportPay = transportPay;
}

function calculateAllPayroll() {
  const tbody = document.getElementById('payroll-tbody');
  if (!tbody) return;

  let grandBasePayExact = 0;
  let grandTransport = 0;

  Array.from(tbody.children).forEach(tr => {
    calculatePayrollRow(tr);
    grandBasePayExact += parseFloat(tr.dataset.basePay || 0);
    grandTransport += parseFloat(tr.dataset.transportPay || 0);
  });

  const grandBasePay = Math.round(grandBasePayExact);
  const grandTotal = grandBasePay + grandTransport;

  document.getElementById('total-base-pay').textContent = `¥${grandBasePay.toLocaleString()}`;
  document.getElementById('total-transport').textContent = `¥${grandTransport.toLocaleString()}`;
  document.getElementById('grand-total').textContent = `¥${grandTotal.toLocaleString()}`;
}

function savePayrollMemberDataSilent() {
  const select = document.getElementById('payroll-member-select');
  const memberName = select.value;
  if (!memberName) return;

  const tbody = document.getElementById('payroll-tbody');
  const rows = [];

  Array.from(tbody.children).forEach(tr => {
    rows.push({
      timeIn: tr.querySelector('.time-in').value,
      breakStart: tr.querySelector('.break-start').value,
      breakEnd: tr.querySelector('.break-end').value,
      timeOut: tr.querySelector('.time-out').value
    });
  });

  const payrollData = {
    hourlyWage: parseFloat(document.getElementById('hourly-wage').value) || 0,
    transportOneWay: parseFloat(document.getElementById('transport-one-way').value) || 0,
    rows: rows
  };

  localStorage.setItem('payroll_' + memberName, JSON.stringify(payrollData));

  showAutoSaveNotice();
}

let autoSaveTimer = null;
function showAutoSaveNotice() {
  const statusEl = document.getElementById('auto-save-status');
  if (!statusEl) return;

  statusEl.style.opacity = '1';

  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    statusEl.style.opacity = '0';
  }, 1500);
}

function clearPayrollInputs() {
  const select = document.getElementById('payroll-member-select');
  const memberName = select.value;

  if (!memberName) return;

  if (confirm(`「${memberName}」さんの出退勤・休憩入力を一括クリアしてもよろしいですか？\n※時給と交通費の設定は保持されます。`)) {
    const tbody = document.getElementById('payroll-tbody');
    tbody.innerHTML = '';

    for (let i = 0; i < 10; i++) {
      createPayrollRow();
    }

    calculateAllPayroll();
    savePayrollMemberDataSilent();

    alert(`${memberName} さんの入力内容をクリアしました。`);
  }
}

/* ==========================================================================
   業務評価ロジック
   ========================================================================== */
function renderEvalForm() {
  const tbody = document.getElementById("eval-tbody");
  if (!tbody) return;

  let html = "";
  TASKS.forEach((task) => {
    html += `
      <tr>
        <td>${task.name}</td>
        <td>
          <div class="radio-group">
            <label class="eval-chip chip-double-circle">
              <input type="radio" name="${task.id}" value="◎"> <span>◎</span>
            </label>
            <label class="eval-chip chip-circle">
              <input type="radio" name="${task.id}" value="◯"> <span>◯</span>
            </label>
            <label class="eval-chip chip-triangle">
              <input type="radio" name="${task.id}" value="△"> <span>△</span>
            </label>
            <label class="eval-chip chip-triangle-dark">
              <input type="radio" name="${task.id}" value="▲"> <span>▲</span>
            </label>
            <label class="eval-chip chip-cross">
              <input type="radio" name="${task.id}" value="✕"> <span>✕</span>
            </label>
          </div>
        </td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
}

function renderMemberList() {
  renderAllMemberSelects();
}

function loadMemberEvaluation() {
  const select = document.getElementById("member-select");
  const memberName = select.value;
  const formContainer = document.getElementById("eval-form-container");

  if (!memberName) {
    formContainer.style.display = "none";
    return;
  }

  formContainer.style.display = "block";

  const savedData =
    JSON.parse(localStorage.getItem("eval_" + memberName)) || {};
  const form = document.getElementById("eval-form");

  const allRadios = form.querySelectorAll('input[type="radio"]');
  allRadios.forEach((radio) => (radio.checked = false));

  TASKS.forEach((task) => {
    const value = savedData[task.id];
    if (value) {
      const targetRadio = form.querySelector(
        `input[name="${task.id}"][value="${value}"]`,
      );
      if (targetRadio) {
        targetRadio.checked = true;
      }
    }
  });
}

function saveEvaluation() {
  const select = document.getElementById("member-select");
  const memberName = select.value;

  if (!memberName) {
    alert("メンバーが選択されていません。");
    return;
  }

  const form = document.getElementById("eval-form");
  const evalData = {};

  TASKS.forEach((task) => {
    const checkedRadio = form.querySelector(`input[name="${task.id}"]:checked`);
    evalData[task.id] = checkedRadio ? checkedRadio.value : "-";
  });

  localStorage.setItem("eval_" + memberName, JSON.stringify(evalData));
  alert(`${memberName} さんの評価を保存しました！`);

  renderMatrixTable();
}

function renderMatrixTable() {
  const container = document.getElementById("matrix-container");
  const members = JSON.parse(localStorage.getItem("staff_members")) || [];

  if (members.length === 0) {
    container.innerHTML =
      '<p style="color: var(--text-sub);">メンバーがまだ追加されていません。</p>';
    return;
  }

  let html = '<table class="matrix-table">';

  html += "<thead><tr><th>業務内容</th>";
  members.forEach((name) => {
    html += `<th>${name}</th>`;
  });
  html += "</tr></thead><tbody>";

  TASKS.forEach((task) => {
    html += `<tr><td>${task.name}</td>`;

    members.forEach((memberName) => {
      const savedData =
        JSON.parse(localStorage.getItem("eval_" + memberName)) || {};
      const evalValue = savedData[task.id] || "-";

      let colorStyle = "";
      if (evalValue === "◎") colorStyle = "color: #2563eb; font-weight: bold;";
      if (evalValue === "◯") colorStyle = "color: #107c41; font-weight: bold;";
      if (evalValue === "△") colorStyle = "color: #f59e0b; font-weight: bold;";
      if (evalValue === "▲") colorStyle = "color: #ea580c; font-weight: bold;";
      if (evalValue === "✕") colorStyle = "color: #dc2626; font-weight: bold;";

      html += `<td style="${colorStyle}">${evalValue}</td>`;
    });

    html += "</tr>";
  });

  html += "</tbody></table>";
  container.innerHTML = html;
}