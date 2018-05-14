import {AfterViewInit, Component, ElementRef, HostListener, Inject, OnDestroy, ViewChild} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {MatSnackBar} from '@angular/material';
declare var jquery:any;
declare var $ :any;
import {MatIconRegistry} from '@angular/material';
import 'rxjs/add/operator/map';
import {MalihuScrollbarService} from 'ngx-malihu-scrollbar/dist/lib';
import {AuthenticationService} from './authentication.service';
import {EventFontService, EventLogoutService, EventRouteService, EventService, EventTitleService} from './event.service';


import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {AuthService} from './auth.service';
import {ActivatedRoute, NavigationEnd, NavigationStart, Router, RouterEvent} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/filter';
import {DomSanitizer} from '@angular/platform-browser';
import {NgxPermissionsService} from "ngx-permissions";
import * as Rx from "rxjs/Rx";
//import "rxjs/operator/";
declare var Pusher: any;


interface ActivePage{
    url: string;
    indicate: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  title: string = 'Welcome to Anvel!';
  public id_of_route: number = 0;
  private end_navigation: string = '';

  public toogleClass: Array<ActivePage> = new Array<ActivePage>();

  activation: boolean;
  className: Array<string>;
    public scrollbarOptions = { axis: 'yx', theme: 'minimal-dark' };


    constructor(private http: HttpClient, private scrollbarService: MalihuScrollbarService,
               private authService: AuthenticationService, public snackBar: MatSnackBar,
                private provider: EventService, public dialog: MatDialog, private auth: AuthService,
                private toogle$: EventLogoutService, private router: Router,
                private routeEvent$: EventRouteService, private title$: EventTitleService,
                iconRegistry: MatIconRegistry, sanitizer: DomSanitizer,
                iconRegistry1: MatIconRegistry, private event$: EventFontService,
                protected permissionsService: NgxPermissionsService) {
        this.className = new Array<string>();
        this.className.push("md-dialog-container");
        authService.message$.subscribe(message => this.onGetMessage(message));
        provider.result$.subscribe(message => {/*this.onGetMessage(message);*/ this.openDialog(message); this.activation = true;});

        (auth.isAuthenticated()!==true) ? this.activation = true : this.activation = false;
        toogle$.true$.subscribe(toogle$ => this.activation = toogle$);

        // Подписываемся на события изменеия маршрута.
        router.events.filter(e => e instanceof RouterEvent).subscribe(e => {
            this.id_of_route = e['url'];
        });
        router.events.filter(e=> e instanceof NavigationEnd).subscribe(e=>{
            this.end_navigation = e['urlAfterRedirects'];
        });

        routeEvent$.path$.subscribe(url => this.isActiveMethod(url));
        event$.indicate$.subscribe(event => {this.back = event;});
            this.toogleClass.push({url: '/', indicate: true});
            this.toogleClass.push({url: '/other', indicate: true});
            this.toogleClass.push({url: '/users-list', indicate: true});


        //регистрируем SVG изображение.
        iconRegistry.addSvgIcon(
            'home-passive',
            sanitizer.bypassSecurityTrustResourceUrl('../img/home.svg'));
        iconRegistry1.addSvgIcon(
            'home-active',
            sanitizer.bypassSecurityTrustResourceUrl('../img/home-active.svg'));

        /* Permissions load. */
        router.events
            .filter(e => e instanceof NavigationEnd)
            .subscribe(e => {
                this.permissionsService.flushPermissions();
                this.loadPermission();
            });
        this.loadPermission();
    };

    /**
     * Permissions load method.
     */
    loadPermission():void{
        if(this.auth.isAuthenticated()) {
            this.authService.loadPermissions().subscribe(permissions => {
                this.permissionsService.loadPermissions(permissions);
               // console.log(permissions);
            });
        }
    }

    /**
     * Method for update button class.
     * @return void
     * @param {string} path
     */
    private isActiveMethod(path: string):void{
        for(let p of this.toogleClass){
            if(p.url === path) {
                p.indicate = false;
            }else{ p.indicate = true; }
        }
    }


    /*----------------------------------------------------------------------------------------------*/
    /**
     * Open dialog method.
     * @param {string} message
     */
    openDialog(message: string): void {
        let dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
            width: '50%',
           // panelClass: this.className,
            data: { title: 'Error message.', text: message }
        });

        dialogRef.afterClosed().subscribe(result => {
           //
        });
    }
    /*-----------------------------------------------------------------------------------------------*/

    resolved(captchaResponse: string) {
        console.log(`Resolved captcha with response ${captchaResponse}:`);
    }


    /**
     * Обработчик события сервиса, срабатывает на выход из системы.
     * @return void
     * @param {string} text
     */
    private onGetMessage(text: string): void {
        // do something with added item
        this.ShowLogoutResultMessage(text,'exit');
    }

    /**
     * Material snack bar info message.
     * @param string, string
     * @return void
     */
    private ShowLogoutResultMessage(message: string, action: string) {
        this.snackBar.open(message, action, {
            duration: 5000,
            extraClasses: this.className
        });
    }

    /**
     * Method route to "Main page" component content.
     * @param void
     * @return void
     */
    public MainPageLink():void{
        this.router.navigate(['']);
    }


    ngOnInit(): void {
        this.title$.title$.subscribe((text:string)=>{
            this.title = text;
        });
        if(localStorage.getItem('user_data')!==null)
            this.title = JSON.parse(localStorage.getItem('user_data')).login;
    }

    /**
     * Indicator of Menu class
     * @type {boolean}
     */
    public Small: boolean = false;
    /**
     * Indicator of Buttons color class
     * @type {boolean | boolean}
     */
    public topp: boolean = (window.pageXOffset>600)?true:false;
    public topp1: boolean = true;
    public back: boolean;

    /**
     * Logout Method.
     * @param void
     * @return {boolean}
     */
    public onLogout(): boolean {
        this.authService.logout();
        return false;
    }

    /**
     * Custom scroll activate Method
     * @param void
     * @return void
     */
    ngAfterViewInit() {
      //  this.scrollbarService.initScrollbar('.content', { axis: 'y', theme: 'dark', scrollButtons: { enable: true },setLeft: "-40px" });
        this.scrollbarService.initScrollbar(document.body, { axis: 'y', theme: 'minimal-dark', scrollButtons: { enable: false },
            setLeft: "15px", autoHideScrollbar: true });
    }

    /**
     * "System's event's".
     * Event of window resize.
     * @param $event
     */
    @HostListener('window:resize', ['$event']) onResizeEvent($event){
        //const horizontalOffset = window.pageXOffset||0;
        if($event.target.innerWidth < 700 ){
            ($event.target.innerWidth < 600)?this.topp = false:this.topp = true;
            ($event.target.innerWidth > 600 && $event.target.innerWidth < 700)?this.topp1 = true:this.topp1 = false;
            this.Small = true;
        }else {this.Small = false;}
    }
    @HostListener('window:click', ['$event']) toogleSendvich($event){
       // this.toogleSendvichClass();
    }

    ngOnDestroy(){
        this.permissionsService.flushPermissions();
        this.provider.result$.unsubscribe();
        this.authService.message$.unsubscribe();
        this.toogle$.true$.unsubscribe();
        this.routeEvent$.path$.unsubscribe();
        this.event$.indicate$.unsubscribe();
        this.title$.title$.unsubscribe();
    }

}



@Component({
    selector: 'dialog-overview-example-dialog',
    templateUrl: 'dialog-overview-example-dialog.html',
    styleUrls: ['./app.component.scss']
})
export class DialogOverviewExampleDialog {

    constructor(public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
                @Inject(MAT_DIALOG_DATA) public data: any, private http: HttpClient) {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    resolved(captchaResponse: string) {
        console.log(`Resolved captcha with response ${captchaResponse}:`);
    }


}