/*
* Copyright (C) 2015, 2025 Green Screens Ltd.
*/

import { html } from "/webcomponents/release/esm/lit-all.min.js";
import { GSDialogElement} from "/webcomponents/release/esm/io.greenscreens.components.all.min.js";

/**
 * A module loading GSAbout class
 * @module dialogs/GSAbout
 */
export class GSAbout extends GSDialogElement {

    static #version = '6.0.0.';
    static #build = '20.01.2025. 15:00:00';

    static {
        this.define('gs-admin-dialog-about');
    }

    constructor() {
        super();
        const me = this;
        me.buttonAlign = 'center';
        me.cancelable = false;
        me.escapable = true;
        me.closable = true;
        me.shadow = true; 
        me.rounded = true;
        me.opened = true;
        me.cssHeader = 'bg-white';
    }

    firstUpdated() {
        const me = this;
        me.on('notify', me.#onNotify.bind(me));
        super.firstUpdated();
    }

    get version() {
        return globalThis.Tn5250?.opt?.version || GSAbout.#version;
    }

    get build() {
        return globalThis.Tn5250?.opt?.build || GSAbout.#build;
    }

    renderTemplate() {
        const me = this;
        return html`
        <div class="text-center">
            <div>Version : <span>${me.version}</span></div>
            <div>Build : <span>${me.build}</span></div>
        </div>
        `;
    }

    #onNotify(e) {
        if (!this.opened) {
            this.remove();
        }
    }
}