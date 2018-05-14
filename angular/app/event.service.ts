import {EventEmitter, Injectable} from '@angular/core';

@Injectable()
export class EventService {
    public result$: EventEmitter<string>;
  constructor() {
      this.result$ = new EventEmitter<string>();
  }

  public getSignal(text: string){
      this.result$.emit(text/*'Server error: code 401.'*/);
  }
}



@Injectable()
export class EventLogoutService {
    public true$: EventEmitter<boolean>;
    constructor() {
        this.true$ = new EventEmitter<boolean>();
    }

    public getSignal(indicate: boolean){
        this.true$.emit(indicate);
    }
}


@Injectable()
export class EventRouteService {
    public path$: EventEmitter<string>;
    constructor() {
        this.path$ = new EventEmitter<string>();
    }

    public getSignal(url: string){
        this.path$.emit(url);
    }
}


@Injectable()
export class EventTitleService {
    public title$: EventEmitter<string>;
    constructor() {
        this.title$ = new EventEmitter<string>();
    }

    public getSignal(login: string){
        this.title$.emit(login);
    }
}


@Injectable()
export class EventFontService {
    public indicate$: EventEmitter<boolean>;
    constructor() {
        this.indicate$ = new EventEmitter<boolean>();
    }

    public getSignal(event: boolean){
        this.indicate$.emit(event);
    }
}

