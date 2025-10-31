// backend/controllers/userController.js
const User = require('../models/User');
const { catchAsync, AppError } = require('../middleware/errorMiddleware');

exports.getUserById = catchAsync(async (req, res, next) => {
    const userId = req.params.id;

    // Validate ObjectId format
    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
        return next(new AppError('Invalid user ID', 400));
    }

    const user = await User.findById(userId).select('-password -__v');
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: { user },
        timestamp: new Date().toISOString(),
    });
});
