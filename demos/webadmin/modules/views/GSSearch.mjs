/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

import { html, ref, createRef} from "/webcomponents/release/esm/lit-all.min.js";
import { GSEnvironment, GSEvents, GSElement} from "/webcomponents/release/esm/io.greenscreens.components.all.min.js";

/**
 * A module loading GSSearch class
 * @module GSSearch
 */

/**
 * Search input box WebComponent which emits search event to upper tree.
 * In this case for GSTable filtering
 * @class
 * @extends {GSElement}
 */
class GSSearch extends GSElement {

    static properties = {
        _css: {reflect: true, },
        name: {reflect: true, },
        icon: {reflect: true, },
        placeholder: { reflect: true, },
        inputCSS: { reflect: true, attribute : 'css-input' },
        iconCSS: { reflect: true, attribute : 'css-icon' }        
    }

    #elRef = createRef();

    constructor() {
        super();
        this.icon = 'search';
    }

    renderUI() {
        const me = this;
        return html`
        <div class="input-group ${me.css}">
            <i class="input-group-text bi bi-${me.icon} ${me.iconCSS}"></i>
            <input  ${ref(me.#elRef)} 
                type="search"  
                incremental="true" 
                class="form-control ${me.inputCSS}" 
                placeholder="${me.placeholder}" 
                name="${me.name}"
                @keydown=${me.#onKeyDown}
                @search=${me.#onSearch}>
        </div>        
        `
    }

    // for FireFox only
    #onKeyDown(e) {
        if (!GSEnvironment.isWebkit) this.#onSearch(e);
    }

    #onSearch(e) {
        const me = this;
        const opt = { type: 'search', action: 'search', value: me.value };
        GSEvents.send(me, 'action', opt, true, true, true);
    }

    get value() {
        return this.#searchEl?.value;
    }

    get #searchEl() {
        return this.#elRef.value;
    }

    static {
        this.define('gs-search', GSSearch);
    }

}
