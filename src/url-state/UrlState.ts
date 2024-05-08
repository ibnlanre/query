import type {
  Replacer,
  Reviver,
  UrlStateProviderConfiguration,
} from "../url-state-provider";

type Empty = "";
function isEmpty(value: unknown): value is Empty {
  return value === "";
}

type Nullish = null | undefined;
function isNullish(value: unknown): value is Nullish {
  return value === null || value === undefined;
}

function isDefined<T>(value: T | Empty | Nullish): value is T {
  return !isEmpty(value) && !isNullish(value);
}

type Arbitrary = string | (string & {});
export class UrlState<QueryKey extends Arbitrary> {
  private params: URLSearchParams;
  private context: UrlStateProviderConfiguration;

  constructor(context: UrlStateProviderConfiguration) {
    this.params = new URLSearchParams(self.location.search);
    this.context = context;
  }

  private encode = <T>(value: T, replacer?: Replacer) => {
    try {
      const stringified = this.context.stringify(value, replacer);
      return encodeURIComponent(stringified);
    } catch (error) {
      console.error(error);
    }
  };

  private decode = <T>(value: string, reviver?: Reviver) => {
    try {
      const decoded = this.context.decode(value);
      return this.context.parse(decoded, reviver) as T;
    } catch (error) {
      console.error(error);
      return undefined as T;
    }
  };

  private datetime = (value: string) => {
    return new Date(value).toISOString();
  };

  private timestamp = (value: string) => {
    return new Date(value).getTime();
  };

  private parse = <T>(value: string) => {
    return this.context.parse<T>(value, this.context.reviver);
  };

  private resolve = <T>(
    key: string,
    transformer: (value: string) => T,
    fallback?: T
  ) => {
    const value = this.params.getAll(key);
    return value.length
      ? value.map(transformer).filter(isDefined)
      : [fallback].filter(isDefined);
  };

  private setValue = (key: QueryKey, value: string | Nullish, push = true) => {
    if (isDefined(value)) {
      this.params.append(key, value);
      if (push) this.context.push(this.value);
    }
  };

  private setters = {
    record: (query: Partial<Record<QueryKey, string | Nullish>>) => {
      for (const key in query) this.setValue(key, query[key], false);
      this.context.push(this.value);
    },
    encode: <T>(key: QueryKey, value: T) => {
      this.setValue(key, this.encode(value));
    },
    stringify: <T>(key: QueryKey, value: T) => {
      this.setValue(key, this.context.stringify(value, this.context.replacer));
    },
  };

  private getValue = (key: QueryKey, fallback?: string) => {
    return this.resolve(key, (value) => value, fallback);
  };

  private getters = {
    parse: <T>(key: QueryKey, fallback?: T) => {
      return this.resolve<T>(key, this.parse, fallback);
    },
    decode: <T>(key: QueryKey, fallback?: T) => {
      return this.resolve<T>(key, this.decode, fallback);
    },
    number: (key: QueryKey, fallback?: number) => {
      return this.resolve(key, Number, fallback);
    },
    datetime: (key: QueryKey, fallback?: string) => {
      return this.resolve(key, this.datetime, fallback);
    },
    timestamp: (key: QueryKey, fallback?: number) => {
      return this.resolve(key, this.timestamp, fallback);
    },
    boolean: (key: QueryKey, fallback?: boolean) => {
      return this.resolve(key, Boolean, fallback);
    },
  };

  public get value() {
    return this.params.toString();
  }

  public get entries() {
    return Object.fromEntries(this.params.entries());
  }

  public remove = (key: QueryKey) => {
    this.params.delete(key);
    this.context.push(this.value);
  };

  public set = Object.assign(this.setValue, this.setters);
  public get = Object.assign(this.getValue, this.getters);
  public has = (key: QueryKey) => this.params.has(key);
}
