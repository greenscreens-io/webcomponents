/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { GSElement } from '../GSElement.mjs';

export class GSTextElement extends GSElement {

  #text = "";

  constructor() {
    super();
    this.flat = true;
    this.#text = this.innerText;
    this.innerText = "";
  }

  renderUI() {
    return this.translate(this.#text);
  }

  static {
    this.define('gs-text');
  }

}