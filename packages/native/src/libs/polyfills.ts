// String.prototype.startsWith polyfill for older browsers
declare global {
  interface String {
    startsWith(search: string, pos?: number): boolean;
  }
}

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (
    search: string,
    pos?: number,
  ): boolean {
    return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
  };
}

export default {};
