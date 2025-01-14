/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */
import { GSDOM } from './GSDOM.mjs';
import { GSEvents } from './GSEvents.mjs';
import { GSDOMObserver } from './GSDOMObserver.mjs';
import { GSCacheStyles } from './GSCacheStyles.mjs';

const adoptedId = Symbol();
const observer = Symbol();

/**
 * Monitor HTMLStyleElement & HTMLLinkElement (of type stylesheet) for changes.
 * Every such element marked with data-adoptable="true" will be cached and
 * will trigger gs-adopted event to notify component controller to update adoptableStyleSheet list
 */
export class GSAdoptedEngine {

  static #timerID = 0;
  static #ID = Date.now();
  static #scheduled = false;

  static #init() {
    const me = GSAdoptedEngine;
    me.observe(document.head);
    me.#preload();
    me.#timerID = setInterval(() => me.#adopt(), me.timeout);
  }

  static #clear() {
    const me = GSAdoptedEngine;
    clearInterval(me.#timerID);
    me.#timerID = undefined;
  }

  static #adopt() {
    const me = GSAdoptedEngine;
    const sheets = me.#adoptable;
    if (sheets.length == 0) return me.#clear();
    sheets.map(s => me.#adoptSheet(s));
    me.update();
  }

  static update() {
    const me = GSAdoptedEngine;
    if (me.#scheduled) return;
    me.#scheduled = true;
    queueMicrotask(() => {
      requestAnimationFrame(() => {
        try {
          document.adoptedStyleSheets = me.#sorted;
          document.adoptedStyleSheets.id = ++me.#ID;
        } finally {
          me.#scheduled = false;
          globalThis.dispatchEvent(new CustomEvent('gs-adopted'));
        }
      });
    });
  }

  static #asText(sheet) {
    return Object.values(sheet.cssRules).map(o => o.cssText).join('');
  }

  static #adoptLink(el) {
    const me = GSAdoptedEngine;
    GSAdoptedEngine.#monitorAttributes(el);
    Array.from(document.styleSheets).filter(s => s.ownerNode === el).map(s => me.#adoptSheet(s));
  }

  static #adoptSheet(sheet) {
    const me = GSAdoptedEngine;
    const style = me.#asText(sheet);
    return me.#adoptStyle(sheet.ownerNode, style);
  }

  static #adoptStyle(ownerNode, style) {
    const me = GSAdoptedEngine;
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(style);
    sheet.id = ++me.#ID;
    ownerNode[adoptedId] = sheet.id;
    me.#store(ownerNode, sheet);
    return sheet;
  }

  static #store(ownerNode, sheet) {
    GSCacheStyles.set(sheet.id, sheet);
  }

  static #remove(ownerNode, sheet) {
    GSCacheStyles.remove(sheet.id);
    ownerNode[observer]?.disconnect?.();
    ownerNode[observer] = undefined;
  }

  static get #sorted() {
    return GSCacheStyles.styles;
  }

  /**
   * List of adoptable styles or links. Filter only those with dataset.adoptable=true
   * @returns {HTMLStyleElement|HTMLLinkElement}
   */
  static get #adoptable() {
    return Object.values(document.styleSheets)
      .filter(o => o.ownerNode)
      .filter(o => o.ownerNode.dataset.adoptable)
      .filter(o => !o.ownerNode[adoptedId]);
  }

  static #preload() {
    GSDOM.queryAll(document.head, 'link[rel="preload"][as="style"]')
    .forEach(el => {
      el.remove();
      document.head.appendChild(el);
    });
  }

  static #onAttributeChange(mutationList) {
    mutationList.forEach((mutation) => {
       const id = mutation.target[adoptedId];
       const style = GSCacheStyles.get(id);
       if(style) style.disabled = mutation.target.hasAttribute('disabled');
    });
    GSAdoptedEngine.update();
  }
  
  static #monitorAttributes(element) {
    const me = GSAdoptedEngine;
    const callback = me.#onAttributeChange.bind(me);
    const observer = new MutationObserver(callback);
    observer.observe(element, {
      attributeFilter: ["disabled"],
      attributeOldValue: true,
      subtree: false,
    });
    return observer;
  }
  
  /**
   * Filter style and link(css) elements which will be shared
   * with all web componentes. Filter only those marked with data-adoptable
   * @param {HTMLElement} el 
   * @returns {Boolean} Return true if monotired element is selected for further processing
   */
  static #onMonitorFilter(el) {
    return (Boolean(el.dataset?.adoptable))
      && (
        (el instanceof HTMLLinkElement && (el.rel === 'stylesheet' || el.as === "style"))
        || el instanceof HTMLStyleElement
      );
  }

  /**
   * When style added to the HTML page, attach it to the WebComponents
   * @param {HTMLStyleElement|HTMLLinkElement} el 
   */
  static #onMonitorConnect(el) {
    const me = GSAdoptedEngine;
    if (el instanceof HTMLStyleElement) {
      me.#adoptStyle(el, el.innerText);
      me.update();
    } else if (el instanceof HTMLLinkElement) {
      GSEvents.wait(el, 'load', 0, false).then(e => {
        if (el.rel === 'preload') return el.rel = "stylesheet";
        me.#adoptLink(e.target);
        me.update();
      });
    }
  }

  /**
   * When style removed, remove from adoptable and update
   * @param {HTMLElement} el 
   */
  static #onMonitorDisconnect(el) {
    const me = GSAdoptedEngine;
    me.#sorted.filter(o => o.id === el[adoptedId])
          .forEach(o => me.#remove(el, o));
    me.update();
  }

  /**
   * Observe DOM tree from mutations
   * @param {HTMLElement} owner Root element to watch DOM tree from 
   */
  static observe(owner) {
    const me = GSAdoptedEngine;
    GSDOMObserver.registerFilter(me.#onMonitorFilter, me.#onMonitorConnect, false, owner);
    GSDOMObserver.registerFilter(me.#onMonitorFilter, me.#onMonitorDisconnect, true, owner);
  }

  static {
    this.#init();
  }

}  
