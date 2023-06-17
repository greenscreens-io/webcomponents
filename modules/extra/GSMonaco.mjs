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
 * Code editor based on MS Monaco 
 * https://microsoft.github.io/monaco-editor/
 * 
 * <gs-monaco url="" target="" theme="vs-dark" langauage="html"></gs-monaco>
 * 
 * @class
 * @extends {GSElement}
 */
export default class GSMonaco extends GSElement {

    static #initialized = false;
    #editor = null;

    static {
        GSMonaco.#init();
    }
    
    static get URL_LIB() {
        return globalThis.GS_URL_MONACO == false ? false : globalThis.GS_URL_MONACO || 'https://unpkg.com/monaco-editor@latest/min/';
    }

    static #init() {
        if (GSMonaco.URL_LIB == false) return;
        customElements.define('gs-monaco', GSMonaco);
        Object.seal(GSMonaco);
        GSMonaco.#initLib();
        GSMonaco.#initEnv();
        GSMonaco.#initMonaco();
    }

    static #initLib() {
        const script = document.createElement('script');
        script.type = "text/javascript";
        script.src = `${GSMonaco.URL_LIB}vs/loader.js`;
        GSDOM.appendChild(document.head, script);
    }

    // Before loading vs/editor/editor.main, define a global MonacoEnvironment that overwrites
    // the default worker url location (used when creating WebWorkers). The problem here is that
    // HTML5 does not allow cross-domain web workers, so we need to proxy the instantiation of
    // a web worker through a same-domain script
    static #initEnv() {
        window.MonacoEnvironment = {
            baseUrl: `${GSMonaco.URL_LIB}`,
            getWorkerUrl: (workerId, label) => {
                return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
                globalThis.MonacoEnvironment = {baseUrl: '${GSMonaco.URL_LIB}'};
                importScripts('${GSMonaco.URL_LIB}vs/base/worker/workerMain.js');`
                )}`;
            }
        };
    }

    static #initMonaco(own) {
        if (globalThis.GS_URL_MONACO === false) return;
        if (GSMonaco.#initialized) {
            if (own) GSEvents.send(own, 'monaco-ready');
            return;
        }
        const id = setInterval(() => {
            if (typeof globalThis.require !== 'function') return;
            require.config({ paths: { 'vs': `${GSMonaco.URL_LIB}/vs` } });
            require(['vs/editor/editor.main'], () => {
                clearInterval(id);
                GSMonaco.#initialized = true;
                GSMonaco.#initMonaco(own);
            });
        }, 100);
    }

    static get observedAttributes() {
        const attrs = ['theme', 'url', 'target', 'language'];
        return GSElement.observeAttributes(attrs);
    }

    // prevent attaching shadow and dom internals
    static get disabledFeatures() { return ['shadow', 'internals']; }

    constructor() {
        super();

    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;

        switch (name) {
            case 'language':
                me.#onLanguage(newValue);
                break;
            case 'theme':
                me.#onTheme(newValue);
                break;
            case 'target':
                me.#onTarget(newValue);
                break;
            case 'url':
                me.#onURL(newValue);
                break;
        }
    }

    async getTemplate(val = '') {
        return `<div class="${this.css}"><div/>`;
    }

    /**
     * Get editor code 
     * 
     * @param {string} data 
     */
    get code() {
        const me = this;
        return me.#editor ? me.#editor.getValue() : '';
    }

    set code(data = '') {
        const me = this;
        if (me.#editor) me.#editor.setValue(data);
    }

    /**
     * Must be flat, as Monaco is loading and injecting CSS on its own
     */
    get isFlat() {
        return true;
    }

    onReady() {
        const me = this;
        me.once('monaco-ready', me.#onMonacoReady.bind(this));
        GSMonaco.#initMonaco(this);
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

    /**
     * CSS query location from where to load innerHTML data 
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
        return GSAttr.get(this, 'theme', 'vs-dark');
    }

    set theme(val = '') {
        return GSAttr.set(this, 'theme', val);
    }

    /**
     * Comma separated lsit of additiona languages
     * 
     * @returns {string}
     */
    get language() {
        const me = this;
        const ext = me.url ? me.url.split('\.').pop(-1) : '';
        return GSAttr.get(me, 'language', ext);
    }

    set language(val = '') {
        return GSAttr.set(this, 'language', val);
    }

    get css() {
        return GSAttr.get(this, 'css', '');
    }

    set css(val = '') {
        return GSAttr.set(this, 'css', val);
    }

    #onLanguage(language) {
        const me = this;
        if (monaco && language) {
            const models = monaco.editor.getModels();
            monaco.editor.setModelLanguage(models[0], language);
        }
    }

    async #onTheme(theme) {
        const me = this;
        if (monaco && theme) monaco.editor.setTheme(theme);
    }

    /**
     * Search with CSS query for element, if found, 
     * get innerHTML, and send to highlighting
     */
    #onTarget(target) {
        const me = this;
        const el = target ? GSDOM.query(target) : null;
        if (!el) return me.code = `Element with id ${target} not found!`;
        me.code = el.innerHTML;
    }

    /**
     * Download source from URL, then send to highlighting
     */
    async #onURL(url) {
        const me = this;
        const data = url ? await GSLoader.load(url) : null;
        if (!data) return me.code = `Code URL ${url} unreachable!`;
        me.code = '';
        me.#onLanguage(me.language);
        me.code = data;
    }

    get #container() {
        return this.query('div');
    }

    #onMonacoReady() {

        const me = this;

        const opt = {
            value: ``,
            language: me.language,
            theme: me.theme,
            automaticLayout: true
        };

        me.#editor = monaco.editor.create(me.#container, opt);

        me.attachEvent(self, 'resize', me.#onResize.bind(me));

        super.onReady();

        if (me.url) return me.#onURL(me.url);
        if (me.target) return me.#onTarget(me.target);
    }

    #onResize(e) {
        const me = this;
        me.#editor.layout({ width: 0, height: 0 });

        window.requestAnimationFrame(() => {
            const rect = me.owner.getBoundingClientRect();
            me.#editor.layout({ width: rect.width, height: rect.height });
        })
    }

}