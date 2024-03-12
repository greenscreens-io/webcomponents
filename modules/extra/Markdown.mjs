/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { classMap, createRef, html, ref } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSLoader } from '../base/GSLoader.mjs';
import { GSDOM } from '../base/GSDOM.mjs';
import { GSUtil } from '../base/GSUtil.mjs';
import { GSEvents } from '../base/GSEvents.mjs';
import { GSAttr } from '../base/GSAttr.mjs';
import { GSID } from '../base/GSID.mjs';

export class GSMarkdownElement extends GSElement {

    static get URL_LIB() {
        return globalThis.GS_URL_MARKDOWN || 'https://unpkg.com/showdown/dist/showdown.min.js';
    }

    static properties = {
        url: {},
        history: { type: Number },
        maxHeight: { type: Number, attribute: 'max-height' },
    }

    #containerRef = createRef();
    #converter = null;
    #last = null;
    #first = null;
    #root = null;
    #path = null;
    #cache = [];

    #styleID = GSID.id;

    constructor() {
        super();
        this.history = 10;
        this.dynamicStyle(this.#styleID);
    }

    async connectedCallback() {
        const me = this;
        await me.#initLib();
        if (globalThis.showdown) {
            const opt = { tasklists: true, tables: true };
            me.#converter = new globalThis.showdown.Converter(opt);
            super.connectedCallback();
        }
    }

    willUpdate(changed) {
        const me = this;
        if (changed.has('url')) {
            me.#toCache(me.url);
            me.#onURL(me.url);
        }
    }

    renderUI() {
        const me = this;
        const height = me.maxHeight > 0 ? `${me.maxHeight}px;` : false;
        const opt = { 'max-height': height }
        me.dynamicStyle(me.#styleID, opt);
        return html`<div ${ref(me.#containerRef)} class="overflow-auto ${classMap(me.renderClass())}"><div/>`;
    }

    renderClass() {
        const me = this;
        const hasLangauge = GSUtil.isStringNonEmpty(me.language);
        const css = {
            [me.#styleID] : true,
            [`language-${me.language}`]: hasLangauge
        }
        return css;
    }

    back() {
        const me = this;
        const url = me.#fromCache();
        me.#onURL(url);
    }

    get root() {
        return this.#root || '';
    }

    /**
     * Return injection point for rendered markdown
     */
    get #container() {
        return this.#containerRef.value;
    }

    /**
     * Download source from URL, then send to rendering
     */
    async #onURL(url = '') {
        const me = this;

        url = me.#normalize(url);
        if (!url) return;

        let data = await GSLoader.load(url);
        if (!data) return;

        me.#path = me.#parent(url);
        if (!me.#root) me.#root = me.#path;

        // MD library error fix
        data = data.replace(/^[-_\*]{3}$/gm, '<hr>');

        me.#container.innerHTML = me.#makeHtml(data);

        GSEvents.send(me, 'data', url);
        requestAnimationFrame(() => {
            me.#handleLinks();
            me.#handleTables();
            me.#handleCode();
        });
    }

    #normalize(url = '') {
        const me = this;
        if (!url || url.startsWith('http')) return url;
        return me.#path ? new URL(url, me.#path).toString() :
            GSLoader.normalizeURL(url, true);
    }

    #parent(url = '') {
        return url.endsWith('/') ? url : GSLoader.parentPath(url);
    }

    #handleCode() {
        this.#handleStyles('pre:has(code)', 'text-white bg-dark p-1');
    }

    #handleTables() {
        const me = this;
        const clss = "table table-light table-hover table-striped table-bordered w-auto shadow-sm";
        me.#handleStyles('table', clss);
    }

    #handleStyles(qry, css) {
        const me = this;
        const list = GSDOM.queryAll(me.#container, qry);
        requestAnimationFrame(() => list.forEach(el => GSDOM.toggleClass(el, css)) );
    }

    #handleLinks() {
        const me = this;
        const links = GSDOM.queryAll(me.#container, 'a').filter(el => !GSAttr.get(el, 'href').startsWith('#'));

        links
            .filter(el => !(GSAttr.get(el, 'href').endsWith('.md') || GSAttr.get(el, 'href').endsWith('/')))
            .forEach(el => el.target = "_blank");

        links
            .filter(el => GSAttr.get(el, 'href').endsWith('.md') || GSAttr.get(el, 'href').endsWith('/'))
            .forEach(el => GSEvents.attach(el, el, 'click', me.#onLinkClick.bind(me)));

    }

    #onLinkClick(e) {
        const me = this;
        const el = e.target;
        const href = GSAttr.get(el, 'href');
        if (href.startsWith('#')) return;
        GSEvents.prevent(e);
        el.href = me.#normalize(href);

        const success = GSEvents.send(me, 'link', el.href, false, false, true);
        if (!success) return;

        me.#toCache(el.href);
        me.#onURL(el.href);
        return false;
    }

    #fromCache() {
        const me = this;
        if (me.#cache.length === 0 ) return me.#first;
        const url = me.#cache.pop();
        return url && url === me.#last ? me.#fromCache() : url;
    }

    #toCache(url) {
        const me = this;
        if (me.#cache.length >= me.history) me.#cache = me.#cache.slice(1);
        if (me.#last == url) return;
        me.#cache.push(url);
        me.#last = url;
        if (!me.#first) me.#first = url;
    }

    #makeHtml(data) {
        return this.#converter.makeHtml(data);
    }

    async #initLib() {
        const me = this;
        if (globalThis.showdown) return;
        const script = document.createElement('script');
        const promise = GSEvents.wait(script, 'load', 0, false);
        script.type = "text/javascript";
        script.src = GSMarkdownElement.URL_LIB;
        GSDOM.appendChild(document.head, script);
        await promise;
    }

    static {
        this.define('gs-markdown');
    }

}