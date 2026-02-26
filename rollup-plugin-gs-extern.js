/*
 * Copyright (C) 2015, 2026 Green Screens Ltd.
 */

/**
 * Rollup plugin to prevent inclusion of external libraries into final build.
 */
export function gsExtern () {

    const isString = (val) => (typeof val == 'string');
    
    const isExternal = (val) => isString(val) ? val.startsWith('/') : false;

    const validateExtern = (source) => isExternal(source) ? {external:true, id:source} : null;

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
      resolveId ( source ) {
        return validateExtern(source);
      }

    };
  }

  export function gsCleanup () {

    return {
      name: 'gs-cleanup', 

      generateBundle(source) {
        debugger;
        console.log('==== >>', source);
        return source;
      }
    }
  }