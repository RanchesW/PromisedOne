"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingType = exports.BookingStatus = exports.ExperienceLevel = exports.SessionType = exports.Platform = exports.GameSystem = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["PLAYER"] = "player";
    UserRole["GM_APPLICANT"] = "gm_applicant";
    UserRole["APPROVED_GM"] = "approved_gm";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
var GameSystem;
(function (GameSystem) {
    GameSystem["DND_5E"] = "dnd_5e";
    GameSystem["PATHFINDER_2E"] = "pathfinder_2e";
    GameSystem["CALL_OF_CTHULHU"] = "call_of_cthulhu";
    GameSystem["VAMPIRE_MASQUERADE"] = "vampire_masquerade";
    GameSystem["CYBERPUNK_RED"] = "cyberpunk_red";
    GameSystem["OTHER"] = "other";
})(GameSystem || (exports.GameSystem = GameSystem = {}));
var Platform;
(function (Platform) {
    Platform["ONLINE"] = "online";
    Platform["IN_PERSON"] = "in_person";
    Platform["HYBRID"] = "hybrid";
})(Platform || (exports.Platform = Platform = {}));
var SessionType;
(function (SessionType) {
    SessionType["ONE_SHOT"] = "one_shot";
    SessionType["CAMPAIGN"] = "campaign";
    SessionType["MINI_SERIES"] = "mini_series";
})(SessionType || (exports.SessionType = SessionType = {}));
var ExperienceLevel;
(function (ExperienceLevel) {
    ExperienceLevel["BEGINNER"] = "beginner";
    ExperienceLevel["INTERMEDIATE"] = "intermediate";
    ExperienceLevel["ADVANCED"] = "advanced";
    ExperienceLevel["ALL_LEVELS"] = "all_levels";
})(ExperienceLevel || (exports.ExperienceLevel = ExperienceLevel = {}));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "pending";
    BookingStatus["CONFIRMED"] = "confirmed";
    BookingStatus["CANCELLED"] = "cancelled";
    BookingStatus["COMPLETED"] = "completed";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var BookingType;
(function (BookingType) {
    BookingType["INSTANT"] = "instant";
    BookingType["REQUEST"] = "request";
})(BookingType || (exports.BookingType = BookingType = {}));
//# sourceMappingURL=types.js.map