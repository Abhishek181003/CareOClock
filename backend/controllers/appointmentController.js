const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const { catchAsync, sendSuccess } = require('../middleware/errorMiddleware');

const createAppointment = catchAsync(async (req, res) => {
    let { patientId, doctorId, ...rest } = req.body;

    // Handle placeholders
    if (patientId === 'current-user') {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        patientId = req.user.id;
    }

    if (doctorId === 'default-doctor') {
        doctorId = req.user.id;
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return res.status(400).json({ success: false, message: 'Invalid patientId' });
    }
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        return res.status(400).json({ success: false, message: 'Invalid doctorId' });
    }

    const appointmentData = {
        patientId: new mongoose.Types.ObjectId(patientId),
        doctorId: new mongoose.Types.ObjectId(doctorId),
        ...rest,
    };

    const appointment = await Appointment.create(appointmentData);
    sendSuccess(res, 201, 'Appointment created successfully', { appointment });
});

const getAppointments = catchAsync(async (req, res) => {
    const userId = req.user._id;
    const role = req.user.role;
    const appointments = await Appointment.getUpcoming(userId, role, 30);
    sendSuccess(res, 200, 'Appointments retrieved successfully', { appointments });
});

const updateAppointment = catchAsync(async (req, res) => {
    const updateData = { ...req.body };

    // Handle placeholders
    if (updateData.patientId === 'current-user') {
        updateData.patientId = req.user.id || req.user._id.toString();
    }
    if (updateData.doctorId === 'current-user') {
        updateData.doctorId = req.user.id || req.user._id.toString();
    }

    // Validate and convert IDs
    if (updateData.patientId) {
        if (!mongoose.Types.ObjectId.isValid(updateData.patientId)) {
            return res.status(400).json({ success: false, message: 'Invalid patientId' });
        }
        updateData.patientId = new mongoose.Types.ObjectId(updateData.patientId);
    }
    if (updateData.doctorId) {
        if (!mongoose.Types.ObjectId.isValid(updateData.doctorId)) {
            return res.status(400).json({ success: false, message: 'Invalid doctorId' });
        }
        updateData.doctorId = new mongoose.Types.ObjectId(updateData.doctorId);
    }

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    sendSuccess(res, 200, 'Appointment updated successfully', { appointment });
});

const deleteAppointment = catchAsync(async (req, res) => {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    sendSuccess(res, 200, 'Appointment deleted successfully');
});

module.exports = { createAppointment, getAppointments, updateAppointment, deleteAppointment };
