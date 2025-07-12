// components/PaymentForm.js
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function PaymentForm() {
    // Define the full list of groups here.
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
        selectedGroups: [], // Stores selected group names (strings)
        screenshot: null
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);

    const fileInputRef = useRef(null);
    const router = useRouter();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        // Find the group name corresponding to the checkbox value (ID)
        const selectedGroupName = groups.find(group => group.id === parseInt(value))?.name;
    
        if (!selectedGroupName) return; 
    
        setFormData(prev => {
            const currentGroups = prev.selectedGroups;
            let newGroups;
    
            if (checked) {
                // Add the NAME of the group
                newGroups = [...currentGroups, selectedGroupName];
            } else {
                // Remove the NAME of the group
                newGroups = currentGroups.filter(name => name !== selectedGroupName);
            }
    
            // Clear error for selectedGroups if at least one is selected
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
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({
                    ...prev,
                    screenshot: 'Please select an image file (PNG, JPG, GIF)'
                }));
                setPreviewUrl(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            // Validate file size
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    screenshot: 'File size must be less than 5MB'
                }));
                setPreviewUrl(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            setFormData(prev => ({
                ...prev,
                screenshot: file
            }));

            // Create a preview URL for the selected image
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);

            // Clear any previous error for screenshot
            setErrors(prev => ({
                ...prev,
                screenshot: ''
            }));
        }
    };

    const removeFile = () => {
        setFormData(prev => ({
            ...prev,
            screenshot: null
        }));
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length > 100) {
            newErrors.name = 'Name cannot exceed 100 characters';
        }

        // Phone number validation
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^\d{10,15}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Phone number must be between 10-15 digits';
        }

        // Group selection validation
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
            return;
        }

        setIsSubmitting(true);
        setSuccessMessage('');
        setErrors({});

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name.trim());
            formDataToSend.append('phoneNumber', formData.phoneNumber.trim());
            // Stringify the array of selected group names before sending
            formDataToSend.append('selectedGroups', JSON.stringify(formData.selectedGroups)); 
            formDataToSend.append('screenshot', formData.screenshot);

            const response = await fetch('/api/payment', {
                method: 'POST',
                body: formDataToSend
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage('Payment details submitted successfully! We will Activate Your Account Within 1 hour if not contact Us!');

                // Reset form data after successful submission
                setFormData({
                    name: '',
                    phoneNumber: '',
                    selectedGroups: [],
                    screenshot: null
                });
                setPreviewUrl(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                // Handle API errors
                if (data.details) {
                    const apiErrors = {};
                    data.details.forEach(error => {
                        // Map backend error messages to frontend fields
                        if (error.toLowerCase().includes('name')) apiErrors.name = error;
                        else if (error.toLowerCase().includes('phone')) apiErrors.phoneNumber = error;
                        else if (error.toLowerCase().includes('group')) apiErrors.selectedGroups = error;
                        else if (error.toLowerCase().includes('screenshot')) apiErrors.screenshot = error;
                        else apiErrors.general = error;
                    });
                    setErrors(apiErrors);
                } else if (data.error) {
                    // Handle generic API errors
                    setErrors({ general: data.error });
                } else {
                    setErrors({ general: 'An unexpected error occurred. Please try again.' });
                }
            }
        } catch (error) {
            console.error('Error submitting payment:', error);
            setErrors({ general: 'Network error or server unreachable. Please check your connection and try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-3">
                    Payment ధృవీకరణ ఫారం 
                </h2>
                <p className="text-base text-gray-600 text-center mb-6">
                    మీ కొనుగోలును నిర్ధారించడానికి మీ వివరాలను పూరించండి మరియు చెల్లింపు screenshot అప్‌లోడ్ చేయండి.
                    
                </p>

                {successMessage && (
                    <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-6 text-center text-sm">
                        {successMessage}
                    </div>
                )}

                {errors.general && (
                    <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-6 text-center text-sm">
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Name Field */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="మీ పూర్తి పేరు"
                            maxLength={100}
                            className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                            ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                        )}
                    </div>
                    
                    {/* Phone Number Field */}
                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number *</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            placeholder="వాట్సాప్ నంబర్.ఉదాహరణకు, 9876543210"
                            maxLength={15}
                            className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                            ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.phoneNumber && (
                            <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>
                        )}
                    </div>

                    {/* Group Selection (Multi-select checkboxes) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">గ్రూప్‌లు ఎంచుకోండి (Select Groups) *</label>
                        <div className="space-y-2">
                            {groups.map((group) => (
                                <label key={group.id} className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        value={group.id}
                                        // Check if the group name is included in the selectedGroups array
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

                    {/* File Upload */}
                    <div>
                        <label htmlFor="screenshot" className="block text-sm font-medium text-gray-700 mb-1">
                            చెల్లింపు స్క్రీన్‌షాట్ (Payment Screenshot) * (Spported UPI: GPay,PhonePe,Paytm)
                        </label>
                        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors bg-gray-50 flex items-center justify-center min-h-[120px]"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                id="screenshot"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg, image/gif"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {/* Preview section */}
                            {previewUrl ? (
                                <div className="relative w-full h-full max-h-48">
                                    {/* Using a standard <img> tag to display the blob URL preview */}
                                    <img
                                        src={previewUrl}
                                        alt="Screenshot preview"
                                        style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                                        className="rounded-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeFile(); }}
                                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                // Placeholder content when no file is selected
                                <div className="text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m-4-4a4 4 0 00-5.656 0L28 28m0 0l4 4m-4-4L20 20m-4 4l-4-4m-4 4l-4-4m-4 4l-4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p className="mt-1 text-sm">
                                        మీ Screenshot ఇక్కడ క్లిక్ చేసి అప్‌లోడ్ చేయండి 
                                        <br/>
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
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                            ${isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
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