import { cloneElement, isValidElement, type ReactNode, type ReactElement } from 'react';
import { zh } from './translations';

export type Locale = 'en' | 'zh';

export function translate(text: string, locale: Locale): string {
  if (locale === 'en') return text;
  const key = text.trim().replace(/\s+/g, ' ');
  const replacement = zh[key];
  if (replacement !== undefined) return text.replace(text.trim(), replacement);
  const step = key.match(/^Mark step (\d+) (incomplete|complete)$/);
  if (step) return `将第 ${step[1]} 步标记为${step[2] === 'complete' ? '已完成' : '未完成'}`;
  return text;
}

export function localizedHref(href: string, locale: Locale): string {
  if (!href.startsWith('/') || href.startsWith('//') || /^\/(downloads|favicon|brand-icon|_next)(\/|\.|$)/.test(href)) return href;
  const base = href.replace(/^\/zh(?=\/|[?#]|$)/, '') || '/';
  if (locale === 'en') return base.startsWith('/') ? base : '/' + base;
  return '/zh' + (base === '/' ? '' : base.startsWith('/') ? base : '/' + base);
}

// Translate React content, not live DOM. Classes, user input and download names are preserved.
export function localize(node: ReactNode, locale: Locale): ReactNode {
  if (Array.isArray(node)) return node.map(child => localize(child, locale));
  if (typeof node === 'string') return translate(node, locale);
  if (!isValidElement(node)) return node;
  const element = node as ReactElement<Record<string, unknown>>;
  const props = { ...element.props };
  for (const field of ['children', 'title', 'eyebrow', 'label', 'question', 'answer', 'aria-label', 'placeholder', 'alt']) {
    if (props[field] !== undefined) props[field] = localize(props[field] as ReactNode, locale);
  }
  if (typeof props.href === 'string') props.href = localizedHref(props.href, locale);
  if (Array.isArray(props.items)) props.items = props.items.map(item => ({ ...item, question: translate(item.question, locale), answer: localize(item.answer, locale) }));
  return cloneElement(element, props);
}
