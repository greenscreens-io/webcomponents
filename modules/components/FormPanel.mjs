/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { createRef, html, ifDefined, ref, repeat } from '../lib.mjs';
import { GSLog } from '../base/GSLog.mjs';
import { GSItem } from '../base/GSItem.mjs';
import { GSAttr } from '../base/GSAttr.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSFormGroupElement } from './FormGroup.mjs';

// TODO: Make generic JSON to template generator, 
// then create string template and apply it to the lit html function.
// Use all properties exstractor from super components and use type definition for bool proeprties.
// Use xtype(#tagName) to define component type and use it to create component instance.

/**
 * Component is responsible for auto-building gs-form and gs-form-group elements
 * from either JSON data or GS-ITEM elements.
 */
export class GSFormPanelElement extends GSElement {

  static properties = {
    storage: {},
    data: { type: Array },
  }

  #formRef = createRef();

  constructor() {
    super();
    this.data = this.#proxify;
  }

  renderUI() {
    const me = this;
    const data = me.data || {};
    const items = me.data?.items || [];
    return html`<gs-form ${ref(me.#formRef)}

      .storage="${ifDefined(data.storage)}" 
      ?disabled=${ifDefined(data.disabled)}.
      .data="${ifDefined(data.data)}"
      
      .name="${ifDefined(data.name)}"
      .rel="${ifDefined(data.rel)}"
      .acceptCharset="${ifDefined(data.acceptCharset)}"
      .autocapitalize="${ifDefined(data.autocapitalize)}"
      .autocomplete="${ifDefined(data.autocomplete)}"

      .action="${ifDefined(data.action)}"
      .enctype="${ifDefined(data.enctype)}"
      .method="${ifDefined(data.method)}"
      ?novalidate="${ifDefined(data.novalidate)}"
      .target="${ifDefined(data.target)}"

      ?block="${ifDefined(data.block)}"
      ?beep="${ifDefined(data.beep)}"
      .timeout="${ifDefined(data.timeout)}"

      ?flat="${ifDefined(data.flat)}"
      ?rtl="${ifDefined(data.rtl)}"
      ?hide="${ifDefined(data.hide)}"
      ?padding="${ifDefined(data.padding)}"
      ?margin="${ifDefined(data.margin)}"
      ?rounded="${ifDefined(data.rounded)}"
      ?bordered="${ifDefined(data.bordered)}"
      ?shadow="${ifDefined(data.shadow)}"
      ?keep="${ifDefined(data.keep)}"
      .css="${ifDefined(data.css)}"
      .theme="${ifDefined(data.theme)}"
      .os="${ifDefined(data.os)}"
      .browser="${ifDefined(data.browser)}"
      .language="${ifDefined(data.language)}"
      .environment="${ifDefined(data.environment)}"
      .orientation="${ifDefined(data.orientation)}"
      .protocol="${ifDefined(data.protocol)}"
      .template="${ifDefined(data.template)}"      
      >
      <slot>
        ${repeat(items, (item) => me.#renderFormGroup(me.data, item))}
      </slot>
    </gs-form>`;
  }

  #renderFormGroup(definition, item) {
    return html`<gs-form-group 
      .icon="${ifDefined(item.icon)}"
      .layout="${ifDefined(item.layout)}"
      .placement="${ifDefined(item.placement)}"

      .label="${ifDefined(item.label)}"
      .description="${ifDefined(item.description)}"
      .placeholder="${ifDefined(item.placeholder)}"
      
      .pattern="${ifDefined(item.pattern)}"
      .mask="${ifDefined(item.mask)}"

      .form="${ifDefined(item.form)}"
      .formaction="${ifDefined(item.formaction)}"
      .formenctype="${ifDefined(item.formenctype)}"
      .formmethod="${ifDefined(item.formmethod)}"
      .formnovalidate="${ifDefined(item.formnovalidate)}"
      .formtarget="${ifDefined(item.formtarget)}"
      .wrap="${ifDefined(item.wrap)}"
      .spellcheck="${ifDefined(item.spellcheck)}"

      .type="${ifDefined(item.type)}"
      .name="${ifDefined(item.name)}"
      .list="${ifDefined(item.list)}"
      .accept="${ifDefined(item.accept)}"
      .value="${ifDefined(item.value)}"
      
      .lang="${ifDefined(item.lang)}"
      .title="${ifDefined(item.title)}"
      .cols="${ifDefined(item.cols)}"
      .rows="${ifDefined(item.rows)}"
      .step="${ifDefined(item.step)}"
      .min="${ifDefined(item.min)}"
      .max="${ifDefined(item.max)}"
      .maxlength="${ifDefined(item.maxlength)}"
      .minlength="${ifDefined(item.minlength)}"

      ?reverse="${ifDefined(item.reverse)}"
      ?selectable="${ifDefined(item.selectable)}"

      ?autoid="${ifDefined(item.autoid)}"
      ?autocopy="${ifDefined(item.autocopy)}"
      ?autoselect="${ifDefined(item.autoselect)}"

      .autocapitalize="${ifDefined(item.autocapitalize)}"
      .autocorrect="${ifDefined(item.autocorrect)}"
      .autocomplete="${ifDefined(item.autocomplete)}"

      ?autofocus="${ifDefined(item.autofocus)}"
      ?autoselect="${ifDefined(item.autoselect)}"

      ?disabled="${ifDefined(item.disabled)}"
      ?checked="${ifDefined(item.checked)}"
      ?multiple="${ifDefined(item.multiple)}"
      ?reveal="${ifDefined(item.reveal)}"
      ?readonly="${ifDefined(item.readonly)}"
      ?required="${ifDefined(item.required)}"

      .invalidMessage="${ifDefined(item.invalidMessage)}"  
      
      ?block="${ifDefined(item.block || definition.block)}"
      ?beep="${ifDefined(item.beep || definition.beep)}"
      ?timeout="${ifDefined(item.timeout || definition.timeout)}"

      ?flat="${ifDefined(item.flat)}"
      ?rtl="${ifDefined(item.rtl)}"
      ?hide="${ifDefined(item.hide)}"
      ?padding="${ifDefined(item.padding)}"
      ?margin="${ifDefined(item.margin)}"
      ?rounded="${ifDefined(item.rounded)}"
      ?bordered="${ifDefined(item.bordered)}"
      ?shadow="${ifDefined(item.shadow)}"
      ?keep="${ifDefined(item.keep)}"
      .css="${ifDefined(item.css)}"
      .theme="${ifDefined(item.theme)}"
      .os="${ifDefined(item.os)}"
      .browser="${ifDefined(item.browser)}"
      .language="${ifDefined(item.language || definition.language)}"
      .environment="${ifDefined(item.environment)}"
      .orientation="${ifDefined(item.orientation)}"
      .protocol="${ifDefined(item.protocol)}"
      .template="${ifDefined(item.template)}">
      </gs-form-group>`;
  }

  get form() {
    return this.#formRef.value;
  }

  onDataRead(data) {
    this.data = data;
  }

  onDataError(e) {
    GSLog.error(this, e);
  }

  get #proxify() {
    return GSItem.collect(this).map(el => GSAttr.proxify(el, GSFormGroupElement.properties));
  }

  static {
    this.define('gs-form-panel');
  }

}