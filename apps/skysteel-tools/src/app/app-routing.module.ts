import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/editor' },
  { path: 'editor', loadChildren: () => import('./pages/editor/editor.module').then(m => m.EditorModule) },
  {
    path: 'definitions-organizer',
    loadChildren: () => import('./pages/definition-files-organizer/definition-files-organizer.module').then(m => m.DefinitionFilesOrganizerModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
