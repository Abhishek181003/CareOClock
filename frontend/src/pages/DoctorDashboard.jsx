// frontend/src/pages/DoctorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { alertApi } from '../api/alertApi';
import { userApi } from '../api/userApi';
import SkeletonLoader from '../components/SkeletonLoader';
import ChartComponent from '../components/ChartComponent';
import { useNavigate } from 'react-router-dom';
const DoctorDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [alerts, setAlerts] = useState([]);
    const [patientOverview, setPatientOverview] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const alertsRes = await alertApi.getAlerts();
            setAlerts(alertsRes.data.alerts || []);

            // Mock patient data - in real app, this would come from API
            setPatientOverview([
                {
                    id: 'patient1',
                    name: 'Margaret Johnson',
                    age: 72,
                    adherence: 78,
                    lastVisit: '2025-09-15',
                    conditions: ['Hypertension', 'Diabetes'],
                    riskLevel: 'medium'
                },
                {
                    id: 'patient2',
                    name: 'Robert Chen',
                    age: 68,
                    adherence: 92,
                    lastVisit: '2025-09-20',
                    conditions: ['Hypertension'],
                    riskLevel: 'low'
                },
                {
                    id:'patient3',
                    name: 'Eleanor Thompson',
                    age: 75,
                    adherence: 95,
                    lastVisit: '2025-09-25',
                    conditions: ['Arthritis'],
                    riskLevel: 'low'
                }
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

    const highRiskPatients = patientOverview.filter(p => p.riskLevel === 'high' || p.adherence < 80);
    const totalPatients = patientOverview.length;
    const avgAdherence = Math.round(patientOverview.reduce((sum, p) => sum + p.adherence, 0) / totalPatients);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-elderly-3xl font-bold text-gray-900 mb-2">
                    Doctor Dashboard
                </h1>
                <p className="text-elderly-lg text-gray-600">
                    Clinical overview and patient management
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="card-elderly bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
                    <div className="text-center">
                        <div className="text-elderly-3xl font-bold text-blue-700 mb-2">
                            {totalPatients}
                        </div>
                        <div className="text-elderly-base text-blue-600">
                            Total Patients
                        </div>
                    </div>
                </div>

                <div className="card-elderly bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
                    <div className="text-center">
                        <div className="text-elderly-3xl font-bold text-green-700 mb-2">
                            {avgAdherence}%
                        </div>
                        <div className="text-elderly-base text-green-600">
                            Avg Adherence
                        </div>
                    </div>
                </div>

                <div className="card-elderly bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500">
                    <div className="text-center">
                        <div className="text-elderly-3xl font-bold text-red-700 mb-2">
                            {highRiskPatients.length}
                        </div>
                        <div className="text-elderly-base text-red-600">
                            High Risk
                        </div>
                    </div>
                </div>

                <div className="card-elderly bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500">
                    <div className="text-center">
                        <div className="text-elderly-3xl font-bold text-purple-700 mb-2">
                            {alerts.length}
                        </div>
                        <div className="text-elderly-base text-purple-600">
                            Active Alerts
                        </div>
                    </div>
                </div>
            </div>

            {/* High Risk Patients Alert */}
            {highRiskPatients.length > 0 && (
                <div className="mb-8">
                    <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-lg">
                        <h3 className="text-elderly-lg font-medium text-red-800 mb-4">
                            ⚠️ Patients Requiring Attention ({highRiskPatients.length})
                        </h3>
                        <div className="space-y-2">
                            {highRiskPatients.map((patient, index) => (
                                <p key={index} className="text-elderly-base text-red-700">
                                    • {patient.name} - {patient.adherence}% adherence
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Patient Overview */}
                <div className="card-elderly">
                    <h2 className="text-elderly-2xl font-bold text-gray-800 mb-6">
                        Patient Overview
                    </h2>

                    <div className="space-y-4">
                        {patientOverview.map((patient, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="text-elderly-lg font-semibold text-gray-800">
                                            {patient.name}
                                        </h4>
                                        <p className="text-elderly-base text-gray-600">
                                            Age {patient.age} • Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className={`px-2 py-1 rounded text-sm font-medium ${patient.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                                            patient.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                        }`}>
                                        {patient.riskLevel} risk
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-elderly-base text-gray-600">Adherence:</span>
                                    <span className={`text-elderly-base font-medium ${patient.adherence >= 90 ? 'text-green-600' :
                                            patient.adherence >= 70 ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                        {patient.adherence}%
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-3">
                                    {patient.conditions.map((condition, idx) => (
                                        <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                            {condition}
                                        </span>
                                    ))}
                                </div>

                                <button onClick={() => navigate(`/patients/${patient.id}`)}
                                    className="btn-primary w-full mt-4">
                                    View Patient Details
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Alerts */}
                <div className="card-elderly">
                    <h2 className="text-elderly-2xl font-bold text-gray-800 mb-6">
                        Clinical Alerts
                    </h2>

                    {alerts.length > 0 ? (
                        <div className="space-y-4">
                            {alerts.slice(0, 5).map((alert, index) => (
                                <div key={index} className={`p-4 rounded-lg border-l-4 ${alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                                        alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                                            'border-yellow-500 bg-yellow-50'
                                    }`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-elderly-base font-medium text-gray-800">
                                            {alert.title}
                                        </h4>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                                alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {alert.severity}
                                        </span>
                                    </div>

                                    <p className="text-elderly-base text-gray-600 mb-2">
                                        {alert.message}
                                    </p>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">
                                            {new Date(alert.createdAt).toLocaleString()}
                                        </span>
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                            Review →
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-4">🩺</div>
                            <p className="text-elderly-lg text-gray-600">
                                No clinical alerts
                            </p>
                            <p className="text-elderly-base text-gray-500 mt-2">
                                All patients are stable
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
