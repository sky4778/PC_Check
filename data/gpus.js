// 顯示卡資料庫。偵測到的 WebGL 顯卡字串會依「順序」比對 re，第一個符合的被預選。
// 越具體的型號放越前面（例如 4070 Ti Super 在 4070 之前）；最後一筆固定為「其他／不確定」。
// vram 單位 GB；筆電版 VRAM 可能較少，由使用者在選單確認。unified=true 表示統一記憶體（Apple）。
(function () {
  var L = [];
  function g(brand, name, vram, score, re, unified) {
    L.push({ brand: brand, name: name, vram: vram, score: score, re: re || "", unified: !!unified });
  }
  g("NVIDIA", "RTX 5090", 32, 100, "RTX\\s*5090");
  g("NVIDIA", "RTX 5080", 16, 95, "RTX\\s*5080");
  g("NVIDIA", "RTX 5070 Ti", 16, 90, "RTX\\s*5070\\s*Ti");
  g("NVIDIA", "RTX 5070", 12, 85, "RTX\\s*5070");
  g("NVIDIA", "RTX 5060", 8, 75, "RTX\\s*5060");
  g("NVIDIA", "RTX 4090", 24, 100, "RTX\\s*4090");
  g("NVIDIA", "RTX 4080", 16, 92, "RTX\\s*4080");
  g("NVIDIA", "RTX 4070 Ti Super", 16, 88, "RTX\\s*4070\\s*Ti\\s*SUPER");
  g("NVIDIA", "RTX 4070", 12, 82, "RTX\\s*4070");
  g("NVIDIA", "RTX 4060 Ti", 8, 75, "RTX\\s*4060\\s*Ti");
  g("NVIDIA", "RTX 4060", 8, 70, "RTX\\s*4060");
  g("NVIDIA", "RTX 4050", 6, 60, "RTX\\s*4050");
  g("NVIDIA", "RTX 3090", 24, 95, "RTX\\s*3090");
  g("NVIDIA", "RTX 3080 Ti", 12, 88, "RTX\\s*3080\\s*Ti");
  g("NVIDIA", "RTX 3080", 10, 85, "RTX\\s*3080");
  g("NVIDIA", "RTX 3070", 8, 75, "RTX\\s*3070");
  g("NVIDIA", "RTX 3060 Ti", 8, 72, "RTX\\s*3060\\s*Ti");
  g("NVIDIA", "RTX 3060 筆電版", 6, 60, "RTX\\s*3060.*Laptop");
  g("NVIDIA", "RTX 3060", 12, 65, "RTX\\s*3060");
  g("NVIDIA", "RTX 3050 筆電版", 4, 45, "RTX\\s*3050.*Laptop");
  g("NVIDIA", "RTX 3050", 8, 50, "RTX\\s*3050");
  g("NVIDIA", "RTX 2060", 6, 55, "RTX\\s*2060");
  g("NVIDIA", "GTX 1660", 6, 50, "GTX\\s*1660");
  g("NVIDIA", "GTX 1650", 4, 35, "GTX\\s*1650");
  g("NVIDIA", "GTX 1060", 6, 40, "GTX\\s*1060");
  g("NVIDIA", "GTX 1050 Ti", 4, 30, "GTX\\s*1050");
  g("AMD", "RX 9070 XT", 16, 90, "RX\\s*9070");
  g("AMD", "RX 7900 XTX", 24, 95, "RX\\s*7900");
  g("AMD", "RX 7800 XT", 16, 85, "RX\\s*7800");
  g("AMD", "RX 7700 XT", 12, 78, "RX\\s*7700");
  g("AMD", "RX 7600", 8, 65, "RX\\s*7600");
  g("AMD", "RX 6800", 16, 80, "RX\\s*6800");
  g("AMD", "RX 6700 XT", 12, 72, "RX\\s*6700");
  g("AMD", "RX 6600", 8, 60, "RX\\s*6600");
  g("AMD", "RX 5700 XT", 8, 60, "RX\\s*5700");
  g("AMD", "RX 580", 8, 40, "RX\\s*580");
  g("AMD", "Radeon 內顯", 0, 20, "Radeon.*Graphics|Radeon\\s*\\d{3}M");
  g("Intel", "Arc B580", 12, 65, "Arc.*B580");
  g("Intel", "Arc A750", 8, 55, "Arc.*A750");
  g("Intel", "Intel 內顯（UHD／Iris Xe）", 0, 20, "Intel.*(UHD|Iris|HD Graphics|Xe|Graphics)");
  g("Apple", "Apple M4 系列", 0, 82, "Apple\\s*M4", true);
  g("Apple", "Apple M3 系列", 0, 75, "Apple\\s*M3", true);
  g("Apple", "Apple M2 系列", 0, 68, "Apple\\s*M2", true);
  g("Apple", "Apple M1 系列", 0, 60, "Apple\\s*M1", true);
  g("Apple", "Apple（型號不明）", 0, 60, "Apple", true);
  g("其他／不確定", "不確定（VRAM 以 0 GB 計）", 0, 30, "");
  window.GPUS = L;
})();
