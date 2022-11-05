import { terser } from 'rollup-plugin-terser';
import { sourcemaps } from 'rollup-plugin-sourcemaps';

const devMode = (process.env.NODE_ENV === 'development');
console.log(`${devMode ? 'development' : 'production'} mode bundle`);

function isExternal (id) {
    const b1 = id.includes('/head');
    const b2 = id.includes('/base');
    const b3 = id.includes('/templating');
    const flag = b1 || b2 || b3;
    // if (flag) console.log(`Skiping external import: ${id}`);
    return flag;
}

const minesm = terser({
    ecma: 2020,
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
        { file: 'release/io.greenscreens.components.core.js', format: 'esm' },
        { file: 'release/io.greenscreens.components.core.min.js', format: 'esm', sourcemap: true, plugins: [minesm, sourcemaps] }
    ],
    plugins: [

    ]
};

const core_esm = {
    input: 'modules/index.esm.mjs',
    output: [
        { file: 'release/io.greenscreens.components.core.esm.js', format: 'esm' },
        { file: 'release/io.greenscreens.components.core.esm.min.js', format: 'esm', sourcemap: true, plugins: [minesm, sourcemaps] }
    ],
    plugins: [

    ]
};

const all = {
    input: 'modules/components/index.mjs',
    output: [
        { file: 'release/io.greenscreens.components.all.js', format: 'esm' },
        { file: 'release/io.greenscreens.components.all.min.js', format: 'esm', sourcemap: true, plugins: [minesm, sourcemaps] }
    ],
    plugins: [

    ]
};

const all_esm = {
    input: 'modules/components/index.esm.mjs',
    output: [
        { file: 'release/io.greenscreens.components.all.esm.js', format: 'esm' },
        { file: 'release/io.greenscreens.components.all.esm.min.js', format: 'esm', sourcemap: true, plugins: [minesm, sourcemaps] }
    ],
    plugins: [

    ]
};

export default [core, core_esm, all, all_esm]; 


