/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { classMap, createRef, html, ifDefined, ref } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSLoader } from '../base/GSLoader.mjs';
import { GSEvents } from '../base/GSEvents.mjs';
import { GSLog } from '../base/GSLog.mjs';

export class GSChartElement extends GSElement {

    static get URL_LIB() {
        return globalThis.GS_URL_CHART || globalThis.location?.origin || '/bootstrap-lit';
    }

    static properties = {
        url: {},
        config: {},
        storage: {},
        height: { type: Number },
        width: { type: Number },
        data: { type: Array },
        options: { type: Object },
    }

    #canvasRef = createRef();
    #chart = null;

    constructor() {
        super();
        this.height = 0;
        this.width = 0;
        GSChartElement.#init();
    }

    connectedCallback() {
        super.connectedCallback();
        this.#waitInit();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        const me = this;
        if (me.#chart) me.#chart.destroy();
        me.#chart = null;
    }

    shouldUpdate(changed) {
        return GSChartElement.#isChart;
    }

    firstUpdated(changed) {
        this.#render();
        super.firstUpdated(changed);
    }

    updated(changed) {
        const me = this;
        if (changed.has('url') || changed.has('config')) me.#render();
        if (changed.has('data') || changed.has('options')) me.#renderData(me.data, me.options);
    }

    renderUI() {
        const me = this;
        return html`<canvas ${ref(me.#canvasRef)} 
                class="${classMap(me.renderClass())}"
                width="${ifDefined(me.width > 0 ? me.width : false)}" 
                height="${ifDefined(me.height > 0 ? me.height : false)}" >
            </canvas>`;
    }

    onDataRead(data) {
        this.data = data;
    }

    get canvas() {
        return this.#canvasRef.value;
    }

    // https://www.chartjs.org/docs/latest/developers/api.html

    reset() {
        this.#chart?.reset();
    }

    refresh() {
        this.#chart?.render();
    }

    updateChart(val) {
        this.#chart?.update(val);
    }

    stop() {
        this.#chart?.stop();
    }

    clear() {
        this.#chart?.clear();
    }

    resize(x, y) {
        const me = this;
        if (!me.#chart) return;
        requestAnimationFrame(() => {
            const div = me.query('div');
            if (div) {
                div.style.width = `${x}px`;
                div.style.height = `${y}px`;
            }
            me.#chart.resize(x, y);
        });
    }

    toBase64Image(type = "image/png", quality = 1) {
        return this.#chart?.toBase64Image(type, quality);
    }

    // internal functions to render JSON from gs-items elements

    async #render() {
        const me = this;
        const options = await GSLoader.loadSafe(me.config, 'GET', null, true, {});
        const data = await GSLoader.loadSafe(me.url, 'GET', null, true, []);
        me.data = data;
        me.options = options;
    }

    #renderData(data, options) {
        const me = this;
        const el = me.querySelector('gs-item[group="options"]');
        const opt = Object.assign(options, GSChartElement.toJson(el));

        const sets = opt.data.datasets;
        sets.forEach((o, i) => o.data = sets.length === 1 ? data : data[i] || []);

        if (me.#chart) return me.updateChart(opt);

        const ctx = me.canvas.getContext('2d');
        me.#chart = new GSChartElement.#Chart(ctx, opt);
    }

    async #waitInit() {
        if (!GSChartElement.#isChart) await GSEvents.wait(document, 'gs-chart', 0, false);
        this.requestUpdate();
    }

    static #isChart = false;
    static #initializing = false;
    static #Chart = null;

    static async #init() {
        const me = GSChartElement;
        if (me.URL_LIB === false) return;
        if (me.#isChart || me.#initializing) return;
        me.#initializing = true;
        try {
            const origin = GSChartElement.URL_LIB;
            const url = `${origin}/assets/chart/chart.mjs`;
            const { Chart, registerables } = await import(url);
            Chart.register(...registerables);
            me.#Chart = Chart;
            me.#isChart = true;
            GSEvents.send(document, 'gs-chart');
        } catch (e) {
            GSLog.error(null, e);
        } finally {
            me.#initializing = false;
        }
    }

    /**
     * Convert DOM tree into a JSON structure
     * 
     * @param {HTMLElement} obj HTML element instance to convert
     * @param {string} name DOM attribute name for object key
     * @param {string} value DOM attribute name for object value
     * @param {string} type DOM attribute name for object type
     * @returns {object}
     */
    static toJson(el, name = 'name', value = 'value', type = 'type') {


        if (!(el instanceof HTMLElement)) return {};

        const nameV = el.getAttribute(name);
        const valV = el.getAttribute(value);
        const typeV = el.getAttribute(type);

        let obj = null;

        switch (typeV) {
            case 'array':
                obj = [];
                break;
            case 'object':
                obj = {};
                break;
            default:
                return GSChartElement.#toType(valV, typeV);
        }

        const childs = Array.from(el.children);
        const isArray = typeV === 'array';
        const isObject = typeV === 'object';

        childs.forEach(el => {
            const _nam = el.getAttribute(name);
            if (isArray) {
                obj.push(GSChart.toJson(el, name, value, type));
            } else if (isObject) {
                const tmp = GSChartElement.toJson(el, name, value, type);
                obj[_nam] = tmp;
            } else {
                const _val = el.getAttribute(value);
                const _typ = el.getAttribute(type);
                obj[nameV][_nam] = GSChart.#toType(_val, _typ);
            }
        });

        return obj;
    }

    static #toType(val, type) {
        switch (type) {
            case 'boolean': return val === 'true';
            case 'number': return parseFloat(val);
            default: return val
        }
    }

    static {
        this.define('gs-chart');
    }

}