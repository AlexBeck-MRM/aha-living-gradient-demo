const STORAGE_KEY = "aha-living-gradient-playground:v15";

const prototype = document.querySelector(".prototype");
const gradients = Array.from(document.querySelectorAll(".living-gradient"));
const controlsRoot = document.querySelector("[data-control-root]");
const cssOutput = document.querySelector("[data-css-output]");
const copyCssButton = document.querySelector("[data-copy-css]");
const copyConfigButton = document.querySelector("[data-copy-config]");
const resetButton = document.querySelector("[data-reset-config]");
const copyStatus = document.querySelector("[data-copy-status]");
const modeReadout = document.querySelector("[data-mode-readout]");

const fieldMarkup = {
  "lg-field-red": '<span class="lg-field lg-field-red" aria-hidden="true"></span>',
  "lg-field-red-alt": '<span class="lg-field lg-field-red-alt" aria-hidden="true"></span>',
  "lg-field-deep": '<span class="lg-field lg-field-deep" aria-hidden="true"></span>',
  "lg-field-warm": '<span class="lg-field lg-field-warm" aria-hidden="true"></span>',
  "lg-field-veil": '<span class="lg-field lg-field-veil" aria-hidden="true"></span>',
  "lg-field-cloud-a": '<span class="lg-field lg-field-cloud-a" aria-hidden="true"></span>',
  "lg-field-cloud-b": '<span class="lg-field lg-field-cloud-b" aria-hidden="true"></span>',
  "lg-field-cloud-c": '<span class="lg-field lg-field-cloud-c" aria-hidden="true"></span>',
  "lg-field-cloud-d": '<span class="lg-field lg-field-cloud-d" aria-hidden="true"></span>',
};

const baseFields = ["lg-field-red", "lg-field-red-alt", "lg-field-deep", "lg-field-warm", "lg-field-veil"];
const modeFields = {
  breath: baseFields,
  current: baseFields,
  pulse: baseFields,
  cloudmesh: [...baseFields, "lg-field-cloud-a", "lg-field-cloud-b", "lg-field-cloud-c", "lg-field-cloud-d"],
  shaderflow: [],
  softplasma: [],
};
const shaderModes = new Set(["shaderflow", "softplasma"]);

const modes = [
  {
    value: "breath",
    label: "Breath Field",
    family: "Expansion",
    accent: "warmth returns",
    summary: "A slow red inhale with orange briefly blooming off-axis.",
    duration: 12,
    parameterTitle: "Breath Parameters",
    parameterKeys: ["duration", "revealStrength", "revealWindow", "revealPhase", "pulseIntensity", "rest", "warmWindow", "driftDistance", "scale", "softness", "orangeIntensity", "deepStrength", "surfaceBlend"],
    trimKeys: ["brightness", "saturation", "redDominance", "p3"],
  },
  {
    value: "current",
    label: "Living Current",
    family: "Travel",
    accent: "oversized fields",
    summary: "Large colour masses move through the visible window at different speeds.",
    duration: 14,
    parameterTitle: "Current Parameters",
    parameterKeys: ["duration", "revealStrength", "revealWindow", "revealPhase", "driftDistance", "fieldSpread", "deepDrift", "surfaceBlend", "orangeIntensity", "redDominance", "deepStrength", "warmWindow", "softness"],
    trimKeys: ["brightness", "saturation", "warmWindow", "p3"],
  },
  {
    value: "pulse",
    label: "Warm Pulse",
    family: "Event",
    accent: "periodic bloom",
    summary: "Red rests, warmth rises through the surface, then dissolves.",
    duration: 10,
    parameterTitle: "Pulse Parameters",
    parameterKeys: ["duration", "revealStrength", "revealWindow", "revealPhase", "pulseIntensity", "rest", "warmWindow", "bloomX", "bloomY", "orangeIntensity", "deepStrength", "surfaceBlend", "softness"],
    trimKeys: ["brightness", "saturation", "redDominance", "phase", "p3"],
  },
  {
    value: "cloudmesh",
    label: "Radial Cloud Mesh",
    family: "Cloud",
    accent: "radial drift",
    summary: "Slow cloud fields overlap like a blurred radial shader.",
    duration: 18,
    parameterTitle: "Cloud Parameters",
    parameterKeys: ["duration", "revealStrength", "revealWindow", "revealPhase", "meshBlur", "meshTension", "fieldSpread", "bloomX", "bloomY", "orangeIntensity", "deepStrength", "surfaceBlend", "driftDistance"],
    trimKeys: ["brightness", "saturation", "redDominance", "warmWindow", "phase", "p3"],
  },
  {
    value: "shaderflow",
    label: "Shader Flow",
    family: "Shader",
    accent: "warped colour ramp",
    summary: "A procedural gradient map flows through soft domain-warped noise.",
    duration: 16,
    parameterTitle: "Shader Flow Parameters",
    parameterKeys: ["duration", "shaderSpeed", "turbulence", "warpStrength", "colorCloseness", "warmEvent", "deepPull", "shaderBlur", "renderScale", "revealStrength", "revealPhase"],
    trimKeys: ["brightness", "saturation", "orangeIntensity", "deepStrength", "p3"],
  },
  {
    value: "softplasma",
    label: "Soft Plasma",
    family: "Shader",
    accent: "metaball warmth",
    summary: "Soft plasma fields merge and dissolve through the AHA colour ramp.",
    duration: 14,
    parameterTitle: "Soft Plasma Parameters",
    parameterKeys: ["duration", "shaderSpeed", "turbulence", "warpStrength", "colorCloseness", "warmEvent", "deepPull", "shaderBlur", "renderScale", "revealStrength", "revealPhase"],
    trimKeys: ["brightness", "saturation", "orangeIntensity", "deepStrength", "p3"],
  },
];

const modeLabels = Object.fromEntries(modes.map((mode) => [mode.value, mode.label]));
const modeDurations = Object.fromEntries(modes.map((mode) => [mode.value, mode.duration]));

const controlDefinitions = {
  duration: { key: "duration", label: "Cycle", type: "range", min: 4, max: 80, step: 1, default: 12, unit: "s" },
  motionSpeed: { key: "motionSpeed", label: "Motion speed", type: "range", min: 0.35, max: 4.5, step: 0.01, default: 1.65 },
  motionEnergy: { key: "motionEnergy", label: "Motion energy", type: "range", min: 0.25, max: 3.2, step: 0.01, default: 1.58 },
  effectSize: { key: "effectSize", label: "Colour field size", type: "range", min: 0.35, max: 1.35, step: 0.01, default: 0.62 },
  revealStrength: { key: "revealStrength", label: "Reveal strength", type: "range", min: 0, max: 1.65, step: 0.01, default: 1.12 },
  revealWindow: { key: "revealWindow", label: "Reveal window", type: "range", min: 0.05, max: 0.5, step: 0.01, default: 0.28 },
  revealPhase: { key: "revealPhase", label: "Reveal phase", type: "range", min: 0, max: 140, step: 0.25, default: 0, unit: "s" },
  pulseIntensity: { key: "pulseIntensity", label: "Pulse rise", type: "range", min: 0, max: 1.4, step: 0.01, default: 0.5 },
  rest: { key: "rest", label: "Red rest", type: "range", min: 0, max: 95, step: 1, default: 34, unit: "%" },
  phase: { key: "phase", label: "Phase offset", type: "range", min: 0, max: 140, step: 0.25, default: 0, unit: "s" },
  warmWindow: { key: "warmWindow", label: "Warm window", type: "range", min: 0.08, max: 1.35, step: 0.01, default: 0.56 },
  orangeIntensity: { key: "orangeIntensity", label: "Orange bloom", type: "range", min: 0, max: 1.7, step: 0.01, default: 1.02 },
  redDominance: { key: "redDominance", label: "Red coverage", type: "range", min: 0.2, max: 1.3, step: 0.01, default: 1.12 },
  deepStrength: { key: "deepStrength", label: "Deep pressure", type: "range", min: 0, max: 1.35, step: 0.01, default: 1.08 },
  brightness: { key: "brightness", label: "Brightness", type: "range", min: 0.55, max: 1.55, step: 0.01, default: 1.04 },
  saturation: { key: "saturation", label: "Saturation", type: "range", min: 0.45, max: 1.85, step: 0.01, default: 1.24 },
  p3: { key: "p3", label: "P3 colour", type: "checkbox", default: false },
  driftDistance: { key: "driftDistance", label: "Drift radius", type: "range", min: 0, max: 70, step: 1, default: 17, unit: "%" },
  bloomX: { key: "bloomX", label: "Bloom X", type: "range", min: -60, max: 160, step: 1, default: 82, unit: "%" },
  bloomY: { key: "bloomY", label: "Bloom Y", type: "range", min: -60, max: 160, step: 1, default: 12, unit: "%" },
  scale: { key: "scale", label: "Field scale", type: "range", min: 0.45, max: 2.8, step: 0.01, default: 0.94 },
  softness: { key: "softness", label: "Soft falloff", type: "range", min: 8, max: 180, step: 1, default: 42, unit: "%" },
  fieldSpread: { key: "fieldSpread", label: "Field size", type: "range", min: 0.35, max: 2.2, step: 0.01, default: 0.86 },
  meshTension: { key: "meshTension", label: "Field bend", type: "range", min: 0, max: 1.5, step: 0.01, default: 0.56 },
  meshBlur: { key: "meshBlur", label: "Cloud blur", type: "range", min: 8, max: 180, step: 1, default: 64, unit: "px" },
  deepDrift: { key: "deepDrift", label: "Deep drift", type: "range", min: 0, max: 90, step: 1, default: 26, unit: "%" },
  surfaceBlend: { key: "surfaceBlend", label: "Field blend", type: "range", min: 0.35, max: 1.55, step: 0.01, default: 1.16 },
  shaderSpeed: { key: "shaderSpeed", label: "Shader speed", type: "range", min: 0.1, max: 3, step: 0.01, default: 0.92 },
  turbulence: { key: "turbulence", label: "Turbulence", type: "range", min: 0, max: 2.4, step: 0.01, default: 1.08 },
  warpStrength: { key: "warpStrength", label: "Warp strength", type: "range", min: 0, max: 2.6, step: 0.01, default: 1.16 },
  colorCloseness: { key: "colorCloseness", label: "Colour closeness", type: "range", min: 0.35, max: 1.9, step: 0.01, default: 0.82 },
  warmEvent: { key: "warmEvent", label: "Warm event", type: "range", min: 0, max: 1.8, step: 0.01, default: 0.82 },
  deepPull: { key: "deepPull", label: "Deep pull", type: "range", min: 0, max: 1.8, step: 0.01, default: 1.34 },
  shaderBlur: { key: "shaderBlur", label: "Shader blur", type: "range", min: 0, max: 24, step: 1, default: 10, unit: "px" },
  renderScale: { key: "renderScale", label: "Render scale", type: "range", min: 0.35, max: 1, step: 0.01, default: 0.65 },
  "surfaces.all": { key: "surfaces.all", label: "All surfaces", type: "checkbox", default: true },
  "surfaces.logo": { key: "surfaces.logo", label: "Logo", type: "checkbox", default: true },
  "surfaces.button": { key: "surfaces.button", label: "Button", type: "checkbox", default: true },
  "surfaces.card": { key: "surfaces.card", label: "Card", type: "checkbox", default: true },
  "surfaces.background": { key: "surfaces.background", label: "Background", type: "checkbox", default: true },
  reducedMotion: { key: "reducedMotion", label: "Reduced motion", type: "checkbox", default: false },
  contrastSafe: { key: "contrastSafe", label: "Contrast safe", type: "checkbox", default: false },
  paused: { key: "paused", label: "Paused", type: "checkbox", default: false },
};

const sharedControlGroups = [
  {
    id: "motion-system",
    title: "Motion System",
    open: true,
    keys: ["motionSpeed", "motionEnergy", "effectSize"],
  },
  {
    id: "surfaces",
    title: "Surfaces",
    open: false,
    keys: ["surfaces.all", "surfaces.logo", "surfaces.button", "surfaces.card", "surfaces.background"],
  },
  {
    id: "accessibility",
    title: "Motion & Contrast",
    open: false,
    keys: ["reducedMotion", "contrastSafe", "paused"],
  },
];

const controls = Object.values(controlDefinitions);
const controlByKey = new Map(controls.map((control) => [control.key, control]));
const defaultState = createDefaultState();

let state = normalizeState(loadSavedState());
let isRendering = false;
const shaderRuntime = {
  items: new Map(),
  raf: 0,
  origin: performance.now(),
  webglAvailable: null,
};

const formatters = {
  duration: (value) => `${Math.round(value)}s`,
  motionSpeed: (value) => `${value.toFixed(2)}x`,
  motionEnergy: (value) => `${value.toFixed(2)}x`,
  effectSize: (value) => value.toFixed(2),
  revealStrength: (value) => value.toFixed(2),
  revealWindow: (value) => value.toFixed(2),
  revealPhase: (value) => `${Number(value).toFixed(value % 1 === 0 ? 0 : 2)}s`,
  pulseIntensity: (value) => value.toFixed(2),
  rest: (value) => `${Math.round(value)}%`,
  phase: (value) => `${Number(value).toFixed(value % 1 === 0 ? 0 : 2)}s`,
  warmWindow: (value) => value.toFixed(2),
  orangeIntensity: (value) => value.toFixed(2),
  redDominance: (value) => value.toFixed(2),
  deepStrength: (value) => value.toFixed(2),
  brightness: (value) => value.toFixed(2),
  saturation: (value) => value.toFixed(2),
  driftDistance: (value) => `${Math.round(value)}%`,
  bloomX: (value) => `${Math.round(value)}%`,
  bloomY: (value) => `${Math.round(value)}%`,
  scale: (value) => value.toFixed(2),
  softness: (value) => `${Math.round(value)}%`,
  fieldSpread: (value) => value.toFixed(2),
  meshTension: (value) => value.toFixed(2),
  meshBlur: (value) => `${Math.round(value)}px`,
  deepDrift: (value) => `${Math.round(value)}%`,
  surfaceBlend: (value) => value.toFixed(2),
  shaderSpeed: (value) => `${value.toFixed(2)}x`,
  turbulence: (value) => value.toFixed(2),
  warpStrength: (value) => value.toFixed(2),
  colorCloseness: (value) => value.toFixed(2),
  warmEvent: (value) => value.toFixed(2),
  deepPull: (value) => value.toFixed(2),
  shaderBlur: (value) => `${Math.round(value)}px`,
  renderScale: (value) => value.toFixed(2),
};

function createDefaultState() {
  const next = { mode: "breath" };

  controls.forEach((control) => {
    setNestedValue(next, control.key, control.default);
  });

  return next;
}

function renderPanel() {
  const activeMode = getActiveMode();
  const activeControlGroups = getActiveControlSchema(activeMode);

  controlsRoot.innerHTML = `${renderModeOverview(activeMode)}${activeControlGroups.map((group) => {
    const rows = group.controls.map(renderControl).join("");
    return `<details class="parameterizer-folder" ${group.open ? "open" : ""}>
      <summary class="parameterizer-folder-title">${group.title}</summary>
      <div class="parameterizer-folder-body">${rows}</div>
    </details>`;
  }).join("")}`;

  bindControls();
}

function getActiveMode() {
  return modes.find((mode) => mode.value === state.mode) ?? modes[0];
}

function getActiveControlSchema(activeMode) {
  const trimControls = activeMode.trimKeys
    .filter((key) => !activeMode.parameterKeys.includes(key))
    .map((key) => controlDefinitions[key]);
  const mappedSharedGroups = sharedControlGroups.map((group) => ({
    ...group,
    controls: group.keys.map((key) => controlDefinitions[key]),
  }));

  return [
    mappedSharedGroups[0],
    {
      id: `${activeMode.value}-parameters`,
      title: activeMode.parameterTitle,
      open: true,
      controls: activeMode.parameterKeys.map((key) => controlDefinitions[key]),
    },
    {
      id: `${activeMode.value}-trim`,
      title: "Colour Trim",
      open: true,
      controls: trimControls,
    },
    ...mappedSharedGroups.slice(1),
  ];
}

function renderModeOverview(activeMode) {
  const cards = modes.map((mode) => {
    const active = mode.value === activeMode.value;
    return `<button class="effect-card${active ? " is-active" : ""}" type="button" data-mode-card="${mode.value}" aria-pressed="${active}">
      <span class="effect-card-kicker">${mode.family}</span>
      <strong>${mode.label}</strong>
      <span class="effect-card-summary">${mode.summary}</span>
      <span class="effect-card-meta">${mode.duration}s · ${mode.accent}</span>
    </button>`;
  }).join("");

  return `<section class="effect-overview" aria-label="Effect overview">
    <div class="effect-overview-title">Effects</div>
    <div class="effect-card-grid">${cards}</div>
  </section>`;
}

function renderControl(control) {
  const id = `control-${control.key.replaceAll(".", "-")}`;
  const value = getStateValue(control.key);

  if (control.type === "checkbox") {
    return `<label class="parameterizer-row parameterizer-row-checkbox" for="${id}">
      <span class="parameterizer-label" title="${control.label}">${control.label}</span>
      <input class="parameterizer-control parameterizer-check" id="${id}" type="checkbox" data-control-key="${control.key}" ${value ? "checked" : ""}>
      <span class="parameterizer-value" data-value-for="${control.key}">${value ? "On" : "Off"}</span>
    </label>`;
  }

  return `<label class="parameterizer-row" for="${id}">
    <span class="parameterizer-label" title="${control.label}">${control.label}</span>
    <input class="parameterizer-control parameterizer-range" id="${id}" type="range" min="${control.min}" max="${control.max}" step="${control.step}" value="${value}" data-control-key="${control.key}">
    <output class="parameterizer-value" data-value-for="${control.key}">${formatValue(control.key, value)}</output>
  </label>`;
}

function bindControls() {
  controlsRoot.querySelectorAll("[data-mode-card]").forEach((card) => {
    card.addEventListener("click", (event) => {
      const nextMode = event.currentTarget.dataset.modeCard;
      if (nextMode === state.mode) return;

      state.mode = nextMode;
      state.duration = modeDurations[nextMode] ?? state.duration;
      renderPanel();
      render();
    });
  });

  controlsRoot.querySelectorAll("[data-control-key]").forEach((control) => {
    const eventName = control.matches("input[type='checkbox']") ? "change" : "input";
    control.addEventListener(eventName, (event) => {
      const key = event.currentTarget.dataset.controlKey;
      const definition = controlByKey.get(key);
      let value = event.currentTarget.value;

      if (definition.type === "range") value = Number(value);
      if (definition.type === "checkbox") value = event.currentTarget.checked;

      setStateValue(key, value);

      if (key === "surfaces.all") {
        syncSurfaceDisabledState();
      }

      render();
    });
  });
}

function syncControlValues() {
  isRendering = true;

  controlsRoot.querySelectorAll("[data-control-key]").forEach((control) => {
    const key = control.dataset.controlKey;
    const value = getStateValue(key);

    if (control.type === "checkbox") {
      control.checked = Boolean(value);
    } else {
      control.value = value;
    }
  });

  controlsRoot.querySelectorAll("[data-value-for]").forEach((output) => {
    const key = output.dataset.valueFor;
    const value = getStateValue(key);
    output.textContent = formatValue(key, value);
  });

  controlsRoot.querySelectorAll("[data-mode-card]").forEach((card) => {
    const isActive = card.dataset.modeCard === state.mode;
    card.classList.toggle("is-active", isActive);
    card.setAttribute("aria-pressed", String(isActive));
  });

  syncSurfaceDisabledState();
  isRendering = false;
}

function getStateValue(key) {
  if (!key.includes(".")) return state[key];

  const [root, child] = key.split(".");
  return state[root]?.[child];
}

function setStateValue(key, value) {
  if (!key.includes(".")) {
    state[key] = value;
    return;
  }

  const [root, child] = key.split(".");
  state[root][child] = value;
}

function setProperty(name, value) {
  prototype.style.setProperty(name, value);
}

function updateDerivedVariables() {
  const restFactor = clamp(1 - state.rest / 145, 0.38, 1);
  const duration = clamp(state.duration / state.motionSpeed, 2.5, 180);
  const motionEnergy = state.motionEnergy;
  const sizeFactor = state.effectSize;
  const orangePeak = clamp((0.2 + state.orangeIntensity * (0.72 + state.pulseIntensity * 0.84)) * state.warmWindow, 0, 0.88);
  const warmPeak = clamp(orangePeak * state.surfaceBlend, 0, 0.82);
  const warmPeakSoft = clamp(warmPeak * 0.84, 0, 0.68);
  const warmAmbient = clamp(state.orangeIntensity * 0.048 * restFactor, 0, 0.08);
  const warmRevealOpacity = clamp(warmPeak + state.revealStrength * 0.38, 0, 1);
  const warmRevealShoulder = clamp(warmAmbient + warmRevealOpacity * state.revealWindow * 1.28, warmAmbient, 0.72);
  const redFieldOpacity = clamp((0.66 + state.redDominance * 0.24) * state.surfaceBlend, 0.58, 0.94);
  const redAltOpacity = clamp((0.26 + state.redDominance * 0.34) * state.surfaceBlend, 0.22, 0.78);
  const deepAlpha = clamp((0.42 + state.deepStrength * 0.72) * state.surfaceBlend, 0.32, 1);
  const deepAlphaSoft = clamp(deepAlpha * 0.82, 0.22, 0.9);
  const deepRevealOpacity = clamp(deepAlpha + state.revealStrength * 0.2, 0.34, 1);
  const deepRevealShoulder = clamp(deepAlphaSoft + state.revealWindow * 0.32, 0.2, 0.92);
  const blur = Math.round(clamp(state.softness * 0.54 * clamp(0.72 + sizeFactor * 0.24, 0.74, 1.08), 6, 96));
  const fieldSize = Math.round(clamp((112 + state.fieldSpread * 44) * sizeFactor, 82, 220));
  const fieldScale = clamp((0.96 + state.scale * 0.24) * clamp(0.88 + sizeFactor * 0.12, 0.9, 1.04), 0.92, 1.58);
  const deepFieldScale = clamp(fieldScale + state.deepStrength * 0.18, 1.18, 1.94);
  const driftX = Math.round(state.driftDistance * motionEnergy);
  const driftY = Math.round(state.driftDistance * -0.72);
  const driftYEnergy = Math.round(driftY * motionEnergy);
  const meshScale = clamp(1.1 + state.meshTension * 0.34 + (motionEnergy - 1) * 0.08, 1.04, 1.58);
  const meshTilt = Math.round((-14 + state.meshTension * 34) * clamp(motionEnergy, 0.55, 1.9));
  setProperty("--lg-duration", `${duration.toFixed(2)}s`);
  setProperty("--lg-authored-duration", `${state.duration}s`);
  setProperty("--lg-motion-speed", state.motionSpeed.toFixed(2));
  setProperty("--lg-motion-energy", state.motionEnergy.toFixed(2));
  setProperty("--lg-effect-size", state.effectSize.toFixed(2));
  setProperty("--lg-orange-intensity", state.orangeIntensity.toFixed(2));
  setProperty("--lg-red-dominance", state.redDominance.toFixed(2));
  setProperty("--lg-deep-strength", state.deepStrength.toFixed(2));
  setProperty("--lg-brightness", state.brightness.toFixed(2));
  setProperty("--lg-saturation", state.saturation.toFixed(2));
  setProperty("--lg-drift-distance", state.driftDistance.toString());
  setProperty("--lg-bloom-x", `${state.bloomX}%`);
  setProperty("--lg-bloom-y", `${state.bloomY}%`);
  setProperty("--lg-scale", state.scale.toFixed(2));
  setProperty("--lg-softness", state.softness.toString());
  setProperty("--lg-rest", (state.rest / 100).toFixed(2));
  setProperty("--lg-phase", `${state.phase}s`);
  setProperty("--lg-reveal-strength", state.revealStrength.toFixed(2));
  setProperty("--lg-reveal-window", state.revealWindow.toFixed(2));
  setProperty("--lg-reveal-phase", `${state.revealPhase}s`);
  setProperty("--lg-warm-window", state.warmWindow.toFixed(2));
  setProperty("--lg-field-spread", state.fieldSpread.toFixed(2));
  setProperty("--lg-field-size", `${fieldSize}%`);
  setProperty("--lg-mesh-tension", state.meshTension.toFixed(2));
  setProperty("--lg-mesh-blur", `${state.meshBlur}px`);
  setProperty("--lg-deep-drift", `${state.deepDrift}%`);
  setProperty("--lg-surface-blend", state.surfaceBlend.toFixed(2));
  setProperty("--lg-orange-alpha", warmPeak.toFixed(3));
  setProperty("--lg-orange-alpha-soft", warmPeakSoft.toFixed(3));
  setProperty("--lg-pulse-alpha", warmPeak.toFixed(3));
  setProperty("--lg-pulse-alpha-soft", warmPeakSoft.toFixed(3));
  setProperty("--lg-deep-alpha", deepAlpha.toFixed(3));
  setProperty("--lg-blur", `${blur}px`);
  setProperty("--lg-field-blur", `${blur}px`);
  setProperty("--lg-field-scale", fieldScale.toFixed(2));
  setProperty("--lg-field-scale-deep", deepFieldScale.toFixed(2));
  setProperty("--lg-red-field-opacity", redFieldOpacity.toFixed(3));
  setProperty("--lg-red-alt-opacity", redAltOpacity.toFixed(3));
  setProperty("--lg-warm-peak", warmPeak.toFixed(3));
  setProperty("--lg-warm-peak-soft", warmPeakSoft.toFixed(3));
  setProperty("--lg-warm-ambient", warmAmbient.toFixed(3));
  setProperty("--lg-warm-reveal-opacity", warmRevealOpacity.toFixed(3));
  setProperty("--lg-warm-reveal-shoulder", warmRevealShoulder.toFixed(3));
  setProperty("--lg-deep-field-opacity", deepAlpha.toFixed(3));
  setProperty("--lg-deep-field-opacity-soft", deepAlphaSoft.toFixed(3));
  setProperty("--lg-deep-reveal-opacity", deepRevealOpacity.toFixed(3));
  setProperty("--lg-deep-reveal-shoulder", deepRevealShoulder.toFixed(3));
  setProperty("--lg-drift-x", `${driftX}%`);
  setProperty("--lg-drift-y", `${driftYEnergy}%`);
  setProperty("--lg-drift-x-neg", `${driftX * -1}%`);
  setProperty("--lg-drift-y-neg", `${driftYEnergy * -1}%`);
  setProperty("--lg-mesh-scale", meshScale.toFixed(2));
  setProperty("--lg-mesh-tilt", `${meshTilt}deg`);
  setProperty("--lg-shader-speed", state.shaderSpeed.toFixed(2));
  setProperty("--lg-shader-turbulence", state.turbulence.toFixed(2));
  setProperty("--lg-shader-warp", state.warpStrength.toFixed(2));
  setProperty("--lg-color-closeness", state.colorCloseness.toFixed(2));
  setProperty("--lg-warm-event", state.warmEvent.toFixed(2));
  setProperty("--lg-deep-pull", state.deepPull.toFixed(2));
  setProperty("--lg-shader-blur", `${state.shaderBlur}px`);
  setProperty("--lg-render-scale", state.renderScale.toFixed(2));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatValue(key, value) {
  return formatters[key] ? formatters[key](Number(value)) : String(value);
}

function applyMode(mode) {
  const activeMode = shaderModes.has(mode) && !canUseWebGL() ? "cloudmesh" : mode;
  state.mode = mode;
  prototype.dataset.mode = activeMode;
  modeReadout.textContent = activeMode === mode ? modeLabels[mode] : `${modeLabels[mode]} unavailable`;
  gradients.forEach((surface) => {
    surface.dataset.mode = activeMode;
  });
  ensureGradientFields(activeMode);
}

function ensureGradientFields(mode = state.mode) {
  const fields = modeFields[mode] ?? baseFields;
  const fieldSet = fields.join(" ");
  const template = fields.map((field) => fieldMarkup[field]).join("");

  gradients.forEach((surface) => {
    if (surface.dataset.fieldSet === fieldSet) return;
    surface.querySelectorAll(".lg-field").forEach((field) => field.remove());
    surface.insertAdjacentHTML("afterbegin", template);
    surface.dataset.fieldSet = fieldSet;
  });

  prototype.classList.add("is-fields-ready");
}

function applyFlags() {
  prototype.dataset.p3 = String(state.p3);
  prototype.classList.toggle("is-reduced-motion", state.reducedMotion);
  prototype.classList.toggle("is-contrast-safe", state.contrastSafe);
  prototype.classList.toggle("is-paused", state.paused);
}

function applySurfaceToggles() {
  const globalEnabled = state.surfaces.all;
  gradients.forEach((surface) => {
    const surfaceName = surface.dataset.surface;
    const enabled = Boolean(globalEnabled && state.surfaces[surfaceName]);
    surface.classList.toggle("is-surface-off", !enabled);
  });
}

function syncSurfaceDisabledState() {
  controlsRoot.querySelectorAll('[data-control-key^="surfaces."]:not([data-control-key="surfaces.all"])').forEach((toggle) => {
    toggle.disabled = !state.surfaces.all;
  });
}

function canUseWebGL() {
  if (shaderRuntime.webglAvailable !== null) return shaderRuntime.webglAvailable;

  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  shaderRuntime.webglAvailable = Boolean(gl);
  return shaderRuntime.webglAvailable;
}

function updateShaderRuntime() {
  const active = shaderModes.has(state.mode) && canUseWebGL() && !state.reducedMotion;
  const globalEnabled = state.surfaces.all;

  gradients.forEach((surface) => {
    const surfaceName = surface.dataset.surface;
    const enabled = active && globalEnabled && state.surfaces[surfaceName];
    surface.classList.toggle("has-shader", enabled);

    if (enabled) {
      ensureShaderSurface(surface);
      return;
    }

    destroyShaderSurface(surface);
  });

  drawShadersOnce();
  syncShaderLoop();
}

function ensureShaderSurface(surface) {
  if (shaderRuntime.items.has(surface)) return;

  const canvas = document.createElement("canvas");
  canvas.className = "lg-shader-canvas";
  canvas.setAttribute("aria-hidden", "true");
  surface.insertAdjacentElement("afterbegin", canvas);

  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: "low-power",
  });

  if (!gl) {
    canvas.remove();
    shaderRuntime.webglAvailable = false;
    return;
  }

  const program = createShaderProgram(gl);
  if (!program) {
    canvas.remove();
    shaderRuntime.webglAvailable = false;
    return;
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    -1, 1,
    1, -1,
    1, 1,
  ]), gl.STATIC_DRAW);

  shaderRuntime.items.set(surface, {
    canvas,
    gl,
    program,
    buffer,
    attribs: {
      position: gl.getAttribLocation(program, "a_position"),
    },
    uniforms: {
      resolution: gl.getUniformLocation(program, "u_resolution"),
      time: gl.getUniformLocation(program, "u_time"),
      mode: gl.getUniformLocation(program, "u_mode"),
      speed: gl.getUniformLocation(program, "u_speed"),
      turbulence: gl.getUniformLocation(program, "u_turbulence"),
      warp: gl.getUniformLocation(program, "u_warp"),
      closeness: gl.getUniformLocation(program, "u_closeness"),
      warm: gl.getUniformLocation(program, "u_warm"),
      deep: gl.getUniformLocation(program, "u_deep"),
      reveal: gl.getUniformLocation(program, "u_reveal"),
      energy: gl.getUniformLocation(program, "u_energy"),
      size: gl.getUniformLocation(program, "u_size"),
      surface: gl.getUniformLocation(program, "u_surface"),
    },
  });
}

function destroyShaderSurface(surface) {
  const item = shaderRuntime.items.get(surface);
  if (!item) return;

  item.canvas.remove();
  shaderRuntime.items.delete(surface);
}

const shaderFragmentSource = `
  precision mediump float;

  varying vec2 v_uv;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform int u_mode;
  uniform float u_speed;
  uniform float u_turbulence;
  uniform float u_warp;
  uniform float u_closeness;
  uniform float u_warm;
  uniform float u_deep;
  uniform float u_reveal;
  uniform float u_energy;
  uniform float u_size;
  uniform float u_surface;

  const vec3 AHA_ORANGE = vec3(0.941, 0.424, 0.137);
  const vec3 AHA_RED = vec3(0.886, 0.0, 0.118);
  const vec3 AHA_DEEP = vec3(0.533, 0.067, 0.071);

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p *= 2.02;
      amplitude *= 0.52;
    }
    return value;
  }

  float softEvent(float t) {
    float phase = fract(t * 0.075);
    float up = smoothstep(0.30, 0.48, phase);
    float down = 1.0 - smoothstep(0.58, 0.82, phase);
    return up * down;
  }

  float gaussian(vec2 uv, vec2 center, float radius) {
    vec2 diff = uv - center;
    return exp(-dot(diff, diff) / max(radius, 0.001));
  }

  vec3 rampColour(float value, float warmMask, float deepMask) {
    float redBand = smoothstep(0.08, 0.72, value);
    vec3 color = mix(AHA_DEEP, AHA_RED, redBand);
    color = mix(color, AHA_ORANGE, clamp(warmMask, 0.0, 1.0));
    color = mix(color, AHA_DEEP, clamp(deepMask, 0.0, 1.0));
    return color;
  }

  vec3 shaderFlow(vec2 uv, float t) {
    float aspect = u_resolution.x / max(u_resolution.y, 1.0);
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    float scale = mix(1.7, 3.8, clamp(u_closeness, 0.0, 1.9) / 1.9);
    vec2 q = p * scale;
    float drift = t * 0.045 * u_speed;
    vec2 warpA = vec2(fbm(q + vec2(drift, -drift * 0.7)), fbm(q + vec2(4.2 - drift * 0.6, 2.1 + drift)));
    q += (warpA - 0.5) * 0.72 * u_warp * u_turbulence;
    float grain = fbm(q + vec2(t * 0.028, -t * 0.018));
    float diagonal = uv.x * 0.52 + (1.0 - uv.y) * 0.62;
    float value = diagonal + (grain - 0.5) * 0.32 * u_turbulence;
    float reveal = softEvent(t * u_speed + u_reveal * 0.15) * u_warm * u_surface;
    float warmMask = smoothstep(0.72 - u_closeness * 0.04, 0.98, value + reveal * 0.12) * reveal * 0.78;
    float deepBase = smoothstep(0.52, 0.02, value - u_deep * 0.12);
    float bottomPull = max(
      smoothstep(0.42, 0.98, uv.y) * smoothstep(0.7, 0.0, uv.x),
      smoothstep(0.42, 0.98, 1.0 - uv.y) * smoothstep(0.7, 0.0, uv.x)
    );
    float deepMask = clamp(deepBase * (0.5 + u_deep * 0.32) + bottomPull * u_deep * 0.5, 0.0, 0.96);
    vec3 color = rampColour(value, warmMask, deepMask);
    float redLift = smoothstep(0.28, 0.82, grain) * 0.06;
    return color + vec3(redLift, 0.0, 0.0);
  }

  vec3 softPlasma(vec2 uv, float t) {
    float aspect = u_resolution.x / max(u_resolution.y, 1.0);
    vec2 p = vec2((uv.x - 0.5) * aspect + 0.5, uv.y);
    float s = 0.36 + (1.0 - clamp(u_size, 0.0, 1.0)) * 0.18;
    float t1 = t * 0.13 * u_speed;
    float warm = 0.0;
    warm += gaussian(p, vec2(0.72 + 0.22 * sin(t1), 0.16 + 0.18 * cos(t1 * 0.7)), s * 0.62);
    warm += gaussian(p, vec2(0.44 + 0.26 * cos(t1 * 0.8), 0.42 + 0.2 * sin(t1 * 1.1)), s * 0.54);
    float deep = 0.0;
    deep += gaussian(p, vec2(0.12 + 0.2 * sin(t1 * 0.64), 0.88 + 0.18 * cos(t1 * 0.84)), s * 0.88);
    deep += gaussian(p, vec2(0.48 + 0.14 * cos(t1 * 0.52), 0.76 + 0.18 * sin(t1 * 0.48)), s * 0.76);
    float red = gaussian(p, vec2(0.34 + 0.18 * sin(t1 * 0.9), 0.32 + 0.16 * cos(t1 * 0.6)), s * 1.0);
    float event = softEvent(t * u_speed + 0.18) * u_warm * u_surface;
    float texture = fbm((p + vec2(t * 0.016, -t * 0.012)) * (2.2 + u_turbulence));
    float value = clamp(0.42 + red * 0.28 + texture * 0.16 - deep * 0.22 * u_deep, 0.0, 1.0);
    float warmMask = smoothstep(0.22, 0.92, warm + texture * 0.16) * event * 0.86;
    float bottomPull = max(
      smoothstep(0.46, 1.0, uv.y) * smoothstep(0.74, 0.0, uv.x),
      smoothstep(0.46, 1.0, 1.0 - uv.y) * smoothstep(0.74, 0.0, uv.x)
    );
    float deepMask = clamp(smoothstep(0.16, 0.72, deep) * (0.54 + u_deep * 0.38) + bottomPull * u_deep * 0.5, 0.0, 0.96);
    return rampColour(value, warmMask, deepMask);
  }

  void main() {
    vec2 uv = v_uv;
    float t = u_time;
    vec3 color = u_mode == 1 ? softPlasma(uv, t) : shaderFlow(uv, t);
    color = pow(color, vec3(0.96));
    gl_FragColor = vec4(color, 1.0);
  }
`;

function createShaderProgram(gl) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, `
    attribute vec2 a_position;
    varying vec2 v_uv;

    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, shaderFragmentSource);

  if (!vertex || !fragment) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return null;
  }

  return program;
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return null;
  }

  return shader;
}

function drawShadersOnce(now = performance.now()) {
  shaderRuntime.items.forEach((item, surface) => drawShaderItem(item, surface, now));
}

function drawShaderItem(item, surface, now) {
  const rect = surface.getBoundingClientRect();
  const renderScale = clamp(state.renderScale, 0.35, 1);
  const dpr = Math.min(window.devicePixelRatio || 1, 1);
  const width = Math.max(1, Math.round(rect.width * renderScale * dpr));
  const height = Math.max(1, Math.round(rect.height * renderScale * dpr));

  if (item.canvas.width !== width || item.canvas.height !== height) {
    item.canvas.width = width;
    item.canvas.height = height;
  }

  const gl = item.gl;
  gl.viewport(0, 0, width, height);
  gl.useProgram(item.program);
  gl.bindBuffer(gl.ARRAY_BUFFER, item.buffer);
  gl.enableVertexAttribArray(item.attribs.position);
  gl.vertexAttribPointer(item.attribs.position, 2, gl.FLOAT, false, 0, 0);

  gl.uniform2f(item.uniforms.resolution, width, height);
  gl.uniform1f(item.uniforms.time, (now - shaderRuntime.origin) / 1000);
  gl.uniform1i(item.uniforms.mode, state.mode === "softplasma" ? 1 : 0);
  gl.uniform1f(item.uniforms.speed, state.shaderSpeed);
  gl.uniform1f(item.uniforms.turbulence, state.turbulence);
  gl.uniform1f(item.uniforms.warp, state.warpStrength);
  gl.uniform1f(item.uniforms.closeness, state.colorCloseness);
  gl.uniform1f(item.uniforms.warm, state.warmEvent * state.orangeIntensity);
  gl.uniform1f(item.uniforms.deep, state.deepPull * state.deepStrength);
  gl.uniform1f(item.uniforms.reveal, state.revealStrength);
  gl.uniform1f(item.uniforms.energy, state.motionEnergy);
  gl.uniform1f(item.uniforms.size, state.effectSize);
  gl.uniform1f(item.uniforms.surface, surfaceWeight(surface.dataset.surface));
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function surfaceWeight(surfaceName) {
  if (surfaceName === "button") return 0.72;
  if (surfaceName === "card") return 0.86;
  if (surfaceName === "logo") return 1.08;
  return 1;
}

function syncShaderLoop() {
  const shouldRun = shaderRuntime.items.size > 0 && !state.paused && !state.reducedMotion && !document.hidden;

  if (!shouldRun) {
    if (shaderRuntime.raf) cancelAnimationFrame(shaderRuntime.raf);
    shaderRuntime.raf = 0;
    return;
  }

  if (shaderRuntime.raf) return;

  const tick = (now) => {
    shaderRuntime.raf = 0;
    drawShadersOnce(now);
    syncShaderLoop();
  };

  shaderRuntime.raf = requestAnimationFrame(tick);
}

function buildCssExport() {
  const computed = getComputedStyle(prototype);
  const cssVar = (name) => computed.getPropertyValue(name).trim();
  const derivedProperties = [
    "--lg-orange-alpha",
    "--lg-orange-alpha-soft",
    "--lg-pulse-alpha",
    "--lg-pulse-alpha-soft",
    "--lg-deep-alpha",
    "--lg-blur",
    "--lg-field-blur",
    "--lg-field-size",
    "--lg-field-scale",
    "--lg-field-scale-deep",
    "--lg-red-field-opacity",
    "--lg-red-alt-opacity",
    "--lg-warm-peak",
    "--lg-warm-peak-soft",
    "--lg-warm-ambient",
    "--lg-warm-reveal-opacity",
    "--lg-warm-reveal-shoulder",
    "--lg-deep-field-opacity",
    "--lg-deep-field-opacity-soft",
    "--lg-deep-reveal-opacity",
    "--lg-deep-reveal-shoulder",
    "--lg-drift-x",
    "--lg-drift-y",
    "--lg-drift-x-neg",
    "--lg-drift-y-neg",
    "--lg-mesh-scale",
    "--lg-mesh-tilt",
    "--lg-shader-speed",
    "--lg-shader-turbulence",
    "--lg-shader-warp",
    "--lg-color-closeness",
    "--lg-warm-event",
    "--lg-deep-pull",
    "--lg-shader-blur",
    "--lg-render-scale",
  ];
  const derivedCss = derivedProperties.map((name) => `  ${name}: ${cssVar(name)};`).join("\n");
  const shaderNote = shaderModes.has(state.mode) ? "/* Shader modes require the included JS WebGL renderer. */\n" : "";

  return `${shaderNote}.living-gradient[data-mode="${state.mode}"] {
  --lg-duration: ${cssVar("--lg-duration")};
  --lg-authored-duration: ${state.duration}s;
  --lg-motion-speed: ${state.motionSpeed.toFixed(2)};
  --lg-motion-energy: ${state.motionEnergy.toFixed(2)};
  --lg-effect-size: ${state.effectSize.toFixed(2)};
  --lg-orange-intensity: ${state.orangeIntensity.toFixed(2)};
  --lg-red-dominance: ${state.redDominance.toFixed(2)};
  --lg-deep-strength: ${state.deepStrength.toFixed(2)};
  --lg-brightness: ${state.brightness.toFixed(2)};
  --lg-saturation: ${state.saturation.toFixed(2)};
  --lg-drift-distance: ${state.driftDistance};
  --lg-bloom-x: ${state.bloomX}%;
  --lg-bloom-y: ${state.bloomY}%;
  --lg-scale: ${state.scale.toFixed(2)};
  --lg-softness: ${state.softness};
  --lg-rest: ${(state.rest / 100).toFixed(2)};
  --lg-phase: ${state.phase}s;
  --lg-reveal-strength: ${state.revealStrength.toFixed(2)};
  --lg-reveal-window: ${state.revealWindow.toFixed(2)};
  --lg-reveal-phase: ${state.revealPhase}s;
  --lg-warm-window: ${state.warmWindow.toFixed(2)};
  --lg-field-spread: ${state.fieldSpread.toFixed(2)};
  --lg-mesh-tension: ${state.meshTension.toFixed(2)};
  --lg-mesh-blur: ${state.meshBlur}px;
  --lg-deep-drift: ${state.deepDrift}%;
  --lg-surface-blend: ${state.surfaceBlend.toFixed(2)};
  --lg-shader-speed: ${state.shaderSpeed.toFixed(2)};
  --lg-shader-turbulence: ${state.turbulence.toFixed(2)};
  --lg-shader-warp: ${state.warpStrength.toFixed(2)};
  --lg-color-closeness: ${state.colorCloseness.toFixed(2)};
  --lg-warm-event: ${state.warmEvent.toFixed(2)};
  --lg-deep-pull: ${state.deepPull.toFixed(2)};
  --lg-shader-blur: ${state.shaderBlur}px;
  --lg-render-scale: ${state.renderScale.toFixed(2)};
${derivedCss}
}`;
}

function buildConfigExport() {
  return JSON.stringify({
    schema: "aha-living-gradient-playground/v15",
    updated: "2026-06-27",
    state,
  }, null, 2);
}

function render() {
  if (isRendering) return;

  state = normalizeState(state);
  updateDerivedVariables();
  applyMode(state.mode);
  applyFlags();
  applySurfaceToggles();
  updateShaderRuntime();
  syncControlValues();
  cssOutput.value = buildCssExport();
  persistState();
}

async function copyText(text, successMessage) {
  copyStatus.textContent = "Copying...";

  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error("Clipboard API unavailable");
    }

    await navigator.clipboard.writeText(text);
    copyStatus.textContent = successMessage;
  } catch {
    cssOutput.value = text;
    cssOutput.focus();
    cssOutput.select();
    const copied = document.execCommand("copy");
    copyStatus.textContent = copied ? successMessage : "Select the export field to copy manually.";
  }
}

function loadSavedState() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultState;
  } catch {
    return defaultState;
  }
}

function persistState() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    copyStatus.textContent = "Live values changed; browser storage is unavailable.";
  }
}

function normalizeState(candidate) {
  const next = structuredClone(defaultState);
  if (modes.some((mode) => mode.value === candidate?.mode)) {
    next.mode = candidate.mode;
  }

  controls.forEach((control) => {
    const value = readCandidateValue(candidate, control.key);
    if (value === undefined) return;

    if (control.type === "range") {
      setNestedValue(next, control.key, clamp(Number(value), control.min, control.max));
      return;
    }

    if (control.type === "checkbox") {
      setNestedValue(next, control.key, Boolean(value));
      return;
    }

  });

  return next;
}

function readCandidateValue(candidate, key) {
  if (!candidate) return undefined;
  if (!key.includes(".")) return candidate[key];

  const [root, child] = key.split(".");
  return candidate[root]?.[child];
}

function setNestedValue(target, key, value) {
  if (!key.includes(".")) {
    target[key] = value;
    return;
  }

  const [root, child] = key.split(".");
  if (!target[root]) target[root] = {};
  target[root][child] = value;
}

function resetConfig() {
  state = structuredClone(defaultState);
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage removal is a convenience; the in-memory reset still applies.
  }
  copyStatus.textContent = "Reset to authored defaults.";
  render();
}

function initReducedMotion() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (prefersReducedMotion.matches) {
    state.reducedMotion = true;
  }
}

copyCssButton.addEventListener("click", () => copyText(buildCssExport(), "Copied current CSS custom properties."));
copyConfigButton.addEventListener("click", () => {
  const config = buildConfigExport();
  cssOutput.value = config;
  copyText(config, "Copied the current parameter config.");
});
resetButton.addEventListener("click", resetConfig);
window.addEventListener("resize", () => {
  drawShadersOnce();
  syncShaderLoop();
});
document.addEventListener("visibilitychange", syncShaderLoop);

initReducedMotion();
ensureGradientFields();
renderPanel();
render();
