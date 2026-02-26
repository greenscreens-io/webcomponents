/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { classMap, createRef, html, ref } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSLoader } from '../base/GSLoader.mjs';
import { GSDOM } from '../base/GSDOM.mjs';
import { GSEvents } from '../base/GSEvents.mjs';

export class GSMonacoElement extends GSElement {

    static get URL_LIB() {
        return globalThis.GS_URL_MONACO || 'https://unpkg.com/monaco-editor@latest/min/';
    }

    static properties = {
        url: {},
        theme: {},
        target: {},
        language: {},
    }

    #containerRef = createRef();
    #editor = null;

    constructor() {
        super();
        this.language = '';
        this.theme = 'vs-dark';
    }

    async connectedCallback() {
        await GSMonacoElement.#init();
        super.connectedCallback();
    }

    createRenderRoot() {
        return this;
    }

    firstUpdated() {
        this.#onMonacoReady();
        super.firstUpdated();
    }

    willUpdate(changed) {
        const me = this;
        if (!me.#editor) return;
        if (changed.has('theme')) me.#onTheme(me.theme);
        if (changed.has('target')) me.#onTarget(me.target);
        if (changed.has('url')) me.#onURL(me.url);
        if (changed.has('language')) me.#onLanguage(me.language);
    }

    renderUI() {
        const me = this;
        return html`<div ${ref(me.#containerRef)} class="${classMap(me.renderClass())}"><div/>`;
    }

    get monaco() {
        return window.monaco;
    }

    get editor() {
        return this.#editor;
    }

    get model() {
        return this.#editor.getModel();
    }

    /**
     * Get editor code 
     * 
     * @param {string} data 
     */
    get code() {
        return this.#editor?.getValue() || '';
    }

    set code(data = '') {
        const me = this;
        if (me.#editor) me.#editor.setValue(data);
    }

    /**
     * Get text selected in Monaco
     */
    get selection() {
        const me = this;
        return me.model.getValueInRange(me.editor.getSelection());
    }

    get owner() {
        return this.parentElement;
    }

    #onLanguage(language) {
        const me = this;
        if (me.monaco && language) {
            me.monaco.editor.setModelLanguage(me.model, language);
        }
    }

    #onTheme(theme) {
        const me = this;
        if (me.monaco && theme) me.monaco.editor.setTheme(theme);
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
        try {
            const data = url ? await GSLoader.load(url) : null;
            if (!data) throw new Error(`Code URL ${url} unreachable!`);
            me.code = '';
            me.#onLanguage(me.language);
            me.code = data;
        } catch (error) {
            me.code = error.message;
        }
    }

    #onMonacoReady() {

        const me = this;

        const opt = {
            value: ``,
            language: me.language,
            theme: me.theme,
            automaticLayout: true,
            minimap: { enabled: false }
        };

        me.#editor = me.monaco?.editor?.create(me.#container, opt);

        me.attachEvent(window, 'resize', me.#onResize.bind(me));

        try {
            if (me.url) {
                me.#onURL(me.url);
            } else if (me.target) {
                me.#onTarget(me.target);
            }
        } finally {
            requestAnimationFrame(() => me.emit('initialized'));
            me.#onResize();
        }
    }

    #onResize(e) {
        const me = this;
        if (!me.#editor) return;
        me.#editor.layout({ width: 0, height: 0 });

        requestAnimationFrame(() => {
            const rect = me.owner?.getBoundingClientRect();
            if (rect) {
                me.#editor.layout({ width: rect.width, height: rect.height });
            }
        });
    }

    get #container() {
        return this.#containerRef.value;
    }

    static #initialized;

    static async #initLib() {
        if (globalThis.monaco) return;
        const script = document.createElement('script');
        const promise = GSEvents.wait(script, 'load', 0, false);
        script.type = "text/javascript";
        script.src = `${GSMonacoElement.URL_LIB}vs/loader.js`;
        GSDOM.appendChild(document.head, script);
        await promise;
    }

    // Before loading vs/editor/editor.main, define a global MonacoEnvironment that overwrites
    // the default worker url location (used when creating WebWorkers). The problem here is that
    // HTML5 does not allow cross-domain web workers, so we need to proxy the instantiation of
    // a web worker through a same-domain script
    static #initEnv() {
        const url = GSMonacoElement.URL_LIB;
        window.MonacoEnvironment = {
            baseUrl: `${url}`,
            getWorkerUrl: (workerId, label) => {
                return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
                globalThis.MonacoEnvironment = {baseUrl: '${url}'};
                importScripts('${url}vs/base/worker/workerMain.js');`
                )}`;
            }
        };
    }

    static #initMonaco() {
        return new Promise((resolve, reject) => {
            // TODO  set disabled to true and manually load themes into shadow dom
            require.config({
                paths: { 'vs': `${GSMonacoElement.URL_LIB}/vs` },
                'vs/css': { disabled: false }
            });
            require(['vs/editor/editor.main'], resolve);
        });
    }

    static async #init() {
        const me = GSMonacoElement;
        if (me.#initialized) return;
        me.#initEnv();
        await me.#initLib();
        await me.#initMonaco();
        me.#initialized = true;
    }

    static {
        this.define('gs-monaco');
    }

}