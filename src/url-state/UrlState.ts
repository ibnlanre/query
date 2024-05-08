import { isDefined, type Nullish } from "../guards";
import type {
  Replacer,
  Reviver,
  UrlStateProviderConfiguration,
} from "../url-state-provider";

type Arbitrary = string | (string & {});
export class UrlState<QueryKey extends Arbitrary> {
  private params: URLSearchParams;
  private context: UrlStateProviderConfiguration;

  constructor(context: UrlStateProviderConfiguration) {
    this.params = new URLSearchParams(self.location.search);
    this.context = context;
  }

  private encode = <Value>(value: Value, replacer?: Replacer) => {
    try {
      const stringified = this.context.stringify(value, replacer);
      return encodeURIComponent(stringified);
    } catch (error) {
      console.error(error);
    }
  };

  private decode = <Value>(value: string, reviver?: Reviver) => {
    try {
      const decoded = this.context.decode(value);
      return this.context.parse(decoded, reviver) as Value;
    } catch (error) {
      console.error(error);
      return undefined as Value;
    }
  };

  private datetime = (value: string) => {
    return new Date(value).toISOString();
  };

  private timestamp = (value: string) => {
    return new Date(value).getTime();
  };

  private parse = <Value>(value: string) => {
    return this.context.parse<Value>(value, this.context.reviver);
  };

  private resolve = <Value>(
    key: string,
    transformer: (value: string) => Value,
    fallback?: Value
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
    encode: <Value>(key: QueryKey, value: Value) => {
      this.setValue(key, this.encode(value));
    },
    stringify: <Value>(key: QueryKey, value: Value) => {
      this.setValue(key, this.context.stringify(value, this.context.replacer));
    },
  };

  private getValue = (key: QueryKey, fallback?: string) => {
    return this.resolve(key, (value) => value, fallback);
  };

  private getters = {
    parse: <Value>(key: QueryKey, fallback?: Value) => {
      return this.resolve<Value>(key, this.parse, fallback);
    },
    decode: <Value>(key: QueryKey, fallback?: Value) => {
      return this.resolve<Value>(key, this.decode, fallback);
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
