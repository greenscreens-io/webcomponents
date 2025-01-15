
import { classMap, html, ifDefined } from '../../lib.mjs';
import { GSElement } from '../../GSElement.mjs';
import { GSDOM } from '../../base/GSDOM.mjs';
import { GSUtil } from '../../base/GSUtil.mjs';
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

    constructor() {
        super();
        const me = this;
        me.timeout = 2;
        me.delay = 2;
        me.auto = true; 
    }

    shouldUpdate(changedProperties) {
        const me = this;
        const visibilityChange = me.#isVisibilityChanged(changedProperties);
        if (me.delay > 0 && me.opened && visibilityChange) {
            me.#pending = true;
            me.#pendingUpdate();
        }
        return me.#validParent && (!me.#pending);
    }

    #isVisibilityChanged(changedProperties) {
        return changedProperties.has('opened');
    }

    async #pendingUpdate() {
        const me = this;
        await GSUtil.timeout(me.delay * 1000);
        me.#pending = false;
        me.requestUpdate();
    }

    async updated(changedProperties) {
        const me = this;
        const visibilityChange = me.#isVisibilityChanged(changedProperties);
        if (me.timeout > 0 && me.opened) {
            await GSUtil.timeout(me.timeout * 1000);
            me.opened = false;
        } else if (visibilityChange && !me.opened) { 
            me.remove();
        };
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