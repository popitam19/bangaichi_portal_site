// ページ読み込み時に保存された状態を復元
document.addEventListener('DOMContentLoaded', () => {
  loadTaskStates();
});

/**
 * 時間帯タブの切り替え
 */
function switchTab(groupId, event) {
  // 初期案内メッセージを非表示にする
  const defaultMsg = document.getElementById('default-message');
  if (defaultMsg) {
    defaultMsg.classList.add('hidden');
  }

  // すべてのタブボタンとグループを非アクティブ化
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.todo-group').forEach(group => group.classList.remove('active'));

  // 選択されたタブとグループを有効化
  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  }
  
  const targetGroup = document.getElementById(groupId);
  if (targetGroup) {
    targetGroup.classList.add('active');
  }
}

/**
 * チェックボックス変更時の打ち消し線スタイル切り替え
 */
function toggleTask(checkbox) {
  const label = checkbox.closest('.todo-item');
  if (checkbox.checked) {
    label.classList.add('completed');
  } else {
    label.classList.remove('completed');
  }
  saveTaskStates();
}

/**
 * すべてのチェックを一度に解除する機能
 */
function resetAllChecks() {
  if (confirm('すべての項目のチェックを解除してリセットしますか？')) {
    const checkboxes = document.querySelectorAll('.todo-list input[type="checkbox"]');
    checkboxes.forEach(cb => {
      cb.checked = false;
      cb.closest('.todo-item').classList.remove('completed');
    });
    saveTaskStates();
  }
}

/**
 * チェック状態を localStorage に保存
 */
function saveTaskStates() {
  const checkboxes = document.querySelectorAll('.todo-list input[type="checkbox"]');
  const states = Array.from(checkboxes).map(cb => cb.checked);
  localStorage.setItem('todoStates', JSON.stringify(states));
}

/**
 * 保存されたチェック状態を復元
 */
function loadTaskStates() {
  const savedStates = JSON.parse(localStorage.getItem('todoStates'));
  if (!savedStates) return;

  const checkboxes = document.querySelectorAll('.todo-list input[type="checkbox"]');
  checkboxes.forEach((cb, index) => {
    if (savedStates[index] !== undefined) {
      cb.checked = savedStates[index];
      if (cb.checked) {
        cb.closest('.todo-item').classList.add('completed');
      }
    }
  });
}