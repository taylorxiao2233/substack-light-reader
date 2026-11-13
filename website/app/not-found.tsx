import {localize,type Locale} from '@/lib/localize';
import {SiteShell,PageIntro} from '@/components/site';
export default function NotFound({locale='en'}:{locale?:Locale} = {}){return localize(<SiteShell locale={locale}><PageIntro eyebrow="A SMALL DETOUR" title="This page isn’t here."><p>Let’s get you back to a lighter read.</p><a className="button button-dark" href="/">Back to home</a></PageIntro></SiteShell>,locale);}
