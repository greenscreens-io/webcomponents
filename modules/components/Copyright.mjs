/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { classMap, html, ifDefined } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSUtil } from '../base/GSUtil.mjs';

export class GSCopyrightElement extends GSElement {

  static properties = {
    year: { reflect: true, type: Number },
    company: { reflect: true },
    url: { reflect: true },
  }

  constructor() {
    super();
    this.flat = true;
    this.css = 'fixed-bottom d-flex justify-content-center align-items-center mt-1 p-2 text-muted';
  }

  renderUI() {
    const me = this;
    if (!(me.isCompany && me.isYear)) return '';
    const year = new Date().getFullYear();
    const content = html`<small>&copy; ${me.company} ${me.year} - ${year}</small>`;
    const link = me.url ? html`<a target="_blank" rel="noopener noreferrer" href="${me.url}">${content}</a>` : content;
    return html`<div dir="${ifDefined(me.direction)}" class="${classMap(me.renderClass())}">${link}</div>`;
  }

  get isCompany() {
    return GSUtil.isStringNonEmpty(this.company);
  }

  get isYear() {
    return GSUtil.isStringNonEmpty(this.year);
  }

  static {
    this.define('gs-copyright');
  }

}