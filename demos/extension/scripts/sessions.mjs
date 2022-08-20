import GSComponents from "../../../modules/base/GSComponents.mjs";
import GSUtil from "../../../modules/base/GSUtil.mjs";

class SessionsUI {

    static #table = null;
    static #modal = null;

    static {
        GSComponents.notifyFor('table-sessions', SessionsUI.#init);
        GSComponents.notifyFor('modal-session', (el) => SessionsUI.#modal = el );
    }

    static #init(el, e) {
        SessionsUI.#table = el;
        el.listen('action', SessionsUI.#onAction);
    }

    static #onAction(e) {
        const action = e.detail.action;
        const fn = SessionsUI[action];
        if (GSUtil.isFunction(fn)) fn(e);
    }

    static clone(e) {
        
    }

    static start(e) {
        
    }

    static remove(e) {
        
    }

    static details(e) {
        SessionsUI.#modal.open();
    }
}
self.SessionsUI = SessionsUI;