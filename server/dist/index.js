"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const roomRoutes_1 = __importDefault(require("./routes/roomRoutes"));
const reservationRoutes_1 = __importDefault(require("./routes/reservationRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const housekeepingRoutes_1 = __importDefault(require("./routes/housekeepingRoutes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const profileRoutes_1 = __importDefault(require("./routes/profileRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const poolRoutes_1 = __importDefault(require("./routes/poolRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const Reservation_1 = __importStar(require("./models/Reservation"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// CORS configuration - Allow all in dev, but could be restricted in prod if desired
// For Render deployment, we can allow the frontend domain
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL || '*'] // We'll add FRONTEND_URL to render.yaml or just allow * for now
        : true,
    credentials: true
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// Serve uploaded files
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// Routes
console.log('[SERVER] Initializing Notification Routes (v3)...');
app.use('/api/notifications', notificationRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/rooms', roomRoutes_1.default);
app.use('/api/reservations', reservationRoutes_1.default);
app.use('/api/bookings', bookingRoutes_1.default);
app.use('/api/housekeeping', housekeepingRoutes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/profile', profileRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/pool', poolRoutes_1.default);
app.use('/api/reports', report_routes_1.default);
// Database connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in the environment variables.');
    process.exit(1);
}
mongoose_1.default.connect(MONGODB_URI)
    .then(() => {
    console.log(' Successfully connected to MongoDB.');
    // Start auto-expiry job after successful connection
    startReservationExpiryJob();
})
    .catch((err) => {
    console.error(' MongoDB connection error:', err);
    process.exit(1);
});
mongoose_1.default.connection.on('error', (err) => {
    console.error(`Mongoose connection error: ${err}`);
});
mongoose_1.default.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});
// Reservation Auto-Expiry Job
const startReservationExpiryJob = () => {
    console.log('Starting Reservation Auto-Expiry Job...');
    // Check every 1 minute
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const now = new Date();
            const result = yield Reservation_1.default.updateMany({
                status: Reservation_1.ReservationStatus.PENDING,
                expiresAt: { $lt: now }
            }, { status: Reservation_1.ReservationStatus.EXPIRED });
            if (result.modifiedCount > 0) {
                console.log(`[AUTO-EXPIRY] Marked ${result.modifiedCount} reservations as expired.`);
            }
        }
        catch (error) {
            console.error('[AUTO-EXPIRY] Error updating expired reservations:', error);
        }
    }), 60 * 1000);
};
app.get('/', (req, res) => {
    res.send('Hotel Management System API is running...');
});
app.listen(PORT, () => {
    console.log(`[SERVER_START] Express server is listening on PORT: ${PORT}`);
});
