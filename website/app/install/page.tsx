import {localize,type Locale} from '@/lib/localize';
import type { Metadata } from 'next';
import {SiteShell,PageIntro} from '@/components/site';
import InstallGuide from '@/components/install-guide';
export const metadata:Metadata={alternates:{canonical:"/install",languages:{en:"/install",'zh-CN':"/zh/install",'x-default':"/install"}},title:'Install Substack Light — every step',description:'Download Substack Light Reader and follow the full Chrome manual-installation or Tampermonkey userscript guide.'};
export default function Install({locale='en'}:{locale?:Locale} = {}){return localize(<SiteShell locale={locale}><PageIntro eyebrow="LET’S GET YOU SET UP" title={<>A few steps.<br/><em>Then, just read.</em></>}><p>Install directly in desktop Chrome. This version is not available in the Chrome Web Store.<br/>Choose one version below. We’ll walk you through it.</p></PageIntro><InstallGuide/></SiteShell>,locale);}
