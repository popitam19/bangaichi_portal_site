// 業務リストの定義
const TASKS = [
  { id: 'task1', name: '【追加】' },
  { id: 'task2', name: '【追加】' },
  { id: 'task3', name: '【追加】' },
  { id: 'task4', name: '【追加】' },
  { id: 'task5', name: '【追加】' }
];

// 画面読み込み時の処理
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.get('auth') === 'true') {
    document.getElementById('secret-area').style.display = 'block';
    renderMemberList();
    renderMatrixTable(); // 一覧表の初期描画
  } else {
    alert("正規の画面からアクセスしてください。");
    window.location.href = "index.html";
  }
});

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
      if (evalValue === '◯') colorStyle = 'color: #107c41; font-weight: bold;';
      if (evalValue === '△') colorStyle = 'color: #d97706; font-weight: bold;';
      if (evalValue === '✕') colorStyle = 'color: #dc2626; font-weight: bold;';

      html += `<td style="${colorStyle}">${evalValue}</td>`;
    });

    html += '</tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}