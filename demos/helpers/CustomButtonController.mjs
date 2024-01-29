/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

/**
 * Custom controller code to attach to the gs-button conponent through the DOM.
 */
export class CustomButtonController {

    #host;

    constructor(host) {
        this.#host = host;
        host.addController(this);
    }

    // called when "host" component is added to the DOM tree
    hostConnected() {
        console.log('connected');
        const me = this;
        me.#host.on('click', me.#onClick.bind(me));
    }

    // called when "host" component is removed from the DOM tree
    hostDisconnected() {
        console.log('disconnected');
        const me = this;
        me.#host.removeController(me);
        me.#host = null;
    }

    // called on web component reactive property changes
    hostUpdate() {
        console.log('update');
    }

    // called after component UI is updated after reactive changes
    hostUpdated() {
        console.log('updated');
    }

    // handler for host click event
    #onClick(e) {
        console.log(e);
        alert('Button clicked from custom controller!')
    }

}