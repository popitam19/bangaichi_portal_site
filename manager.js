// 業務リストの定義（ここを変更すると業務名が変わります）
const TASKS = [
  { id: 'task1', name: '【ラーメン】オーダー受付・レジ対応' },
  { id: 'task2', name: '【ラーメン】提供' },
  { id: 'task3', name: '【飲み】オーダー受付' },
  { id: 'task4', name: '【飲み】オーダー入力(iPad)' },
  { id: 'task5', name: '【飲み】おつまみ提供' },
  { id: 'task6', name: '【飲み】ドリンク提供' },
  { id: 'task7', name: '【飲み】会計対応' },
  { id: 'task8', name: '【業務】ラストオーダー確認' },
  { id: 'task9', name: '【業務】閉店作業' },
  { id: 'task10', name: '【業務】レジ締め' },
  { id: 'task11', name: '【共通】キッチン指示品(補充・運搬)' },
  { id: 'task12', name: '【調理】ドリンク作成' },
  { id: 'task13', name: '【調理】餃子調理' }
];

// 画面読み込み時の処理
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.get('auth') === 'true') {
    document.getElementById('secret-area').style.display = 'block';
    renderMemberList();
    renderEvalForm();   // 評価フォームの自動生成
    renderMatrixTable(); // 一覧表の初期描画
  } else {
    alert("正規の画面からアクセスしてください。");
    window.location.href = "index.html";
  }
});

/**
 * 評価フォームをJavaScriptで自動生成する (5段階対応)
 */
function renderEvalForm() {
  const tbody = document.getElementById('eval-tbody');
  if (!tbody) return;

  let html = '';
  TASKS.forEach(task => {
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

/**
 * メンバーリストを LocalStorage から読み込んでセレクトボックスを作る
 */
function renderMemberList() {
  const select = document.getElementById('member-select');
  const members = JSON.parse(localStorage.getItem('staff_members')) || [];

  select.innerHTML = '<option value="">-- メンバーを選択 --</option>';

  members.forEach((name) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });
}

/**
 * 新しいメンバーを追加する
 */
function addMember() {
  const input = document.getElementById('new-member-name');
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
  renderMemberList();
  renderMatrixTable(); // 表も更新
  alert(`${name} さんをメンバーに追加しました！`);
}

/**
 * 選択中のメンバーを削除する
 */
function deleteCurrentMember() {
  const select = document.getElementById('member-select');
  const selectedName = select.value;

  if (!selectedName) {
    alert('削除するメンバーを選択してください。');
    return;
  }

  if (confirm(`「${selectedName}」さんを削除してもよろしいですか？`)) {
    let members = JSON.parse(localStorage.getItem('staff_members')) || [];
    members = members.filter(name => name !== selectedName);
    localStorage.setItem('staff_members', JSON.stringify(members));

    // 保存されている評価データも削除
    localStorage.removeItem('eval_' + selectedName);

    document.getElementById('eval-form-container').style.display = 'none';
    renderMemberList();
    renderMatrixTable(); // 表も更新
  }
}

/**
 * 選択されたメンバーの過去の評価データをフォームに反映する
 */
function loadMemberEvaluation() {
  const select = document.getElementById('member-select');
  const memberName = select.value;
  const formContainer = document.getElementById('eval-form-container');

  // 未選択の場合はフォームを隠す
  if (!memberName) {
    formContainer.style.display = 'none';
    return;
  }

  // 選択されていればフォームを表示
  formContainer.style.display = 'block';

  const savedData = JSON.parse(localStorage.getItem('eval_' + memberName)) || {};
  const form = document.getElementById('eval-form');

  // 一旦すべてのラジオボタンのチェックを外す
  const allRadios = form.querySelectorAll('input[type="radio"]');
  allRadios.forEach(radio => radio.checked = false);

  // 保存されている値を復元
  TASKS.forEach(task => {
    const value = savedData[task.id];
    if (value) {
      const targetRadio = form.querySelector(`input[name="${task.id}"][value="${value}"]`);
      if (targetRadio) {
        targetRadio.checked = true;
      }
    }
  });
}

/**
 * メンバーの評価データを LocalStorage に保存する
 */
function saveEvaluation() {
  const select = document.getElementById('member-select');
  const memberName = select.value;

  if (!memberName) {
    alert('メンバーが選択されていません。');
    return;
  }

  const form = document.getElementById('eval-form');
  const evalData = {};

  TASKS.forEach(task => {
    const checkedRadio = form.querySelector(`input[name="${task.id}"]:checked`);
    evalData[task.id] = checkedRadio ? checkedRadio.value : '-';
  });

  // 保存
  localStorage.setItem('eval_' + memberName, JSON.stringify(evalData));
  alert(`${memberName} さんの評価を保存しました！`);

  // 保存後に最新の全体表を描画
  renderMatrixTable();
}

/**
 * 【縦軸：業務 / 横軸：メンバー】の全体表をレンダリングする
 */
function renderMatrixTable() {
  const container = document.getElementById('matrix-container');
  const members = JSON.parse(localStorage.getItem('staff_members')) || [];

  if (members.length === 0) {
    container.innerHTML = '<p style="color: var(--text-sub);">メンバーがまだ追加されていません。</p>';
    return;
  }

  // テーブルの生成開始
  let html = '<table class="matrix-table">';
  
  // 1. ヘッダー行（横軸：メンバー名）
  html += '<thead><tr><th>業務内容</th>';
  members.forEach(name => {
    html += `<th>${name}</th>`;
  });
  html += '</tr></thead><tbody>';

  // 2. ボディ行（縦軸：業務）
  TASKS.forEach(task => {
    html += `<tr><td>${task.name}</td>`;
    
    // 各メンバーのこの業務に対する評価を取得してセルを埋める
    members.forEach(memberName => {
      const savedData = JSON.parse(localStorage.getItem('eval_' + memberName)) || {};
      const evalValue = savedData[task.id] || '-';
      
      // 評価に応じて色付けの演出（見やすさ向上）
      let colorStyle = '';
      if (evalValue === '◎') colorStyle = 'color: #2563eb; font-weight: bold;'; // 青
      if (evalValue === '◯') colorStyle = 'color: #107c41; font-weight: bold;'; // 緑
      if (evalValue === '△') colorStyle = 'color: #f59e0b; font-weight: bold;'; // 黄
      if (evalValue === '▲') colorStyle = 'color: #ea580c; font-weight: bold;'; // 橙
      if (evalValue === '✕') colorStyle = 'color: #dc2626; font-weight: bold;'; // 赤

      html += `<td style="${colorStyle}">${evalValue}</td>`;
    });

    html += '</tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}