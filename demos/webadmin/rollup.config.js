import { terser } from 'rollup-plugin-terser';
import { sourcemaps } from 'rollup-plugin-sourcemaps';
import gsExtern from './rollup-plugin-gs-extern.js'

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

const crypto = {
    external: [],
    input: './modules/index.mjs',
    output: [
        //{ file: 'release/io.greenscreens.admin.js', format: 'esm'},
        { file: 'release/io.greenscreens.admin.min.js', sourcemap: true, format: 'esm', plugins: [minesm, sourcemaps] }
    ],
    plugins: [gsExtern()], 
};

export default [crypto];