/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSUtil } from "../base/GSUtil.mjs";
import { GSTemplateCache } from "../base/GSTemplateCache.mjs";
import { GSDOM } from "../base/GSDOM.mjs";

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
      me.#template = TemplateController.#cache.get(ref);
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
      } catch (err) {
        TemplateController.#refs.delete(ref);
        throw err;
      }
      if (cacheable) {
        TemplateController.#cache.set(ref, template);
      }
    }

    // slot element msut be added only once 
    if (template) {
      me.#template = template.cloneNode(true);
      if (me.#host.dataset.xTemplate !== 'true') {
        me.#host.dataset.xTemplate = 'true';
        Array.from(me.#template.content.children)
          .filter(el => el.hasAttribute('slot'))
          .forEach(el => me.#host?.appendChild(el));
      }
      Array.from(me.#template.content.children)
        .filter(el => el.hasAttribute('slot'))
        .forEach(el => el.remove());
      me.#host?.requestUpdate();
    }
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
