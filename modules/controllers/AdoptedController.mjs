/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */
import { GSEvents } from '../base/GSEvents.mjs';
import { GSDynamicStyle } from '../base/GSDynamicStyle.mjs';
import { GSCacheStyles } from '../base/GSCacheStyles.mjs';
import { GSUtil } from '../base/GSUtil.mjs';

/**
 * Controller register self to gs-adopted event listener list.
 * Every time gs-adopted event is triggered by the GSAdoptedEngine class,
 * all registered controllers will be processed for reapplaying stylesheet. 
 * Also, this controller takes care of adding a custom dynamic styles 
 * to the end fo the list.
 * 
 * Custom dynamic styles are used internally by the components for dynamic 
 * style changes to prevent DOM node pollution.
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
    AdoptedController.#controllers.delete(me);
    me.#host.removeController(me);
    me.#host = null;
    me.#dynamic = null;
  }

  /**
   * Initialize dynamic style for component instance
   * Call it from constructor for style to be applied to the current component
   * @param {String} name CSS class name
   * @param {Object|String} values CSS class styles to be applied
   * @returns {CSSStyleRule} An instance of a CSS class
   */
  style(name, values, isGlobal = false) {
    const me = this;
    let style = null;
    if (isGlobal) {
      style = GSCacheStyles.dynamic;
    } else {
      me.#dynamic = me.#dynamic ?? new GSDynamicStyle('dynamic');      
      style = me.#dynamic;
    }    
    if (values === null && style.cssRules.length > 0 ) return style.removeRule(name);
    return style.setRule(name, values, true);
  }

  #adopt(forced = false) {
    const me = this;
    if (!me.#sheets) return;
    if (forced || me.#changed) {
      const sheets = [...document.adoptedStyleSheets];
      const internal = me.#staticRules;
      if (me.#hasRules) internal.push(me.#dynamic);
      me.#root.adoptedStyleSheets = [...sheets, ...internal].filter(v => v.cssRules.length > 0);
      me.#root.adoptedStyleSheets.id = document.adoptedStyleSheets.id;
    }
  }
  
  // support for lit "static styles = css``"
  get #staticRules() {
    return this.#sheets?.filter(v => GSUtil.isNull(v.id)) || [];
  }

  // is there any dynamic rules set
  get #hasRules() {
    return this.#dynamic?.cssRules.length > 0 || false;
  }

  // have adopted styles changed in document
  get #changed() {
    return document.adoptedStyleSheets.id !== this.#sheets?.id;
  }

  get #root() {
    return this.#host?.renderRoot;
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
