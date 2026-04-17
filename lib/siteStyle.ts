export type RadiusPreset = 'none' | 'sm' | 'md' | 'lg' | 'xl'
export type ShadowPreset = 'none' | 'subtle' | 'moderate' | 'strong'
export type NavEffect   = 'solid' | 'glass'

export interface SiteStyle {
  // Colors
  colorPrimary:   string  // brand color
  colorSecondary: string  // dark/header shade
  colorAccent:    string  // highlight
  colorBg:        string  // page background
  colorText:      string  // main text
  colorNavBg:     string  // nav background (hex — opacity set by navEffect)

  // Typography
  fontHeading: string     // Google Font name
  fontBody:    string     // Google Font name

  // Shape
  radius: RadiusPreset

  // Effects
  shadow:    ShadowPreset
  navEffect: NavEffect    // solid | glass
}

export const DEFAULT_STYLE: SiteStyle = {
  colorPrimary:   '#2563eb',
  colorSecondary: '#1e3a5f',
  colorAccent:    '#f59e0b',
  colorBg:        '#f8fafc',
  colorText:      '#0f172a',
  colorNavBg:     '#ffffff',
  fontHeading:    'Inter',
  fontBody:       'Inter',
  radius:         'md',
  shadow:         'subtle',
  navEffect:      'glass',
}

export const RADIUS_MAP: Record<RadiusPreset, string> = {
  none: '0px',
  sm:   '4px',
  md:   '8px',
  lg:   '16px',
  xl:   '24px',
}

export const SHADOW_MAP: Record<ShadowPreset, string> = {
  none:     'none',
  subtle:   '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)',
  moderate: '0 4px 12px 0 rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.08)',
  strong:   '0 8px 24px 0 rgba(0,0,0,0.14), 0 4px 8px -4px rgba(0,0,0,0.10)',
}

/** Generates CSS custom properties string injected into <style> */
export function buildCssVars(s: SiteStyle): string {
  const r = RADIUS_MAP[s.radius]
  const shadow = SHADOW_MAP[s.shadow]
  const navBg = s.navEffect === 'glass'
    ? `${s.colorNavBg}f0`   // hex with ~94% opacity
    : s.colorNavBg
  const navBlur = s.navEffect === 'glass' ? 'blur(12px)' : 'none'

  return [
    `--c-primary:${s.colorPrimary}`,
    `--c-secondary:${s.colorSecondary}`,
    `--c-accent:${s.colorAccent}`,
    `--c-bg:${s.colorBg}`,
    `--c-text:${s.colorText}`,
    `--c-nav-bg:${navBg}`,
    `--c-nav-blur:${navBlur}`,
    `--radius:${r}`,
    `--radius-sm:${parseInt(r) > 0 ? Math.round(parseInt(r) * 0.6) + 'px' : '0px'}`,
    `--radius-lg:${parseInt(r) > 0 ? Math.round(parseInt(r) * 2) + 'px' : '0px'}`,
    `--shadow:${shadow}`,
    `--font-heading:'${s.fontHeading}',ui-sans-serif,sans-serif`,
    `--font-body:'${s.fontBody}',ui-sans-serif,sans-serif`,
  ].join(';')
}

/** Google Fonts URL for the selected fonts */
export function buildFontUrl(s: SiteStyle): string {
  const families = [...new Set([s.fontHeading, s.fontBody])]
    .map(f => `family=${encodeURIComponent(f)}:wght@300;400;500;600;700`)
    .join('&')
  return `https://fonts.googleapis.com/css2?${families}&display=swap`
}

export const HEADING_FONTS = [
  'Inter', 'Montserrat', 'Poppins', 'Raleway', 'Oswald',
  'DM Sans', 'Nunito', 'Playfair Display', 'Merriweather', 'Lora',
]

export const BODY_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Source Sans 3',
  'Nunito', 'DM Sans', 'Poppins', 'Noto Sans', 'Raleway',
]

export const COLOR_PRESETS = [
  { label: 'Modrá (default)', primary: '#2563eb', secondary: '#1e3a5f', accent: '#f59e0b' },
  { label: 'Zelená',          primary: '#16a34a', secondary: '#14532d', accent: '#f59e0b' },
  { label: 'Červená',         primary: '#dc2626', secondary: '#7f1d1d', accent: '#f59e0b' },
  { label: 'Fialová',         primary: '#7c3aed', secondary: '#3b0764', accent: '#f59e0b' },
  { label: 'Tmavomodrá',      primary: '#0369a1', secondary: '#0c4a6e', accent: '#fb923c' },
  { label: 'Teal',            primary: '#0d9488', secondary: '#134e4a', accent: '#f59e0b' },
  { label: 'Antracit',        primary: '#374151', secondary: '#111827', accent: '#2563eb' },
]
