import {Directive, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {Subject} from "rxjs/Subject";
import {Subscription} from "rxjs/Subscription";
import {debounceTime} from "rxjs/operators";
import {AuthService} from "../auth.service";

@Directive({
  selector: '[appAntyDebounce]'
})
export class AntyDebounceDirective {
    @Input() debounceStartTime = 1;
    @Output() debounceEnterStart = new EventEmitter();
    private enters = new Subject();
    private subscription: Subscription;
    constructor(protected auth: AuthService) {}

    ngOnInit() {
        this.subscription = this.enters.pipe(
            debounceTime(this.debounceStartTime)
        ).subscribe(e => this.debounceEnterStart.emit(e));

    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    @HostListener('input', ['$event'])
    inputEvent(event) {
        event.preventDefault();
        event.stopPropagation();
        this.enters.next(event);
    }
}
