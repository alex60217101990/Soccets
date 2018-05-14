import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatButtonModule, MatCheckboxModule, MatSnackBar} from '@angular/material';
@NgModule({
  imports: [
    CommonModule,
      MatSnackBar,
      MatSnackBarModule
  ],
    exports: [
        MatSnackBar,
        MatSnackBarModule
    ],
  declarations: [
      MatSnackBar,
      MatSnackBarModule
  ]
})
export class AuthPageRegisterControllerModule { }
