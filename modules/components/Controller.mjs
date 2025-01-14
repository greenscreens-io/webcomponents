/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSElement } from '../GSElement.mjs';
import { GSLoader } from '../base/GSLoader.mjs';

/**
 * Helper component to enable controller attachment to the GS WebComponent.
 * It is used to simplify and separate templates from logic.
 */
export class GSControllerElement extends GSElement {

  static properties = {
    module: {},
    controller: {},
  }

  #clazz = false;

  constructor() {
    super();
  }

  updated(changes) {
    super.updated(changes);
    const me = this;
    if (me.isConnected && me.isValid) {
      me.#initialize();
    }
  }

  get isValid() {
    return this.parentElement instanceof GSElement;
  }

  async #initialize() {

    const me = this;
    const host = me.parentElement;

    if (me.#clazz) return;

    let clazz = globalThis[me.controller];
    if (!clazz && me.module) {
      const url = GSLoader.normalizeURL(me.module);
      const module = await import(url);
      clazz = module[me.controller];
    }

    if (clazz) {
      new clazz(host);
      me.#clazz = clazz;
      globalThis[me.controller] = clazz;
    }

  }

  static {
    this.define('gs-controller');
  }

}