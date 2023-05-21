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

/*
 // use to create linked gs-markdown for ui menu and viewer
 const md = GSComponents.find('gs-markdown')
 md.addEventListener('link', e => {
    GSEvents.prevent(e);
    //todo take e.detail and set it to another gs-markdown element
 })
 */

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
    #last = null;
    #first = null;
    #root = null;
    #path = null;
    #cache = [];

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
        return `<div class="overflow-auto ${this.css}" style="max-height: 800px;"><div/>`;
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
        const me = this;
        me.#toCache(val);
        return GSAttr.set(me, 'url', val);
    }


    get css() {
        return GSAttr.get(this, 'css', '');
    }

    set css(val = '') {
        return GSAttr.set(this, 'css', val);
    }

    get history() {
        return GSAttr.getAsNum(this, 'history', 10);
    }

    set history(val = '') {
        const me = this;
        return GSAttr.setAsNum(me, 'history', val, 10);
    }

    back() {
        const me = this;
        const url = me.#fromCache();
        if (url) me.#onURL(url);
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
        data = data.replace(/^[-{3}|\*{3}|_{3}]$/gm, '<hr>');
        
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
        const list =  GSDOM.queryAll(me.#container, qry);
        list.forEach(el => {
            GSDOM.toggleClass(el, css);
        });
    }
    
    #handleLinks() {
        const me = this;
        const links =  GSDOM.queryAll(me.#container, 'a');

        links
        .filter(el => !(el.href.endsWith('.md') || el.href.endsWith('/')) )
        .forEach(el => el.target = "_blank");

        links
        .filter(el => el.href.endsWith('.md') || el.href.endsWith('/') )
        .forEach(el => {
            GSEvents.attach(el, el, 'click', me.#onLinkClick.bind(me));
        });
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
        const url = me.#cache.length > 0 ? me.#cache.pop() : me.#first;
        return url === me.#last ? me.#fromCache() : url;
    }

    #toCache(url) {
        const me = this;
        if(me.#cache.length >= me.history) me.#cache = me.#cache.slice(1);
        if (me.#last == url) return;
        me.#cache.push(url);
        me.#last = url;
        if (!me.#first) me.#first = url;
    }

    #makeHtml(data) {
        return this.#converter.makeHtml(data);
    }

    #onScriptReady() {
        const me = this;
        const opt = {tasklists:true, tables : true};
        me.#converter = new globalThis.showdown.Converter(opt);
        requestAnimationFrame(() => {
            me.#toCache(me.url);
            me.#onURL(me.url)
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

    /**
     * Return injection point for rendered markdown
     */
    get #container() {
        return this.query('div');
    }

}