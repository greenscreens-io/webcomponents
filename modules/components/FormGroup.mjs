/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { classMap, createRef, ref, html, unsafeHTML, ifDefined } from '../lib.mjs';
import { inputType, InputTypes, numGT0, numGE0 } from '../properties/index.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSItem } from '../base/GSItem.mjs';
import { GSUtil } from '../base/GSUtil.mjs';
import { GSDOM } from '../base/GSDOM.mjs';
import { GSID } from '../base/GSID.mjs';
import { GSAttr } from '../base/GSAttr.mjs';

export class GSFormGroupElement extends GSElement {

  static CSS_LABEL_CELL = 'col-md-4 col-sm-4 col-xs-2';
  static CSS_LABEL = 'user-select-none fw-small fw-light text-secondary';
  static CSS_ICON = 'text-primary me-2 fs-5';
  static ICON = 'info-circle-fill';

  static #SELECTOPT = {
    name : {},
    value : {},
    selected : {type: Boolean}
  }

  static properties = {
    icon: {},
    layout: {},
    placement: {},

    description: {},
    label: {},
    placeholder: {},
    pattern: {},
    mask: {},
    
    name: {},
    type: { ...inputType },
    list: {},
    accept: {},
    
    lang: {},
    default: { reflect: true },
    step: { type: Number, reflect: true, hasChanged: numGT0 },
    min: { type: Number, reflect: true, hasChanged: numGE0 },
    max: { type: Number, reflect: true, hasChanged: numGT0 },
    minLength: { type: Number, reflect: true, hasChanged: numGE0 },
    maxLength: { type: Number, reflect: true, hasChanged: numGT0 },

    reverse: { type: Boolean },
    selectable: { type: Boolean },

    autoid: { type: Boolean },
    autocopy: { type: Boolean, reflect: true },
    autoselect: { type: Boolean, reflect: true },

    autocapitalize: { type: Boolean, reflect: true },
    autocomplete: { type: Boolean, reflect: true },
    autofocus: { type: Boolean, reflect: true },
    autoselect: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    checked: { type: Boolean, reflect: true },
    multiple: { type: Boolean, reflect: true },
    reveal: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },

    invalidMessage: {reflect: true},

    cellField: { attribute: 'cell-field' },
    cellLabel: { attribute: 'cell-label' },
    cssLabel: { attribute: 'css-label' },
    cssField: { attribute: 'css-field' },

  }

  #styleID = GSID.id;
  #inputRef = createRef();
  #ouptutRef = createRef();
  #patterns = [];
  #options = [];

  constructor() {
    super();
    this.#validateAllowed();
    this.dynamicStyle(this.#styleID);
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
    const form = GSDOM.closest(me, 'gs-form');
    me.layout = GSAttr.get(form, 'layout', me.layout);
    if (me.selectable) {
      me.#options = GSItem.proxify(me, GSFormGroupElement.#SELECTOPT);
    } else {
      me.#patterns = GSItem.collect(me)
      .filter(el => el.dataset.pattern)
      .map(el => new RegExp(el.dataset.pattern));
    }      
    super.connectedCallback();
  }

  firstUpdated() {
    super.firstUpdated();
    const me = this;
    me.value = me.default;
    if (!me.selectable && me.field) {
      me.field.defaultValue = GSUtil.normalize(me.default);
    }
  }

  updated() {
    const me = this;
    me.#onRange();
    if (me.templateRef && !me.field) {
      const field = GSDOM.formElements(me.renderRoot).pop();
      me.#inputRef.value = field;
      if (field) {
        field.name = this.name;
        me.attachEvent(field, 'change', me.#onChange.bind(me));
      }
    }
  }

  renderUI() {
    const me = this;
    switch (me.layout) {
      case 'floating': return me.#renderFloating();
      case 'vertical': return me.#renderVertical();
      default: return me.#renderHorizontal();
    }
  }

  templateInjected() {
    super.templateInjected();
    const me = this;
    const el = GSDOM.formElements(me, true).pop();
    me.attachEvent(el, 'blur', me.#onBlur.bind(me));
    me.attachEvent(el, 'input', me.#onRange.bind(me));
    me.attachEvent(el, 'change', me.#onChange.bind(me));
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
    return me.description ? html`<gs-tooltip local locale="${ifDefined(me.locale)}" placement="${me.placement}" title="${me.description}" target=${ifDefined(tgt)}></gs-tooltip>` : '';
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

    const tpl = me.query('template') || me.template;
    if (tpl) return me.renderTemplate();

    const idattr = me.autoid ? me.name : undefined;
    const val = me.isFieldset ? me.value.split(',') : me.value;

    if (Array.isArray(val)) {
      const wrap = me.dataset.radioLayout === 'vertical';
      return val.map((it, i) => { return { v: it, id: `${me.name}_${i}` } })
        .map((o, i) => me.#fieldSet(me.name + i, o.v, me.#inputHTML(o.id, me.name, o.v), wrap));
    }

    if (me.selectable) return me.#selectHTML(idattr, me.name, me.value);

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

  #renderOptions() {
    const me = this;
    return me.#options.map( el => html`<option value="${el.value}" ?selected=${el.selected}>${el.name || el.innerText || el.value }</option>`);
  }

  #selectHTML(id, name, value) {
    const me = this;
    me.#initStyle();

    return html`<select ${ref(me.#inputRef)}
            id=${ifDefined(id)} 
            @blur="${me.#onBlur.bind(me)}"
            @input="${me.#onRange.bind(me)}"
            @change="${me.#onChange.bind(me)}"
        
            name="${name}"             
            class="${me.#cssField} ${me.cssField} ${me.#styleID}" 

            ?autofocus="${me.autofocus}"
            ?autocopy="${me.autocopy}"
            ?autoselect="${me.autoselect}"
            ?readonly="${me.readonly}"
            ?required="${me.required}"
            ?disabled="${me.disabled}">
            ${me.#renderOptions()}
            </select>`;
  }

  get #listHTML() {
    const me = this;
    let list = '';
    if (me.list) {
      const root = me.parentComponent || me.parentElement;
      const el = GSDOM.query(root, `datalist[id="${me.list}"]`, true);
      if (el) list = html`${unsafeHTML(el.outerHTML)}`;
    }
    return list;
  }

  #inputHTML(id, name, value) {
    const me = this;
    const type = me.isSwitch ? 'checkbox' : me.type;
    me.#initStyle();

    return html`<input is="gs-ext-input" 
            ${ref(me.#inputRef)}
            id=${ifDefined(id)} 
            @blur="${me.#onBlur.bind(me)}"
            @input="${me.#onRange.bind(me)}"
            @change="${me.#onChange.bind(me)}"
        
            name="${name}" 
            type="${type}" 
            value="${ifDefined(value)}"
    
            class="${me.#cssField} ${me.cssField} ${me.#styleID}" 

            placeholder="${ifDefined(me.translate(me.placeholder))}"
            description="${ifDefined(me.translate(me.description))}"

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
            
            ?autofocus="${me.autofocus}"
            ?autocopy="${me.autocopy}"
            ?autoselect="${me.autoselect}"
            ?autocomplete="${me.autocomplete}"
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

  #onRange(e) {
    const me = this;
    if (me.isRange) {
      const el = me.#ouptutRef.value;
      if (el) el.innerHTML = me.value || '';
      me.field.title = me.value;
    }
    me.emit('input', e);
  }

  #onChange(e) {
    this.emit('change', e, true, true);
  }

  async #onBlur(e) {

    const me = this;
    const el = me.field;

    if (el.value.length === 0 || me.#patterns.length === 0) return;

    await me.validate(true, 2000);

    me.#onChange(e);
  }

  #validateAllowed() {
    const me = this;
    const slots = ['header', 'body', 'footer'];
    let list = Array.from(me.children).filter(el => el.slot && !slots.includes(el.slot));
    if (list.length > 0) throw new Error(`Custom element injection must contain slot="header|body|footer" attribute! Element: ${me.tagName}, ID: ${me.id}`);
    list = Array.from(me.children).filter(el => !el.slot);
    const tagList = ['TEMPLATE', 'GS-ITEM', 'DATALIST'];
    const allowed = GSDOM.isAllowed(list, tagList);
    if (!allowed) throw new Error(GSDOM.toValidationError(me, tagList));
  }

  async validate(focus = false, timeout = 0) {
    const me = this;    
    const el = me.field;
    const isValid = me.checkValidity();

    if (!isValid) {
      if (focus) el.focus();
      me.reportValidity();
      if (timeout) {
        await GSUtil.timeout(timeout);
        el.setCustomValidity('');
      }
    }

    return isValid;
  }

  checkValidity() {

    const me = this;
    const el = me.field;
    let isValid = true;

    if (!el) return true;

    const def = InputTypes.filter(o => o.type === el.type).pop();
    if (!def || def.ignore) return true;
    
    if (def.native) {
      isValid = el.checkValidity();          
    } else {
      const val = GSUtil.normalize(me.field.value);

      if (me.required && val.length === 0) {
        isValid = true;
      } else {
        for (const r of me.#patterns) {
          isValid = r.test(el?.value);
          if (isValid) break;
        }
      }
    }

    const msg = isValid ? '' : me.invalidMessage;
    el?.setCustomValidity(msg);

    return isValid;
  }

  reportValidity() {
    return this.field?.reportValidity();
  }

  get value() {
    return this.field?.value;
  }

  set value(val) {
    GSDOM.fromObject2Element(this.field, { [this.name]: val });
    this.validate();
    this.#onRange();
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
    return me.type === 'radio' && me.value?.includes(',');
  }

  get isCheckable() {
    const me = this;
    return me.isCheck || me.isRadio || me.isSwitch;
  }

  get isChecked() {
    return this.field.checked;
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

  get field() {
    return this.#inputRef.value;
  }

  static {
    this.define('gs-form-group');
  }

}