/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { GSUtil } from "./GSUtil.mjs";

/**
 * A module loading GSDate class
 * @module base/GSDate
 */

/**
 * Custom Date class to help handling calendar and date formatting
 * 
 * @class
 */
export class GSDate extends Date {

    static DEFAULT_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';
    static REGEX_FORMAT = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g

    #language = navigator.language;

    format(val = GSDate.DEFAULT_FORMAT, language) {
        const me = this;
        if (language) me.language = language;
        const obj = me.asJSON();
        return val.replace(GSDate.REGEX_FORMAT, (match, val) => val || obj[match]);
    }

    /**
     * Build array days/weeks for a month
     * @returns {Array<string>}
     */
    build() {
        const me = this;
        const last = me.last.getDate();
        const first = me.first.getDay();
        const mondayFirst = me.#isMondayFirst();
        const dayOffset = mondayFirst ? (first + 6) % 7 : first;
        const days = Array(dayOffset).fill('');

        let i = 1;
        while (i <= last) {
            days.push(i.toString());
            i++;
        }

        while (days.length % 7 != 0) days.push('');

        return days;
    }

    get language() {
        return this.#language;
    }

    set language(val) {
        this.#language = val || navigator.language;
    }

    get year() {
        return this.getFullYear();
    }

    set year(val = 0) {
        this.setFullYear(val);
    }

    get month() {
        return this.getMonth();
    }

    set month(val = 0) {
        this.setMonth(val);
    }

    get day() {
        return this.getDate();
    }

    set day(val = 0) {
        this.setDate(val);
    }

    /**
     * First date of the month
     * @returns {Date}
     */
    get first() {
        return new GSDate(this.getFullYear(), this.getMonth(), 1);
    }

    /**
     * Last date of the month
     * @returns {Date}
     */
    get last() {
        return new GSDate(this.getFullYear(), this.getMonth() + 1, 0);
    }

    get YY() {
        return String(this.YYYY).slice(-2);
    }

    get YYYY() {
        return this.getFullYear();
    }

    get M() {
        return this.getMonth() + 1;
    }

    get MM() {
        return this.M.toString().padStart(2, '0');
    }

    get MMM() {
        return this.#toLocale({ month: 'short' });
    }

    get MMMM() {
        return this.#toLocale({ month: 'long' });
    }

    get D() {
        return this.getDate().toString();
    }

    get DD() {
        return this.D.padStart(2, '0');
    }

    get d() {
        return this.getDay().toString();
    }

    get dd() {
        return this.ddd.slice(0, 2);
    }

    get ddd() {
        return this.#toLocale({ weekday: 'short' });
    }

    get dddd() {
        return this.#toLocale({ weekday: 'long' });
    }

    get H() {
        return this.getHours().toString();
    }

    get HH() {
        return this.H.padStart(2, '0');
    }

    get h() {
        return this.#formatHour(1);
    }

    get hh() {
        return this.#formatHour(2);
    }

    get a() {
        return this.#meridiem(true);
    }

    get A() {
        return this.#meridiem(false);
    }

    get m() {
        return this.getMinutes().toString();
    }

    get mm() {
        return this.m.padStart(2, '0');
    }

    get s() {
        return this.getSeconds().toString();
    }

    get ss() {
        return this.s.padStart(2, '0');
    }

    get SSS() {
        return this.getMilliseconds().toString().padStart(3, '0');
    }

    get Z() {
        return this.#zoneStr();
    }

    get ZZ() {
        return this.Z.replace(':', '');
    }

    get Q() {
        return Math.ceil(this.M / 3);
    }

    get k() {
        return (this.getHours() + 1).toString();
    }

    get kk() {
        return this.k.padStart(2, '0');
    }

    get W() {
        const date = new Date(this.getTime());
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        const week1 = new Date(date.getFullYear(), 0, 4);
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    }

    get WW() {
        return this.W.toString().padStart(2, '0');
    }

    get x() {
        return this.getTime();
    }

    get X() {
        return Math.floor(this.x / 1000);
    }

    asJSON() {
        const me = this;
        return {
            YY: me.YY,
            YYYY: me.YYYY,
            M: me.M,
            MM: me.MM,
            MMM: me.MMM,
            MMMM: me.MMMM,
            D: me.D,
            DD: me.DD,
            d: me.d,
            dd: me.dd,
            ddd: me.ddd,
            dddd: me.dddd,
            H: me.H,
            HH: me.HH,
            h: me.h,
            hh: me.hh,
            a: me.a,
            A: me.A,
            m: me.m,
            mm: me.mm,
            s: me.s,
            ss: me.ss,
            SSS: me.SSS,
            Z: me.Z,
            ZZ: me.ZZ,
            Q: me.Q,
            k: me.k,
            kk: me.kk,
            W: me.W,
            WW: me.WW,
            x: me.x,
            X: me.X
        }
    }

    static monthList(short = false, language = navigator.language, capitalize = true) {
        const tmp = new GSDate();
        tmp.language = language;
        tmp.setDate(1);
        tmp.setMonth(0);
        const days = [];
        let val = null;
        let d = 12;
        while (d--) {
            val = short ? tmp.MMM : tmp.MMMM;
            val = capitalize ? tmp.#capitalize(val) : val;
            days.push(val);
            tmp.setMonth(tmp.getMonth() + 1);
        }
        return days;
    }

    static dayList(short = false, language = navigator.language, capitalize = true) {
        const tmp = new GSDate();
        tmp.language = language;
        const mondayFirst = tmp.#isMondayFirst();
        const offset = mondayFirst ? 1 : 0;
        tmp.setDate(tmp.getDate() - tmp.getDay() + offset);
        const days = [];
        let val = null;
        let d = 7;
        while (d--) {
            val = short ? tmp.ddd : tmp.dddd;
            val = capitalize ? tmp.#capitalize(val) : val;
            days.push(val);
            tmp.setDate(tmp.getDate() + 1);
        }
        return days;
    }

    #isMondayFirst() {
        // TODO Firefox does not support it
        return new Intl.Locale(this.#language)?.getWeekInfo()?.firstDay === 1;
    }

    #capitalize(val = '') {
        return val.charAt(0).toUpperCase() + val.slice(1);
    }

    #toLocale(opt) {
        return this.toLocaleString(this.#language, opt);
    }

    #formatHour(size) {
        return (this.getHours() % 12 || 12).toString().padStart(size, '0');
    }

    #meridiem(isLowercase) {
        const opt = { hour: '2-digit', hour12: true };
        const val = this.#toLocale(opt).split(' ').pop(-1);
        return isLowercase ? val.toLowerCase() : val;
    }

    #zoneStr() {
        const me = this;
        const negMinutes = -1 * me.getTimezoneOffset();
        const minutes = Math.abs(negMinutes)
        const hourOffset = Math.floor(minutes / 60)
        const minuteOffset = minutes % 60;

        const seg1 = negMinutes <= 0 ? '+' : '-';
        const seg2 = hourOffset.toString().padStart(2, '0');
        const seg3 = minuteOffset.toString().padStart(2, '0');

        return `${seg1}${seg2}:${seg3}`;
    }

    static parse(value, format, language) {
        format = format || GSUtil.getDateFormat(language);
        const regex = GSDate.#getFormattedDateRegex(format);
        return GSDate.#parseFormattedDate(value, regex);
    }

    static #getFormattedDateRegex(format) {
        return new RegExp(
            '^\\s*' + format.toUpperCase().replaceAll(/([MDY])\1*/g, '(?<$1>\\d+)') + '\\s*$'
        );
    }

    static #parseFormattedDate(value, regex) {

        const { groups } = value.match(regex) ?? {};

        if (!groups) return null;

        const y = Number(groups.Y);
        const m = Number(groups.M);
        const d = Number(groups.D);

        // Validate range of year and month
        if (y < 1000 || y > 2999) return null;
        if (m < 1 || m > 12) return null;

        const date = new Date(y, m - 1, d);

        // Validate day of month exists
        if (d !== date.getDate()) return null;

        return isNaN(date.valueOf()) ? null : date;
    }

    /**
     * Check if a year is a leap year
     * @param {number} year 
     * @returns {Boolean}
     */
    static isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    static {
        globalThis.GSDate = GSDate;
    }
}

