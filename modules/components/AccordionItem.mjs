/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { html } from '../lib.mjs';
import { GSDOM } from '../base/GSDOM.mjs';
import { GSElement } from '../GSElement.mjs';

export class GSAccordionItemElement extends GSElement {

  static properties = {
    cssHeader: { reflect: true, attribute: 'css-header' },
    cssBody: { reflect: true, attribute: 'css-body' },
    message: { reflect: true, },
    title: { reflect: true, },
    opened: { type: Boolean, reflect: true },
  }

  constructor() {
    super();
  }

  shouldUpdate(changedProperties) {
    return this.owner?.tagName === 'GS-ACCORDION';
  }

  renderUI() {
    const me = this;
    const owner = me.owner;
    const cssHeader = me.cssHeader || owner?.cssHeader;
    const cssBody = me.cssBody || owner?.cssBody;
    return html`<div class="accordion-item ${me.css}">
             <h2 class="accordion-header">
               <button type="button" 
                class="accordion-button  ${cssHeader} ${me.opened ? '' : 'collapsed'}"> 
                 ${me.translate(me.title)}
               </button>
             </h2>
             <div class="accordion-collapse collapse  ${cssBody} ${me.opened ? 'show' : ''}">
               <div class="accordion-body">
                   ${me.translate(me.message)}
                   ${me.renderTemplate()}
                   <slot></slot>
               </div>
             </div>      
     </div>`
  }

  open() {
    this.notify(true);
  }
  
  close() {
    this.notify(false);
  }

  toggle() {
    this.notify(!this.opened);
  }

  notify(val = false) {
    const me = this;
    me.opened = val;
    super.notify();
  }

  get owner() {
    return this.closest('gs-accordion') || GSDOM.component(this);
  }

  static {
    this.define('gs-accordion-item');
  }

}