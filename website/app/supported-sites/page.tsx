import {localize,type Locale} from '@/lib/localize';
import type {Metadata} from 'next';
import {SiteShell,PageIntro,CallToAction} from '@/components/site';
import SiteCatalog from '@/components/site-catalog';
export const metadata:Metadata={alternates:{canonical:"/supported-sites",languages:{en:"/supported-sites",'zh-CN':"/zh/supported-sites",'x-default':"/supported-sites"}},title:'Supported publications & pages',description:'See which Substack publication domains are included in Substack Light Reader and what is outside its reading scope.'};
export default function Supported({locale='en'}:{locale?:Locale} = {}){return localize(<SiteShell locale={locale}><PageIntro eyebrow="A CLEAR SENSE OF SCOPE" title={<>Where the light<br/><em>comes on.</em></>}><p>Built for Substack publication reading pages, including selected custom domains. Here’s what the current version includes.</p></PageIntro><SiteCatalog/><CallToAction/></SiteShell>,locale);}
