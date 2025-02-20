/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

/**
 * A module loading GSSearch class
 * @module GSSearch
 */

import { html } from "/webcomponents/release/esm/lit-all.min.js";
import { GSEnvironment, GSEvents, GSElement} from "/webcomponents/release/esm/io.greenscreens.components.all.min.js";

/**
 * Search input box WebComponent which emits searh event to upper tree.
 * In this cse for GSTable filtering
 * @class
 * @extends {GSElement}
 */
class GSSearch extends GSElement {

    static properties = {
        css: {},
        name: {},
        placeholder: {},
        iconCSS: { attribute: 'css-icon' },
        inputCSS: { attribute: 'css-input' },
    };

    constructor() {
        super();
        this.name = 'search';
        this.placeholder = 'search';
        this.inputCSS = 'border-start-0';
        this.iconCSS = 'bg-white bi bi-search';
    }

    renderUI() {
        const me = this;
        return html`
        <div class="input-group ${me.css}">
            <i class="input-group-text ${me.iconCSS}"></i>
            <input type="search" incremental="true"
                 class="form-control ${me.inputCSS}" 
                 placeholder="${me.placeholder}" 
                 name="${me.name}">
        </div>        
        `;
    }

    firstUpdated() {
        super.firstUpdated();
        const me = this;
        if (GSEnvironment.isWebkit) {
            me.attachEvent(me.#searchEl, 'search', me.#onSearch.bind(me));
        } else {
            me.attachEvent(me.#searchEl, 'keydown', me.#onSearch.bind(me));
        }
    }

    #onSearch(e) {
        if (!GSEnvironment.isWebkit && e.which != 13) return;
        const me = this;
        GSEvents.prevent(e);
        const opt = { type: 'search', action: 'search', value: me.#searchEl.value };
        GSEvents.send(me, 'action', opt, true, true, true);
    }

    get #searchEl() {
        return this.query('input', true);
    }

    static {
        GSElement.define('gs-search', GSSearch);
    }

}
