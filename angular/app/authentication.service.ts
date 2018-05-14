import {EventEmitter, Injectable, Output} from '@angular/core';
import { HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map'
import {hasProperties} from 'codelyzer/util/astQuery';
import {Logout, Token} from './token';
import {ActivatedRoute, Router} from '@angular/router';
import {EventLogoutService, EventTitleService} from './event.service';
import {VideoService} from "./video-call/video.service";

@Injectable()
export class AuthenticationService {
    public token: string;
    public result: boolean;


    public message$: EventEmitter<string>;

    constructor(private router: ActivatedRoute, private http: HttpClient,
                private route: Router, private toogle: EventLogoutService,
                private title$: EventTitleService) {
        // set token if saved in local storage
        var currentUser = localStorage.getItem('id_token');//JSON.parse(localStorage.getItem('id_token'));
        this.token = currentUser; //&& currentUser.id_token;

        this.message$ = new EventEmitter();
    }
    public login(email: string, password: string, login: string): Observable<any>|any {
        return this.http.post<Token>('/auth/login', {email: email, login: login, password: password})
            .map((response: Token) => {
                // login successful if there's a jwt token in the response
                let token = response.token;
                if (!!token) {
                    // set token property
                    this.token = response.token; this.result = true;
                    // store username and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('id_token', token);
                    localStorage.setItem('user_data', JSON.stringify({login: login, email: email}));

                    this.title$.getSignal(login);

                    this.toogle.getSignal(false);
                    return response;
                } else {
                    // return false to indicate failed login
                    return response;
                }
            });
    }

    public logout(): void {
        // clear token remove user from local storage to log user out
        this.token = null;
        this.http.get<Logout>('/auth/logout').subscribe((message: Logout)=> {
            console.log(message.message);
            if(message.message == 'Successfully logged out') {
                localStorage.removeItem('id_token');
                localStorage.removeItem('user_data');
                console.log('Successfully logged out');
                this.route.navigate(['/login'], {relativeTo: this.router});

                this.message$.emit('Successfully logged out.');
                this.toogle.getSignal(true);
                this.title$.getSignal('Welcome to Anvel!');
            }
            else{
                this.message$.emit('Error of logout.');
            }
        });
    }

    /**
     * Method for load all permissions on app.
     * @return {Observable<Array<string>>}
     */
    public loadPermissions():Observable<Array<string>>{
        return this.http.post<Array<string>>('/content/getPermissions',1).map((permissions) => {
            return permissions;
        });
    }

}
