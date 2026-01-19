"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCustomId = void 0;
const counters_model_1 = __importDefault(require("../../Models/counters-model"));
const generateCustomId = async (collectionName, prefix) => {
    const counter = await counters_model_1.default.findOneAndUpdate({ _id: collectionName }, { $inc: { sequence: 1 } }, { upsert: true, new: true });
    return `${prefix}${counter.sequence}`;
};
exports.generateCustomId = generateCustomId;
//# sourceMappingURL=id-generator.js.map