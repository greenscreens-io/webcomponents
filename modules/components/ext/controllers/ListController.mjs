/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { GSAttr } from "../../../base/GSAttr.mjs";
import { GSDOM } from "../../../base/GSDOM.mjs";
import { GSEvents } from "../../../base/GSEvents.mjs";

/**
 * Handle data filtering for list atribute, and linked fields.
 * Changes in one field list, update avaialble selections in another field selections.
 */
export class ListController {

  #host;

  #monitorCallback;
  #changeCallback;
  #blurCallback;

  constructor(host) {
    const me = this;
    me.#host = host;
    me.#blurCallback = me.#onBlur.bind(me);
    me.#monitorCallback = me.#onMonitor.bind(me);
    me.#changeCallback = me.#onDataChange.bind(me);
    host.addController(me);
  }

  hostConnected() {
    const me = this;
    const list = me.list;
    if (list) {
      me.#host.on('blur', me.#blurCallback);
      me.#host.on('change', me.#changeCallback);
      me.#host.attachEvent(me.filter, 'change', me.#monitorCallback);
    }
  }

  hostDisconnected() {
    const me = this;
    me.#host.removeController(me);
    me.#host.off('blur', me.#blurCallback);
    me.#host.off('change', me.#changeCallback);
    me.#host.removeEvent(me.filter, 'change', me.#monitorCallback);
  }

  hostUpdated() {
    // trigger only first time
    if (!this.#host.hasUpdated) {
      this.#onDataChange();
    }
  }

  get value() {
    return this.#host.value;
  }

  set value(val) {
    this.#host.value = val;
  }

  get list() {
    const me = this;
    if (me.#host.list) return me.#host.list;
    const list = GSAttr.get(me.#host, 'list');
    return GSDOM.getByID(me.#host.owner, list);
  }

  get filter() {
    const me = this;
    const filter = GSAttr.get(me.#host, 'data-filter');
    return GSDOM.getByID(me.#host.owner, filter);
  }

  get strict() {
    return GSAttr.get(this.#host, 'strict', '');
  }

  #onBlur(e) {
    if (!this.#isInList()) GSEvents.send(this.#host, 'strict', { ok: false, source: e });
  }

  #onDataChange(e) {
    const me = this;
    const own = me.owner;
    let opt = GSDOM.query(me.list, `option[value="${me.value}"]`);
    let clean = false;
    if (!opt) {
        opt = me.list?.querySelector('option');
        clean = true;
    }

    const obj = opt?.dataset || {};
    Object.entries(obj).forEach(p => {
        const val = clean ? '' : p[1];
        const key = p[0];
        GSAttr.set(me.#host, `data-${key}`, p[1]);
        if (key === 'id' || key === 'group') return;

        const filter = `[data-${key}]:not([data-${key}=""]`;
        const els = Array.from(GSDOM.queryAll(own, filter));
        els.filter(el => el.tagName !== 'OPTION')
            .filter(el => el !== me)
            .filter(el => GSAttr.get(el, 'list').length === 0)
            .forEach(el => me.#togleEl(el, key, val))
    });
  }

  #onMonitor(e) {
    const me = this;
    const list = me.list;
    me.value = '';
    const dataGroup = GSAttr.get(me.filter, 'data-group');
    GSDOM.queryAll(list, 'option').forEach(el => GSAttr.set(el, 'disabled', true));
    const filter = dataGroup ? `option[data-group="${dataGroup}"]` : `option[data-id="${e.target.value}"]`;
    GSDOM.queryAll(list, filter).forEach(el => GSAttr.set(el, 'disabled'));

  }

  #togleEl(el, key = '', value = '') {

    const data = GSAttr.get(el, `data-${key}`, '').split(/[,;;]/);
    const isMatch = value.length > 0 && data.includes(value);
    const frmel = GSDOM.isFormElement(el) || GSDOM.isButtonElement(el);

    if (frmel) {
      GSAttr.toggle(el, 'disabled', !isMatch);
    } else {
      isMatch ? GSDOM.show(el) : GSDOM.hide(el);
    }

    const form = GSDOM.closest(el, 'form');
    GSDOM.formElements(form)
      .forEach(el => GSAttr.set(el, 'data-ignore', isMatch ? null : true));
  }

  #isInList() {
    const me = this;
    const list = me.list;
    if (!list) return true;
    if (!me.strict) return true;
    if (!list.querySelector('option')) return true;
    const opt = list.querySelector(`option[value="${me.value}"]`);
    return opt != null;
  }

}  