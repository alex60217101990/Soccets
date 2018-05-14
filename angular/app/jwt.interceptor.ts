import 'rxjs/add/operator/do';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {AuthService} from './auth.service';
import {Observable} from 'rxjs/Observable';
import {EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import { Injectable } from '@angular/core';
import {EventLogoutService, EventService} from './event.service';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/retry'; // don't forget the imports

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    constructor(private route: Router, private provider: EventService, private toogle: EventLogoutService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(request).do((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
                // do stuff with response if you want
                console.log(request);
            }
        }, (err: any) => {
            if (err instanceof HttpErrorResponse) {
                if (err.status === 401) {
                    console.log(event);
                    // redirect to the login route
                    this.route.navigate(['/login']);
                    this.provider.getSignal('Server error: code 401.');
                    this.toogle.getSignal(true);
                }
            }
        })  //.retry(3) // optionally add the retry
            .catch((err: HttpErrorResponse) => {

                if (err.error instanceof Error) {
                    // A client-side or network error occurred. Handle it accordingly.
                    console.log('An error occurred:', err.error.message);
                } else {
                    // The backend returned an unsuccessful response code.
                    // The response body may contain clues as to what went wrong,
                    console.log(`Backend returned code ${err.status}, body was: ${err.error.value}`);
                }

                // ...optionally return a default fallback value so app can continue (pick one)
                // which could be a default value
                // return Observable.of<any>({my: "default value..."});
                // or simply an empty observable
                return Observable.empty<HttpEvent<any>>();
            });
    }
}