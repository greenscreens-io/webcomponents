/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * A module loading GSFileBox class
 * @module components/filebox/GSFileBox
 */

import { classMap, createRef, ref, css, html, ifDefined } from '../../lib.mjs';
import { GSElement } from '../../GSElement.mjs';
import { GSAttachment } from './Attachment.mjs';
import { GSEvents } from '../../base/GSEvents.mjs';

/**
 * File box allows drag-n-drop fiels for upload
 * <gs-filebox id="other" multiple="true" directory="true" elid="test"></gs-filebox>
 * Use event listener to return false for file access filtering
 * @class
 * @extends {GSElement}
 */
export class GSFileBoxElement extends GSElement {

    static TITLE = 'Drop file/s here or click to select';
    static CSS = 'border-2 p-4 d-block text-center dash';

    static properties = {
        cssList: { attribute: 'css-list' },
        cssLabel: { attribute: 'css-label' },
        cssInput: { attribute: 'css-input' },

        multiple: { reflect: true, type: Boolean },
        directory: { reflect: true, type: Boolean },
        name: {},
        title: {},
        accept: {},
        filter: {},
    }

    #listEl = createRef();
    #fileEl = createRef();
    #dragging = null;

    constructor() {
        super();
        this.css = GSFileBoxElement.CSS;
        this.cssInput = 'd-none';
        this.multiple = true;
        this.title = GSFileBoxElement.TITLE;
        this.filter = '^image\/(gif|png|jpeg)$'
        this.directory = false;
    }

    renderUI() {
        const me = this;
        return html`
        <div part="border" class="${classMap(me.renderClass())}"
            dir="${ifDefined(me.direction)}"
            @click="${me.#onClick}"
            @dragenter="${me.#onDragenter}"
            @dragover="${me.#onDragenter}"
            @dragleave="${me.#onDragleave}"
            @drop="${me.#onDrop}"
            @paste="${me.#onPaste}"
            @change="${me.#onChange}">
            <label part="label" class="${me.cssLabel}" for="${me.name}">${me.translate(me.title)}</label>
            <input ${ref(me.#fileEl)}  part="input" 
                type="file" accept="${me.accept}" 
                class="${me.cssInput}" 
                name="${me.name}" 
                id="${me.name}" 
                ${me.multiple ? "multiple" : ""} 
                ${me.directory ? "directory webkitdirectory" : ""}>
            <pre ${ref(me.#listEl)} part="list" class="${me.cssList}"></pre>
        </div>
        `
    }

    get listEl() {
        return this.#listEl.value;
    }

    get fileEl() {
        return this.#fileEl.value;
    }

    #onClick(e) {
        this.fileEl.click();
    }

    #onDragenter(e) {
        const me = this;
        if (me.#dragging) clearTimeout(me.#dragging);
        me.#dragging = setTimeout(() => me.removeAttribute('hover'), 200);
        const transfer = e.dataTransfer;
        if (!transfer || !me.#hasFile(transfer)) return;
        transfer.dropEffect = 'copy';
        me.setAttribute('hover', '');
        e.preventDefault();
    }

    #onDragleave(e) {
        const me = this;
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'none';
        me.removeAttribute('hover');
        GSEvents.prevent(e);
    }

    #onDrop(e) {
        const me = this;
        me.removeAttribute('hover');
        const transfer = e.dataTransfer;
        if (!transfer || !me.#hasFile(transfer)) return;
        me.#attach(transfer);
        GSEvents.prevent(e);
    }

    #onPaste(e) {
        const me = this;
        if (!e.clipboardData) return;
        if (!e.clipboardData.items) return;
        const file = me.#pastedFile(e.clipboardData.items);
        if (!file) return;
        const files = [file];
        me.#attach(files);
        GSEvents.prevent(e);
    }

    #onChange(e) {
        const me = this;
        const input = me.fileEl;
        const files = input.files;
        if (!files || files.length === 0) return;
        me.#attach(files);
        // input.value = '';
    }

    #hasFile(transfer) {
        return Array.from(transfer.types).includes('Files');
    }

    #pastedFile(items) {
        const me = this;
        const rgx = me.filter ? new RegExp(me.filter) : null;
        for (const item of items) {
            if (item.kind === 'file') {
                if (!rgx) return item.getAsFile();
                if (rgx.test(item.type)) return item.getAsFile();
            }
        }
        return null;
    }

    #accept(attachments) {
        const me = this;
        const dataTransfer = new DataTransfer();
        attachments.forEach(a => dataTransfer.items.add(a.file))
        me.fileEl.files = dataTransfer.files;
        me.listEl.textContent = attachments.map(a => a.file.name).join('\n');
    }

    async #attach(transferred) {
        const me = this;
        const isDataTfr = transferred instanceof DataTransfer;
        const attachments = isDataTfr
            ? await GSAttachment.traverse(transferred, me.directory)
            : GSAttachment.from(transferred);

        const accepted = me.emit('accept', { attachments }, true, false, true);
        if (accepted && attachments.length) {
            me.#accept(attachments);
            me.emit('accepted', { attachments }, true);
        }
    }

    static styles = css`
        .dash {
            border-style: var(--gs-fieldbox-border, dashed) !important;
            border-color: var(--gs-fieldbox-border-color, lightgrey);
        }
        input[type=file] {
            color : var(--gs-fieldbox-color, transparent);
        } 
        input[type=file]::file-selector-button {}             
        input[type=file]::file-selector-button:hover {}`;

    static {
        this.define('gs-filebox');
    }

}

