/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSEvents } from '../../base/GSEvents.mjs';

import { ValidityController } from './controllers/ValidityController.mjs';
import { CopySelectController } from './controllers/CopySelectController.mjs';
import { PasswordController } from './controllers/PasswordController.mjs';
import { NumberController } from './controllers/NumberController.mjs';
import { TextController } from './controllers/TextController.mjs';
import { ComboController } from './controllers/ComboController.mjs';
import { FormController } from './controllers/FormController.mjs';
import { DataController } from "../../controllers/DataController.mjs";

/**
 * Helper class wizh shared code for form elements to process controllers.
 */
export class ControllerHandler {


  #host = undefined;
  #handlers = undefined;
  #controllers = undefined;

  #copyselect = undefined;
  #typeController = undefined;
  #validityController = undefined;
  #comboController = undefined;

  #formController = undefined;
  #dataController = undefined;

  constructor(host) {
    this.#host = host;
  }

  connectedCallback() {
    const me = this;
    const host = me.#host;

    if (me.isForm) {
      host.on('reset', me.#onReset.bind(me));
      host.on('submit', me.#onSubmit.bind(me));
      host.on('formdata', me.#onFormData.bind(me));
    } else {
      host.on('keydown', me.#onKeyDown.bind(me));
      host.on('keyup', me.#onKeyUp.bind(me));
      host.on('input', me.#onInput.bind(me));
      host.on('focus', me.#onFocus.bind(me));
    }

    // field events catched at the form level also 
    host.on('change', me.#onChange.bind(me));
    host.on('blur', me.#onBlur.bind(me));
    host.on('invalid', me.#onInvalid.bind(me));

    me.#invoke((c) => c.hostConnected?.());
  }

  disconnectedCallback() {
    const me = this;
    GSEvents.detachListeners(me.#host);
    me.#invoke((c) => c.hostDisconnected?.());

    me.#controllers?.clear();

    me.#host = undefined;
    me.#handlers = undefined;
    me.#controllers = undefined;
    me.#comboController = undefined;

    me.#formController = undefined;
    me.#dataController = undefined;

    me.#copyselect = undefined;
    me.#typeController = undefined;
    me.#validityController = undefined;
  }

  hostUpdated(name) {
    const me = this;
    if (!me.#host.hostUpdated) {
      me.#initControllers();
      me.#host.checkValidity?.();
    }
    this.#invoke((c) => c.hostUpdated?.(name));
  }

  validate() {
    this.#invoke((c) => c.validate?.());
  }

  addController(controller) {
    if (!controller) return;
    const me = this;
    me.#controllers ??= new Set();
    me.#controllers.add(controller);
    me.#prepare();
    if (me.#host.isConnected) {
      controller.hostConnected?.();
    }
  }

  removeController(controller) {
    const me = this;
    me.#controllers?.delete(controller);
    me.#prepare();
  }

  #prepare() {
    const me = this;
    me.#handlers = me.#controllers ? Array.from(me.#controllers).reverse() : [];
  }

  #invoke(callback) {
    if (typeof callback === 'function') {
      this.#handlers?.forEach(callback);
    }
  }

  validate(e) {
    return this.#handlers ? this.#handlers.every(c => c.validate ? c.validate(e) : true) : true;
  }

  #onInvalid(e) {
    this.#invoke(c => c.onInvalid?.(e));
  }

  #onKeyDown(e) {
    this.#invoke(c => c.onKeyDown?.(e));
  }

  #onKeyUp(e) {
    this.#invoke(c => c.onKeyUp?.(e));
  }

  #onInput(e) {
    this.#invoke(c => c.onInput?.(e));
  }

  #onFocus(e) {
    this.#invoke(c => c.onFocus?.(e));
  }

  #onChange(e) {
    this.#invoke(c => c.onChange?.(e));
  }

  #onBlur(e) {
    this.#invoke(c => c.onBlur?.(e));
  }

  #onReset(e) {
    this.#invoke(c => c.onReset?.(e));
  }
  
  #onSubmit(e) {
    this.#invoke(c => c.onSubmit?.(e));
  }
  
  #onFormData(e) {
    this.#invoke(c => c.onFormData?.(e));
  }

  #initControllers() {
    const me = this;
    const host = me.#host;

    if (me.isForm) {
      me.#formController ??= new FormController(host);
    } else {
      me.#validityController ??= new ValidityController(host);
      if (me.isInput) me.#initIinputControllers();
      if (me.isTextArea) me.#initTextAreaControllers();
      if (me.isSelect) me.#comboController ??= new ComboController(host);
    }

    if (host.storage) {
      if (me.isSelect || me.isDataList ) {
        me.#dataController ??= new DataController(host);
      }
    }
  }

  #initTextAreaControllers() {
      const me = this;
      const host = me.#host;
      me.#typeController ??= new TextController(host);
      me.#copyselect ??= new CopySelectController(host);
  }

  #initIinputControllers() {
    const me = this;
    const host = me.#host;
    let ok = false;
    switch (host.type) {
      case 'text':
        ok = true;
        me.#typeController ??= new TextController(host);
        break;
      case 'password':
        ok = true;
        me.#typeController ??= new PasswordController(host);
        break;
      case 'number':
        ok = true;
        me.#typeController ??= new NumberController(host);
        break;
    }
    if (ok) {
      me.#copyselect ??= new CopySelectController(host);
    }
  }

  get tagName() {
    return this.#host?.tagName;
  }

  get isForm() {
    return (this.tagName === 'FORM');
  }

  get isTextArea() {
    return (this.tagName === 'TEXTAREA');
  }

  get isInput() {
    return (this.tagName === 'INPUT');
  }

  get isSelect() {
    return (this.tagName === 'SELECT');
  }

  get isDataList() {
    return (this.tagName === 'DATALIST');
  }
}
