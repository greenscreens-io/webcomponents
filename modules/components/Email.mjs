/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

import { css, html, unsafeHTML } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSUtil } from '../base/GSUtil.mjs';

/**
 * Safe email rendering to protect from spam bots.
 */
export class GSEmailElement extends GSElement {

  static shadowRootOptions = { mode: 'closed' }

  static style = css`.e-mail:before {
    content: attr(data-website) "\0040" attr(data-user);
    unicode-bidi: bidi-override;
    direction: rtl;
    }`;

  static properties = {
    user: { reflect: true },
    domain: { reflect: true },
    dev: { type: Boolean }
  }

  #user;
  #domain;

  constructor() {
    super();
  }

  willUpdate(changes) {
    super.willUpdate(changes);
    this.#updateUser();
    this.#updateDomain()
  }

  renderUI() {
    return html`${unsafeHTML(this.#style)}<a @click="${this.#onClick}" class="e-mail" data-user="${this.#user}" data-website="${this.#domain}"  href="mailto://"></a>`;
  }

  get #style() {
    return '<style>.e-mail:before { content: attr(data-website) "\u0040" attr(data-user); unicode-bidi: bidi-override; direction: rtl; }</style>';
  }

  get #url() {
    return `mailto://${GSUtil.reverse(this.dataset.user)}@${GSUtil.reverse(this.dataset.domain)}`;
  }

  #updateUser() {
    const me = this;
    const dataset = me.dataset;
    if (me.user) {
      me.#user = dataset.user || GSUtil.reverse(me.user);
      if (me.dev) dataset.user = me.#user;
      me.user = '';
    }
  }

  #updateDomain() {
    const me = this;
    const dataset = me.dataset;
    if (me.domain) {
      me.#domain = dataset.domain || GSUtil.reverse(me.domain);
      if (me.dev) dataset.domain = me.#domain;
      me.domain = '';
    }
  }

  #onClick(e) {
    const me = this;
    me.prevent(e);
    window.location.href = me.#url;
    //window.open(me.#url, '_blank');  
  }

  static {
    this.define('gs-email');
  }

}