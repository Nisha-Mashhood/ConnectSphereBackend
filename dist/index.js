"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const db_config_1 = __importDefault(require("./config/db-config"));
const env_config_1 = __importDefault(require("./config/env-config"));
const auth_routes_1 = __importDefault(require("./Routes/Routes/auth-routes"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const notification_scheduler_1 = require("./core/utils/notification-scheduler");
const logger_1 = __importDefault(require("./core/utils/logger"));
const category_routes_1 = __importDefault(require("./Routes/Routes/category-routes"));
const sub_category_routes_1 = __importDefault(require("./Routes/Routes/sub-category-routes"));
const skills_routes_1 = __importDefault(require("./Routes/Routes/skills-routes"));
const mentor_routes_1 = __importDefault(require("./Routes/Routes/mentor-routes"));
const collaboration_routes_1 = __importDefault(require("./Routes/Routes/collaboration-routes"));
const group_routes_1 = __importDefault(require("./Routes/Routes/group-routes"));
const feedback_routes_1 = __importDefault(require("./Routes/Routes/feedback-routes"));
const user_collaboration_routes_1 = __importDefault(require("./Routes/Routes/user-collaboration-routes"));
const task_routes_1 = __importDefault(require("./Routes/Routes/task-routes"));
const notification_routes_1 = __importDefault(require("./Routes/Routes/notification-routes"));
const admin_dashboard_routes_1 = __importDefault(require("./Routes/Routes/admin-dashboard-routes"));
const chat_routes_1 = __importDefault(require("./Routes/Routes/chat-routes"));
const contact_routes_1 = __importDefault(require("./Routes/Routes/contact-routes"));
const review_routes_1 = __importDefault(require("./Routes/Routes/review-routes"));
const contact_us_routes_1 = __importDefault(require("./Routes/Routes/contact-us-routes"));
const call_routes_1 = __importDefault(require("./Routes/Routes/call-routes"));
const error_handler_middleware_1 = require("./middlewares/error-handler-middleware");
const container_1 = __importDefault(require("./container"));
const PORT = Number(env_config_1.default.port) || 3000;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Connect to DB and run cleanup
const startServer = async () => {
    if (!env_config_1.default.mongoURI) {
        logger_1.default.warn("MongoDB URI not found. Skipping DB connection.");
    }
    else {
        await (0, db_config_1.default)();
    }
    // Middleware
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.use((0, cors_1.default)({
        origin: env_config_1.default.frontendurl || "http://localhost:8089",
        credentials: true,
    }));
    // Routes
    app.use("/api/auth", auth_routes_1.default);
    app.use("/api/category", category_routes_1.default);
    app.use("/api/subcategory", sub_category_routes_1.default);
    app.use("/api/skills", skills_routes_1.default);
    app.use("/api/mentors", mentor_routes_1.default);
    app.use("/api/collaboration", collaboration_routes_1.default);
    app.use("/api/group", group_routes_1.default);
    app.use("/api/feedback", feedback_routes_1.default);
    app.use("/api/user-userCollab", user_collaboration_routes_1.default);
    app.use("/api/task", task_routes_1.default);
    app.use("/api/notification", notification_routes_1.default);
    app.use("/api/admin", admin_dashboard_routes_1.default);
    app.use("/api/chat", chat_routes_1.default);
    app.use("/api/contacts", contact_routes_1.default);
    app.use("/api/reviews", review_routes_1.default);
    app.use("/api/contactUs", contact_us_routes_1.default);
    app.use("/api/callLog", call_routes_1.default);
    // Placeholder route
    app.get("/", (_req, res) => {
        res.send("Connect Sphere Backend is running!");
    });
    app.use(error_handler_middleware_1.errorHandler);
    // Initialize Socket.IO
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: env_config_1.default.frontendurl || "http://localhost:8089",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });
    const socketService = container_1.default.get('ISocketService');
    socketService.initialize(io);
    // Schedule Node cron tasks
    const cleanupScheduler = new notification_scheduler_1.CleanupScheduler();
    cleanupScheduler.start();
    // Start server
    server.listen(PORT, '0.0.0.0', () => {
        logger_1.default.info(`Server running on port ${PORT}`);
    });
};
// Start the server
startServer();
//# sourceMappingURL=index.js.map