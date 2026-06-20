/**
 * Brand Color Palette Generator - Core JS logic
 * Handles: Color conversion, dynamic generation, copy-to-clipboard,
 * page redirects for mobile, and live sync for desktop dashboard.
 */

// Helper: Convert HSL to Hex color string
function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Helper: Convert Hex to HSL
function hexToHsl(hex) {
  let r = parseInt(hex.substring(1, 3), 16) / 255;
  let g = parseInt(hex.substring(3, 5), 16) / 255;
  let b = parseInt(hex.substring(5, 7), 16) / 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

// Brand Profile Config mappings: Type + Mood base parameters
const BRAND_TYPES = {
  skincare: { baseHue: 145 }, // Soft Mint / Sage Green (Fresh & Clean)
  clothing: { baseHue: 325 }, // Stylish Berry / Plum (Trend-focused)
  jewelry: { baseHue: 43 },  // Luxury Gold / Champagne
  fitness: { baseHue: 12 },   // Energetic Red-Orange / Crimson (Bold & Active)
  restaurant: { baseHue: 28 }, // Warm honey / tomato (Appetizing & Warm)
  tech: { baseHue: 215 }      // Electric / Digital Blue (Modern & Futuristic)
};

const BRAND_MOODS = {
  trustworthy: { sat: 65, light: 45 },
  bold: { sat: 90, light: 50 },
  calm: { sat: 40, light: 65 },
  premium: { sat: 20, light: 35 },
  playful: { sat: 85, light: 55 },
  minimal: { sat: 10, light: 50 }
};

// Generate full 5-color palette based on Type & Mood HSL values
function generateBrandPalette(type, mood) {
  const typeCfg = BRAND_TYPES[type] || BRAND_TYPES.tech;
  const moodCfg = BRAND_MOODS[mood] || BRAND_MOODS.trustworthy;

  let h = typeCfg.baseHue;
  let s = moodCfg.sat;
  let l = moodCfg.light;

  // 1. Apply personality offsets to the raw mood HSL parameters
  if (type === 'skincare') {
    // Skincare = soft, fresh, clean colors
    s = Math.round(s * 0.55); // Highly muted soft tones
    l = Math.min(88, Math.max(72, l + 15)); // Higher lightness for a clean, light aesthetic
  } else if (type === 'clothing') {
    // Clothing = stylish and trend-focused colors
    s = Math.round(s * 0.9);
    l = Math.max(38, Math.min(65, l - 5)); // Slightly richer and deeper for high fashion contrast
  } else if (type === 'fitness') {
    // Fitness = energetic and bold colors
    s = Math.min(100, Math.round(s * 1.25)); // Boost saturation for maximum energy
    l = Math.max(45, Math.min(60, l)); // Keep in highly visible vibrant range
  } else if (type === 'restaurant') {
    // Restaurant = warm appetizing colors
    // Make sure it goes orange-red in bold mood, honey yellow-orange in playful
    h = mood === 'bold' ? 12 : 28;
    s = Math.max(70, s);
  }

  // 2. Generate the 5 cohesive brand colors based on type profile
  let primary, secondary, accent, neutralDark, neutralLight;

  if (type === 'jewelry') {
    // Jewelry = luxury gold, champagne, black tones
    primary = hslToHex(43, 62, 50);      // Luxury Gold
    secondary = hslToHex(38, 38, 86);    // Elegant Champagne
    accent = hslToHex(0, 0, 15);         // Premium Onyx Accent
    neutralDark = hslToHex(0, 0, 7);     // Pitch Black background
    neutralLight = hslToHex(40, 20, 96);  // Ivory/Silk light background
  } else if (type === 'skincare') {
    // Soft pastel mint/peach/rose palettes
    primary = hslToHex(h, s, l);
    secondary = hslToHex((h + 40) % 360, Math.max(10, s - 5), Math.min(92, l + 4));
    accent = hslToHex((h + 190) % 360, Math.min(100, s + 15), Math.min(85, l));
    neutralDark = hslToHex(h, 10, 25);
    neutralLight = hslToHex(h, 15, 97);
  } else if (type === 'fitness') {
    // High contrast energetic neon palettes
    primary = hslToHex(h, s, l);
    secondary = hslToHex((h + 30) % 360, s, l);
    accent = hslToHex((h + 195) % 360, 100, 52); // Energetic electric green/blue complement
    neutralDark = hslToHex(h, 24, 9);
    neutralLight = hslToHex(h, 15, 96);
  } else {
    // Standard Tech, Clothing, Restaurant base palette rules
    primary = hslToHex(h, s, l);
    secondary = hslToHex((h + 30) % 360, Math.max(15, s - 10), Math.min(90, l + 5));
    const accentHue = mood === 'bold' ? (h + 180) % 360 : (h + 120) % 360;
    accent = hslToHex(accentHue, Math.min(100, s + 10), Math.max(40, l - 5));
    neutralDark = hslToHex(h, 15, 12);
    neutralLight = hslToHex(h, 10, 96);
  }

  return {
    primary,
    secondary,
    accent,
    neutralDark,
    neutralLight
  };
}

// Generate color harmonies from a single base color
function generateHarmonies(hex) {
  const { h, s, l } = hexToHsl(hex);

  return {
    complementary: [
      hex,
      hslToHex((h + 180) % 360, s, l)
    ],
    analogous: [
      hslToHex((h - 30 + 360) % 360, s, l),
      hex,
      hslToHex((h + 30) % 360, s, l)
    ],
    splitComplementary: [
      hex,
      hslToHex((h + 150) % 360, s, l),
      hslToHex((h + 210) % 360, s, l)
    ],
    triadic: [
      hex,
      hslToHex((h + 120) % 360, s, l),
      hslToHex((h + 240) % 360, s, l)
    ]
  };
}

// Toast notification helper
function showToast(message) {
  // Check if container exists, if not create it
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  // Animate out
  setTimeout(() => {
    toast.classList.add('toast-fadeout');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 2500);
}

// Clipboard copying utility
function copyToClipboard(text, elementForState) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Copied Hex: ${text}`);
    if (elementForState) {
      const originalText = elementForState.innerHTML;
      elementForState.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
      setTimeout(() => {
        elementForState.innerHTML = originalText;
      }, 1000);
    }
  }).catch(err => {
    console.error('Failed to copy hex to clipboard', err);
  });
}

// Check if currently operating in Desktop width mode
function isDesktop() {
  return window.innerWidth >= 1024;
}

// Initialize sections on document load
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const form = document.getElementById('brand-form');
  const typeSelect = document.getElementById('brand-type');
  const moodSelect = document.getElementById('brand-mood');
  const paletteContainer = document.getElementById('palette-container');
  const harmonySection = document.getElementById('harmony-explorer');

  // Load state from local storage or set defaults
  let activeType = localStorage.getItem('selectedType') || 'tech';
  let activeMood = localStorage.getItem('selectedMood') || 'trustworthy';
  let activeHarmonyBase = localStorage.getItem('harmonyBaseHex') || '';

  // Synchronize input fields
  if (typeSelect) typeSelect.value = activeType;
  if (moodSelect) moodSelect.value = activeMood;

  // 1. Initial Render Trigger
  renderApp();

  // 2. Form Submission Handler
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newType = typeSelect.value;
      const newMood = moodSelect.value;

      // Save to localStorage
      localStorage.setItem('selectedType', newType);
      localStorage.setItem('selectedMood', newMood);

      // Generate palette
      const palette = generateBrandPalette(newType, newMood);
      localStorage.setItem('primaryHex', palette.primary);
      localStorage.setItem('secondaryHex', palette.secondary);
      localStorage.setItem('accentHex', palette.accent);
      localStorage.setItem('neutralDarkHex', palette.neutralDark);
      localStorage.setItem('neutralLightHex', palette.neutralLight);

      // Reset active harmony base to the new primary
      activeHarmonyBase = palette.primary;
      localStorage.setItem('harmonyBaseHex', activeHarmonyBase);

      if (isDesktop()) {
        renderApp();
        showToast('Updated Palette & Harmony explorer!');
      } else {
        // Mobile Page Flow redirect to palette page
        window.location.href = 'palette.html';
      }
    });
  }

  // Render routine to populate views
  function renderApp() {
    // Generate actual palette values
    const palette = generateBrandPalette(
      localStorage.getItem('selectedType') || activeType,
      localStorage.getItem('selectedMood') || activeMood
    );

    // Apply color CSS properties to page container
    document.documentElement.style.setProperty('--color-primary', palette.primary);
    document.documentElement.style.setProperty('--color-secondary', palette.secondary);
    document.documentElement.style.setProperty('--color-accent', palette.accent);
    document.documentElement.style.setProperty('--color-neutral-dark', palette.neutralDark);
    document.documentElement.style.setProperty('--color-neutral-light', palette.neutralLight);

    // Render palette container if present
    if (paletteContainer) {
      renderPaletteView(palette);
    }

    // Render Harmony section if present
    if (harmonySection) {
      if (!activeHarmonyBase) {
        activeHarmonyBase = palette.primary;
        localStorage.setItem('harmonyBaseHex', activeHarmonyBase);
      }
      renderHarmonyView(activeHarmonyBase);
    }
  }

  // Draw Palette blocks
  function renderPaletteView(palette) {
    const colorRoles = [
      { key: 'primary', label: 'Primary (Brand Identity)', hex: palette.primary },
      { key: 'secondary', label: 'Secondary (Supporting)', hex: palette.secondary },
      { key: 'accent', label: 'Accent (Call to Action)', hex: palette.accent },
      { key: 'neutralDark', label: 'Neutral Dark (Text/Headers)', hex: palette.neutralDark },
      { key: 'neutralLight', label: 'Neutral Light (Backgrounds)', hex: palette.neutralLight }
    ];

    paletteContainer.innerHTML = '';

    colorRoles.forEach(role => {
      const card = document.createElement('div');
      card.className = 'color-card';
      card.dataset.hex = role.hex;

      card.innerHTML = `
        <div class="color-swatch" style="background-color: ${role.hex};"></div>
        <div class="color-details">
          <div class="color-role">${role.label}</div>
          <div class="color-hex">${role.hex}</div>
        </div>
        <button class="btn-copy" title="Copy Hex Code">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        </button>
      `;

      // Copy Hex Button Action
      const copyBtn = card.querySelector('.btn-copy');
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Avoid triggering card click redirect/update
        copyToClipboard(role.hex, copyBtn);
      });

      // Swatch Click: Redirect to harmony (mobile) or change harmony base (desktop)
      card.addEventListener('click', () => {
        activeHarmonyBase = role.hex;
        localStorage.setItem('harmonyBaseHex', role.hex);

        if (isDesktop()) {
          renderHarmonyView(role.hex);
          // Highlight selection
          document.querySelectorAll('.color-card').forEach(c => c.style.borderColor = 'rgba(255, 255, 255, 0.08)');
          card.style.borderColor = 'var(--color-primary)';
          showToast(`Selected ${role.hex} for Harmony Explorer`);
        } else {
          // Mobile Redirect Flow
          window.location.href = 'harmony.html';
        }
      });

      paletteContainer.appendChild(card);
    });
  }

  // Draw Color Harmonies
  function renderHarmonyView(baseHex) {
    const harmonies = generateHarmonies(baseHex);
    
    // Update harmony metadata title
    const selectedHexVal = document.getElementById('harmony-selected-hex-value');
    const selectedDotVal = document.getElementById('harmony-selected-dot-value');
    if (selectedHexVal) selectedHexVal.textContent = baseHex;
    if (selectedDotVal) selectedDotVal.style.backgroundColor = baseHex;

    // Fill harmonies content
    const explorer = document.getElementById('harmony-groups-wrapper');
    if (!explorer) return;

    explorer.innerHTML = '';

    const harmonyTypes = [
      { key: 'complementary', label: 'Complementary Harmony', list: harmonies.complementary },
      { key: 'analogous', label: 'Analogous Harmony', list: harmonies.analogous },
      { key: 'splitComplementary', label: 'Split Complementary', list: harmonies.splitComplementary },
      { key: 'triadic', label: 'Triadic Harmony', list: harmonies.triadic }
    ];

    harmonyTypes.forEach(group => {
      const element = document.createElement('div');
      element.className = 'harmony-group';

      let swatchesHtml = '';
      group.list.forEach(color => {
        swatchesHtml += `
          <div class="harmony-swatch" style="background-color: ${color};" data-hex="${color}" title="Click to copy Hex: ${color}"></div>
        `;
      });

      element.innerHTML = `
        <div class="harmony-title">${group.label}</div>
        <div class="harmony-palette">
          ${swatchesHtml}
        </div>
      `;

      // Harmony swatch click copy behavior
      element.querySelectorAll('.harmony-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
          const colorHex = swatch.getAttribute('data-hex');
          copyToClipboard(colorHex, null);
        });
      });

      explorer.appendChild(element);
    });
  }
});
