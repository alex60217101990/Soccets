import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import {AuthService} from "./auth.service";
import {NgxPermissionsService} from "ngx-permissions";

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private authService : AuthService,
                private router : Router,
                private permissionsService: NgxPermissionsService) { }

    canActivate(route : ActivatedRouteSnapshot, state : RouterStateSnapshot) {
        if(this.authService.isAuthenticated() &&
            ((!!this.permissionsService.getPermission('admin bun'))||
                (!!this.permissionsService.getPermission('admin delete tweet')))) {
            return true;
        }
        this.router.navigate(['/login']);
        return false;
    }
}
