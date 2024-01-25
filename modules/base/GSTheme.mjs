/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

/**
 * A module loading GSTheme class
 * @module base/GSTheme
 */

/**
 * Switch between dark and light mode
 * @Class
 */
export class GSTheme {

    static #STORAGE = 'gs-theme-mode';

    /**
     * Changes the theme to 'dark mode' and save settings to local stroage.
     * Basically, replaces/toggles every CSS class that has '-light' class with '-dark'
     * @param {HTMLElement} el 
     */
    static darkMode(el) {
        GSTheme.#switch(el, 'light', 'dark');
    }

    /**
     * Changes the theme to 'light mode' and save settings to local stroage.
     * @param {HTMLElement} el 
     */
    static lightMode(el) {
        GSTheme.#switch(el, 'dark', 'light');
    }

    static #switch(el, from = 'light', to = 'dark') {

        const root = el || document.body;

        // TODO  switch dark/light mode ?!??!? 

        // save last state
        GSTheme.theme = to;
    }

    static get theme() {
        return localStorage.getItem(GSTheme.#STORAGE);
    }

    static set theme(val) {
        localStorage.setItem(GSTheme.#STORAGE, val);
        window.dispatchEvent(new CustomEvent('gs-theme', { detail: val }));
        const htmlEl = document.head.parentElement;
        if (val) {
            htmlEl.dataset.bsTheme = val;
        } else {
            delete htmlEl.dataset.bsTheme;
        }
    }

    /**
     * Get system default theme by media query
     * @returns {String} dark|light 
     */
    static getSystemDefaultTheme() {
        const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
        return darkThemeMq.matches ? 'dark' : 'light';
    }

    static #onTheme(e) {
        const q = new URLSearchParams(location.hash.slice(1));
        GSTheme.theme = q.get('theme');
    }

    static #setup() {
        window.addEventListener('hashchange', GSTheme.#onTheme)
        let settings = localStorage.getItem(GSTheme.#STORAGE);
        if (settings == null) {
            settings = GSTheme.getSystemDefaultTheme();
        }


        if (settings == 'dark') return GSTheme.darkMode();
        if (settings == 'light') return GSTheme.lightMode();
        // TODO switch

    }

    static {
        GSTheme.#setup();
        globalThis.GSTheme = GSTheme;
    }

}
