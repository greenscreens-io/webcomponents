/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */
import { GSAttr } from '../base/GSAttr.mjs';
import { GSEvents } from '../base/GSEvents.mjs';

/**
 * Listens for theme change and update component to apply new theme.
 * External theme changes only if component theme is not set.
 * Bootstrap uses CSS selector for theme in form of attribute value [data-bs-theme="***"]
 * Compoennt and all first level childern in shadow dom are updated
 */
export class ThemeController {

  #host;
  #theme;

  constructor(host) {
    const me = this;
    me.#host = host;
    me.#theme = host.theme;
    host.addController(me);
  }

  hostConnected() {
    ThemeController.#controllers.add(this);
  }

  hostDisconnected() {
    const me = this;
    ThemeController.#controllers.delete(me);
    me.#host.removeController(me);
  }

  hostUpdate(changes) {
    const me = this;
    if (me.#theme !== me.#host?.theme) {
      me.#theme === me.#host?.theme;
      me.updateTheme(me.#theme);
    }
  }

  updateThemeExt(theme) {
    if (!this.#theme) this.updateTheme(theme);
  }

  updateTheme(theme) {
    if (!theme) return;
    const me = this;
    GSAttr.set(me.#host, 'data-bs-theme', theme);
    const children = me.#host?.renderRoot?.children || [];
    Array.from(children).forEach(el => GSAttr.set(el, 'data-bs-theme', theme));
  }

  static #controllers = new Set();

  static #onTheme(e) {
    const me = ThemeController;
    me.#controllers.forEach(c => c.updateThemeExt(e.detail));
  }

  static #init() {
    GSEvents.on(window, null, 'gs-theme', ThemeController.#onTheme);
  }

  static {
    ThemeController.#init();
  }

}  
