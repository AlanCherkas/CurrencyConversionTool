import { OnDestroy } from "@angular/core";
import { Subject } from "rxjs";

export type Constructor<T = {}> = new (...args: any[]) => T;

export const autoUnsubscribeMixin = <T extends Constructor>(
  base: T = class {} as T
) =>
  class extends base implements OnDestroy {
    $destroy = new Subject<void>();

    ngOnDestroy(): void {
      this.$destroy.next();
      this.$destroy.unsubscribe();
    }
  };
