import {Directive, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {Subject} from "rxjs/Subject";
import {debounceTime} from "rxjs/operators";
import {Subscription} from "rxjs/Subscription";
import {AuthService} from "../auth.service";

@Directive({
  selector: '[appDebounce]'
})
export class DebounceDirective implements OnInit {
  @Input() debounceTime = 500;
  @Output() debounceEnter = new EventEmitter();
  private enters = new Subject();
    private subscription: Subscription;
  constructor(protected auth: AuthService) {}

    ngOnInit() {
        this.subscription = this.enters.pipe(
            debounceTime(this.debounceTime)
        ).subscribe(e => this.debounceEnter.emit(e));
    }

    ngOnDestroy() {
       // if(this.auth.isAuthenticated()&&(!!this.enters))
        this.subscription.unsubscribe();
    }

    @HostListener('input', ['$event'])
    inputEvent(event) {
        event.preventDefault();
        event.stopPropagation();
        this.enters.next(event);
    }

}


