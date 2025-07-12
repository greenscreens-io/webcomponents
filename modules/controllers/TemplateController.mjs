/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSUtil } from "../base/GSUtil.mjs";
import { GSTemplateCache } from "../base/GSTemplateCache.mjs";
import { GSDOM } from "../base/GSDOM.mjs";

// unternal hidden flag to prevent douple injection
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
      const template = TemplateController.#cache.get(ref);
      me.#applyTemplate(template);
      me.#lastRef = ref;
      if (ref && !me.#template) {
        TemplateController.#schedule(this);
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
    }

  }

  #bindTemplate(template) {
    if (template.content.childElementCount > 0) {
      const me = this;
      me.#template = template;
      me.#host?.requestUpdate();
    }
  }

  #applyTemplate(template) {
    if (!GSDOM.isTemplateElement(template)) return;
    
    // is template does not contain slots
    const simple = template[RENDER_SYMBOL] == true;

    const me = this;

    if (simple) {
      me.#bindTemplate(template);
      return;
    }

    const templateClone = template.cloneNode(true);

    const slots = Array.from(templateClone.content.children)
    .filter(el => el.hasAttribute('slot'));
    
    // slot elements msut be added only once 
    if (me.#host[RENDER_SYMBOL] === false) {
      me.#host[RENDER_SYMBOL] = true;
      slots.forEach(el => me.#host?.appendChild(el));
    } else {
      slots.forEach(el => el.remove());
    }

    me.#bindTemplate(templateClone);

  }

  async #load() {
    const me = this;
    const ref = me.templateRef;
    if (!ref) return;
    /* prevents double load, but also creates a render issue
    if (TemplateController.#refs.has(ref)) {
      // already scheduled
      return;
    }
    TemplateController.#refs.add(ref);
    */
    let template = null;
    const isTplEl = ref instanceof HTMLTemplateElement;
    const cacheable = GSUtil.isString(ref);
    if (cacheable) {
      template = TemplateController.#cache.get(ref);
    }
    if (!template) {
      try {
        template = isTplEl ? ref : await GSTemplateCache.loadTemplate(true, ref, ref);
        const slots = Array.from(template.content.children)
        .filter(el => el.hasAttribute('slot'));
        // mark template simple (no slot injections)
        template[RENDER_SYMBOL] = slots.length == 0;               
      } catch (err) {
        TemplateController.#refs.delete(ref);
        throw err;
      }
      if (cacheable) {
        TemplateController.#cache.set(ref, template);
      }
    }

    me.#applyTemplate(template);
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

}  
