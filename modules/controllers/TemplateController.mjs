/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSUtil } from "../base/GSUtil.mjs";
import { GSTemplateCache } from "../base/GSTemplateCache.mjs";
import { GSDOM } from "../base/GSDOM.mjs";

// internal hidden flag to prevent double injection
const RENDER_SYMBOL = Symbol.for("GS-TEMPLATE-RENDER");

/**
 * Handle element template and signal rerender when ready
 * Sequencial template load is used to prevent multiple request for the same URL
 */
export class TemplateController {

  #host;
  #template;
  #lastRef;

  static #scheduled = false;
  static #tasks = new Set();
  static #cache = new Map();
  static #refs = new Set();

  static get isPrefetch() {
    return globalThis.GS_TEMPLATE_PREFETCH || false;
  }

  constructor(host) {
    const me = this;
    me.#host = host;
    host[RENDER_SYMBOL] = false;
    host.addController(this);
  }

  // inherited
  hostConnected() {
    const me = this;
    /* 
    if(TemplateController.isPrefetch) {
      me.hostUpdate();
    }
    */
  }

  // inherited
  hostDisconnected() {
    const me = this;
    me.#host.removeController(me);
    delete me.#host[RENDER_SYMBOL];
    me.#host = null;
    me.#lastRef = null;
    me.#template = null;
  }

  // inherited
  hostUpdate() {
    const me = this;
    if (me.#template) return;
    const ref = me.templateRef;
    if (me.#lastRef !== ref) {
      const template = TemplateController.#cache.get(me.#toKey(ref));
      if (GSUtil.isJsonType(template)) me.#applyTemplate(template);
      me.#lastRef = ref;
      if (ref && !me.#template) {
        TemplateController.#schedule(me);
      }
    }
  }

  // inherited
  hostUpdated() {
    const me = this;
    if (me.#template) {
      const host = me.#host;
      //me.hostDisconnected();
      host.removeController(me);
      host.templateInjected?.();
      queueMicrotask(()=> me.hostDisconnected());
    }

  }

  #toKey(ref) {
    const me = this;
    return GSUtil.isString(ref) ? `${ref}@${me.#host?.tagName || ''}` : ref;
  }

  #hasKey(key) {
    return TemplateController.#refs.has(key) || TemplateController.#cache.has(key);
  }

  // applly template opts {simple, slots}
  #applyTemplate({ simple, slots }) {

    // is template does not contain slots
    const me = this;
    if (!me.#host) return;

    const hasSlots = GSDOM.isTemplateElement(slots);
    const hasSimple = GSDOM.isTemplateElement(simple);

    let signal = true;

    if (hasSlots) {
      // slot elements must be added only once 
      if (me.#host[RENDER_SYMBOL] === false) {
        me.#host[RENDER_SYMBOL] = true;
        const clone = slots.cloneNode(true);
        Array.from(clone.content.children).forEach(el => me.#host.appendChild(el));
      }
    }

    if (hasSimple) {
      if (simple.content.childElementCount > 0) {
        signal = false;
        me.#template = simple.cloneNode(true);
        me.#host.requestUpdate();
      }
    }

    if (signal) me.#host.templateInjected?.();

  }

  // separate first level nodes into sloted nodes and plain shadow injectable node 
  #preprocessTemplate(template) {
    let templateSimple = null;
    let templateSlots = null;
    const slots = Array.from(template.content.children).filter(el => el.hasAttribute('slot'));
    const hasSlots = slots.length > 0;
    const hasSimple = template.content.childElementCount > slots.length;
    if (hasSlots) {
      if (hasSimple) {
        templateSlots = document.createElement('template');
        slots.forEach(el => templateSlots.content.appendChild(el));
      } else {
        templateSlots = template;
      }
    }
    templateSimple = hasSimple && template?.content.childElementCount > 0 ? template : null;
    templateSlots = hasSlots && templateSlots?.content.childElementCount > 0 ? templateSlots : null;
    // cache copy for page inejcted tempkates as they might be cleared elswhere
    templateSimple = templateSimple?.isConnected ? templateSimple.cloneNode(true) : templateSimple;
    return { simple: templateSimple, slots: templateSlots };
  }

  async #load() {

    const me = this;
    const ref = me.templateRef;
    
    if (!ref) return;
    const key = me.#toKey(ref);

    // prevents double load
    if (me.#hasKey(key)) {
      // already scheduled
      return;
    }
    TemplateController.#refs.add(key);

    let templates = null;

    const isTplEl = GSDOM.isTemplateElement(ref);
    const cacheable = GSUtil.isString(ref);
    if (cacheable) {
      templates = TemplateController.#cache.get(key);
    }

    if (!templates) {
      
      try {
        const template = isTplEl ? ref : await GSTemplateCache.loadTemplate(true, ref, ref);
        templates = me.#preprocessTemplate(template);
      } catch (err) {
        TemplateController.#refs.delete(key);
        throw err;
      }

      if (cacheable) {
        if (templates.simple) templates.simple.dataset.gsCache = true;
        TemplateController.#cache.set(key, templates);
      }
    }
    
    TemplateController.#refs.delete(key);
    me.#applyTemplate(templates);
  }

  get isTemplateElement() {
    return this.#host?.tagName === 'GS-TEMPLATE';
  }

  get template() {
    return this.#template;
  }

  get templateRef() {
    return GSDOM.templateRef(this.#host);
  }

  static async #process(tasks) {
    const list = Array.from(tasks);
    for (let item of list) {
      await item.#load();
      tasks.delete(item);
    }
  }

  static #schedule(task) {
    const me = TemplateController;
    me.#tasks.add(task);
    if (!me.#scheduled) {
      me.#scheduled = true;
      queueMicrotask(() => me.#process(me.#tasks).finally(me.#scheduled = false));
    }
  }

  static clear() {
    GSTemplateCache.clear();
    TemplateController.#tasks.clear();
    TemplateController.#cache.clear();
    TemplateController.#refs.clear();
  }

}  
