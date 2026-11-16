'use client';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { product } from '@/lib/product';
import {siteConfig} from '@/lib/site-config';
import {localize,localizedHref,translate,type Locale} from '@/lib/localize';
import {LanguageContext,LanguageDocument,LanguageSwitch,useLocale} from './language';

const paths: Record<string, ReactNode> = {
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
  moon: <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>,
  external: <><path d="M14 4h6v6m0-6L10 14"/><path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5"/></>,
  download: <><path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/></>,
  book: <path d="M12 6v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2Z"/>,
  copy: <><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/></>,
  folder: <path d="M3 7V4h6l2 3h10v3M3 7h18l-3 13H3Z"/>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
  close: <path d="m5 5 14 14M19 5 5 19"/>,
  refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 6a8 8 0 0 1 13 3M5 15a8 8 0 0 0 13 3"/></>,
  search: <><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></>,
  monitor: <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></>,
  chevron: <path d="m6 9 6 6 6-6"/>,
  file: <><path d="M5 2h9l5 5v15H5Z"/><path d="M14 2v6h5M8 12h8M8 16h8"/></>,
  puzzle: <path d="M4 4h5a3 3 0 1 1 6 0h5v5a3 3 0 1 0 0 6v5h-5a3 3 0 1 0-6 0H4v-5a3 3 0 1 1 0-6Z"/>,
};
export function Icon({ name, size = 20, className = '' }: { name: string; size?: number; className?: string }) { return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.sun}</svg>; }
export function Brand() { const locale=useLocale();return <a href={localizedHref('/',locale)} className="brand" aria-label={translate('Substack Light home',locale)}><img src="/brand-icon.svg" alt="" width="36" height="36"/><span>Substack <em>Light</em></span></a>; }
export function DownloadLink({ className = 'button button-dark', children }: { className?: string; children?: ReactNode }) { const locale=useLocale();return localize(<a className={className} href={product.downloads[0].url} download={product.downloads[0].name}><Icon name="download" size={18}/>{children || 'Download extension ZIP'}</a>,locale); }
export function SiteShell({ children,locale='en' }: { children: ReactNode;locale?:Locale }) {
  const path = usePathname().replace(/^\/zh(?=\/|$)/,'')||'/'; const [menuOpen, setMenuOpen] = useState(false);
  const links = [['/guide','Reading guide'],['/supported-sites','Supported sites'],['/help','Help']];
  return <LanguageContext.Provider value={locale}><LanguageDocument locale={locale}/><div lang={locale==='zh'?'zh-CN':'en'} data-site-locale={locale}>{localize(<><a className="skip-link" href="#main">Skip to content</a><header className="site-header"><div className="header-inner"><Brand/><nav className="desktop-nav" aria-label="Main navigation">{links.map(([href,label])=><a key={href} href={href} className={path===href?'active':''} aria-current={path===href?'page':undefined}>{label}</a>)}</nav><a href="/install" className="button nav-cta">Get the extension<Icon name="arrow" size={16}/></a><LanguageSwitch/><button className="mobile-menu-button" aria-label={menuOpen?'Close navigation':'Open navigation'} aria-expanded={menuOpen} onClick={()=>setMenuOpen(!menuOpen)}><Icon name={menuOpen?'close':'menu'}/></button></div>{menuOpen&&<nav className="mobile-nav" aria-label="Mobile navigation">{links.map(([href,label])=><a key={href} href={href} onClick={()=>setMenuOpen(false)}>{label}</a>)}<a href="/install" onClick={()=>setMenuOpen(false)}>Installation guide</a></nav>}</header><main id="main">{children}</main><footer className="site-footer"><div className="container footer-top"><div><Brand/><p>A little more light.<br/>The same good words.</p></div><div className="footer-links"><div><span>THE PRODUCT</span><a href="/install">Install Substack Light</a><a href="/guide">Reading guide</a><a href="/supported-sites">Supported sites</a></div><div><span>THE DETAILS</span><a href="/help">Help & updates</a><a href={'mailto:'+siteConfig.supportEmail}>Email support</a><a href="/privacy">Privacy</a><a href={siteConfig.repositoryUrl} target="_blank" rel="noopener noreferrer">Source code on GitHub</a><a href="/downloads/LICENSE">MIT license</a><a href={siteConfig.creatorXUrl} target="_blank" rel="noopener noreferrer">Creator on X</a></div><div><span>THE RELEASE</span><a href={product.downloads[0].url} download>Extension v{product.version}</a><a href={product.downloads[1].url} download>Userscript v{product.userscriptVersion}</a><a href="/downloads/SHA256SUMS.txt">Download checksums</a></div></div></div><div className="container footer-bottom"><span>© 2026 Substack Light · An independent project.</span><span>Not affiliated with or endorsed by Substack.</span></div></footer></>,locale)}</div></LanguageContext.Provider>;
}
export function Eyebrow({children}:{children:ReactNode}) {return <p className="eyebrow"><span className="tiny-sun"/>{children}</p>;}
export function PageIntro({eyebrow,title,children}:{eyebrow:string;title:ReactNode;children:ReactNode}) {return <header className="page-intro container"><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><div className="intro-copy">{children}</div></header>;}
export function CallToAction(){const locale=useLocale();return localize(<section className="closing-cta container"><div><span className="section-kicker">READY WHEN YOU ARE</span><h2>Your next read,<br/><em>a little lighter.</em></h2></div><div><a className="button button-dark" href="/install">Install Substack Light<Icon name="arrow" size={18}/></a><p>Chrome desktop · Free download · Manual installation</p></div></section>,locale);}
export function External({href,children}:{href:string;children:ReactNode}){return <a className="text-link" href={href} target="_blank" rel="noreferrer">{children}<Icon name="external" size={14}/></a>;}
export function CopyButton({text,label='Copy',className='copy-button'}:{text:string;label?:string;className?:string}) {const locale=useLocale();
  const [status,setStatus]=useState('');
  async function copy(){try{await navigator.clipboard.writeText(text);setStatus('Copied');}catch{setStatus('Copy unavailable. Select the text and copy it.');}}
  return localize(<span className="copy-control"><button className={className} onClick={copy}><Icon name={status==='Copied'?'check':'copy'} size={16}/>{status==='Copied'?'Copied':label}</button><span className="sr-only" role="status">{status}</span>{status.startsWith('Copy unavailable')&&<small className="copy-error">{status}</small>}</span>,locale);
}
export function Accordion({items}:{items:{question:string;answer:ReactNode}[]}){const locale=useLocale();return localize(<div className="accordion">{items.map(item=><details key={item.question}><summary>{item.question}<Icon name="chevron" size={18}/></summary><div className="answer">{item.answer}</div></details>)}</div>,locale);}
