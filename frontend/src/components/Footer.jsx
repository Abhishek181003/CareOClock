// frontend/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200 mt-12">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center mb-4">
                            <div className="bg-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-xl font-bold">C</span>
                            </div>
                            <span className="text-elderly-xl font-bold text-gray-800">CareOClock</span>
                        </div>
                        <p className="text-elderly-base text-gray-600 max-w-md">
                            Empowering elderly individuals and their caregivers with smart medication management
                            and health tracking solutions.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-elderly-lg font-semibold text-gray-800 mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/dashboard" className="text-elderly-base text-gray-600 hover:text-blue-600 transition-colors">
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link to="/medicines" className="text-elderly-base text-gray-600 hover:text-blue-600 transition-colors">
                                    Medicines
                                </Link>
                            </li>
                            <li>
                                <Link to="/health" className="text-elderly-base text-gray-600 hover:text-blue-600 transition-colors">
                                    Health Tracking
                                </Link>
                            </li>
                            <li>
                                <Link to="/calendar" className="text-elderly-base text-gray-600 hover:text-blue-600 transition-colors">
                                    Appointments
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-elderly-lg font-semibold text-gray-800 mb-4">Support</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/about" className="text-elderly-base text-gray-600 hover:text-blue-600 transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-elderly-base text-gray-600 hover:text-blue-600 transition-colors">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link to="/skeletal" className="text-elderly-base text-gray-600 hover:text-blue-600 transition-colors">
                                    Help Center
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-elderly-base text-gray-500">
                            © 2025 CareOClock. All rights reserved.
                        </p>
                        <div className="mt-4 md:mt-0">
                            <p className="text-elderly-base text-gray-500">
                                Made with ❤️ for elderly care
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
