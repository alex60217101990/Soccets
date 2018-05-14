import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import {MatButtonModule, MatCheckboxModule} from '@angular/material';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule }   from '@angular/common/http';
import {MatDialogModule} from '@angular/material/dialog';
import {AppComponent, DialogOverviewExampleDialog} from './app.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './token.interceptor';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatIconModule, MatIconRegistry, MatStepperModule} from '@angular/material';
import { MatTableModule } from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';


/*Angular material - forms.*/
import {MatInputModule} from '@angular/material/input';
import { AuthPageControllerComponent } from './auth-page-controller/auth-page-controller.component';
import {
    AuthPageRegisterControllerComponent
} from './auth-page-register-controller/auth-page-register-controller.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTabsModule} from '@angular/material/tabs';
import { AuthRoutesComponent } from './auth-routes/auth-routes.component';
import {DeleteDialog, MainContentComponent, VideoConnection} from './main-content/main-content.component';
import {RouterModule, Routes} from '@angular/router';
import {AuthService} from './auth.service';
import {AuthGuard} from './auth.guard';
import {AuthenticationService} from './authentication.service';
import {RegisterService} from './register.service';
import {JwtInterceptor} from './jwt.interceptor';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatExpansionModule} from '@angular/material/expansion';

import {
    EventFontService,
    EventLogoutService,
    EventRouteService,
    EventService,
    EventTitleService
} from './event.service';
import {RECAPTCHA_SETTINGS, RecaptchaSettings, RecaptchaModule } from 'ng-recaptcha';
import {CitiesService} from './main-content/cities.service';
import {MatMenuModule} from '@angular/material/menu';
import {MatPaginatorModule} from '@angular/material/paginator';
import { Ng2OrderModule } from 'ng2-order-pipe'; //importing the module
import { Ng2SearchPipeModule } from 'ng2-search-filter' ; // импортирование модуля
import {NgxPaginationModule} from 'ngx-pagination'; // <-- import the module
/*Drag'n'drop.*/
import {DndModule} from 'ng2-dnd';
import {MatListModule} from '@angular/material/list';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTooltipModule} from '@angular/material/tooltip';
/*Charts Data*/
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { DebounceDirective } from './main-content/debounce.directive';
import { AntyDebounceDirective } from './main-content/anty-debounce.directive';
import { TooltipDirective } from 'ng2-tooltip-directive/components';
/* Routing progress. */
import { AdminComponent } from './admin/admin.component';
// for Router import LoadingBarRouterModule:
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
/*Permissions*/
// Import your library
import { NgxPermissionsModule } from 'ngx-permissions';
import {NgxPermissionsGuard} from 'ngx-permissions';
import {AdminGuard} from "./admin.guard";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/merge';
import {MatChipsModule} from '@angular/material/chips';
import {PusherService} from "./pusher.service";
import { Ng2DeviceDetectorModule } from 'ng2-device-detector';
import {PusherMessagesService} from "./main-content/pusher-messages.service";

import {MatSelectModule} from '@angular/material/select';
import {AdminMessagesService} from "./main-content/admin-messages.service";
import {WindowRefService} from "./admin/window-ref.service";
import { VideoCallComponent } from './video-call/video-call.component';
import {VideoService} from "./video-call/video.service";


// определение маршрутов
const appRoutes: Routes =[
    { path: '', component: MainContentComponent, pathMatch:'full', canActivate: [AuthGuard]},
    { path: 'video_chat', component: VideoCallComponent, pathMatch:'full', canActivate: [AuthGuard]},
    { path: 'admin', component: AdminComponent, pathMatch:'full',
        canActivate: [AuthGuard, NgxPermissionsGuard],
        data: {
            roles: {
                only: ['admin bun','admin delete tweet'],
                redirectTo: ''
            }
        }
    },
    { path: 'login', component: AuthRoutesComponent, pathMatch:'full'},
    { path: '**', redirectTo: '/'}
];


@NgModule({
  declarations: [
    AppComponent,
    AuthPageControllerComponent,
    AuthPageRegisterControllerComponent,
    AuthRoutesComponent,
      MainContentComponent,
      DialogOverviewExampleDialog,
      AntyDebounceDirective,
      DebounceDirective,
      DeleteDialog,
      AdminComponent,
      TooltipDirective,
      VideoCallComponent,
      VideoConnection
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    MatButtonModule,
    MatCheckboxModule,
      ReactiveFormsModule,
      MatCardModule,
      MatDialogModule,
      MatTableModule,
      MatInputModule,
      MatSnackBarModule,
      MatIconModule,
      RecaptchaModule.forRoot(),
      MatSelectModule,

      NgxPermissionsModule.forRoot(),
      MatExpansionModule,
      MatMenuModule,
      MatGridListModule,
      MatTableModule,
      Ng2OrderModule,
      Ng2SearchPipeModule,
      MatPaginatorModule,
      NgxPaginationModule,
      MatSortModule,
      DndModule.forRoot(),
      MatListModule,
      MatSlideToggleModule,
      MatTooltipModule,
      Ng2GoogleChartsModule,
      MatProgressBarModule,
      MatChipsModule,
      Ng2DeviceDetectorModule.forRoot(),


      MatToolbarModule,
      MatTabsModule,
      HttpClientModule,
      MalihuScrollbarModule.forRoot(),
      RouterModule.forRoot(appRoutes),
      LoadingBarRouterModule
  ],
  exports: [
    MatButtonModule,
    MatCheckboxModule,
  ],
  providers: [
      {
          provide: RECAPTCHA_SETTINGS,
          useValue: { siteKey: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXX' } as RecaptchaSettings,
      },
      {
          provide: HTTP_INTERCEPTORS,
          useClass: JwtInterceptor,
          multi: true
      },
      {
          provide: HTTP_INTERCEPTORS,
          useClass: TokenInterceptor,
          multi: true
      },
      AuthService,
      AuthGuard,
      AdminGuard,
      AuthenticationService,
      RegisterService,
      MatIconRegistry,
      EventService,
      EventLogoutService,
      CitiesService,
      EventRouteService,
      EventTitleService,
      EventFontService,
      PusherService,
      PusherMessagesService,
      AdminMessagesService,
    //  WindowRefService,
      VideoService

  ],
    entryComponents: [AppComponent,
        DialogOverviewExampleDialog,
        DeleteDialog, VideoConnection],
  bootstrap: [AppComponent],
})
export class AppModule { }
