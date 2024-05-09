import { beforeEach, describe, expect, it } from "vitest";
import { UrlState } from "./UrlState";

const href =
  "https://www.google.com/search?sca_esv=74c740cd3a771c52&sca_upv=1&sxsrf=ADLYWILejntYmNv24qH5TFto9-Qb4zdryQ:1715179802897&q=parts+of+a+url&uds=ADvngMi-zfLdc8ZymLdbjnGOGv5u1fnVMK2SY1ax4Ym8t-sTFhKWG2Avw2T4evh_ibdIdcKgmrvg1oeIdTFN8Nyi-EO0737ObZQHvnvOvRhQ3PXyfmOfs5CDG2M0bbXo7iN_cSvEZjgW6OT8S4KXE8aeWvWil5kH-p87f2QXaCwv-_-3d-O8z82gD0mO3YpdSGel3cWb5s7nzOEUVLyr6DW7p5tACChVyy05N8j7VbEsZXaN1QzIoEvtQl2VoMrj6AC3RZT3C9MG1rVnpYvQ1UAjQT2jyaUM8WeyecB2MbJjck0ZlGEXk9I&udm=2&prmd=ivsnbmz&sa=X&sqi=2&ved=2ahUKEwj6mYLXpv6FAxWPWEEAHTNUDwYQtKgLegQIKhAB&biw=1555&bih=926&dpr=2#imgrc=f_fLwPkE5SKpEM&imgdii=lwAx0AhMdEfb2M";

// beforeEach(() => {
//   window.history.pushState({}, "", href);
// });

describe("UrlState", () => {
  it("should initialize with the correct URL", () => {
    const { url, search } = new UrlState(href);
    expect(url.href).toBe(href);

    // console.log(search.set("q", "test"));
  });

  // it("should update the search state correctly", () => {
  //   const { search } = new UrlState();

  //   expect(search).toBeDefined();
  //   // search.set("key", "value");
  //   // expect(search.get("key")).toBe("value");
  // });

  // it("should update the hash state correctly", () => {
  //   const { hash, url } = new UrlState(href);

  //   hash.set("key", "value");
  //   expect(url.fragment).toBe("key=value");
  // });
});
