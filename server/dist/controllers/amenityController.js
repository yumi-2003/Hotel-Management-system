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
exports.deleteAmenity = exports.updateAmenity = exports.getAmenities = exports.createAmenity = void 0;
const Amenity_1 = __importDefault(require("../models/Amenity"));
const createAmenity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, icon } = req.body;
        const amenity = yield Amenity_1.default.create({ name, icon });
        res.status(201).json(amenity);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating amenity', error });
    }
});
exports.createAmenity = createAmenity;
const getAmenities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const amenities = yield Amenity_1.default.find({ isActive: true });
        res.json(amenities);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching amenities', error });
    }
});
exports.getAmenities = getAmenities;
const updateAmenity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const amenity = yield Amenity_1.default.findByIdAndUpdate(id, req.body, { returnDocument: 'after' });
        if (!amenity) {
            res.status(404).json({ message: 'Amenity not found' });
            return;
        }
        res.json(amenity);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating amenity', error });
    }
});
exports.updateAmenity = updateAmenity;
const deleteAmenity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const amenity = yield Amenity_1.default.findByIdAndUpdate(id, { isActive: false }, { returnDocument: 'after' });
        if (!amenity) {
            res.status(404).json({ message: 'Amenity not found' });
            return;
        }
        res.json({ message: 'Amenity deleted successfully (soft delete)' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting amenity', error });
    }
});
exports.deleteAmenity = deleteAmenity;
