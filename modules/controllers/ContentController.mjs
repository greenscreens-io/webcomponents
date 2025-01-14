/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

/**
 * Handle rendered content cleanup (remove by default)
 * Set "keep" to the component to prevent rendered content removal.
 */
export class ContentController {

  #host;
  #ref;
  #refs = new Set();

  constructor(host) {
    this.#host = host;
    host.addController(this);
  }

  hostDisconnected() {
    const me = this;
    me.#host.removeController(me);
    me.#removeContent();
    me.#host = null;
    me.#refs = null;
    me.#ref = null;
  }

  hostUpdated() {
    const me = this;
    if (!me.#isSelf()) me.#refs.add(me.#target);
  }

  get contentRef() {
    return this.#ref;
  }

  get #options() {
    return this.#host?.renderOptions;
  }

  get #target() {
    return this.#options?.renderBefore?.previousElementSibling;
  }

  #isSelf() {
    const me = this;
    const target = me.#target;
    const root = me.#host?.renderRoot;
    const shadow = me.#host?.shadowRoot;
    return (target === shadow || target == root);
  }

  #removeContent() {
    const me = this;
    if (!me.#host?.keep) {
      Array.from(me.#refs).forEach(el => el?.remove());
      me.#refs.clear();
    }
  }
}  