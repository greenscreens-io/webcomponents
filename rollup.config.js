import { terser } from 'rollup-plugin-terser';

const devMode = (process.env.NODE_ENV === 'development');
console.log(`${devMode ? 'development' : 'production'} mode bundle`);

function isExternal (id) {
    const b1 = id.indexOf('/head') > -1;
    const b2 = id.indexOf('/base') > -1;
    const b3 = id.indexOf('/templating') > -1;
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
        { file: 'release/io.greenscreens.components.js', format: 'esm' },
        { file: 'release/io.greenscreens.components.min.js', format: 'esm', plugins: [minesm] }
    ],
    plugins: [

    ]
};

const core_esm = {
    input: 'modules/index.esm.mjs',
    output: [
        { file: 'release/io.greenscreens.components.esm.js', format: 'esm' },
        { file: 'release/io.greenscreens.components.esm.min.js', format: 'esm', plugins: [minesm] }
    ],
    plugins: [

    ]
};

// all modules - core + ui
const ui = {
    input: 'modules/interface/index.mjs',
    output: [
        { file: 'release/io.greenscreens.ui.all.js', format: 'esm' },
        { file: 'release/io.greenscreens.ui.all.min.js', format: 'esm', plugins: [minesm] }
    ],
    plugins: [

    ]
};
// external : isExternal


export default [core, core_esm, ui]; 
// export default [ui]; 
