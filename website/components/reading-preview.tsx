'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import {localize} from '@/lib/localize';
import {readingExample} from '@/lib/reading-example';
import {useLocale} from '@/components/language';
import {Icon} from './site';

export default function ReadingPreview(){
  const locale=useLocale();
  const previewRef=useRef<HTMLDivElement>(null);
  const [light,setLight]=useState(true);
  const [autoPlay,setAutoPlay]=useState(true);
  const [inView,setInView]=useState(false);
  const [pointerInside,setPointerInside]=useState(false);
  const [focusInside,setFocusInside]=useState(false);
  const [imagesReady,setImagesReady]=useState(false);

  const checkImagesReady=useCallback(()=>{
    const images=previewRef.current?.querySelectorAll<HTMLImageElement>('.preview-capture-image');
    if(images?.length===2 && Array.from(images).every(image=>image.complete && image.naturalWidth>0)){
      setImagesReady(true);
    }
  },[]);

  useEffect(()=>{
    checkImagesReady();
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
  },[checkImagesReady]);

  useEffect(()=>{
    if(!autoPlay || !inView || !imagesReady || pointerInside || focusInside) return;
    const timer=window.setInterval(()=>{
      if(!document.hidden) setLight(current=>!current);
    },4000);
    return ()=>window.clearInterval(timer);
  },[autoPlay,inView,imagesReady,pointerInside,focusInside]);

  function chooseTheme(nextLight:boolean){
    setAutoPlay(false);
    setLight(nextLight);
  }

  return localize(
    <div
      className="reading-preview"
      ref={previewRef}
      onPointerEnter={event=>{if(event.pointerType==='mouse') setPointerInside(true);}}
      onPointerLeave={()=>setPointerInside(false)}
      onPointerDown={event=>{if(event.pointerType==='touch') setAutoPlay(false);}}
      onFocusCapture={()=>setFocusInside(true)}
      onBlurCapture={event=>{
        if(!event.currentTarget.contains(event.relatedTarget as Node|null)) setFocusInside(false);
      }}
    >
      <div className="preview-toolbar">
        <div className="preview-invite">
          <span>Click to compare</span>
          <svg className="preview-hint-arrow" width="46" height="32" viewBox="0 0 56 36" fill="none" aria-hidden="true">
            <path d="M3 29C10 8 25 5 49 12M39 3L50 12L39 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="theme-switch" role="group" aria-label="Preview theme">
          <button type="button" aria-pressed={!light} aria-controls="reading-preview-article" onClick={()=>chooseTheme(false)}>
            <Icon name="moon" size={19}/>Original
          </button>
          <button type="button" aria-pressed={light} aria-controls="reading-preview-article" onClick={()=>chooseTheme(true)}>
            <Icon name="sun" size={20}/>Light
          </button>
        </div>
      </div>
      <p className="preview-interaction-hint"><span className="preview-hover-hint">Auto preview · Hover to pause</span><span className="preview-touch-hint">Tap a theme to compare</span></p>
      <div className="preview-stack">
        <div id="reading-preview-article" className={`sample-article preview-real-shot ${light?'sample-light':'sample-dark'}`} aria-label="Substack screenshot comparison">
          <div className="preview-capture-viewport">
            <img
              className="preview-capture-image capture-original"
              src={readingExample.original.src}
              width={readingExample.original.width}
              height={readingExample.original.height}
              alt="Dan Koe's Substack article with its original dark background"
              aria-hidden={light}
              decoding="async"
              loading="eager"
              onLoad={checkImagesReady}
            />
            <img
              className="preview-capture-image capture-light"
              src={readingExample.light.src}
              width={readingExample.light.width}
              height={readingExample.light.height}
              alt="The same Substack article with Substack Light enabled"
              aria-hidden={!light}
              decoding="async"
              loading="eager"
              fetchPriority="high"
              onLoad={checkImagesReady}
            />
          </div>
        </div>
        <div className="preview-note"><Icon name={light?'sun':'moon'} size={15}/>{light?'With Substack Light':'Original Substack theme'}</div>
      </div>
      <p className="preview-caption preview-source">Real Substack screenshots · <a href={readingExample.sourceUrl} target="_blank" rel="noopener noreferrer">{readingExample.publication}<Icon name="external" size={11}/></a></p>
    </div>,locale
  );
}
