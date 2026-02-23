"use strict";
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
exports.deleteRoomType = exports.updateRoomType = exports.getRoomTypeById = exports.getRoomTypes = exports.createRoomType = void 0;
const RoomType_1 = __importDefault(require("../models/RoomType"));
const Room_1 = __importDefault(require("../models/Room"));
const createRoomType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = Object.assign({}, req.body);
        // Handle amenities array from FormData
        if (req.body['amenities[]']) {
            data.amenities = Array.isArray(req.body['amenities[]'])
                ? req.body['amenities[]']
                : [req.body['amenities[]']];
            delete data['amenities[]'];
        }
        const images = [];
        // Add existing images if any (from URL list)
        if (req.body.images) {
            try {
                if (typeof req.body.images === 'string') {
                    const parsedImages = JSON.parse(req.body.images);
                    const existing = Array.isArray(parsedImages) ? parsedImages : [parsedImages];
                    // Filter out empty objects (which fail casting to string)
                    images.push(...existing.filter((img) => typeof img === 'string' && img.trim() !== ''));
                }
                else {
                    const existing = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
                    images.push(...existing.filter((img) => typeof img === 'string' && img.trim() !== ''));
                }
            }
            catch (e) {
                const existing = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
                images.push(...existing.filter((img) => typeof img === 'string' && img.trim() !== ''));
            }
        }
        // Add newly uploaded images from Cloudinary
        if (req.files && Array.isArray(req.files)) {
            const newImages = req.files.map(file => file.path);
            images.push(...newImages);
        }
        data.images = images;
        const roomType = yield RoomType_1.default.create(data);
        res.status(201).json(roomType);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating room type', error });
    }
});
exports.createRoomType = createRoomType;
const getRoomTypes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const minPrice = parseInt(req.query.minPrice);
        const maxPrice = parseInt(req.query.maxPrice);
        const adults = parseInt(req.query.adults);
        const children = parseInt(req.query.children);
        const amenities = req.query.amenities; // Comma separated string of IDs
        const query = { isActive: true };
        if (search) {
            query.$or = [
                { typeName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (!isNaN(minPrice) || !isNaN(maxPrice)) {
            query.basePrice = {};
            if (!isNaN(minPrice))
                query.basePrice.$gte = minPrice;
            if (!isNaN(maxPrice))
                query.basePrice.$lte = maxPrice;
        }
        if (!isNaN(adults))
            query.maxAdults = { $gte: adults };
        if (!isNaN(children))
            query.maxChildren = { $gte: children };
        if (amenities) {
            const amenityIds = amenities.split(',');
            query.amenities = { $all: amenityIds };
        }
        const [roomTypes, total] = yield Promise.all([
            RoomType_1.default.find(query)
                .populate('amenities')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            RoomType_1.default.countDocuments(query)
        ]);
        // Add availability breakdown
        const roomTypesWithAvailability = yield Promise.all(roomTypes.map((rt) => __awaiter(void 0, void 0, void 0, function* () {
            const rooms = yield Room_1.default.find({ roomTypeId: rt._id });
            const availability = {
                total: rooms.length,
                available: rooms.filter((r) => r.status === 'available').length,
                reserved: rooms.filter((r) => r.status === 'reserved').length,
                occupied: rooms.filter((r) => r.status === 'occupied').length,
                maintenance: rooms.filter((r) => r.status === 'maintenance').length,
            };
            return Object.assign(Object.assign({}, rt.toObject()), { availability });
        })));
        res.json({
            roomTypes: roomTypesWithAvailability,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching room types', error });
    }
});
exports.getRoomTypes = getRoomTypes;
const getRoomTypeById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const roomType = yield RoomType_1.default.findById(id).populate('amenities');
        if (!roomType) {
            res.status(404).json({ message: 'Room type not found' });
            return;
        }
        const rooms = yield Room_1.default.find({ roomTypeId: id });
        const availability = {
            total: rooms.length,
            available: rooms.filter((r) => r.status === 'available').length,
            reserved: rooms.filter((r) => r.status === 'reserved').length,
            occupied: rooms.filter((r) => r.status === 'occupied').length,
            maintenance: rooms.filter((r) => r.status === 'maintenance').length,
        };
        res.json(Object.assign(Object.assign({}, roomType.toObject()), { availability }));
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching room type details', error });
    }
});
exports.getRoomTypeById = getRoomTypeById;
const updateRoomType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const data = Object.assign({}, req.body);
        // Handle amenities array from FormData
        if (req.body['amenities[]']) {
            data.amenities = Array.isArray(req.body['amenities[]'])
                ? req.body['amenities[]']
                : [req.body['amenities[]']];
            delete data['amenities[]'];
        }
        else {
            // If amenities[] is not present in FormData during a PUT request, it means empty array
            data.amenities = [];
        }
        const images = [];
        // Handle existing images passed back from frontend
        if (req.body['existingImages[]']) {
            const existing = Array.isArray(req.body['existingImages[]'])
                ? req.body['existingImages[]']
                : [req.body['existingImages[]']];
            images.push(...existing);
            delete data['existingImages[]'];
        }
        // Add newly uploaded images
        if (req.files && Array.isArray(req.files)) {
            const newImages = req.files.map(file => file.path);
            images.push(...newImages);
        }
        // If we have any images (new or existing), update the images field
        if (images.length > 0) {
            data.images = images;
        }
        else if (req.body.images) {
            // If no new/existing images parsed above, but 'images' field exists in body (might be stringified or simple array)
            try {
                if (typeof req.body.images === 'string') {
                    // It could be a stringified array like '["url1", "url2"]' or '[{}]'
                    const parsedImages = JSON.parse(req.body.images);
                    const arr = Array.isArray(parsedImages) ? parsedImages : [parsedImages];
                    data.images = arr.filter((img) => typeof img === 'string' && img.trim() !== '');
                }
                else {
                    const arr = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
                    data.images = arr.filter((img) => typeof img === 'string' && img.trim() !== '');
                }
            }
            catch (e) {
                // If parsing fails, just use it as is (Mongoose will cast if possible)
                const arr = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
                data.images = arr.filter((img) => typeof img === 'string' && img.trim() !== '');
            }
        }
        else {
            // If no images provided at all, set to empty array
            data.images = [];
        }
        const roomType = yield RoomType_1.default.findByIdAndUpdate(id, data, { returnDocument: 'after' });
        if (!roomType) {
            res.status(404).json({ message: 'Room type not found' });
            return;
        }
        res.json(roomType);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating room type', error });
    }
});
exports.updateRoomType = updateRoomType;
const deleteRoomType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // We'll do a soft delete by setting isActive to false
        const roomType = yield RoomType_1.default.findByIdAndUpdate(id, { isActive: false }, { returnDocument: 'after' });
        if (!roomType) {
            res.status(404).json({ message: 'Room type not found' });
            return;
        }
        res.json({ message: 'Room type deleted successfully (soft delete)' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting room type', error });
    }
});
exports.deleteRoomType = deleteRoomType;
