/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { AbstractTreeController } from './AbstractTreeController.mjs';

/**
 * Controller managing data TreeNode callbacks to reflect UI.
 */
export class TreeController extends AbstractTreeController {

    constructor(host) {
        super(host);
    }

    #toggleState(node, state = false) {
        const el = this.host(node);
        if (el) el.loading = state;
    }

    // Tree controller callbacks
    onLoad(node) {
        this.#toggleState(node, true);
    }

    onRefresh(node) {
        this.requestUpdate(node);
    }

    onAppend(node, addedNode) {
        this.#toggleState(node);
        this.requestUpdate(node.root);
    }

    onInsert(node, insertedNode) {
        this.#toggleState(node);
        this.requestUpdate(node.root);
    }

    onExpand(node) {
        const store = this.store;
        if (store) {
            store.onExpand(node);
        } else {
            this.requestUpdate(node);
        }
    }

    onCollapse(node) {
        this.requestUpdate(node);
    }

    onFocusChanged(node) {
        this.requestUpdate(node);
    }

    onSelectionChanged(node, selectedNode) {
        this.requestUpdate(node);
    }

    onRemove(node) {
        if (this.match(node)) this.host(node).remove();
    }
}