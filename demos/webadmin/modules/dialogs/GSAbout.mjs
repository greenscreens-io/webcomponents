/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSAbout class
 * @module dialogs/GSAbout
 */
import { GSModal } from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';

export default class GSAbout extends GSModal {

    static #version = '6.0.0.';
    static #build = '20.10.2022. 15:00:00';

    static {
        customElements.define('gs-admin-dialog-about', GSAbout);
        Object.seal(GSAbout);
    }

    constructor() {
        super();
        this.align = 'center';
    }

    onReady() {
        super.onReady();
        const me = this;
        me.confirm(undefined, me.#html);
    }

    get opt() {
        return globalThis.Tn5250?.opt || {};
    }
    
    get version() {
        return this.opt.version || GSAbout.#version;
    }

    get build() {
        return this.opt.build || GSAbout.#build;
    }

    get #html() {
        const me = this;
        return `
        <div slot="body" class="text-center">
            <div>Version : <span>${me.version}</span></div>
            <div>Build : <span>${me.build}</span></div>
        </div>
        `;
    }
}