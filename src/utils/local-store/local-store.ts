import { Subject } from 'rxjs';

const localStore = new Map<string, LocalStore<any>>();

type StoreValue<T> = {
  key: string;
  value: T;
  pending: boolean;
  updatedAt: Date;
  createdAt: Date;
  hasError: boolean;
  error?: any;
};

type LocalStoreOptions<T> = {
  storeName: string;
  fn: (value: string) => Promise<T>;
  maxStoreSize?: number;
  valueTimeout?: number;
};

export class LocalStore<T> {
  /*
  local store for caching data for this specified store
  */
  private readonly store: Map<string, StoreValue<T>> = new Map<string, StoreValue<T>>();

  /*
  create subject for creating new value for this store key
  */
  private readonly create = new Subject<string>();

  /*
  listener for getting value for this store key, so that when a new value is created, it will be
  emitted to this listener and the value will be updated in the store and subscribers will be notified
  */
  private readonly listener: Subject<{
    key: string;
    value: StoreValue<T>;
  }>;

  /*
  current size of the store
  */
  private currentSize = 0;

  /*
  flag to check if the store is checking size
  */
  private isCheckingSize = false;

  private constructor(private readonly props: LocalStoreOptions<T>) {
    // set default value for maxStoreSize if not provided
    if (!props.maxStoreSize) props.maxStoreSize = 10000;

    // initialize listener
    this.listener = new Subject();

    // set this store to the global local store
    localStore.set(this.props.storeName, this);

    // create listener for creating new value for this store key
    this.create.subscribe(async (key) => {
      const existing = this.store.get(key);

      /*
      checking if the value is already being fetched, if so, then return
      */
      if (existing && existing.pending) return;

      /*
      changing the value to pending and updating the store
      */
      this.store.set(key, {
        key: key,
        value: null,
        pending: true,
        hasError: false,
        updatedAt: new Date(),
        createdAt: new Date(),
      });
      if (!existing) this.currentSize++;

      let response: StoreValue<T>;

      try {
        const value = await this.props.fn(key);
        response = {
          key: key,
          value: value,
          pending: false,
          hasError: false,
          updatedAt: new Date(),
          createdAt: new Date(),
        };
      } catch (error) {
        response = {
          key: key,
          value: null,
          pending: false,
          hasError: true,
          error: error,
          updatedAt: new Date(),
          createdAt: new Date(),
        };
      }

      this.store.set(key, response);
      this.listener.next({
        key: key,
        value: response,
      });

      this.checkSize();
    });
  }

  private checkSize() {
    if (this.currentSize < this.props.maxStoreSize) return;
    if (this.isCheckingSize) return;

    this.isCheckingSize = true;

    const toBeRemovedCount = Math.ceil(this.props.maxStoreSize * 0.2);

    const list = Array.from(this.store.values())
      .filter((v) => !v.pending)
      .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
    const nonErrors = list.filter((x) => !x.hasError);
    const errors = list.filter((x) => x.hasError);

    if (errors.length > toBeRemovedCount) {
      errors.slice(0, toBeRemovedCount).forEach((x) => this.store.delete(x.key));
      this.currentSize -= toBeRemovedCount;
      return;
    }

    for (let i = 0; i < errors.length; i++) {
      const res = this.store.delete(errors[i].key);
      if (res) this.currentSize--;
    }

    const remaining = toBeRemovedCount - errors.length;
    const removeLength = remaining > nonErrors.length ? nonErrors.length : remaining;

    for (let i = 0; i < removeLength; i++) {
      const res = this.store.delete(list[i].key);
      if (res) this.currentSize--;
    }

    this.isCheckingSize = false;
  }

  async get(key: string) {
    const existing = this.store.get(key);
    if (existing && !existing.pending && !existing.hasError) {
      return existing.value;
    }

    this.create.next(key);
    return new Promise<T>((resolve, reject) => {
      this.listener.subscribe((res) => {
        if (res.key !== key) return;

        if (res.value.hasError) {
          reject(res.value.error);
          return;
        }

        resolve(res.value.value);
      });
    });
  }

  set(key: string, value: T) {
    this.store.set(key, {
      key: key,
      value: value,
      pending: false,
      hasError: false,
      updatedAt: new Date(),
      createdAt: new Date(),
    });
  }

  remove(key: string | string[]) {
    if (Array.isArray(key)) {
      for (let i = 0; i < key.length; i++) {
        this.delete(key[i]);
      }
      return;
    }

    this.delete(key);
  }

  private delete(key: string) {
    const res = this.store.delete(key);
    if (res) this.currentSize--;
  }

  static get<T>(storeName: string) {
    return localStore.get(storeName) as LocalStore<T>;
  }

  static create<T>(props: LocalStoreOptions<T>) {
    return new LocalStore<T>(props);
  }
}
