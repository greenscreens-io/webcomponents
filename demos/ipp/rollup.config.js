import { terser } from 'rollup-plugin-terser';
import sourcemaps from 'rollup-plugin-sourcemaps';

function gsExtern() {

    const isString = (val) => (typeof val == 'string');

    const isExternal = (val) => isString(val) ? val.startsWith('/') : false;

    const validateExtern = (source) => isExternal(source) ? { external: true, id: source } : null;

    return {
        name: 'gs-extern',

        options(opts) {
            opts.makeAbsoluteExternalsRelative = false;
            return opts;
        },

        // resolve import('...') function; if marked as external; source line kept
        resolveDynamicImport(source) {
            return validateExtern(source);
        },

        // resove standard import; if marked as external; source line kept
        resolveId(source) {
            return validateExtern(source);
        }

    };
}


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

const ipp = {
    external: [],
    input: './modules/index.mjs',
    output: [
        { file: 'release/io.greenscreens.ipp.min.js', sourcemap: true, format: 'esm', plugins: [minesm, sourcemaps] }
    ],
    plugins: [gsExtern()],
};

export default [ipp];