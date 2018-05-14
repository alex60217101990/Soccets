import { Component, OnInit,Inject } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {MatCardModule} from '@angular/material/card';
import {Router} from '@angular/router';
import {AuthenticationService} from '../authentication.service';
import {Observable} from 'rxjs/Observable';
import {EventFontService} from '../event.service';
/**
 * @title Input with error messages
 */
@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page-controller.component.html',
  styleUrls: ['./auth-page-controller.component.scss']
})
export class AuthPageControllerComponent implements OnInit {
    protected emailFormControl: any;
    protected loginFormControl: any;
    protected passwordFormControl: any;
    protected recaptchaReactiveForm: Boolean;

    protected authForm:FormGroup = new FormGroup({
        login: new FormControl('',[
            Validators.required,
            Validators.pattern("^(?=.*[A-Za-z0-9А-ЯЁа-яё]$)[A-Za-zА-ЯЁа-яё][A-Za-zА-ЯЁа-яё\\d.-]{3,15}$"),
        ]),
        email: new FormControl( '', [
            Validators.required,
            Validators.email,
          //  Validators.pattern('^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$'),
        ]),
        password: new FormControl('',[
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(30),
        ]),
    });

  constructor(private router : Router, private authControl: AuthenticationService, private event$: EventFontService) {
      this.emailFormControl = this.authForm.get('email');
      this.loginFormControl = this.authForm.get('login');
      this.passwordFormControl = this.authForm.get('password');
      this.recaptchaReactiveForm = false;
      event$.getSignal(false);
  }


    public resolved(captchaResponse: string) {
          this.recaptchaReactiveForm = new Boolean(captchaResponse);
          console.log( this.recaptchaReactiveForm.valueOf());
    }


    ngOnInit() {
  }

    public onSubmit(){
      if(!!this.emailFormControl.value.toString() && !!this.loginFormControl.value.toString() &&
            !!this.passwordFormControl.value.toString() /*&& this.recaptchaReactiveForm.valueOf()===true*/){
          this.authControl.login(this.emailFormControl.value,
              this.passwordFormControl.value, this.loginFormControl.value).subscribe(data=>{
              if(new Boolean(data.token)){
                  this.router.navigateByUrl('/');
              }else{
                  this.router.navigateByUrl('/login');
              }
          });
      }

      return false;
    }

}
