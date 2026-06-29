const STORAGE_KEY = "aha-living-gradient-playground:v26";
const CONFIG_SCHEMA = "aha-living-gradient-playground/v26";

const prototype = document.querySelector(".prototype");
const gradients = Array.from(document.querySelectorAll(".living-gradient"));
const controlsRoot = document.querySelector("[data-control-root]");
const cssOutput = document.querySelector("[data-css-output]");
const saveConfigButton = document.querySelector("[data-save-config]");
const copyCssButton = document.querySelector("[data-copy-css]");
const copyConfigButton = document.querySelector("[data-copy-config]");
const exportMp4Button = document.querySelector("[data-export-mp4]");
const resetButton = document.querySelector("[data-reset-config]");
const copyStatus = document.querySelector("[data-copy-status]");
const modeReadout = document.querySelector("[data-mode-readout]");

const EXPORT_WIDTH = 1920;
const EXPORT_HEIGHT = 1080;
const EXPORT_FPS = 30;
const MP4_MIME_TYPES = [
  "video/mp4;codecs=avc1.42E01E",
  "video/mp4;codecs=avc1",
  "video/mp4;codecs=h264",
  "video/mp4",
];

const presets = [
  {
    id: "A",
    label: "A",
    name: "Calm Vertical",
    summary: "A centered slow flame with restrained light and steady shadow.",
    values: {
      duration: 16,
      evolutionSpeed: 1.35,
      flameScale: 1.08,
      flameRotation: 0,
      flameX: 0.55,
      flameY: 0.5,
      flameWidth: 0.58,
      flameHeight: 1.14,
      flameStrength: 1.16,
      taperPower: 1.28,
      tipRoundness: 0.55,
      edgeSoftness: 0.32,
      warmLight: 1.24,
      warmSpread: 0.92,
      deepPressure: 1.14,
      shadowReach: 1,
      turbulence: 0.9,
      noiseScale: 1,
      rise: 0.68,
      sway: 0.24,
      spineWobble: 0.62,
      tongue: 0.58,
      tongueWidth: 1,
      colorIntensity: 1.1,
      shaderBlur: 0,
    },
  },
  {
    id: "B",
    label: "B",
    name: "Upper Light",
    summary: "More orange energy gathers near the top-right without washing the red.",
    values: {
      duration: 14,
      evolutionSpeed: 1.5,
      flameScale: 1.12,
      flameRotation: -4,
      flameX: 0.63,
      flameY: 0.48,
      flameWidth: 0.66,
      flameHeight: 1.05,
      flameStrength: 1.24,
      taperPower: 1.18,
      tipRoundness: 0.52,
      edgeSoftness: 0.3,
      warmLight: 1.3,
      warmSpread: 1.08,
      deepPressure: 1,
      shadowReach: 0.88,
      turbulence: 1.02,
      noiseScale: 1.08,
      rise: 0.78,
      sway: 0.34,
      spineWobble: 0.74,
      tongue: 0.76,
      tongueWidth: 0.92,
      colorIntensity: 1.12,
      shaderBlur: 0,
    },
  },
  {
    id: "C",
    label: "C",
    name: "Shadow Breath",
    summary: "Deep red carries more weight while orange stays narrow and alive.",
    values: {
      duration: 18,
      evolutionSpeed: 1.25,
      flameScale: 1.1,
      flameRotation: 3,
      flameX: 0.52,
      flameY: 0.54,
      flameWidth: 0.6,
      flameHeight: 1.18,
      flameStrength: 1.18,
      taperPower: 1.38,
      tipRoundness: 0.64,
      edgeSoftness: 0.28,
      warmLight: 1.08,
      warmSpread: 0.78,
      deepPressure: 1.36,
      shadowReach: 1.22,
      turbulence: 1.12,
      noiseScale: 1.16,
      rise: 0.58,
      sway: 0.22,
      spineWobble: 0.56,
      tongue: 0.54,
      tongueWidth: 1.08,
      colorIntensity: 1.12,
      shaderBlur: 0,
    },
  },
  {
    id: "D",
    label: "D",
    name: "Wide Field",
    summary: "A broader flame field for large backgrounds and cropped surfaces.",
    values: {
      duration: 16,
      evolutionSpeed: 1.4,
      flameScale: 1.24,
      flameRotation: -8,
      flameX: 0.6,
      flameY: 0.5,
      flameWidth: 0.86,
      flameHeight: 1.02,
      flameStrength: 1.14,
      taperPower: 1.05,
      tipRoundness: 0.42,
      edgeSoftness: 0.38,
      warmLight: 1.18,
      warmSpread: 0.96,
      deepPressure: 1.12,
      shadowReach: 0.96,
      turbulence: 0.82,
      noiseScale: 0.9,
      rise: 0.64,
      sway: 0.28,
      spineWobble: 0.52,
      tongue: 0.46,
      tongueWidth: 1.18,
      colorIntensity: 1.1,
      shaderBlur: 0,
    },
  },
];

const presetById = new Map(presets.map((preset) => [preset.id, preset]));

const controlGroups = [
  {
    id: "flame-shape",
    title: "Flame Shape",
    open: true,
    keys: ["flameScale", "flameRotation", "flameX", "flameY", "flameWidth", "flameHeight", "flameStrength", "taperPower", "tipRoundness"],
  },
  {
    id: "texture",
    title: "Motion & Texture",
    open: true,
    keys: ["duration", "evolutionSpeed", "rise", "sway", "spineWobble", "turbulence", "noiseScale", "edgeSoftness", "tongue", "tongueWidth"],
  },
  {
    id: "colour",
    title: "Colour",
    open: true,
    keys: ["warmLight", "warmSpread", "deepPressure", "shadowReach", "colorIntensity", "shaderBlur"],
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

const controlDefinitions = {
  duration: { key: "duration", label: "Cycle", type: "range", min: 6, max: 36, step: 1, default: 16, unit: "s" },
  evolutionSpeed: { key: "evolutionSpeed", label: "Evolution speed", type: "range", min: 0.4, max: 4, step: 0.01, default: 1.35, unit: "x" },
  flameScale: { key: "flameScale", label: "Overall scale", type: "range", min: 0.25, max: 5, step: 0.01, default: 1.08 },
  flameRotation: { key: "flameRotation", label: "Rotation", type: "range", min: -180, max: 180, step: 1, default: 0, unit: "deg" },
  flameX: { key: "flameX", label: "Horizontal position", type: "range", min: -1, max: 2, step: 0.01, default: 0.55 },
  flameY: { key: "flameY", label: "Vertical position", type: "range", min: -1, max: 2, step: 0.01, default: 0.5 },
  flameWidth: { key: "flameWidth", label: "Plume width", type: "range", min: 0.08, max: 5, step: 0.01, default: 0.58 },
  flameHeight: { key: "flameHeight", label: "Plume height", type: "range", min: 0.16, max: 5, step: 0.01, default: 1.14 },
  flameStrength: { key: "flameStrength", label: "Flame strength", type: "range", min: 0.35, max: 1.65, step: 0.01, default: 1.16 },
  taperPower: { key: "taperPower", label: "Taper", type: "range", min: 0.45, max: 2.6, step: 0.01, default: 1.28 },
  tipRoundness: { key: "tipRoundness", label: "Tip roundness", type: "range", min: 0, max: 1.4, step: 0.01, default: 0.55 },
  warmLight: { key: "warmLight", label: "Warm light", type: "range", min: 0, max: 1.65, step: 0.01, default: 1.24 },
  warmSpread: { key: "warmSpread", label: "Warm spread", type: "range", min: 0, max: 1.6, step: 0.01, default: 0.92 },
  deepPressure: { key: "deepPressure", label: "Deep pressure", type: "range", min: 0.35, max: 1.65, step: 0.01, default: 1.14 },
  shadowReach: { key: "shadowReach", label: "Shadow reach", type: "range", min: 0, max: 1.8, step: 0.01, default: 1 },
  turbulence: { key: "turbulence", label: "Organic edge", type: "range", min: 0, max: 1.8, step: 0.01, default: 0.9 },
  edgeSoftness: { key: "edgeSoftness", label: "Edge softness", type: "range", min: 0.04, max: 0.9, step: 0.01, default: 0.32 },
  noiseScale: { key: "noiseScale", label: "Noise scale", type: "range", min: 0.45, max: 2.8, step: 0.01, default: 1 },
  rise: { key: "rise", label: "Rising pull", type: "range", min: 0, max: 1.4, step: 0.01, default: 0.68 },
  sway: { key: "sway", label: "Side sway", type: "range", min: 0, max: 1, step: 0.01, default: 0.24 },
  spineWobble: { key: "spineWobble", label: "Spine wobble", type: "range", min: 0, max: 1.6, step: 0.01, default: 0.62 },
  tongue: { key: "tongue", label: "Inner tongue", type: "range", min: 0, max: 1.2, step: 0.01, default: 0.58 },
  tongueWidth: { key: "tongueWidth", label: "Tongue width", type: "range", min: 0.25, max: 2, step: 0.01, default: 1 },
  colorIntensity: { key: "colorIntensity", label: "Colour intensity", type: "range", min: 0.75, max: 1.25, step: 0.01, default: 1.1 },
  shaderBlur: { key: "shaderBlur", label: "Shader blur", type: "range", min: 0, max: 180, step: 1, default: 0, unit: "px" },
  "surfaces.all": { key: "surfaces.all", label: "All surfaces", type: "checkbox", default: true },
  "surfaces.logo": { key: "surfaces.logo", label: "Logo", type: "checkbox", default: true },
  "surfaces.button": { key: "surfaces.button", label: "Button", type: "checkbox", default: true },
  "surfaces.card": { key: "surfaces.card", label: "Card", type: "checkbox", default: true },
  "surfaces.background": { key: "surfaces.background", label: "Background", type: "checkbox", default: true },
  reducedMotion: { key: "reducedMotion", label: "Reduced motion", type: "checkbox", default: false },
  contrastSafe: { key: "contrastSafe", label: "Contrast safe", type: "checkbox", default: false },
  paused: { key: "paused", label: "Paused", type: "checkbox", default: false },
};

const controls = Object.values(controlDefinitions);
const controlByKey = new Map(controls.map((control) => [control.key, control]));
const defaultState = createDefaultState();

let state = normalizeState(loadSavedState());
let isRendering = false;
let savedStateSnapshot = serializeState(state);

const shaderRuntime = {
  items: new Map(),
  raf: 0,
  origin: performance.now(),
  webglAvailable: null,
};

const formatters = {
  duration: (value) => `${Math.round(value)}s`,
  evolutionSpeed: (value) => `${value.toFixed(2)}x`,
  flameScale: (value) => value.toFixed(2),
  flameRotation: (value) => `${Math.round(value)}deg`,
  flameX: (value) => `${Math.round(value * 100)}%`,
  flameY: (value) => `${Math.round(value * 100)}%`,
  flameWidth: (value) => value.toFixed(2),
  flameHeight: (value) => value.toFixed(2),
  flameStrength: (value) => value.toFixed(2),
  taperPower: (value) => value.toFixed(2),
  tipRoundness: (value) => value.toFixed(2),
  warmLight: (value) => value.toFixed(2),
  warmSpread: (value) => value.toFixed(2),
  deepPressure: (value) => value.toFixed(2),
  shadowReach: (value) => value.toFixed(2),
  turbulence: (value) => value.toFixed(2),
  edgeSoftness: (value) => value.toFixed(2),
  noiseScale: (value) => value.toFixed(2),
  rise: (value) => value.toFixed(2),
  sway: (value) => value.toFixed(2),
  spineWobble: (value) => value.toFixed(2),
  tongue: (value) => value.toFixed(2),
  tongueWidth: (value) => value.toFixed(2),
  colorIntensity: (value) => value.toFixed(2),
  shaderBlur: (value) => `${Math.round(value)}px`,
};

function createDefaultState() {
  return {
    preset: "A",
    ...structuredClone(presetById.get("A").values),
    surfaces: {
      all: true,
      logo: true,
      button: true,
      card: true,
      background: true,
    },
    reducedMotion: false,
    contrastSafe: false,
    paused: false,
  };
}

function renderPanel() {
  controlsRoot.innerHTML = `${renderExplanation()}${renderPresetOverview()}${controlGroups.map((group) => {
    const rows = group.keys.map((key) => controlDefinitions[key]).filter(Boolean).map(renderControl).join("");
    return `<details class="parameterizer-folder" ${group.open ? "open" : ""}>
      <summary class="parameterizer-folder-title">${group.title}</summary>
      <div class="parameterizer-folder-body">${rows}</div>
    </details>`;
  }).join("")}`;

  bindControls();
}

function renderExplanation() {
  return `<section class="shader-explainer" aria-label="Shader explanation">
    <div class="effect-overview-title">What this is showing</div>
    <p>This demo is now one flame shader. A-D are presets that move the same sliders into different compositions.</p>
    <p>The shader starts with an opaque AHA red field, builds a responsive flame mask from layered noise, then mixes in deep red for shadow and orange for the rising light. No white or extra red is used inside the animated artwork.</p>
  </section>`;
}

function renderPresetOverview() {
  const cards = presets.map((preset) => {
    const active = preset.id === state.preset;
    return `<button class="effect-card${active ? " is-active" : ""}" type="button" data-preset-card="${preset.id}" aria-pressed="${active}">
      <span class="effect-card-kicker">Preset ${preset.label}</span>
      <strong>${preset.name}</strong>
      <span class="effect-card-summary">${preset.summary}</span>
    </button>`;
  }).join("");

  return `<section class="effect-overview" aria-label="Flame presets">
    <div class="effect-overview-title">Presets</div>
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
  controlsRoot.querySelectorAll("[data-preset-card]").forEach((card) => {
    card.addEventListener("click", (event) => {
      applyPreset(event.currentTarget.dataset.presetCard);
      markStateDirty();
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
      if (!key.startsWith("surfaces.") && key !== "reducedMotion" && key !== "contrastSafe" && key !== "paused") {
        state.preset = getMatchingPresetId() ?? "Custom";
      }
      if (key === "surfaces.all") syncSurfaceDisabledState();

      markStateDirty();
      render();
    });
  });
}

function applyPreset(presetId) {
  const preset = presetById.get(presetId);
  if (!preset) return;
  state.preset = preset.id;
  Object.entries(preset.values).forEach(([key, value]) => {
    setStateValue(key, value);
  });
}

function getMatchingPresetId() {
  return presets.find((preset) => Object.entries(preset.values).every(([key, value]) => {
    return Math.abs(Number(getStateValue(key)) - Number(value)) < 0.001;
  }))?.id;
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
  if (!state[root]) state[root] = {};
  state[root][child] = value;
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
    output.textContent = formatValue(key, getStateValue(key));
  });

  controlsRoot.querySelectorAll("[data-preset-card]").forEach((card) => {
    const isActive = card.dataset.presetCard === state.preset;
    card.classList.toggle("is-active", isActive);
    card.setAttribute("aria-pressed", String(isActive));
  });

  syncSurfaceDisabledState();
  isRendering = false;
}

function syncSurfaceDisabledState() {
  controlsRoot.querySelectorAll('[data-control-key^="surfaces."]:not([data-control-key="surfaces.all"])').forEach((toggle) => {
    toggle.disabled = !state.surfaces.all;
  });
}

function updateDerivedVariables() {
  prototype.style.setProperty("--lg-duration", `${state.duration.toFixed(2)}s`);
  prototype.style.setProperty("--lg-evolution-speed", state.evolutionSpeed.toFixed(2));
  prototype.style.setProperty("--lg-flame-scale", state.flameScale.toFixed(2));
  prototype.style.setProperty("--lg-flame-rotation", `${Math.round(state.flameRotation)}deg`);
  prototype.style.setProperty("--lg-flame-x", `${Math.round(state.flameX * 100)}%`);
  prototype.style.setProperty("--lg-flame-y", `${Math.round(state.flameY * 100)}%`);
  prototype.style.setProperty("--lg-flame-width", state.flameWidth.toFixed(2));
  prototype.style.setProperty("--lg-flame-height", state.flameHeight.toFixed(2));
  prototype.style.setProperty("--lg-flame-strength", state.flameStrength.toFixed(2));
  prototype.style.setProperty("--lg-taper-power", state.taperPower.toFixed(2));
  prototype.style.setProperty("--lg-tip-roundness", state.tipRoundness.toFixed(2));
  prototype.style.setProperty("--lg-warm-light", state.warmLight.toFixed(2));
  prototype.style.setProperty("--lg-warm-spread", state.warmSpread.toFixed(2));
  prototype.style.setProperty("--lg-deep-pressure", state.deepPressure.toFixed(2));
  prototype.style.setProperty("--lg-shadow-reach", state.shadowReach.toFixed(2));
  prototype.style.setProperty("--lg-organic-edge", state.turbulence.toFixed(2));
  prototype.style.setProperty("--lg-edge-softness", state.edgeSoftness.toFixed(2));
  prototype.style.setProperty("--lg-noise-scale", state.noiseScale.toFixed(2));
  prototype.style.setProperty("--lg-rise", state.rise.toFixed(2));
  prototype.style.setProperty("--lg-sway", state.sway.toFixed(2));
  prototype.style.setProperty("--lg-spine-wobble", state.spineWobble.toFixed(2));
  prototype.style.setProperty("--lg-inner-tongue", state.tongue.toFixed(2));
  prototype.style.setProperty("--lg-tongue-width", state.tongueWidth.toFixed(2));
  prototype.style.setProperty("--lg-color-intensity", state.colorIntensity.toFixed(2));
  prototype.style.setProperty("--lg-shader-blur", `${Math.round(state.shaderBlur)}px`);
}

function applyFlags() {
  prototype.dataset.preset = state.preset;
  modeReadout.textContent = state.preset === "Custom" ? "Custom" : `Preset ${state.preset}`;
  prototype.classList.toggle("is-reduced-motion", state.reducedMotion);
  prototype.classList.toggle("is-contrast-safe", state.contrastSafe);
  prototype.classList.toggle("is-paused", state.paused);
  gradients.forEach((surface) => {
    surface.dataset.mode = "flame";
  });
}

function applySurfaceToggles() {
  const globalEnabled = state.surfaces.all;
  gradients.forEach((surface) => {
    const surfaceName = surface.dataset.surface;
    const enabled = Boolean(globalEnabled && state.surfaces[surfaceName]);
    surface.classList.toggle("is-surface-off", !enabled);
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
  const active = canUseWebGL() && !state.reducedMotion;
  const globalEnabled = state.surfaces.all;

  gradients.forEach((surface) => {
    const surfaceName = surface.dataset.surface;
    const enabled = active && globalEnabled && state.surfaces[surfaceName];
    surface.classList.toggle("has-shader", enabled);
    if (enabled) {
      ensureShaderSurface(surface);
    } else {
      destroyShaderSurface(surface);
    }
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

  shaderRuntime.items.set(surface, createShaderRenderer(gl, canvas, program, buffer));
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
  uniform float u_cycle;
  uniform float u_speed;
  uniform float u_scale;
  uniform float u_rotation;
  uniform float u_flame_x;
  uniform float u_flame_y;
  uniform float u_flame_width;
  uniform float u_flame_height;
  uniform float u_flame_strength;
  uniform float u_taper_power;
  uniform float u_tip_roundness;
  uniform float u_warm;
  uniform float u_warm_spread;
  uniform float u_deep;
  uniform float u_shadow_reach;
  uniform float u_turbulence;
  uniform float u_edge_softness;
  uniform float u_noise_scale;
  uniform float u_rise;
  uniform float u_sway;
  uniform float u_spine_wobble;
  uniform float u_tongue;
  uniform float u_tongue_width;
  uniform float u_energy;

  const vec3 AHA_ORANGE = vec3(0.941, 0.424, 0.137);
  const vec3 AHA_RED = vec3(0.886, 0.0, 0.118);
  const vec3 AHA_DEEP = vec3(0.322, 0.008, 0.031);

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p *= 2.03;
      amplitude *= 0.52;
    }
    return value;
  }

  float breathSignal(float t) {
    float phase = fract(t * max(u_speed, 0.01) / max(u_cycle, 1.0));
    float inhale = smoothstep(0.1, 0.42, phase);
    float exhale = 1.0 - smoothstep(0.58, 0.94, phase);
    return inhale * exhale;
  }

  vec3 flame(vec2 uv, float t) {
    float aspect = 1.0;
    float breath = breathSignal(t);
    float riseTime = t * 0.18 * max(u_speed, 0.08) * max(u_rise, 0.02);
    vec2 center = vec2(u_flame_x, u_flame_y);
    vec2 p = uv - center;
    p.x *= aspect;
    float rotation = radians(u_rotation);
    float s = sin(rotation);
    float c = cos(rotation);
    p = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
    p /= max(u_scale, 0.01);

    float vertical = clamp((p.y / max(u_flame_height, 0.01)) + 0.56, 0.0, 1.0);
    float activeHeight = smoothstep(0.0, 0.14, vertical) * (1.0 - smoothstep(0.97, 1.0, vertical));
    float taper = mix(max(u_flame_width, 0.01), max(u_flame_width, 0.01) * 0.13, pow(vertical, max(u_taper_power, 0.01)));
    float noiseScale = max(u_noise_scale, 0.01);
    float spineNoise = fbm(vec2(vertical * 2.2 * noiseScale - riseTime, riseTime * 1.15));
    float spine = (spineNoise - 0.5) * taper * u_spine_wobble * u_sway;
    float x = p.x - spine;
    float edge = abs(x) / max(taper, 0.001);
    float slowNoise = fbm(vec2(x * 2.4 * noiseScale, vertical * 2.1 * noiseScale - riseTime));
    float edgeNoise = fbm(vec2(x * 5.6 * noiseScale + riseTime * 0.8, vertical * 5.8 * noiseScale - riseTime * 2.4));
    float noisyEdge = edge - (slowNoise - 0.5) * 0.34 * u_turbulence - (edgeNoise - 0.5) * 0.14 * u_turbulence;
    float edgeStart = clamp(0.78 - u_edge_softness * 0.42, 0.24, 0.95);
    float edgeEnd = clamp(edgeStart + u_edge_softness, edgeStart + 0.04, 1.45);
    float body = (1.0 - smoothstep(edgeStart, edgeEnd, noisyEdge)) * activeHeight * u_flame_strength;
    float tipRound = 1.0 - smoothstep(0.0, 1.0, length(vec2(x / max(taper * 0.7, 0.001), (vertical - 0.88) / 0.18)));
    body = clamp(max(body, tipRound * 0.38 * u_tip_roundness) * (1.0 - smoothstep(0.98, 1.0, vertical)), 0.0, 1.0);

    float tongueCenter = spine + taper * 0.08 + (fbm(vec2(vertical * 4.2 * noiseScale - riseTime * 0.9, riseTime)) - 0.5) * taper * 0.42;
    float tongueWidth = max(taper * (0.22 + (1.0 - vertical) * 0.24) * u_tongue_width, 0.006);
    float tongueShape = 1.0 - smoothstep(0.32, 1.18, abs(p.x - tongueCenter) / tongueWidth);
    float tongue = tongueShape * body * smoothstep(0.12, 0.76, vertical) * (1.0 - smoothstep(0.97, 1.0, vertical));

    float lightNoise = fbm(vec2(x * 3.1 * noiseScale + riseTime * 0.42, vertical * 3.8 * noiseScale - riseTime * 1.35));
    float lightCenter = spine + taper * (0.32 + u_warm_spread * 0.08 + (lightNoise - 0.5) * 0.72);
    float lightWidth = max(taper * (0.34 + u_warm_spread * 0.46) * (1.08 - vertical * 0.26), 0.006);
    float upperBand = smoothstep(0.34, 0.76, vertical) * (1.0 - smoothstep(0.98, 1.0, vertical));
    float upperLight = body * upperBand * (1.0 - smoothstep(0.28, 1.2 + u_edge_softness * 0.24, abs(p.x - lightCenter) / lightWidth));
    upperLight *= mix(0.78, 1.2, lightNoise);

    float crownWidth = max(taper * (0.56 + u_warm_spread * 0.38), 0.006);
    float crown = body * smoothstep(0.62, 0.9, vertical) * (1.0 - smoothstep(0.99, 1.0, vertical));
    crown *= 1.0 - smoothstep(0.36, 1.18, abs(x - taper * 0.34) / crownWidth);

    float warmPulse = mix(0.78, 1.18, breath);
    float warmMask = clamp((upperLight * 0.94 + tongue * u_tongue * 0.68 + crown * 0.54) * u_warm * warmPulse, 0.0, 0.94);

    float shadowNoise = fbm(vec2(x * 1.7 * noiseScale - riseTime * 0.18, vertical * 2.0 * noiseScale + riseTime * 0.12));
    float lowerWeight = 1.0 - smoothstep(0.12, 0.76, vertical);
    float leftFalloff = 1.0 - smoothstep(-taper * (1.18 + u_shadow_reach * 0.32), taper * (0.58 + u_edge_softness), p.x);
    float sideFalloff = 1.0 - smoothstep(-taper * (0.78 + u_shadow_reach * 0.28), taper * (0.92 + u_edge_softness), p.x);
    float lowerLeft = lowerWeight * leftFalloff;
    float sideShadow = sideFalloff * (0.16 + (1.0 - vertical) * 0.34);
    float outsideShadow = (1.0 - clamp(body, 0.0, 1.0)) * 0.05;
    float deepMaskRaw = lowerLeft * 0.46 + sideShadow * 0.26 + outsideShadow + (shadowNoise - 0.5) * 0.035;
    float deepMask = smoothstep(0.04, 0.92, clamp(deepMaskRaw * u_deep, 0.0, 1.0)) * 0.74;

    float redHeat = clamp(body * (0.28 + breath * 0.2) + slowNoise * 0.06, 0.0, 0.48);
    vec3 color = AHA_RED;
    color = mix(color, AHA_DEEP, deepMask);
    color = mix(color, AHA_RED, redHeat);
    color = mix(color, AHA_ORANGE, warmMask);
    return mix(AHA_RED, color, clamp(u_energy, 0.75, 1.25));
  }

  void main() {
    gl_FragColor = vec4(flame(v_uv, u_time), 1.0);
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
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

function drawShadersOnce(now = performance.now()) {
  shaderRuntime.items.forEach((item, surface) => drawShaderItem(item, surface, now));
}

function drawShaderItem(item, surface, now) {
  const rect = item.canvas.getBoundingClientRect();
  const renderScale = 1;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const width = Math.max(1, Math.round(rect.width * renderScale * dpr));
  const height = Math.max(1, Math.round(rect.height * renderScale * dpr));

  if (item.canvas.width !== width || item.canvas.height !== height) {
    item.canvas.width = width;
    item.canvas.height = height;
  }

  drawShaderRenderer(item, (now - shaderRuntime.origin) / 1000, width, height);
}

function createShaderRenderer(gl, canvas, program, buffer) {
  return {
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
      cycle: gl.getUniformLocation(program, "u_cycle"),
      speed: gl.getUniformLocation(program, "u_speed"),
      scale: gl.getUniformLocation(program, "u_scale"),
      rotation: gl.getUniformLocation(program, "u_rotation"),
      flameX: gl.getUniformLocation(program, "u_flame_x"),
      flameY: gl.getUniformLocation(program, "u_flame_y"),
      flameWidth: gl.getUniformLocation(program, "u_flame_width"),
      flameHeight: gl.getUniformLocation(program, "u_flame_height"),
      flameStrength: gl.getUniformLocation(program, "u_flame_strength"),
      taperPower: gl.getUniformLocation(program, "u_taper_power"),
      tipRoundness: gl.getUniformLocation(program, "u_tip_roundness"),
      warm: gl.getUniformLocation(program, "u_warm"),
      warmSpread: gl.getUniformLocation(program, "u_warm_spread"),
      deep: gl.getUniformLocation(program, "u_deep"),
      shadowReach: gl.getUniformLocation(program, "u_shadow_reach"),
      turbulence: gl.getUniformLocation(program, "u_turbulence"),
      edgeSoftness: gl.getUniformLocation(program, "u_edge_softness"),
      noiseScale: gl.getUniformLocation(program, "u_noise_scale"),
      rise: gl.getUniformLocation(program, "u_rise"),
      sway: gl.getUniformLocation(program, "u_sway"),
      spineWobble: gl.getUniformLocation(program, "u_spine_wobble"),
      tongue: gl.getUniformLocation(program, "u_tongue"),
      tongueWidth: gl.getUniformLocation(program, "u_tongue_width"),
      energy: gl.getUniformLocation(program, "u_energy"),
    },
  };
}

function drawShaderRenderer(item, shaderTime, width = item.canvas.width, height = item.canvas.height) {
  const gl = item.gl;
  gl.viewport(0, 0, width, height);
  gl.useProgram(item.program);
  gl.bindBuffer(gl.ARRAY_BUFFER, item.buffer);
  gl.enableVertexAttribArray(item.attribs.position);
  gl.vertexAttribPointer(item.attribs.position, 2, gl.FLOAT, false, 0, 0);

  gl.uniform2f(item.uniforms.resolution, width, height);
  gl.uniform1f(item.uniforms.time, shaderTime);
  gl.uniform1f(item.uniforms.cycle, state.duration);
  gl.uniform1f(item.uniforms.speed, state.evolutionSpeed);
  gl.uniform1f(item.uniforms.scale, state.flameScale);
  gl.uniform1f(item.uniforms.rotation, state.flameRotation);
  gl.uniform1f(item.uniforms.flameX, state.flameX);
  gl.uniform1f(item.uniforms.flameY, state.flameY);
  gl.uniform1f(item.uniforms.flameWidth, state.flameWidth);
  gl.uniform1f(item.uniforms.flameHeight, state.flameHeight);
  gl.uniform1f(item.uniforms.flameStrength, state.flameStrength);
  gl.uniform1f(item.uniforms.warm, state.warmLight);
  gl.uniform1f(item.uniforms.deep, state.deepPressure);
  gl.uniform1f(item.uniforms.turbulence, state.turbulence);
  gl.uniform1f(item.uniforms.taperPower, state.taperPower);
  gl.uniform1f(item.uniforms.tipRoundness, state.tipRoundness);
  gl.uniform1f(item.uniforms.warmSpread, state.warmSpread);
  gl.uniform1f(item.uniforms.shadowReach, state.shadowReach);
  gl.uniform1f(item.uniforms.edgeSoftness, state.edgeSoftness);
  gl.uniform1f(item.uniforms.noiseScale, state.noiseScale);
  gl.uniform1f(item.uniforms.rise, state.rise);
  gl.uniform1f(item.uniforms.sway, state.sway);
  gl.uniform1f(item.uniforms.spineWobble, state.spineWobble);
  gl.uniform1f(item.uniforms.tongue, state.tongue);
  gl.uniform1f(item.uniforms.tongueWidth, state.tongueWidth);
  gl.uniform1f(item.uniforms.energy, state.colorIntensity);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
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
  return `/* Flame shader requires this prototype's WebGL renderer. */
.living-gradient[data-mode="flame"] {
${flameCustomProperties().map(([name, value]) => `  ${name}: ${value};`).join("\n")}
}`;
}

function flameCustomProperties() {
  return [
    ["--lg-duration", `${state.duration.toFixed(2)}s`],
    ["--lg-evolution-speed", state.evolutionSpeed.toFixed(2)],
    ["--lg-flame-scale", state.flameScale.toFixed(2)],
    ["--lg-flame-rotation", `${Math.round(state.flameRotation)}deg`],
    ["--lg-flame-x", `${Math.round(state.flameX * 100)}%`],
    ["--lg-flame-y", `${Math.round(state.flameY * 100)}%`],
    ["--lg-flame-width", state.flameWidth.toFixed(2)],
    ["--lg-flame-height", state.flameHeight.toFixed(2)],
    ["--lg-flame-strength", state.flameStrength.toFixed(2)],
    ["--lg-taper-power", state.taperPower.toFixed(2)],
    ["--lg-tip-roundness", state.tipRoundness.toFixed(2)],
    ["--lg-warm-light", state.warmLight.toFixed(2)],
    ["--lg-warm-spread", state.warmSpread.toFixed(2)],
    ["--lg-deep-pressure", state.deepPressure.toFixed(2)],
    ["--lg-shadow-reach", state.shadowReach.toFixed(2)],
    ["--lg-organic-edge", state.turbulence.toFixed(2)],
    ["--lg-edge-softness", state.edgeSoftness.toFixed(2)],
    ["--lg-noise-scale", state.noiseScale.toFixed(2)],
    ["--lg-rise", state.rise.toFixed(2)],
    ["--lg-sway", state.sway.toFixed(2)],
    ["--lg-spine-wobble", state.spineWobble.toFixed(2)],
    ["--lg-inner-tongue", state.tongue.toFixed(2)],
    ["--lg-tongue-width", state.tongueWidth.toFixed(2)],
    ["--lg-color-intensity", state.colorIntensity.toFixed(2)],
    ["--lg-shader-blur", `${Math.round(state.shaderBlur)}px`],
  ];
}

function buildConfigExport() {
  return JSON.stringify({
    schema: CONFIG_SCHEMA,
    updated: "2026-06-29",
    visualMode: "flame",
    preset: state.preset,
    state,
  }, null, 2);
}

function render() {
  if (isRendering) return;
  state = normalizeState(state);
  updateDerivedVariables();
  applyFlags();
  applySurfaceToggles();
  updateShaderRuntime();
  syncControlValues();
  cssOutput.value = buildCssExport();
}

async function copyText(text, successMessage) {
  copyStatus.textContent = "Copying...";
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
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

function getSupportedMp4MimeType() {
  if (!window.MediaRecorder) return "";
  return MP4_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function getExportPlan() {
  const seconds = clamp(state.duration / Math.max(state.evolutionSpeed, 0.1), 8, 80);
  const roundedSeconds = Number(seconds.toFixed(2));
  return {
    mode: "flame",
    label: state.preset === "Custom" ? "Custom Flame" : `Preset ${state.preset} Flame`,
    seconds: roundedSeconds,
    frames: Math.ceil(roundedSeconds * EXPORT_FPS),
    fps: EXPORT_FPS,
    width: EXPORT_WIDTH,
    height: EXPORT_HEIGHT,
    mimeType: getSupportedMp4MimeType(),
    startTime: (performance.now() - shaderRuntime.origin) / 1000,
  };
}

async function exportCurrentGradientMp4() {
  const plan = getExportPlan();
  if (!plan.mimeType || !HTMLCanvasElement.prototype.captureStream) {
    copyStatus.textContent = "MP4 export is not available in this browser. Use a browser with canvas capture and MP4 MediaRecorder support.";
    return;
  }

  const renderer = createExportShaderRenderer(plan.width, plan.height);
  if (!renderer) {
    copyStatus.textContent = "MP4 export could not start because the WebGL export renderer is unavailable.";
    return;
  }

  const stream = renderer.canvas.captureStream(plan.fps);
  const chunks = [];
  const recorder = new MediaRecorder(stream, {
    mimeType: plan.mimeType,
    videoBitsPerSecond: 10_000_000,
  });

  exportMp4Button.disabled = true;
  copyStatus.textContent = `Exporting ${plan.label} MP4 loop (${plan.seconds}s)...`;

  recorder.addEventListener("dataavailable", (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  });

  const finished = new Promise((resolve, reject) => {
    recorder.addEventListener("stop", resolve, { once: true });
    recorder.addEventListener("error", () => reject(new Error("MediaRecorder failed during MP4 export.")), { once: true });
  });

  try {
    recorder.start(250);
    await renderExportFrames(renderer, plan);
    recorder.stop();
    await finished;
    const blob = new Blob(chunks, { type: plan.mimeType });
    const filename = `aha-living-gradient-flame-${plan.seconds.toFixed(2)}s-loop.mp4`;
    downloadBlob(blob, filename);
    copyStatus.textContent = `Exported ${filename}.`;
  } catch (error) {
    if (recorder.state !== "inactive") recorder.stop();
    copyStatus.textContent = error.message || "MP4 export failed.";
  } finally {
    stream.getTracks().forEach((track) => track.stop());
    cleanupExportShaderRenderer(renderer);
    exportMp4Button.disabled = false;
  }
}

function renderExportFrames(renderer, plan) {
  const start = performance.now();
  let lastFrame = -1;
  return new Promise((resolve) => {
    const tick = (now) => {
      const elapsed = (now - start) / 1000;
      const frame = Math.min(Math.floor(elapsed * plan.fps), plan.frames - 1);
      if (frame !== lastFrame) {
        drawExportFrame(renderer, frame / plan.fps, plan);
        lastFrame = frame;
      }
      if (elapsed < plan.seconds) {
        requestAnimationFrame(tick);
        return;
      }
      drawExportFrame(renderer, 0, plan);
      resolve();
    };
    drawExportFrame(renderer, 0, plan);
    requestAnimationFrame(tick);
  });
}

function drawExportFrame(renderer, elapsed, plan) {
  drawShaderRenderer(renderer.shader, plan.startTime + elapsed, renderer.sourceCanvas.width, renderer.sourceCanvas.height);
  renderer.context.clearRect(0, 0, plan.width, plan.height);
  renderer.context.filter = renderer.blur > 0 ? `blur(${renderer.blur}px)` : "none";
  renderer.context.drawImage(renderer.sourceCanvas, -renderer.pad, -renderer.pad);
  renderer.context.filter = "none";
}

function createExportShaderRenderer(width, height) {
  const blur = Math.max(0, Math.round(state.shaderBlur));
  const pad = blur * 2;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return null;

  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = width + pad * 2;
  sourceCanvas.height = height + pad * 2;
  const gl = sourceCanvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance",
  });
  if (!gl) return null;

  const program = createShaderProgram(gl);
  if (!program) return null;

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

  return {
    canvas,
    context,
    sourceCanvas,
    pad,
    blur,
    shader: createShaderRenderer(gl, sourceCanvas, program, buffer),
  };
}

function cleanupExportShaderRenderer(renderer) {
  const { gl, buffer, program } = renderer.shader;
  gl.deleteBuffer(buffer);
  gl.deleteProgram(program);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function loadSavedState() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultState;
  } catch {
    return defaultState;
  }
}

function serializeState(value) {
  return JSON.stringify(normalizeState(value));
}

function markStateDirty() {
  copyStatus.textContent = serializeState(state) === savedStateSnapshot
    ? "Current settings match the saved version."
    : "Unsaved changes. Click Save Settings to keep them after reload.";
}

function saveCurrentState() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    savedStateSnapshot = serializeState(state);
    copyStatus.textContent = "Saved settings. They will load automatically next time.";
  } catch {
    copyStatus.textContent = "Settings changed, but browser storage is unavailable.";
  }
}

function normalizeState(candidate) {
  const next = structuredClone(defaultState);
  const preset = presetById.has(candidate?.preset) ? candidate.preset : "A";
  next.preset = candidate?.preset === "Custom" ? "Custom" : preset;

  controls.forEach((control) => {
    const value = readCandidateValue(candidate, control.key);
    if (value === undefined) return;
    if (control.type === "range") {
      setNestedValue(next, control.key, clamp(Number(value), control.min, control.max));
      return;
    }
    if (control.type === "checkbox") {
      setNestedValue(next, control.key, Boolean(value));
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

function resetConfig() {
  state = structuredClone(defaultState);
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage removal is a convenience; the in-memory reset still applies.
  }
  savedStateSnapshot = serializeState(state);
  copyStatus.textContent = "Reset to authored defaults.";
  renderPanel();
  render();
}

function initReducedMotion() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (prefersReducedMotion.matches) state.reducedMotion = true;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatValue(key, value) {
  return formatters[key] ? formatters[key](Number(value)) : String(value);
}

saveConfigButton.addEventListener("click", saveCurrentState);
copyCssButton.addEventListener("click", () => copyText(buildCssExport(), "Copied current CSS custom properties."));
copyConfigButton.addEventListener("click", () => copyText(buildConfigExport(), "Copied current parameter config."));
exportMp4Button.addEventListener("click", exportCurrentGradientMp4);
resetButton.addEventListener("click", resetConfig);

document.addEventListener("visibilitychange", syncShaderLoop);
window.addEventListener("resize", () => drawShadersOnce());

initReducedMotion();
renderPanel();
render();
