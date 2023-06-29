/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSi18n class
 * @module base/GSi18n
 */
import GSAttr from "./GSAttr.mjs";
import GSComponents from "./GSComponents.mjs";
import GSDOMObserver from "./GSDOMObserver.mjs";
import GSID from "./GSID.mjs";
import GSLoader from "./GSLoader.mjs";
import GSUtil from "./GSUtil.mjs";

/**
 * Support for i18n Internationalization
 * Class loads requested language translations and applies to the templates
  * @class
 */
export default class GSi18n extends HTMLElement {

    static #expr = /\{\w+\}/g;

    static #init = false;
    #languages = new Map();

    #cache = new Set();
    #loading = false;

    #interval = 0;
    #isDuplicate = false;
    #filter = this.#onFilter.bind(this);
    #callback = this.#onCallback.bind(this);

    static {
        customElements.define('gs-i18n', GSi18n);
        Object.seal(GSi18n);
        document.body.addEventListener('i18n', (e) => {
            if (GSi18n.default) GSi18n.default.translateDOM(e.detail);
        });
    }

    static get observedAttributes() {
        return ['lang', 'auto'];
    }

    static get default() {
        return GSi18n.#init;
    }

    constructor() {
        super();
    }

    connectedCallback() {
        const me = this;
        GSID.setIf(me);
        me.#isDuplicate = GSComponents.find(this.tagName) ? true : false;
        if (me.#isDuplicate) return console.log(`${me.tagName} ID: ${me.id} is ignored, i18n is already in use by another instance!`);
        GSi18n.#init = me;
        GSComponents.store(me);
        me.#toggleAuto();
    }

    disconnectedCallback() {
        const me = this;
        clearInterval(me.#interval);
        GSDOMObserver.unregisterFilter(me.#filter, me.#callback);
        GSComponents.remove(me);
        me.#languages.clear();
        me.#languages = null;
        me.#callback = null;
        me.#filter = null;
        if (!me.#isDuplicate) GSi18n.#init = null;
    }

    attributeChangedCallback(name = '', oldVal = '', newVal = '') {
        this.#attributeChanged(name, oldVal, newVal);
    }

    async #attributeChanged(name = '', oldVal = '', newVal = '') {

        const me = this;

        if (name === 'lang') {
            if (!me.#languages.has(newVal)) {
                await me.#load(newVal);
            }
            me.translateDOM(document.documentElement, me.auto);
        }

        if (name === 'auto') {
            me.#toggleAuto();
        }
    }

    #acceptedElement(el) {
        return (!(el instanceof HTMLScriptElement
            || el instanceof HTMLStyleElement
            || el instanceof HTMLLinkElement
            || el instanceof HTMLMetaElement
            || el instanceof Comment));
    }

    #onFilter(el) {

        const me = this;
        const isText = el instanceof Text;

        if (isText && el.textContent.trim().length == 0) return false;

        const tmp = isText ? el.parentElement : el;
        return me.#acceptedElement(tmp) && me.#isTranslatable(tmp);
    }

    #isTranslatable(el) {
        return GSAttr.get(el, 'translate') !== 'false';
    }

    #onCallback(el) {
        const me = this;
        me.#cache.add(el);
    }

    #onInterval() {
        const me = this;
        if (me.#loading) return;
        if (me.#cache.size === 0) return;
        requestAnimationFrame(() => {
            try {
                Array.from(me.#cache).forEach(el => {
                    me.#cache.delete(el);
                    me.#doTranslate(el);
                });
            } catch (e) {
                console.log(e);
            }
        });
    }

    #doTranslate(el) {
        const me = this;
        if (me.#loading > 0) return me.#cache.add(el);
        if (el === document.documentElement) {
            me.translateDOM(el, me.auto);
        } else {
            const isText = (el instanceof Text);
            isText ? me.#doTranslateText(el) : me.#doTranslateAttrs(el);
        }
        if (el.shadowRoot) me.translateDOM(el.shadowRoot, me.auto);
    }

    #doTranslateAttrs(el) {
        const me = this;
        me.list.forEach(attr => me.#doTranslateAttr(el, attr));
    }

    #doTranslateAttr(el, name) {

        const me = this;

        const dname = `data-gs-i8n-${name}`;

        let dval = GSAttr.get(el, dname);
        let val = GSAttr.get(el, name);

        if (dval) {
            val = dval;
        } else if (val) {
            GSAttr.set(el, dname, val);
        }

        if (val) GSAttr.set(el, name, me.translate(val));
    }

    #doTranslateText(el) {
        const me = this;
        el.gsi18n = el.gsi18n || el.textContent;
        el.textContent = me.translate(el.gsi18n);
    }

    async #load(lang = '') {

        const me = this;
        const headers = {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        };

        let res = null;
        try {
            me.#loading++;
            const url = GSLoader.normalizeURL(`${me.url}/${lang}.json`);

            res = await GSLoader.load(url, 'GET', headers, true);
            if (!res && lang.indexOf('_') > 0) res = await me.#load(lang.split('_')[0]);
            if (!res) return false;
            me.#store(lang, res);

        } finally {
            me.#loading--;
        }

        if (!me.auto) me.#onInterval();

        return true;
    }

    /**
     * Store object properties as set of key-value pairs,
     * keys are not stores as name, but as hash calc
     * values double stored as a hash-key/value and hash-value/hash-key
     * 
     * @param {string} lang 
     * @param {object} obj 
     * @returns 
     */
    #store(lang, obj) {
        if (!(obj && lang)) return false;
        const map = this.#getLanguage(lang);
        Object.entries(obj).forEach((kv) => {
            const hk = GSID.hashCode(kv[0]);
            map.set(hk, kv[1]);
        });
        return true;
    }

    /**
     * Get language map. Create a new one if not found.
     * @param {*} val 
     * @returns 
     */
    #getLanguage(val = '') {
        const me = this;
        if (!me.#languages.has(val)) {
            me.#languages.set(val, new Map());
            me.#load(val);
        }
        return me.#languages.get(val);
    }

    #toggleAuto() {
        const me = this;
        if (me.auto) {
            GSDOMObserver.registerFilter(me.#filter, me.#callback);
            me.#interval = setInterval(me.#onInterval.bind(me), 500);
        } else {
            GSDOMObserver.unregisterFilter(me.#filter, me.#callback);
            clearInterval(me.#interval);
        }
    }

    /**
     * Translate complete tree from given node.
     * 
     * @param {HTMLElement | Text} el Node to  translate from (inclusive)
     * @param {boolean} auto Immediate translate or automated 
     */
    translateDOM(el, auto = false) {

        const me = this;

        if (el !== document.documentElement) me.#cache.add(el);
        Array.from(el.childNodes)
            .filter(el => me.#onFilter(el))
            .forEach(el => el.childNodes.length == 0 ? me.#cache.add(el) : me.translateDOM(el, true));

        if (!auto) me.#onInterval();
    }

    /**
     * Translate text from default language to the requested one
     * 1. full string hash is searched for mapping
     * 2. string keys are extracted, then hashed and replaced
     * 
     * @param {*} val 
     * @returns 
     */
    translate(val) {

        if (GSUtil.isStringEmpty(val)) return val;

        const me = this;

        let tmp = val;
        let key = null;
        let res = null;
        let arr = null;

        GSi18n.#expr.lastIndex = -1;
        while ((arr = GSi18n.#expr.exec(val)) !== null) {
            key = arr[0];
            res = me.find(key.slice(1, -1));
            tmp = tmp.replace(key, res);
        }

        return tmp;
    }

    /**
     * Find string or key for translation
     * 
     * @param {string} val translation  key name
     * 
     * @returns {string} translated text
     */
    find(val) {
        const me = this;
        const hv = GSID.hashCode(val);
        return me.#getLanguage(me.lang).get(hv) || val;
    }

    /**
     * Enable auto translation by monitoring DOM
     * If set to false, translation must be called from code
     */
    get auto() {
        return GSAttr.getAsBool(this, 'auto', true);
    }

    set auto(val = '') {
        GSAttr.setAsBool(this, 'auto', val);
    }

    /**
     * Default page langugae, use page language, or browser languge if value not set
     */
    get default() {
        return GSAttr.get(this, 'default', document.documentElement.lang || navigator.language);
    }

    set default(val = '') {
        GSAttr.set(this, 'default', val);
    }

    /**
     * Language to which to translate
     */
    get lang() {
        return GSAttr.get(this, 'lang', this.default);
    }

    set lang(val = '') {
        GSAttr.set(this, 'lang', val);
    }

    /**
     * List of attributes on an element used to translate.
     */
    get list() {
        const val = GSAttr.get(this, 'list', 'title,comment');
        return val.split(',');
    }

    set list(val = '') {
        val = Array.isArray(val) ? val.join(',') : val;
        GSAttr.set(this, 'list', val);
    }

    /**
     * URL from where to load JSON translation documents
     */
    get url() {
        return GSAttr.get(this, 'url', `${location.origin}/i18n/`);
    }

    set url(val = '') {
        GSAttr.set(this, 'url', val);
    }

}
