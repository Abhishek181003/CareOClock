// frontend/src/pages/CaregiverDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { alertApi } from '../api/alertApi';
import { intakeApi } from '../api/intakeApi';
import SkeletonLoader from '../components/SkeletonLoader';
import ChartComponent from '../components/ChartComponent';
import { useNavigate } from 'react-router-dom';

const CaregiverDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [alerts, setAlerts] = useState([]);
    const [patientStats, setPatientStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch alerts for all assigned patients
            const alertsRes = await alertApi.getAlerts();
            setAlerts(alertsRes.data.alerts || []);

            // In a real implementation, you would fetch stats for each assigned patient
            // For now, we'll use mock data
            setPatientStats([
                { id: 'patient1', name: 'Margaret Johnson', adherence: 78, alerts: 2, status: 'needs-attention' },
                { id: 'patient2', name: 'Robert Chen', adherence: 92, alerts: 0, status: 'good' }
            ]);


        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <SkeletonLoader lines={6} height="h-32" />
            </div>
        );
    }

    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high');

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-elderly-3xl font-bold text-gray-900 mb-2">
                    Caregiver Dashboard
                </h1>
                <p className="text-elderly-lg text-gray-600">
                    Monitor your patients and manage their care
                </p>
            </div>

            {/* Critical Alerts */}
            {criticalAlerts.length > 0 && (
                <div className="mb-8">
                    <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg">
                        <h3 className="text-elderly-lg font-medium text-red-800 mb-4">
                            🚨 Critical Alerts ({criticalAlerts.length})
                        </h3>
                        <div className="space-y-2">
                            {criticalAlerts.map((alert, index) => (
                                <p key={index} className="text-elderly-base text-red-700">
                                    • {alert.message}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Patient Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {patientStats.map((patient, index) => (
                    <div key={index} className="card-elderly">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-elderly-lg font-semibold text-gray-800">
                                {patient.name}
                            </h3>
                            <div className={`w-3 h-3 rounded-full ${patient.status === 'good' ? 'bg-green-500' :
                                patient.status === 'needs-attention' ? 'bg-red-500' : 'bg-yellow-500'
                                }`}></div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-elderly-base text-gray-600">Adherence Rate:</span>
                                <span className={`text-elderly-base font-medium ${patient.adherence >= 90 ? 'text-green-600' :
                                    patient.adherence >= 70 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                    {patient.adherence}%
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-elderly-base text-gray-600">Active Alerts:</span>
                                <span className={`text-elderly-base font-medium ${patient.alerts === 0 ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {patient.alerts}
                                </span>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                <div
                                    className={`h-2 rounded-full ${patient.adherence >= 90 ? 'bg-green-500' :
                                        patient.adherence >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${patient.adherence}%` }}
                                ></div>
                            </div>
                        </div>

                        <button onClick={() => navigate(`/patients/${patient.id}`)}
                            className="btn-primary w-full mt-4">
                            View Details
                        </button>
                    </div>
                ))}
            </div>

            {/* Alerts List */}
            <div className="card-elderly">
                <h2 className="text-elderly-2xl font-bold text-gray-800 mb-6">
                    Recent Alerts
                </h2>

                {alerts.length > 0 ? (
                    <div className="space-y-4">
                        {alerts.slice(0, 10).map((alert, index) => (
                            <div key={index} className={`p-4 rounded-lg border-l-4 ${alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                                alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                                    alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                                        'border-blue-500 bg-blue-50'
                                }`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-elderly-base font-medium text-gray-800">
                                            {alert.title}
                                        </h4>
                                        <p className="text-elderly-base text-gray-600 mt-1">
                                            {alert.message}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            {new Date(alert.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    <span className={`px-2 py-1 rounded text-sm font-medium ${alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                        alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                            alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-blue-100 text-blue-800'
                                        }`}>
                                        {alert.severity}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-4">✅</div>
                        <p className="text-elderly-lg text-gray-600">
                            No alerts at this time
                        </p>
                        <p className="text-elderly-base text-gray-500 mt-2">
                            All patients are doing well!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CaregiverDashboard;
