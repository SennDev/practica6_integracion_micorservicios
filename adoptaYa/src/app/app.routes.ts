import { Routes } from '@angular/router';
import { CatalogoScreen } from './screens/catalogo-screen/catalogo-screen';
import { DetalleScreen } from './screens/detalle-screen/detalle-screen';
import { ContactoScreen } from './screens/contacto-screen/contacto-screen';
import { PostulacionScreen } from './screens/postulacion-screen/postulacion-screen';
import { PostulacionesListaScreen } from './screens/postulaciones-lista-screen/postulaciones-lista-screen';

export const routes: Routes = [
  { path: '', component: CatalogoScreen }, // Página de inicio
  { path: 'detalle/:id', component: DetalleScreen },
  { path: 'contacto', component: ContactoScreen },
  { path: 'postulacion', component: PostulacionScreen },
  { path: 'postulaciones', component: PostulacionesListaScreen },
  { path: '**', redirectTo: '' }

];
