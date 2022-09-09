/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSAccordion class
 * @module components/GSAccordion
 */

 import GSElement from "../base/GSElement.mjs";
 import GSID from "../base/GSID.mjs";
 import GSItem from "../base/GSItem.mjs";
 import GSEvent from "../base/GSEvent.mjs";
 import GSLoader from "../base/GSLoader.mjs";
 import GSUtil from "../base/GSUtil.mjs";
 import GSAttr from "../base/GSAttr.mjs";
 import GSDOM from "../base/GSDOM.mjs";
 
 /**
  * <gs-accordion css="" css-item="" css-header="" css-body="">
  *  <gs-item title="" message="" visible="false" autoclose="true" ></gs-item>
  * </gs-accordion>
  * @class
  * @extends {GSElement}
  */
 export default class GSAccordion extends GSElement {
 
   static {
     customElements.define('gs-accordion', GSAccordion);
     Object.seal(GSAccordion);
   }
 
   static get observedAttributes() {
     const attrs = ['css', 'css-item', 'css-header', 'css-body', 'data'];
     return GSElement.observeAttributes(attrs);
   }
 
   attributeCallback(name = '', oldValue = '', newValue = '') {
 
     const me = this;
 
     if (name === 'data') return me.load(newValue);
 
 
     let css = null;
 
     switch (name) {
       case 'css':
         css = '.accordion';
         break;
       case 'css-item':
         css = '.accordion-item';
         break;
       case 'css-head':
         css = '.accordion-button';
         break;
       case 'css-body':
         css = '.accordion-collapse';
         break;
     }
 
     if (css) {
       me.queryAll(css).forEach(el => {
         GSDOM.toggleClass(el, false, oldValue);
         GSDOM.toggleClass(el, true, newValue);
       });
     }
   }
 
   async getTemplate(val = '') {
     const me = this;
     const id = GSID.id;
     const html = await me.#render(id);
     return `<div class="accordion ${me.css}" id="#${id}">${html}</div>`;
   }
 
   async #render(id) {
     const me = this;
     const list = GSItem.genericItems(me).map(el => me.#html(id, el));
     const html = await Promise.all(list);
     return html.join('');
   }
 
   get css() {
     return GSAttr.get(this, 'css', '');
   }
 
   set css(val = '') {
     GSAttr.set(this, 'css', val);
   }
 
   get cssItem() {
     return GSAttr.get(this, 'css-item', '');
   }
 
   set cssItem(val = '') {
     GSAttr.set(this, 'css-item', val);
   }
 
   get cssHead() {
     return GSAttr.get(this, 'css-head');
   }
 
   set cssHead(val = '') {
     return GSAttr.set(this, 'css-head', val);
   }
 
   get cssBody() {
     return GSAttr.get(this, 'css-body');
   }
 
   set cssBody(val = '') {
     return GSAttr.set(this, 'css-body', val);
   }
 
   async #html(id, el) {
     const me = this;
     const itemid = GSID.id;
     const tpl = GSItem.getBody(el);
     const title = me.#getTitle(el);
     const message = me.#getMessage(el);
     const autoclose = me.#getAutoclose(el) ? `data-bs-parent=#${id}` : '';
     const isVisible = me.#isVisible(el);
     return `
       <div class="accordion-item ${me.cssItem}">
         <slot name="content">
             <h2 class="accordion-header">
               <button class="accordion-button ${me.cssHead} ${isVisible ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#${itemid}">
                 ${title}
               </button>
             </h2>
             <div class="accordion-collapse collapse ${me.cssBody} ${isVisible ? 'show' : ''}" id="${itemid}" ${autoclose}>
               <div class="accordion-body">
                   ${tpl || message}
               </div>
             </div>      
         </slot>
     </div>
     `
   }
 
   #getTitle(el) {
     return GSAttr.get(el, 'title');
   }
 
   #getMessage(el) {
     return GSAttr.get(el, 'message');
   }
 
   #isVisible(el) {
     return GSAttr.getAsBool(el, 'visible', false);
   }
 
   #getAutoclose(el) {
     return GSAttr.getAsBool(el, 'autoclose', true);
   }
 
   /**
    * Load data from various sources
    * 
    * @async
    * @param {JSON|func|url} val 
    * @returns {Promise}
    */
   async load(val = '') {
     const data = await GSLoader.loadData(val);
     if (!GSUtil.isJsonType(data)) return;
     const me = this;
     const src = GSItem.generateItem(data);
     GSDOM.setHTML(me, src);
     GSEvent.deattachListeners(me);
     me.connectedCallback();
     return data;
   }
 
 }
 
 