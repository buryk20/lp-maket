const FX_RATE = 41.2;
const ROI_ASSUMPTIONS = {
  performanceFactor: 0.88,
  capexUsdPerCoveredMwhMonth: 3800,
  annualServiceShare: 0.015,
  co2PerMwh: 0.2,
  treesPerTon: 44.6,
};

const dayProfiles = {
  summer: {
    solar: [0, 0, 20, 80, 200, 380, 520, 680, 820, 850, 830, 790, 740, 680, 580, 440, 280, 140, 40, 10, 0, 0, 0, 0],
    load: [300, 280, 270, 280, 350, 450, 600, 650, 680, 700, 720, 700, 680, 660, 640, 680, 720, 740, 700, 620, 520, 420, 350, 310],
  },
  winter: {
    solar: [0, 0, 0, 0, 20, 60, 120, 200, 280, 310, 300, 280, 240, 180, 100, 40, 10, 0, 0, 0, 0, 0, 0, 0],
    load: [400, 380, 360, 370, 430, 520, 680, 700, 720, 740, 760, 740, 720, 700, 680, 720, 760, 780, 760, 680, 600, 520, 460, 420],
  },
  cloud: {
    solar: [0, 0, 10, 30, 80, 140, 200, 240, 260, 280, 270, 250, 220, 180, 140, 90, 50, 20, 5, 0, 0, 0, 0, 0],
    load: [300, 280, 270, 280, 350, 450, 600, 650, 680, 700, 720, 700, 680, 660, 640, 680, 720, 740, 700, 620, 520, 420, 350, 310],
  },
};

const flowStates = {
  day: {
    sun: "850 кВт",
    load: "600 кВт",
    bess: "+250 кВт",
    bessLabel: "BESS заряджається",
    grid: "0 кВт",
    gridLabel: "Мережа (резерв)",
    description:
      "Вдень СЕС покриває виробниче споживання, а надлишок заряджає систему накопичення. Мережа залишається резервним сценарієм без активного відбору.",
    bars: [85, 60, 78, 0],
    bessColor: "#0ea47a",
  },
  evening: {
    sun: "80 кВт",
    load: "750 кВт",
    bess: "−670 кВт",
    bessLabel: "BESS розряджається",
    grid: "0 кВт",
    gridLabel: "Мережа (резерв)",
    description:
      "У вечірній пік накопичена енергія згладжує навантаження та утримує об'єкт у керованому режимі без виходу за договірну потужність.",
    bars: [8, 75, 90, 0],
    bessColor: "#f36c21",
  },
  night: {
    sun: "0 кВт",
    load: "400 кВт",
    bess: "−280 кВт",
    bessLabel: "BESS розряджається",
    grid: "120 кВт",
    gridLabel: "Мережа (нічний тариф)",
    description:
      "Уночі система поєднує дешевшу мережеву енергію та залишковий ресурс BESS, формуючи передбачуваний профіль споживання до старту нового циклу.",
    bars: [0, 40, 45, 18],
    bessColor: "#f36c21",
  },
};

const tariffScenarioConfig = {
  conservative: { growth: 1.05, ownStart: 3.2, ownFloor: 2.45, ownDecay: 0.97 },
  base: { growth: 1.08, ownStart: 3.2, ownFloor: 2.35, ownDecay: 0.968 },
  stress: { growth: 1.11, ownStart: 3.25, ownFloor: 2.42, ownDecay: 0.972 },
};

const peakBaseline = [320, 310, 300, 330, 480, 660, 850, 920, 980, 1050, 1020, 980, 950, 900, 880, 920, 1100, 1200, 1140, 980, 820, 680, 520, 380];
const peakLabels = Array.from({ length: 24 }, (_, index) => `${String(index).padStart(2, "0")}:00`);

function byId(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const node = byId(id);
  if (node) node.textContent = value;
}

function formatUsd(value) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  return `$${Math.round(value / 1000)}K`;
}

function formatUahMillions(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)} млн грн`;
  return `${Math.round(value / 1000)} тис. грн`;
}

function formatNumber(value) {
  return Math.round(value).toLocaleString("uk-UA");
}

function buildNiceTicks(maxValue, desiredCount = 4) {
  const safeMax = Math.max(maxValue, 1);
  const roughStep = safeMax / desiredCount;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;

  let step = 1;
  if (normalized > 1 && normalized <= 2) step = 2;
  else if (normalized > 2 && normalized <= 5) step = 5;
  else if (normalized > 5) step = 10;

  step *= magnitude;

  const top = Math.ceil(safeMax / step) * step;
  const ticks = [];

  for (let value = 0; value <= top + step * 0.5; value += step) {
    ticks.push(value);
  }

  return ticks;
}

function createGeometry(width = 760, height = 240) {
  const left = 56;
  const right = width - 18;
  const top = 18;
  const bottom = height - 28;

  return {
    width,
    height,
    left,
    right,
    top,
    bottom,
    innerWidth: right - left,
    innerHeight: bottom - top,
  };
}

function getPoint(index, count, value, maxValue, geometry) {
  const x = geometry.left + (geometry.innerWidth * index) / Math.max(count - 1, 1);
  const y = geometry.bottom - (value / maxValue) * geometry.innerHeight;
  return { x, y };
}

function buildLinePath(values, maxValue, geometry) {
  return values
    .map((value, index) => {
      const point = getPoint(index, values.length, value, maxValue, geometry);
      return `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`;
    })
    .join(" ");
}

function buildAreaPath(values, maxValue, geometry) {
  const path = buildLinePath(values, maxValue, geometry);
  return `${path} L${geometry.right},${geometry.bottom} L${geometry.left},${geometry.bottom} Z`;
}

function renderGridMarkup(labels, ticks, geometry, yFormatter, forceAllX = false) {
  const maxValue = ticks[ticks.length - 1];
  let markup = "";

  [...ticks].reverse().forEach((tick) => {
    const y = geometry.bottom - (tick / maxValue) * geometry.innerHeight;
    markup += `<line class="chart-grid-line" x1="${geometry.left}" y1="${y}" x2="${geometry.right}" y2="${y}"></line>`;
    markup += `<text class="chart-axis-label" x="${geometry.left - 10}" y="${y + 4}" text-anchor="end">${yFormatter(tick)}</text>`;
  });

  const step = forceAllX ? 1 : Math.max(1, Math.ceil(labels.length / 8));

  labels.forEach((label, index) => {
    if (!forceAllX && index % step !== 0 && index !== labels.length - 1) return;
    const point = getPoint(index, labels.length, 0, maxValue, geometry);
    markup += `<text class="chart-label" x="${point.x}" y="${geometry.height - 8}" text-anchor="middle">${label}</text>`;
  });

  return markup;
}

function renderLineChart(targetId, config) {
  const svg = byId(targetId);
  if (!svg) return;

  const geometry = createGeometry();
  const values = config.datasets.flatMap((dataset) => dataset.values);
  const ticks = buildNiceTicks(Math.max(...values));
  const maxValue = ticks[ticks.length - 1];
  const yFormatter = config.yFormatter || ((value) => String(value));

  let markup = renderGridMarkup(config.labels, ticks, geometry, yFormatter, config.forceAllX);

  config.datasets.forEach((dataset) => {
    if (dataset.fill) {
      markup += `<path d="${buildAreaPath(dataset.values, maxValue, geometry)}" fill="${dataset.fill}"></path>`;
    }

    markup += `<path d="${buildLinePath(dataset.values, maxValue, geometry)}" fill="none" stroke="${dataset.stroke}" stroke-width="${dataset.width || 3}" stroke-linecap="round" stroke-linejoin="round"${dataset.dash ? ` stroke-dasharray="${dataset.dash}"` : ""}></path>`;
  });

  if (config.markerXValue !== undefined) {
    const markerX = geometry.left + (geometry.innerWidth * config.markerXValue) / Math.max(config.labels.length - 1, 1);
    markup += `<line x1="${markerX}" y1="${geometry.top}" x2="${markerX}" y2="${geometry.bottom}" stroke="rgba(243, 108, 33, 0.42)" stroke-width="2" stroke-dasharray="6 6"></line>`;
  }

  svg.innerHTML = markup;
}

function renderPeakChart(targetId, values, limit, safeMode = false, sharedMax = null) {
  const svg = byId(targetId);
  if (!svg) return;

  const geometry = createGeometry();
  const ticks = buildNiceTicks(sharedMax ?? Math.max(...values, limit));
  const maxValue = ticks[ticks.length - 1];
  const step = Math.max(1, Math.ceil(values.length / 8));
  const slotWidth = geometry.innerWidth / values.length;
  const barWidth = Math.max(8, slotWidth * 0.62);
  let markup = renderGridMarkup(peakLabels, ticks, geometry, (value) => `${Math.round(value)}`, false);

  values.forEach((value, index) => {
    if (index % step !== 0 && index !== values.length - 1) {
      // keep grid labels sparse while bars stay full
    }

    const point = getPoint(index, values.length, value, maxValue, geometry);
    const x = geometry.left + slotWidth * index + (slotWidth - barWidth) / 2;
    const y = point.y;
    const height = geometry.bottom - y;
    const statusClass = safeMode ? "chart-bar is-safe" : value > limit ? "chart-bar is-alert" : "chart-bar";

    markup += `<rect class="${statusClass}" x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${barWidth.toFixed(2)}" height="${height.toFixed(2)}" rx="6"></rect>`;
  });

  const limitY = geometry.bottom - (limit / maxValue) * geometry.innerHeight;
  markup += `<line class="chart-threshold${safeMode ? " safe" : ""}" x1="${geometry.left}" y1="${limitY}" x2="${geometry.right}" y2="${limitY}"></line>`;
  markup += `<text class="chart-axis-label" x="${geometry.right}" y="${limitY - 8}" text-anchor="end">Ліміт ${Math.round(limit)} кВт</text>`;

  svg.innerHTML = markup;
}

function buildTariffSeries(scenarioKey) {
  const config = tariffScenarioConfig[scenarioKey] || tariffScenarioConfig.base;
  const years = Array.from({ length: 26 }, (_, index) => index);
  const market = years.map((year) => Number((5.0 * config.growth ** year).toFixed(1)));
  const own = years.map((year) => {
    const value = config.ownStart * config.ownDecay ** year;
    return Number(Math.max(config.ownFloor, value).toFixed(1));
  });
  const advantage = years.map((year, index) => Number((market[index] - own[index]).toFixed(1)));

  return { years, market, own, advantage };
}

function updateRoiMetrics() {
  const consumption = Number(byId("consumptionRange")?.value || 500);
  const tariff = Number(byId("tariffRange")?.value || 5);
  const cover = Number(byId("coverRange")?.value || 60) / 100;
  const coveredEnergyPerYear = consumption * 1000 * 12 * cover * ROI_ASSUMPTIONS.performanceFactor;
  const annualSavingUah = coveredEnergyPerYear * tariff;
  const investmentUsd = consumption * cover * ROI_ASSUMPTIONS.capexUsdPerCoveredMwhMonth;
  const annualServiceUsd = investmentUsd * ROI_ASSUMPTIONS.annualServiceShare;
  const annualSavingUsd = annualSavingUah / FX_RATE;
  const netBenefitUsd = Math.max(annualSavingUsd - annualServiceUsd, 1);
  const paybackYears = investmentUsd / netBenefitUsd;
  const roi = (netBenefitUsd / investmentUsd) * 100;
  const yearlyCo2 = coveredEnergyPerYear / 1000 * ROI_ASSUMPTIONS.co2PerMwh;
  const trees = yearlyCo2 * ROI_ASSUMPTIONS.treesPerTon;

  setText("consumptionValue", `${consumption} МВт·год / міс`);
  setText("tariffValue", `${tariff.toFixed(1)} грн / кВт·год`);
  setText("coverValue", `${Math.round(cover * 100)}%`);
  setText("metricInvestment", formatUsd(investmentUsd));
  setText("metricSaving", formatUahMillions(annualSavingUah));
  setText("metricPayback", `${paybackYears.toFixed(1)} роки`);
  setText("metricRoi", `${Math.round(roi)}%`);
  setText("co2Tons", formatNumber(yearlyCo2));
  setText("co2Trees", formatNumber(trees));
  setText("cleanEnergy", formatNumber(coveredEnergyPerYear / 1000));

  const years = Array.from({ length: 11 }, (_, index) => index);
  const savingsLine = years.map((year) => Number(((annualSavingUah / 1000000) * year).toFixed(1)));
  const investmentLine = years.map(() => Number(((investmentUsd * FX_RATE) / 1000000).toFixed(1)));

  renderLineChart("roiChart", {
    labels: years.map((year) => `Рік ${year}`),
    yFormatter: (value) => `${Math.round(value)}`,
    datasets: [
      { values: savingsLine, stroke: "#0ea47a", fill: "rgba(14, 164, 122, 0.12)" },
      { values: investmentLine, stroke: "#f36c21", dash: "10 8" },
    ],
    markerXValue: Math.min(paybackYears, years.length - 1),
  });
}

function updatePeakShaving() {
  const contract = Number(byId("contractRange")?.value || 800);
  const after = peakBaseline.map((value) => Math.min(value, contract));
  const bessDispatch = peakBaseline.map((value, index) => Math.max(0, value - after[index]));
  const peakReduction = Math.max(...peakBaseline) - Math.max(...after);
  const peakSupport = Math.max(...bessDispatch);
  const penaltyRisk = peakReduction >= 180 ? "мінімізований" : peakReduction >= 90 ? "контрольований" : "помірний";
  const sharedPeakMax = Math.max(...peakBaseline, contract);

  setText("contractValue", `${contract} кВт`);
  setText("peakReduction", `${peakReduction} кВт`);
  setText("peakSupport", `${peakSupport} кВт`);
  setText("penaltyRisk", penaltyRisk);

  renderPeakChart("peakBeforeChart", peakBaseline, contract, false, sharedPeakMax);
  renderPeakChart("peakAfterChart", after, contract, true, sharedPeakMax);
}

function setupPeakShavingControls() {
  const range = byId("contractRange");
  if (!range) return;

  range.addEventListener("input", updatePeakShaving);
  updatePeakShaving();
}

function renderTariffChart(scenarioKey = "base") {
  const { years, market, own, advantage } = buildTariffSeries(scenarioKey);

  renderLineChart("tariffChart", {
    labels: years.map((year) => (year === 0 ? "Зараз" : `${year}`)),
    yFormatter: (value) => `${value.toFixed(0)}`,
    datasets: [
      { values: market, stroke: "#e24b4a", fill: "rgba(226, 75, 74, 0.08)" },
      { values: own, stroke: "#0ea47a", fill: "rgba(14, 164, 122, 0.08)" },
      { values: advantage, stroke: "#f3a029", dash: "9 7" },
    ],
  });

  const spread = market[market.length - 1] - own[own.length - 1];
  const hedge = (spread / market[market.length - 1]) * 100;
  setText("tariffSpread", `${spread.toFixed(1)} грн/кВт·год`);
  setText("tariffHedge", `${Math.round(hedge)}%`);
}

function setupTariffScenarioTabs() {
  const buttons = [...document.querySelectorAll("[data-tariff-scenario]")];
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const scenario = button.dataset.tariffScenario;
      buttons.forEach((item) => item.classList.toggle("is-active", item === button));
      renderTariffChart(scenario);
    });
  });

  const active = buttons.find((button) => button.classList.contains("is-active"))?.dataset.tariffScenario || "base";
  renderTariffChart(active);
}

function renderDayChart(targetId, mode) {
  const profile = dayProfiles[mode];
  const svg = byId(targetId);
  if (!svg || !profile) return;

  const charge = profile.solar.map((value, index) => (value > profile.load[index] ? value - profile.load[index] : 0));
  const discharge = profile.solar.map((value, index) => (profile.load[index] > value ? Math.min(profile.load[index] - value, 300) : 0));

  renderLineChart(targetId, {
    labels: Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0")),
    yFormatter: (value) => `${Math.round(value)}`,
    datasets: [
      { values: profile.solar, stroke: "#f3a029", fill: "rgba(243, 160, 41, 0.1)" },
      { values: profile.load, stroke: "#1a2440", fill: "rgba(26, 36, 64, 0.05)" },
      { values: charge, stroke: "#0ea47a", dash: "10 7" },
      { values: discharge, stroke: "#f36c21", dash: "7 7" },
    ],
  });
}

function setupDayTabs() {
  const buttons = [...document.querySelectorAll("[data-day-mode]")];
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.dayTarget;
      const mode = button.dataset.dayMode;
      buttons
        .filter((item) => item.dataset.dayTarget === target)
        .forEach((item) => item.classList.toggle("is-active", item === button));
      renderDayChart(target, mode);
    });
  });

  const grouped = new Set(buttons.map((button) => button.dataset.dayTarget));
  grouped.forEach((target) => renderDayChart(target, "summer"));
}

function updateFlowState(root, mode) {
  const state = flowStates[mode];
  if (!root || !state) return;

  const fieldMap = {
    sun: state.sun,
    load: state.load,
    bess: state.bess,
    bessLabel: state.bessLabel,
    grid: state.grid,
    gridLabel: state.gridLabel,
    description: state.description,
  };

  Object.entries(fieldMap).forEach(([key, value]) => {
    const node = root.querySelector(`[data-flow-field="${key}"]`);
    if (node) node.textContent = value;
  });

  ["sun", "load", "bess", "grid"].forEach((key, index) => {
    const node = root.querySelector(`[data-flow-bar="${key}"]`);
    if (node) node.style.width = `${state.bars[index]}%`;
  });

  const bessBar = root.querySelector('[data-flow-bar="bess"]');
  if (bessBar) bessBar.style.background = state.bessColor;
}

function setupFlowTabs() {
  const roots = [...document.querySelectorAll("[data-flow-root]")];
  if (!roots.length) return;

  roots.forEach((root) => {
    const buttons = [...root.querySelectorAll("[data-flow-mode]")];
    if (!buttons.length) return;

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((item) => item.classList.toggle("is-active", item === button));
        updateFlowState(root, button.dataset.flowMode);
      });
    });

    const active = buttons.find((button) => button.classList.contains("is-active"))?.dataset.flowMode || "day";
    updateFlowState(root, active);
  });
}

function updateForest(selector, grownCount) {
  const stage = document.querySelector(selector);
  if (!stage) return;

  stage.querySelectorAll(".forest-tree").forEach((tree, index) => {
    tree.classList.toggle("is-grown", index < grownCount);
  });
}

function updateDecarbBlock(config) {
  const range = byId(config.rangeId);
  if (!range) return;

  const energy = Number(range.value || config.defaultValue || 3200);
  const co2 = energy * ROI_ASSUMPTIONS.co2PerMwh;
  const trees = co2 * ROI_ASSUMPTIONS.treesPerTon;
  const minEnergy = Number(range.min || 0);
  const maxEnergy = Number(range.max || Math.max(minEnergy + 1, energy));
  const normalized = maxEnergy > minEnergy ? (energy - minEnergy) / (maxEnergy - minEnergy) : 1;
  const grownTrees = Math.max(1, Math.min(config.treeCount, Math.ceil(normalized * config.treeCount)));

  setText(config.energyValueId, `${energy.toLocaleString("uk-UA")} МВт·год / рік`);
  setText(config.co2Id, formatNumber(co2));
  setText(config.treeId, formatNumber(trees));
  setText(config.cleanId, formatNumber(energy));
  updateForest(config.forestSelector, grownTrees);
}

function setupDecarbRange(config) {
  const range = byId(config.rangeId);
  if (!range) return;

  const update = () => updateDecarbBlock(config);
  range.addEventListener("input", update);
  update();
}

function setupRoiControls() {
  const metricInputs = ["consumptionRange", "tariffRange", "coverRange"].map(byId).filter(Boolean);
  if (metricInputs.length) {
    metricInputs.forEach((input) => input.addEventListener("input", updateRoiMetrics));
    updateRoiMetrics();
  }

  setupPeakShavingControls();
  setupTariffScenarioTabs();
}

setupRoiControls();
setupDayTabs();
setupFlowTabs();
setupDecarbRange({
  rangeId: "homeEnergyRange",
  energyValueId: "homeEnergyValue",
  co2Id: "homeCo2Tons",
  treeId: "homeCo2Trees",
  cleanId: "homeCleanEnergy",
  forestSelector: "#homeForestStage",
  treeCount: 12,
  treeDivider: 18000,
});
setupDecarbRange({
  rangeId: "roiEnergyRange",
  energyValueId: "roiEnergyValue",
  co2Id: "roiCo2Tons",
  treeId: "roiCo2Trees",
  cleanId: "roiCleanEnergy",
  forestSelector: "#roiForestStage",
  treeCount: 10,
  treeDivider: 22000,
});
