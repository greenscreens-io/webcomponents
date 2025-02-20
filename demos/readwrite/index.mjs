import { GSAbortController } from '../../modules/base/GSAbortController.mjs';
import { GSDOM } from '../../modules/base/GSDOM.mjs';
import { GSReadWrite, GSReadWriteRegistry } from "../../modules/data/index.mjs";

// emit event delayed to 2 sec.
async function test1() {
    GSReadWriteRegistry.emit('register-test-1', null, 2000);
    const r = await GSReadWriteRegistry.wait('test-1');
    console.log('test1', r);
}

// will throw on timeout
async function test2() {
    const controller = new GSAbortController(2000);
    const r = await GSReadWriteRegistry.wait('test-2', controller.signal);
    console.log('test2', r);
}

// will throw on abort
async function test3() {
    const controller = new GSAbortController(2000);
    GSReadWriteRegistry.wait('test-3', controller.signal);
    controller.abort();
}

// will wait for test5
async function test4() {
    const r = await GSReadWriteRegistry.wait('test-5', 1000);
    console.log(r);
}

// test REST reader
async function test5() {
    const rw = new GSReadWrite('test-5');
    rw.mode = 'query';
    rw.src = '../form/data.json';
    const r = await rw.read();
    console.log('test5', r);

}

// test gs-data-handler
async function test6() {
    const rw = await GSReadWriteRegistry.wait('form-data');
    const r = await rw.wait('read');
    console.log('form-data', r);
    GSDOM.query('#result').innerHTML = JSON.stringify(r.detail.data);
}

test1();
test2();
test3();

test4();
test5();
test6();