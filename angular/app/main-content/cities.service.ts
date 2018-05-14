import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {element} from 'protractor';
import {forEach} from "@angular/router/src/utils/collection";

export interface MessageElement {
    id: number;
    user_nickname: string;
    body_massage: string;
    color: string;
    created_at: any;
}

export interface Online {
    name:string;
    indicate:boolean;
}

@Injectable()
export class CitiesService implements OnDestroy{
private Messages: Array<MessageElement>;
  constructor(private http: HttpClient) {
      this.Messages = new Array<MessageElement>();
      console.log(this.Messages.length);
  }

    ngOnDestroy() {
        this.Messages.length = 0;
    }

  public getAllMessages():Observable<Array<MessageElement>>{
      return this.http.post('/content/getMessages', 1)
           .map((response: Response) => {
               for(let element in response['data']) {
                  this.Messages.push({id: response['data'][element]['id'],
                      user_nickname: response['user_nickname'][element],
                      body_massage: response['data'][element]['body_massage'],
                      color: response['color'][element],
                      created_at: response['data'][element]['created_at']});
               }
              return this.Messages;
          });
  }


  public connect(text: string):any{
      this.http.post('/content/soccet', {message:text, user: localStorage.getItem('user_data')})
          .subscribe((response)=>{
          console.log(response);
      });
  }

    public delete(){
        this.http.delete('/content/delete')
            .subscribe((response)=>{
                console.log(response);
            });
    }

    public deleteOne(id: number){
        this.http.post('/content/deleteOne', {id: id})
            .subscribe((response)=>{
                console.log(response);
            });
    }

    public online():any{
        return this.http.post('/content/onlineIndicate', 1)
            .map((response)=>{
                return response;
            });
    }
}





