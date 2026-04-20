export type SiteType = 'obec' | 'skola' | 'firma' | 'neziskovka'

export interface SiteTypeConfig {
  id: SiteType
  label: string
  description: string
  icon: string
  color: string        // tailwind bg class
  accentColor: string  // tailwind text class
}

export interface PluginNavItem {
  label: string
  href: string
  iconName: string     // lucide icon name
}

export interface Plugin {
  id: string
  label: string
  description: string
  icon: string
  navItem?: PluginNavItem
  compatibleWith: SiteType[] | 'all'
  core: boolean        // core plugins can't be disabled
}

export const SITE_TYPES: SiteTypeConfig[] = [
  {
    id: 'obec',
    label: 'Obec / Mesto',
    description: 'Oficiálny web obce alebo mesta s úradnou tabuľou, zastupiteľstvom a komunitnými sekciami.',
    icon: '🏛',
    color: 'bg-blue-600',
    accentColor: 'text-blue-400',
  },
  {
    id: 'skola',
    label: 'Škola',
    description: 'Web pre základnú, strednú alebo inú vzdelávaciu inštitúciu.',
    icon: '🎓',
    color: 'bg-green-600',
    accentColor: 'text-green-400',
  },
  {
    id: 'firma',
    label: 'Firma',
    description: 'Firemná prezentácia, portfólio alebo produktový web.',
    icon: '🏢',
    color: 'bg-purple-600',
    accentColor: 'text-purple-400',
  },
  {
    id: 'neziskovka',
    label: 'Nezisková org.',
    description: 'Web pre združenia, nadácie, komunitné organizácie a projekty.',
    icon: '🤝',
    color: 'bg-amber-600',
    accentColor: 'text-amber-400',
  },
]

export const PLUGINS: Plugin[] = [
  // ── Core — vždy dostupné ──────────────────────────────────────────────────
  {
    id: 'aktuality',
    label: 'Aktuality',
    description: 'Správy, novinky a príspevky.',
    icon: '📰',
    navItem: { label: 'Aktuality', href: '/admin/prispevky/aktuality', iconName: 'Newspaper' },
    compatibleWith: 'all',
    core: true,
  },
  {
    id: 'media',
    label: 'Media & Galéria',
    description: 'Správa obrázkov, dokumentov a médií.',
    icon: '🖼',
    navItem: { label: 'Media / Galéria', href: '/admin/prispevky/media', iconName: 'Image' },
    compatibleWith: 'all',
    core: true,
  },
  {
    id: 'stranky',
    label: 'Stránky',
    description: 'Statické stránky s page builderom.',
    icon: '📄',
    compatibleWith: 'all',
    core: true,
  },

  // ── Všeobecné voliteľné ───────────────────────────────────────────────────
  {
    id: 'kalendar',
    label: 'Kalendár akcií',
    description: 'Podujatia, udalosti a termíny.',
    icon: '📅',
    navItem: { label: 'Kalendár akcií', href: '/admin/prispevky/kalendar', iconName: 'CalendarDays' },
    compatibleWith: 'all',
    core: false,
  },
  {
    id: 'galeria',
    label: 'Fotogaléria',
    description: 'Albumy a fotogalérie.',
    icon: '📷',
    navItem: { label: 'Fotogaléria', href: '/admin/prispevky/galeria', iconName: 'GalleryHorizontal' },
    compatibleWith: 'all',
    core: false,
  },

  // ── Obec / Mesto ─────────────────────────────────────────────────────────
  {
    id: 'uradna-tabula',
    label: 'Úradná tabuľa',
    description: 'Úradné oznámenia s legislatívnym archivovaním (min. 15 dní).',
    icon: '📋',
    navItem: { label: 'Úradná tabuľa', href: '/admin/prispevky/uradna-tabula', iconName: 'FileCheck' },
    compatibleWith: ['obec'],
    core: false,
  },
  {
    id: 'zastupitelstvo',
    label: 'Zastupiteľstvo',
    description: 'Zápisnice, uznesenia a zoznam poslancov.',
    icon: '🗳',
    navItem: { label: 'Zastupiteľstvo', href: '/admin/prispevky/zastupitelstvo', iconName: 'Landmark' },
    compatibleWith: ['obec'],
    core: false,
  },
  {
    id: 'zberny-dvor',
    label: 'Zberný dvor',
    description: 'Harmonogram odvozu odpadu a triedenie.',
    icon: '♻️',
    navItem: { label: 'Zberný dvor', href: '/admin/prispevky/zberny-dvor', iconName: 'Recycle' },
    compatibleWith: ['obec'],
    core: false,
  },
  {
    id: 'samosprava',
    label: 'Samospráva',
    description: 'Starosta, zástupca, komisie a kontakty.',
    icon: '👔',
    navItem: { label: 'Samospráva', href: '/admin/prispevky/samosprava', iconName: 'Users' },
    compatibleWith: ['obec'],
    core: false,
  },

  // ── Škola ─────────────────────────────────────────────────────────────────
  {
    id: 'rozvrh',
    label: 'Rozvrh hodín',
    description: 'Rozvrh tried a učiteľov.',
    icon: '🕐',
    navItem: { label: 'Rozvrh hodín', href: '/admin/prispevky/rozvrh', iconName: 'Clock' },
    compatibleWith: ['skola'],
    core: false,
  },
  {
    id: 'jedalny-listok',
    label: 'Jedálny lístok',
    description: 'Týždenné menu školskej jedálne.',
    icon: '🍽',
    navItem: { label: 'Jedálny lístok', href: '/admin/prispevky/jedalny-listok', iconName: 'UtensilsCrossed' },
    compatibleWith: ['skola'],
    core: false,
  },
  {
    id: 'pedagógovia',
    label: 'Pedagógovia',
    description: 'Triedni učitelia a vedenie školy.',
    icon: '👩‍🏫',
    navItem: { label: 'Pedagógovia', href: '/admin/prispevky/pedagogovia', iconName: 'GraduationCap' },
    compatibleWith: ['skola'],
    core: false,
  },
  {
    id: 'kruzky',
    label: 'Záujmové krúžky',
    description: 'Mimoškolské aktivity a krúžky.',
    icon: '🎨',
    navItem: { label: 'Záujmové krúžky', href: '/admin/prispevky/kruzky', iconName: 'Sparkles' },
    compatibleWith: ['skola'],
    core: false,
  },

  // ── Firma ─────────────────────────────────────────────────────────────────
  {
    id: 'tim',
    label: 'Náš tím',
    description: 'Profily členov tímu a zamestnancov.',
    icon: '👥',
    navItem: { label: 'Náš tím', href: '/admin/prispevky/tim', iconName: 'Users' },
    compatibleWith: ['firma', 'neziskovka'],
    core: false,
  },
  {
    id: 'referencie',
    label: 'Referencie',
    description: 'Zákazníci, referencie a case studies.',
    icon: '⭐',
    navItem: { label: 'Referencie', href: '/admin/prispevky/referencie', iconName: 'Star' },
    compatibleWith: ['firma'],
    core: false,
  },
  {
    id: 'cennik',
    label: 'Cenník',
    description: 'Cenové plány a balíčky.',
    icon: '💰',
    navItem: { label: 'Cenník', href: '/admin/prispevky/cennik', iconName: 'BadgeDollarSign' },
    compatibleWith: ['firma'],
    core: false,
  },

  // ── Neziskovka ────────────────────────────────────────────────────────────
  {
    id: 'projekty',
    label: 'Projekty',
    description: 'Prebiehajúce a ukončené projekty organizácie.',
    icon: '📁',
    navItem: { label: 'Projekty', href: '/admin/prispevky/projekty', iconName: 'FolderOpen' },
    compatibleWith: ['neziskovka'],
    core: false,
  },
  {
    id: 'dobrovolnici',
    label: 'Dobrovoľníci',
    description: 'Správa dobrovoľníkov a výzvy k zapojeniu.',
    icon: '🙋',
    navItem: { label: 'Dobrovoľníci', href: '/admin/prispevky/dobrovolnici', iconName: 'Heart' },
    compatibleWith: ['neziskovka'],
    core: false,
  },
]

export function getCompatiblePlugins(siteType: SiteType): Plugin[] {
  return PLUGINS.filter(
    p => p.compatibleWith === 'all' || p.compatibleWith.includes(siteType),
  )
}

export function getSiteTypeConfig(siteType: SiteType): SiteTypeConfig {
  return SITE_TYPES.find(s => s.id === siteType)!
}

export function getDefaultEnabledPlugins(siteType: SiteType): string[] {
  return getCompatiblePlugins(siteType)
    .filter(p => p.core || ['uradna-tabula', 'kalendar', 'rozvrh', 'jedalny-listok'].includes(p.id))
    .map(p => p.id)
}
