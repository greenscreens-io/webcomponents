/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

/**
 * Rollup plugin to preven inclusion of external libraryies into final build.
 */
export default function gsExtern () {

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