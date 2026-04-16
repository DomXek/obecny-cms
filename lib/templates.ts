import { PageLayout } from '@/components/builder/types'

export interface Template {
  id: string
  name: string
  description: string
  preview: string // emoji or icon name
  layout: PageLayout
}

export const TEMPLATES: Template[] = [
  {
    id: 'obec-zakladna',
    name: 'Základná obec',
    description: 'Jednoduchý web pre obec s hero sekciou, textom a úradnou tabuľou.',
    preview: '🏛️',
    layout: {
      nav: {
        position: 'right',
        items: [
          { slug: 'domov', label: 'Domov' },
          { slug: 'o-obci', label: 'O obci' },
          { slug: 'uradna-tabula', label: 'Úradná tabuľa' },
          { slug: 'kontakt', label: 'Kontakt' },
        ],
      },
      hero: {
        height: 360,
        title: 'Vitajte v obci',
        subtitle: 'Oficiálna webová stránka obce',
      },
      sections: [
        {
          id: 'sec-uvod',
          columns: [{
            width: 100,
            widget: 'text',
            content: {
              html: '<h2>O našej obci</h2><p>Tu môžete napísať krátky úvod o vašej obci — história, počet obyvateľov, poloha. Kliknite na tento blok pre editáciu.</p>',
            },
          }],
        },
        {
          id: 'sec-tabula',
          columns: [{ width: 100, widget: 'notices' }],
        },
        {
          id: 'sec-aktuality',
          columns: [
            { width: 60, widget: 'news' },
            { width: 40, widget: 'events' },
          ],
        },
      ],
    },
  },
  {
    id: 'obec-rozsirena',
    name: 'Rozšírená obec',
    description: 'Kompletný web s galériou, dokumentmi a kontaktným formulárom.',
    preview: '🏗️',
    layout: {
      nav: {
        position: 'center',
        items: [
          { slug: 'domov', label: 'Domov' },
          { slug: 'o-obci', label: 'O obci' },
          { slug: 'uradna-tabula', label: 'Úradná tabuľa' },
          { slug: 'aktuality', label: 'Aktuality' },
          { slug: 'galeria', label: 'Galéria' },
          { slug: 'kontakt', label: 'Kontakt' },
        ],
      },
      hero: {
        height: 480,
        title: 'Vitajte v obci',
        subtitle: 'Moderná samospráva pre lepší život',
      },
      sections: [
        {
          id: 'sec-uvod',
          columns: [{
            width: 100,
            widget: 'text',
            content: {
              html: '<h2>O našej obci</h2><p>Stručný úvod o obci — história, počet obyvateľov a zaujímavosti.</p>',
            },
          }],
        },
        {
          id: 'sec-tabula-novinky',
          columns: [
            { width: 50, widget: 'notices' },
            { width: 50, widget: 'news' },
          ],
        },
        {
          id: 'sec-podujatia-gal',
          columns: [
            { width: 50, widget: 'events' },
            { width: 50, widget: 'gallery' },
          ],
        },
        {
          id: 'sec-dokumenty',
          columns: [{ width: 100, widget: 'documents' }],
        },
        {
          id: 'sec-kontakt',
          columns: [{ width: 100, widget: 'contact' }],
        },
      ],
    },
  },
  {
    id: 'mestska-cast',
    name: 'Mestská časť',
    description: 'Šablóna pre mestskú časť alebo väčšie mesto.',
    preview: '🏙️',
    layout: {
      nav: {
        position: 'left',
        items: [
          { slug: 'domov', label: 'Domov' },
          { slug: 'samosprava', label: 'Samospráva' },
          { slug: 'uradna-tabula', label: 'Úradná tabuľa' },
          { slug: 'aktuality', label: 'Aktuality' },
          { slug: 'projekty', label: 'Projekty' },
          { slug: 'kontakt', label: 'Kontakt' },
        ],
      },
      hero: {
        height: 420,
        title: 'Mestská časť',
        subtitle: 'Transparentná správa pre občanov',
      },
      sections: [
        {
          id: 'sec-vitajte',
          columns: [{
            width: 100,
            widget: 'text',
            content: {
              html: '<h2>Vitajte na stránkach mestskej časti</h2><p>Informácie o samospráve, úradných hodinách a aktuálnych projektoch pre obyvateľov.</p>',
            },
          }],
        },
        {
          id: 'sec-main',
          columns: [
            { width: 65, widget: 'news' },
            { width: 35, widget: 'notices' },
          ],
        },
        {
          id: 'sec-events-docs',
          columns: [
            { width: 50, widget: 'events' },
            { width: 50, widget: 'documents' },
          ],
        },
      ],
    },
  },
]
