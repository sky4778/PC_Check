(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var info = {};

  // 分數 → 燈號（規則見 CLAUDE.md 第 5 節）
  function light(s) { return s >= 70 ? "ok" : s >= 40 ? "warn" : "bad"; }
  function avg(a) { return a.length ? Math.round(a.reduce(function (x, y) { return x + y; }, 0) / a.length) : 0; }
  function tier(v, hi, mid) { return v >= hi ? 100 : v >= mid ? 60 : 25; }

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
    var t = performance.now();
    fetch("index.html", { method: "HEAD", cache: "no-store" })
      .then(function () { info.latency = Math.round(performance.now() - t); render(); })
      .catch(function () { render(); });
    render();
  }

  function render() {
    var rows = [
      ["CPU 核心數", info.cores || "未知"],
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
      ram: +$("ram").value, vram: +$("vram").value, disk: +$("disk").value || 0,
      diskType: $("diskType").value,
      battery: $("battery").value === "" ? null : +$("battery").value
    };
    var cats = [];
    cats.push({ name: "硬體規格", score: avg([tier(info.cores, 8, 4), tier(u.ram, 16, 8)]),
      note: info.cores + " 核心／" + u.ram + "GB RAM／VRAM " + u.vram + "GB" });
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
      return { name: a.name, score: s, note: s === 100 ? "可以順暢執行" : s === 60 ? "勉強可跑，建議升級" : "未達最低需求" };
    });
    cats.push({ name: "軟體相容性", score: avg(apps.map(function (a) { return a.score; })), note: apps.length + " 項軟體平均" });

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
    $("appList").innerHTML = apps.map(li).join("");
    paint();
    var lines = ["我的電腦檢查結果（綜合 " + total + "/100）：",
      "- CPU 核心：" + info.cores + "；RAM：" + u.ram + "GB；VRAM：" + u.vram + "GB；顯示卡：" + info.gpu,
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
  detect();
})();
