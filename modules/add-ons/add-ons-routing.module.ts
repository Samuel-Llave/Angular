import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ListComponent} from "./pages/list/list.component";
import {AddComponent} from "./pages/add/add.component";


const routes: Routes = [
  {path: '', component: ListComponent},
  {path: ':id', component: AddComponent},
  {
    path: 'new', component: AddComponent,
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddOnsRoutingModule { }
