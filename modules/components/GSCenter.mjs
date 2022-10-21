/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSCenter class
 * @module components/GSCenter
 */

import GSAttr from "../base/GSAttr.mjs";
import GSDOM from "../base/GSDOM.mjs";
import GSElement from "../base/GSElement.mjs";

/**
 * Center inside browser
 * @class
 * @extends {GSElement}
 */
export default class GSCenter extends GSElement {

   static {
      customElements.define('gs-center', GSCenter);
      Object.seal(GSCenter);
   }

   static get observedAttributes() {
      const attrs = ['css'];
      return GSElement.observeAttributes(attrs);
   }

   attributeCallback(name = '', oldValue = '', newValue = '') {
      const me = this;
      if (name === 'css') {
         const el = me.query('div');
         GSDOM.toggleClass(el, oldValue, false);
         GSDOM.toggleClass(el, newValue, true);
      }
   }

   async getTemplate() {
      return `<div class="position-absolute top-50 start-50 translate-middle ${this.css}" style="${this.getStyle()}"><slot></slot></div>`
   }

   get css() {
      return GSAttr.get(this, 'css', '');
   }

   set css(val = '') {
      return GSAttr.set(this, 'css', vel);
   }

}

