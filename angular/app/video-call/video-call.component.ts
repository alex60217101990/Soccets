import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {User, VideoService} from "./video.service";
import {WindowRefService} from "../admin/window-ref.service";

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss'],
    providers: [WindowRefService]
})
export class VideoCallComponent implements OnInit, AfterViewInit {

    @ViewChild('video1') video1: any;
    @ViewChild('video2') video2: any;
    protected video_1:HTMLVideoElement;
    protected video_2:HTMLVideoElement;

    protected usersOnline: any;
    protected id: any;
    protected Users = [];
    protected sessionDesc: any;
    protected currentcaller: any;
    protected room: any;
    protected caller: any;
    protected localUserMedia: any;
    protected window: any;
    protected selectUser: any;

    protected STUN_config: any = {
        "iceServers": [{ "urls": ["stun:stun.stunprotocol.org:3478"] }]
    };

  constructor(protected users: VideoService,
              private winRef: WindowRefService) {

      this.id = JSON.parse(localStorage.getItem('user_data'))['email'];
      this.users.event$.subscribe(event=>{
          console.log(event);
          if (event['id'] == this.room) {
              this.endCall();
          }
      });
      this.users.ConnectChannel.bind('client-candidate',(msg)=>{
          if(msg.room==this.room) {
              console.log("candidate received");
              this.caller.addIceCandidate(new this.window.RTCIceCandidate(msg.candidate));
          }
      });

      this.users.ConnectChannel.bind('client-sdp', (msg) => {
          console.log(msg.room);
          console.log(this.id);
          if(msg.room == this.id){
              let answer = confirm("You have a call from: "+ msg.from + "Would you like to answer?");
              if(!answer){
                  return this.users.ConnectChannel.trigger("client-reject", {
                      room: msg.room,
                      rejected: this.id
                  });
              }
              this.room = msg.room;
              this.getCam()
                  .then(stream => {
                      this.localUserMedia = stream;
                      this.toggleEndCallButton();
                      if (this.window.URL) {
                          try {
                              this.video_2.srcObject = stream;
                          } catch (error) {
                              this.video_2.src = URL.createObjectURL(stream);
                          }
                      } else {
                          this.video_2.srcObject = stream;
                      }
                      this.caller.addStream(stream);
                      let sessionDesc = new this.window.RTCSessionDescription(msg.sdp);
                      this.caller.setRemoteDescription(sessionDesc);
                      this.caller.createAnswer().then((sdp)=>{
                          this.caller.setLocalDescription(new this.window.RTCSessionDescription(sdp));
                          return this.users.ConnectChannel.trigger("client-answer", {
                              room: this.room,
                              sdp: sdp
                          });
                      });

                  })
                  .catch(error => {
                      console.log('an error occured', error);
                  })
          }
      });
      this.users.ConnectChannel.bind('client-answer',(answer)=>{
          if (answer.room == this.room) {
              console.log("answer received");
              this.caller.setRemoteDescription(new this.window.RTCSessionDescription(answer.sdp));
          }
      });
      this.users.ConnectChannel.bind('client-reject',(answer)=>{
          if (answer.room == this.room) {
              console.log("Call declined");
              alert("call to " + answer.rejected + "was politely declined");
              this.endCall();
          }
      });
      this.users.ConnectChannel.bind("client-endcall", (answer)=>{
          if (answer.room == this.room) {
              console.log("Call Ended");
              this.endCall();
          }
      });

      this.users.ConnectChannel.bind('client-test',(data)=>{
          console.log(data.text);
      });
  }

  ngOnInit() {}

    SellectUser(user: User){
        this.selectUser = user;
    }

    hasUserMedia() {
        return !!navigator.getUserMedia;
    }

    getCam() {
        //Get local audio/video feed and show it in selfview video element
        return this.window.navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
    }

    callUser() {
      let user = this.selectUser;
        this.getCam()
            .then(stream => {
                if (this.window.URL) {
                    try {
                        this.video_2.srcObject = stream;
                    } catch (error) {
                        this.video_2.src = URL.createObjectURL(stream);
                    }
                } else {
                    this.video_2.srcObject = stream;
                }
                this.toggleEndCallButton();
                this.caller.addStream(stream);
                this.localUserMedia = stream;
                this.caller.createOffer(this.setSdpConstraints()).then((desc)=>{
                    this.caller.setLocalDescription(new this.window.RTCSessionDescription(desc));
                    this.users.ConnectChannel.trigger("client-sdp", {
                        sdp: desc,
                        room: user.email,
                        from: this.id
                    });
                    this.room = user.email;
                });
            })
            .catch(error => {
                console.log("an error occured", error);
            });
    }
    protected toogle: boolean = true;
    toggleEndCallButton() {
        this.toogle = !this.toogle;
    }

    ngAfterViewInit() {
        // set the initial state of the video
        this.window = this.winRef.nativeWindow;
        this.video_1  = this.video1.nativeElement;
        this.video_1.muted = false;
        this.video_1.controls = true;
        this.video_1.autoplay = false;

        this.video_2  = this.video2.nativeElement;
        this.video_2.muted = false;
        this.video_2.controls = true;
        this.video_2.autoplay = false;
        this.GetUserMedia();
        this.GetRTCIceCandidate();
        this.GetRTCPeerConnection();
        this.GetRTCSessionDescription();
        this.prepareCaller();
    }

    toggleControls() {
        this.video_1.muted = !this.video_1.muted;
        this.video_1.controls = !this.video_1.controls;
        this.video_1.autoplay = !this.video_1.autoplay;
    }
    toggleControls1() {
        this.video_2.muted = !this.video_2.muted;
        this.video_2.controls = !this.video_2.controls;
        this.video_2.autoplay = !this.video_2.autoplay;
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
        this.caller.onaddstream = (evt)=>{
            console.log("onaddstream called");
            if (this.window.URL) {
                try {
                    this.video_1.srcObject = evt.stream;
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
            this.users.ConnectChannel.trigger("client-candidate", {
                candidate: evt.candidate,
                room: this.room
            });
        }
    }

        testEvent(){
        this.users.ConnectChannel.trigger("client-test", {
            text: 'fkbgbkglylhy'
        });
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
    endCurrentCall() {
        this.users.ConnectChannel.trigger("client-endcall", {
            room: this.room
        });
        this.endCall();
    }

    setSdpConstraints() {
        return {  offerToReceiveAudio: 1,
                  offerToReceiveVideo: 1 }
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
    GetRTCIceCandidate() {
        this.window.RTCIceCandidate =
            this.window.RTCIceCandidate ||
            this.window.webkitRTCIceCandidate ||
            this.window.mozRTCIceCandidate ||
            this.window.msRTCIceCandidate;
        return this.window.RTCIceCandidate;
    }
    GetUserMedia(){
        this.window.navigator.getUserMedia =
            this.window.navigator.getUserMedia ||
            this.window.navigator.webkitGetUserMedia ||
            this.window.navigator.mozGetUserMedia ||
            this.window.navigator.msGetUserMedia;
        return this.window.navigator.getUserMedia;
    }
}
