/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSLog } from "../base/GSLog.mjs";
import { GSUtil } from "../base/GSUtil.mjs";
import { GSReadWriteRegistry } from "../data/ReadWriteRegistry.mjs";

/**
 * Controller between component and DataReadWrite.
 */
export class DataController {

  #host;

  #readCallback;
  #writeCallback;
  #errorCallback;
  #selectCallback;

  constructor(host) {
    const me = this;
    me.#host = host;
    me.#readCallback = me.#onRead.bind(me);
    me.#writeCallback = me.#onWrite.bind(me);
    me.#errorCallback = me.#onError.bind(me);
    me.#selectCallback = me.#onSelect.bind(me);
    me.#host.addController(me);
  }

  hostConnected() {
    const me = this;
    me.#listen(false);
  }

  hostDisconnected() {
    const me = this;
    me.#unlisten();
    me.#host.removeController(me);
  }

  async relink(read = true) {
    const me = this;
    me.#unlisten();
    me.#listen(read);
  }

  async read(obj) {
    return this.store?.read(this.#host);
  }

  async write(obj) {
    return this.store?.write(this.#host, obj);
  }

  async storage() {
    return GSReadWriteRegistry.wait(this.storeID);
  }

  sort(val) {
    if (!this.store) return;
    this.store.sort = val;
    return this.store.read();
  } 

  filter(val) {
    if (!this.store) return;
    this.store.filter = val;
    return this.store.read();
  }

  search(val) {
    if (!this.store) return;
    this.store.search = val;
  }

  firstPage() {
    this.page = 1;
  }

  lastPage() {
    this.nextPage();
  }

  nextPage() {
    this.page = this.page + 1;
  }

  prevPage() {
    this.page = this.page - 1;
  }

  get selected() {
    return this.store?.selected;
  }

  isSelected(val) {
    return this.store?.isSelected(val);
  }

  addSelected(val) {
    return this.store?.addSelected(val);
  }
  
  removeSelected(val) {
    return this.store?.removeSelected(val);
  }

  clearSelected(data) {
    return this.store?.clearSelected(data);
  }

  get store() {
    return GSReadWriteRegistry.find(this.storeID);
  }

  get storeID() {
    return this.#host?.storage;
  }

  get page() {
    const store = this.store;
    return store ? Math.floor(store.skip / Math.max(store.limit, 1)) + 1 : 1;
  }

  set page(val) {
    val = Math.max(1, GSUtil.asNum(val, 1));    
    const store = this.store;
    if (store) {
      store.skip = val > 0 ? (store.limit * val) - store.limit : 0;
      store.read(this.#host);
    }
  }

  async #listen(read = true) {
    const me = this;
    const storage = await me.storage();
    storage?.on('read', me.#readCallback);
    storage?.on('write', me.#writeCallback);
    storage?.on('error', me.#errorCallback);
    storage?.on('select', me.#selectCallback);
    if (read) storage.read(me.#host);
  }

  #unlisten() {
    const me = this;
    const storage = me.store;
    storage?.off('read', me.#readCallback);
    storage?.off('write', me.#writeCallback);
    storage?.off('error', me.#errorCallback);
    storage?.off('select', me.#selectCallback);
  }

  #onSelect(e) {
    this.#host.requestUpdate?.();
  }

  #onRead(e) {
    const me = this;
    me.#host.onDataRead?.(e.detail.data);
    me.#notify('data-read', e.detail.data);
  }

  #onWrite(e) {
    const me = this;
    me.#host.onDataWrite?.(e.detail.data);
    me.#notify('data-write', e.detail.data);
  }

  #onError(e) {
    const me = this;
    GSLog.error(me.#host, e);
    me.#host.onDataError?.(e);
    me.#notify('data-error', e.detail.data);
  }

  #notify(name, data) {
    this.#host.emit(name, data, true, false, true);
  }

}  