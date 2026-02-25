import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';

import { Navbar } from './navbar/navbar.component';
import { Footer } from './footer/footer.component';
import { SharedModule } from "../shared/shared.module";


@NgModule({
  declarations: [
    Navbar,
    Footer
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    SharedModule
],
  exports: [
    Navbar,
    Footer
  ]
})
export class LayoutModule { }
