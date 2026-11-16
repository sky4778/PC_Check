// CPU 等級資料庫（瀏覽器讀不到型號，由使用者選等級）。score 為粗略分級，同等級新世代更強。
// 最後一筆固定為「其他／不確定」，score=null 代表只用執行緒數評分。
(function () {
  var L = [];
  function c(brand, name, score) { L.push({ brand: brand, name: name, score: score }); }
  c("Intel", "Celeron／Pentium", 15);
  c("Intel", "Core i3", 35);
  c("Intel", "Core i5", 55);
  c("Intel", "Core i7", 75);
  c("Intel", "Core i9", 90);
  c("Intel", "Core Ultra 5", 60);
  c("Intel", "Core Ultra 7", 80);
  c("Intel", "Core Ultra 9", 92);
  c("AMD", "Ryzen 3", 35);
  c("AMD", "Ryzen 5", 60);
  c("AMD", "Ryzen 7", 78);
  c("AMD", "Ryzen 9", 92);
  c("Apple", "Apple M1", 60);
  c("Apple", "Apple M2", 68);
  c("Apple", "Apple M3", 75);
  c("Apple", "Apple M4", 82);
  c("其他／不確定", "不確定（只用執行緒數估算）", null);
  window.CPUS = L;
})();
