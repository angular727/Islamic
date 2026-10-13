import { Injectable, OnDestroy, effect, inject, untracked } from '@angular/core';
import { SettingsService } from './settings.service';
import { TranslateService } from './translate.service';

const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
/** Never translated: code, form fields, SVG, and anything marked translate="no" (Quran, Hadith, Dua text, names…). */
const SKIP = '[translate="no"], .notranslate, script, style, textarea, code, pre, svg, [data-no-i18n], .translit, .urdu, .arabic, .arabic-plain, .trans, .chip.gold, .tp-list, .ncard';
/** Authored teaching text; translated only when the reader switches on "Translate lesson text". */
const CONTENT = '[data-content]';
const ARABIC_SCRIPT = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;
const HAS_LETTER = /\p{L}/gu;

interface Meta { orig: string; shown: string }
interface Piece { node: Text | Element; attr?: string; orig: string; lead: string; trail: string; core: string; nums: string[] }

/**
 * Translates the whole interface without touching individual components: it reads every piece of visible text
 * (and placeholders, tooltips and labels), translates it with TranslateService and writes it back. New or changed
 * text (pages, dialogs, toasts, API content) is picked up automatically by a MutationObserver. Switching back to
 * English restores the original text.
 */
@Injectable({ providedIn: 'root' })
export class DomTranslator implements OnDestroy {
  private settings = inject(SettingsService);
  private tr = inject(TranslateService);
  private textMeta = new WeakMap<Text, Meta>();
  private attrMeta = new WeakMap<Element, Map<string, Meta>>();
  private observer?: MutationObserver;
  private started = false;

  start() {
    if (this.started) return;
    this.started = true;
    this.observer = new MutationObserver(muts => this.onMutations(muts));
    this.observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    // Re-run whenever the language or the content option changes.
    effect(() => {
      const lang = this.settings.s().lang; this.settings.s().translateContent;
      untracked(() => this.refresh(lang));
    });
  }

  ngOnDestroy() { this.observer?.disconnect(); this.started = false; }

  private get contentOn() { return !!this.settings.s().translateContent; }

  async refresh(lang = this.tr.lang) {
    if (!this.tr.isSource(lang)) await this.tr.load(lang);
    if (!this.contentOn) this.restoreContent();
    this.process(document.body);
  }

  // ------------------------------------------------------------------ mutations
  private onMutations(muts: MutationRecord[]) {
    const roots = new Set<Node>();
    for (const m of muts) {
      if (m.type === 'childList') m.addedNodes.forEach(n => roots.add(n));
      else if (m.type === 'characterData') {
        const meta = this.textMeta.get(m.target as Text);
        if (!meta || meta.shown !== (m.target as Text).nodeValue) roots.add(m.target);   // not our own write
      } else if (m.type === 'attributes') {
        const el = m.target as Element, meta = this.attrMeta.get(el)?.get(m.attributeName!);
        if (!meta || meta.shown !== el.getAttribute(m.attributeName!)) roots.add(el);
      }
    }
    roots.forEach(r => this.process(r));
  }

  // ------------------------------------------------------------------ processing
  private process(root: Node) {
    const lang = this.tr.lang;
    const source = this.tr.isSource(lang);
    const pieces: Piece[] = [];
    this.collect(root, pieces, source);

    if (source) { for (const p of pieces) this.write(p, p.orig); return; }       // back to English

    const misses: Piece[] = [];
    for (const p of pieces) {
      const hit = this.tr.cached(p.core, lang);
      if (hit !== undefined) this.writeTranslated(p, hit); else misses.push(p);
    }
    if (!misses.length) return;
    // Until their translation arrives (or if it never does) these show the original text, never another language's.
    for (const p of misses) this.write(p, p.orig);
    const unique = [...new Set(misses.map(p => p.core))];
    this.tr.many(unique, lang).then(() => {
      if (this.tr.lang !== lang) return;                                          // language changed meanwhile
      for (const p of misses) {
        const hit = this.tr.cached(p.core, lang);
        if (hit !== undefined && this.isCurrent(p)) this.writeTranslated(p, hit);
      }
    });
  }

  private collect(root: Node, out: Piece[], source: boolean) {
    if (root.nodeType === Node.TEXT_NODE) { this.addText(root as Text, out, source); return; }
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    const el = root as Element;
    if (this.excluded(el)) return;
    this.addAttrs(el, out, source);
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (n.nodeType === Node.TEXT_NODE) { if (!this.excluded(n.parentElement)) this.addText(n as Text, out, source); }
      else this.addAttrs(n as Element, out, source);
    }
  }

  private excluded(el: Element | null): boolean {
    if (!el) return true;
    if (el.closest(SKIP)) return true;
    return !this.contentOn && !!el.closest(CONTENT);
  }

  private addText(node: Text, out: Piece[], source: boolean) {
    if (this.excluded(node.parentElement)) return;
    const meta = this.textMeta.get(node);
    const current = node.nodeValue ?? '';
    // If this node still shows what we wrote, the original is the stored one; otherwise it is new text.
    const orig = meta && meta.shown === current ? meta.orig : current;
    const piece = this.piece(node, undefined, orig);
    if (piece) out.push(piece);
    else if (meta && meta.shown === current && source) out.push({ node, orig, lead: '', trail: '', core: '', nums: [] });
  }

  private addAttrs(el: Element, out: Piece[], source: boolean) {
    if (this.excluded(el)) return;
    for (const a of ATTRS) {
      const value = el.getAttribute(a);
      if (value == null) continue;
      const meta = this.attrMeta.get(el)?.get(a);
      const orig = meta && meta.shown === value ? meta.orig : value;
      const piece = this.piece(el, a, orig);
      if (piece) out.push(piece);
      else if (meta && meta.shown === value && source) out.push({ node: el, attr: a, orig, lead: '', trail: '', core: '', nums: [] });
    }
  }

  /** Splits a text into surrounding whitespace and the part to translate, with numbers replaced by {0}, {1}… */
  private piece(node: Text | Element, attr: string | undefined, orig: string): Piece | null {
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(orig)!;
    const raw = m[2].replace(/\s+/g, ' ');
    if (!raw) return null;
    const nums: string[] = [];
    const core = raw.replace(/\d+(?:[.,:/]\d+)*/g, d => { nums.push(d); return `{${nums.length - 1}}`; });
    if ((core.replace(/\{\d+\}/g, '').match(HAS_LETTER) ?? []).length < 2) return null;   // numbers, times, symbols, single letters
    if (ARABIC_SCRIPT.test(core)) return null;                                   // authored Arabic / Urdu text stays as written
    if (core.length > 600) return null;                                          // long prose is not machine-translated here
    return { node, attr, orig, lead: m[1], trail: m[3], core, nums };
  }

  /** True while the node still holds the text this piece was read from (it may have been re-rendered meanwhile). */
  private isCurrent(p: Piece) {
    if (p.attr) {
      const el = p.node as Element, cur = el.getAttribute(p.attr);
      return el.isConnected && (cur === p.orig || cur === this.attrMeta.get(el)?.get(p.attr)?.shown);
    }
    const t = p.node as Text;
    return t.isConnected && (t.nodeValue === p.orig || t.nodeValue === this.textMeta.get(t)?.shown);
  }

  /** Puts English back inside "lesson text" areas when the option is switched off. */
  private restoreContent() {
    document.querySelectorAll(CONTENT).forEach(root => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (n.nodeType === Node.TEXT_NODE) {
          const t = n as Text, m = this.textMeta.get(t);
          if (m && m.shown === t.nodeValue) { t.nodeValue = m.orig; this.textMeta.delete(t); }
        } else {
          const el = n as Element, metas = this.attrMeta.get(el);
          metas?.forEach((m, a) => { if (el.getAttribute(a) === m.shown) el.setAttribute(a, m.orig); });
          this.attrMeta.delete(el);
        }
      }
    });
  }

  private writeTranslated(p: Piece, translated: string) {
    let text = translated;
    if (p.nums.length) {
      // Put the original numbers back; if the provider dropped a placeholder, keep the English text.
      for (let i = 0; i < p.nums.length; i++) { if (!text.includes(`{${i}}`)) { this.write(p, p.orig); return; } text = text.split(`{${i}}`).join(p.nums[i]); }
    }
    this.write(p, p.lead + text + p.trail, p.orig);
  }

  private write(p: Piece, value: string, orig = p.orig) {
    if (p.attr) {
      const el = p.node as Element;
      if (el.getAttribute(p.attr) !== value) el.setAttribute(p.attr, value);
      (this.attrMeta.get(el) ?? this.attrMeta.set(el, new Map()).get(el)!).set(p.attr, { orig, shown: value });
    } else {
      const t = p.node as Text;
      if (t.nodeValue !== value) t.nodeValue = value;
      this.textMeta.set(t, { orig, shown: value });
    }
  }
}
