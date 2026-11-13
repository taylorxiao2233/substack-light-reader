'use client';
import {createContext,useContext,useEffect} from 'react';
import {localizedHref, type Locale} from '@/lib/localize';

export const LanguageContext=createContext<Locale>('en');
export const useLocale=()=>useContext(LanguageContext);

export function LanguageDocument({locale}:{locale:Locale}){
  useEffect(()=>{document.documentElement.lang=locale==='zh'?'zh-CN':'en';},[locale]);
  return null;
}

export function LanguageSwitch(){
  const locale=useLocale();
  function select(next:Locale){if(next===locale)return;window.location.assign(localizedHref(window.location.pathname+window.location.search+window.location.hash,next));}
  return <div className="language-switch" role="group" aria-label={locale==='zh'?'网站语言':'Website language'}>
    <button type="button" lang="en" aria-pressed={locale==='en'} aria-label="Switch to English" onClick={()=>select('en')}>EN</button>
    <span aria-hidden="true"/>
    <button type="button" lang="zh-CN" aria-pressed={locale==='zh'} aria-label="切换为中文" onClick={()=>select('zh')}>中文</button>
  </div>;
}
