document.addEventListener('DOMContentLoaded', function() {
  const trigger = document.getElementById('js-menu-trigger');
  const menuList = document.getElementById('js-menu-list');

  if (trigger && menuList) {
    trigger.addEventListener('click', function() {
      // 三本線ボタンのアニメーション（バツ印化）の切り替え
      this.classList.toggle('active');
      // プルダウンメニュー（表示・非表示）の切り替え
      menuList.classList.toggle('open');
    });
  }
});