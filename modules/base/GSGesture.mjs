/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSGesture class
 * @module base/GSGesture
 */
import GSEvents from "./GSEvents.mjs";

/**
 * A class for handling touch swipe and long press events.
 * @class
 */
export default class GSGesture {

    #xDiff = 0;
    #yDiff = 0;
    #xDown = null;
    #yDown = null;
    #element = null;
    #bindings = null;

    #swipe = false;
    #tap = false;
    #longPress = false;

    // setTimeout id for longpress
    #delay = 0;

    // longpress delay
    static timeout = 1500;

    /**
     * Constrictor to attach Gesture featuer t oan HTML element
     * @param {HTMLElement} element 
     * @param {boolean} swipe Monitor swipe gesture
     * @param {boolean} tap Monitor tap gesture
     * @param {boolean} longPress Monitor long press gesture
     */
    constructor(element, swipe, tap, longPress) {
        const me = this;
        me.#swipe = swipe;
        me.#tap = tap;
        me.#longPress = longPress;        
        me.#xDown = null;
        me.#yDown = null;
        me.#element = typeof (element) === 'string' ? document.querySelector(element) : element;

        me.#bindings = {
            move : me.#handleTouchMove.bind(me),
            start : me.#handleTouchStart.bind(me),
            end : me.#handleTouchEnd.bind(me)
        };
        GSEvents.attach(me.#element, me.#element, 'touchmove', me.#bindings.move, false);
        GSEvents.attach(me.#element, me.#element, 'touchstart', me.#bindings.start, false);
        GSEvents.attach(me.#element, me.#element, 'touchend', me.#bindings.end, false);
    }

    /**
     * Remove gesture events from element
     */
    unbind() {
        const me = this;
        GSEvents.remove(me.#element, me.#element, 'touchmove', me.#bindings.move);
        GSEvents.remove(me.#element, me.#element, 'touchstart', me.#bindings.start);
        GSEvents.remove(me.#element, me.#element, 'touchend', me.#bindings.end);
    }

    #handleTouchStart(evt) { 
        const me = this;
        me.#xDown = evt.touches[0].clientX;
        me.#yDown = evt.touches[0].clientY;
        if (me.#longPress) setTimeout(me.#onLongPress.bind(me), GSGesture.timeout);
    }

    #handleTouchEnd(evt) {
        clearTimeout(this.#delay);
    }

    #handleTouchMove(evt) {

        const me = this;

        if (!me.#xDown || !me.#yDown) {
            return;
        }

        if (!me.#swipe) return;

        const xUp = evt.touches[0].clientX;
        const yUp = evt.touches[0].clientY;

        if (me.#longPress) {
            const isMoving = Math.abs(me.#xDiff) > 10 &&  Math.abs(me.#yDiff) > 10;
            if (isMoving) clearTimeout(me.#delay);
        }

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

    #onLongPress() {
        GSEvents.send(me.#element, 'long-press');
    }

    /**
     * Return number of fingers used in touch event
     * @param {Event} e 
     * @returns {numner}
     */
    static fingers(e) {
		return e.detail.touches?.length;
	}

    /**
     * Attach swipe event to a element
     * @param {HTMLElement} element 
     * @returns 
     */
    static attach(element, swipe = true, tap = false, longPress = false) {
        return new GSGesture(element, swipe, tap, longPress);
    }
}