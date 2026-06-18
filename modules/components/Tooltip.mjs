/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { createRef, ref, classMap, html, ifDefined, until, unsafeHTML } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { placement } from '../properties/index.mjs';
import { GSID } from '../base/GSID.mjs';
import { GSPopper } from '../base/GSPopper.mjs';
import { GSDOM } from '../base/GSDOM.mjs';
import { GSTemplateCache } from '../base/GSTemplateCache.mjs';

export class GSTooltipElement extends GSElement {

  static properties = {
    placement: { ...placement },
    title: {},
    target: {},
    opened: { type: Boolean },
    local: { type: Boolean },
    preprocess: { type: Boolean }
  }

  #arrowRef = createRef();
  #panelRef = createRef();
  #styleID = GSID.id;
  #arrowStyle = GSID.id;
  #tipStyle = GSID.id;

  constructor() {
    super();
    this.placement = 'top';
    this.dynamicStyle(this.#styleID);
    this.dynamicStyle(this.#tipStyle);
    this.dynamicStyle(this.#arrowStyle);
  }

  firstUpdated(changed) {
    super.connectedCallback();
    const me = this;
    me.#attachEvents();
    me.#reposition();
    super.firstUpdated(changed);
    const ccs = {
        "text-align": "justify !important",
        "text-justify": "inter-word",
        "word-break": "keep-all",
        "hyphens": "none"
    };
    me.dynamicStyle(me.#tipStyle, ccs);

  }

  willUpdate(changed) {
    super.willUpdate(changed);
    this.#reposition();
  }

  renderUI() {
    const me = this;
    const content = me.#html();
    return html`
    <div ${ref(me.#panelRef)} 
      dir="${ifDefined(me.direction)}"
      role="tooltip"
      data-popper-placement="${me.placement}"
      data-gs-class="${me.#styleID}"
      class="${classMap(me.renderClass())}">
      <div ${ref(me.#arrowRef)} 
          class="tooltip-arrow ${me.#arrowStyle}" 
          data-gs-class="${me.#arrowStyle}">
      </div>
      <div class="tooltip-inner ${me.#tipStyle}" data-gs-class="${me.#tipStyle}">${unsafeHTML(content)}</div>
    </div>`;
  }

  renderClass() {
    const me = this;
    const css = {
      ...super.renderClass(),
      'tooltip': true,
      'bs-tooltip-auto': true,
      'fade': true,
      'show': me.opened,
      [me.#styleID]: true
    }
    return css;
  }

  open() {
    this.opened = true;
  }

  close() {
    this.opened = false;
  }

  toggle() {
    this.opened = !this.opened;
  }

  #attachEvents() {
    const me = this;
    me.attachEvent(me.#ref, 'mouseenter', me.open.bind(me));
    me.attachEvent(me.#ref, 'mouseleave', me.close.bind(me));
  }

  #reposition() {
    const me = this;
    const arrowEl = me.#arrow;
    const panelEl = me.#panel;
    if (!panelEl) return;
    if (me.opened) {
      GSPopper.popupFixed(me.placement, panelEl, me.#ref, arrowEl);
    } else {
      me.dynamicStyle(me.#styleID, { top: '-1000px', left: '-1000px' });
    }
  }

  get #ref() {
    const me = this;
    switch (me.target) {
      case '@parent':
        return this.parentElement;
      case '@previous':
        return this.previousElementSibling;
      case '@next':
        return this.nextElementSibling;
      default:
        return me.local ? me.#refLocal : me.#refGlobal;
    }
  }

  get #refLocal() {
    const root = GSDOM.root(this);
    return GSDOM.query(root, this.target);
  }

  get #refGlobal() {
    return GSDOM.query(document.body, this.target);
  }

  get #arrow() { return this.#arrowRef.value; }
  get #panel() { return this.#panelRef.value; }

  #html() {
    const me = this;

    let content = "";
    if (me.title.startsWith('#')) {
      content = GSTemplateCache.loadTemplate(true, this.id, me.title);
    } else {
      content = me.preprocess ? me.#parse(me.title) : me.title;
      content = me.translate(content);
    }
    return content;
  }

  /**
   * A simple modified MarkDown
   * 
   * &#10; - new line 
   * ** - bold
   * *  - italic
   * *** - both
   * --- hr
   * $ - strong 
   * % - small 
   * 
   * @param {*} text 
   * @returns 
   */
  #parse(text) {
    if (!text) return '';

    // 1. Normalize line breaks and handle common HTML entities
    let normalized = text.replace(/&#10;/g, '\n');

    // 2. Tokenize or split safely by newlines OR sentence endings (. ! ?) 
    // This lookbehind handles spaces after punctuation perfectly without losing the character.
    let lines = normalized
      .split(/(?<=[!\.\?]+)(?=\s|---|%)|\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    let htmlOutput = '';
    let inSmallBlock = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Structural Rule: Small block toggle
      if (line === '%') {
        if (!inSmallBlock) {
          htmlOutput += '<small class="text-warning ">';
          inSmallBlock = true;
        } else {
          htmlOutput += '</small>';
          inSmallBlock = false;
        }
        continue;
      }

      // Structural Rule: Horizontal Rule
      if (line === '---') {
        htmlOutput += '<hr class="">';
        continue;
      }

      // Inline formatting replacements (Fixed regex syntax)
      line = line
        .replace(/\$(.*?)\$/g, '<strong>$1</strong>')
        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');

      // Render layout tags based on block state
      if (inSmallBlock) {
        // Check if the line is purely a strong label header (e.g., <strong>NOTE:</strong>)
        if (line.startsWith('<strong>') && line.endsWith('</strong>')) {
          htmlOutput += line + ' ';
        } else {
          // Mimic the exact spacing requirements from your target template
          let pClass = htmlOutput.endsWith('</strong> ') ? 'mb-1' : '';
          if (pClass) {
            htmlOutput += `<p class="${pClass}">${line}</p> `;
          } else {
            htmlOutput += `<p>${line}</p>`;
          }
        }
      } else {
        // Default outer paragraphs
        htmlOutput += `<p class="text-start mb-1">${line}</p>`;
      }
    }

    // Fallback cleanup if structural tags are left unclosed
    if (inSmallBlock) {
      htmlOutput += '</small>';
    }

    return htmlOutput;
  }

  static {
    this.define('gs-tooltip');
  }

}