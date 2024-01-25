import { GSLoader } from "/bootstrap-lit/modules/base/GSLoader.mjs";
import { GSAbstractReadWrite } from "/bootstrap-lit/modules/data/AbstractReadWrite.mjs";

class MyStore extends GSAbstractReadWrite {

    constructor(name) {
        super(name);
    }

    async onRead(owner) {
        const data = await GSLoader.load('./data.json', 'GET', null, true);
        const msg = `store read for id:${owner?.id}`;
        console.log(msg, `data : ${JSON.stringify(data)}`);
        this.#notify(msg, data);
        return data;
    }

    async onWrite(owner, data) {
        const msg = `store write for id:${owner?.id}`;
        console.log(msg, `data : ${JSON.stringify(data)}`);
        this.#notify(msg, data);
    }

    async #notify(msg, body) {
        await Notification.requestPermission();
        const o = new Notification(msg, { body: JSON.stringify(body) });
        setTimeout(o.close.bind(o), 2000);
    }
}

const store = new MyStore('mystore');
export default store;