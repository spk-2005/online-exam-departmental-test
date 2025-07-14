// components/PaymentForm.js
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PaymentForm() {
    const groups = [
        { id: 1, name: 'EOT GROUP' },
        { id: 2, name: 'GOT GROUP' },
        { id: 3, name: 'EOT & GOT GROUP' },
        { id: 4, name: 'CODE 8 & 10 GROUP' },
        { id: 5, name: 'CODE 146 & 148 GROUP' }
    ];

    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        selectedGroups: [],
        screenshot: null
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    // No previewUrl state needed

    const fileInputRef = useRef(null);
    const router = useRouter();

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Clean phone number input (remove non-digits)
        const cleanValue = name === 'phoneNumber' ? value.replace(/\D/g, '') : value;

        setFormData(prev => ({
            ...prev,
            [name]: cleanValue
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        const selectedGroupName = groups.find(group => group.id === parseInt(value))?.name;

        if (!selectedGroupName) return;

        setFormData(prev => {
            const currentGroups = prev.selectedGroups;
            let newGroups;

            if (checked) {
                newGroups = [...currentGroups, selectedGroupName];
            } else {
                newGroups = currentGroups.filter(name => name !== selectedGroupName);
            }

            // Clear error when user selects at least one group
            if (newGroups.length > 0 && errors.selectedGroups) {
                setErrors(prevErrors => ({ ...prevErrors, selectedGroups: '' }));
            }

            return {
                ...prev,
                selectedGroups: newGroups
            };
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Enhanced file validation
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, screenshot: 'Please select a valid image file (PNG, JPG, JPEG, GIF)' }));
                resetFileInput();
                return;
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setErrors(prev => ({ ...prev, screenshot: 'File size must be less than 5MB' }));
                resetFileInput();
                return;
            }

            setFormData(prev => ({
                ...prev,
                screenshot: file
            }));

            setErrors(prev => ({ ...prev, screenshot: '' }));
        }
    };

    const resetFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = () => {
        setFormData(prev => ({ ...prev, screenshot: null }));
        resetFileInput();
    };

    // No useEffect for previewUrl cleanup needed

    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters long';
        } else if (formData.name.trim().length > 50) {
            newErrors.name = 'Name must be less than 50 characters';
        }

        // Phone number validation
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^\d{10,15}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Phone number must be between 10-15 digits';
        }

        // Groups validation
        if (formData.selectedGroups.length === 0) {
            newErrors.selectedGroups = 'Please select at least one test group';
        }

        // Screenshot validation
        if (!formData.screenshot) {
            newErrors.screenshot = 'Payment screenshot is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            const firstErrorElement = document.querySelector('.text-red-600');
            if (firstErrorElement) {
                firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setIsSubmitting(true);
        setSuccessMessage('');
        setErrors({});

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name.trim());
            formDataToSend.append('phoneNumber', formData.phoneNumber.trim());
            formDataToSend.append('selectedGroups', JSON.stringify(formData.selectedGroups));
            formDataToSend.append('screenshot', formData.screenshot);

            // Debug: Log the form data being sent
            console.log('Form Data being sent:');
            console.log('- Name:', formData.name.trim());
            console.log('- Phone:', formData.phoneNumber.trim());
            console.log('- Groups:', formData.selectedGroups);
            console.log('- Screenshot:', formData.screenshot);
            console.log('- Screenshot type:', formData.screenshot?.type);
            console.log('- Screenshot size:', formData.screenshot?.size);

            const response = await fetch('/api/payment', {
                method: 'POST',
                body: formDataToSend
            });

            // Debug: Log response details
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                setSuccessMessage(
                    'Payment details submitted successfully! We will activate your account within 1 hour. If not, please contact us.'
                );

                // Reset form
                setFormData({ name: '', phoneNumber: '', selectedGroups: [], screenshot: null });
                resetFileInput();

                // Scroll to success message
                setTimeout(() => {
                    const successElement = document.querySelector('.bg-green-100');
                    if (successElement) {
                        successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            } else {
                // Enhanced error handling for different error types
                console.error('API Error Response:', data);

                // Handle different error types from API
                if (data.error === 'Duplicate entry' || data.error === 'Phone number already exists') {
                    // Handle duplicate phone number error
                    setErrors({
                        phoneNumber: data.message || 'This phone number is already registered. Please use a different phone number.'
                    });

                    // Scroll to phone number field
                    setTimeout(() => {
                        const phoneField = document.getElementById('phoneNumber');
                        if (phoneField) {
                            phoneField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            phoneField.focus();
                        }
                    }, 100);

                } else if (data.error === 'Validation failed' && data.details) {
                    // Handle validation errors with details array
                    const apiErrors = {};
                    data.details.forEach(error => {
                        const errorLower = error.toLowerCase();
                        if (errorLower.includes('name')) {
                            apiErrors.name = error;
                        } else if (errorLower.includes('phone')) {
                            apiErrors.phoneNumber = error;
                        } else if (errorLower.includes('group')) {
                            apiErrors.selectedGroups = error;
                        } else if (errorLower.includes('screenshot') || errorLower.includes('image') || errorLower.includes('file')) {
                            apiErrors.screenshot = error;
                        } else {
                            apiErrors.general = error;
                        }
                    });
                    setErrors(apiErrors);

                    // Scroll to first error
                    setTimeout(() => {
                        const firstErrorElement = document.querySelector('.text-red-600');
                        if (firstErrorElement) {
                            firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 100);

                } else if (data.error === 'File too large') {
                    // Handle file size error
                    setErrors({
                        screenshot: data.message || 'File size must be less than 5MB'
                    });

                } else if (data.error === 'Invalid file') {
                    // Handle invalid file type error
                    setErrors({
                        screenshot: data.message || 'Only image files are allowed'
                    });

                } else {
                    // Handle general errors
                    setErrors({
                        general: data.message || data.error || 'An unexpected error occurred. Please try again.'
                    });
                }
            }
        } catch (error) {
            console.error('Error submitting payment:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });

            // Handle network errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                setErrors({
                    general: 'Network error: Unable to connect to server. Please check your internet connection and try again.'
                });
            } else {
                setErrors({
                    general: 'Network error or server unreachable. Please check your connection and try again.'
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };


    // Alternative approach using JSON instead of FormData (for testing)
    const handleSubmitAlternative = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            const firstErrorElement = document.querySelector('.text-red-600');
            if (firstErrorElement) {
                firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setIsSubmitting(true);
        setSuccessMessage('');
        setErrors({});

        try {
            // Convert image to base64 for JSON submission
            const convertFileToBase64 = (file) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = error => reject(error);
                });
            };

            const screenshotBase64 = formData.screenshot ? await convertFileToBase64(formData.screenshot) : null;


            const payload = {
                name: formData.name.trim(),
                phoneNumber: formData.phoneNumber.trim(),
                selectedGroups: formData.selectedGroups,
                screenshot: screenshotBase64 ? {
                    data: screenshotBase64,
                    type: formData.screenshot.type,
                    size: formData.screenshot.size,
                    name: formData.screenshot.name
                } : null
            };

            console.log('JSON Payload:', payload);

            const response = await fetch('/api/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                setSuccessMessage(
                    'Payment details submitted successfully! We will activate your account within 1 hour. If not, please contact us.'
                );

                setFormData({ name: '', phoneNumber: '', selectedGroups: [], screenshot: null });
                resetFileInput();

                setTimeout(() => {
                    const successElement = document.querySelector('.bg-green-100');
                    if (successElement) {
                        successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            } else {
                console.error('API Error Response:', data);

                if (data.details) {
                    const apiErrors = {};
                    data.details.forEach(error => {
                        const errorLower = error.toLowerCase();
                        if (errorLower.includes('name')) apiErrors.name = error;
                        else if (errorLower.includes('phone')) apiErrors.phoneNumber = error;
                        else if (errorLower.includes('group')) apiErrors.selectedGroups = error;
                        else if (errorLower.includes('screenshot')) apiErrors.screenshot = error;
                        else apiErrors.general = error;
                    });
                    setErrors(apiErrors);
                } else {
                    setErrors({ general: data.error || data.message || 'An unexpected error occurred. Please try again.' });
                }
            }
        } catch (error) {
            console.error('Error submitting payment:', error);
            setErrors({
                general: 'Network error or server unreachable. Please check your connection and try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-4 px-2 sm:px-4 lg:px-8">
            <div className="max-w-md w-full bg-white rounded-xl p-4 sm:p-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-3">
                    Payment ధృవీకరణ ఫారం
                </h2>
                <p className="text-base text-gray-600 text-center mb-6">
                    మీ కొనుగోలును నిర్ధారించడానికి మీ వివరాలను పూరించండి మరియు చెల్లింపు screenshot అప్‌లోడ్ చేయండి.
                </p>

                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-800 p-3 rounded-lg mb-6 text-center text-sm">
                        {successMessage}
                    </div>
                )}

                {errors.general && (
                    <div className="bg-red-100 border border-red-400 text-red-800 p-3 rounded-lg mb-6 text-center text-sm">
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Name Field */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="మీ పూర్తి పేరు"
                            maxLength={50}
                            className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors ${
                                errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                        )}
                    </div>

                    {/* Phone Number Field */}
                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            WhatsApp Number *
                        </label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            placeholder="వాట్సాప్ నంబర్. ఉదాహరణకు, 9876543210"
                            maxLength={15}
                            className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors ${
                                errors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                        />
                        {errors.phoneNumber && (
                            <div className="mt-1 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                                <p className="font-medium">⚠️ {errors.phoneNumber}</p>
                                <p className="mt-1 text-gray-600">
                                    If you believe this is an error, please contact support or try using a different phone number.
                                </p>
                            </div>
                        )}
                    </div>
                    {/* Group Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            కొనుగోలు చేసిన గ్రూప్‌ల ని ఎంచుకోండి (Select Groups) *
                        </label>
                        <div className={`space-y-2 p-3 border rounded-md ${
                                errors.selectedGroups ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}>
                            {groups.map((group) => (
                                <label key={group.id} className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        value={group.id}
                                        checked={formData.selectedGroups.includes(group.name)}
                                        onChange={handleCheckboxChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-800">{group.name}</span>
                                </label>
                            ))}
                        </div>
                        {errors.selectedGroups && (
                            <p className="mt-1 text-xs text-red-600">{errors.selectedGroups}</p>
                        )}
                    </div>

                    {/* File Upload - Modified to display filename only */}
                    <div>
                        <label htmlFor="screenshot" className="block text-sm font-medium text-gray-700 mb-1">
                            చెల్లింపు స్క్రీన్‌షాట్ (Payment Screenshot) *
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                            Supported UPI: GPay, PhonePe, Paytm | Max size: 5MB
                        </p>
                        <div className={`relative border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:border-gray-400 transition-colors bg-gray-50 flex flex-col items-center justify-center ${
                                errors.screenshot ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                id="screenshot"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg, image/jpg, image/gif"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />

                            {formData.screenshot ? (
                                <div className="flex items-center justify-between w-full px-2 py-1">
                                    <span className="text-sm text-gray-800 truncate mr-2">
                                        {formData.screenshot.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeFile(); }}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium flex-shrink-0"
                                        aria-label="Remove screenshot"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="text-gray-500 flex flex-col items-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m-4-4a4 4 0 00-5.656 0L28 28m0 0l4 4m-4-4L20 20m-4 4l-4-4m-4 4l-4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p className="mt-1 text-sm">
                                        మీ Screenshot ఇక్కడ క్లిక్ చేసి అప్‌లోడ్ చేయండి
                                        <br />
                                        (Click here to upload your screenshot)
                                    </p>
                                </div>
                            )}
                        </div>
                        {errors.screenshot && (
                            <p className="mt-1 text-xs text-red-600">{errors.screenshot}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    సమర్పించడం... (Submitting...)
                                </span>
                            ) : (
                                'చెల్లింపు వివరాలను సమర్పించండి (Submit Payment Details)'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}