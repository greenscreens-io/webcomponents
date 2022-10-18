/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSAbout class
 * @module dialogs/GSAbout
 */
import GSModal from '../../../modules/components/GSModal.mjs';

export default class GSAbout extends GSModal {

    static #version = '6.0.0.';
    static #build = '15.09.2022. 15:00:00';

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

    get #html() {
        return `
        <div slot="body" class="text-center">
            <div>Version : <span>${GSAbout.#version}</span></div>
            <div>Build : <span>${GSAbout.#build}</span></div>
        </div>
        `;
    }
}