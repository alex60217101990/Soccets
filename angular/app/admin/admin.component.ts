import {Component, Input, OnInit} from '@angular/core';
import {PusherService, UserOne} from "../pusher.service";
import {CitiesService} from "../main-content/cities.service";
import {Observable} from "rxjs/Observable";
import {NgxPermissionsService} from "ngx-permissions";
import {Ng2DeviceService} from "ng2-device-detector";
import {MatSnackBar} from "@angular/material";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  protected users: Observable<UserOne[]>;
  protected browserInfo: any;
  protected message: string;

    settings = {
        columns: {
            name: {
                title: 'USER'
            },
            create: {
                title: 'CREATED'
            },
            indicate: {
                title: 'STATUS'
            },
            email: {
                title: 'EMAIL'
            }
        }
    };

  constructor(private authEvent: PusherService,
              protected permissionsService: NgxPermissionsService,
              private deviceService: Ng2DeviceService,
              protected snackBar: MatSnackBar) {
      this.users = this.authEvent.users;
      this.authEvent.loadAll();
      this.browserInfo = this.deviceService.browser;
  }

  ngOnInit() {}

    deleteUser(email:string):void{
      this.authEvent.deleteUser(email);
    }

    public enterBun(email: string){
      this.authEvent.userBun(email);
        console.log(email);
        //this.authEvent.privateBunChannel.trigger('client-bun-user', {data: email});
    }
    public closeBun(email: string){
        this.authEvent.closeUserBun(email);
    }

    protected sendAdminMessage(email: string){
        this.authEvent.sendAdminMessage(email, this.message)
        .subscribe(response=>{
            if(response['result']==='success')
                this.openSnackBar('You message was send.', 'close');
            else
                this.openSnackBar('You message wasn\'t send. Try again.', 'close');
        });
    }

    openSnackBar(message: string, action: string) {
        this.snackBar.open(message, action, {
            duration: 5000,
            horizontalPosition:"center",
            verticalPosition:"bottom"
        });
    }

}
