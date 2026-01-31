/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { classMap, createRef, ref, html, unsafeHTML, ifDefined } from '../lib.mjs';
import { inputType, numGT0, numGE0, autocapitalize, autocorrect } from '../properties/index.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSItem } from '../base/GSItem.mjs';
import { GSUtil } from '../base/GSUtil.mjs';
import { GSDOM } from '../base/GSDOM.mjs';
import { GSID } from '../base/GSID.mjs';
import { GSAttr } from '../base/GSAttr.mjs';
import { dataset } from '../directives/dataset.mjs';

export class GSFormGroupElement extends GSElement {

  static CSS_LABEL_CELL = 'col-md-4 col-sm-4 col-xs-2';
  static CSS_LABEL = 'user-select-none fw-small fw-light text-secondary';
  static CSS_ICON = 'text-primary me-2 fs-5';
  static ICON = 'info-circle-fill';

  static formAssociated = true;

  static #SELECTOPT = {
    name: {},
    value: {},
    selected: { type: Boolean }
  }

  static properties = {
    icon: { reflect: true },
    layout: { reflect: true },
    placement: { reflect: true },

    label: { reflect: true },
    description: { reflect: true },
    placeholder: { reflect: true },

    pattern: { reflect: true },
    mask: { reflect: true },

    form: { reflect: true },
    wrap: { reflect: true },
    spellcheck: { reflect: true },

    type: { reflect: true, ...inputType },
    name: { reflect: true },
    list: { reflect: true },
    accept: { reflect: true },
    value: { noAccessor: true },

    values: {},

    lang: { reflect: true },
    title: { reflect: true },
    rows: { type: Number, reflect: true, hasChanged: numGT0 },
    cols: { type: Number, reflect: true, hasChanged: numGT0 },
    step: { type: Number, reflect: true, hasChanged: numGT0 },
    min: { type: Number, reflect: true, hasChanged: numGE0 },
    max: { type: Number, reflect: true, hasChanged: numGT0 },
    minLength: { type: Number, reflect: true, hasChanged: numGE0 },
    maxLength: { type: Number, reflect: true, hasChanged: numGT0 },

    reverse: { reflect: true, type: Boolean },
    selectable: { reflect: true, type: Boolean },
    toggling: { reflect: true, type: Boolean },

    autoid: { type: Boolean, reflect: true },
    autocopy: { type: Boolean, reflect: true },
    autoselect: { type: Boolean, reflect: true },

    autocapitalize: { ...autocapitalize, reflect: true },
    autocorrect: { ...autocorrect, reflect: true },
    autocomplete: { reflect: true },
    autofocus: { type: Boolean, reflect: true },
    autoselect: { type: Boolean, reflect: true },
    autovalidate: { type: Boolean, reflect: true },
    autoreport: { type: Boolean, reflect: true },

    disabled: { type: Boolean, reflect: true },
    checked: { type: Boolean, reflect: true },
    multiple: { type: Boolean, reflect: true },
    reveal: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },

    invalidMessage: { reflect: true, attribute: 'invalid-message' },

    cellField: { reflect: true, attribute: 'cell-field' },
    cellLabel: { reflect: true, attribute: 'cell-label' },
    cssLabel: { reflect: true, attribute: 'css-label' },
    cssField: { reflect: true, attribute: 'css-field' },

    block: { reflect: true, type: Boolean },
    beep: { reflect: true, type: Boolean },
    timeout: { reflect: true, type: Number }
  }

  #styleID = GSID.id;
  #inputRef = createRef();
  #ouptutRef = createRef();
  #patterns = [];
  #options = [];
  #internals = null;

  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.#validateAllowed();
    this.dynamicStyle(this.#styleID);
    this.rows = 0;
    this.cols = 0;
    this.type = 'text';
    this.placement = 'top';
    this.layout = 'horizontal';
    this.invalidMessage = 'Invalid input',
    this.icon = GSFormGroupElement.ICON;
    this.cssLabel = GSFormGroupElement.CSS_LABEL;
    this.cellLabel = GSFormGroupElement.CSS_LABEL_CELL;
  }

  connectedCallback() {
    const me = this;
    const form = me.formComponent;
    me.layout = GSAttr.get(form, 'layout', me.layout);

    if (!me.form && form) me.form = form.name;

    if (me.selectable) {
      me.#options = GSItem.proxify(me, GSFormGroupElement.#SELECTOPT);
    } else {
      me.#patterns = GSItem.collect(me)
        .filter(el => el.dataset.pattern)
        .map(el => new RegExp(el.dataset.pattern));
    }
    super.connectedCallback();
  }

  updated(changed) {
    const me = this;
    //me.#onInput();
    me.emit('input');
  }

  renderUI() {
    const me = this;
    switch (me.layout) {
      case 'floating': return me.#renderFloating();
      case 'vertical': return me.#renderVertical();
      default: return me.#renderHorizontal();
    }
  }


  #renderFloating() {
    const me = this;
    return html`
    <div  dir="${ifDefined(me.direction)}" class="row ${classMap(me.renderClass())}">
       <div class="form-floating ${me.#cssCheck} ${me.#cellField}">
          ${me.#renderInput()}
          ${me.#renderOutput()}
          ${me.#renderLabel()}
       </div>
       ${me.#renderInfo()}
    </div>
    <slot></slot>`;
  }

  #renderVertical() {
    const me = this;
    return html`
    <div  dir="${ifDefined(me.direction)}" class="row ${classMap(me.renderClass())}">
      <div class="col-12 text-md-start ${me.cellLabel}">
          ${me.#renderLabel()}
      </div>
       <div class="${me.#cssCheck} ${me.#cellField}">
          ${me.#renderInput()}
          ${me.#renderOutput()}
       </div>
       ${me.#renderInfo()}   
    </div>      
    <slot></slot>`;
  }

  #renderHorizontal() {
    const me = this;
    return html`
    <div  dir="${ifDefined(me.direction)}" class="row form-group ${classMap(me.renderClass())}">    
       <slot name="header"></slot>
       ${me.#renderLabelWrap()}
       ${me.#renderField()}
       ${me.#renderInfo()}
       <slot name="footer"></slot>
    </div>
    <slot></slot>`;
  }

  #renderLabel() {
    const me = this;
    return html`<label class="${me.#cssLabel} ${me.cssLabel} user-select-none" for="${me.name}">${me.translate(me.label)}</label>`;
  }

  #renderLabelWrap() {
    const me = this;
    return html`<div class=" text-md-end ${me.cellLabel}">${me.#renderLabel()}</div>`;
  }

  #renderIcon() {
    const me = this;
    return me.#isIcon ? html`<gs-icon size="5" css="${GSFormGroupElement.CSS_ICON}}" name="${me.icon}"></gs-icon>` : html`<slot name="icon"></slot>`;
  }

  #renderTooltip() {
    const me = this;
    const tgt = me.#isIcon ? '@parent' : `[name='${me.name}']`;
    return me.description ? html`<gs-tooltip local language="${ifDefined(me.language)}" placement="${me.placement}" title="${me.description}" target=${ifDefined(tgt)}></gs-tooltip>` : '';
  }

  #renderInfo() {
    const me = this;
    const tooltip = me.#renderTooltip();
    if (tooltip && me.#isIcon) return html`
    <div class="col-auto">
       ${tooltip}
       ${me.#renderIcon()}
    </div>`;
    return tooltip;
  }

  #renderField() {
    const me = this;
    return html`
    <div class="${me.#cssCheck} ${me.#cellField}">
       <slot name="body">${me.#renderInput()}${me.#renderOutput()}</slot>
    </div>`;
  }

  #renderOutput() {
    const me = this;
    if (!me.isRange) return "";
    return html`<span ${ref(me.#ouptutRef)} class="position-absolute px-1">${me.value}</span>`;
  }

  #renderInput() {

    const me = this;

    const idattr = me.autoid ? me.name : undefined;
    const val = me.isFieldset ? me.values.split(',') : me.value;

    if (Array.isArray(val)) {
      const wrap = me.dataset.radioLayout === 'vertical';
      return val.map((it, i) => { return { v: it, id: `${me.name}_${i}` } })
        .map((o, i) => me.#fieldSet(me.name + i, o.v, me.#inputHTML(o.id, me.name, o.v), wrap));
    }

    if (me.selectable) return me.#selectHTML(idattr, me.name, me.value);

    if (me.#isTextArea) return me.#textArea(idattr, me.name, me.value);

    return me.#inputHTML(idattr, me.name, me.value);
  }

  #fieldSet(id, val, fld, vertical = false) {
    const me = this;
    return vertical ?
      html`<div class="me-3">${fld}<label for="${id}" class="ms-1">${me.translate(val)}</label></div>`
      :
      html`<span class="me-3">${fld}<label for="${id}" class="ms-1">${me.translate(val)}</label></span>`;
  }

  #initStyle() {
    const me = this;
    const style = {
      transform: me.reverse && me.isRange ? 'rotateY(180deg)' : ''
    }
    me.dynamicStyle(me.#styleID, style);
  }

  #renderOption(el) {
    const title = el.name || el.innerText || el.value;
    return html`<option ${dataset(el, false)} value="${el.value}" ?selected="${el.selected}">${title}</option>`;
  }

  #renderOptions() {
    const me = this;
    return me.#options.map(el => me.#renderOption(el));
    /*
    return repeat(me.#options, (el) => el.value, (el, index) => {
      return html`<option value="${el.value}">${el.name || el.innerText || el.value}</option>`
    });
    */
  }

  #selectHTML(id, name, value) {
    const me = this;
    me.#initStyle();

    // not used 
    // id=${ifDefined(id)} 
    return html`<select is="gs-ext-select"
            ${ref(me.#inputRef)}
            ${dataset(me, false)}

            @change="${me.#onChange.bind(me)}"
            @blur="${me.#onBlur.bind(me)}"
        
            name="${name}"             
            form="${ifDefined(me.form)}"
            class="${me.#cssField} ${me.cssField} ${me.#styleID}" 

            ?autofocus="${me.autofocus || me.form?.autofocus}"
            ?autocopy="${me.autocopy || me.form?.autocopy}"
            ?autoselect="${me.autoselect || me.form?.autoselect}"
            ?autovalidate="${me.autovalidate || me.form?.autovalidate}"
            ?autoreport="${me.autoreport || me.form?.autoreport}"

            ?toggling="${me.toggling}"
            ?readonly="${me.readonly}"
            ?required="${me.required}"
            ?disabled="${me.disabled}">
              ${me.#renderOptions()}
            </select>`;
  }

  get #isTextArea() {
    const me = this;
    return (me.rows > 0 || me.cols > 0) && me.type === 'text';
  }

  get #listHTML() {
    const me = this;
    let list = '';
    if (me.list) {
      const root = me.parentComponent || me.parentElement;
      const el = GSDOM.query(root, `datalist[id="${me.list}"]`, true, true);
      if (el) list = html`${unsafeHTML(el.outerHTML)}`;
    }
    return list;
  }

  get #isBlock() {
    return this.block || this.formComponent?.block || false;
  }

  get #isBeep() {
    return this.beep || this.formComponent?.beep || false;
  }

  #timeout() {
    return this.timeout || this.formComponent?.timeout || 0;
  }

  #textArea(id, name, value) {
    const me = this;
    me.#initStyle();
    const placeholder = me.placeholder ? me.translate(me.placeholder, false) : null;
    const title = me.title ? me.translate(me.title, false) : null;

    // not used
    // id=${ifDefined(id)}

    return html`<textarea is="gs-ext-textarea" 
            ${ref(me.#inputRef)}
            ${dataset(me, false)}
            @input="${me.#onInput.bind(me)}"
            @change="${me.#onChange.bind(me)}"
            @blur="${me.#onBlur.bind(me)}"
            @invalid="${me.#onInvalid.bind(me)}"
            lang="${ifDefined(me.lang)}"
            minlength="${ifDefined(me.minLength)}"
            maxlength="${ifDefined(me.maxLength)}"
            cols="${me.cols}"
            rows="${me.rows}"

            ?block="${me.#isBlock}"
            ?beep="${me.#isBeep}"
            timeout="${me.#timeout()}"

            spellcheck="${ifDefined(me.spellcheck)}" 
            wrap="${ifDefined(me.wrap)}" 
            form="${ifDefined(me.form)}" 
            name="${name}" 
            value="${ifDefined(value)}"
            placeholder="${ifDefined(placeholder)}"
            title="${ifDefined(title)}"
    
            class="${me.#cssField} ${me.cssField} ${me.#styleID}" 

            autocomplete="${ifDefined(me.autocomplete)}"
            autocorrect="${ifDefined(me.autocorrect)}"
            autocapitalize="${ifDefined(me.autocapitalize)}"

            ?autofocus="${me.autofocus || me.form?.autofocus}"
            ?autocopy="${me.autocopy || me.form?.autocopy}"
            ?autoselect="${me.autoselect || me.form?.autoselect}"
            ?autovalidate="${me.autovalidate || me.form?.autovalidate}"
            ?autoreport="${me.autoreport || me.form?.autoreport}"

            ?readonly="${me.readonly}"
            ?required="${me.required}"
            ?disabled="${me.disabled}"      
      ></textarea>`;
  }

  #inputHTML(id, name, value) {
    const me = this;
    const type = me.isSwitch ? 'checkbox' : me.type;
    let title = me.isRange ? me.defaultValue : me.title;
    title = title ? me.translate(me.title, false) : title;

    const placeholder = me.placeholder ? me.translate(me.placeholder, false) : null;
    const description = me.description ? me.translate(me.description, false) : null;

    me.#initStyle();

    // this does not work, "is" must be set explicitly, or it will not initialize element properly
    // is="${ifDefined(me.isDate ? '' : 'gs-ext-input')}"

    // not used
    // id=${ifDefined(id)} 

    return html`<input is="gs-ext-input"
            ${ref(me.#inputRef)}
            ${dataset(me, false)}

            @input="${me.#onInput.bind(me)}"
            @change="${me.#onChange.bind(me)}"
            @blur="${me.#onBlur.bind(me)}"
            @invalid="${me.#onInvalid.bind(me)}"
        
            name="${name}" 
            type="${type}" 
            form="${ifDefined(me.form)}"
            value="${ifDefined(value)}"
            title="${ifDefined(title)}"


            ?block="${me.#isBlock}"
            ?beep="${me.#isBeep}"
            timeout="${me.#timeout()}"

            class="${me.#cssField} ${me.cssField} ${me.mask ? 'font-monospace' : ''} ${me.#styleID}" 

            placeholder="${ifDefined(placeholder)}"
            description="${ifDefined(description)}"

            .multipattern="${ifDefined(me.#patterns)}"
            mask="${ifDefined(me.mask)}"
            pattern="${ifDefined(me.pattern)}"
            list="${ifDefined(me.list)}"
            accept="${ifDefined(me.accept)}"
             
            step="${ifDefined(me.step)}"
            min="${ifDefined(me.min)}"
            max="${ifDefined(me.max)}"
            lang="${ifDefined(me.lang)}"

            minlength="${ifDefined(me.minLength)}"
            maxlength="${ifDefined(me.maxLength)}"

            autocomplete="${ifDefined(me.autocomplete)}"
            autocorrect="${ifDefined(me.autocorrect)}"
            autocapitalize="${ifDefined(me.autocapitalize)}"

            ?autofocus="${me.autofocus || me.form?.autofocus}"
            ?autocopy="${me.autocopy || me.form?.autocopy}"
            ?autoselect="${me.autoselect || me.form?.autoselect}"
            ?autovalidate="${me.autovalidate || me.form?.autovalidate}"
            ?autoreport="${me.autoreport || me.form?.autoreport}"            

            ?multiple="${me.multiple}"
            ?checked="${me.checked}"
            ?readonly="${me.readonly}"
            ?required="${me.required}"
            ?disabled="${me.disabled}"
            ?reveal="${me.reveal}"
            >${me.#listHTML}`;
  }

  get #cssField() {
    const me = this;
    if (me.selectable) return 'form-select ms-0';
    if (me.isCheckable) return 'form-check-input ms-0';
    if (me.isRange) return 'form-range';
    return 'form-control';
  }

  get #cssLabel() {
    const me = this;
    if (me.isCheckable) return 'form-check-label';
    if (me.isFloating) return 'ms-2';
    return me.isVertical ? 'form-label' : '';
  }

  get #cssCheck() {
    const me = this;
    if (me.isCheckable) {
      //return me.#isSwitch ? 'form-check form-switch ps-3 fs-5' : 'form-check';
      if (me.isSwitch) return 'form-check form-switch ps-3 fs-5';
      return me.isFieldset ? '' : 'form-check';
    }
    return '';
  }

  get #cellField() {
    const me = this;
    const val = (me.isHorizontal) ? '6' : '11';
    return me.cellField || `col-md-${val} col-sm-${val} col-xs-11`;
  }

  get #isIcon() {
    return GSUtil.isStringNonEmpty(this.icon);
  }

  #onInput(e) {
    if (!e.composed) this.emit(e.type, e);
  }

  #onBlur(e) {
    if (!e.composed) this.emit(e.type, e, true, true);
  }

  #onChange(e) {
    const me = this;
    const field = me.field;
    me.#internals?.setFormValue(field.value);
    me.#internals?.setValidity(field.validity, field.validationMessage, field);
    if (!e.composed) me.emit(e.type, e, true, true);
    me.requestUpdate();
  }

  #onInvalid(e) {
    if (!e.composed) this.emit('invalid', e, true, true);
  }

  #validateAllowed() {
    const me = this;
    const slots = ['header', 'body', 'footer'];
    let list = Array.from(me.children).filter(el => el.slot && !slots.includes(el.slot));
    if (list.length > 0) throw new Error(`Custom element injection must contain slot="header|body|footer" attribute! Element: ${me.tagName}, ID: ${me.id}`);
    list = Array.from(me.children).filter(el => !el.slot);
    const tagList = ['GS-ITEM', 'DATALIST'];
    const allowed = GSDOM.isAllowed(list, tagList);
    if (!allowed) throw new Error(GSDOM.toValidationError(me, tagList));
  }

  translate(value = '', sanitize) {
    value = super.translate(value);
    return sanitize ? GSUtil.sanitize(value) : value;
  }

  reset() {
    this.field?.reset?.();
  }

  get isFloating() {
    return this.layout === 'floating';
  }

  get isHorizontal() {
    return this.layout === 'horizontal';
  }

  get isVertical() {
    return this.layout === 'vertical';
  }

  get isFieldset() {
    const me = this;
    return me.type === 'radio' && me.values?.includes(',');
  }

  get isCheckable() {
    const me = this;
    return me.isCheck || me.isRadio || me.isSwitch;
  }

  get isChecked() {
    return this.field?.checked;
  }

  get isCheck() {
    return this.type === 'checkbox';
  }

  get isRadio() {
    return this.type === 'radio';
  }

  get isSwitch() {
    return this.type === 'switch';
  }

  get isNumber() {
    return this.type === 'number';
  }

  get isRange() {
    return this.type === 'range';
  }

  get isText() {
    return this.type === 'text';
  }

  get isPassword() {
    return this.type === 'passsword';
  }

  get isEmail() {
    return this.type === 'email';
  }

  get isURL() {
    return this.type === 'url';
  }

  get isFile() {
    return this.type === 'file';
  }

  get isDate() {
    return this.type === 'date';
  }

  get field() {
    return this.#inputRef.value;
  }

  get value() {
    const me = this;
    return me.field ? me.field?.value : me.defaultValue;
  }

  set value(val) {
    const me = this;
    if (me.field) me.field.value = val;
  }

  get defaultValue() {
    const me = this;
    return me.field ? me.field.defaultValue : GSAttr.get(me, 'value', '');
  }

  set defaultValue(val) {
    const me = this;
    if (me.field) me.field.defaultValue = val;
    GSAttr.set(me, 'value', val);

  }

  get validity() {
    return this.#internals.validity;
  }

  get formComponent() {
    return GSDOM.closest(this, 'gs-form');
  }

  static {
    this.define('gs-form-group');
  }

}