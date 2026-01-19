"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_config_1 = __importDefault(require("./env-config"));
const logger_1 = __importDefault(require("../core/utils/logger"));
const connectDB = async () => {
    try {
        const mongoUri = env_config_1.default.mongoURI;
        if (!mongoUri) {
            throw new Error("MongoDB URI is not defined.");
        }
        const conn = await mongoose_1.default.connect(mongoUri);
        logger_1.default.info(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        logger_1.default.error(`Error connecting to MongoDB: ${error}`);
        process.exit(1); // Exit with failure
    }
};
exports.default = connectDB;
//# sourceMappingURL=db-config.js.map