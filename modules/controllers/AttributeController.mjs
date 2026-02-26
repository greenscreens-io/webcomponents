/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { GSAttributeHandler } from "../base/GSAttributeHandler.mjs";
import { GSDOM } from "../base/GSDOM.mjs";

/**
 * Attributes to control click actions for buttons and links.
 * Used to brings meta linking between UI elements
 */
export class AttributeController extends GSAttributeHandler {

  constructor(host) {
    super(host);
    const me = this;
    host.addController(me);
  }

  hostConnected() {
    const me = this;
    me.attach(me.#eventName);
    // me.host.on('notify', e => me.onNotify(e));
  }

  hostDisconnected() {
    const me = this;
    me.host.removeController(me);
    me.detach(me.#eventName);
  }

  onNotify(evt) {
    const me = this;
    me.handle(evt);
  }

  get #eventName() {
    const tag = this.host?.tagName.toLowerCase();
    const clazz = this.host?.clazzName;
    const isFormEl = GSDOM.isFormElement(this.host);
    const v1 = ['gs-form', 'gs form-group'].includes(tag);
    const v2 = ['GSFormGroupElement'].includes(clazz);
    return v1 || v2 || isFormEl ? 'change' : 'click';
  }

}  