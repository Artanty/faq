import { loadRemoteModule } from '@angular-architects/module-federation';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestComponent } from './components/test/test.component';

// const routes: Routes = [];
// const routes: Routes = [
//   {
//     path: 'child',
//     loadChildren: () =>
//       loadRemoteModule({
//         type: 'module',
//         remoteEntry: 'http://localhost:4221/remoteEntry.js',
//         exposedModule: './AppModule',
//       }).then((m) => m.AppModule), // Lazy-load the child module
//   },
// ];
const routes: Routes = [
  {
    path: 'test',
    component: TestComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
