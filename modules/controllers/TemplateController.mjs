/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { GSUtil } from "../base/GSUtil.mjs";
import { GSTemplateCache } from "../base/GSTemplateCache.mjs";

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

  constructor(host) {
    this.#host = host;
    host.addController(this);
  }

  hostConnected() {
    const me = this;
    me.#request();    
  }

  hostDisconnected() {
    const me = this;
    me.#host.removeController(me);
    me.#host = null;
    me.#lastRef = null;
    me.#template = null;
  }

  hostUpdate() {
    this.#request();
  }

  requestUpdate() {
    this.#host.requestUpdate();
  }

  #request() {
    const me = this;
    const ref = me.templateRef;
    if (me.#lastRef !== ref) {
      me.#lastRef = ref;
      TemplateController.#schedule(this);
    }
  }

  async #load() {
    const me = this;
    const ref = me.templateRef;
    const isTplEl = ref instanceof HTMLTemplateElement;
    const template = isTplEl ? ref : await GSTemplateCache.loadTemplate(true, ref, ref);
    if (template) {
      me.#template = template;
      me.#host.requestUpdate();
    }
  }

  get isTemplateElement() {
    return this.#host?.tagName === 'GS-TEMPLATE';
  }

  get template() {
    return this.#template;
  }

  get templateRef() {
    const host = this.#host;
    if(this.isTemplateElement) return host.url;
    return host.template || host.query('template', false);
  }

  static async #process(tasks) {
    await GSUtil.timeout(100);
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
      queueMicrotask(() => me.#process(me.#tasks).finally(me.#scheduled = true));
    }
  }

}  
