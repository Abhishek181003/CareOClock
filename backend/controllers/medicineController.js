const mongoose = require('mongoose');
const Medicine = require('../models/Medicine');
const { catchAsync, sendSuccess } = require('../middleware/errorMiddleware');

const getMedicines = catchAsync(async (req, res) => {
    const userId = req.params.userId || req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: 'Invalid userId' });
    }

    const medicines = await Medicine.find({ userId: new mongoose.Types.ObjectId(userId), isActive: true })
        .populate('prescribedBy', 'name professionalInfo.specialty')
        .sort({ createdAt: -1 });

    sendSuccess(res, 200, 'Medicines retrieved successfully', medicines);
});

const createMedicine = catchAsync(async (req, res) => {
    const medicineData = { ...req.body, userId: req.params.userId || req.user._id };
    const medicine = await Medicine.create(medicineData);
    sendSuccess(res, 201, 'Medicine added successfully', medicine);
});

const updateMedicine = catchAsync(async (req, res) => {
    const medicine = await Medicine.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!medicine) {
        return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    sendSuccess(res, 200, 'Medicine updated successfully', medicine);
});

const deleteMedicine = catchAsync(async (req, res) => {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) {
        return res.status(404).json({ success: false, message: 'Medicine not found' });
    }
    sendSuccess(res, 200, 'Medicine deleted successfully');
});

const getLowStockMedicines = catchAsync(async (req, res) => {
    const userId = req.params.userId || req.user._id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: 'Invalid userId' });
    }

    // Use aggregation for comparing stock to lowStockAlert virtual is not possible (because virtuals are not stored in Mongo).
    // So approximate by querying stock <= lowStockAlert number, or adjust logic if needed.
    const medicines = await Medicine.find({
        userId: new mongoose.Types.ObjectId(userId),
        isActive: true,
        stock: { $lte: 7 }, // Could customize lowStockAlert threshold by querying medicines
    });

    sendSuccess(res, 200, 'Low stock medicines retrieved', medicines);
});

module.exports = {
    getMedicines,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    getLowStockMedicines,
};
