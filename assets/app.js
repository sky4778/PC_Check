(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var info = {};

  // 分數 → 燈號（規則見 CLAUDE.md 第 5 節）
  function light(s) { return s >= 70 ? "ok" : s >= 40 ? "warn" : "bad"; }
  function avg(a) { return a.length ? Math.round(a.reduce(function (x, y) { return x + y; }, 0) / a.length) : 0; }
  function tier(v, hi, mid) { return v >= hi ? 100 : v >= mid ? 60 : 25; }

  var GPUS = window.GPUS, CPUS = window.CPUS;

  // 下拉選單：品牌 → 型號
  function fillBrand(sel, list) {
    var seen = [];
    list.forEach(function (x) { if (seen.indexOf(x.brand) < 0) seen.push(x.brand); });
    sel.innerHTML = seen.map(function (b) { return "<option>" + b + "</option>"; }).join("");
  }
  function fillModel(sel, list, brand) {
    sel.innerHTML = list.map(function (x, i) {
      var tag = x.unified ? "（統一記憶體）" : x.vram ? "（" + x.vram + " GB）" : "";
      return x.brand === brand ? '<option value="' + i + '">' + x.name + tag + "</option>" : "";
    }).join("");
  }

  // 依偵測結果預選顯卡與 CPU 品牌（CPU 型號瀏覽器讀不到，只能推測品牌）
  function initPickers() {
    fillBrand($("gpuBrand"), GPUS);
    fillBrand($("cpuBrand"), CPUS);
    var gi = -1;
    GPUS.forEach(function (g, i) { if (gi < 0 && g.re && new RegExp(g.re, "i").test(info.gpu)) gi = i; });
    var matched = gi >= 0;
    if (!matched) gi = GPUS.length - 1;
    $("gpuBrand").value = GPUS[gi].brand;
    fillModel($("gpuModel"), GPUS, GPUS[gi].brand);
    $("gpuModel").value = String(gi);
    $("gpuHint").textContent = matched
      ? "已自動辨識為 " + GPUS[gi].name + "，不對請自行修改（筆電版 VRAM 常較少）。"
      : "無法辨識顯示卡，請自行選擇品牌與型號。";
    var cb = /Apple/i.test(info.gpu) ? "Apple" : /Intel/i.test(info.gpu) ? "Intel"
      : /Radeon.*Graphics/i.test(info.gpu) ? "AMD" : "其他／不確定";
    $("cpuBrand").value = cb;
    fillModel($("cpuModel"), CPUS, cb);
    $("cpuHint").textContent = "瀏覽器讀不到 CPU 型號，只偵測到 " + info.cores + " 個執行緒，請自行選等級。";
  }

  function detect() {
    var gl, gpu = "無法取得";
    try {
      gl = document.createElement("canvas").getContext("webgl");
      var e = gl && gl.getExtension("WEBGL_debug_renderer_info");
      if (e) gpu = gl.getParameter(e.UNMASKED_RENDERER_WEBGL);
    } catch (err) {}
    var c = navigator.connection || {};
    info = {
      cores: navigator.hardwareConcurrency || 0,
      mem: navigator.deviceMemory || null,
      screen: screen.width + "×" + screen.height,
      gpu: gpu,
      downlink: c.downlink || null,
      latency: null
    };
    initPickers();
    var t = performance.now();
    fetch("index.html", { method: "HEAD", cache: "no-store" })
      .then(function () { info.latency = Math.round(performance.now() - t); render(); })
      .catch(function () { render(); });
    render();
  }

  function render() {
    var rows = [
      ["CPU 執行緒數", info.cores || "未知"],
      ["記憶體（偵測）", info.mem ? info.mem + " GB（上限 8）" : "此瀏覽器不支援"],
      ["螢幕解析度", info.screen],
      ["顯示卡", info.gpu],
      ["網路下行", info.downlink ? info.downlink + " Mbps" : "未知"],
      ["連線延遲", info.latency !== null ? info.latency + " ms" : "測量中…"]
    ];
    $("detectList").innerHTML = rows.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + r[1] + "</dd>"; }).join("");
    if (info.mem && info.mem < 8 && !$("ram").dataset.touched) $("ram").value = String(info.mem <= 4 ? 4 : 8);
  }

  function analyze() {
    var u = {
      ram: +$("ram").value, vram: 0, disk: +$("disk").value || 0,
      diskType: $("diskType").value,
      battery: $("battery").value === "" ? null : +$("battery").value
    };
    var g = GPUS[+$("gpuModel").value], c = CPUS[+$("cpuModel").value];
    u.vram = g.unified ? Math.round(u.ram * 0.7) : g.vram;
    var thr = tier(info.cores, 12, 6);
    var cats = [];
    cats.push({ name: "處理器 CPU", score: c.score === null ? thr : avg([c.score, thr]),
      note: c.name + "／" + info.cores + " 執行緒" });
    cats.push({ name: "顯示卡 GPU", score: g.score,
      note: g.name + "／VRAM " + u.vram + "GB" + (g.unified ? "（以 RAM 的 70% 估算）" : "") });
    cats.push({ name: "記憶體 RAM", score: tier(u.ram, 16, 8), note: u.ram + " GB" });
    var st = [u.diskType === "ssd" ? 100 : 40, tier(u.disk, 100, 30)];
    if (u.battery !== null) st.push(tier(u.battery, 80, 60));
    cats.push({ name: "硬碟與電池", score: avg(st),
      note: u.diskType.toUpperCase() + "，剩餘 " + u.disk + "GB" + (u.battery !== null ? "，電池 " + u.battery + "%" : "") });
    var net = [];
    if (info.latency !== null) net.push(info.latency < 50 ? 100 : info.latency < 150 ? 60 : 25);
    if (info.downlink) net.push(tier(info.downlink, 10, 3));
    cats.push({ name: "網路品質", score: net.length ? avg(net) : 60,
      note: net.length ? "延遲 " + info.latency + "ms" : "資料不足，以中間值計算" });

    var apps = window.APPS.map(function (a) {
      var ge = function (t) { return u.ram >= t.ram && u.vram >= t.vram && u.disk >= t.disk; };
      var s = ge(a.rec) ? 100 : ge(a.min) ? 60 : 20;
      return { name: a.name, type: a.type, score: s, note: s === 100 ? "可以順暢執行" : s === 60 ? "勉強可跑，建議升級" : "未達最低需求" };
    });
    ["ai", "game"].forEach(function (t) {
      var g = apps.filter(function (a) { return a.type === t; });
      cats.push({ name: t === "ai" ? "本機 AI 模型" : "3A 遊戲",
        score: avg(g.map(function (a) { return a.score; })), note: g.length + " 項平均" });
    });

    var total = avg(cats.map(function (c) { return c.score; }));
    show(cats, apps, total, u);
  }

  function li(x) {
    var c = light(x.score);
    return '<li><span class="dot ' + c + '"></span><div class="who"><strong>' + x.name +
      '</strong><small>' + x.note + '</small></div><span class="num">' + x.score +
      '</span><span class="bar ' + c + '" data-v="' + x.score + '"></span></li>';
  }

  // 把分數寫進進度條的 CSS 變數（HTML 不寫 inline style）
  function paint() {
    var b = document.querySelectorAll(".bar");
    for (var i = 0; i < b.length; i++) b[i].style.setProperty("--v", b[i].dataset.v);
  }

  function show(cats, apps, total, u) {
    $("empty").hidden = true;
    $("result").hidden = false;
    $("total").textContent = total;
    var ring = $("ring");
    ring.style.setProperty("--p", total);
    ring.style.setProperty("--c", "var(--" + light(total) + ")");
    $("verdict").textContent = total >= 70 ? "狀態良好，大部分用途都能應付。"
      : total >= 40 ? "堪用，部分 AI 工具或遊戲會吃力。" : "偏弱，建議升級後再嘗試。";
    $("lights").innerHTML = cats.map(li).join("");
    var byType = function (t) { return apps.filter(function (a) { return a.type === t; }).map(li).join(""); };
    $("aiList").innerHTML = byType("ai");
    $("gameList").innerHTML = byType("game");
    paint();
    var lines = ["我的電腦檢查結果（綜合 " + total + "/100）：",
      "- CPU：" + $("cpuModel").selectedOptions[0].textContent + "（" + info.cores + " 執行緒）；RAM：" + u.ram + "GB；顯示卡：" + $("gpuModel").selectedOptions[0].textContent + "，可用 VRAM " + u.vram + "GB",
      "- 硬碟：" + u.diskType.toUpperCase() + "，可用 " + u.disk + "GB；電池健康：" + (u.battery !== null ? u.battery + "%" : "無"),
      "- 網路：延遲 " + (info.latency !== null ? info.latency + "ms" : "未知") + "，下行 " + (info.downlink || "未知") + "Mbps",
      "- 軟體相容：" + apps.map(function (a) { return a.name + "=" + a.note; }).join("；"),
      "", "請用繁體中文：1) 指出最大瓶頸 2) 給 3 項由高 CP 值到低的升級建議 3) 在不升級下如何改善 Ollama 或遊戲的效能。"];
    $("prompt").value = lines.join("\n");
    $("result").scrollIntoView({ behavior: "smooth" });
  }

  $("ram").addEventListener("change", function () { this.dataset.touched = "1"; });
  $("run").addEventListener("click", analyze);
  $("copy").addEventListener("click", function () {
    var t = $("prompt").value;
    var ok = function () { $("copyMsg").textContent = "已複製，請貼到 Claude 或 ChatGPT。"; };
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(ok, function () { $("prompt").select(); });
    else { $("prompt").select(); document.execCommand("copy"); ok(); }
  });
  $("gpuBrand").addEventListener("change", function () { fillModel($("gpuModel"), GPUS, this.value); });
  $("cpuBrand").addEventListener("change", function () { fillModel($("cpuModel"), CPUS, this.value); });
  detect();
})();
