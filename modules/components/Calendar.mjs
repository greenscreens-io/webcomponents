/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { unsafeHTML, classMap, html, ifDefined, css } from '../lib.mjs';
import { GSElement } from '../GSElement.mjs';
import { GSUtil } from '../base/GSUtil.mjs';
import { GSDate } from '../base/GSDate.mjs';
import { GSEvents } from '../base/GSEvents.mjs';
import { GSDOM } from '../base/GSDOM.mjs';
import { notEmpty, numGE0 } from '../properties/index.mjs';
import { GSID } from '../base/GSID.mjs';

export class GSCalendarElement extends GSElement {

  static styles = css`.year::-webkit-outer-spin-button,.year::-webkit-inner-spin-button {-webkit-appearance: none;margin: 0;} .year {-moz-appearance: textfield;} .day:focus{font-weight: bold;}`

  static properties = {
    date: {},
    target: {},
    format: { hasChanged: notEmpty },
    editable: { type: Boolean },
    range: { type: Number },
    year: { type: Number },
    month: { type: Number, hasChanged: numGE0 },
    day: { type: Number, hasChanged: numGE0 },
    minYear: { attribute: 'year-min', type: Number },
    maxYear: { attribute: 'year-max', type: Number },
    arrovPrev: { attribute: 'arrow-prev' },
    arrowNext: { attribute: 'arrow-next' },
    cssDays: { attribute: 'css-days' },
    cssToday: { attribute: 'css-today' },
    cssWeeks: { attribute: 'css-weeks' },
    cssMonth: { attribute: 'css-month' },
    cssYear: { attribute: 'css-year' },
    cssNav: { attribute: 'css-nav' },
    cssHeader: { attribute: 'css-header' },
    cssSelected: { attribute: 'css-selected' },
  }

  #date;
  #selected;

  constructor() {
    super();
    const me = this;
    me.#date = new GSDate();
    me.#date.day = 1;
    me.#selected = new GSDate();
    me.#date.language = GSUtil.language;
    me.#selected.language = GSUtil.language;
    
    me.language = GSUtil.language;
    me.day = me.#selected.day;
    me.month = me.#selected.month;
    me.year = me.#selected.year;
    
    me.editable = false;
    me.range = 5;
    me.minYear = 1900;
    me.maxYear = 2100;
    me.arrowPrev = '&#10094;';
    me.arrowNext = '&#10095;';
    me.cssNav = 'btn-light';
    me.cssToday = 'btn-secondary';
    me.cssSelected = 'btn-primary';
    me.cssWeeks = 'fw-bold text-bg-dark';
    me.cssYear = 'form-control fs-5 fw-bold border-0 text-center m-1 p-0';
    me.cssMonth = 'form-control fs-3 fw-bold border-0 text-center m-1 p-0';
  }

  get date() {
    const me = this;
    //return this.#date.toISOString();
    return new Proxy(this.#date, {
      set(target, prop, value) {
        if (typeof target[prop] != 'function') {
          target[prop] = value;
          me.#update();
        }
        return true;
      },
      get(target, prop, receiver) {
        const value = target[prop];
        if (value instanceof Function) {
          return function (...args) {
            try {
              return value.apply(this === receiver ? target : this, args);
            } finally {
              me.#update();
            }
          };
        }
        return value;
      }
    });
  }

  previousMonth() {
    const me = this;
    if (me.month == 0) {
      me.month = 11;
      me.year--;
    } else {
      me.month--;
    }
  }

  nextMonth() {
    const me = this;
    if (me.month == 11) {
      me.month = 0;
      me.year++;
    } else {
      me.month++;
    }
  }

  previousYear() {
    this.year--;
  }

  nextYear() {
    this.year++;
  }

  formatted(date) {
    const me = this;
    return (date || me.#date).format(me.format, me.language);
  }

  updated() {
    const me = this;
    const date = new GSDate(me.#date);
    me.#updateTarget(date);
    me.emit('date', { type: 'calendar', date: date, val: me.formatted(date) }, true, true);
  }

  renderUI() {
    const me = this;
    me.#date.day = 1;
    me.#date.month = me.month;
    me.#date.year = me.year;
    me.#date.day = me.day;
    me.#date.language = me.language;

    const week = GSDate.dayList(true, me.language).map(v => html`<div class="col">${v}</div>`);
    const months = me.#monthsHTML();
    const year = me.#yearHTML();

    return html`
          <div class="container-fluid text-center ${classMap(me.renderClass())}"
          dir="${ifDefined(me.direction)}"
          @keydown="${me.#onKey}"
          @click="${me.#onDay}">
          <div class="row align-items-center ${me.cssHeader} header">
              <div class="col-auto">
                  <a href="#" @click="${me.previousMonth}" class="btn ${me.cssNav} arrow prev">${unsafeHTML(me.arrowPrev)}</a>
              </div>
              <div class="col"></div>
              <div class="col-auto">
                  ${months}
                  ${year}
              </div>
              <div class="col"></div>
              <div class="col-auto">
                  <a href="#" @click="${me.nextMonth}" class="btn ${me.cssNav} arrow next">${unsafeHTML(me.arrowNext)}</a>
              </div>
          </div>
          <div class="row weeks ${me.cssWeeks}">${week}</div>
          ${unsafeHTML(me.#daysHTML())}
      </div>`;
  }

  #updateTarget(date) {
    const me = this;
    if (!me.target) return;
    const tgt = GSDOM.query(document.documentElement, me.target);
    if (!tgt) return;

    if (tgt instanceof HTMLInputElement) {
      if (tgt.type === 'date') return tgt.valueAsDate = date;
      return tgt.value = me.formatted(date);
    }
    GSDOM.setHTML(tgt, me.formatted(date));
  }

  #update() {
    const me = this;
    me.#selected.day = 1;
    me.#selected.month = me.#date.month;
    me.#selected.year = me.#date.year;
    me.#selected.day = me.#date.day;
    me.#selected.language = me.#date.language;

    me.day = me.#date.day;
    me.month = me.#date.month;
    me.year = me.#date.year;
    me.language = me.#date.language;
  }

  #isToday(v, date) {
    const me = this;
    return v && GSUtil.asNum(v) === date.day && date.month === me.#date.month && me.#date.year === date.year;
  }

  #daysHTML() {
    const me = this;
    const today = new GSDate();
    today.language = me.language;
    const list = me.#date.build(me.language);
    const result = list
      .map(v => {
        const c1 = me.#isToday(v, today) ? me.cssToday : '';
        const c2 = me.#isToday(v, me.#selected) ? me.cssSelected : '';

        const d = v ? `<a tabindex="0" href="#" class="btn shadow-none ${c2} ${c1} day" data-day="${v}">${v}</a>` : ''
        return `<div class="col p-0">${d}</div>`;
      })
      .map((v, i) => {
        if (i === 0) return `<div class="row days">${v}`;
        const isBreak = i % 7 == 0;
        return isBreak ? `</div><div class="row days">${v}` : v;
      });
    result.push('</div>');
    return result.join('');
  }

  #monthsHTML() {
    const me = this;
    const current = me.#date.MMMM;
    const months = GSDate.monthList(false, me.language);
    const list = months.map((v, i) => html`<option value="${i}" selected=${ifDefined(current == v ? true : undefined)}>${v}</option>`);
    return html`<select @change="${me.#onMonth}" name="month" class="month ${me.cssMonth}" value="${months.indexOf(current)}">${list}</select>`;
  }

  #yearHTML() {

    const me = this;

    const options = [];
    let minYear = me.minYear;
    let maxYear = me.maxYear;

    if (me.range > 0) {
      const year = new GSDate().year;
      minYear = year - me.range;
      maxYear = year + me.range;
      me.#optionsHTML(options, minYear, maxYear);
    }

    if (!me.editable) {
      return html`<select @change="${me.#onYear}" name="year" class="year ${me.cssYear}" data-gs-min="${minYear}" data-gs-max="${maxYear}">${options}</select>`;
    }

    const isList = me.editable && me.range && options.length > 0;
    const listID = isList ? GSID.next : null;
    const list = isList ? html`<datalist id="${listID}">${options}</datalist>` : '';

    return html`<input name="year" 
      type="number" 
      list="${ifDefined(listID)}"
      class="year ${me.cssYear}" 
      @change="${me.#onYear}" 
      min="${minYear}" 
      max="${maxYear}"
      value="${me.#date.getFullYear()}">
      ${list}`;
  }

  #optionsHTML(options, minYear = 0, maxYear = 0) {
    const me = this;
    let val = minYear;
    while (val <= maxYear) {
      if (me.editable) {
        options.push(html`<option value="${val}" selected=${ifDefined(val == me.year ? true : undefined)}>`);
      } else {
        options.push(html`<option value="${val}" selected=${ifDefined(val == me.year ? true : undefined)}>${val}</option>`);
      }
      val++;
    }

    return options;
  }

  #onDay(e) {
    GSEvents.prevent(e);
    if (!e.target.classList.contains('day')) return;
    const me = this;
    const day = GSUtil.asNum(e.target.dataset.day, me.day);

    me.#selected.day = 1;
    me.#selected.month = me.month;
    me.#selected.year = me.year;
    me.#selected.day = day;

    me.day = day;
  }

  #onMonth(e) {
    this.month = e.target.selectedIndex;
  }

  #onYear(e) {
    const yearEl = e?.target;
    if (yearEl?.validity.valid) {
      this.year = yearEl.value;
    }
  }

  #onKey(e) {
    // console.log(e);
  }

  static {
    this.define('gs-calendar');
  }

}