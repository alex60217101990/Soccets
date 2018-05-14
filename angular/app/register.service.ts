import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class RegisterService {

  constructor(private http: HttpClient) {}

  public request(email: string, password: string, login: string): Observable<any>{
    return this.http.post('/auth/register',
            {email: email, password: password, login: login}
      ).map((response)=>{ return response; });
  }
}
