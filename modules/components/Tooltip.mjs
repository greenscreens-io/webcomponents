/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { createRef, ref, classMap, html, ifDefined, unsafeHTML } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { placement } from '../properties/index.mjs';
import { GSID } from '../base/GSID.mjs';
import { GSPopper } from '../base/GSPopper.mjs';
import { GSDOM } from '../base/GSDOM.mjs';

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
  #eventTarget;
  #onMouseEnter = () => this.open();
  #onMouseLeave = () => this.close();
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

  connectedCallback() {
    super.connectedCallback();
    this.#syncEvents();
  }

  disconnectedCallback() {
    this.#eventTarget = undefined;
    super.disconnectedCallback();
  }

  firstUpdated(changed) {
    super.firstUpdated(changed);
    this.#syncEvents();
    this.#reposition();
    const ccs = {
        "text-align": "justify !important",
        "text-justify": "inter-word",
        "word-break": "keep-all",
        "hyphens": "none"
    };
    this.dynamicStyle(this.#tipStyle, ccs);
  }

  updated() {
    this.#syncEvents();
    this.#reposition();
  }

  renderUI() {
    const me = this;
    const content = me.#content();
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
      <div class="tooltip-inner ${me.#tipStyle}" data-gs-class="${me.#tipStyle}">${content}</div>
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

  #syncEvents() {
    const target = this.#ref;
    if (target === this.#eventTarget) return;
    if (this.#eventTarget) {
      this.removeEvent(this.#eventTarget, 'mouseenter', this.#onMouseEnter);
      this.removeEvent(this.#eventTarget, 'mouseleave', this.#onMouseLeave);
    }
    this.#eventTarget = undefined;
    if (!this.isConnected || !target) return;
    this.attachEvent(target, 'mouseenter', this.#onMouseEnter);
    this.attachEvent(target, 'mouseleave', this.#onMouseLeave);
    this.#eventTarget = target;
  }

  #reposition() {
    const me = this;
    const arrowEl = me.#arrow;
    const panelEl = me.#panel;
    if (!panelEl) return;
    const target = me.#ref;
    if (me.opened && target) {
      GSPopper.popupFixed(me.placement, panelEl, target, arrowEl);
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

  #content() {
    const me = this;
    const title = typeof me.title === 'string' ? me.title : '';
    if (title.startsWith('#')) {
      const template = GSDOM.getByID(document.documentElement, title.slice(1));
      if (GSDOM.isTemplateElement(template)) return template.content.cloneNode(true);
    }
    const content = me.translate(title.replaceAll('&nbsp;', ' '));
    return me.preprocess ? unsafeHTML(me.#parse(content)) : content;
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

      line = line
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

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