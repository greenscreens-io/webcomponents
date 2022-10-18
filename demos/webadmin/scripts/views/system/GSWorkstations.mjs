/*
* Copyright (C) 2015, 2022 Green Screens Ltd.
*/

/**
 * A module loading GSWorkstations class
 * @module views/GSWorkstations
 */
import BaseViewUI from '../BaseViewUI.mjs';
import Utils from '../../Utils.mjs';

export default class GSWorkstations extends BaseViewUI {

    static {
        customElements.define('gs-admin-view-workstations', GSWorkstations);
        Object.seal(GSWorkstations);
    }

    async getTemplate() {
        return super.getTemplate('//views/workstations.html');
    }

    async onLoad() {
        const me = this;
        const filter = me.filter;
        const o = DEMO ? DEMO : await io.greenscreens.Manage.listSessions(me.store.page-1, me.store.limit, filter);
        if (!o.success) return this.inform(o.success, o.msg);
        return o.data;
    }

    async message(e) {
        
        const msg = prompt('Enter message to send');
        if (!(msg?.trim().length > 0)) return;

        const me = this;
        try {
            const data = e.detail.data[0];        
            data.message = msg;
            const o = DEMO ? DEMO : await io.greenscreens.Manage.sendMessage(data.sessionID, data.deviceID, data.message);  
            me.inform(true, 'Message sent!');
        } catch(e) {
            console.log(e);
            me.inform(false, e.msg ||e.message);
        }
    }

    async logging(e) {
        const me = this;
        try {
            const data = e.detail.data[0];
            const o = DEMO ? DEMO : await io.greenscreens.Manage.loging(data);
            if (o.msg === 'false') {
                const url = location.origin + '/services/logs?id=' + o.code;
                Utils.download('server.log', url);
            }
        } catch(e) {
            console.log(e);
            me.inform(false, e.msg ||e.message);
        }
    }

    async kill(e) {
        const me = this;
        try {
            const data = e.detail.data[0];
            const o = DEMO ? DEMO : await io.greenscreens.Manage.killDevice(data);
            me.inform(true, 'Kill signal sent!');
        } catch(e) {
            console.log(e);
            me.inform(false, e.msg ||e.message);
        }        
    }

    async messageFilter(e) {
        
        const msg = prompt('Enter message to send');
        if (!(msg?.trim().length > 0)) return;
        
        const me = this;
        try {
            const data = Object.assign(me.filter);
            data.message = msg;
            const o = DEMO ? DEMO : await io.greenscreens.Manage.sendMessages(me.filter);  
            me.inform(true, 'Message sent!');
        } catch(e) {
            console.log(e);
            me.inform(false, e.msg ||e.message);
        }
    }

    async killFilter(e) {
        const me = this;
        try {
            const o = DEMO ? DEMO : await io.greenscreens.Manage.killSessions(me.filter);
            me.inform(true, 'Kill signal sent!');
        } catch(e) {
            console.log(e);
            me.inform(false, e.msg ||e.message);
        }        
    }

    
    async export(e) {
        const me = this;
        try {
            const o = DEMO ? DEMO : await io.greenscreens.Manage.export(0, 0, me.filter);  
            const tmp = JSON.stringify(o.data);
            Utils.download('workstations.json', tmp);
        } catch(e) {
            console.log(e);
            me.inform(false, e.msg ||e.message);
        }
    }
}