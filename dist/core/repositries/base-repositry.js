"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const error_handler_1 = require("../utils/error-handler");
const error_messages_1 = require("../../constants/error-messages");
// Base class for Basic DataBase Operations
class BaseRepository {
    // Constructor for Initializing the Model
    constructor(model) {
        // Create a new entity
        this.create = async (data, session) => {
            try {
                const entity = new this.model(data);
                const result = session
                    ? await entity.save({ session })
                    : await entity.save();
                logger_1.default.info(`Created entity in ${this.model.modelName}: ${result._id}`);
                return result;
            }
            catch (error) {
                logger_1.default.error(`Error creating entity in ${this.model.modelName}: ${error.message}`);
                throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_CREATE_ENTITY} in ${this.model.modelName}`);
            }
        };
        // Find an entity by ID
        this.findById = async (id) => {
            try {
                const result = await this.model.findById(id).exec();
                logger_1.default.debug(`Found entity in ${this.model.modelName} by ID: ${id}`);
                return result;
            }
            catch (error) {
                logger_1.default.error(`Error finding entity in ${this.model.modelName} by ID ${id}: ${error.message}`);
                throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_FIND_ENTITY_BY_ID} ${id} in ${this.model.modelName}`);
            }
        };
        // Find one entity matching the query
        this.findOne = async (query) => {
            try {
                const result = await this.model.findOne(query).exec();
                logger_1.default.debug(`Found entity in ${this.model.modelName} with query: ${JSON.stringify(query)}`);
                return result;
            }
            catch (error) {
                logger_1.default.error(`Error finding entity in ${this.model.modelName} with query ${JSON.stringify(query)}: ${error.message}`);
                throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_FIND_ENTITY} in ${this.model.modelName}`);
            }
        };
        // Find all entities
        this.findAll = async () => {
            try {
                const result = await this.model.find().exec();
                logger_1.default.debug(`Retrieved ${result.length} entities from ${this.model.modelName}`);
                return result;
            }
            catch (error) {
                logger_1.default.error(`Error retrieving entities from ${this.model.modelName}: ${error.message}`);
                throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_RETRIEVE_ENTITIES} from ${this.model.modelName}`);
            }
        };
        // Update an entity by ID
        this.update = async (id, data, session) => {
            try {
                const result = await this.model
                    .findByIdAndUpdate(id, data, { new: true, session })
                    .exec();
                logger_1.default.info(`Updated entity in ${this.model.modelName}: ${id}`);
                return result;
            }
            catch (error) {
                logger_1.default.error(`Error updating entity in ${this.model.modelName} with ID ${id}: ${error.message}`);
                throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_UPDATE_ENTITY} with ID ${id} in ${this.model.modelName}`);
            }
        };
        // Delete an entity by ID
        this.delete = async (id, session) => {
            try {
                const result = await this.model
                    .findByIdAndDelete(id, { session })
                    .exec();
                logger_1.default.info(`Deleted entity in ${this.model.modelName}: ${id}`);
                return !!result;
            }
            catch (error) {
                logger_1.default.error(`Error deleting entity in ${this.model.modelName} with ID ${id}: ${error.message}`);
                throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_DELETE_ENTITY} with ID ${id} in ${this.model.modelName}`);
            }
        };
        // Update an entity by ID
        this.findByIdAndUpdate = async (id, update, options = { new: true }, session) => {
            try {
                const result = await this.model
                    .findByIdAndUpdate(id, update, { ...options, session })
                    .exec();
                logger_1.default.info(`Updated entity in ${this.model.modelName} with ID ${id}`);
                return result;
            }
            catch (error) {
                logger_1.default.error(`Error updating entity in ${this.model.modelName} with ID ${id}: ${error.message}`);
                throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_UPDATE_ENTITY} with ID ${id} in ${this.model.modelName}`);
            }
        };
        // Delete an entity by ID
        this.findByIdAndDelete = async (id, session) => {
            try {
                const result = await this.model
                    .findByIdAndDelete(id, { session })
                    .exec();
                logger_1.default.info(`Deleted entity in ${this.model.modelName}: ${id}`);
                return result;
            }
            catch (error) {
                logger_1.default.error(`Error deleting entity in ${this.model.modelName} with ID ${id}: ${error.message}`);
                throw new error_handler_1.RepositoryError(`${error_messages_1.ERROR_MESSAGES.FAILED_TO_DELETE_ENTITY} with ID ${id} in ${this.model.modelName}`);
            }
        };
        this.model = model;
        logger_1.default.debug(`Initialized repository for model: ${model.modelName}`);
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=base-repositry.js.map