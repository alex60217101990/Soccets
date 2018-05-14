import {AfterViewInit, Component, Inject, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CitiesService, MessageElement, Online} from './cities.service';
import {EventFontService, EventRouteService} from '../event.service';
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/interval";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material";
import {AuthService} from "../auth.service";
import {Subscription} from "rxjs/Subscription";
import {headersToString} from "selenium-webdriver/http";
import {Router} from "@angular/router";
import {Message, PusherMessagesService} from "./pusher-messages.service";
import {PusherService, UserOne} from "../pusher.service";
import {NgxPermissionsService} from "ngx-permissions";
import {AdminMessagesService} from "./admin-messages.service";
import * as RecordRTC from 'recordrtc';

import {trigger, transition, useAnimation, state, animate, style, keyframes} from '@angular/animations';
import { bounce, bounceInLeft, zoomInLeft } from 'ng-animate';
import {FormControl} from "@angular/forms";
import {WindowRefService} from "../admin/window-ref.service";
import {Ng2DeviceService} from "ng2-device-detector";
//import Rx from "rxjs/Rx";

declare var Pusher: any;

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.scss'],
    providers:[WindowRefService],
    animations: [
        trigger('my_anim',[
              transition('show <=> hide', animate('1000ms', keyframes([
                  style({opacity: 0, transform: 'translateX(-100%)', offset: 0}),
                  style({opacity: 0.5, transform: 'translateX(-50%)',  offset: 0.5}),
                  style({opacity: 1, transform: 'translateX(0%)', offset: 1.0})
              ]))),
        ])
]
})
export class MainContentComponent implements OnInit, OnDestroy, AfterViewInit {

    private pusher: any;
    protected Messages: Observable<Message[]>;
    protected users: Observable<UserOne[]>;

    public message: string;
    protected clock;
    protected User;
    protected indicate:boolean = false;

    public show: boolean=true;
    private customColor: string;
    private messColors=['#2196F3','#9C27B0','#E91E63','#F44336','#03A9F4','#FF9800'];
    get color(){
        return this.customColor;
    }
    protected state: string = 'show';
    UserControll: string;
    test(){
        console.log(this.UserControll);
        this.openVideoChat();
    }

    protected channel: any;

    /**
     * @constructor
     * @param {CitiesService} data
     * @param {EventRouteService} url
     */
  constructor(private data: CitiesService, private url: EventRouteService,
              public dialog: MatDialog, public auth: AuthService,
              public authEvent: PusherService, public route: Router,
              protected mess_serevice: PusherMessagesService,
              protected permissionsService: NgxPermissionsService,
              protected admin_mess: AdminMessagesService){
        /* Server event new parse ad. */
        this.User = JSON.parse(localStorage.getItem('user_data'));

        this.Messages = this.mess_serevice.messages;
        this.mess_serevice.loadAll();
        this.users = this.authEvent.users;
        this.authEvent.loadAll();

        this.admin_mess.loadAll(JSON.parse(localStorage.getItem('user_data'))['email']);

        this.pusher = this.mess_serevice.pusher;
        this.channel = this.mess_serevice.closeChannel;

        this.url.getSignal('/');
        this.customColor = this.messColors[Math.floor(Math.random()*this.messColors.length)];
  }


    ngAfterViewInit() {}



    animateMe() {
      this.state = (this.state === 'show' ? 'hide' : 'show');
    }

  ngOnInit(){
      this.clock = Observable
          .interval(60000)
          .map(()=> new Date());

  }

    ngOnDestroy() {
        this.data.ngOnDestroy();
        console.log('Service destroy');
    }


    start(){
      console.log('click');
      this.data.connect(!!this.message?this.message:'');
      this.message = '';
    }

    deleteMess(index: number, type: boolean, el: any){
      if (!type) {
          this.openDialog(index);
          console.log(el);
      }
        this.mess_serevice.remove(index);
    }


    openDialog(id: number): void {
        let dialogRef = this.dialog.open(DeleteDialog, {
            width: '250px',
            data: { id: id }
        });

        dialogRef.afterClosed().subscribe(result => {
                this.data.deleteOne(result);
        });
    }

    valueWasChange():void {
      this.indicate = true;
    }

    typing(command:boolean):void{
        this.channel.trigger('client-enter', { enter: command, user: this.User['login'] })
    }

    navigate(){
       this.route.navigate(['/login']);
    }

    adminMess(){
        this.show=!this.show;
        this.admin_mess.viewedMess();
    }

    deleteAdminMessage(id: number){
      this.admin_mess.remove(id);
    }

}



@Component({
    selector: 'delete-dialog',
    templateUrl: 'delete-dialog.html',
})
export class DeleteDialog {

    constructor(
        public dialogRef: MatDialogRef<DeleteDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

}




@Component({
    selector: 'dialog-video-chat',
    templateUrl: 'dialog-video-chat.html',
    providers: [WindowRefService]
})
export class VideoConnection implements AfterViewInit{

 //   private stream: MediaStream;
    private recordRTC: any;
    @ViewChild('video1') video1: any;
    @ViewChild('video2') video2: any;

    protected channel: any;
    protected window: any;


    public video_1:HTMLVideoElement;
    public video_2:HTMLVideoElement;
    protected usersOnline;
    protected id;
    protected users = [];
    protected sessionDesc;
    protected currentcaller;
    protected room;
    protected caller;
    protected localUserMedia;
    public userCallControll: string|number;

    private pusher = new Pusher('XXXXXXXXXXXXXXXXX', {
        cluster: 'eu',
        encrypted: true,
        authEndpoint: '/content/authVideo',
        auth: {
            headers: {
                Authorization: `Bearer ${this.auth.getToken()}`
            }
        }
    });
    private chat_channel = this.pusher.subscribe('presence-videocall');

    constructor(
        public dialogRef: MatDialogRef<VideoConnection>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private auth: AuthService,
        private winRef: WindowRefService,
        private deviceService: Ng2DeviceService) {
        this.window = this.winRef.nativeWindow;

        this.chat_channel.bind("pusher:subscription_succeeded", members => {
            //set the member count
            this.usersOnline = members.count;
            this.id = this.chat_channel.members.me.id;
            members.each(member => {
                if (member.id != this.chat_channel.members.me.id) {
                    this.users.push({id: member.id, name: member.info.name});
                }
            });
        });

        this.chat_channel.bind("pusher:member_added", member => {
            if(this.users.indexOf({id: member.id, name: member.info.name})==-1) return;
            else{
                this.users.push({id: member.id, name: member.info.name});
                console.log('add success');
            }
        });

        this.chat_channel.bind("pusher:member_removed", member => {
            this.users.map(el=>{
                if(el.id===member.id){
                    this.users.splice(this.users.indexOf(el), 1);
                    console.log('delete success');
                }
            });
            // for remove member from list:
            if (member.id == this.room) {
                this.endCall();
            }
        });
        this.chat_channel.bind("client-candidate", (msg)=>{
            if(msg.room==this.room){
                console.log("candidate received");
                this.caller.addIceCandidate(new RTCIceCandidate(msg.candidate));
            }
        });

        this.chat_channel.bind("client-sdp", (msg)=>{
            if(msg.room == this.id){
                let answer = confirm("You have a call from: "+ msg.from + "Would you like to answer?");
                if(!answer){
                    return this.chat_channel.trigger("client-reject", {"room": msg.room, "rejected":this.id});
                }
                this.room = msg.room;
                this.getCam()
                    .then(stream => {
                        this.localUserMedia = stream;
                        this.toggleEndCallButton();
                        if (this.window.URL) {
                            this.video_2.src = this.window.URL.createObjectURL(stream);
                        }
                        // } else {
                        //     this.video_2.src = stream;
                        // }
                        this.caller.addStream(stream);
                        let sessionDesc = new RTCSessionDescription(msg.sdp);
                        this.caller.setRemoteDescription(sessionDesc);
                        console.log('test');
                        this.caller.createAnswer().then((sdp)=>{
                            this.caller.setLocalDescription(new RTCSessionDescription(sdp));
                            this.chat_channel.trigger("client-answer", {
                                "sdp": sdp,
                                "room": this.room
                            });
                        });

                    })
                    .catch(error => {
                        console.log('an error occured', error);
                    })
            }
        });

        this.chat_channel.bind("client-answer", (answer)=>{
            if (answer.room == this.room) {
                console.log("answer received");
                this.caller.setRemoteDescription(new RTCSessionDescription(answer.sdp));
            }
        });

        this.chat_channel.bind("client-reject", (answer)=>{
            if (answer.room == this.room) {
                console.log("Call declined");
                alert("call to " + answer.rejected + "was politely declined");
                this.endCall();
            }
        });
        this.GetRTCPeerConnection();
        this.GetRTCSessionDescription();
        this.GetRTCIceCandidate();
        this.prepareCaller();
    }

    GetRTCIceCandidate() {
        this.window.RTCIceCandidate =
            this.window.RTCIceCandidate ||
            this.window.webkitRTCIceCandidate ||
            this.window.mozRTCIceCandidate ||
            this.window.msRTCIceCandidate;

        return this.window.RTCIceCandidate;
    }

    GetRTCPeerConnection() {
        this.window.RTCPeerConnection =
            this.window.RTCPeerConnection ||
            this.window.webkitRTCPeerConnection ||
            this.window.mozRTCPeerConnection ||
            this.window.msRTCPeerConnection;
        return this.window.RTCPeerConnection;
    }

    GetRTCSessionDescription() {
        this.window.RTCSessionDescription =
            this.window.RTCSessionDescription ||
            this.window.webkitRTCSessionDescription ||
            this.window.mozRTCSessionDescription ||
            this.window.msRTCSessionDescription;
        return this.window.RTCSessionDescription;
    }

    prepareCaller() {
        //Initializing a peer connection
        this.caller = new this.window.RTCPeerConnection();
        //Listen for ICE Candidates and send them to remote peers
        this.caller.onicecandidate = (evt)=>{
            if (!evt.candidate) return;
            console.log("onicecandidate called");
            this.onIceCandidate(this.caller, evt);
        };
        //onaddstream handler to receive remote feed and show in remoteview video element
       // if(this.deviceService.browser==='chrome') {
            this.caller.onaddstream = (evt) => {
                console.log("onaddstream called");
                if (this.window.URL) {
                    try {
                        this.video_1.srcObject = evt.stream;
                        console.log("11111111");
                    } catch (error) {
                        this.video_1.src = URL.createObjectURL(evt.stream);
                    }
                } else {
                    this.video_1.src = evt.stream;
                }
            };
    }

    onIceCandidate(peer, evt) {
        if (evt.candidate) {
            this.chat_channel.trigger("client-candidate", {
                "candidate": evt.candidate,
                "room": this.room
            });
        }
    }

    getCam() {
        let mediaConstraints:MediaStreamConstraints = {
            video: {
                width: { min: 300, ideal: 700, max: 1920 },
                height: { min: 150, ideal: 500, max: 1080 }
            }, audio: true
        }
        return navigator.mediaDevices.getUserMedia(mediaConstraints);
    }

    callUser(user) {
        console.log(user);
        this.getCam()
            .then(stream => {
                if (this.window.URL) {
                    try {
                        this.video_2.srcObject = stream;
                    } catch (error) {
                        this.video_2.src = URL.createObjectURL(stream);
                    }
                }
                this.toggleEndCallButton();
                this.caller.addStream(stream);
                this.localUserMedia = stream;
                this.caller.createOffer().then((desc)=>{
                    this.caller.setLocalDescription(new RTCSessionDescription(desc));
                    this.chat_channel.trigger("client-sdp", {
                        sdp: desc,
                        room: user.id,
                        from: this.id
                    });
                    this.room = user;
                });
            })
            .catch(error => {
                console.log("an error occured", error);
            });
        console.log(user);
    }
    public toogle: boolean=true;
    toggleEndCallButton() {
        this.toogle=!this.toogle;
    }
    endCall() {
        this.room = undefined;
        this.caller.close();
        for (let track of this.localUserMedia.getTracks()) {
            track.stop();
        }
        this.prepareCaller();
        this.toggleEndCallButton();
    }

    ngAfterViewInit() {
        // set the initial state of the video
        this.video_1 = this.video1.nativeElement;
        this.video_2 = this.video2.nativeElement;
    }

    onNoClick(): void {
        this.dialogRef.close();
    }


}