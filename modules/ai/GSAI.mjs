/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * A module loading GSAI class
 * @module base/GSAI
 */

/**
 * A generic set of static functions to handle Browser AI API.
 * 
 * @class
 */
export class GSAI {

    static get states() {
        return ['available', 'downloadable', 'downloading'];
    }

    static #detector = null;

    static get isSupportedTranslator() {
        return 'Translator' in self;
    }

    static get isSupportedLanguageDetector() {
        return 'LanguageDetector' in self;
    }

    static get isSupportedSummarizer() {
        return 'Summarizer' in self;
    }

    static get isSupportedRewriter() {
        return 'Rewriter' in self;
    }

    static get isSupportedWriter() {
        return 'Writer' in self;
    }

    static get isSupportedPrompt() {
        return 'LanguageModel' in self;
    }

    /**
     * Detect the language of the provided text.
     * 
     * @param {String} text 
     * @returns {String}
     * @description Returns the detected language code in ISO 639-1 alpha 2 format.
     */
    static async detectLanguage(text) {
        const me = this;
        me.#detector ??= await me.initDetector();
        const result = await me.#detector?.detect(text);
        return result?.[0]?.detectedLanguage || null;
    }

    /**
     * Check if the translation is available between two languages
     * NOTE: Languages must be provided in ISO 639-1 alpha 2 format 
     * @param {String} source 
     * @param {String} target 
     * @param {bool} asBool - return true or false instead of availability operation 
     * @returns {Promise<String>}
     * @description Returns a promise that resolves to 'downloadable', 'available', 'unavailable'
     * 
    */
    static async translatable(source, target, asBool = false) {
        let result = null;
        if (GSAI.isSupportedTranslator) {
            result = await self.Translator.availability({
                sourceLanguage: source,
                targetLanguage: target,
            });
        }
        return asBool ? this.states.includes(result) : result;
    }

    /**
     * Initialize text writer.
     * Can be used by webcomponents with custom options.
     *  {
     *    monitor(m) {
     *      m.addEventListener('downloadprogress', (e) => {
     *          console.log(`Downloaded ${e.loaded * 100}%`);
     *      });
     *    },
     *  }
     * @param {*} options 
     * @returns 
     */
    static async initWriter(options = {}) {
        let writer = null;
        if (GSAI.isSupportedWriter) {
            writer = await self.Writer.create(options);
        }
        return writer;
    }


    /**
     * Initialize text rewriter.
     * Can be used by webcomponents with custom options.
     *  {
     *    sharedContext: 'This is an email to acquaintances about an upcoming event.',
     *    tone: 'more-casual',
     *    format: 'plain-text',
     *    length: 'shorter',
     *    monitor(m) {
     *      m.addEventListener('downloadprogress', (e) => {
     *          console.log(`Downloaded ${e.loaded * 100}%`);
     *      });
     *    },
     *  }
     * @param {*} options 
     * @returns 
     */
    static async initRewriter(options = {}) {
        let rewriter = null;
        if (GSAI.isSupportedRewriter) {
            rewriter = await self.Rewriter.create(options);
        }
        return rewriter;
    }

    /**
     * Initialize language detector.
     * Can be used by webcomponents with custom options.
     *  {
     *    monitor(m) {
     *      m.addEventListener('downloadprogress', (e) => {
     *          console.log(`Downloaded ${e.loaded * 100}%`);
     *      });
     *    },
     *  }
     * @param {*} options 
     * @returns 
     */
    static async initDetector(options = {}) {
        let detector = null;
        if (GSAI.isSupportedLanguageDetector) {
            detector = await self.LanguageDetector.create(options);
            // await detector.ready;
        }
        return detector;
    }

    /**
     * Initialize language translator.
     * Can be used by webcomponents with custom options.
     * const opt = {
     *    monitor(m) {
     *      m.addEventListener('downloadprogress', (e) => {
     *          console.log(`Downloaded ${e.loaded * 100}%`);
     *      });
     *    },
     *  }
     * 
     * const translator = await GSAI.initTranslator('hr','en', opt);
     * await translator?.translate('crvena lisica skače preko lijenog psa');
     * @param {*} source 
     * @param {*} target 
     * @param {*} options 
     * @returns 
     */
    static async initTranslator(source, target, options = {}) {
        let translator = null;
        if (GSAI.isSupportedTranslator) {
            const ok = await GSAI.translatable(source, target, true);
            if (ok) {
                const cfg = {
                    sourceLanguage: source,
                    targetLanguage: target,
                    ...options,
                };
                translator = await self.Translator.create(cfg);
            }
        }
        return translator;
    }

    /**
     * Initialize text summarizer.
     * Refer for API details https://developer.chrome.com/docs/ai/summarizer-api
     * 
     * const summary = await summarizer.summarize(longText, {
     *   context: 'This article is intended for a tech-savvy audience.',
     * });
     * @param {*} options 
     * @returns 
     */
    static async initSummarizer(options = {}) {
        let summarizer = null;
        if (GSAI.isSupportedSummarizer) {
            summarizer = await self.Summarizer.create(options);
        }
        return summarizer;
    }    
}