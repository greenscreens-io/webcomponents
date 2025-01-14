/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

import { GSUtil } from "../../../base/GSUtil.mjs";

/**
 * Handle automatic field value copy and select
 */
export class CopySelectController {

  #host;

  #clickCallback;
  #copyCallback;

  constructor(host) {
    const me = this;
    me.#host = host;
    me.#clickCallback = me.#onClick.bind(me);
    me.#copyCallback = me.#onCopy.bind(me);
    host.addController(me);
  }

  hostConnected() {
    const me = this;
    me.#host.on('click', me.#clickCallback);
    me.#host.on('copy', me.#copyCallback);
  }

  hostDisconnected() {
    const me = this;
    me.#host.removeController(me);
    me.#host.off('click', me.#clickCallback);
    me.#host.off('copy', me.#copyCallback);
  }

  #onCopy() {
    GSUtil.writeToClipboard(this.#host.value);
  }

  #onClick(e) {
      const me = this;
      if (me.#host.autocopy) GSUtil.writeToClipboard(me.#host.value);
      if (me.#host.autoselect) me.#host.select();
  }

}  