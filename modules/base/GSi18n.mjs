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
 * Two operational modes are available
 * 1. map text from default language to requested langiage
 * 2. map text key to a translation in requested language map, or use default
 * @class
 */
export default class GSi18n extends HTMLElement {

    static #expr = /\{\w+\}/g;

    #default = new Map();
    #language = new Map();

    #cache = new Set();
    #loading = false;

    #isDuplicate = false;
    #filter = this.#onFilter.bind(this);
    #callback = this.#onCallback.bind(this);

    static {
        customElements.define('gs-i18n', GSi18n);
        Object.seal(GSi18n);
    }

    static get observedAttributes() {
        return ['default', 'lang', 'auto'];
    }

    constructor() {
        super();
    }

    connectedCallback() {
        const me = this;
        me.id = me.id ? me.id : GSID.id;
        me.#isDuplicate = GSComponents.find(this.tagName) ? true : false;
        if (me.#isDuplicate) return console.log(`${me.tagName} ID: ${me.id} is ignored, i18n is already in use by another instance!`);
        me.#load(me.default, me.#default);
        me.#load(me.lang, me.#language);
        GSDOMObserver.registerFilter(me.#filter, me.#callback);
        GSComponents.store(me);
    }

    disconnectedCallback() {
        const me = this;
        GSDOMObserver.unregisterFilter(me.#filter, me.#callback);
        GSComponents.remove(me);
        me.#default.clear();
        me.#language.clear();
        me.#default = null;
        me.#language = null;
        me.#callback = null;
        me.#filter = null;
    }

    attributeChangedCallback(name = '', oldVal = '', newVal = '') {
        const me = this;
        if (name === 'lang' && newVal && oldVal !== newVal) {
            me.#language.clear();
            if (newVal === me.default) {
                me.#language = new Map(me.#default);
                me.translateDOM(document.documentElement);
            } else {
                me.#cache.add(document.documentElement);
                me.#load(newVal, me.#language);
            }
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
        requestAnimationFrame(() => me.#doTranslate(el));
    }
    
    #doTranslate(el) {
        const me = this;
        if (me.#loading > 0) return me.#cache.add(el);
        if (el === document.documentElement) {
           Array.from(document.documentElement.childNodes).forEach(el => me.translateDOM(el));
        } else{
            const isText = (el instanceof Text);
            isText ? me.#doTranslateText(el) : me.#doTranslateAttrs(el);
        }
        if (el.shadowRoot) me.translateDOM(el.shadowRoot);
    }

    #doTranslateAttrs(el) {
        const me = this;
        me.list.forEach(attr => me.#doTranslateAttr(el, attr));
    }

    #doTranslateAttr(el, name) {

        const me = this;

        const dname = `data-ga-i8n-${name}`;

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

    async #load(val = '', map) {

        const me = this;
        const headers = {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        };

        let res = null;
        try {
            me.#loading++;
            val = GSLoader.normalizeURL(`${me.url}/${val}.json`);

            res = await GSLoader.load(val, 'GET', headers, true);
            if (!res && val.indexOf('_') > 0) res = await me.#load(val.split('_')[0], map);
            if (!res) return false;

        } finally {
            me.#loading--;
        }

        if (me.#loading === 0) me.#renderCache();

        return me.#store(res, map);
    }

    #renderCache() {
        const me =  this;
        requestAnimationFrame(() => {
            try {
                me.#cache.forEach(el => me.#doTranslate(el));
            } finally {
                me.#cache.clear();
            }
        });
    }

    /**
     * Store object properties as set of key-value pairs,
     * keys are not stores as name, but as hash calc
     * valuses double stored as a hash-key/value and hash-value/hash-key
     * @param {object} obj 
     * @param {Map} map 
     * @returns 
     */
    #store(obj, map) {
        if (!(obj && map)) return false;
        Object.entries(obj).forEach((kv) => {
            const hk = GSID.hashCode(kv[0]);
            map.set(hk, kv[1]);
        });
        return true;
    }

    /**
     * Translate complete tree from given node
     * @param {HTMLElement | Text} el 
     */
    translateDOM(el) {

        const me = this;

        me.#doTranslate(el);

        Array.from(el.childNodes)
            .filter(el => me.#onFilter(el))
            .forEach(el => el.childNodes.length == 0 ? me.#doTranslate(el) : me.translateDOM(el));
    }

    /**
     * Translate text from default language to the requested one
     * 1. full string hash is searched for mapping
     * 2. string keys are extracted, then hashed and replaced
     * @param {*} val 
     * @returns 
     */
    translate(val) {

        if (GSUtil.isStringEmpty(val)) return val;

        const me = this;

        val = me.find(val.trim());

        let tmp = val;
        let key = null;
        let res = null;
        let arr = null;

        GSi18n.#expr.lastIndex = -1;
        while ((arr = GSi18n.#expr.exec(val)) !== null) {
            key = arr[0];
            res = me.find(key.slice(1, -1), true);
            tmp = tmp.replace(key, res);
        }

        return tmp;
    }

    /**
     * Find string or key for translation
     * @param {string} val Can be whoel string or key name
     * @returns {string} translated text
     */
    find(val, isKey = false) {
        const me = this;
        return isKey ? me.#findByKey(val) : me.#findByVal(val);
    }

    #findByKey(val) {
        const me = this;
        const hv = GSID.hashCode(val);
        return me.#language.get(hv) || val;
    }

    #findByVal(val) {
        const me = this;
        const hv = GSID.hashCode(val);
        let temp = me.#default.get(hv);
        temp = temp ? me.#language.get(temp) : null;
        return temp || val;
    }

    /**
     * Retlanslate all elements allready on the page
     */
    #retlanslate() {

    }

    /**
     * Translate text from default to requested language.
     * If false, will translate {key} only to a language text
     * If true, will map text in default language to a key, then get key translation
     * If translation not successful, key  or original text will stay
     * @returns {boolean}
     */
    get auto() {
        return GSAttr.getAsBool(this, 'auto', false);
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