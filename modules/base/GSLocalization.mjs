/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */
import { GSID } from './GSID.mjs';
import { GSLoader } from './GSLoader.mjs';
import { GSPromise } from './GSPromise.mjs';
import { GSEvents } from './GSEvents.mjs';
import { GSUtil } from './GSUtil.mjs';

/**
 * A module loading GSLocalization class
 * @module base/GSLocalization
 */

const GS_LOCALIZATION_LANGUAGE = globalThis.GS_LOCALIZATION_LANGUAGE || document.documentElement.lang || navigator.language;

/**
 * Generic text translation engine.
 * Each JSON langauge file is of 2 files format 
 * default.json  {'UI text', 'KEY_NAME'}
 * language.json {$language$: 'langauge_name', KEY_NAME : 'translation text'}
 * @class
 */
class GSLocalizationImpl {

    #languages = new Map();
    #queue = new Set();
    #queued = false;

    #url = globalThis.GS_LOCALIZATION_URL;
    #default = GS_LOCALIZATION_LANGUAGE;
    #language;

    constructor() {
        this.load();
    }

    /**
     * Default page langugae, use page language, or browser languge if value not set
     */
    get default() {
        return this.#default;
    }

    set default(val = '') {
        this.#default = val || GS_LOCALIZATION_LANGUAGE;
    }

    /**
     * Language to which to translate
     */
    get lang() {
        return this.#language || this.default;
    }

    set lang(val = '') {
        this.#language = val;
    }

    /**
     * URL from where to load JSON translation documents
     */
    get url() {
        return this.#url;
    }

    set url(val = '') {
        this.#url = val || globalThis.GS_LOCALIZATION_URL;
    }

    translate(language = '', value = '') {
        const me = this;
        if (GSUtil.isStringEmpty(language)) return value;
        if (!me.#languages.has(language)) {
            me.load(language);
            return value;
        }
        const deft = me.#getLanguage('default');
        const lang = me.#getLanguage(language);
        const texthash = deft.get(GSID.hashCode(value));
        return texthash ? lang.get(texthash) || value : value;
    }

    reset() {
        const me = this;
        me.#default = GS_LOCALIZATION_LANGUAGE;
        me.#language = undefined;
        me.load();
    }

    load(language = 'default') {
        const me = this;
        if (GSUtil.isStringEmpty(language)) return;
        if (GSUtil.isStringEmpty(me.url)) return;
        if (me.#languages.has(language)) return;
        me.#queue.add(language);
        if (me.#queued) return;
        me.#queued = true;
        queueMicrotask(async () => {
            const promises = Array.from(me.#queue.values()).map(l => me.loadWait(l));
            await GSPromise.sequential(promises);
            me.#queued = false;
        });

    }

    async loadWait(language) {
        const me = this;
        if (GSUtil.isStringEmpty(language)) return;
        if (GSUtil.isStringEmpty(me.url)) return;
        const headers = {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        };
        const url = GSLoader.normalizeURL(`${me.url}/${language}.json`);
        let res = await GSLoader.loadSafe(url, 'GET', headers, true);
        if (!res && language.indexOf('-') > 0) res = await me.loadWait(language.split('-')[0]);
        if (!res) return false;
        me.#queue.delete(language);
        me.#store(language, res);
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
        const isDefault = lang === 'default';
        const map = this.#getLanguage(lang);
        Object.entries(obj).forEach((kv) => {
            const hk = GSID.hashCode(kv[0].trim());
            map.set(hk, isDefault ? GSID.hashCode(kv[1]) : kv[1]);
        });
        GSEvents.send(window, 'gs-language', { details: lang });
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
        }
        return me.#languages.get(val);
    }

}

export const GSLocalization = new GSLocalizationImpl();