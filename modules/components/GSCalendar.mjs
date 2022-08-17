/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSCalendar class
 * @module components/GSCalendar
 */

import GSDate from '../base/GSDate.mjs';
import GSElement from '../base/GSElement.mjs'
import GSUtil from '../base/GSUtil.mjs';

/**
 * Generator for month selector panel
 * @class
 * @extends {GSElement}
 */
export default class GSCalendar extends GSElement {

    #date = null;

    static {
        customElements.define('gs-calendar', GSCalendar);
    }

    constructor() {
        super();
        this.#date = new GSDate();
    }

    attributeChanged(name = '', oldVal = '', newVal = '') {
        const me = this;
        if (name === 'date') {
            me.#date = new GSDate(newVal);
            me.#update();
        }
    }

    connectedCallback() {
        super.connectedCallback();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    onReady() {
        const me = this;
        me.#update();
        //me.findAll('.arrow').forEach(el => me.attachEvent(el, 'click', me.#onArrow.bind(me)) );                
        me.attachEvent(me.findEl('.header'), 'click', me.#onArrow.bind(me));
        me.attachEvent(me.findEl('.days'), 'click', me.#onDay.bind(me));
        super.onReady();
    }

    async getTemplate(val = '') {
        return this.#toHTML();
    }

    get date() {
        return GSUtil.getAttribute(this, 'date', this.#date.toISOString());
    }

    set date(val = '') {
        GSUtil.setAttribute(this, 'date', val);
    }

    get css() {
        return GSUtil.getAttribute(this, 'css');
    }

    set css(val = '') {
        GSUtil.setAttribute(this, 'css', val);
    }

    get cssHeader() {
        return GSUtil.getAttribute(this, 'css-header');
    }

    set cssHeader(val = '') {
        GSUtil.setAttribute(this, 'css-header', val);
    }

    get cssTitle() {
        return GSUtil.getAttribute(this, 'css-title', 'fs-3 fw-bold');
    }

    set cssTitle(val = '') {
        GSUtil.setAttribute(this, 'css-title', val);
    }

    get cssSubtitle() {
        return GSUtil.getAttribute(this, 'css-subtitle', 'fs-5 fw-bold');
    }

    set cssSubtitle(val = '') {
        GSUtil.setAttribute(this, 'css-subtitle', val);
    }

    get cssNav() {
        return GSUtil.getAttribute(this, 'css-nav', 'btn-light');
    }

    set cssNav(val = '') {
        GSUtil.setAttribute(this, 'css-nav', val);
    }

    get cssWeeks() {
        return GSUtil.getAttribute(this, 'css-weeks', 'fw-bold text-bg-dark');
    }

    set cssWeeks(val = '') {
        GSUtil.setAttribute(this, 'css-weeks', val);
    }

    get cssDays() {
        return GSUtil.getAttribute(this, 'css-days');
    }

    set cssDays(val = '') {
        GSUtil.setAttribute(this, 'css-days', val);
    }

    get cssSelected() {
        return GSUtil.getAttribute(this, 'css-selected', 'btn-primary');
    }

    set cssSelected(val = '') {
        GSUtil.setAttribute(this, 'css-selected', val);
    }

    get cssToday() {
        return GSUtil.getAttribute(this, 'css-today', 'btn-secondary');
    }

    set cssToday(val = '') {
        GSUtil.setAttribute(this, 'css-today', val);
    }

    #onDay(e) {
        const me = this;
        const btn = e.path[0];
        if (!GSUtil.hasClass(btn, 'day')) return;
        const day = GSUtil.asNum(btn.innerText.trim());
        requestAnimationFrame(()=> {
            me.findAll('.day').forEach(el => GSUtil.toggleClass(el, false, me.cssSelected));
            GSUtil.toggleClass(btn, true, me.cssSelected);
        });
        const date = new GSDate(me.#date);
        date.day = day;
        GSUtil.sendEvent(me, 'date', {date}, true);
    }

    #onArrow(e) {
        const me = this;
        const btn = e.path[0];
        if (!GSUtil.hasClass(btn, 'arrow')) return;
        btn.blur();
        const isPrev = GSUtil.hasClass(btn, 'prev');
        isPrev ? me.#date.month-- : me.#date.month++;
        me.#update();
    }

    #update() {
        const me = this;        
        me.findEl('.days').innerHTML = me.#daysHTML();
        me.findEl('.month').innerHTML = me.#date.monthName;
        me.findEl('.year').innerHTML = me.#date.getFullYear();
    }

    #isToday(v, date) {
        const me = this;
        return v && GSUtil.asNum(v) === me.#date.day && date.month === me.#date.month && me.#date.year === date.year;
    }

    #daysHTML() {
        const me = this;
        const today = new GSDate();
        const list = me.#date.build();
        const html = list
            .map(v => `<div class="col p-0"><a href="#" class="btn ${ me.#isToday(v, today) ? me.cssToday : '' } ${v ? 'day' : ''}">${v}</a></div>`)
            .map((v ,i) => {
                if (i === 0) return `<div class="row">${v}`;
                const isBreak = i % 7 == 0;                            
                return isBreak ? `</div><div class="row">${v}` : v;
            });
            html.push('</div>');
            return html.join('');
    }

    #toHTML() {
        const me = this;
        const date = me.#date;
        const week = GSDate.weekDays(date.isMondayFirst, true).map(v => `<div class="col">${v}</div>`).join('');
        return `<div class="container-fluid text-center ${me.css}">
                <div class="row align-items-center ${me.cssHeader} header">
                    <div class="col-1 p-0">
                        <a href="#" class="btn ${me.cssNav} arrow prev">&#10094;</a>
                    </div>
                    <div class="col title">
                        <span class="${me.cssTitle} month">${date.monthName}</span>
                        <br>
                        <span class="${me.cssSubtitle} year">${date.getFullYear()}</span>
                    </div>
                    <div class="col-1 p-0">
                        <a href="#" class="btn ${me.cssNav} arrow next">&#10095;</a>
                    </div>
                </div>
                <div class="row weeks ${me.cssWeeks}">${week}</div>
                <div class="row days ${me.cssDays}"></div>
            </div>`.replace(/\n/g,'');
    }
}