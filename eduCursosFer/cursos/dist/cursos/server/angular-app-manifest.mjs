
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 0,
    "route": "/"
  },
  {
    "renderMode": 0,
    "route": "/curso/*"
  },
  {
    "renderMode": 0,
    "route": "/inscripciones"
  },
  {
    "renderMode": 0,
    "route": "/mis-cursos"
  },
  {
    "renderMode": 0,
    "route": "/contacto"
  },
  {
    "renderMode": 0,
    "redirectTo": "/",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 5054, hash: '0f5458ed86b40d982d13e03e8cda7018475400c9c1730b769191625d8e3fabcd', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 996, hash: 'bfdd89dd1c810dcd89a0a831670337afec149ec2b7f303cd0aa8a8bb6c2c7b42', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-YLDUPM6B.css': {size: 315911, hash: 'NTrzrEPhBFk', text: () => import('./assets-chunks/styles-YLDUPM6B_css.mjs').then(m => m.default)}
  },
};
