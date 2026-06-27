const STORAGE_KEY = "aha-living-gradient-playground:v14";

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
  undertow: baseFields,
  cloudmesh: [...baseFields, "lg-field-cloud-a", "lg-field-cloud-b", "lg-field-cloud-c", "lg-field-cloud-d"],
};

const modes = [
  {
    value: "breath",
    label: "Breath Field",
    family: "Expansion",
    accent: "warmth returns",
    summary: "A slow red inhale with orange briefly blooming off-axis.",
    duration: 16,
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
    duration: 22,
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
    duration: 14,
    parameterTitle: "Pulse Parameters",
    parameterKeys: ["duration", "revealStrength", "revealWindow", "revealPhase", "pulseIntensity", "rest", "warmWindow", "bloomX", "bloomY", "orangeIntensity", "deepStrength", "surfaceBlend", "softness"],
    trimKeys: ["brightness", "saturation", "redDominance", "phase", "p3"],
  },
  {
    value: "undertow",
    label: "Undertow",
    family: "Depth",
    accent: "deep pull",
    summary: "A calmer deep-red lift with faint warmth passing through.",
    duration: 30,
    parameterTitle: "Undertow Parameters",
    parameterKeys: ["duration", "revealStrength", "revealWindow", "revealPhase", "deepDrift", "deepStrength", "rest", "driftDistance", "softness", "surfaceBlend", "orangeIntensity", "warmWindow", "redDominance"],
    trimKeys: ["brightness", "saturation", "scale", "p3"],
  },
  {
    value: "cloudmesh",
    label: "Radial Cloud Mesh",
    family: "Cloud",
    accent: "radial drift",
    summary: "Slow cloud fields overlap like a blurred radial shader.",
    duration: 46,
    parameterTitle: "Cloud Parameters",
    parameterKeys: ["duration", "revealStrength", "revealWindow", "revealPhase", "meshBlur", "meshTension", "fieldSpread", "bloomX", "bloomY", "orangeIntensity", "deepStrength", "surfaceBlend", "driftDistance"],
    trimKeys: ["brightness", "saturation", "redDominance", "warmWindow", "phase", "p3"],
  },
];

const modeLabels = Object.fromEntries(modes.map((mode) => [mode.value, mode.label]));
const modeDurations = Object.fromEntries(modes.map((mode) => [mode.value, mode.duration]));

const controlDefinitions = {
  duration: { key: "duration", label: "Cycle", type: "range", min: 4, max: 140, step: 1, default: 16, unit: "s" },
  motionSpeed: { key: "motionSpeed", label: "Motion speed", type: "range", min: 0.35, max: 3.2, step: 0.01, default: 1.45 },
  motionEnergy: { key: "motionEnergy", label: "Motion energy", type: "range", min: 0.25, max: 2.4, step: 0.01, default: 1.35 },
  effectSize: { key: "effectSize", label: "Colour field size", type: "range", min: 0.45, max: 1.6, step: 0.01, default: 0.78 },
  revealStrength: { key: "revealStrength", label: "Reveal strength", type: "range", min: 0, max: 1.4, step: 0.01, default: 0.96 },
  revealWindow: { key: "revealWindow", label: "Reveal window", type: "range", min: 0.05, max: 0.5, step: 0.01, default: 0.28 },
  revealPhase: { key: "revealPhase", label: "Reveal phase", type: "range", min: 0, max: 140, step: 0.25, default: 0, unit: "s" },
  pulseIntensity: { key: "pulseIntensity", label: "Pulse rise", type: "range", min: 0, max: 1.4, step: 0.01, default: 0.5 },
  rest: { key: "rest", label: "Red rest", type: "range", min: 0, max: 95, step: 1, default: 34, unit: "%" },
  phase: { key: "phase", label: "Phase offset", type: "range", min: 0, max: 140, step: 0.25, default: 0, unit: "s" },
  warmWindow: { key: "warmWindow", label: "Warm window", type: "range", min: 0.08, max: 1.35, step: 0.01, default: 0.56 },
  orangeIntensity: { key: "orangeIntensity", label: "Orange bloom", type: "range", min: 0, max: 1.45, step: 0.01, default: 0.72 },
  redDominance: { key: "redDominance", label: "Red coverage", type: "range", min: 0.2, max: 1.3, step: 0.01, default: 1.12 },
  deepStrength: { key: "deepStrength", label: "Deep pressure", type: "range", min: 0, max: 1.35, step: 0.01, default: 1.08 },
  brightness: { key: "brightness", label: "Brightness", type: "range", min: 0.55, max: 1.55, step: 0.01, default: 1.04 },
  saturation: { key: "saturation", label: "Saturation", type: "range", min: 0.45, max: 1.85, step: 0.01, default: 1.24 },
  p3: { key: "p3", label: "P3 colour", type: "checkbox", default: false },
  driftDistance: { key: "driftDistance", label: "Drift radius", type: "range", min: 0, max: 70, step: 1, default: 17, unit: "%" },
  bloomX: { key: "bloomX", label: "Bloom X", type: "range", min: -60, max: 160, step: 1, default: 82, unit: "%" },
  bloomY: { key: "bloomY", label: "Bloom Y", type: "range", min: -60, max: 160, step: 1, default: 12, unit: "%" },
  scale: { key: "scale", label: "Field scale", type: "range", min: 0.45, max: 2.8, step: 0.01, default: 0.94 },
  softness: { key: "softness", label: "Soft falloff", type: "range", min: 8, max: 240, step: 1, default: 58, unit: "%" },
  fieldSpread: { key: "fieldSpread", label: "Field size", type: "range", min: 0.45, max: 3.2, step: 0.01, default: 1.08 },
  meshTension: { key: "meshTension", label: "Field bend", type: "range", min: 0, max: 1.5, step: 0.01, default: 0.56 },
  meshBlur: { key: "meshBlur", label: "Cloud blur", type: "range", min: 8, max: 260, step: 1, default: 92, unit: "px" },
  deepDrift: { key: "deepDrift", label: "Deep drift", type: "range", min: 0, max: 90, step: 1, default: 26, unit: "%" },
  surfaceBlend: { key: "surfaceBlend", label: "Field blend", type: "range", min: 0.35, max: 1.55, step: 0.01, default: 1.16 },
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
  const warmPeakSoft = clamp(warmPeak * 0.76, 0, 0.62);
  const warmAmbient = clamp(state.orangeIntensity * 0.048 * restFactor, 0, 0.08);
  const warmRevealOpacity = clamp(warmPeak + state.revealStrength * 0.3, 0, 0.98);
  const warmRevealShoulder = clamp(warmAmbient + warmRevealOpacity * state.revealWindow, warmAmbient, 0.56);
  const redFieldOpacity = clamp((0.76 + state.redDominance * 0.34) * state.surfaceBlend, 0.68, 1);
  const redAltOpacity = clamp((0.34 + state.redDominance * 0.42) * state.surfaceBlend, 0.28, 0.96);
  const deepAlpha = clamp((0.42 + state.deepStrength * 0.72) * state.surfaceBlend, 0.32, 1);
  const deepAlphaSoft = clamp(deepAlpha * 0.82, 0.22, 0.9);
  const deepRevealOpacity = clamp(deepAlpha + state.revealStrength * 0.2, 0.34, 1);
  const deepRevealShoulder = clamp(deepAlphaSoft + state.revealWindow * 0.26, 0.2, 0.92);
  const blur = Math.round(clamp(state.softness * 0.62 * clamp(0.72 + sizeFactor * 0.28, 0.78, 1.16), 8, 130));
  const fieldSize = Math.round(clamp((124 + state.fieldSpread * 46) * sizeFactor, 92, 260));
  const fieldScale = clamp((1.04 + state.scale * 0.31) * clamp(0.9 + sizeFactor * 0.1, 0.94, 1.08), 1.02, 1.86);
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
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatValue(key, value) {
  return formatters[key] ? formatters[key](Number(value)) : String(value);
}

function applyMode(mode) {
  state.mode = mode;
  prototype.dataset.mode = mode;
  modeReadout.textContent = modeLabels[mode];
  gradients.forEach((surface) => {
    surface.dataset.mode = mode;
  });
  ensureGradientFields(mode);
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
  ];
  const derivedCss = derivedProperties.map((name) => `  ${name}: ${cssVar(name)};`).join("\n");

  return `.living-gradient[data-mode="${state.mode}"] {
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
${derivedCss}
}`;
}

function buildConfigExport() {
  return JSON.stringify({
    schema: "aha-living-gradient-playground/v14",
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

initReducedMotion();
ensureGradientFields();
renderPanel();
render();
