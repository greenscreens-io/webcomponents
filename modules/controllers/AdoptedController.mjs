/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */
import { GSEvents } from '../base/GSEvents.mjs';
import { GSDynamicStyle } from '../base/GSDynamicStyle.mjs';

/**
 * Controller register self to gs-adopted event listener list.
 * Every time even gs-adopted is triggered by the GSAdoptedEngien class,
 * all registerd controller will be processed for reapplaying stylesheet 
 * Also, this controlelr takes care of adding custom dynamic styles 
 * to the end fo the list.
 * 
 * Custom dynamic styles are used internally by the components for dynamic 
 * style changes to preven dom node polution; 
 * Style  changes  are not visible directly on DOM node.
 */
export class AdoptedController {

  #host;
  #dynamic;

  constructor(host) {
    const me = this;
    me.#host = host;
    host.addController(me);
  }

  hostConnected() {
    const me = this;
    AdoptedController.#controllers.add(me);
    me.#adopt();
  }

  hostDisconnected() {
    const me = this;
    AdoptedController.#controllers.delete(me.#host);
    me.#host.removeController(me);
  }

  /**
   * Initialize dynamic style for component instance
   * Call it from constructor for style to be applied to the current component
   * @param {String} name CSS class name
   * @param {Object|String} values CSS class styles to be applied
   * @returns {CSSStyleRule} An instance of a CSS class
   */
  style(name, values) {
    const me = this;
    me.#dynamic = me.#dynamic ?? new GSDynamicStyle('dynamic');
    return me.#dynamic.setRule(name, values, true);
  }

  #adopt(forced = false) {
    const me = this;
    if (!me.#sheets) return;
    if (forced || me.#changed) {
      const sheets = [...document.adoptedStyleSheets];
      // support for lit "static styles = css``"
      const internal = Array.from(me.#sheets);
      if (me.#dynamic) internal.push(me.#dynamic);
      me.#root.adoptedStyleSheets = [...sheets, ...internal];
    }
  }

  get #changed() {
    return document.adoptedStyleSheets.id !== this.#sheets?.id;
  }

  get #root() {
    return this.#host.renderRoot;
  }

  get #sheets() {
    return this.#root?.adoptedStyleSheets;
  }

  /**
   * Global listener for gs-adopted event triggered from GSAdoptedEngine
   */
  static #controllers = new Set();

  static #onAdopted(e) {
    requestAnimationFrame(() => {
      AdoptedController.#controllers.forEach(c => c.#adopt());
    });
  }

  static #init() {
    const me = AdoptedController;
    GSEvents.on(window, null, 'gs-adopted', me.#onAdopted);
  }

  static {
    this.#init();
  }

}  
