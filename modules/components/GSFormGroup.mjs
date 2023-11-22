/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSFormGroup class
 * @module components/GSFormGroup
 */

import GSAttr from "../base/GSAttr.mjs";
import GSElement from "../base/GSElement.mjs";
import GSUtil from "../base/GSUtil.mjs";
import GSItem from "../base/GSItem.mjs";

/**
 * Center inside browser
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#list
 * @class
 * @extends {GSElement}
 */
export default class GSFormGroup extends GSElement {

   static CSS_LABEL_CELL = 'col-md-4 col-sm-4 col-xs-2 text-md-end';
   static CSS_LABEL = 'user-select-none fw-small fw-light text-secondary';
   static CSS_ICON = 'bi bi-info-circle-fill text-primary me-2 fs-5';

   #patterns = [];

   static {
      customElements.define('gs-form-group', GSFormGroup);
      Object.seal(GSFormGroup);
   }

   static get observedAttributes() {
      const attrs = ['value', 'label', 'disabled'];
      return GSElement.observeAttributes(attrs);
   }

   constructor() {
      super();
      this.#validateAllowed();
   }

   connectedCallback() {
      const me = this;
      me.#patterns = GSItem.genericItems(me)
         .filter(el => el.dataset.pattern)
         .map(el => new RegExp(el.dataset.pattern));
      super.connectedCallback();
   }

   disconnectedCallback() {
      super.disconnectedCallback();
      const me = this;
      me.#patterns = null;
   }

   attributeCallback(name = '', oldValue = '', newValue = '') {
      const me = this;
      if (name === 'label') me.#labelEl.innerHTML = newValue;
      if (name === 'value') me.#inputEl.value = newValue;
      if (name === 'disabled') me.#inputEl.disabled = !GSUtil.isNull(newValue);
   }


   onReady() {
      super.onReady();
      const me = this;
      me.attachEvent(me.#inputEl, 'blur', me.#onBlur.bind(me));
      if (me.#isRange) {
         me.attachEvent(me.#inputEl, 'input', me.#onRange.bind(me));
         me.#onRange();
      } 
   }

   #onRange(e) {
      const me = this;
      const el = me.#outputEl;
      if (el) el.innerHTML = me.#inputEl?.value || '';
   }

   async #onBlur(e) {

      const me = this;
      const el = me.#inputEl;
      
      if (el.value.length === 0 || me.#patterns.length === 0) return;

      let isValid = false;
      for (const r of me.#patterns) {
         isValid = r.test(el.value);
         if (isValid) break;
     }

      if (!isValid) {
         el.setCustomValidity('Invalid input');
         el.reportValidity();
         me.#inputEl.focus();
         await GSUtil.timeout(2000);
         el.setCustomValidity('');
      }
   }


   #validateAllowed() {
      const me = this;
      const slots = ['header', 'body', 'footer'];
      let list = Array.from(me.children).filter(el => el.slot && !slots.includes(el.slot));
      if (list.length > 0) throw new Error(`Custom element injection must contain slot="header|body|footer" attribute! Element: ${me.tagName}, ID: ${me.id}`);
      list = Array.from(me.children).filter(el => !el.slot);
      const tagList = ['TEMPLATE', 'GS-ITEM'];
      const allowed = GSDOM.isAllowed(list, tagList);
      if (!allowed) throw new Error(GSDOM.toValidationError(me, tagList));
   }

   get isFlat() {
      const me = this;
      return me.hasAttribute('flat') ? super.isFlat : true;
   }

   async getTemplate() {
      const me = this;
      switch (me.layout) {
         case 'floating': return me.#getFloating();
         case 'vertical': return me.#getVertical();
         default: return me.#getHorizontal();
      }
   }

   #getFloating() {
      const me = this;
      return `
      <div class="row ${me.css}">
         <div class="form-floating ${me.#cssCheck} ${me.cellField}">
            ${me.#input}
            ${me.#label}
         </div>
         ${me.#info}
      </div>`;
   }

   #getVertical() {
      const me = this;
      return `
      <div class="row ${me.css}">
        <div class="col-12">
            ${me.#label}
        </div>
         <div class="${me.#cssCheck} ${me.cellField}">
            ${me.#input}
         </div>
         ${me.#info}   
      </div>      
      `;
   }

   #getHorizontal() {
      const me = this;
      return `
      <div class="row form-group ${me.css}">
         <slot name="header"></slot>
         ${me.#labelWrap}
         ${me.#field}
         ${me.#info}
         <slot name="footer"></slot>
      </div>`;
   }

   get #outputEl() {
      return this.query('input').nextElementSibling;
   }

   get #inputEl() {
      return this.query('input');
   }

   get #labelEl() {
      return this.query('label');
   }

   get #isFieldset() {
      const me = this;
      return me.type === 'radio' && me.#value.includes(',');
   }

   get #input() {
      const me = this;
      const tpl = me.query('template');
      if (tpl) return tpl.innerHTML;
      const idattr = me.autoid ? `id="${me.name}"` : '';
      const val = me.#isFieldset ? me.value.split(',') : me.#value;

      if (Array.isArray(val)) {
         const wrap = me.dataset.radioLayout === 'vertical' ? 'div' : 'span';
         return val.map((it, i) => {return { v:it, h:`value="${it}"`, id : `id="${me.name}_${i}"`}})
         .map((o, i) => me.#fieldSet(me.name+i, o.v, me.#inputHTML(o.id, me.name, o.h, o.v), wrap))
         .join('');
      }

      return me.#inputHTML(idattr, me.name, me.#value, me.value);
   }

   #inputHTML(id, name, value, val ) {
      const me = this;
      const sel = GSAttr.get(me, 'checked');
      const checked = (me.#isCheckable && me.checked && val && val == sel) ? 'checked' : '';
      
      return `<input is="gs-ext-input" class="${me.#cssField} ${me.cssField}" 
               ${id} name="${name}" type="${me.#type}" ${me.#placeholder}
               ${me.#autocopy} ${me.#autoselect} ${me.#autofocus}
               ${me.#autocomplete} ${me.#autocapitalize} ${me.#multiple} ${checked}
               ${me.#mask} ${me.#pattern} ${value} ${me.#list} ${me.#accept}
               ${me.#step} ${me.#min} ${me.#max} 
               ${me.#minlength} ${me.#maxlength} title="${me.description}"
               ${me.#readonly} ${me.#required} ${me.#disabled} ${me.#reveal}
               >`;
   }

   #fieldSet(id, val, fld, wrap='span') {
      return `<${wrap} class="me-3">
               ${fld}
               <label for="${id}" class="ms-1">${val}</label>
              </${wrap}>`;
   }

   get #label() {
      const me = this;
      return `<label class="${me.#cssLabel} ${me.cssLabel} user-select-none" for="${me.name}">${me.label}</label>`;
   }

   get #labelWrap() {
      const me = this;
      return `<div class="${me.cellLabel}">${me.#label}</label></div>`;
   }

   get #cssField() {
      const me = this;
      if (me.#isCheckable) return 'form-check-input ms-0';
      if (me.#isRange) return 'form-range';
      return 'form-control';
   }

   get #cssLabel() {
      const me = this;
      if (me.#isCheckable) return 'form-check-label';
      if (me.layout === 'floating') return 'ms-2';
      return me.#isVertical ? 'form-label' : '';
   }

   get #cssCheck() {
      const me = this;
      if (me.#isCheckable) {
         //return me.#isSwitch ? 'form-check form-switch ps-3 fs-5' : 'form-check';
         if (me.#isSwitch) return 'form-check form-switch ps-3 fs-5';
         return me.#isFieldset ? '' : 'form-check';
      }
      return '';
   }

   get #field() {
      const me = this;
      return `
      <div class="${me.#cssCheck} ${me.cellField}">
         <slot name="body">${me.#input}${me.#output}</slot>
      </div>`;
   }

   get #output() {
      const me = this;
      if (!me.#isRange) return "";
      return `<span class="position-absolute px-1">${me.value}</span>`; 
   }

   get #info() {
      const me = this;
      if (!me.#hasTooltip) return '';
      if (!me.#tooltip) return '';
      if (me.hasIcon) return `
      <div class="col-auto">
         ${me.#tooltip}
         ${me.#icon}
      </div>`;
      return me.#tooltip;
   }

   get #autocopy() {
      return this.autocopy ? `autocopy` : '';
   }
   
   get #autofocus() {
      return this.autofocus ? `autofocus` : '';
   }
   
   get #autoselect() {
      return this.autoselect ? `autocopy` : '';
   }

   get hasIcon() {
      return GSAttr.get(this, 'icon') !== 'false';
   }

   get #icon() {
      const me = this;
      return me.hasIcon ? `<i class="${me.icon}"></i>` : '';
   }

   get #type() {
      const me = this;
      return me.#isSwitch ? 'checkbox' : me.type;
   }

   get #isCheckable() {
      const me = this;
      return me.#isChecked || me.#isRadio || me.#isSwitch;
   }

   get #hasTooltip() {
      return customElements.get('gs-tooltip');
   }

   get #tooltip() {
      const me = this;
      const tgt = me.hasIcon ? '' : `target="${me.name}"`;
      return me.description.trim() ? `<gs-tooltip placement="${me.placement}" title="${me.description}" ${tgt}></gs-tooltip>` : '';
   }

   get #placeholder() {
      return this.placeholder ? `placeholder="${this.placeholder}"` : '';
   }

   get #pattern() {
      const me = this;
      return me.#isText && me.pattern ? `pattern="${me.pattern}"` : '';
   }

   get #mask() {
      const me = this;
      return me.#isText && me.mask ? `mask="${me.mask}"` : '';
   }

   get #reveal() {
      return this.reveal ? `reveal` : '';
   }

   get #disabled() {
      return this.disabled ? `disabled` : '';
   }

   get #checked() {
      const me = this;
      return me.#isCheckable && me.checked ? `checked` : '';
   }

   get #isVertical() {
      return this.layout === 'vertical';
   }

   get #isChecked() {
      return this.type === 'checkbox';
   }

   get #isRadio() {
      return this.type === 'radio';
   }

   get #isSwitch() {
      return this.type === 'switch';
   }

   get #isNumber() {
      return this.type === 'number';
   }

   get #isRange() {
      return this.type === 'range';
   }

   get #isText() {
      return this.type === 'text';
   }

   get #isPassword() {
      return this.type === 'passsword';
   }

   get #isEmail() {
      return this.type === 'email';
   }

   get #isURL() {
      return this.type === 'url';
   }

   get #isFile() {
      return this.type === 'file';
   }

   get #multiple() {
      return this.multiple ? `multiple` : '';
   }

   get #readonly() {
      return this.readonly ? `readonly` : '';
   }

   get #required() {
      return this.required ? `required` : '';
   }

   get #accept() {
      const me = this;
      return me.#isFile && me.accept ? `accept="${me.accept}"` : '';
   }

   get #autocapitalize() {
      return this.autocapitalize ? `autocapitalize="${this.autocapitalize}"` : '';
   }

   get #autocomplete() {
      return this.autocomplete ? `autocomplete="${this.autocomplete}"` : '';
   }

   get #value() {
      return this.value ? `value="${this.value}"` : '';
   }

   get #list() {
      return this.list ? `list="${this.list}"` : '';
   }

   get #max() {
      const me = this;
      return isNaN(me.max) ? '' : `max="${me.max}"`;
   }

   get #min() {
      const me = this;
      return isNaN(me.min) ? '' : `min="${me.min}"`;
   }

   get #maxlength() {
      const me = this;
      return isNaN(me.maxlength) ? '' : `maxlength="${me.maxlength}"`;
   }

   get #minlength() {
      const me = this;
      return isNaN(me.minlength) ? '' : `minlength="${me.minlength}"`;
   }

   get #step() {
      const me = this;
      return isNaN(me.step) ? '' : `step="${me.step}"`;
   }

   get css() {
      return GSAttr.get(this, 'css', '');
   }

   set css(val = '') {
      return GSAttr.set(this, 'css', val);
   }

   get cellLabel() {
      return GSAttr.get(this, 'cell-label', GSFormGroup.CSS_LABEL_CELL);
   }

   set cellLabel(val = '') {
      return GSAttr.set(this, 'cell-label', val);
   }

   get cellField() {
      const me = this;
      const val = (me.layout === 'horizontal') ? '6' : '11';
      return GSAttr.get(me, 'cell-field', `col-md-${val} col-sm-${val} col-xs-11`);
   }

   set cellField(val = '') {
      return GSAttr.set(this, 'cell-field', val);
   }

   get cssLabel() {
      return GSAttr.get(this, 'css-label', GSFormGroup.CSS_LABEL);
   }

   set cssLabel(val = '') {
      return GSAttr.set(this, 'css-label', val);
   }

   get cssField() {
      const me = this;
      const mono = me.mask?.trim().length > 0 ? ' font-monospace ' : '';
      return mono + GSAttr.get(this, 'css-field', '');
   }

   set cssField(val = '') {
      return GSAttr.set(this, 'css-field', val);
   }

   /**
    * Visual layout (horizontal | vertical | floating)
    */
   get layout() {
      return GSAttr.get(this, 'layout', 'horizontal');
   }

   set layout(val = '') {
      return GSAttr.set(this, 'layout', val);
   }

   get description() {
      return GSAttr.get(this, 'description', '');
   }

   set description(val = '') {
      return GSAttr.set(this, 'description', val);
   }

   get placement() {
      const me = this;
      const dft = me.hasIcon ? 'right' : 'top';
      return GSAttr.get(this, 'placement', dft);
   }

   set placement(val = '') {
      return GSAttr.set(this, 'placement', val);
   }

   get icon() {
      return GSAttr.get(this, 'icon', GSFormGroup.CSS_ICON);
   }

   set icon(val = '') {
      return GSAttr.set(this, 'icon', val);
   }

   get label() {
      return GSAttr.get(this, 'label', '');
   }

   set label(val = '') {
      return GSAttr.set(this, 'label', val);
   }

   get placeholder() {
      return GSAttr.get(this, 'placeholder', '');
   }

   set placeholder(val = '') {
      return GSAttr.set(this, 'placeholder', val);
   }

   get name() {
      return GSAttr.get(this, 'name', '');
   }

   set name(val = '') {
      return GSAttr.set(this, 'name', val);
   }

   get type() {
      return GSAttr.get(this, 'type', 'text');
   }

   set type(val = '') {
      return GSAttr.set(this, 'type', val);
   }

   get pattern() {
      return GSAttr.get(this, 'pattern', '');
   }

   set pattern(val = '') {
      return GSAttr.set(this, 'pattern', val);
   }

   get mask() {
      return GSAttr.get(this, 'mask', '');
   }

   set mask(val = '') {
      return GSAttr.set(this, 'mask', val);
   }

   get reveal() {
      return this.hasAttribute('reveal');
   }

   set reveal(val = '') {
      return GSAttr.toggle(this, 'reveal', GSUtil.asBool(val));
   }

   get disabled() {
      return this.hasAttribute('disabled');
   }

   set disabled(val = '') {
      return GSAttr.toggle(this, 'disabled', GSUtil.asBool(val));
   }

   get checked() {
      return this.hasAttribute('checked');
   }

   set checked(val = '') {
      return GSAttr.toggle(this, 'checked', GSUtil.asBool(val));
   }

   get multiple() {
      return this.hasAttribute('multiple');
   }

   set multiple(val = '') {
      return GSAttr.toggle(this, 'multiple', GSUtil.asBool(val));
   }

   get readonly() {
      return this.hasAttribute('readonly');
   }

   set readonly(val = '') {
      return GSAttr.toggle(this, 'readonly', GSUtil.asBool(val));
   }

   get required() {
      return this.hasAttribute('required');
   }

   set required(val = '') {
      return GSAttr.toggle(this, 'required', GSUtil.asBool(val));
   }

   get accept() {
      return GSAttr.get(this, 'accept', '');
   }

   set accept(val = '') {
      return GSAttr.set(this, 'accept', val);
   }

   get autocopy() {
      return this.hasAttribute('autocopy');
   }

   get autofocus() {
      return this.hasAttribute('autofocus');
   }

   get autoselect() {
      return this.hasAttribute('autoselect');
   }

   get autocapitalize() {
      return GSAttr.get(this, 'autocapitalize', '');
   }

   set autocapitalize(val = '') {
      return GSAttr.set(this, 'autocapitalize', val);
   }

   get autocomplete() {
      return GSAttr.get(this, 'autocomplete', '');
   }

   set autocomplete(val = '') {
      return GSAttr.set(this, 'autocomplete', val);
   }

   get value() {
      return GSAttr.get(this, 'value', '');
   }

   set value(val = '') {
      return GSAttr.set(this, 'value', val);
   }

   get list() {
      return GSAttr.get(this, 'list', '');
   }

   set list(val = '') {
      return GSAttr.set(this, 'list', val);
   }

   get maxlength() {
      return GSAttr.getAsNum(this, 'maxlength', NaN);
   }

   set maxlength(val = '') {
      return GSAttr.setAsNum(this, 'maxlength', val);
   }

   get minlength() {
      return GSAttr.getAsNum(this, 'minlength', NaN);
   }

   set minlength(val = '') {
      return GSAttr.setAsNum(this, 'minlength', val);
   }

   get max() {
      return GSAttr.get(this, 'max', NaN);
   }

   set max(val = '') {
      return GSAttr.setAsNum(this, 'max', val);
   }

   get min() {
      return GSAttr.get(this, 'min', NaN);
   }

   set min(val = '') {
      return GSAttr.setAsNum(this, 'min', val);
   }

   get step() {
      return GSAttr.getAsNum(this, 'step', NaN);
   }

   set step(val = '') {
      return GSAttr.setAsNum(this, 'step', val);
   }

   get autoid() {
      return this.hasAttribute('autoid');
   }
}

