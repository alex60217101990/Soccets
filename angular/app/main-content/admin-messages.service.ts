import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {Message} from "./pusher-messages.service";
import {AuthService} from "../auth.service";
import {HttpClient} from "@angular/common/http";
declare var Pusher: any;

@Injectable()
export class AdminMessagesService {
    messages: Observable<AdminMessage[]>;
    private _length: number;
    get length() {
        return this._length;
    }
    private fetching: boolean=false;
    private _messages: BehaviorSubject<AdminMessage[]>;
    private dataStore: {
        messages: AdminMessage[]
    };
    public pusher = new Pusher('XXXXXXXXXXXXXXX', {
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
  constructor(private auth: AuthService, private http: HttpClient) {
      this.dataStore = { messages: [] };
      this._messages = <BehaviorSubject<AdminMessage[]>>new BehaviorSubject([]);
      this.messages = this._messages.asObservable();

      this.privateChannel.bind('add-admin-message-event', (data)=>{
          if(data.email===JSON.parse(localStorage.getItem('user_data'))['email']){
              let new_message:AdminMessageElement = {id: data.message.id,
                      body_massage: data.message.body_massage, created_at:
                              {date: data.message.created_at, timezone: "UTC", timezone_type: 3}};
              this.dataStore.messages.push({message: new_message, viewed: false});
              localStorage.setItem(''+data.message.id, JSON.stringify({viewed: false}));
              this._length++;
          }
      });
  }

    loadAll(email: string) {
        if (this.fetching) {
            return;
        } else {
            this.http.post<Array<AdminMessageElement>>('/content/getAdminMessages',{email: email})
                .subscribe(data => {
                    let counter=0;
                data.map(elem => {
                    this.dataStore.messages.push({
                        message: elem,
                        viewed: false
                    });
                    if((!!localStorage.getItem(''+elem.id))&&
                        (JSON.parse(localStorage.getItem(''+elem.id))['viewed']===true)){
                        localStorage.setItem(''+elem.id, JSON.stringify({viewed: true}));
                    }else{
                        localStorage.setItem(''+elem.id, JSON.stringify({viewed: false}));
                        counter++;
                    }
                });
                   // this._length=this.dataStore.messages.length;
                    this._length=counter;
                this.fetching=true;
                this._messages.next(Object.assign({}, this.dataStore).messages);
            }, error => console.log('Could not load messages.'));
        }
    }

    remove(id: number){
        this.http.request('delete', '/content/deleteAdminMessage', { params: {id: String(id)}})
            .subscribe(response =>{
                if(response['result']==='success'){
                    this.dataStore.messages.forEach((item, index) => {
                        if(item.message.id===id) {
                            this.dataStore.messages.splice(index, 1);
                            if((!!localStorage.getItem(''+item.message.id))&&
                                (JSON.parse(localStorage.getItem(''+item.message.id))['viewed']===false)){
                                localStorage.removeItem(''+item.message.id);
                                this._length--;
                            }else localStorage.removeItem(''+item.message.id);
                        }
                    });
                    this._messages.next(Object.assign({}, this.dataStore).messages);
                }
            });
    }

    viewedMess(){
        this.dataStore.messages.map(el=>{
            localStorage.setItem(''+el.message.id, JSON.stringify({viewed: true}));
            this._length = 0;
        });
    }

}

export interface AdminMessage {
    message: AdminMessageElement;
    viewed?:boolean;
}
export interface AdminMessageElement{
    id: number;
    body_massage: string;
    created_at: any;
}
