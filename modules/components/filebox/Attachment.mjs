/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { GSUtil } from '../../base/GSUtil.mjs';
import { GSEvents } from '../../base/GSEvents.mjs';

/**
 * A module loading GSAttachment class
 * @module components/filebox/GSAttachment
 */

/**
 * Handles DataFileTransfer object
 * @class
 */
export class GSAttachment {

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

    /**
     * 
     * @param {DataTransfer} transfer 
     * @param {boolean} directory 
     * @returns 
     */
    static traverse(transfer, directory) {
        return GSAttachment.#transferredFiles(transfer, directory);
    }

    /**
     * Create GSAttachment array from File array
     * @param {File[]} files 
     * @returns {GSAttachment[]}
     */
    static from(files) {
        return Array.from(files).filter(f => f instanceof File).map(f => new GSAttachment(f));
    }

    /**
     * 
     * @param {DataTransfer} transfer 
     * @param {boolean} directory 
     * @returns 
     */    
    static #transferredFiles(transfer, directory) {
        if (directory && GSAttachment.#isDirectory(transfer)) {
            return GSAttachment.#traverse('', GSAttachment.#roots(transfer));
        }
        return Promise.resolve(GSAttachment.#visible(Array.from(transfer.files || [])).map(f => new GSAttachment(f)));
    }

    /**
     * Check if file is hidden (Unix-like hidden file)
     * @param {File} file 
     * @returns {boolean}
     */
    static #hidden(file) {
        return file.name.startsWith('.');
    }

    /**
     * Filter out hidden files
     * @param {File} files 
     * @returns {File[]}
     */
    static #visible(files) {
        return Array.from(files).filter(file => !GSAttachment.#hidden(file));
    }

    /**
     * Get File from FileSystemEntry
     * @param {FileSystemEntry} entry 
     * @returns {Promise<File>}
     */
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

    /**
     * Recursively traverse directory entries
     * @param {string} path 
     * @param {FileSystemEntry[]} entries 
     * @returns {Promise<GSAttachment[]>}
     */
    static async #traverse(path, entries) {
        const results = await Promise.all(GSAttachment.#visible(entries).map(async entry => {
            if (entry.isDirectory) {
                const children = await GSAttachment.#getEntries(entry);
                return GSAttachment.#traverse(entry.fullPath, children);
            }
            const file = await GSAttachment.#getFile(entry);
            return [new GSAttachment(file, path)];
        }));
        return results.flat();
    }

    /**
     * Check if DataTransfer contains directory
     * @param {DataTransfer} transfer 
     * @returns {boolean}
     */
    static #isDirectory(transfer) {
        return Array.from(transfer.items).some((item) => {
            const entry = item.webkitGetAsEntry?.();
            return entry?.isDirectory;
        });
    }

    /**
     * Destructure DataTransfer items into FileSystemEntries
     * @param {DataTransfer} transfer 
     * @returns {FileSystemEntry[]}
     */
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

        try {
            const file = await new Promise(resolve => {
                input.addEventListener('change', () => resolve(input.files?.item(0) || null), { once: true });
                input.addEventListener('cancel', () => resolve(null), { once: true });
                input.click();
            });
            if (!file) return null;

            const isText = forceBinary ? false : GSAttachment.isTextType(file.type);

            const reader = new FileReader();
            const loaded = GSEvents.wait(reader, 'loadend', 0, false);
            isText ? reader.readAsText(file) : reader.readAsArrayBuffer(file)
            await loaded;

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
            globalThis.URL.revokeObjectURL(ourl);
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

}
