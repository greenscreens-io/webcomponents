/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { classMap, createRef, html, ifDefined, ref, templateContent } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSDOM } from '../base/GSDOM.mjs';
import { GSLog } from '../base/GSLog.mjs';
import { GSEvents } from '../base/GSEvents.mjs';
import { GSUtil } from '../base/GSUtil.mjs';

export class GSFormElement extends GSElement {

  static properties = {
    storage: {},
    data: { type: Object },
    disabled: { reflect: true, type: Boolean },

    url: { reflect: true },
    name: { reflect: true },
    rel: { reflect: true },
    acceptCharset: { reflect: true, attribute: 'accept-charset' },
    autocapitalize: { reflect: true },
    autocomplete: { reflect: true },

    // default settings for FormGroup or gs-ext-* form elements
    autocopy: { reflect: true, type: Boolean },
    autoselect: { reflect: true, type: Boolean },
    autovalidate: { reflect: true, type: Boolean },
    autoreport: { reflect: true, type: Boolean },
    autosubmit: { reflect: true, type: Boolean },

    action: { reflect: true },
    enctype: { reflect: true },
    method: { reflect: true },
    novalidate: { reflect: true, type: Boolean },
    target: { reflect: true },

    block: { reflect: true, type: Boolean },
    beep: { reflect: true, type: Boolean },
    timeout: { reflect: true, type: Number }
  }

  #formRef = createRef();
  #lastState = undefined;

  constructor() {
    super();
    const me = this;
    me.data = {};
    me.disabled = false;
    me.autocopy = false;
    me.autoselect = false;
    me.autovalidate = false;
    me.autoreport = false;
    me.autosubmit = false;
    me.block = false;
    me.beep = false;
    me.timeout = 0;
    me.method = "dialog";
  }

  renderUI() {
    const me = this;
    return html`<form is="gs-ext-form"
      ${ref(me.#formRef)}
      id="${ifDefined(me.name)}"
      name="${ifDefined(me.name)}"
      dir="${ifDefined(me.direction)}"
      class="${classMap(me.renderClass())}"
      
      @submit="${me.submit}"
      @reset="${me.reset}"
      
      method="${me.method}"      
      url="${ifDefined(me.url)}"
      
      rel="${ifDefined(me.rel)}"
      acceptCharset="${ifDefined(me.acceptCharset)}"
      autocapitalize="${ifDefined(me.autocapitalize)}"
      autocomplete="${ifDefined(me.autocomplete)}"
      action="${ifDefined(me.action)}"
      enctype="${ifDefined(me.enctype)}"
      target="${ifDefined(me.target)}"

      .beep="${me.beep}"
      .block="${me.block}"
      .disabled="${me.disabled}"
      .autocopy="${me.autocopy}"
      .autoselect="${me.autoselect}"
      .autovalidate="${me.autovalidate}"
      .autoreport="${me.autoreport}"
      .autosubmit="${me.autosubmit}"

      ?novalidate="${me.novalidate}">
      ${templateContent(me.#elementTemplate)}
      <slot></slot>
    </form>`;
  }

  firstUpdated(changed) {
    super.firstUpdated(changed);
    const me = this;
    me.dataController?.read();
  }

  updated(changed) {
    const me = this;
    if (changed.has('data')) {
      if (GSUtil.isNull(me.data)) {
        //me.reset();
        me.form?.reset();
      } else {
        me.asJSON = Object.assign(me.asJSON, me.data);
      }
    }
  }

  templateInjected() {
    const me = this;
  }

  async reset(e) {
    const me = this;
    me.data = {};
    await me.dataController?.read(me.asJSON);
    // me.checkValidity();
  }

  async submit(e) {
    GSEvents.prevent(e, true, false, false);
    const me = this;
    if (me.disabled) return;
    if (!me.checkValidity()) return;
    const json = me.asJSON;
    await me.dataController?.write(json);
    const data = { type: 'submit', data: json, source: e, owner: me };
    return me.emit('form', data, true, true, true);
  }

  get submitButton() {
    return this.form?.submitButton;
  }

  get resetButton() {
    return this.form?.resetButton;
  }

  get form() {
    return this.#formRef.value;
  }

  /**
  * Overide native to pickup all form elements, including ones in shadow dom
  */
  get elements() {
    return this.form?.elements || [];
  }

  /**
   * Get all form attached native fields unwrapepd from GSWebComponents
   */
  get fields() {
    return this.form?.fields || [];
  }

  /**
   * Find all inputs by querying across inner shadow 
   */
  get inputs() {
    return this.form?.inputs || [];
  }

  get invalid() {
    return this.form?.invalid;
  }

  get isValid() {
    return this.form?.isValid;
  }

  get asJSON() {
    return this.form?.asJSON || {};
  }

  set asJSON(data) {
    const me = this;
    if (me.form) {
      me.form.asJSON = data;
    }
  }

  /**
   * Find field by name
   * @param {*} name 
   * @returns 
   */
  field(name) {
    return this.form?.field(name);
  }

  checkValidity() {
    return this.form?.checkValidity();
  }

  reportValidity() {
    return this.form?.reportValidity();
  }

  /**
   * For DataController read callback
   * 
   * @param {Array} data 
   */
  onDataRead(data) {
    const me = this;
    if (Array.isArray(data)) {
      data.forEach(o => me.asJSON = o);
    } else {
      me.asJSON = data;
    }
  }

  onDataWrite(data) {

  }

  onDataError(e) {
    GSLog.error(this, e);
  }

  get #elementTemplate() {
    const tplEl = this.firstElementChild;
    return GSDOM.isTemplateElement(tplEl) ? tplEl : this.templateRef;
  }

  static {
    this.define('gs-form');
  }

}