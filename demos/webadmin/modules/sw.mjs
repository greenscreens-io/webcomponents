//NOTE
// As this file must be served from the root, it is hardliunked into server root directory
//     mklink /H Z:\environment\git\sw.mjs Z:\environment\git\bootstrap-lit\demos\webadmin\modules\sw.mjs
//     mklink /H Z:\environment\git\files-to-cache.json Z:\environment\git\bootstrap-lit\demos\webadmin\modules\files-to-cache.json
// Alternatively, you can use a custom scope, but the web server must respond with "Service-Worker-Allowed: /" header for the service worker file.

// import { WorkerEngine } from "/bootstrap-lit/reelase/esm/io.greenscreens.worker.all.min.js";
import { WorkerEngine } from "/bootstrap-lit/modules/worker/index.mjs";


// Assets to precache
const precachedAssets = [
    '/bootstrap-lit/assets/img/logo.png'
];

// fetch filter to determine which resources are cached
// when using RegExp, set 'parsed' to 'true' to ignore query parameters
// json filter example will cache only static json files; ones without query parameters
// image filter example will cache all image files ergardless query parameters
const filters = [
  { name: 'templateFilter', fn: (request) => request.url.includes('/templates/') },
  { name: 'jsonFilter', rule: "\.json$" },
  { name: 'imageFilter', rule: /\.(png|jpg|jpeg|gif|svg)$/, parsed : true },
]

const options = {
  trace: true,
  preload: true,
  nocache: '_dc=\\d{10,}',
  cacheName: 'GSAdminCache_v1',
  preCacheURL: "/files-to-cache.json",
  precachedAssets: precachedAssets,
  filters: filters
}

// TODO 
// add handlers support for sync, push, messages (and commands), channels

const worker =  WorkerEngine.create(options);

//  