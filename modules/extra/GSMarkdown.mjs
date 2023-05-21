/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSHighlight class
 * @module components/GSHighlight
 */

import GSElement from "../base/GSElement.mjs";
import GSLoader from "../base/GSLoader.mjs";
import GSAttr from "../base/GSAttr.mjs";
import GSDOM from "../base/GSDOM.mjs";
import GSEvents from "../base/GSEvents.mjs";

/**
 * Markdown document renderer
 * 
 * <gs-markdown url=""></gs-markdown>
 * 
 * @class
 * @extends {GSElement}
 */
export default class GSMarkdown extends GSElement {

    static URL_LIB = globalThis.GS_URL_MARKDOWN || 'https://unpkg.com/showdown/dist/showdown.min.js';

    #converter = null;

    static {
        customElements.define('gs-markdown', GSMarkdown);
        Object.seal(GSMarkdown);
    }

    static get observedAttributes() {
        const attrs = ['url'];
        return GSElement.observeAttributes(attrs);
    }

    constructor() {
        super();
        this.#initLib();
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;

        switch (name) {
            case 'url':
                me.#onURL(newValue);
                break;
        }
    }

    async getTemplate(val = '') {
        return `<div class="${this.css}"><div/>`;
    }

    /**
     * URL location from where to load data
     * 
     * @returns {string}
     */
    get url() {
        return GSAttr.get(this, 'url');
    }

    set url(val = '') {
        return GSAttr.set(this, 'url', val);
    }


    get css() {
        return GSAttr.get(this, 'css', '');
    }

    set css(val = '') {
        return GSAttr.set(this, 'css', val);
    }

    /**
     * Download source from URL, then send to rendering
     */
    async #onURL(url = '') {
        const me = this;
        url = url ? GSLoader.normalizeURL(url) : url;
        const data = url ? await GSLoader.load(url) : '';
        const src = me.#converter.makeHtml(data);
        me.#container.innerHTML = src;
        me.#handleLinks();
    }
    
    #handleLinks() {
        const me = this;
        const links =  GSDOM.queryAll(me.#container, 'a');
        links.forEach(el => {

        });
    }


    #initLib() {
        const me = this;
        if (globalThis.showdown) return me.#onScriptReady();
        const script = document.createElement('script');
        GSEvents.attach(me, script, 'load', me.#onScriptReady.bind(this));
        script.type = "text/javascript";
        script.src = GSMarkdown.URL_LIB;
        GSDOM.appendChild(document.head, script);
    }

    #onScriptReady() {
        const me = this;
        me.#converter = new globalThis.showdown.Converter();
        requestAnimationFrame(() => me.#onURL(me.url));
    }

    /**
     * Return injection point for rendered markdown
     */
    get #container() {
        return this.query('div');
    }

}