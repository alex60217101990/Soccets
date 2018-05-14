import { Injectable } from '@angular/core';
//import decode from 'jwt-decode';
import {tokenNotExpired} from 'angular2-jwt';

@Injectable()
export class AuthService {

    constructor(){}

    public getToken(): string {
    //    console.log(localStorage.getItem('id_token'));
        return localStorage.getItem('id_token');
    }

    public getLogin(): string {
       return JSON.parse(localStorage.getItem('user_data'));
    }

    public isAuthenticated(): boolean {
        /**
         * Здесь нужно искать токен в local storage по названию ключа.!!!
         */
        // whether or not the token is expired
        //return tokenNotExpired(token);
        return tokenNotExpired('id_token');
    }

}