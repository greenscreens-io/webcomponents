/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { GSAttr } from "../../../base/GSAttr.mjs";
import { InteractiveController } from "./InteractiveController.mjs";


/**
 * Handle data filtering for list atribute, and linked fields.
 * Changes in one field list, update available selections in another field selections.
 */
export class ComboController extends InteractiveController {

  constructor(host) {
    super(host);
  }

  get list() {
    return this.component;
  }

  onChange(e) {  
    super.onChange?.(e);
    this.#onAttributeHandler(e);
  }

  onBlur(e) {
    super.onBlur?.(e);
    this.#onAttributeHandler(e);
  }

  #onAttributeHandler(e) {
    const me = this;
    if (!me.component.toggling) return;
    const target = me.component.dataset.gsfTarget;
    const value = me.component.dataset.gsfValue;
    const attr = me.component.dataset.gsfAttribute;
    const flag = me.component.value === value;
    me.formElements
      .filter(el => el != me.component)
      .filter(el => target ? el.matches(target) : true)
      .forEach(el => GSAttr.toggle(el, attr, flag));
  }
}  