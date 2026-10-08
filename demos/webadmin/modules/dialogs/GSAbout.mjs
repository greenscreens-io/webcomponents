/*
* Copyright (C) 2015, 2026 Green Screens Ltd.
*/

/**
 * A module loading GSAbout class
 * @module dialogs/GSAbout
 */
import { GSModal } from '/webcomponents/release/esm/io.greenscreens.components.all.esm.min.js';

export default class GSAbout extends GSModal {

    static #version = '6.0.0.';
    static #build = '01.02.2023. 15:00:00';

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

	/* Security issue
    get user() {
        return this.opt['user.name'] || '';
    }
    
    get home() {
        return this.opt['user.home'] || '';
    }
    
    get root() {
        return this.opt['user.dir'] || '';
    }
    */
    
    get #html() {
        const me = this;
        return `
        <div slot="body" class="text-center">
            <div>Version : <span>${me.version}</span></div>
            <div>Build : <span>${me.build}</span></div>
        </div>
        `;
        /* Security issue
            <div>User : <span>${me.user}</span></div>
            <div>Home : <span>${me.home}</span></div>
            <div>Root : <span>${me.root}</span></div>
        */
    }
}