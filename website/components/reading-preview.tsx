'use client';
import {localize,translate} from '@/lib/localize';
import {useLocale} from '@/components/language';

import {useState} from 'react';
import {Icon} from './site';
export default function ReadingPreview(){
 const locale=useLocale();

  const [light,setLight]=useState(true);
  return localize(<div className="reading-preview"><div className="preview-toolbar"><span>SEE THE DIFFERENCE</span><div className="theme-switch" aria-label="Preview theme"><button aria-pressed={!light} onClick={()=>setLight(false)}><Icon name="moon" size={15}/>Original</button><button aria-pressed={light} onClick={()=>setLight(true)}><Icon name="sun" size={16}/>Light</button></div></div><div className="preview-stack"><div className="preview-shadow-sheet" aria-hidden="true"><div className="shadow-lines"><i/><i/><i/></div></div><article className={`sample-article ${light?'sample-light':'sample-dark'}`} aria-label="Illustrated article preview"><div className="sample-chrome"><span className="window-dots"><i/><i/><i/></span><span><Icon name="book" size={12}/> A READING PREVIEW</span><span>•••</span></div><div className="sample-content"><p className="sample-kicker">THE WEEKLY NOTE</p><h2>Make room for<br/><em>what matters.</em></h2><p className="sample-byline">An illustrated reading sample · 4 min</p><div className="sample-art" aria-label="An illustrated landscape whose colors stay the same in both themes"><div className="landscape-sun"/><div className="landscape-hill hill-one"/><div className="landscape-hill hill-two"/><span>A QUIETER PERSPECTIVE</span></div><p>Sometimes, a small change makes all the difference. A clear page. A little breathing room. Space to follow a thought.</p><p className="sample-last">Keep the words and images you came for. Choose a background that feels right for you.</p></div></article><div className="preview-note"><Icon name="check" size={15}/>{light?'Light background. Same good words.':'Original background. Same good words.'}</div></div><p className="preview-caption">Interactive illustration · not a live Substack page</p></div>,locale);
}
