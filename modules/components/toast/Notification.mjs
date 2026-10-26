
import { classMap, html, ifDefined } from '../../lib.mjs';
import { GSElement } from '../../GSElement.mjs';
import { GSDOM } from '../../base/GSDOM.mjs';
import { GSUtil } from '../../base/GSUtil.mjs';

const NOTIFICATION_OWNER = Symbol('notificationOwner');

export class GSNotificationElement extends GSElement {

    static TOP_START = "position-fixed top-0 start-0";
    static TOP_CENTER = "position-fixed top-0 start-50 translate-middle-x";
    static TOP_END = "position-fixed top-0 end-0";

    static MIDDLE_START = "position-fixed top-50 start-0 translate-middle-y";
    static MIDDLE_CENTER = "position-fixed top-50 start-50 translate-middle";
    static MIDDLE_END = "position-fixed top-50 end-0 translate-middle-y";
    
    static BOTTOM_START = "position-fixed bottom-0 start-0";
    static BOTTOM_CENTER = "position-fixed bottom-0 start-50 translate-middle-x";
    static BOTTOM_END = "position-fixed bottom-0 end-0";

    static DEFAULT = GSNotificationElement.BOTTOM_END;

    static properties = {
        position: { reflect: true },
        native: { reflect: true, type: Boolean }
    };

    #list = new Set();

    constructor() {
        super();
        this.css = 'p-3';
        this.position = GSNotificationElement.DEFAULT;
    }

    renderUI() {
        const me = this;
        return html`<div  dir="${ifDefined(me.direction)}"
            class="toast-container z-10k ${classMap(me.renderClass())}">
            <slot></slot>
        </div>`;
    }

    renderClass() {
        const me = this;
        return me.mapCSS(me.#positionCSS, super.renderClass());
    }    

    get #positionCSS() {
        const clazz = GSNotificationElement;
        const val = typeof this.position === 'string' ? this.position : clazz.DEFAULT;
        return val.indexOf('_') > 0 && clazz[val] ? clazz[val] : val;
    }

    info(title, message, closable, timeout, delay, options) {
        return this.display(title, message, 'text-bg-info', closable, timeout, delay, options);
    }

    success(title, message, closable, timeout, delay, options) {
        return this.display(title, message, 'text-bg-success', closable, timeout, delay, options);
    }

    warn(title, message, closable, timeout, delay, options) {
        return this.display(title, message, 'text-bg-warning', closable, timeout, delay, options);
    }

    danger(title, message, closable, timeout, delay, options) {
        return this.display(title, message, 'text-bg-danger', closable, timeout, delay, options);
    }

    primary(title, message, closable, timeout, delay, options) {
        return this.display(title, message, 'text-bg-primary', closable, timeout, delay, options);
    }

    secondary(title, message, closable, timeout, delay, options) {
        return this.display(title, message, 'text-bg-secondary', closable, timeout, delay, options);
    }

    dark(title, message, closable, timeout, delay, options) {
        return this.display(title, message, 'text-bg-dark', closable, timeout, delay, options);
    }

    light(title, message, closable, timeout, delay, options) {
        return this.display(title, message, 'text-bg-light', closable, timeout, delay, options);
    }

    /**
     * Main function to show notification. 
     * It has support for Bootstrap based and web based notifications.
     * 
     * @async
     * @param {String} title Notification title
     * @param {String} message Notification message
     * @param {String} css CSS styling (web only)
     * @param {Boolean} closable Can user close it (web only)
     * @param {Number} timeout Timeout after which to close notification  (default 2 sec)
     * @param {Number} delay Timeout after which to show notification (default 1 sec)
     * @param {Object} options Options for native Notification
     * @returns {Promise<Notification|GSToast>}
     */
    async display(title = '', message = '', css = '', closable = false, timeout = 2, delay = 0.5, options) {
        if (!message) return;
        const me = this;
        if (me.native) {
            let sts = await GSNotificationElement.requestPermission();
            if (sts) sts = me.#showNative(title, message, timeout, delay, options);
            if (sts) return sts;
        }
        return me.#showWeb(title, message, css, closable, timeout, delay);
    }

    #showWeb(title, message, css, closable, timeout, delay) {
        const me = this;
        const el = document.createElement('gs-toast');
        el.css = css;
        el.opened = true;
        el.closable = closable;
        el.timeout = timeout;
        el.delay = delay;
        el.message = message;
        el.title = title;
        el.language = me.language;
        el[NOTIFICATION_OWNER] = me;
        const toast = me.#dialogToast;
        if (toast !== me) {
            toast.classList.add(
                'toast-container',
                ...String(me.css || '').split(/\s+/).filter(Boolean),
                ...me.#positionCSS.split(/\s+/).filter(Boolean)
            );
        }
        toast.appendChild(el);
        return el;
    }

    async #showNative(title, message, timeout, delay, options = {}) {
        const me = this;
        await me.#delay(delay);
        const notification = new globalThis.Notification(title, {
            ...(options || {}),
            body: options?.body || message
        });
        me.#list.add(notification);
        let timer;
        notification.addEventListener('close', () => {
            if (timer !== undefined) clearTimeout(timer);
            me.#list.delete(notification);
        }, { once: true });
        if (timeout > 0) timer = setTimeout(() => notification.close(), timeout * 1000);
        return notification;
    }

    get #dialogToast() {
        const dlg = customElements.get('gs-dialog')?.top;
        return dlg && dlg.isConnected ? (GSDOM.query(dlg, '.toast-container') || this) : this;
    }

    async #delay(delay = 0) {
        if (GSUtil.isNumber(delay) && delay > 0) await GSUtil.timeout(delay * 1000);
    }

    /**
     * Clear all triggered notifications
     */
    clear() {
        const me = this;
        const toasts = new Set(me.querySelectorAll('gs-toast'));
        GSDOM.queryAll(document, 'gs-toast').forEach(el => {
            if (el[NOTIFICATION_OWNER] === me) toasts.add(el);
        });
        toasts.forEach(el => el.remove());
        me.#list.forEach(nn => nn.close());
        me.#list.clear();
    }

    /**
     * Check if native notification is supported
     * @returns {Boolean} 
     */
    static get isNativeSupported() {
        return typeof globalThis.Notification !== 'undefined';
    }

    /**
     * Check if native notification is allowed
     * @returns {Boolean} 
     */
    static get isGranted() {
        return GSNotificationElement.isNativeSupported && globalThis.Notification.permission === 'granted';
    }

    /**
     * Request useage for browser native notification
     * 
     * @async
     * @returns {Promise<boolean>} Return granted status
     */
    static async requestPermission() {
        const clazz = GSNotificationElement;
        if (!clazz.isNativeSupported) return false;
        if (!clazz.isGranted) await globalThis.Notification.requestPermission();
        return clazz.isGranted;
    }

    static {
        this.define('gs-notification');
    }
}