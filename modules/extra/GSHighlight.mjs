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
 * <gs-highlight url="" target=""></gs-highlight>
 * 
 * @class
 * @extends {GSElement}
 */
export default class GSHighlight extends GSElement {

    static URL_LIB = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/highlight.min.js';
    static URL_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/styles/';
    static URL_LANG = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/languages/';

    static {
        customElements.define('gs-highlight', GSHighlight);
        Object.seal(GSHighlight);
    }

    static get observedAttributes() {
        const attrs = ['theme', 'url', 'target'];
        return GSElement.observeAttributes(attrs);
    }

    constructor() {
        super();
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;

        switch (name) {
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
    highlight(data = '') {
        this.#onHighlight(data);
    }

    onReady() {
        super.onReady();
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
     * Comma separated lsit of additiona languages
     * 
     * @returns {string}
     */
     get lang() {
        return GSAttr.get(this, 'lang', '');
    }

    set lang(val = '') {
        return GSAttr.set(this, 'lang', val);
    }

    async #onTheme() {
        const me = this;
        try {
			const res = await fetch(`${GSHighlight.URL_CSS}${me.theme}.min.css`);
			if (!res.ok) return;
			const css = await res.text();
            const sheet = new CSSStyleSheet();
			sheet.replaceSync(css);
			me.shadowRoot.adoptedStyleSheets = [sheet];
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Search with CSS query for element, if found, 
     * get innerHTML, and send to highlighting
     */
    #onTarget() {
        const me = this;
        const el = me.target ? GSDOM.query(me.target) : null;
        if (!el) return me.#code.innerHTML = `Element with id ${me.target} not found!`;
        me.#onHighlight(el.innerHTML);
    }

    /**
     * Download source from URL, then send to highlighting
     */
    async #onURL() {
        const me = this;
        const data = await GSLoader.load(me.url);
        if (!data) return me.#code.innerHTML = `Code URL ${me.url} unreachable!`;
        me.#onHighlight(data);
    }

    get #code() {
        return this.query('code');
    }

    #onMessage(e) {
        URL.revokeObjectURL(e.data.url);
        this.#code.innerHTML = e.data.data;
    }

    #onHighlight(data = '') {
        const me = this;
        if (!data) return me.#code.innerHTML = 'No data!';
        const response = me.#worker;
        const blob = new Blob([response], { type: 'application/javascript' });
        const blobURL = URL.createObjectURL(blob);
        const worker = new Worker(blobURL);
        worker.onmessage = me.#onMessage.bind(me);
        worker.postMessage({ data: data, url: blobURL });
    }

    get #worker() {
        const me = this;
        const langs = me.lang ? me.lang.split(',').map(v => `importScripts('${GSHighlight.URL_LANG}${v.trim}.min.js');`).join('') : '';
        return `self.onmessage = (event) => {
                importScripts('${GSHighlight.URL_LIB}');
                ${langs}
                const result = self.hljs.highlightAuto(event.data.data);
                postMessage({data:result.value, url:event.data.url});};`
    }

}