// 軟體／模型需求資料（參考值，實際以官方為準）。新增一筆 = 在陣列加一個物件，不用改 app.js。
// 欄位：id(小寫英文)、name、type("ai"|"game")、min/rec 各含 ram(GB)、vram(GB)、disk(GB 可用空間)
// 註：AI 模型以 4-bit 量化版為準；rec 為「流暢使用」的估計值，遊戲 rec 約 1080p 高畫質。
window.APPS = [
  // ---- 本機 AI 模型 ----
  { id: "llama-3b", name: "Ollama：Llama 3.2 3B（輕量對話）", type: "ai",
    min: { ram: 8, vram: 0, disk: 4 }, rec: { ram: 8, vram: 4, disk: 5 } },
  { id: "llama-8b", name: "Ollama：Llama 3.1 8B／Qwen 7B", type: "ai",
    min: { ram: 8, vram: 0, disk: 10 }, rec: { ram: 16, vram: 6, disk: 10 } },
  { id: "qwen-14b", name: "Ollama：Qwen 14B 級模型", type: "ai",
    min: { ram: 16, vram: 0, disk: 12 }, rec: { ram: 32, vram: 12, disk: 15 } },
  { id: "qwen-32b", name: "Ollama：32B 級大型模型", type: "ai",
    min: { ram: 32, vram: 0, disk: 25 }, rec: { ram: 32, vram: 24, disk: 30 } },
  { id: "sd15", name: "Stable Diffusion 1.5（繪圖）", type: "ai",
    min: { ram: 8, vram: 4, disk: 10 }, rec: { ram: 16, vram: 6, disk: 20 } },
  { id: "sdxl", name: "Stable Diffusion XL（高畫質繪圖）", type: "ai",
    min: { ram: 16, vram: 6, disk: 20 }, rec: { ram: 16, vram: 12, disk: 30 } },
  { id: "flux", name: "FLUX.1（新一代繪圖模型）", type: "ai",
    min: { ram: 32, vram: 8, disk: 30 }, rec: { ram: 32, vram: 24, disk: 40 } },
  { id: "whisper", name: "Whisper large（語音轉文字）", type: "ai",
    min: { ram: 8, vram: 0, disk: 5 }, rec: { ram: 16, vram: 10, disk: 8 } },

  // ---- 3A 遊戲 ----
  { id: "apex", name: "Apex Legends（Apex 英雄）", type: "game",
    min: { ram: 6, vram: 1, disk: 75 }, rec: { ram: 8, vram: 4, disk: 75 } },
  { id: "cyberpunk", name: "Cyberpunk 2077（電馭叛客 2077）", type: "game",
    min: { ram: 12, vram: 6, disk: 70 }, rec: { ram: 16, vram: 8, disk: 70 } },
  { id: "wukong", name: "黑神話：悟空", type: "game",
    min: { ram: 16, vram: 6, disk: 130 }, rec: { ram: 16, vram: 8, disk: 130 } },
  { id: "eldenring", name: "艾爾登法環 Elden Ring", type: "game",
    min: { ram: 12, vram: 3, disk: 60 }, rec: { ram: 16, vram: 8, disk: 60 } }
];
