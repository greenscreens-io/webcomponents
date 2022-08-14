/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSFileBox class
 * @module components/filebox/GSFileBox
 */

import GSElement from "../../base/GSElement.mjs";
import GSUtil from "../../base/GSUtil.mjs";
import GSAttachment from "./GSAttachment.mjs";

/**
 * File box allows drag-n-drop fiels for upload
 * <gs-filebox id="other" flat="true" multiple="true" directory="true" elid="test"></gs-filebox>
 * Use event listener to return false for file access filtering
 * @class
 * @extends {GSElement}
 */
export default class GSFileBox extends GSElement {

    static TITLE = 'Drop files here or click to select';
    static CSS = 'border-2 p-4 d-block text-center dash';

    #dragging = null;

    constructor() {
        super();
        const me = this;
        //me.style.setProperty('border-style', 'dashed', 'important');
        //GSUtil.toggleClass(me, true, GSFileBox.CSS);
    }

    async getTemplate(val = '') {
        const me = this;
        return `<style>
            .dash {
                border-style: var(--gs-fieldbox-border, dashed) !important;
                border-color: var(--gs-fieldbox-border-color, lightgrey);
            }
            input[type=file] {
                color : var(--gs-fieldbox-color, transparent);
            } 
            input[type=file]::file-selector-button {

            }             
            input[type=file]::file-selector-button:hover {
            }            
        </style>
        <div part="border" class="${me.css}">
        <label part="label" class="${me.cssLabel}" for="${me.name}">${me.title}</label>
        <input part="input" class="${me.cssInput}" type="file" id="${me.name}" name="${me.name}" ${me.multiple ? "multiple" : ""} ${me.directory ? "directory webkitdirectory" : ""} >
        <pre part="list" class="${me.cssList}"></pre>
        </div>
        `
    }

    onReady() {
        const me = this;
        const target = me.self; // me.isFlat ? me.findEl('div') : me;
        me.attachEvent(target, 'dragenter', me.#onDragenter.bind(me));
        me.attachEvent(target, 'dragover', me.#onDragenter.bind(me));
        me.attachEvent(target, 'dragleave', me.#onDragleave.bind(me));
        me.attachEvent(target, 'drop', me.#onDrop.bind(me));
        me.attachEvent(target, 'paste', me.#onPaste.bind(me));
        me.attachEvent(target, 'change', me.#onChange.bind(me));
        super.onReady();
    }

    get listEl() {
        return this.findEl('pre');
    }

    get fileEl() {
        return this.findEl('input');
    }

    /**
     * CSS for filebox frame
     */
    get css() {
        return GSUtil.getAttribute(this, 'css', GSFileBox.CSS);
    }

    set css(val = '') {
        return GSUtil.setAttribute(this, 'css');
    }

    /**
    * CSS for text list of selected files
    */
    get cssList() {
        return GSUtil.getAttribute(this, 'css-list', '');
    }

    set cssList(val = '') {
        return GSUtil.setAttribute(this, 'css-list');
    }

    /**
     * CSS for filebox info message
     */
    get cssLabel() {
        return GSUtil.getAttribute(this, 'css-label', '');
    }

    set cssLabel(val = '') {
        return GSUtil.setAttribute(this, 'css-label');
    }

    /**
     * CSS for filebox input element
     */
    get cssInput() {
        return GSUtil.getAttribute(this, 'css-input', 'd-none');
    }

    set cssInput(val = '') {
        return GSUtil.setAttribute(this, 'css-input');
    }

    /**
     * Set to true to enable multiple file or directory selection
     */
    get multiple() {
        return GSUtil.getAttributeAsBool(this, 'multiple', true);
    }

    set multiple(val = '') {
        return GSUtil.setAttributeAsBool(this, 'mulltiple', val == 'true');
    }

    /**
     * Filebox info message 
     */
    get title() {
        return GSUtil.getAttribute(this, 'title', GSFileBox.TITLE);
    }

    set title(val = '') {
        return GSUtil.setAttribute(this, 'title', GSFileBox.TITLE);
    }

    /**
     * Input field name and id
     */
    get name() {
        return GSUtil.getAttribute(this, 'name', '');
    }

    set name(val = '') {
        return GSUtil.setAttribute(this, 'name', '');
    }

    /**
     * Regex for paste accept 
     */
    get filter() {
        return GSUtil.getAttribute(this, 'filter', '^image\/(gif|png|jpeg)$');
    }

    set filter(val = '') {
        return GSUtil.setAttribute(this, 'filter');
    }

    get directory() {
        return GSUtil.getAttributeAsBool(this, 'directory', false);
    }

    set directory(value = '') {
        return GSUtil.setAttributeAsBool(this, 'directory', val == 'true');
    }

    #onDragenter(e) {
        const me = this;
        if (me.#dragging) clearTimeout(me.#dragging);
        me.#dragging = window.setTimeout(() => me.removeAttribute('hover'), 200);
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
        GSUtil.preventEvent(e);
    }

    #onDrop(e) {
        const me = this;
        me.removeAttribute('hover');
        const transfer = e.dataTransfer;
        if (!transfer || !me.#hasFile(transfer)) return;
        me.#attach(transfer);
        GSUtil.preventEvent(e);
    }

    #onPaste(e) {
        const me = this;
        if (!e.clipboardData) return;
        if (!e.clipboardData.items) return;
        const file = me.#pastedFile(e.clipboardData.items);
        if (!file) return;
        const files = [file];
        me.#attach(files);
        e.preventDefault();
    }

    #onChange(e) {
        const me = this;
        const input = me.fileEl;
        const files = input.files;
        if (!files || files.length === 0) return;
        me.#attach(files);
        input.value = '';
    }

    #hasFile(transfer) {
        return Array.from(transfer.types).indexOf('Files') >= 0;
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

        const accepted = GSUtil.sendEvent(me, 'accept', { attachments }, true, false, true);
        if (accepted && attachments.length) {
            me.#accept(attachments);
            GSUtil.sendEvent(me, 'accepted', { attachments }, true);
        }
    }

    static {
        customElements.define('gs-filebox', GSFileBox);
    }

}