(function () {
  "use strict";

  var STATIONS = {
    home:    { code: "01", name: "序章", en: "HOME", next: "日常" },
    menu:    { code: "02", name: "日常", en: "DAILY NOTES", next: "同频" },
    pillow:  { code: "03", name: "同频", en: "COMMUNITY", next: "游戏厅" },
    theater: { code: "04", name: "游戏厅", en: "ARCADE", next: "信箱" },
    mine:    { code: "06", name: "归处", en: "MY ROOM", next: "序章" },
    contact: { code: "05", name: "信箱", en: "CONTACT", next: "归处" },
    blessing:{ code: "G1", name: "祝福树", en: "WISH TREE", next: "返回游戏厅" },
    parkour: { code: "G2", name: "跑酷", en: "PARKOUR", next: "返回游戏厅" },
    game:    { code: "G3", name: "翻牌", en: "CARD MATCH", next: "返回游戏厅" },
    archive: { code: "G4", name: "影子档案", en: "ARCHIVE", next: "返回游戏厅" },
    riddle:  { code: "G5", name: "谜厅", en: "RIDDLE", next: "返回游戏厅" }
  };
  var SUBLINE = ["blessing", "parkour", "game", "archive", "riddle"];
  var MAINLINE = ["home", "menu", "pillow", "theater", "contact", "mine"];

  function currentId() {
    var active = document.querySelector(".page.active");
    return active ? active.id : "home";
  }

  function isSub(id) {
    return SUBLINE.indexOf(id) !== -1;
  }

  function makePlate(id) {
    var s = STATIONS[id];
    if (!s) return null;
    var plate = document.createElement("div");
    plate.className = "station-plate";
    plate.setAttribute("data-plate-for", id);
    plate.innerHTML =
      '<span class="sp-code">' + s.code + '</span>' +
      '<span class="sp-txt"><b>' + s.name + '</b><small>' + s.en + ' / 政瞳线</small></span>' +
      '<span class="sp-next">下一站 ' + s.next + ' →</span>';
    return plate;
  }

  function addPlates() {
    Object.keys(STATIONS).forEach(function (id) {
      var page = document.getElementById(id);
      if (!page || page.querySelector(".station-plate")) return;
      var plate = makePlate(id);
      if (!plate) return;
      var banner = page.querySelector(".banner");
      var head = page.querySelector(".pg-head");
      var xpHead = page.querySelector(".xp-page-head");
      var blessingBox = page.querySelector(".blessing-page");
      if (banner) {
        banner.insertBefore(plate, banner.firstChild);
      } else if (head) {
        plate.classList.add("inline");
        head.insertBefore(plate, head.firstChild);
      } else if (xpHead) {
        plate.classList.add("inline");
        xpHead.insertBefore(plate, xpHead.firstChild);
      } else if (blessingBox) {
        plate.classList.add("inline");
        blessingBox.insertBefore(plate, blessingBox.firstChild);
      } else {
        plate.classList.add("inline");
        page.insertBefore(plate, page.firstChild);
      }
    });
  }

  function syncUI(id) {
    if (!id) id = currentId();
    var primary = isSub(id) ? "theater" : id;

    document.querySelectorAll(".station-link").forEach(function (link) {
      var target = link.getAttribute("data-target");
      var on = (target === id) || (target === primary);
      link.classList.toggle("active", on);
    });

    var nextEl = document.getElementById("lbNext");
    if (nextEl) {
      if (isSub(id)) {
        nextEl.textContent = "G 支线 · " + STATIONS[id].name + " 到站";
      } else {
        var s = STATIONS[id] || STATIONS.home;
        nextEl.textContent = "下一站：" + s.next;
      }
    }

    var lbActive = document.querySelector(".line-board .lb-station.active");
    if (lbActive) {
      var activeName = lbActive.querySelector(".lb-name");
      if (activeName) activeName.classList.add("is-here");
    }

    var overlay = document.getElementById("networkOverlay");
    if (overlay) {
      overlay.setAttribute("data-current", id);
    }
  }

  var toastTimer = null;
  function showToast(id, isSubLine) {
    var s = STATIONS[id];
    if (!s) return;
    var toast = document.getElementById("pzToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "pz-toast";
      toast.id = "pzToast";
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.innerHTML =
      '<span class="pt-code">' + s.code + '</span>' +
      '<span class="pt-main">叮—— ' + s.name + ' 到了<small>' + (isSubLine ? "G 支线 · " : "") + "下一站 " + s.next + '</small></span>' +
      '<span class="pt-ding">NOW ARRIVING</span>';
    toast.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2100);
  }

  function tickClock() {
    var d = new Date();
    var hh = String(d.getHours()).padStart(2, "0");
    var mm = String(d.getMinutes()).padStart(2, "0");
    var now = hh + ":" + mm;
    var mins = d.getHours() * 60 + d.getMinutes();
    var running = mins >= 400 && mins <= 1410;
    document.querySelectorAll("#mhClock,#lbClock").forEach(function (el) {
      el.textContent = now;
    });
    var statusEl = document.getElementById("mhStatus");
    if (statusEl) statusEl.textContent = running ? "全线运行中" : "末班车已过 · 站内灯还亮着";
    var lbState = document.getElementById("lbStatus");
    if (lbState) lbState.textContent = running ? "全线运行" : "夜间值守";
    var lbClock = document.getElementById("lbClock");
    if (lbClock) lbClock.textContent = now;
  }

  function randomStation() {
    var stops = Array.prototype.slice.call(document.querySelectorAll(".mh-line .station-link"));
    if (!stops.length) return;
    var current = stops.findIndex(function (s) { return s.classList.contains("active"); });
    var next = current;
    if (stops.length > 1) {
      while (next === current) next = Math.floor(Math.random() * stops.length);
    }
    stops[next].click();
  }

  function openNetwork() {
    var overlay = document.getElementById("networkOverlay");
    if (!overlay) return;
    overlay.classList.add("show");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeNetwork() {
    var overlay = document.getElementById("networkOverlay");
    if (!overlay) return;
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function pinTop() {
    try {
      if (!window.location.hash || window.location.hash === "#home") window.scrollTo(0, 0);
    } catch (err) {}
  }

  function bind() {
    try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (err) {}
    window.scrollTo(0, 0);
    addPlates();
    tickClock();
    setInterval(tickClock, 30000);
    setTimeout(pinTop, 80);
    setTimeout(pinTop, 420);
    window.addEventListener("load", function () { setTimeout(pinTop, 0); });
    window.addEventListener("pageshow", function () { setTimeout(pinTop, 0); });
    syncUI(currentId());

    var brand = document.querySelector(".mh-brand");
    if (brand) {
      brand.addEventListener("click", function (e) {
        e.preventDefault();
        var home = document.querySelector('.mh-line .station-link[data-target="home"]');
        if (home) home.click();
      });
    }

    var random = document.getElementById("mhRandom");
    if (random) random.addEventListener("click", randomStation);
    var lbRandom = document.getElementById("lbRandom");
    if (lbRandom) lbRandom.addEventListener("click", randomStation);

    var netBtn = document.getElementById("mhNetwork");
    if (netBtn) netBtn.addEventListener("click", openNetwork);
    var netOpen2 = document.getElementById("lbNetwork");
    if (netOpen2) netOpen2.addEventListener("click", openNetwork);
    var netClose = document.getElementById("networkClose");
    if (netClose) netClose.addEventListener("click", closeNetwork);
    var netBg = document.querySelector(".network-bg");
    if (netBg) netBg.addEventListener("click", closeNetwork);

    var overlay = document.getElementById("networkOverlay");
    if (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target.closest(".nav-link")) {
          setTimeout(closeNetwork, 120);
        }
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNetwork();
    });

    document.addEventListener("click", function (e) {
      var back = e.target.closest("[data-game-back]");
      if (back) {
        // 已有脚本负责切换，这里只让 G 支线状态在切换后同步。
        setTimeout(function () { syncUI(currentId()); }, 0);
      }
    });

    window.addEventListener("zt:page", function (e) {
      var id = e.detail || currentId();
      syncUI(id);
      if (isSub(id)) showToast(id, true);
      else showToast(id, false);
      var lineBoard = document.querySelector(".line-board");
      if (lineBoard) lineBoard.setAttribute("data-current", id);
    });

    // 游戏厅五张卡加 G 站编号
    document.querySelectorAll(".gamehall-grid .mini-game-card").forEach(function (card, i) {
      if (!card.getAttribute("data-code")) card.setAttribute("data-code", "G" + (i + 1));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
