/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

import GSEvents from "./GSEvents.mjs";

export default class GSTouch {

    #xDiff = 0;
    #yDiff = 0;
    #xDown = null;
    #yDown = null;
    #element = null;
    #bindings = null;

    constructor(element) {
        const me = this;
        me.#xDown = null;
        me.#yDown = null;
        me.#element = typeof (element) === 'string' ? document.querySelector(element) : element;

        me.#bindings = {
            move : me.#handleTouchMove.bind(me),
            start : me.#handleTouchStart.bind(me)
        };
        GSEvents.attach(me.#element, me.#element, 'touchmove', me.#bindings.move, false);
        GSEvents.attach(me.#element, me.#element, 'touchstart', me.#bindings.start, false);
    }

    unbind() {
        const me = this;
        GSEvents.remove(me.#element, me.#element, 'touchmove', me.#bindings.move);
        GSEvents.remove(me.#element, me.#element, 'touchstart', me.#bindings.start);
    }

    #handleTouchStart(evt) { 
        const me = this;
        me.#xDown = evt.touches[0].clientX;
        me.#yDown = evt.touches[0].clientY;
    }

    #handleTouchMove(evt) {

        const me = this;

        if (!me.#xDown || !me.#yDown) {
            return;
        }

        const xUp = evt.touches[0].clientX;
        const yUp = evt.touches[0].clientY;

        me.#xDiff = me.#xDown - xUp;
        me.#yDiff = me.#yDown - yUp;

        // Most significant.
        const isHorisontal = Math.abs(me.#xDiff) > Math.abs(me.#yDiff);

        let name = '';
        if (isHorisontal) {
            name = me.#xDiff > 0 ? 'swipe-left' : 'swipe-right';
        } else {
            name = me.#yDiff > 0 ? 'swipe-up' : 'swipe-down';
        }

        GSEvents.send(me.#element, name, evt);

        // Reset values.
        me.#xDown = null;
        me.#yDown = null;
    }

    /**
     * Return number of fingers used in touch event
     * @param {Event} e 
     * @returns 
     */
    static fingers(e) {
		return e.detail.touches?.length;
	}

    /**
     * Attach swipe event to a element
     * @param {HTMLElement} element 
     * @returns 
     */
    static attach(element) {
        return new GSTouch(element);
    }
}