document.addEventListener("DOMContentLoaded", () => {
  // 修正：.manual-tab-btn から .tab-btn に変更
  const tabButtons = document.querySelectorAll(".tab-btn");
  const manualItems = document.querySelectorAll(".manual-item");
  const defaultMessage = document.getElementById("default-message");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // 1. 全ボタンの選択状態を解除
      tabButtons.forEach((btn) => btn.classList.remove("active"));

      // 2. 全マニュアルを非表示
      manualItems.forEach((item) => item.classList.remove("active"));

      // 3. 初期案内メッセージを隠す
      if (defaultMessage) {
        defaultMessage.style.display = "none";
      }

      // 4. 押されたボタンをアクティブ化
      button.classList.add("active");

      // 5. 該当マニュアルを表示
      const targetId = button.getAttribute("data-target");
      const targetManual = document.getElementById(targetId);

      if (targetManual) {
        targetManual.classList.add("active");
      }
    });
  });
});
