import { Routes } from '@angular/router';
import { Catalogo } from './screens/catalogo/catalogo';
import { CursoDetalle } from './screens/curso-detalle/curso-detalle';
import { Inscripciones } from './screens/inscripciones/inscripciones';
import { MisCursos } from './screens/mis-cursos/mis-cursos';
import { Contacto } from './screens/contacto/contacto';

export const routes: Routes = [
  { path: '', component: Catalogo },
  { path: 'curso/:id', component: CursoDetalle },
  { path: 'inscripciones', component: Inscripciones },
  { path: 'mis-cursos', component: MisCursos },
  { path: 'contacto', component: Contacto },
  { path: '**', redirectTo: '' }
];