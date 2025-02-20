/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

/**
 * Used to generate short temporary browser unique hash to improve Quark RPC API security.
 * NOTE: Not used to track user/browser
 */
export class GSFinigerprint {

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/acosh#Polyfill
    static #acoshPf(x) {
        return Math.log(x + Math.sqrt(x * x - 1));
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/asinh#Polyfill
    static #asinhPf(x) {
        if (x === -Infinity) {
            return x;
        } else {
            return Math.log(x + Math.sqrt(x * x + 1));
        }
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atanh#Polyfill
    static #atanhPf(x) {
        return Math.log((1 + x) / (1 - x)) / 2;
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/cbrt#Polyfill
    static #cbrtPf(x) {
        var y = Math.pow(Math.abs(x), 1 / 3);
        return x < 0 ? -y : y;
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/cosh#Polyfill
    static #coshPf(x) {
        var y = Math.exp(x);
        return (y + 1 / y) / 2;
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/expm1#Polyfill
    static #expm1Pf(x) {
        return Math.exp(x) - 1;
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sinh#Polyfill
    static #sinhPf(x) {
        var y = Math.exp(x);
        return (y - 1 / y) / 2;
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/tanh#Polyfill
    static #tanhPf(x) {
        var a = Math.exp(+x),
            b = Math.exp(-x);
        return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (a + b);
    }

    static #canvas(width = 200, height = 50) {
        if (globalThis.OffscreenCanvas) return new OffscreenCanvas(width, height);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    static async #toDataURL(canvas) {
        if (canvas.toDataURL) return canvas.toDataURL();
        const blob = await canvas.convertToBlob()
        const buff = await blob.arrayBuffer();
        return btoa(new Uint8Array(buff))
    }

    static #safeCall(fn, args) {
        try {
            return fn.apply(null, Array.isArray(args) ? args : [args]);
        } catch (e) {
            return "";
        }
    }

    static get #math() {
        const me = this;
        let results = "";
        let tmp;

        tmp = me.#safeCall(Math.acos, 0.123124234234234242);
        results += tmp;

        tmp = me.#safeCall(Math.acosh, 1e308);
        results += tmp;

        tmp = me.#safeCall(Math.asin, 0.123124234234234242);
        results += tmp;

        tmp = me.#safeCall(Math.asinh, 1e300);
        results += tmp;

        tmp = me.#safeCall(Math.cosh, 1);
        results += tmp;

        tmp = me.#safeCall(Math.expm1, 1);
        results += tmp;

        tmp = me.#safeCall(Math.sinh, 1);
        results += tmp;

        tmp = me.#safeCall(Math.tan, -1e308);
        results += tmp;

        tmp = me.#safeCall(me.#acoshPf, 1e154);
        results += tmp;

        tmp = me.#safeCall(me.#asinhPf, 1e300);
        results += tmp;

        tmp = me.#safeCall(me.#coshPf, 1);
        results += tmp;

        tmp = me.#safeCall(me.#expm1Pf, 1);
        results += tmp;

        tmp = me.#safeCall(me.#sinhPf, 1);
        results += tmp;

        tmp = me.#safeCall(me.#tanhPf, 1);
        results += tmp;

        tmp = me.#safeCall(me.#atanhPf, 1);
        results += tmp;

        tmp = Math.exp(1) !== Math.E;
        results += tmp;

        return results;
    }

    static get #Canvas2dRender() {

        const canvas = GSFinigerprint.#canvas();

        const ctx = canvas.getContext("2d");
        if (!ctx) return '';

        ctx.font = "21.5px Arial";
        ctx.fillText("😉", 0, 20);

        ctx.font = "15.7px serif";
        ctx.fillText("abcdefghijklmnopqrtsuvwxyz", 0, 40);

        ctx.font = "20.5px Arial";
        let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "red");
        gradient.addColorStop(0.5, "green");
        gradient.addColorStop(1.0, "blue");
        ctx.fillStyle = gradient;
        ctx.fillText("Cwm fjordbank glyphs vext quiz", 30, 20);

        ctx.beginPath();
        ctx.moveTo(170, 5);
        ctx.lineTo(160, 25);
        ctx.lineTo(185, 20);
        ctx.fill();

        return GSFinigerprint.#toDataURL(canvas);
    }

    static get #WebglRender() {

        const canvas = GSFinigerprint.#canvas(50, 50);

        const gl = canvas.getContext("webgl");
        if (!gl) return '';

        const vertices = [
            [-0.1, 0.8, 0.0],
            [-0.8, -0.8, 0.0],
            [0.8, -0.7, 0.0],
        ].flat();

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        const indices = [0, 1, 2];
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(
            gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices),
            gl.STATIC_DRAW
        );

        const vertCode = `
          attribute vec3 coordinates;
          void main(void) {
            gl_Position = vec4(coordinates, 1.0);
          }
         `;
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertCode);
        gl.compileShader(vertexShader);

        const fragCode = `
          void main(void) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 0.5);
          }
        `;
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragCode);
        gl.compileShader(fragmentShader);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        const coordinatesAttribute = gl.getAttribLocation(program, "coordinates");

        gl.vertexAttribPointer(coordinatesAttribute, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(coordinatesAttribute);

        gl.clearColor(1, 1, 1, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

        return GSFinigerprint.#toDataURL(canvas);
    }

    static get #WebglInfo() {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl");
        return gl?.getParameter(gl.RENDERER);
    }

    /**
     * change on display change (multiple displays)
     */
    static get #DevicePixelRatio() {
        return window.devicePixelRatio;
    }

    /**
     * per browser version; change after update
     */
    static get #UserAgent() {
        return navigator.userAgent;
    }

    static get #Platform() {
        return navigator.platform;
    }

    static get #Processors() {
        return navigator.hardwareConcurrency;
    }

    /**
     * per browser session; change after restart
     */
    static async #MediaDevices() {
        const devices = await navigator.mediaDevices?.enumerateDevices();
        return devices ? devices.map(o => o.groupId).join(',') : '';
    }

    /**
     * rarely changes; after OS time change
     */
    static get #TimeZone() {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    static get #Brands() {
        return navigator.userAgentData?.brands.map(o => o.brand).join(',');
    }

    /**
     * rarely change after OS language list change
     */
    static get #languages() {
        return navigator.languages.join(',');
    }

    static get #Fonts() {
        const fonts = [
            "-apple-system",
            "BlinkMacSystemFont",
            "Cantarell",
            "Consolas",
            "Courier New",
            "Droid Sans",
            "Fira Sans",
            "Helvetica Neue",
            "Menlo",
            "Monaco",
            "Oxygen",
            "Roboto",
            "source-code-pro",
            "Segoe UI",
            "Ubuntu",
        ];
        return fonts
            .filter((font) => document.fonts.check(`12px "${font}"`))
            .join(", ");
    }

    /**
     * Valid across active browser session;  invalid after restart
     * @returns 
     */
    static async #computeSession(ip = '') {
        const me = GSFinigerprint;
        return {
            ip: ip,
            mediaDevices: await me.#MediaDevices()
        };
    }

    /**
     * Valid across current browser; invalid after upgrade
     * @returns 
     */
    static async #computeUnstable(ip = '') {
        const me = GSFinigerprint;
        return {
            ip: ip,
            devicePixelRatio: me.#DevicePixelRatio,
            brands: me.#Brands,
            fonts: me.#Fonts,
            languages: me.#languages,
            userAgent: me.#UserAgent
        };
    }

    static async #computeStable(ip = '') {
        const me = GSFinigerprint;
        return {
            ip: ip,
            timeZone: me.#TimeZone,
            platform: me.#Platform,
            processors: me.#Processors,
            canvas2dRender: await me.#Canvas2dRender,
            webglRender: await me.#WebglRender,
            webglInfo: me.#WebglInfo,
            math: me.#math
        };
    }

    static async #compute(short = false, ip = '') {
        if (!short) return GSFinigerprint.#computeStable(ip);
        return {
            ...(await GSFinigerprint.#computeStable(ip)),
            ...(await GSFinigerprint.#computeUnstable(ip))
        };
    }

    /**
     * Java compatible hashcode
     * @param {*} s 
     * @returns 
     */
    static #hashCode(s) {
        let h = 0,
            l = s.length,
            i = 0;
        let isstr = typeof 's' == 'string';
        if (l > 0)
            while (i < l) {
                if (isstr) {
                    h = (h << 5) - h + s.charCodeAt(i++) | 0;
                } else {
                    h = (h << 5) - h + s[i++] | 0;
                }
            }
        return h;
    }

    static async #digestMessage(message) {
        if (!crypto.subtle) return null;
        const msgUint8 = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    /**
     * Calculate JSON object fingerprint
     * @param {*} obj 
     * @returns 
     */
    static async fingerprint(obj) {
        const me = GSFinigerprint;
        const concatenated = Object.values(obj).map(String).join("\n");
        const hash = me.#hashCode(concatenated);
        const digest = await me.#digestMessage(concatenated);
        return { hash, digest, obj };
    }

    /**
     * Calculate browser fingerprint long/short valid
     * @param {*} short 
     * @returns 
     */
    static async get(short = false, ip = '') {
        const me = GSFinigerprint;
        const components = await me.#compute(short, ip);
        return await me.fingerprint(components);
    }

    /**
     * Calculate session fingerprint
     * @param {string} ip IP address
     * @returns 
     */
    static async session(ip = '') {
        const me = GSFinigerprint;
        let obj = await me.#computeSession(ip);
        if (!obj.mediaDevices) obj = await me.#computeUnstable(ip);
        return await me.fingerprint(obj);
    }
}