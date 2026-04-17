import { SiteStyle, buildCssVars, buildFontUrl } from '@/lib/siteStyle'

export default function StyleInjector({ style }: { style: SiteStyle }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={buildFontUrl(style)} />
      <style>{`:root{${buildCssVars(style)}}`}</style>
    </>
  )
}
