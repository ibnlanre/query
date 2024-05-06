type QueryStringOptions = {
  decode?: boolean;
  encode?: boolean;
  strict?: boolean;
  sort?: boolean | ((a: string, b: string) => number);
  arrayFormat?:
    | "none"
    | "index"
    | "bracket"
    | "colon-list-separator"
    | "comma"
    | "separator"
    | "bracket-separator";
  arrayFormatSeparator?: string;
  parseNumbers?: boolean;
  parseBooleans?: boolean;
  parseFragmentIdentifier?: boolean;
};

type ParsedQuery = {
  [key: string]: string | string[] | null;
};

type ParsedUrl = {
  url: string;
  query: ParsedQuery;
  fragmentIdentifier?: string;
};

type FilterFunction = (key: string, value: string | string[] | null) => boolean;

declare function parse(
  query: string,
  options?: QueryStringOptions
): ParsedQuery;
declare function stringify(
  query: ParsedQuery,
  options?: QueryStringOptions
): string;
declare function parseUrl(url: string, options?: QueryStringOptions): ParsedUrl;
declare function stringifyUrl(
  urlObject: ParsedUrl,
  options?: QueryStringOptions
): string;
declare function pick(
  input: string,
  filter: FilterFunction | string[],
  options?: QueryStringOptions
): string;
declare function exclude(
  input: string,
  filter: FilterFunction | string[],
  options?: QueryStringOptions
): string;

const isNullOrUndefined = (value: any): boolean =>
  value === null || value === undefined;

const strictUriEncode = (string: string): string =>
  encodeURIComponent(string).replaceAll(
    /[!'()*]/g,
    (x) => `%${x.charCodeAt(0).toString(16).toUpperCase()}`
  );

const encodeFragmentIdentifier = Symbol("encodeFragmentIdentifier");

function encoderForArrayFormat(options: QueryStringOptions) {
  switch (options.arrayFormat) {
    case "index": {
      return (key: string) =>
        (result: string[], value: string | null | undefined) => {
          const index = result.length;

          if (
            value === undefined ||
            (options.skipNull && value === null) ||
            (options.skipEmptyString && value === "")
          ) {
            return result;
          }

          if (value === null) {
            return [
              ...result,
              [encode(key, options), "[", index, "]"].join(""),
            ];
          }

          return [
            ...result,
            [
              encode(key, options),
              "[",
              encode(index.toString(), options),
              "]=",
              encode(value, options),
            ].join(""),
          ];
        };
    }

    case "bracket": {
      return (key: string) =>
        (result: string[], value: string | null | undefined) => {
          if (
            value === undefined ||
            (options.skipNull && value === null) ||
            (options.skipEmptyString && value === "")
          ) {
            return result;
          }

          if (value === null) {
            return [...result, [encode(key, options), "[]"].join("")];
          }

          return [
            ...result,
            [encode(key, options), "[]=", encode(value, options)].join(""),
          ];
        };
    }

    case "colon-list-separator": {
      return (key: string) =>
        (result: string[], value: string | null | undefined) => {
          if (
            value === undefined ||
            (options.skipNull && value === null) ||
            (options.skipEmptyString && value === "")
          ) {
            return result;
          }

          if (value === null) {
            return [...result, [encode(key, options), ":list="].join("")];
          }

          return [
            ...result,
            [encode(key, options), ":list=", encode(value, options)].join(""),
          ];
        };
    }

    case "comma":
    case "separator":
    case "bracket-separator": {
      const keyValueSeparator =
        options.arrayFormat === "bracket-separator" ? "[]=" : "=";

      return (key: string) =>
        (result: string[], value: string | null | undefined) => {
          if (
            value === undefined ||
            (options.skipNull && value === null) ||
            (options.skipEmptyString && value === "")
          ) {
            return result;
          }

          // Translate null to an empty string so that it doesn't serialize as 'null'
          value = value === null ? "" : value;

          if (result.length === 0) {
            return [
              [
                encode(key, options),
                keyValueSeparator,
                encode(value, options),
              ].join(""),
            ];
          }

          return [
            [result, encode(value, options)].join(options.arrayFormatSeparator),
          ];
        };
    }

    default: {
      return (key: string) =>
        (result: string[], value: string | null | undefined) => {
          if (
            value === undefined ||
            (options.skipNull && value === null) ||
            (options.skipEmptyString && value === "")
          ) {
            return result;
          }

          if (value === null) {
            return [...result, encode(key, options)];
          }

          return [
            ...result,
            [encode(key, options), "=", encode(value, options)].join(""),
          ];
        };
    }
  }
}

function parserForArrayFormat(options: QueryStringOptions) {
  let result: RegExpExecArray | null;

  switch (options.arrayFormat) {
    case "index": {
      return (key: string, value: string | null, accumulator: ParsedQuery) => {
        result = /\[(\d*)]$/.exec(key);

        key = key.replace(/\[\d*]$/, "");

        if (!result) {
          accumulator[key] = value;
          return;
        }

        if (accumulator[key] === undefined) {
          accumulator[key] = {};
        }

        accumulator[key][result[1]] = value;
      };
    }

    case "bracket": {
      return (key: string, value: string | null, accumulator: ParsedQuery) => {
        result = /(\[])$/.exec(key);
        key = key.replace(/\[]$/, "");

        if (!result) {
          accumulator[key] = value;
          return;
        }

        if (accumulator[key] === undefined) {
          accumulator[key] = [value];
          return;
        }

        accumulator[key] = [...accumulator[key], value];
      };
    }

    case "colon-list-separator": {
      return (key: string, value: string | null, accumulator: ParsedQuery) => {
        result = /(:list)$/.exec(key);
        key = key.replace(/:list$/, "");

        if (!result) {
          accumulator[key] = value;
          return;
        }

        if (accumulator[key] === undefined) {
          accumulator[key] = [value];
          return;
        }

        accumulator[key] = [...accumulator[key], value];
      };
    }

    case "comma":
    case "separator": {
      return (key: string, value: string | null, accumulator: ParsedQuery) => {
        const isArray =
          typeof value === "string" &&
          value.includes(options.arrayFormatSeparator);
        const isEncodedArray =
          typeof value === "string" &&
          !isArray &&
          decode(value, options).includes(options.arrayFormatSeparator);
        value = isEncodedArray ? decode(value, options) : value;
        const newValue =
          isArray || isEncodedArray
            ? value
                .split(options.arrayFormatSeparator)
                .map((item) => decode(item, options))
            : value === null
            ? value
            : decode(value, options);
        accumulator[key] = newValue;
      };
    }

    case "bracket-separator": {
      return (key: string, value: string | null, accumulator: ParsedQuery) => {
        const isArray = /(\[])$/.test(key);
        key = key.replace(/\[]$/, "");

        if (!isArray) {
          accumulator[key] = value ? decode(value, options) : value;
          return;
        }

        const arrayValue =
          value === null
            ? []
            : value
                .split(options.arrayFormatSeparator)
                .map((item) => decode(item, options));

        if (accumulator[key] === undefined) {
          accumulator[key] = arrayValue;
          return;
        }

        accumulator[key] = [...accumulator[key], ...arrayValue];
      };
    }

    default: {
      return (key: string, value: string | null, accumulator: ParsedQuery) => {
        if (accumulator[key] === undefined) {
          accumulator[key] = value;
          return;
        }

        accumulator[key] = [...[accumulator[key]].flat(), value];
      };
    }
  }
}

function validateArrayFormatSeparator(value: string) {
  if (typeof value !== "string" || value.length !== 1) {
    throw new TypeError("arrayFormatSeparator must be single character string");
  }
}

function encode(value: string, options: QueryStringOptions): string {
  if (options.encode) {
    return options.strict ? strictUriEncode(value) : encodeURIComponent(value);
  }

  return value;
}

function decode(value: string, options: QueryStringOptions): string {
  if (options.decode) {
    return decodeURIComponent(value);
  }

  return value;
}

function keysSorter(input: string[] | Record<string, any>): any[] {
  if (Array.isArray(input)) {
    return input.sort();
  }

  if (typeof input === "object") {
    return keysSorter(Object.keys(input))
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => input[key]);
  }

  return input;
}

function removeHash(input: string): string {
  const hashStart = input.indexOf("#");
  if (hashStart !== -1) {
    input = input.slice(0, hashStart);
  }

  return input;
}

function getHash(url: string): string {
  let hash = "";
  const hashStart = url.indexOf("#");
  if (hashStart !== -1) {
    hash = url.slice(hashStart);
  }

  return hash;
}

function parseValue(value: string, options: QueryStringOptions): any {
  if (
    options.parseNumbers &&
    !Number.isNaN(Number(value)) &&
    typeof value === "string" &&
    value.trim() !== ""
  ) {
    value = Number(value);
  } else if (
    options.parseBooleans &&
    value !== null &&
    (value.toLowerCase() === "true" || value.toLowerCase() === "false")
  ) {
    value = value.toLowerCase() === "true";
  }

  return value;
}

export function extract(input: string): string {
  input = removeHash(input);
  const queryStart = input.indexOf("?");
  if (queryStart === -1) {
    return "";
  }

  return input.slice(queryStart + 1);
}

export function parse(
  query: string,
  options: QueryStringOptions = {}
): ParsedQuery {
  options = {
    decode: true,
    sort: true,
    arrayFormat: "none",
    arrayFormatSeparator: ",",
    parseNumbers: false,
    parseBooleans: false,
    ...options,
  };

  validateArrayFormatSeparator(options.arrayFormatSeparator);

  const formatter = parserForArrayFormat(options);

  // Create an object with no prototype
  const returnValue: ParsedQuery = Object.create(null);

  if (typeof query !== "string") {
    return returnValue;
  }

  query = query.trim().replace(/^[?#&]/, "");

  if (!query) {
    return returnValue;
  }

  for (const parameter of query.split("&")) {
    if (parameter === "") {
      continue;
    }

    const parameter_ = options.decode
      ? parameter.replaceAll("+", " ")
      : parameter;

    let [key, value] = splitOnFirst(parameter_, "=");

    if (key === undefined) {
      key = parameter_;
    }

    // Missing `=` should be `null`:
    // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
    value =
      value === undefined
        ? null
        : ["comma", "separator", "bracket-separator"].includes(
            options.arrayFormat
          )
        ? value
        : decode(value, options);
    formatter(decode(key, options), value, returnValue);
  }

  for (const [key, value] of Object.entries(returnValue)) {
    if (typeof value === "object" && value !== null) {
      for (const [key2, value2] of Object.entries(value)) {
        value[key2] = parseValue(value2, options);
      }
    } else {
      returnValue[key] = parseValue(value, options);
    }
  }

  if (options.sort === false) {
    return returnValue;
  }

  // TODO: Remove the use of `reduce`.
  // eslint-disable-next-line unicorn/no-array-reduce
  return (
    options.sort === true
      ? Object.keys(returnValue).sort()
      : Object.keys(returnValue).sort(options.sort)
  ).reduce((result, key) => {
    const value = returnValue[key];
    result[key] =
      Boolean(value) && typeof value === "object" && !Array.isArray(value)
        ? keysSorter(value)
        : value;
    return result;
  }, Object.create(null));
}

export function stringify(
  query: ParsedQuery,
  options: QueryStringOptions = {}
): string {
  if (!query) {
    return "";
  }

  options = {
    encode: true,
    strict: true,
    arrayFormat: "none",
    arrayFormatSeparator: ",",
    ...options,
  };

  validateArrayFormatSeparator(options.arrayFormatSeparator);

  const shouldFilter = (key: string) =>
    (options.skipNull && isNullOrUndefined(query[key])) ||
    (options.skipEmptyString && query[key] === "");

  const formatter = encoderForArrayFormat(options);

  const queryCopy: ParsedQuery = {};

  for (const [key, value] of Object.entries(query)) {
    if (!shouldFilter(key)) {
      queryCopy[key] = value;
    }
  }

  const keys = Object.keys(queryCopy);

  if (options.sort !== false) {
    keys.sort(options.sort);
  }

  return keys
    .map((key) => {
      const value = queryCopy[key];

      if (value === undefined) {
        return "";
      }

      if (value === null) {
        return encode(key, options);
      }

      if (Array.isArray(value)) {
        if (value.length === 0 && options.arrayFormat === "bracket-separator") {
          return encode(key, options) + "[]";
        }

        return value.reduce(formatter(key), []).join("&");
      }

      return encode(key, options) + "=" + encode(value, options);
    })
    .filter((x) => x.length > 0)
    .join("&");
}

export function parseUrl(
  url: string,
  options: QueryStringOptions = {}
): ParsedUrl {
  options = {
    decode: true,
    ...options,
  };

  let [url_, hash] = splitOnFirst(url, "#");

  if (url_ === undefined) {
    url_ = url;
  }

  return {
    url: url_?.split("?")?.[0] ?? "",
    query: parse(extract(url), options),
    ...(options && options.parseFragmentIdentifier && hash
      ? { fragmentIdentifier: decode(hash, options) }
      : {}),
  };
}

export function stringifyUrl(
  urlObject: ParsedUrl,
  options: QueryStringOptions = {}
): string {
  options = {
    encode: true,
    strict: true,
    [encodeFragmentIdentifier]: true,
    ...options,
  };

  const url = removeHash(urlObject.url).split("?")[0] || "";
  const queryFromUrl = extract(urlObject.url);

  const query = {
    ...parse(queryFromUrl, { sort: false }),
    ...urlObject.query,
  };

  let queryString = stringify(query, options);
  queryString &&= `?${queryString}`;

  let hash = getHash(urlObject.url);
  if (typeof urlObject.fragmentIdentifier === "string") {
    const urlObjectForFragmentEncode = new URL(url);
    urlObjectForFragmentEncode.hash = urlObject.fragmentIdentifier;
    hash = options[encodeFragmentIdentifier]
      ? urlObjectForFragmentEncode.hash
      : `#${urlObject.fragmentIdentifier}`;
  }

  return `${url}${queryString}${hash}`;
}

export function pick(
  input: string,
  filter: FilterFunction | string[],
  options: QueryStringOptions = {}
): string {
  options = {
    parseFragmentIdentifier: true,
    [encodeFragmentIdentifier]: false,
    ...options,
  };

  const { url, query, fragmentIdentifier } = parseUrl(input, options);

  return stringifyUrl(
    {
      url,
      query: includeKeys(query, filter),
      fragmentIdentifier,
    },
    options
  );
}

export function exclude(
  input: string,
  filter: FilterFunction | string[],
  options: QueryStringOptions = {}
): string {
  const exclusionFilter = Array.isArray(filter)
    ? (key) => !filter.includes(key)
    : (key, value) => !filter(key, value);

  return pick(input, exclusionFilter, options);
}
