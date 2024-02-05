/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */
import { GSDOM } from "../../../modules/base/GSDOM.mjs";

class GSColorCombo extends HTMLSelectElement {

    static #THEMES = {};

    #listener;

    static async #load() {
        try {
            const res = await fetch('/bootstrap-lit/demos/extension/data/themes.json');
            if (res.ok) GSColorCombo.#THEMES = await res.json();
        } catch (e) {
            console.log(e);
        }
    }

    disconnectedCallback() {
        const me = this;
        me.removeEventListener('change', me.#listener);
    }

    connectedCallback() {
        const me = this;
        me.innerHTML = me.#options;
        me.#listener = me.#onChange.bind(me);
        me.addEventListener('change', me.#listener);
    }

    #onChange(e) {
        const id = e.target.value;
        const theme = GSColorCombo.#THEMES[id] || {};
        GSDOM.queryAll(this.#form, 'input[type="color"]')
            .forEach(el => el.value = theme[el.name]);
    }

    get #options() {
        return Object.entries(GSColorCombo.#THEMES)
            .map(kv => `<option value="${kv[0]}">${kv[1]["#name"]}</option>`).join('');
    }

    get #form() {
        return this.closest('form');
    }

    static {
        customElements.define('gs-ext-color', GSColorCombo, { extends: 'select' })
        Object.seal(GSColorCombo);
        GSColorCombo.#load();
    }

}