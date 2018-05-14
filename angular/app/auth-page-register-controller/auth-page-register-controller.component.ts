import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material';
import {RegisterService} from '../register.service';
import {HttpClient} from '@angular/common/http';
import {EventFontService} from '../event.service';
import {PusherMessagesService} from "../main-content/pusher-messages.service";


@Component({
  selector: 'app-auth-page-register',
  templateUrl: './auth-page-register-controller.component.html',
  styleUrls: ['./auth-page-register-controller.component.scss']
})
export class AuthPageRegisterControllerComponent implements OnInit {


    protected emailFormControl: any;
    protected loginFormControl: any;
    protected passwordFormControl: any;
    protected confirmPasswordFormControl: any;


    protected authForm = new FormGroup({
            login: new FormControl('', [
                Validators.required,
                Validators.pattern("^(?=.*[A-Za-z0-9А-ЯЁа-яё]$)[A-Za-zА-ЯЁа-яё][A-Za-zА-ЯЁа-яё\\d.-]{3,15}$"),
            ]),
            email: new FormControl('', [
                Validators.required,
                Validators.email
            ]),
            password: new FormControl('', [
                Validators.required,
                Validators.minLength(6),
                Validators.maxLength(30),
            ]),
            confirmPassword: new FormControl('', [
                Validators.required,
                Validators.minLength(6),
                Validators.maxLength(30),
                this.matchOtherValidator('password')
            ]),
        }

       );

    ngOnInit() {}



  constructor(private registerService: RegisterService, private http: HttpClient,
              public snackBar: MatSnackBar, private event$: EventFontService,
              protected mess_serevice: PusherMessagesService) {
              this.emailFormControl = this.authForm.get('email');
              this.loginFormControl = this.authForm.get('login');
              this.passwordFormControl = this.authForm.get('password');
              this.confirmPasswordFormControl = this.authForm.get('confirmPassword');
      event$.getSignal(false);

  }


    /**
     * Material snack bar info message.
     *
     * @param string, string
     * @return void
     */
    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
            duration: 2000,
        });
    }

    onSubmit(){
      if(!!this.emailFormControl.value.toString() && !!this.loginFormControl.value.toString() &&
          !!this.passwordFormControl.value.toString() && !!this.confirmPasswordFormControl.value.toString() &&
            this.passwordFormControl.value.toString()===this.confirmPasswordFormControl.value.toString()) {


            let rezult = this.registerService.request(this.emailFormControl.value,
                this.passwordFormControl.value, this.loginFormControl.value);

            rezult.subscribe(data=> {
                if (data.hasOwnProperty('register') == true) {
                    this.openSnackBar('Данные были успешно отправлены на сервер.','exit');
                    // this.Channel.trigger('client-add-user', data['data']);
                }
                else {
                    this.openSnackBar('Во время отправки данных произошла ошибка: '
                        + data['error'] + ', ' + ' Code: ' + data['code'] + '.','exit');
                    console.log(data['error']);
                }
            });
      }
      return false;
  }

  /**
   *  Method validation password equal confirm password.
   *@param string
   * @return ValidatorFn
   */
    matchOtherValidator (otherControlName: string) {

        let thisControl: FormControl;
        let otherControl: FormControl;

        return function matchOtherValidate (control: FormControl) {

            if (!control.parent) {
                return null;
            }

            // Initializing the validator.
            if (!thisControl) {
                thisControl = control;
                otherControl = control.parent.get(otherControlName) as FormControl;
                if (!otherControl) {
                    throw new Error('matchOtherValidator(): other control is not found in parent group');
                }
                otherControl.valueChanges.subscribe(() => {
                    thisControl.updateValueAndValidity();
                });
            }
            if (!otherControl) {
                return null;
            }
            if (otherControl.value !== thisControl.value) {
                return {
                    matchOther: true
                };
            }
            return null;
        }
    }


}



















/*private passwordAreEqual(): ValidatorFn {
 return (group: FormGroup): {[key: string]: any} => {
    if(!(group.dirty || group.touched)||group.get('password').value === group.get('confirmPassword').value){
      return null;
    }
    return {custom: "Password are not equal."}
 }
};*/