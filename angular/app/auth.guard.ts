import { Injectable } from '@angular/core';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {AuthService} from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private authService : AuthService, private router : Router ) { }

    canActivate(route : ActivatedRouteSnapshot, state : RouterStateSnapshot) {
        if(this.authService.isAuthenticated()) {
            console.log(this.authService.getLogin());
            return true;
        }
        // not logged in so redirect to login page
        this.router.navigate(['/login']);
        return false;
    }
}