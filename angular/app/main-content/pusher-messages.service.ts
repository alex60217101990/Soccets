import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {AuthService} from "../auth.service";
import {CitiesService, MessageElement} from "./cities.service";
declare var Pusher: any;

@Injectable()
export class PusherMessagesService {
    messages: Observable<Message[]>;
    private fetching: boolean=false;
    private _messages: BehaviorSubject<Message[]>;
    private dataStore: {
        messages: Message[]
    };
    public pusher = new Pusher('XXXXXXXXXXXXXXXXXXXX', {
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

  constructor(private auth: AuthService, private data: CitiesService) {
      this.dataStore = { messages: [] };
      this._messages = <BehaviorSubject<Message[]>>new BehaviorSubject([]);
      this.messages = this._messages.asObservable();

      this.privateChannel.bind('my-event', (data)=>{
          if(this.dataStore.messages.length>=100){
              this.dataStore.messages.pop();
          }
          this.dataStore.messages.push({message: {
                  id: data.id,
                  user_nickname: data.user_nickname,
                  body_massage: data.body_massage,
                  color: data.color,
                  created_at: data.created_at['date'].match(/^(\d{4}-\d{2}-\d{2}\s?\d{2}:\d{2}:\d{2}).*/i)[1]},
                  button: true, status: true});
          this._messages.next(Object.assign({}, this.dataStore).messages);
      });
      this.privateChannel.bind('delete-event', (data)=>{
          console.log('delete event ' + data.id);
          this.dataStore.messages.map((m)=>{
            if(m.message.id===data.id){
              this.dataStore.messages.splice(this.dataStore.messages.indexOf(m),1);
              console.log(m.message.id);
              this._messages.next(Object.assign({}, this.dataStore).messages);
            }
          });
      });
      this.closeChannel.bind('client-enter', (data) => {
          this.dataStore.messages.forEach((m,i)=>{
            if(m.message.user_nickname===data.user){
              m.status = !data.enter;
              this._messages.next(Object.assign({}, this.dataStore).messages);
            }
          });
      });
  }

  loadAll() {
      if (this.fetching) {
          return;
      } else {
          this.data.getAllMessages().subscribe(data => {
              data.map(elem => {
                  this.dataStore.messages.push({
                      message: elem,
                      button: true,
                      status: true
                  });
              });
              this.fetching=true;
              this._messages.next(Object.assign({}, this.dataStore).messages);
          }, error => console.log('Could not load messages.'));
      }
  }

    remove(index: number) {
        this.dataStore.messages.forEach((m, i) => {
            if (m.message.id === index) {
                this.dataStore.messages.splice(i,1);
                this._messages.next(Object.assign({}, this.dataStore).messages);
            }
        });
    }
    toogleBut(buttonId: number) {
        this.dataStore.messages.forEach((m, i) => {
            if(i===buttonId){
                m.button = !m.button;
                this._messages.next(Object.assign({}, this.dataStore).messages);
            }
        });
    }

}

export interface Message {
    message: MessageElement;
    button: boolean;
    status: boolean;
}
