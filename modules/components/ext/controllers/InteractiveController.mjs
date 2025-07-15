/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSAttr } from "../../../base/GSAttr.mjs";
import { GSDOM } from "../../../base/GSDOM.mjs";
import { GSEvents } from "../../../base/GSEvents.mjs";

/**
 * Handle data filtering for options atribute (combo and data lists)
 * Changes in one field list, update available selections in another field selections.
 */
export class InteractiveController {

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

  get component() {
    return this.#host
  }

  get value() {
    return this.#host.value;
  }

  set value(val) {
    this.#host.value = val;
  }

  get list() {
    return this.#host;
  }

  get filter() {
    const me = this;
    const filter = GSAttr.get(me.#host, 'data-filter');
    return GSDOM.getByID(me.owner, filter);
  }

  get owner() {
    //return this.#host.owner;
    return this.#host.form || GSDOM.closest(this.#host, 'form');
  }

  get formElements() {
    return GSDOM.formElements(this.owner, true);
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
    let clean = false;
    let opt = GSDOM.query(me.list, `option[value="${me.value}"]`);
    if (!opt) {
        opt = me.list?.querySelector('option');
        clean = true;
    }

    const obj = opt?.dataset || {};
    Object.entries(obj).forEach(p => {
        const val = clean ? '' : p[1];
        const key = p[0];
        if (key === 'id' || key === 'group') {
          GSAttr.set(me.#host, `data-${key}`, p[1]);
          return;
        } 

        const filter = `[data-${key}]:not([data-${key}=""]`;
        const els = Array.from(GSDOM.queryAll(own, filter));
        els.filter(el => el.tagName !== 'OPTION')
            .filter(el => el.tagName !== 'GS-ITEM')
            .filter(el => el !== me.#host)
            .filter(el => el !== me.filter) 
            .filter(v => GSDOM.closest(v, 'gs-form-group') ? false: true ) 
            //.filter(el => GSAttr.get(el, 'list').length === 0)
            .forEach(el => me.#togleEl(el, key, val))
    });
  }

  #onMonitor(e) {
    const me = this;
    const list = me.list;
    me.value = '';
    me.#host.disabled = false;
    const dataGroup = GSAttr.get(me.filter, 'data-group');
    const filter = dataGroup ? `option[data-group="${dataGroup}"]` : `option[data-id="${e.target.value}"]`;
    GSDOM.queryAll(list, 'option').forEach(el => me.#togleOption(el, true));
    GSDOM.queryAll(list, filter).forEach(el => me.#togleOption(el, false));

  }

  #togleOption(el, value) {
      GSAttr.toggle(el, 'disabled', value);
      GSDOM.toggleClass(el, 'd-none', value);
  }

  #togleEl(el, key = '', value = '') {

    const data = GSAttr.get(el, `data-${key}`, '').split(/[,;;]/);
    const isMatch = value.length > 0 && data.includes(value);
    const frmel = GSDOM.isFormElement(el) || GSDOM.isButtonElement(el) || el.tagName === "GS-FORM-GROUP";

    if (frmel) {
      GSAttr.toggle(el, 'disabled', !isMatch);
    } else {
      isMatch ? GSDOM.show(el) : GSDOM.hide(el);
    }

    //this.formElements.forEach(el => GSAttr.set(el, 'data-ignore', isMatch ? null : true));
    GSAttr.set(el, 'data-ignore', isMatch ? null : true);
    GSDOM.queryAll(el, 'input,textarea,select').forEach(el => GSAttr.set(el, 'data-ignore', isMatch ? null : true));
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