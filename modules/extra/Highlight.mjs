/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { createRef, ref, classMap, html } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSLoader } from '../base/GSLoader.mjs';
import { GSDOM } from '../base/GSDOM.mjs';
import { GSUtil } from '../base/GSUtil.mjs';

export class GSHighlightElement extends GSElement {

    static get URL_LIB() {
        return globalThis.GS_URL_HLJS || 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0';
    }

    static properties = {
        url: {},
        theme: {},
        target: {},
        language: {},
    }

    #codeRef = createRef();
    #data;

    constructor() {
        super();
        this.theme = 'default';
    }

    willUpdate(changed) {
        const me = this;
        if (changed.has('theme')) me.#onTheme();
        if (changed.has('target')) me.#onTarget();
        if (changed.has('url')) me.#onURL();
        if (changed.has('language')) me.#onHighlight(me.#data);
    }

    renderUI() {
        const me = this;
        return html`<pre><code ${ref(me.#codeRef)} class="${classMap(me.renderClass())}"><code/><pre/>`;
    }

    renderClass() {
        const me = this;
        const hasLangauge = GSUtil.isStringNonEmpty(me.language);
        const css = {
            [`language-${me.language}`]: hasLangauge
        }
        return css;
    }

    /**
     * Highligh some code in programmatic way
     * 
     * @param {string} data 
     */
    highlight(data = '', append = false) {
        this.#data = data;
        this.#onHighlight(data, append);
    }

    set content(val ='') {
        this.#data = val;
        this.#onHighlight(val);
    }

    get content() {
        return this.#data;
    }

    async #onTheme() {
        const url = `${GSHighlightElement.URL_LIB}/styles/${this.theme}.min.css`;
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
        me.#data = el.innerHTML;
        me.#onHighlight(el.innerHTML);
    }

    /**
     * Download source from URL, then send to highlighting
     */
    async #onURL() {
        const me = this;
        const data = await GSLoader.load(me.url);
        if (!data) return GSDOM.setHTML(me.#code, `Code URL ${me.url} unreachable!`);
        me.#data = data;
        me.#onHighlight(data);
    }

    get #code() {
        return this.#codeRef.value;
    }

    #onMessage(e) {
        const me = this;
        const content = e.data.data;
        URL.revokeObjectURL(e.data.url);
        GSDOM.setHTML(me.#code, e.data.append ? me.#code.innerHTML + content : content);
        e.target.terminate();
    }

    #onHighlight(data = '', append = false) {
        const me = this;
        if (!data) return GSDOM.setHTML(me.#code, 'No data!');
        const response = me.#worker;
        const blob = new Blob([response], { type: 'application/javascript' });
        const blobURL = URL.createObjectURL(blob);
        const worker = new Worker(blobURL);
        worker.onmessage = me.#onMessage.bind(me);
        worker.postMessage({ data: data, url: blobURL, append: append });
    }

    get #worker() {
        const me = this;
        const langs = me.language ? me.language.split(',').map(v => `importScripts('${GSHighlightElement.URL_LIB}/languages/${v.trim()}.min.js');`).join('') : '';
        return `globalThis.onmessage = (event) => {
                importScripts('${GSHighlightElement.URL_LIB}/highlight.min.js');
                ${langs}
                const result = globalThis.hljs.highlightAuto(event.data.data);
                postMessage({data:result.value, url:event.data.url, append: event.data.append});};`
    }

    static {
        this.define('gs-highlight');
    }

}