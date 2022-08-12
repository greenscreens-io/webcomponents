/*
 * © Green Screens Ltd., 2016. - 2022.
 */

/**
 * A module loading GSModal class
 * @module components/GSModal
 */

import GSElement from "../base/GSElement.mjs";
import GSUtil from "../base/GSUtil.mjs";

/**
 * Bootstrap modal dialog support
 * @class
 * @extends {GSElement}
 */
 export default class GSModal extends GSElement {

  static {
    customElements.define('gs-modal', GSModal);
  }

  static get observedAttributes() {
    const attrs = ['cancelable', 'closable', 'title', 'visible'];
    return  GSUtil.mergeArrays(attrs, super.observedAttributes );
  }

  attributeCallback(name = '', oldValue = '', newValue = '') {
    const me = this;
    me.#update();
    if (name === 'visible') {
      if (me.visible) {
        me.#showEL('.modal');
        me.#showEL('.modal-backdrop');
        me.focusable().focus();
      } else {
        me.#hideEL('.modal');
        me.#hideEL('.modal-backdrop');
        me.normal();
      }
      GSUtil.sendEvent(me, 'action', {type:'modal', ok: me.visible });
    }
  }
  
  onReady() {
    const me = this;
    const btns = me.findAll('.modal-footer .btn');
    Array.from(btns).forEach(btn => me.attachEvent(btn, 'click', me.#onClick.bind(me)));
    super.onReady();
    if (me.visible) me.open();
  }

  #onClick(e) {
    const me = this;
    try {
      const isOk = e.target.className.indexOf('ok') > 0;
      const obj = GSUtil.toObject(me.body);
      GSUtil.sendEvent(me, 'action', { type:'modal', ok: isOk, data: obj });
    } finally {
      me.close();
      GSUtil.preventEvent(e);
    }
  }

  #setSize(size = '') {
    const me = this;
    const dlg = me.findEl('.modal-dialog');
    if (!dlg) return;
    requestAnimationFrame(()=> {
      dlg.classList.remove('modal-xl', 'modal-lg');
      if (size) dlg.classList.add(size);
    });  
  }

  large() {
    this.#setSize('modal-lg');
  }

  extra() {
    this.#setSize('modal-xl');
  }

  normal() {
    this.#setSize();
  }

  info(title = '', message = '', closable = false, cancelable = false) {
    const me = this;
    me.title = title;
    me.body = message;
    me.cancelable = cancelable;
    me.closable = closable;
    me.open();
    if (closable || cancelable) return me.waitEvent('action');
  }

  confirm(title = '', message = '') {
    const me = this;
    return me.info(title, message, true, false);
  }

  prompt(title = '', message = '') {
    const me = this;
    return me.info(title, message, true, true);
  }

  open() {
    this.visible = true;
  }
  
  close() {
    this.visible = false;
  }
  
  toggle() {
    const me = this;
    me.visible = !me.visible;
  }

  focusable() {
    const me = this;
    if (me.cancelable) return me.buttonCancel;
    if (me.closable) return me.buttonOK;
    return me;
  }

  #showEL(name) {
    const el = this.findEl(name);
    if (!el) return;
    el.classList.remove('d-none');
    el.classList.add('show', 'd-block');
  }

  #hideEL(name) {    
    const el = this.findEl(name);
    if (!el) return;
    el.classList.add('d-none');
    el.classList.remove('show', 'd-block');
  }

  #update() {
    const me = this;
    GSUtil.toggleClass(me.buttonOK, !me.closable);
    GSUtil.toggleClass(me.buttonCancel, !me.cancelable);
    const css = `justify-content-${me.align}`;
    const footer = me.findEl('.modal-footer');
    GSUtil.toggleClass(footer, true, css);
  }

  get title() {
    return GSUtil.findSlotOrEl(this, 'title', '.modal-title');
  }

  set title(val = '') {
    this.title.innerHTML = val;
  }

  get body() {
    return GSUtil.findSlotOrEl(this, 'body', '.modal-body');
  }

  set body(val = '') {
    this.body.innerHTML = val;
  }

  get visible() {
    return GSUtil.getAttributeAsBool(this, 'visible', false);
  }

  set visible(val = false) {
    GSUtil.setAttribute(this, 'visible', val == true);    
  }

  get closable() {
    return GSUtil.getAttributeAsBool(this, 'closable', true);
  }

  set closable(val = true) {
    GSUtil.setAttribute(this, 'closable', val == true);
    this.#update();
  }

  get cancelable() {
    return GSUtil.getAttributeAsBool(this, 'cancelable', true);
  }

  set cancelable(val = true) {
    GSUtil.setAttribute(this, 'cancelable', val == true);
    this.#update();
  }

  /**
   * Align buttons start | end | center
   */
  get align() {
    return GSUtil.getAttribute(this, 'align', 'end');
  }

  set align(val = 'end') {
    GSUtil.setAttribute(this, 'align', val);
    this.#update();
  }

  get titleOk() {
    return this.buttonOK.innerText;
  }

  set titleOk(val = 'Ok') {
    this.buttonOK.innerText = val;
  }

  get titleCancel() {
    return this.buttonCancel.innerText;
  }

  set titleCancel(val = 'Cancel') {
    this.buttonCancel.innerText = val;
  }

  get buttonOK() {
    return this.findEl('.modal-ok');
  }

  get buttonCancel() {
    return this.findEl('.modal-cancel');
  }

  async getTemplate(val = '') {
    if (val) return super.getTemplate(val || '//modal.tpl');
    return `
        <div class="modal d-none fade">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header border-0">
              <div class="modal-title">
                <slot name="title"></slot>
              </div>
            </div>
            <div class="modal-body">
              <slot name="body"></slot>
            </div>
            <div class="modal-footer border-0">
              <button class="btn modal-cancel">Cancel</button>
              <button class="btn modal-ok">Ok</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop d-none fade "></div>    
    `
  }
}

