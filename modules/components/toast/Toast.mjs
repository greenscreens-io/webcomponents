
import { classMap, html, ifDefined } from '../../lib.mjs';
import { GSElement } from '../../GSElement.mjs';
import { GSDOM } from '../../base/GSDOM.mjs';
import { GSNotificationElement } from './Notification.mjs';

export class GSToastElement extends GSElement {

    static properties = {
        closable: { reflect: true, type: Boolean },
        opened: { reflect: true, type: Boolean },
        message: { reflect: true },
        title: { reflect: true },
        delay: { reflect: true, type: Number },
        timeout: { reflect: true, type: Number }
    }

    #pending = false;
    #delayTimer;
    #timeoutTimer;

    constructor() {
        super();
        const me = this;
        me.timeout = 2;
        me.delay = 2;
    }

    shouldUpdate(changedProperties) {
        const me = this;
        if (changedProperties.has('opened')) {
            if (!me.opened) {
                me.#clearDelay();
            } else if (me.delay > 0) {
                me.#clearDelay();
                me.#pending = true;
                me.#delayTimer = setTimeout(() => {
                    me.#delayTimer = undefined;
                    me.#pending = false;
                    me.requestUpdate();
                }, me.delay * 1000);
            }
        }
        return me.#validParent && !me.#pending;
    }

    #clearDelay() {
        if (this.#delayTimer !== undefined) {
            clearTimeout(this.#delayTimer);
            this.#delayTimer = undefined;
        }
        this.#pending = false;
    }

    #clearTimeout() {
        if (this.#timeoutTimer !== undefined) {
            clearTimeout(this.#timeoutTimer);
            this.#timeoutTimer = undefined;
        }
    }

    disconnectedCallback() {
        this.#clearDelay();
        this.#clearTimeout();
        super.disconnectedCallback();
    }

    updated(changedProperties) {
        const me = this;
        if (changedProperties.has('opened') || changedProperties.has('timeout')) {
            me.#clearTimeout();
            if (me.opened && me.timeout > 0) {
                me.#startTimeout();
            }
        } else if (me.opened && me.timeout > 0 && me.#timeoutTimer === undefined) {
            // A delayed opening can render in an update with no changed properties.
            me.#startTimeout();
        }
        if (changedProperties.has('opened') && !me.opened) {
            me.remove();
        }
    }

    #startTimeout() {
        this.#timeoutTimer = setTimeout(() => {
            this.#timeoutTimer = undefined;
            this.opened = false;
        }, this.timeout * 1000);
    }

    renderUI() {
        const me = this;
        return me.title ? me.#renderWithHeader() : me.#renderSimple();
    }

    #renderWithHeader() {
        const me = this;
        return html`
        <div dir="${ifDefined(me.direction)}"
            class="mt-1 mb-1 toast fade ${classMap(me.renderClass())}">
            <div class="toast-header">
                ${me.translate(me.title)}
                <slot name="header"></slot>
                ${me.closable ? me.#button : ''}
            </div>
            <div class="toast-body">
                ${me.translate(me.message)}
                <slot name="body"></slot>
            </div>
        </div>
        `;
    }

    #renderSimple() {
        const me = this;
        return html`
        <div class="mt-1 mb-1 toast fade ${classMap(me.renderClass())}">
          <div class="d-flex">
              <div class="toast-body">
              ${me.translate(me.message)}
              <slot name="body"></slot>
              </div>
              ${me.closable ? me.#button : ''}
          </div>
        </div>
        `;
    }

    renderClass() {
        const me = this;
        const css = {
            ...super.renderClass(),
            'show': me.opened,
        }
        return css;
    }

    dismiss() {
        this.opened = false;
    }

    get #button() {
        const me = this;
        return html`<button type="button" class="btn-close me-2 m-auto" @click="${me.dismiss}"></button>`;
    }

    get #validParent() {
        const isToast = GSDOM.hasClass(this.parentElement, 'toast-container');
        const isNotify = this.parentElement instanceof GSNotificationElement;
        return isToast || isNotify;
    }

    static {
        this.define('gs-toast');
    }
}