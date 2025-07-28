/**
 * Install tools
 * npm install rolldown -g
 * npm install rolldown -d
 * npm i @swc/core rollup-plugin-swc3 -d
 * 
 * then call "rolldown -c" from command line
 * or use "npm run build2"
 */

import { defineConfig } from 'rolldown';
import sourcemaps from 'rollup-plugin-sourcemaps';
import gzipPlugin from 'rollup-plugin-gzip'
import { minify } from 'rollup-plugin-swc3';
import { gsExtern, gsCleanup } from './rollup-plugin-gs-extern.js'

console.log((new Date()).toLocaleString());

const minesm = minify({
      module: true,
      // swc's minify option here
      mangle: {},
      compress: {},
    });

const core = defineConfig({
    input: 'modules/index.mjs',
    output: [
        { file: 'release/esm/io.greenscreens.components.core.min.js', format: 'esm', sourcemap: true, plugins: [minesm, sourcemaps] }
    ],
    plugins: [
        gzipPlugin()
    ]
});

const all = defineConfig({
    input: 'modules/index.all.mjs',
    output: [
        { file: 'release/esm/io.greenscreens.components.all.min.js', format: 'esm', sourcemap: true, plugins: [minesm, sourcemaps] }
    ],
    plugins: [
        gzipPlugin()
    ]
});

const extra = defineConfig({
    input: 'modules/extra/index.mjs',
    output: [
        { file: 'release/esm/io.greenscreens.extra.min.js', format: 'esm', sourcemap: true, plugins: [minesm, sourcemaps] }
    ],
    plugins: [gsExtern(), gzipPlugin()]
});


const serviceWorker = defineConfig({
    input: 'modules/worker/index.mjs',
    output: [
        { file: 'release/esm/io.greenscreens.worker.min.js', format: 'esm', sourcemap: true, plugins: [minesm, sourcemaps] }
    ],
    plugins: [
        gzipPlugin()
    ]
});

// for testing only 
//export default [core, all, extra]; 
//export default [serviceWorker];

export default [all, serviceWorker];