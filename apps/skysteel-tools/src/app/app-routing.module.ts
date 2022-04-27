import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/tools-updater' },
  { path: 'explorer', loadChildren: () => import('./pages/explorer/explorer.module').then(m => m.ExplorerModule) },
  { path: 'editor', loadChildren: () => import('./pages/editor/editor.module').then(m => m.EditorModule) },
  {
    path: 'definitions-organizer',
    loadChildren: () => import('./pages/definition-files-organizer/definition-files-organizer.module').then(m => m.DefinitionFilesOrganizerModule)
  },
  {
    path: 'patch-diff',
    loadChildren: () => import('./pages/patch-diff/patch-diff.module').then(m => m.PatchDiffModule)
  },
  {
    path: 'tools-updater',
    loadChildren: () => import('./pages/tools-updater/tools-updater.module').then(m => m.ToolsUpdaterModule)
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
