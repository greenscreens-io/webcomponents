/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { KEY } from '../../../base/GSConst.mjs';

/**
 * Controller managing data tree navigation.
 * Controller is added to every gs-tree-node and 
 * reacts on Tree node changes to update UI
 */
export class AbstractTreeController {

    #host;
    #node;

    constructor(host) {
        const me = this;
        me.#host = host;
        host.addController(me);
    }
    
    hostConnected() {
        const me = this;
        me.#node = me.#host.node;
        me.#addNodeController(me);
    }

    hostDisconnected() {
        const me = this;
        me.#removeNodeController(me);
        me.#host.removeController(me);
    }

    // before rendering
    hostUpdate() {
        const me = this;
        const oldNode = me.#node;
        me.#node = me.#host.node;
        if (oldNode != me.#node) {
            me.#removeNodeController(me);
            me.#addNodeController(me);
        }
    }

    // link Tree node callbacks with controller and component
    #addNodeController(controller) {
        this.#host.node?.addController?.(controller);
    }

    // unlink Tree node callbacks with controller and component
    #removeNodeController(controller) {
        this.#node?.removeController?.(controller);
    }

    host(node) {
        return node[KEY] || this.#host;
    }

    match(node) {
        const host = this.host(node);
        return host?.node === node;
    }

    get store() {
        return this.#host.dataController?.store;
    }

    requestUpdate(node) {
        if (this.match(node)) this.host(node).requestUpdate();
    }

}