import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HealthcareForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone1: '',
        phone2: '',
        address: '',
        pincode: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const validate = () => {
        if (!formData.name.trim()) return "Full Name is required.";
        if (!/^\d{10}$/.test(formData.phone1)) return "Phone Number 1 must be exactly 10 digits.";
        if (formData.phone2 && !/^\d{10}$/.test(formData.phone2)) return "Phone Number 2 must be exactly 10 digits.";
        if (!/^\d{6}$/.test(formData.pincode)) return "Pincode must be exactly 6 digits.";
        return null;
    };

    async function submitForm(data) {
        // Phase 2: Using the proxy endpoint to bypass CORS
        await fetch("/api/details", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');
        setLoading(true);

        try {
            // Format data as requested
            const payload = {
                ...formData,
                phone1: `+91 ${formData.phone1}`,
                phone2: formData.phone2 ? `+91 ${formData.phone2}` : ''
            };

            await submitForm(payload);
            setMessage("Details submitted successfully!");
            setFormData({ name: '', phone1: '', phone2: '', address: '', pincode: '' });
        } catch (err) {
            setError("Failed to submit details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="healthcare-form-container">
            {/* Back Button */}
            <motion.button
                className="healthcare-back-btn"
                onClick={() => navigate('/home')}
                whileHover={{ x: -5, opacity: 1 }}
                initial={{ opacity: 0.6 }}
            >
                ← Back to Home
            </motion.button>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="healthcare-glass-panel enhanced"
            >
                <div className="healthcare-header">
                    <div className="healthcare-logo-icon">🩺</div>
                    <h2>Healthcare Assistant</h2>
                    <p>Your intelligent health concierge. Please provide your details for personalized care.</p>
                </div>

                <form onSubmit={handleSubmit} className="healthcare-main-form">
                    <div className="healthcare-section-title">
                        <span>👤 User Profile</span>
                    </div>

                    <div className="healthcare-form-row">
                        <div className="healthcare-form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="e.g. John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                className="healthcare-input"
                                required
                            />
                        </div>
                    </div>

                    <div className="healthcare-section-title">
                        <span>📞 Contact Information</span>
                    </div>

                    <div className="healthcare-form-grid">
                        <div className="healthcare-form-group">
                            <label>Phone Number 1 (+91)</label>
                            <input
                                type="number"
                                name="phone1"
                                placeholder="Primary (10 digits)"
                                value={formData.phone1}
                                onChange={handleChange}
                                className="healthcare-input"
                                required
                            />
                        </div>

                        <div className="healthcare-form-group">
                            <label>Phone Number 2 (Optional)</label>
                            <input
                                type="number"
                                name="phone2"
                                placeholder="Secondary (10 digits)"
                                value={formData.phone2}
                                onChange={handleChange}
                                className="healthcare-input"
                            />
                        </div>
                    </div>

                    <div className="healthcare-section-title">
                        <span>📍 Location Details</span>
                    </div>

                    <div className="healthcare-form-group">
                        <label>Address</label>
                        <textarea
                            name="address"
                            placeholder="Building, Street, Area..."
                            value={formData.address}
                            onChange={handleChange}
                            className="healthcare-textarea"
                            required
                        ></textarea>
                    </div>

                    <div className="healthcare-form-group" style={{ maxWidth: '200px' }}>
                        <label>Pincode</label>
                        <input
                            type="number"
                            name="pincode"
                            placeholder="6 digits"
                            value={formData.pincode}
                            onChange={handleChange}
                            className="healthcare-input"
                            required
                        />
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="healthcare-error-msg"
                                >
                                    {error}
                                </motion.p>
                            )}
                            {message && (
                                <motion.p
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="healthcare-success-msg"
                                >
                                    {message}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    <motion.button
                        type="submit"
                        className={`healthcare-submit-btn ${loading ? 'loading' : ''}`}
                        disabled={loading}
                        whileHover={!loading ? { scale: 1.02, backgroundColor: "#1F4959" } : {}}
                        whileTap={!loading ? { scale: 0.98 } : {}}
                    >
                        {loading ? (
                            <span className="healthcare-button-loader">
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                            </span>
                        ) : 'Securely Submit Details'}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default HealthcareForm;
