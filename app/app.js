const STORAGE_KEY = "review-shift-board-v1";

const sampleRecords = [
  {
    id: "REQ-2406-01",
    title: "AI 讲解页改版评审",
    owner: "B 组 / 德华",
    stage: "已通过",
    risk: "medium",
    reviewMinutes: 42,
    aiUsed: true,
    aiAdopted: true,
    prdReturned: true,
    prdReturnReason: "补充异常状态与兜底话术",
    shiftedIssues: 4,
    deliveryPassed: true,
    confirmed: true,
    evidence: [
      "评审记录中新增空状态、网络失败、讲解生成失败 3 类边界条件",
      "AI 报告中的 2 条风险提示被 PRD 修改采纳",
      "交付评审无阻塞问题"
    ],
    humanConfirm: ["AI 报告采纳口径已由需求负责人确认", "PRD 打回计入质量左移样本"]
  },
  {
    id: "REQ-2406-02",
    title: "拍搜结果页体验优化",
    owner: "拍搜 / B 组",
    stage: "评审中",
    risk: "high",
    reviewMinutes: 58,
    aiUsed: true,
    aiAdopted: false,
    prdReturned: false,
    prdReturnReason: "待确认",
    shiftedIssues: 2,
    deliveryPassed: false,
    confirmed: false,
    evidence: [
      "AI 报告指出结果空态、弱网加载、拍照失败链路缺说明",
      "评审仍在进行，采纳情况待负责人确认"
    ],
    humanConfirm: ["AI 建议是否被采纳", "弱网链路是否进入本期范围"]
  },
  {
    id: "REQ-2406-03",
    title: "提测虾交付门禁样例",
    owner: "质量左移 / 德华",
    stage: "待确认",
    risk: "medium",
    reviewMinutes: 35,
    aiUsed: true,
    aiAdopted: true,
    prdReturned: false,
    prdReturnReason: "无",
    shiftedIssues: 3,
    deliveryPassed: false,
    confirmed: false,
    evidence: [
      "门禁字段草案已覆盖需求完整性、测试风险、验收标准",
      "仍缺少真实试点需求读回记录"
    ],
    humanConfirm: ["门禁字段是否纳入正式提测流程", "6 月底是否用于阶段数据切片"]
  },
  {
    id: "REQ-2406-04",
    title: "测试用例 Skill 小组试用",
    owner: "AI 测试提效",
    stage: "已通过",
    risk: "low",
    reviewMinutes: 28,
    aiUsed: true,
    aiAdopted: true,
    prdReturned: false,
    prdReturnReason: "无",
    shiftedIssues: 5,
    deliveryPassed: true,
    confirmed: true,
    evidence: [
      "Skill 输出包含主流程、异常流、边界条件和人工确认点",
      "小组试用反馈显示用例初稿整理时间下降"
    ],
    humanConfirm: ["试用反馈样本数需要在双月报告中标注"]
  }
];

const projectSkills = [
  {
    name: "review-metric-recording",
    desc: "记录评审时长、AI 采纳、PRD 打回和交付结果。"
  },
  {
    name: "left-shift-evidence-map",
    desc: "把质量左移结论映射到真实评审证据。"
  },
  {
    name: "ai-report-adoption-check",
    desc: "判断 AI 报告建议是否真正被采纳。"
  }
];

const state = {
  records: loadRecords(),
  selectedId: null,
  risk: "all",
  stage: "all",
  query: "",
  view: "records"
};

const els = {
  metrics: document.getElementById("metrics"),
  records: document.getElementById("records"),
  detail: document.getElementById("detail"),
  recordCount: document.getElementById("recordCount"),
  search: document.getElementById("searchInput"),
  stageFilter: document.getElementById("stageFilter"),
  riskFilter: document.getElementById("riskFilter"),
  skillList: document.getElementById("skillList"),
  dialog: document.getElementById("recordDialog"),
  form: document.getElementById("recordForm"),
  toast: document.getElementById("toast")
};

function loadRecords() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(sampleRecords);
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : structuredClone(sampleRecords);
  } catch {
    return structuredClone(sampleRecords);
  }
}

function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.records));
}

function percent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function getMetrics(records) {
  const total = records.length;
  const aiUsed = records.filter((item) => item.aiUsed).length;
  const aiAdopted = records.filter((item) => item.aiUsed && item.aiAdopted).length;
  const returned = records.filter((item) => item.prdReturned).length;
  const shifted = records.filter((item) => item.shiftedIssues > 0).length;
  const passed = records.filter((item) => item.deliveryPassed).length;
  const avgReview = total
    ? Math.round(records.reduce((sum, item) => sum + Number(item.reviewMinutes || 0), 0) / total)
    : 0;

  return [
    { label: "平均评审时长", value: `${avgReview}m`, tone: "blue", foot: "目标：持续下降" },
    { label: "AI 报告采纳率", value: `${percent(aiAdopted, aiUsed)}%`, tone: "green", foot: `${aiAdopted}/${aiUsed} 条采纳` },
    { label: "PRD 打回率", value: `${percent(returned, total)}%`, tone: "amber", foot: `${returned}/${total} 个需求` },
    { label: "质量左移率", value: `${percent(shifted, total)}%`, tone: "green", foot: `${shifted} 个样本有前置发现` },
    { label: "交付评审通过率", value: `${percent(passed, total)}%`, tone: "rose", foot: `${passed}/${total} 个通过` }
  ];
}

function filteredRecords() {
  const query = state.query.trim().toLowerCase();
  return state.records.filter((item) => {
    const byRisk = state.risk === "all" || item.risk === state.risk;
    const byStage = state.stage === "all" || item.stage === state.stage;
    const haystack = [item.title, item.owner, item.stage, item.evidence.join(" "), item.humanConfirm.join(" ")]
      .join(" ")
      .toLowerCase();
    return byRisk && byStage && (!query || haystack.includes(query));
  });
}

function renderMetrics() {
  els.metrics.innerHTML = getMetrics(state.records)
    .map(
      (metric) => `
      <article class="metric-card">
        <div class="metric-label">
          <span>${metric.label}</span>
          <span class="badge ${metric.tone}">${state.records.length} 样本</span>
        </div>
        <div class="metric-value">${metric.value}</div>
        <div class="metric-foot">
          <span class="metric-label">${metric.foot}</span>
          <svg class="sparkline" viewBox="0 0 90 30" aria-hidden="true">
            <path d="M3 24 C 15 22, 18 12, 29 15 S 45 26, 57 15 S 71 4, 87 8" />
          </svg>
        </div>
      </article>
    `
    )
    .join("");
}

function riskBadge(risk) {
  const map = {
    high: ["高风险", "rose"],
    medium: ["中风险", "amber"],
    low: ["低风险", "green"]
  };
  const item = map[risk] || ["未定", "blue"];
  return `<span class="badge ${item[1]}">${item[0]}</span>`;
}

function renderRecords() {
  const records = filteredRecords();
  if (!state.selectedId && records[0]) state.selectedId = records[0].id;
  els.recordCount.textContent = `${records.length} 条记录`;

  if (state.view === "evidence") {
    els.records.innerHTML = records
      .flatMap((record) =>
        record.evidence.map(
          (evidence) => `
          <button class="record-card" type="button" data-id="${record.id}">
            <div class="record-top">
              <div class="record-title">
                <h3>${evidence}</h3>
                <p>${record.title}</p>
              </div>
              ${riskBadge(record.risk)}
            </div>
          </button>
        `
        )
      )
      .join("");
    return;
  }

  els.records.innerHTML = records
    .map((record) => {
      const progress = Math.min(100, record.shiftedIssues * 20 + (record.aiAdopted ? 20 : 0) + (record.deliveryPassed ? 20 : 0));
      return `
      <button class="record-card ${record.id === state.selectedId ? "active" : ""}" type="button" data-id="${record.id}">
        <div class="record-top">
          <div class="record-title">
            <h3>${record.title}</h3>
            <p>${record.id} · ${record.owner}</p>
          </div>
          ${riskBadge(record.risk)}
        </div>
        <div class="record-pills">
          <span class="badge blue">${record.stage}</span>
          <span class="badge ${record.aiAdopted ? "green" : "amber"}">AI ${record.aiAdopted ? "已采纳" : "待确认"}</span>
          <span class="badge ${record.prdReturned ? "amber" : "green"}">${record.prdReturned ? "PRD 打回" : "PRD 未打回"}</span>
        </div>
        <div class="progress-row">
          <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
          <span class="record-meta">${record.shiftedIssues} 个前置发现</span>
        </div>
      </button>
    `;
    })
    .join("");
}

function renderSkills() {
  els.skillList.innerHTML = projectSkills
    .map(
      (skill) => `
      <div class="skill-item">
        <strong>${skill.name}</strong>
        <span>${skill.desc}</span>
      </div>
    `
    )
    .join("");
}

function renderDetail() {
  const record = state.records.find((item) => item.id === state.selectedId);
  if (!record) {
    els.detail.innerHTML = `
      <div class="detail-empty">
        <div>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4zM8 8h8M8 12h5M8 16h7" /></svg>
          <p>选择一条记录</p>
        </div>
      </div>
    `;
    return;
  }

  els.detail.innerHTML = `
    <div class="detail-header">
      <div class="detail-actions">
        <span class="badge blue">${record.stage}</span>
        <button class="secondary-button" type="button" id="confirmBtn">${record.confirmed ? "取消确认" : "标记确认"}</button>
      </div>
      <h2>${record.title}</h2>
      <p class="record-meta">${record.id} · ${record.owner}</p>
    </div>
    <div class="detail-section">
      <h3>指标口径</h3>
      <div class="mini-table">
        <div class="mini-row"><span>评审时长</span><strong>${record.reviewMinutes} 分钟</strong></div>
        <div class="mini-row"><span>AI 报告</span><strong>${record.aiUsed ? (record.aiAdopted ? "已采纳" : "待确认") : "未使用"}</strong></div>
        <div class="mini-row"><span>PRD 状态</span><strong>${record.prdReturned ? `已打回：${record.prdReturnReason}` : "未打回"}</strong></div>
        <div class="mini-row"><span>交付评审</span><strong>${record.deliveryPassed ? "通过" : "未通过/未完成"}</strong></div>
      </div>
    </div>
    <div class="detail-section">
      <h3>证据链</h3>
      <ul class="evidence-list">
        ${record.evidence.map((item) => `<li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg><span>${item}</span></li>`).join("")}
      </ul>
    </div>
    <div class="detail-section">
      <h3>人工确认点</h3>
      <ul class="confirm-list">
        ${record.humanConfirm.map((item) => `<li><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 9v4m0 4h.01M10.3 4.3 2.8 17.2A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-2.8L13.7 4.3a2 2 0 0 0-3.4 0Z" /></svg><span>${item}</span></li>`).join("")}
      </ul>
    </div>
  `;

  document.getElementById("confirmBtn").addEventListener("click", () => {
    record.confirmed = !record.confirmed;
    saveRecords();
    render();
    showToast(record.confirmed ? "已标记人工确认" : "已取消确认");
  });
}

function render() {
  renderMetrics();
  renderRecords();
  renderDetail();
  renderSkills();
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 2200);
}

function lines(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function addRecord(formData) {
  const now = new Date();
  const id = `REQ-${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(state.records.length + 1).padStart(2, "0")}`;
  const evidence = lines(formData.get("evidence"));
  const humanConfirm = lines(formData.get("humanConfirm"));
  state.records.unshift({
    id,
    title: formData.get("title"),
    owner: formData.get("owner"),
    stage: formData.get("stage"),
    risk: formData.get("risk"),
    reviewMinutes: Number(formData.get("reviewMinutes") || 0),
    shiftedIssues: Number(formData.get("shiftedIssues") || 0),
    aiUsed: formData.get("aiUsed") === "on",
    aiAdopted: formData.get("aiAdopted") === "on",
    prdReturned: formData.get("prdReturned") === "on",
    deliveryPassed: formData.get("deliveryPassed") === "on",
    prdReturnReason: formData.get("prdReturned") === "on" ? "需补充确认" : "无",
    confirmed: false,
    evidence: evidence.length ? evidence : ["新增记录，证据待补充"],
    humanConfirm: humanConfirm.length ? humanConfirm : ["指标归因需人工确认"]
  });
  state.selectedId = id;
  saveRecords();
  render();
}

function exportMarkdown() {
  const metrics = getMetrics(state.records);
  const linesOut = [
    "# 评审虾质量左移周同步",
    "",
    "## 核心指标",
    "",
    ...metrics.map((item) => `- ${item.label}：${item.value}（${item.foot}）`),
    "",
    "## 试点记录",
    "",
    ...state.records.flatMap((record) => [
      `### ${record.title}`,
      `- 阶段：${record.stage}`,
      `- 风险：${record.risk}`,
      `- 评审时长：${record.reviewMinutes} 分钟`,
      `- 左移问题数：${record.shiftedIssues}`,
      `- AI 报告：${record.aiAdopted ? "已采纳" : "待确认"}`,
      `- 人工确认：${record.confirmed ? "已确认" : "待确认"}`,
      `- 证据：${record.evidence.join("；")}`,
      ""
    ])
  ];

  navigator.clipboard
    .writeText(linesOut.join("\n"))
    .then(() => showToast("周同步已复制"))
    .catch(() => showToast("复制失败，请使用浏览器权限重试"));
}

document.getElementById("newRecordBtn").addEventListener("click", () => els.dialog.showModal());
document.getElementById("closeDialogBtn").addEventListener("click", () => els.dialog.close());
document.getElementById("cancelBtn").addEventListener("click", () => els.dialog.close());
document.getElementById("exportBtn").addEventListener("click", exportMarkdown);
document.getElementById("resetBtn").addEventListener("click", () => {
  state.records = structuredClone(sampleRecords);
  state.selectedId = null;
  saveRecords();
  render();
  showToast("已恢复样例数据");
});

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  addRecord(new FormData(els.form));
  els.form.reset();
  els.dialog.close();
  showToast("记录已保存");
});

els.records.addEventListener("click", (event) => {
  const card = event.target.closest("[data-id]");
  if (!card) return;
  state.selectedId = card.dataset.id;
  render();
});

els.search.addEventListener("input", (event) => {
  state.query = event.target.value;
  state.selectedId = null;
  render();
});

els.stageFilter.addEventListener("change", (event) => {
  state.stage = event.target.value;
  state.selectedId = null;
  render();
});

els.riskFilter.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  state.risk = button.dataset.value;
  [...els.riskFilter.querySelectorAll("button")].forEach((item) => item.classList.toggle("active", item === button));
  state.selectedId = null;
  render();
});

document.querySelector(".view-tabs").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  state.view = button.dataset.view;
  [...document.querySelectorAll(".view-tabs button")].forEach((item) => item.classList.toggle("active", item === button));
  render();
});

render();
