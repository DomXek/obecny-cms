import { loadFooterConfig } from '@/lib/loadFooter'
import FooterEditor from './FooterEditor'

export const dynamic = 'force-dynamic'

export default async function FooterPage() {
  const footer = await loadFooterConfig()
  return <FooterEditor initial={footer} />
}
