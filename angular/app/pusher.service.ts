import {EventEmitter, Injectable, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs/Subscription";
import {AuthService} from "./auth.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {CitiesService} from "./main-content/cities.service";
import {Router} from "@angular/router";
import {AuthenticationService} from "./authentication.service";
import {NgxPermissionsService} from "ngx-permissions";
declare var Pusher: any;

@Injectable()
export class PusherService implements OnInit, OnDestroy  {

  users: Observable<UserOne[]>;
  private fetching: boolean=false;
  private _users: BehaviorSubject<UserOne[]>;
  private dataStore: {
      users: UserOne[]
  };

    public event$: EventEmitter<string>;
  private subscription: Subscription;
  protected pusher = new Pusher('XXXXXXXXXXXXXXXXXXXXXXXXXXXX', {
      cluster: 'eu',
      encrypted: true,
      authEndpoint: '/content/auth',
      auth: {
          headers: {
              Authorization: `Bearer ${this.auth.getToken()}`
          }
      }
  });
  protected privateChannel = this.pusher.subscribe('my-channel');
    public closeChannel = this.pusher.subscribe('private-channel');
    public privateBunChannel = this.pusher.subscribe('private-bun-channel');

  constructor(private auth: AuthService, private http: HttpClient,
              private main_serv: CitiesService, private route: Router,
              private authServ: AuthenticationService,
              protected permissionsService: NgxPermissionsService) {
    this.dataStore = { users: [] };
    this.event$ = new EventEmitter<string>();
    this._users = <BehaviorSubject<UserOne[]>>new BehaviorSubject([]);
    this.users = this._users.asObservable();


      this.privateChannel.bind('auth-event', (data)=>{
          if(data.type==='login') {
              this.dataStore.users.forEach((item, index) => {
                  if (item.name === data.user) {
                      this.dataStore.users[index].indicate = true;
                      this._users.next(Object.assign({}, this.dataStore).users);
                  }
              });
              this.event$.emit(data);
          }
          if(data.type==='logout'){
              this.dataStore.users.forEach((item, index) => {
                  if (item.name === data.user) {
                      this.dataStore.users[index].indicate = false;
                      this._users.next(Object.assign({}, this.dataStore).users);
                  }
              });
              this.event$.emit(data);
          }
      });
      // this.closeChannel.bind('client-add-user', (data)=>{
      //     console.log(data);
      //     this.dataStore.users.push({
      //         name: data.user['name'],
      //         indicate: data.indicate,
      //         role: data.role,
      //         email:  data.user['email'],
      //         create: new Date(Date.parse( data.user['created_at'].replace('-','/','g')))
      //     });
      //     this._users.next(Object.assign({}, this.dataStore).users);
      // });

      this.privateChannel.bind('add-user-event', (data)=>{
          console.log(data);
          this.dataStore.users.push({
              name: data['user']['name'],
              indicate: data['indicate'],
              role: data['role'],
              email:  data['user']['email'],
              create: new Date(Date.parse( data['user']['created_at'].replace('-','/','g'))),
              was_bun: false
          });
          this._users.next(Object.assign({}, this.dataStore).users);
      });

      this.closeChannel.bind('client-delete-user', (data)=>{
          if(data.email===JSON.parse(localStorage.getItem('user_data'))['email'])
              this.authServ.logout();
      });
      this.privateChannel.bind('bun-user-event', (data)=>{
          if(data.email===JSON.parse(localStorage.getItem('user_data'))['email']){
              this.permissionsService.addPermission('Bun');
              console.log('Bun success.');
          }
      });
      this.privateChannel.bind('bun-close-user-event', (data)=>{
          if(data.email===JSON.parse(localStorage.getItem('user_data'))['email']){
              this.permissionsService.removePermission('Bun');
              console.log('Bun cancel success.');
          }
      });
  }

  ngOnInit(){}


  ngOnDestroy(){
     // this.subscription.unsubscribe();
     // this.privateChannel.unsubscribe();
  }

    loadAll() {
        if (this.fetching) {
            return;
        } else {
            this.main_serv.online().subscribe((indicate) => {
               // console.log(indicate['roles']);
                for (let ind = 0; ind < indicate['indicates'].length; ind++) {
                    this.dataStore.users.push({
                        name: indicate['users'][ind],
                        indicate: indicate['indicates'][ind],
                        role: indicate['roles'][ind],
                        email: indicate['emails'][ind],
                        create: new Date(indicate['created'][ind]['date'].replace('.000000','','g')),
                        was_bun: indicate['was_bun'][ind]
                       // create: new Date(Date.parse(indicate['created'][ind]['date'].replace('-','/','g')))
                    });
                    console.log(indicate['created'][ind]['date'].replace('.000000','','g'));
                }
                this.fetching = true;
                this._users.next(Object.assign({}, this.dataStore).users);
            }, error => console.log('Could not load users.'));
        }
    }

    deleteUser(email: string):void{
        this.closeChannel.trigger('client-delete-user', { email: email });
        setTimeout(() => {
            this.http.request('delete','/content/deleteUser', { params: {data: email}})
                .subscribe(response=>{
                    if(response['result']==='success'){
                        this.dataStore.users.forEach((item, index) => {
                            if(item.email===email)
                                this.dataStore.users.splice(index,1);
                        });
                        this._users.next(Object.assign({}, this.dataStore).users);
                    }
                });
        }, 5000)
    }

    userBun(email: string){
        this.http.post('/content/addUserBun', {user: email})
            .subscribe((response)=>{
                if(response['result']==='success'){
                    console.log('Bun success was send!!!');
                    this.dataStore.users.map(el=>{
                        if(el.email===email)
                            el.was_bun=true;
                    });
                    this._users.next(Object.assign({}, this.dataStore).users);
                }else
                    console.log(response['result']);
            });
    }

    closeUserBun(email: string){
        this.http.post('/content/cancelUserBun', {user: email})
            .subscribe((response)=>{
                if(response['result']==='success'){
                    console.log('Bun success was close!!!');
                    this.dataStore.users.map(el=>{
                        if(el.email===email)
                            el.was_bun=false;
                    });
                    this._users.next(Object.assign({}, this.dataStore).users);
                }else
                    console.log(response['result']);
            });
    }

    sendAdminMessage(email: string, message: string):Observable<any>{
        return this.http.post('/content/adminMessage', {user: email, message: message,
            admin: JSON.parse(localStorage.getItem('user_data'))['email']})
            .map(response=>{return response});
    }

}

export interface UserOne {
    name: string;
    indicate: boolean;
    role: string;
    email: string;
    create: Date;
    was_bun: boolean;
    admin_mess ?: boolean;
}
