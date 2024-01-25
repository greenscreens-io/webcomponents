/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

/**
 * A module loading GSAttachment class
 * @module components/filebox/GSAttachment
 */

/**
 * Handles DataFileTransfer object
 * @class
 */
export class GSAttachment {

    constructor(file, directory) {
        this.file = file;
        this.directory = directory;
    }

    static traverse(transfer, directory) {
        return GSAttachment.#transferredFiles(transfer, directory);
    }

    static from(files) {
        return Array.from(files).filter(f => f instanceof File).map(f => new GSAttachment(f));
    }

    get fullPath() {
        const me = this;
        return me.directory ? `${me.directory}/${me.file.name}` : me.file.name;
    }

    isImage() {
        return ['image/gif', 'image/png', 'image/jpg', 'image/jpeg', 'image/svg+xml'].includes(this.file.type);
    }

    isVideo() {
        return ['video/mp4', 'video/quicktime'].includes(this.file.type);
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
        return new Promise(function (resolve, reject) {
            entry.file(resolve, reject);
        });
    }

    static #getEntries(entry) {
        return new Promise(function (resolve, reject) {
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
            const entry = item.webkitGetAsEntry && item.webkitGetAsEntry();
            return entry && entry.isDirectory;
        });
    }

    static #roots(transfer) {
        return Array.from(transfer.items)
            .map((item) => item.webkitGetAsEntry())
            .filter(entry => entry != null);
    }

}
