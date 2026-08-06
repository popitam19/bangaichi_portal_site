/**
 * 指定されたURLへ移動する
 * @param {string} url - 遷移先のファイルパス
 */
function navigateTo(url) {
  // 指定したページはそのまま遷移、指定していないページは「準備中」を表示する
  if (
    url === 'bangaiti_calc-site.html' ||   
    url === 'todo_list.html' || 
    url === 'manual.html'
  ) {
    window.location.href = url;
    return;
  }

  // その他の未作成ページは「準備中」を表示する
  if (window.location.protocol === 'file:') {
    showModal('この機能は現在準備中です。<br>公開まで今しばらくお待ちください。');
    return;
  }

  // GitHub PagesなどのWebサーバー上では存在チェックを行う
  checkFileAndNavigate(url);
}

/**
 * サーバー上のファイルの存在をチェックして遷移する関数
 */
async function checkFileAndNavigate(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) {
      window.location.href = url;
    } else {
      showModal('この機能は現在準備中です。<br>公開まで今しばらくお待ちください。');
    }
  } catch (error) {
    showModal('この機能は現在準備中です。<br>公開まで今しばらくお待ちください。');
  }
}

/**
 * モーダルを表示する関数
 */
function showModal(message) {
  const overlay = document.getElementById('modal-overlay');
  const messageElement = document.getElementById('modal-message');
  
  if (overlay && messageElement) {
    messageElement.innerHTML = message;
    overlay.classList.remove('hidden');
  }
}

/**
 * モーダルを閉じる関数
 */
function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
}


// 設定したいパスワード
const MANAGER_PASSWORD = "bangaiti";

/**
 * 店舗管理・確認ページを開く（パスワード確認）
 */
function openManagerPage() {
  const input = prompt("パスワードを入力してください：");

  if (input === null) {
    // キャンセルされた場合は何もしない
    return;
  }

  if (input === MANAGER_PASSWORD) {
    // パスワード一致：認証OKの目印（auth=true）をつけて遷移
    window.location.href = "manager.html?auth=true";
  } else {
    // 不一致の場合
    alert("パスワードが違います。");
  }
}