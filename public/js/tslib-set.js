/*
 * For some reason ts.js creates all its functions in the global ns,
 * whereas rollup expects them to be in a tslib 'module' in the global ns.
 * Hence this file that corrects the mess.
 */
var tslib = {
    __extends: __extends,
    __assign: __assign,
    __rest: __rest,
    __decorate: __decorate,
    __param: __param,
    __metadata: __metadata,
    __awaiter: __awaiter,
    __generator: __generator,
    __exportStar: __exportStar,
    __values: __values,
    __read: __read,
    __spread: __spread,
    __asyncGenerator: __asyncGenerator,
    __asyncDelegator: __asyncDelegator,
    __asyncValues: __asyncValues
};
window.tslib = tslib;
