/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSChart class
 * @module components/GSChart
 */

import GSElement from "../base/GSElement.mjs";
import GSAttr from "../base/GSAttr.mjs";
import GSLoader from '../base/GSLoader.mjs';

/**
 * Code editor based on ChartJS Library
 * https://www.chartjs.org/docs/latest/
 * 
 * <gs-chart css=""></gs-chart>
 * 
 * @class
 * @extends {GSElement}
 */
export default class GSChart extends GSElement {

    static #isChart = false;
    static #initializing = false;
    static #Chart = null;

    #chart = null;

    static get URL_LIB() {
        return globalThis.GS_EXTERNAL == false || globalThis.GS_URL_CHART == false ? false : globalThis.GS_URL_CHART || globalThis.location?.origin || '/webcomponents';
    }

    static async #init() {
        if (GSChart.URL_LIB === false) return;
        if (GSChart.#isChart || GSChart.#initializing) return;
        GSChart.#initializing = true;
        try {
            const origin = GSChart.URL_LIB;
            const url = `${origin}/assets/chart/chart.mjs`;
            const { Chart, registerables } = await import(url);
            Chart.register(...registerables);        
            GSChart.#Chart = Chart;
            GSChart.#isChart = true;
        }  catch(e) {
            console.log(e);
        } finally {
            GSChart.#initializing = false;
        }
    }

    static {
        customElements.define('gs-chart', GSChart);
        Object.seal(GSChart);
        GSChart.#init();        
    }

    static get observedAttributes() {
        const attrs = ['width', 'height'];
        return GSElement.observeAttributes(attrs);
    }

    constructor() {
        super();
        GSChart.#init();
    }

    attributeCallback(name = '', oldValue = '', newValue = '') {
        const me = this;
        me.resize(me.width, me.height);

    }

    disconnectedCallback() {
        super.disconnectedCallback();
        const me = this;
        if (me.#chart) me.#chart.destroy();
        me.#chart = null;
    }

    async getTemplate(val = '') {
        const me = this;
        if (me.width && me.height) {
            return `<canvas width="${me.width}" height="${me.height}" class="${me.css}"></canvas>`;
        }
        return `<canvas class="${me.css}"></canvas>`;
    }

    onReady() {
        const me = this;
        super.onReady();
        me.#render();
    }

    get css() {
        return GSAttr.get(this, 'css', '');
    }

    set css(val = '') {
        return GSAttr.set(this, 'css', val);
    }

    get width() {
        return GSAttr.getAsNum(this, 'width', 0);
    }

    set width(val = '') {
        return GSAttr.setAsNum(this, 'width', val);
    }

    get height() {
        return GSAttr.getAsNum(this, 'height', 0);
    }

    set height(val = '') {
        return GSAttr.setAsNum(this, 'height', val);
    }

    /**
     * URL of chart JSON data
     */
    get data() {
        return GSAttr.get(this, 'data');
    }

    set data(val = '') {
        return GSAttr.get(this, 'data', val);
    }

    /**
     * URL of chart options JSON data
     */
    get options() {
        return GSAttr.get(this, 'options');
    }

    set options(val = '') {
        return GSAttr.get(this, 'options', val);
    }

    get canvas() {
        return this.query('canvas');
    }

    // https://www.chartjs.org/docs/latest/developers/api.html

    reset() {
        const me = this;
        if (me.#chart) me.#chart.reset();
    }

    render() {
        const me = this;
        if (me.#chart) me.#chart.render();
    }

    update(val) {
        const me = this;
        if (me.#chart) me.#chart.update(val);
    }

    stop() {
        const me = this;
        if (me.#chart) me.#chart.stop();
    }

    clear() {
        const me = this;
        if (me.#chart) me.#chart.clear();
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
        const me = this;
        if (me.#chart) return me.#chart.toBase64Image(type, quality);
    }

    // internal functions to render JSON from gs-items elements

    async #render() {

        const me = this;

        const options = await GSLoader.loadSafe(me.options, 'GET', null, true, {});
        const data = await GSLoader.loadSafe(me.data, 'GET', null, true, []);

        const el = me.querySelector('gs-item[group="options"]');
        const opt = Object.assign(options, GSChart.toJson(el));

        const sets = opt.data.datasets;
        sets.forEach((o, i) => {
            o.data = sets.length === 1 ? data : data[i] || [];
        });

        const ctx = me.canvas.getContext('2d');
        me.#chart = new GSChart.#Chart(ctx, opt);
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
				return GSChart.#toType(valV, typeV);
		}

		const childs = Array.from(el.children);
		const isArray = typeV === 'array';
		const isObject = typeV === 'object';

		childs.forEach(el => {
			const _nam = el.getAttribute(name);
			if (isArray) {
				obj.push(GSChart.toJson(el, name, value, type));
			} else if (isObject) {
				const tmp = GSChart.toJson(el, name, value, type);
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

}
