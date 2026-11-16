'use client';

import {useEffect,useRef,useState} from 'react';
import {localize} from '@/lib/localize';
import {useLocale} from '@/components/language';
import {Icon} from './site';

export default function ReadingPreview(){
  const locale=useLocale();
  const previewRef=useRef<HTMLDivElement>(null);
  const [light,setLight]=useState(true);
  const [autoPlay,setAutoPlay]=useState(true);
  const [inView,setInView]=useState(false);

  useEffect(()=>{
    const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
    const respectMotionPreference=()=>{
      if(motionPreference.matches) setAutoPlay(false);
    };
    respectMotionPreference();
    motionPreference.addEventListener('change',respectMotionPreference);

    const observer=new IntersectionObserver(([entry])=>{
      setInView(entry.isIntersecting && entry.intersectionRatio>=0.35);
    },{threshold:0.35});
    if(previewRef.current) observer.observe(previewRef.current);

    return ()=>{
      observer.disconnect();
      motionPreference.removeEventListener('change',respectMotionPreference);
    };
  },[]);

  useEffect(()=>{
    if(!autoPlay || !inView) return;
    const timer=window.setInterval(()=>{
      if(!document.hidden) setLight(current=>!current);
    },4000);
    return ()=>window.clearInterval(timer);
  },[autoPlay,inView]);

  function chooseTheme(nextLight:boolean){
    setAutoPlay(false);
    setLight(nextLight);
  }

  return localize(
    <div className="reading-preview" ref={previewRef}>
      <div className="preview-toolbar">
        <button
          type="button"
          className="preview-invite"
          aria-label="Switch the preview theme"
          aria-controls="reading-preview-article"
          onClick={()=>chooseTheme(!light)}
        >
          <span>Click to compare</span>
          <svg className="preview-hint-arrow" width="46" height="32" viewBox="0 0 56 36" fill="none" aria-hidden="true">
            <path d="M3 29C10 8 25 5 49 12M39 3L50 12L39 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="theme-switch" role="group" aria-label="Preview theme" onFocusCapture={()=>setAutoPlay(false)}>
          <button type="button" aria-pressed={!light} aria-controls="reading-preview-article" onClick={()=>chooseTheme(false)}>
            <Icon name="moon" size={19}/>Original
          </button>
          <button type="button" aria-pressed={light} aria-controls="reading-preview-article" onClick={()=>chooseTheme(true)}>
            <Icon name="sun" size={20}/>Light
          </button>
        </div>
      </div>
      <div className="preview-playback">
        <button
          type="button"
          className="preview-autoplay"
          aria-pressed={autoPlay}
          aria-label={autoPlay?'Pause automatic preview':'Start automatic preview'}
          onClick={()=>setAutoPlay(current=>!current)}
        >
          <Icon name={autoPlay?'pause':'play'} size={14}/>
          {autoPlay?'Auto demo · Pause':'Play demo'}
        </button>
      </div>
      <div className="preview-stack">
        <div className="preview-shadow-sheet" aria-hidden="true"><div className="shadow-lines"><i/><i/><i/></div></div>
        <article id="reading-preview-article" className={`sample-article ${light?'sample-light':'sample-dark'}`} aria-label="Illustrated article preview">
          <div className="sample-chrome"><span className="window-dots"><i/><i/><i/></span><span><Icon name="book" size={12}/> A READING PREVIEW</span><span>•••</span></div>
          <div className="sample-content">
            <p className="sample-kicker">THE WEEKLY NOTE</p>
            <h2>Make room for<br/><em>what matters.</em></h2>
            <p className="sample-byline">An illustrated reading sample · 4 min</p>
            <div className="sample-art" aria-label="An illustrated landscape whose colors stay the same in both themes"><div className="landscape-sun"/><div className="landscape-hill hill-one"/><div className="landscape-hill hill-two"/><span>A QUIETER PERSPECTIVE</span></div>
            <p>Sometimes, a small change makes all the difference. A clear page. A little breathing room. Space to follow a thought.</p>
            <p className="sample-last">Keep the words and images you came for. Choose a background that feels right for you.</p>
          </div>
        </article>
        <div className="preview-note"><Icon name="check" size={15}/>{light?'Light background. Same good words.':'Original background. Same good words.'}</div>
      </div>
      <p className="preview-caption">Interactive illustration · not a live Substack page</p>
    </div>,locale
  );
}
