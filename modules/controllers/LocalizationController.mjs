/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */
import { GSEvents } from '../base/GSEvents.mjs';

/**
 * Listens for theme change and update component to apply new theme.
 * External theme changes only if component theme is not set.
 * Bootstrap uses CSS selector for theme in form of attribute value [data-bs-theme="***"]
 * Compoennt and all first level childern in shadow dom are updated
 */
export class LocalizationController {

  #host;
  #locale;

  constructor(host) {
    const me = this;
    me.#host = host;
    me.#locale = host.locale;
    host.addController(me);
  }

  hostConnected() {
    LocalizationController.#controllers.add(this);
  }

  hostDisconnected() {
    const me = this;
    LocalizationController.#controllers.delete(me);
    me.#host.removeController(me);
  }

  hostUpdate() {
    const me = this;
    if (me.#locale !== me.#host?.locale) {
      me.#locale === me.#host?.locale;
      me.updateLanguage(me.#locale);
    }
  }

  updateLanguageExt(langauge) {
    if (!this.#locale) this.updateLanguage(langauge);
  }

  updateLanguage(lang) {
    if (!lang) return;
    this.#host.requestUpdate();
  }

  static #controllers = new Set();

  static #onLanguage(e) {
    const me = LocalizationController;
    me.#controllers.forEach(c => c.updateLanguageExt(e.detail));
  }

  static #init() {
    GSEvents.on(window, null, 'gs-language', LocalizationController.#onLanguage);
  }

  static {
    LocalizationController.#init();
  }

}  
