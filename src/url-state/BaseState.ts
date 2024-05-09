export class BaseState {
  /**
   * @param url - URL object
   *
   * @description This method works as follows:
   * - It stores the URL object.
   * - The URL object is used to extract the query parameters from the URL.
   * - The URL object is used to extract the hostname from the URL.
   */
  private url: URL;

  /**
   * @param hostname - Hostname array
   *
   * @description This method works as follows:
   * - It stores the hostname as an array of value.
   * - It is used to extract the subdomain from the URL.
   * - It is used to extract the domain from the URL.
   * - It is used to extract the top-level domain from the URL.
   */
  private hostname: string[];

  constructor(url: URL) {
    this.hostname = url.hostname.split(".");
    this.url = url;
  }

  /**
   * Returns the query parameters of the URL as a string.
   *
   * @access public
   * @returns {string} The query parameters of the URL as a string.
   */
  public get scheme() {
    return this.url.protocol.slice(0, -1);
  }

  /**
   * Returns the hostname of the URL.
   *
   * @access public
   * @returns {string} The hostname of the URL.
   */
  public get host() {
    return this.url.hostname;
  }

  /**
   * Returns the subdomain of the URL.
   *
   * @access public
   * @returns {string[]} The subdomain of the URL.
   */
  public get subdomain() {
    return this.hostname.slice(0, -2);
  }

  /**
   * Returns the domain of the URL.
   *
   * @access public
   * @returns {string} The domain of the URL.
   */
  public get domain() {
    return this.hostname.at(-2)!;
  }

  /**
   * Returns the top-level domain of the URL.
   *
   * @access public
   * @returns {string} The top-level domain of the URL.
   */
  public get tld() {
    return this.hostname.at(-1)!;
  }

  /**
   * Returns the port of the URL.
   *
   * @access public
   * @returns {string} The port of the URL.
   */
  public get port() {
    return this.url.port;
  }

  /**
   * Returns the path of the URL.
   *
   * @access public
   * @returns {string} The path of the URL.
   */
  public get path() {
    return this.url.pathname;
  }

  /**
   * Returns the origin of the URL.
   *
   * @access public
   * @returns {string} The origin of the URL.
   */
  public get origin() {
    return this.url.origin;
  }

  /**
   * Returns the fragment of the URL.
   *
   * @access public
   * @returns {string} The fragment of the URL.
   */
  public get fragment() {
    return this.url.hash.slice(1);
  }

  /**
   * Returns the query parameters of the URL.
   *
   * @access public
   * @returns {string} The query parameters of the URL.
   */
  public get query() {
    return this.url.search;
  }

  /**
   * Returns the URL as a string.
   *
   * @access public
   * @returns {string} The URL as a string.
   */
  public get href() {
    return this.url.href;
  }

  /**
   * Returns the path of the URL as an array of directories.
   *
   * @access public
   * @returns {string[]} The path of the URL as an array of directories.
   */
  public get directories() {
    return this.url.pathname.split("/").filter(Boolean);
  }
}
