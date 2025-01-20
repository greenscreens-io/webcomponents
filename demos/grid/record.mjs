
import { GSEvents } from '../../modules/base/GSEvents.mjs';
import { GSDialogElement } from "../../modules/components/Dialog.mjs";
import { GSReadWriteRegistry } from "../../modules/data/ReadWriteRegistry.mjs";

export class RecordDialog extends GSDialogElement {

    static {
        this.define('gs-record-edit');
    }

    // here we store selected record, 
    // upon change, we use Object.asign to 
    // apply teh data from the form and call table update
    // to reflect changes inside the table
    #data;

    connectedCallback() {
        super.connectedCallback();
        const me = this;
        me.opened = true;
        me.closable = true;
        me.cancelable = true;
        me.escapable = true;
        me.cssBody = 'p-0';
        me.cssHeader = 'p-3 dialog-title';              
        me.title = "Edit record";
        me.template = "//record.html";
    }

    firstUpdated() {
        super.firstUpdated();
        const me = this;
        me.on('data', me.#onFormData.bind(me));
        me.on('error', me.#onFormError.bind(me));
        me.on('notify', me.#onNotify.bind(me));
        GSEvents.monitorAction(this);
    }

    // override sper calss function after dialog tempalte (form) is injecetd
    // we use this to load data into a form
    async templateInjected() {
        return this.onLoad();
    }

    // save form data on OK click
    // and update table to reflect chenges in UI
    async onData(data) {
        Object.assign(this.#data, data);
        this.table?.requestUpdate();
        return true;
    }

    /**
     * Load data into a form from shared storage engien
     * by retrieveing first grid selected record.
     * @returns 
     */
    async onLoad() {
        const storage = GSReadWriteRegistry.find('employees');
        const form = this.form;
        if (form && storage) {            
            form.data = this.#data = storage.selected.pop();
        }
    }    

    get form() {
        return this.query('gs-form', true);
    }
 
    get table() {
        return GSDOM.query('gs-table');
    }

    // auto remove on close
    #onNotify(e) {
        if (!this.opened) this.remove();
    }

    #onFormError(e) {
        alert('Some fields are invalid!');
    }

    #onFormData(e) {
        // prevent close on confirm click
        GSEvents.prevent(e);
        this.#handleFormData(e);
    }

    async #handleFormData(e) {
        const me = this;
        let sts = false;
        try {
            me.disabled = true;
            sts = await me.onData(e.detail);
        } catch (e) {
            me.onError(e);
        } finally {
            me.disabled = false;
            if (sts) {
                me.close();
            }
        }
    }

    onError(e) {
        console.log(e);
        const msg = e.data?.error || e.msg || e.message || e.toString();
        alert(msg);
    }    
}