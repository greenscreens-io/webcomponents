/*
 * Copyright (C) 2015, 2022  Green Screens Ltd.
 */

/**
 * A module loading GSTheme class
 * @module base/GSTheme
 */

/**
 * Switch between dark and light mode
 * @Class
 */
export default class GSTheme {

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
        localStorage.setItem(GSTheme.#STORAGE, to);
    }

    /**
     * Get system default theme by media query
     * @returns {string} dark|light 
     */
    static getSystemDefaultTheme() {
        const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
        return darkThemeMq.matches ? 'dark' : 'light';
    }

    static #setup() {
        let settings = localStorage.getItem(GSTheme.#STORAGE);
        if (settings == null) {
            settings = GSTheme.getSystemDefaultTheme();
        }

        if (settings == 'dark') return GSTheme.darkMode();
        GSTheme.lightMode();
    }

    static {
        GSTheme.#setup();
    }

}
