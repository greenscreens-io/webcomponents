/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

import GSUtil from '../../base/GSUtil.mjs';
import GSEvents from '../../base/GSEvents.mjs';

/**
 * A module loading GSAttachment class
 * @module components/filebox/GSAttachment
 */

/**
 * Handles DataFileTransfer object
 * @class
 */
export default class GSAttachment {

    #directory = null;
    #file = null;

    constructor(file, directory) {
        this.#file = file;
        this.#directory = directory;
    }
    
    get file() {
        return this.#file;
    }
    
    get directory() {
        return this.#directory;
    }

    get fullPath() {
        const me = this;
        return me.directory ? `${me.directory}/${me.file.name}` : me.file.name;
    }

    get isImage() {
        return GSAttachment.isImageType(this.file.type);
    }

    get isVideo() {
        return GSAttachment.isVideoType(this.file.type);
    }

    get isText() {
        return GSAttachment.isTextType(this.file.type);
    }

    static isImageType(type) {
        return ['image/gif', 'image/png', 'image/jpg', 'image/jpeg', 'image/svg+xml'].includes(type);
    }

    static isVideoType(type) {
        return ['video/mp4', 'video/quicktime'].includes(type);
    }

    static isTextType(type) {
        return ['application/json', 'text/plain', 'text/html', 'image/svg+xml'].includes(type);
    }

    static traverse(transfer, directory) {
        return GSAttachment.#transferredFiles(transfer, directory);
    }

    static from(files) {
        return Array.from(files).filter(f => f instanceof File).map(f => new GSAttachment(f));
    }

    static #transferredFiles(transfer, directory) {
        if (directory && GSAttachment.#isDirectory(transfer)) {
            return GSAttachment.#traverse('', GSAttachment.#roots(transfer));
        }
        return Promise.resolve(GSAttachment.#visible(Array.from(transfer.files || [])).map(f => new GSAttachment(f)));
    }

    static #hidden(file) {
        return file.name.startsWith('.');
    }

    static #visible(files) {
        return Array.from(files).filter(file => !GSAttachment.#hidden(file));
    }

    static #getFile(entry) {
        return new Promise((resolve, reject) => {
            entry.file(resolve, reject);
        });
    }

    static #getEntries(entry) {
        return new Promise((resolve, reject) => {
            const result = [];
            const reader = entry.createReader();
            const read = () => {
                reader.readEntries(entries => {
                    if (entries.length > 0) {
                        result.push(...entries);
                        read();
                    } else {
                        resolve(result);
                    }
                }, reject);
            };
            read();
        });
    }

    static async #traverse(path, entries) {
        const results = [];
        for (const entry of GSAttachment.#visible(entries)) {
            if (entry.isDirectory) {
                const entries = await GSAttachment.#getEntries(entry);
                const list = await GSAttachment.#traverse(entry.fullPath, entries);
                results.push(...(list));
            } else {
                const file = await GSAttachment.#getFile(entry);
                results.push(new GSAttachment(file, path));
            }
        }
        return results;
    }

    static #isDirectory(transfer) {
        return Array.from(transfer.items).some((item) => {
            const entry = item.webkitGetAsEntry?.();
            return entry?.isDirectory;
        });
    }

    static #roots(transfer) {
        return Array.from(transfer.items)
            .map((item) => item.webkitGetAsEntry?.())
            .filter(entry => entry != null);
    }

    /**
     * Upload a file using file input dialog
     * @param {String} mime - optional mime type filter
     * @param {Boolean} forceBinary - if true, read file as binary (Uint8Array); otherwise autodetect text/binary
     * @returns {String|Uint8Array|null} file content as string or binary; null if no file selected
     */
    static async upload(mime = '*/*', forceBinary = false) {
        const input = document.createElement('input');
        input.type='file';
        input.accept= mime;
        input.style.display='none';
        document.body.appendChild(input);
        input.click();

        await GSEvents.wait(input, 'change', 0, false);

        try {
            if (input.files.length === 0) return null;

            const file = input.files.item(0);
            const isText = forceBinary ? false : GSAttachment.isTextType(file.type);

            const reader = new FileReader();
            isText ? reader.readAsText(file) : reader.readAsArrayBuffer(file)
            await GSEvents.wait(reader, 'loadend', 0, false);

            if (reader.readyState === FileReader.DONE) {
                return isText ? reader.result : new Uint8Array(reader.result);
            }
        } finally {
            document.body.removeChild(input);
        }
        return null;
    }

    /**
     * Download a file using blob link
     * @param {string} filename 
     * @param {string|Uint8Array} content Supporting string/json or binary content
     * @param {string} mime - optional mime type; if not defined, selfdetect from content
     */
    static download(filename, content, mime) {
        if (!content) throw new Error('No content to download');
        mime = mime || GSAttachment.toMime(content) || 'application/octet-stream';
        filename = filename || `file-${Date.now()}.${GSAttachment.mimeToExt(mime)}`;
        const opt = GSUtil.isString(content) ? { type: mime, encoding: "UTF-8" } : { type: mime };
        const blob = new Blob([content], opt);
        const ourl = globalThis.URL.createObjectURL(blob);
        const link = document.createElement('a');
        try {
            link.href = ourl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
        } finally {
            document.body.removeChild(link);
            setTimeout(() => globalThis.revokeObjectURL(ourl), 250);
        }   
    }

    /**
     * Get file extension from mime type
     * @param {string} mime 
     * @returns {string} file extension without dot
     */
    static mimeToExt(mime) {
        return {
            'application/octet-stream' : 'bin',
            'application/json' : 'json',
            'text/plain' : 'txt',
            'text/html' : 'html',
            'image/png' : 'png',
            'image/jpeg' : 'jpg',
            'image/gif' : 'gif',
            'image/webp' : 'webp',
            'image/svg+xml' : 'svg',
            'application/pdf' : 'pdf',
            'video/mp4' : 'mp4'
        }[mime] || 'bin';
    }
    /**
     * Detect mime type from content
     * @param {string|Uint8Array} content Supporting string/json or binary content
     */
    static toMime(content) {
        if (GSUtil.isString(content)) {
            content = content.trim();
            if (GSUtil.isJsonString(content)) return 'application/json';
            if (content.startsWith('<svg') || content.startsWith('<?xml') || content.startsWith('<!DOCTYPE svg')) return 'image/svg+xml';
            if ( content.startsWith('<!DOCTYPE html') || content.startsWith('<html')) return 'text/html';
            return 'text/plain';
        } else if (content instanceof Uint8Array) {
            // very basic binary file type detection
            if (content.length > 4) {
                // PNG
                if (content[0] === 0x89 && content[1] === 0x50 && content[2] === 0x4E && content[3] === 0x47) return 'image/png';
                // JPG
                if (content[0] === 0xFF && content[1] === 0xD8 && content[2] === 0xFF) return 'image/jpeg';
                // GIF
                if (content[0] === 0x47 && content[1] === 0x49 && content[2] === 0x46) return 'image/gif';
                // webp
                if (content[0] === 0x52 && content[1] === 0x49 && content[2] === 0x46 && content[3] === 0x46) return 'image/webp';
                // PDF
                if (content[0] === 0x25 && content[1] === 0x50 && content[2] === 0x44 && content[3] === 0x46) return 'application/pdf';
                // MP4
                if (content[0] === 0x00 && content[1] === 0x00 && content[2] === 0x00 && content[3] === 0x18) return 'video/mp4';
            }
        }
        return null;
    }

    static {
        globalThis.GSAttachment = GSAttachment
    }
}
