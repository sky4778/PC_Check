// 軟體需求資料（參考值，實際以官方為準）。新增軟體 = 在陣列加一筆，不用改 app.js。
// 欄位：id(小寫英文)、name、type("ai"|"game")、min/rec 各含 ram(GB)、vram(GB)、disk(GB 可用空間)
window.APPS = [
  { id: "ollama", name: "Ollama（本機 LLM，7B 模型）", type: "ai",
    min: { ram: 8, vram: 0, disk: 10 }, rec: { ram: 16, vram: 6, disk: 20 } },
  { id: "sd", name: "Stable Diffusion（本機繪圖）", type: "ai",
    min: { ram: 16, vram: 4, disk: 20 }, rec: { ram: 16, vram: 8, disk: 40 } },
  { id: "lol", name: "英雄聯盟 LOL", type: "game",
    min: { ram: 4, vram: 0, disk: 16 }, rec: { ram: 8, vram: 2, disk: 20 } },
  { id: "genshin", name: "原神", type: "game",
    min: { ram: 8, vram: 2, disk: 30 }, rec: { ram: 16, vram: 4, disk: 60 } }
];
