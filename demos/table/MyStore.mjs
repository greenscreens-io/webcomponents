import GSLoader from "/webcomponents/modules/base/GSLoader.mjs";
import GSReadWrite from "/webcomponents/modules/base/GSReadWrite.mjs";

class MyStore extends GSReadWrite {

    constructor(name) {
        super(name);
    }

    async onRead(owner) {
        const data = await GSLoader.load('./data2.json', 'GET', null, true);
        const msg = `store read for id:${owner?.id}`;
        console.log(msg);
        return data;
    }

    async onWrite(owner, data) {
        const msg = `store write for id:${owner?.id}`;
        console.log(msg);
    }

}

const store = new MyStore('mystore');
export default store;