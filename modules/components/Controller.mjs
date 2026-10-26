/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { GSElement } from '../GSElement.mjs';
import { GSLoader } from '../base/GSLoader.mjs';
import { GSLog } from '../base/GSLog.mjs';

/**
 * Helper component to enable controller attachment to the GS WebComponent.
 * It is used to simplify and separate templates from logic.
 */
export class GSControllerElement extends GSElement {

  static properties = {
    module: {},
    controller: {},
  }

  #clazz;
  #initializing;

  updated(changes) {
    super.updated(changes);
    const me = this;
    if ((changes.has('module') || changes.has('controller')) && me.#clazz) {
      GSLog.warn(me, 'Controller configuration changed after initialization; existing controller remains attached.');
      return;
    }
    if (me.isConnected && me.isValid && !me.#clazz) void me.#initialize();
  }

  get isValid() {
    return this.parentElement instanceof GSElement;
  }

  async #initialize() {

    const me = this;
    const host = me.parentElement;
    const controller = me.controller;
    const modulePath = me.module;

    if (me.#clazz || me.#initializing) return;
    if (!controller) {
      const error = new Error('Controller name is required.');
      GSLog.error(me, error);
      me.emit('controller-error', { error }, true, true);
      return;
    }

    me.#initializing = Promise.resolve().then(async () => {
      try {
        let clazz = globalThis[controller];
        if (typeof clazz !== 'function' && modulePath) {
          const url = GSLoader.normalizeURL(modulePath);
          const module = await import(url);
          clazz = module[controller];
        }

        if (host !== me.parentElement || !me.isConnected ||
          controller !== me.controller || modulePath !== me.module) {
          me.requestUpdate();
          return;
        }
        if (typeof clazz !== 'function') {
          throw new Error(`Controller "${controller}" was not found${modulePath ? ` in module "${modulePath}"` : ''}.`);
        }

        new clazz(host);
        me.#clazz = clazz;
        globalThis[controller] = clazz;
      } catch (error) {
        GSLog.error(me, error);
        me.emit('controller-error', { error }, true, true);
      } finally {
        me.#initializing = undefined;
      }
    });
    return me.#initializing;
  }

  static {
    this.define('gs-controller');
  }

}