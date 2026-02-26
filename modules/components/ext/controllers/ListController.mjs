/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { GSAttr } from "../../../base/GSAttr.mjs";
import { GSDOM } from "../../../base/GSDOM.mjs";
import { InteractiveController } from "./InteractiveController.mjs";

/**
 * Handle data filtering for list atribute, and linked fields.
 * Changes in one field list, update available selections in another field selections.
 */
export class ListController extends InteractiveController {

  constructor(host) {
    super(host);
  }

  get list() {
    const me = this;
    if (me.component.list) return me.component.list;
    const list = GSAttr.get(me.component, 'list');
    return GSDOM.getByID(me.owner, list);
  }

}  