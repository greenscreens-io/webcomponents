/**
 * Install tools
 * npm install rollup -g
 * npm install terser -g
 * npm install rollup-plugin-sourcemaps --save-dev
 * npm install rollup-plugin-terser --save-dev
 * npm install rollup-plugin-gzip --save-dev
 * 
 * then call "rollup -c" from command line
 */

import { terser } from 'rollup-plugin-terser';
import sourcemaps from 'rollup-plugin-sourcemaps';
import gzipPlugin from 'rollup-plugin-gzip'
import { gsExtern, gsCleanup } from './rollup-plugin-gs-extern.js'

console.log((new Date()).toLocaleString());

const devMode = (process.env.NODE_ENV === 'development');
console.log(`${devMode ? 'development' : 'production'} mode bundle`);

const minesm = terser({
    ecma: 2022,
    keep_classnames: false,
    keep_fnames: false,
    module: true,
    toplevel: false,
    mangle: {
        toplevel: true,
        keep_classnames: true,
        keep_fnames: true
    },
    compress: {
        module: true,
        toplevel: true,
        unsafe_arrows: true,
        keep_classnames: true,
        keep_fnames: true,
        drop_console: !devMode,
        drop_debugger: !devMode
    },
    output: { quote_style: 1 }
});

const core = {
    input: 'modules/index.mjs',
    output: [
        { file: 'release/esm/io.greenscreens.components.core.min.js', format: 'esm', sourcemap: true, plugins: [minesm, sourcemaps] }
    ],
    plugins: [
        gzipPlugin()
    ]
};

const all = {
    input: 'modules/index.all.mjs',
    output: [
        { file: 'release/esm/io.greenscreens.components.all.min.js', format: 'esm', sourcemap: true, plugins: [minesm, sourcemaps] }
    ],
    plugins: [
        gzipPlugin()
    ]
};

const extra = {
    input: 'modules/extra/index.mjs',
    output: [
        { file: 'release/esm/io.greenscreens.extra.min.js', format: 'esm', sourcemap: true, plugins: [minesm, sourcemaps] }
    ],
    plugins: [gsExtern(), gzipPlugin()]
};


const serviceWorker = {
    input: 'modules/worker/index.mjs',
    output: [
        { file: 'release/esm/io.greenscreens.worker.min.js', format: 'esm', sourcemap: true, plugins: [minesm, sourcemaps] }
    ],
    plugins: [
        gzipPlugin()
    ]
};

//export default [core, all, extra]; 
//export default [serviceWorker];
export default [all, serviceWorker];

