import GSAbortController from "../../modules/base/GSAbortController.mjs";
import GSReadWriteRegistry from "../../modules/base/GSReadWriteRegistry.mjs";
import GSReadWriteRest from "../../modules/base/GSReadWriteRest.mjs";

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

// will throw on timeout
async function test4() {
    const r = await GSReadWriteRegistry.wait('test-4', 1000);
    console.log(r);
}

// test REST reader
async function test5() {
    const rest = new GSReadWriteRest('myrest');
    rest.src = '../form/data.json';
    const r = await rest.read();
    console.log('test5', r);

}

test1();
test2();
test3();
test4();
test5();