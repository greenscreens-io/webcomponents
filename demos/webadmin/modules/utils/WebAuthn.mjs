/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

/**
 * Module for WebAuth protocol
 */
export class WebAuthn {

    static #IP_REGEXP = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

    static #api = `${location.origin}/services/api?q=/wsauth`;
    static #svc = `${location.origin}/services/rpc`;
    static #headers = { 'x-type': 'admin' };

    static {
        Object.freeze(WebAuthn);
    }

    static #fromBinary(o) {
        return Uint8Array.from(atob(o), (c) => {
            return c.charCodeAt(0)
        });
    }

    static #toBinary(data) {
        return btoa(String.fromCharCode.apply(null, new Uint8Array(data)))
    }

    static isAllowed() {
        return (!WebAuthn.#IP_REGEXP.test(location.hostname) && location.protocol === 'https:') || location.hostname === 'localhost';
    }

    static get #cfg() {
        return { api: WebAuthn.#api, service: WebAuthn.#svc, headers: WebAuthn.#headers };
    }

    static async #engine() {
        if (!io?.greenscreens?.WebAuthnController) return Engine.init(WebAuthn.#cfg);
    }

    static async #callRemote(action, finish = false, data) {
        await WebAuthn.#engine();
        return await io.greenscreens.WebAuthnController[action](data, finish);
    }

    static async #doRegister(data) {

        const resp = await WebAuthn.#callRemote('register', false, data);
        const o = resp.data;
        const challenge = WebAuthn.#fromBinary(o.challenge);
        const uid = WebAuthn.#fromBinary(o.uid);

        const obj = {
            publicKey: {
                rp: {
                    name: o.rp,
                    id: location.hostname
                },

                challenge: challenge,

                user: {
                    id: uid,
                    name: o.name,
                    displayName: o.displayName
                },

                // https://www.iana.org/assignments/cose/cose.xhtml#algorithms
                /*
                    {type: "public-key", alg: -7}
                    {type: "public-key", alg: -35}
                    {type: "public-key", alg: -36}
                    {type: "public-key", alg: -257}
                    {type: "public-key", alg: -258}
                    {type: "public-key", alg: -259}
                    {type: "public-key", alg: -37}
                    {type: "public-key", alg: -38}
                    {type: "public-key", alg: -39}
                    {type: "public-key", alg: -8}
                     */
                pubKeyCredParams: [{
                    type: "public-key",
                    alg: -7
                },
                {
                    type: "public-key",
                    alg: -257
                },
                {
                    type: "public-key",
                    alg: -41
                }
                ],

                attestation: "direct",
                timeout: 60000,
                excludeCredentials: [],
                extensions: {},
                authenticatorSelection: {
                    requireResidentKey: false,
                    userVerification: "preferred"
                    //authenticatorAttachment : "cross-platform"
                }
            }

        };

        const cred = await navigator.credentials.create(obj);
        if (cred == null) throw new Error('Credential not found!');

        const auth = {
            uid: o.uid,
            id: cred.id,
            rawId: WebAuthn.#toBinary(cred.rawId),
            attestationObject: WebAuthn.#toBinary(cred.response.attestationObject),
            clientDataJSON: WebAuthn.#toBinary(cred.response.clientDataJSON)
        };

        return await WebAuthn.#callRemote('register', true, auth);

    }

    static async #doAuthenticate(action, data) {

        const resp = await WebAuthn.#callRemote(action, false, data);
        const o = resp.data;
        const challenge = WebAuthn.#fromBinary(o.challenge);
        const creds = [];

        if (action === 'test' && o.uid.length === 0) {
            throw new Error('Invalid credentials!');
        }

        o.uid.every((v) => {
            const uid = WebAuthn.#fromBinary(v);
            const o = {
                type: "public-key",
                id: uid
            };
            //o.transports: ["usb", "nfc", "ble"],
            creds.push(o);
            return true;
        });

        const obj = {
            challenge: challenge,
            rpId: location.hostname,
            userVerification: "preferred",
            timeout: 60000,

            allowCredentials: creds,
            extensions: {
                uvm: true, // RP wants to know how the user was verified
                loc: false,
                txAuthSimple: "Could you please verify yourself?"
            }
        };

        const cred = await navigator.credentials.get({ publicKey: obj });

        if (cred == null) {
            throw new Error('Credential not found!');
        }

        const auth = {
            id: cred.id,
            rawId: WebAuthn.#toBinary(cred.rawId),
            authenticatorData: WebAuthn.#toBinary(cred.response.authenticatorData),
            clientDataJSON: WebAuthn.#toBinary(cred.response.clientDataJSON),
            signature: WebAuthn.#toBinary(cred.response.signature),
            userHandle: WebAuthn.#toBinary(cred.response.userHandle)
        };

        return await WebAuthn.#callRemote(action, true, auth);
    }

    static register(data) {
        return WebAuthn.#doRegister(data);
    }

    static authenticate(data) {
        return WebAuthn.#doAuthenticate("authenticate", data);
    }

    static update(data) {
        return WebAuthn.#doAuthenticate('update', data);
    }

    static unregister(data) {
        return WebAuthn.#doAuthenticate('unregister', data);
    }

    static test(data) {
        return WebAuthn.#doAuthenticate('test', data);
    }
}

