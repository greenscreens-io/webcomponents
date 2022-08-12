/*
 * © Green Screens Ltd., 2016. - 2022.
 */

/**
 * A module loading GSCenter class
 * @module components/GSCenter
 */

import GSElement from "../base/GSElement.mjs";
import GSUtil from "../base/GSUtil.mjs";

/**
 * Center inside browser
 * @class
 * @extends {GSElement}
 */
export default class GSCenter extends GSElement {

   static {
      customElements.define('gs-center', GSCenter);
   }

   static get observedAttributes() {
      const attrs = ['css'];
      return GSUtil.mergeArrays(attrs, super.observedAttributes);
   }

   attributeCallback(name = '', oldValue = '', newValue = '') {
      const me = this;
      if (name === 'css') {
         const el = me.findEl('div');
         GSUtil.toggleClass(el, false, oldValue);
         GSUtil.toggleClass(el, true, newValue);
      }
   }

   async getTemplate() {
      return `<div class="position-absolute top-50 start-50 translate-middle ${this.css}"><slot></slot></div>`
   }

   get _isFlat() {
      return true;
   }

   get _position() {
      return 'self';
   }

   get css() {
      return GSUtil.getAttribute(this, 'css', '');
   }

   set css(val = '') {
      return GSUtil.setAttribute(this, 'css', vel);
   }

}
