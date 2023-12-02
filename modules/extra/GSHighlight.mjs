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

/**
 * Code highlighter based on hljs library
 * https://highlightjs.org/
 * 
 * <gs-highlight url="" target=""></gs-highlight>
 * 
 * @class
 * @extends {GSElement}
 */
export default class GSHighlight extends GSElement {

    static {
        customElements.define('gs-highlight', GSHighlight);
        Object.seal(GSHighlight);
    }
    
    static get URL_LIB() {
        return globalThis.GS_URL_HLJS || 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0';
    }

    static get observedAttributes() {
        const attrs = ['theme', 'url', 'target', 'language'];
        return GSElement.observeAttributes(attrs);
    }

    constructor() {
        super();
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;

        switch (name) {
            case 'language':
                me.#onLanguage(oldValue, newValue);
                break;
            case 'theme':
                me.#onTheme();
                break;
            case 'target':
                me.#onTarget();
                break;
            case 'url':
                me.#onURL();
                break;
        }
    }

    async getTemplate(val = '') {
        return '<pre><code><code/><pre/>';
    }

    /**
     * Highligh some code in programmatic way
     * 
     * @param {string} data 
     */
    highlight(data = '', append = false) {
        this.#onHighlight(data, append);
    }

    set content(val ='') {
        this.#onHighlight(val);
    }

    async onBeforeReady() {
        await super.onBeforeReady();
        const me = this;
        if (me.theme) me.#onTheme();
        if (me.url) return me.#onURL();
        if (me.target) return me.#onTarget();
    }

    /**
     * URL location from where to load data to highlight
     * 
     * @returns {string}
     */
    get url() {
        return GSAttr.get(this, 'url');
    }

    set url(val = '') {
        return GSAttr.set(this, 'url', val);
    }

    /**
     * CSS query location from where to load innerHTML data to highlight
     * 
     * @returns {string}
     */
    get target() {
        return GSAttr.get(this, 'target');
    }

    set target(val = '') {
        return GSAttr.set(this, 'target', val);
    }

    /**
     * HLJS CSS theme to load into a page
     * 
     * @returns {string}
     */
    get theme() {
        return GSAttr.get(this, 'theme', 'default');
    }

    set theme(val = '') {
        return GSAttr.set(this, 'theme', val);
    }

    /**
     * Comma separated list of additiona languages
     * 
     * @returns {string}
     */
    get language() {
        return GSAttr.get(this, 'language', '');
    }

    set language(val = '') {
        return GSAttr.set(this, 'language', val);
    }

    #onLanguage(oldValue, newValue) {
        const me = this;
        if (oldValue) me.#code.remove(`language-${oldValue}`);
        if (newValue) me.#code.add(`language-${newValue}`);
    }

    async #onTheme() {
        const url = `${GSHighlight.URL_LIB}/styles/${this.theme}.min.css`;
        GSDOM.injectCSS(this, url);
    }

    /**
     * Search with CSS query for element, if found, 
     * get innerHTML, and send to highlighting
     */
    #onTarget() {
        const me = this;
        const el = me.target ? GSDOM.query(me.target) : null;
        if (!el) return GSDOM.setHTML(me.#code, `Element with id ${me.target} not found!`);
        me.#onHighlight(el.innerHTML);
    }

    /**
     * Download source from URL, then send to highlighting
     */
    async #onURL() {
        const me = this;
        const data = await GSLoader.load(me.url);
        if (!data) return GSDOM.setHTML(me.#code, `Code URL ${me.url} unreachable!`);
        me.#onHighlight(data);
    }

    get #code() {
        return this.query('code');
    }

    #onMessage(e) {
        URL.revokeObjectURL(e.data.url);
        const me = this;
        const html = e.data.data;
        GSDOM.setHTML(me.#code, e.data.append ? me.#code.innerHTML + html: html);
    }

    #onHighlight(data = '', append = false) {
        const me = this;
        if (!data) return GSDOM.setHTML(me.#code, 'No data!');
        const response = me.#worker;
        const blob = new Blob([response], { type: 'application/javascript' });
        const blobURL = URL.createObjectURL(blob);
        const worker = new Worker(blobURL);
        worker.onmessage = me.#onMessage.bind(me);
        worker.postMessage({ data: data, url: blobURL, append : append });
    }

    get #worker() {
        const me = this;
        const langs = me.language ? me.language.split(',').map(v => `importScripts('${GSHighlight.URL_LIB}$/languages/{v.trim}.min.js');`).join('') : '';
        return `globalThis.onmessage = (event) => {
                importScripts('${GSHighlight.URL_LIB}/highlight.min.js');
                ${langs}
                const result = globalThis.hljs.highlightAuto(event.data.data);
                postMessage({data:result.value, url:event.data.url, append: event.data.append});};`
    }

}