const ws = 'ws://localhost/services/wsadmin';
const api = location.origin + '/services/api?q=/wsadmin';

const lsvc = location.origin + '/services/rpc';
const lapi = location.origin + '/services/api?q=/rpc';

globalThis.Tn5250 = {};

async function login() {

    const res = await fetch(location.origin + '/services/auth');
    if (res.ok) { 
        Tn5250.opt = await res.json();
    }

    let quark = null;
    await Engine.init({ api: lapi, service: lsvc });
    let o = await io.greenscreens.AdminController.login({ uuid: 'ADMIN', host: 'ADMIN', user: 'ADMIN', password: 'admin' });
    if (o.success) quark = await Engine.init({ api: api, service: ws });

    if (!quark) return;

    requestAnimationFrame(() => {
        const el = document.createElement('gs-admin-shell');
        document.body.insertAdjacentElement('beforeend', el);
    });

    let id = 0;
    o = await io.greenscreens.Server.refresh();

    if (o.data > 0) {
        id = setInterval(async () => {
            const o = await io.greenscreens.Server.refresh();
            console.log('=> Keep alive!');
        }, o.data * 1000);
    }

    quark.SocketChannel.on('error', e => {
        clearInterval(id);
        console.log('=> SOCKET ERROR');
        console.log(e);
    });

    quark.SocketChannel.on('offline', e => {
        clearInterval(id);
        console.log('=> SOCKET OFFLINE');
        console.log(e);
    });

}

login();