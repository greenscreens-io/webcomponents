/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { GSElement } from '../GSElement.mjs';

export class GSTextElement extends GSElement {

  #text = "";
  #captured = false;

  constructor() {
    super();
    this.flat = true;
  }

  renderUI() {
    if (!this.#captured) {
      this.#text = this.textContent;
      this.textContent = "";
      this.#captured = true;
    }
    return this.translate(this.#text);
  }

  static {
    this.define('gs-text');
  }

}