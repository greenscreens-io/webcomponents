/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

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

}  