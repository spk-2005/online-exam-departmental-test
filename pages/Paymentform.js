// components/PaymentForm.js
import { useState, useRef } from 'react';
import { useRouter } from 'next/router';

export default function PaymentForm() {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    phoneNumber: '',
    transactionId: '',
    selectedGroup: '',
    screenshot: null
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const fileInputRef = useRef(null);
  const router = useRouter();

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          screenshot: 'Please select an image file'
        }));
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          screenshot: 'File size must be less than 5MB'
        }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        screenshot: file
      }));
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Clear error
      setErrors(prev => ({
        ...prev,
        screenshot: ''
      }));
    }
  };

  // Remove selected file
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

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length > 50) {
      newErrors.username = 'Username cannot exceed 50 characters';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be between 10-15 digits';
    }
    
    if (!formData.transactionId.trim()) {
      newErrors.transactionId = 'Transaction ID is required';
    } else if (formData.transactionId.length > 50) {
      newErrors.transactionId = 'Transaction ID cannot exceed 50 characters';
    }
    
    if (!formData.selectedGroup) {
      newErrors.selectedGroup = 'Please select a group';
    } else if (![1, 2, 3, 4].includes(parseInt(formData.selectedGroup))) {
      newErrors.selectedGroup = 'Please select a valid group';
    }
    
    if (!formData.screenshot) {
      newErrors.screenshot = 'Payment screenshot is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSuccessMessage('');
    
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('username', formData.username.trim());
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('phoneNumber', formData.phoneNumber.trim());
      formDataToSend.append('transactionId', formData.transactionId.trim());
      formDataToSend.append('selectedGroup', formData.selectedGroup);
      formDataToSend.append('screenshot', formData.screenshot);
      
      const response = await fetch('/api/payment', {
        method: 'POST',
        body: formDataToSend
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage('Payment details submitted successfully!');
        
        // Reset form
        setFormData({
          username: '',
          name: '',
          phoneNumber: '',
          transactionId: '',
          selectedGroup: '',
          screenshot: null
        });
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Redirect after success (optional)
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
        
      } else {
        // Handle API errors
        if (data.details) {
          // MongoDB validation errors
          const apiErrors = {};
          data.details.forEach(error => {
            if (error.includes('Username')) apiErrors.username = error;
            if (error.includes('Name')) apiErrors.name = error;
            if (error.includes('Phone')) apiErrors.phoneNumber = error;
            if (error.includes('Transaction')) apiErrors.transactionId = error;
            if (error.includes('Group')) apiErrors.selectedGroup = error;
          });
          setErrors(apiErrors);
        } else {
          // Single error message
          setErrors({ general: data.error || 'An error occurred' });
        }
      }
      
    } catch (error) {
      console.error('Error submitting payment:', error);
      
      // Handle network errors and non-JSON responses
      if (error.message.includes('JSON') || error.message.includes('token')) {
        setErrors({ general: 'Server error. Please check if the API endpoint exists and try again.' });
      } else {
        setErrors({ general: 'Network error. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <h2 style={styles.title}>Payment Submission</h2>
        <p style={styles.subtitle}>Please fill in your payment details and upload a screenshot</p>
        
        {successMessage && (
          <div style={styles.successMessage}>
            {successMessage}
          </div>
        )}
        
        {errors.general && (
          <div style={styles.errorMessage}>
            {errors.general}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Username Field */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              style={{
                ...styles.input,
                ...(errors.username ? styles.inputError : {})
              }}
              placeholder="Enter your username"
              maxLength={50}
            />
            {errors.username && (
              <span style={styles.errorText}>{errors.username}</span>
            )}
          </div>
          
          {/* Name Field */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              style={{
                ...styles.input,
                ...(errors.name ? styles.inputError : {})
              }}
              placeholder="Enter your full name"
              maxLength={100}
            />
            {errors.name && (
              <span style={styles.errorText}>{errors.name}</span>
            )}
          </div>
          
          {/* Phone Number Field */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number *</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              style={{
                ...styles.input,
                ...(errors.phoneNumber ? styles.inputError : {})
              }}
              placeholder="Enter your phone number (10-15 digits)"
              maxLength={15}
            />
            {errors.phoneNumber && (
              <span style={styles.errorText}>{errors.phoneNumber}</span>
            )}
          </div>
          
          {/* Transaction ID Field */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Transaction ID *</label>
            <input
              type="text"
              name="transactionId"
              value={formData.transactionId}
              onChange={handleInputChange}
              style={{
                ...styles.input,
                ...(errors.transactionId ? styles.inputError : {})
              }}
              placeholder="Enter transaction ID"
              maxLength={50}
            />
            {errors.transactionId && (
              <span style={styles.errorText}>{errors.transactionId}</span>
            )}
          </div>
          
          {/* Group Selection */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Group *</label>
            <select
              name="selectedGroup"
              value={formData.selectedGroup}
              onChange={handleInputChange}
              style={{
                ...styles.select,
                ...(errors.selectedGroup ? styles.inputError : {})
              }}
            >
              <option value="">Choose a group</option>
              <option value="1">Group 1</option>
              <option value="2">Group 2</option>
              <option value="3">Group 3</option>
              <option value="4">Group 4</option>
            </select>
            {errors.selectedGroup && (
              <span style={styles.errorText}>{errors.selectedGroup}</span>
            )}
          </div>
          
          {/* File Upload */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Payment Screenshot *</label>
            <div style={styles.fileUploadContainer}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={styles.fileInput}
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={styles.fileDropZone}
              >
                {previewUrl ? (
                  <div style={styles.previewContainer}>
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      style={styles.previewImage}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      style={styles.removeButton}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div style={styles.uploadPlaceholder}>
                    <div style={styles.uploadIcon}>📁</div>
                    <p>Click to upload payment screenshot</p>
                    <p style={styles.uploadHint}>PNG, JPG, GIF up to 5MB</p>
                  </div>
                )}
              </div>
            </div>
            {errors.screenshot && (
              <span style={styles.errorText}>{errors.screenshot}</span>
            )}
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...styles.submitButton,
              ...(isSubmitting ? styles.submitButtonDisabled : {})
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Payment Details'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  
  formCard: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '32px',
  },
  
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#212529',
    marginBottom: '8px',
    textAlign: 'center'
  },
  
  subtitle: {
    fontSize: '16px',
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: '32px'
  },
  
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '4px'
  },
  
  input: {
    padding: '12px 16px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.2s ease',
    outline: 'none',
    backgroundColor: '#ffffff'
  },
  
  select: {
    padding: '12px 16px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.2s ease',
    outline: 'none',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },
  
  inputError: {
    borderColor: '#dc3545'
  },
  
  errorText: {
    fontSize: '12px',
    color: '#dc3545',
    marginTop: '4px'
  },
  
  fileUploadContainer: {
    position: 'relative'
  },
  
  fileInput: {
    display: 'none'
  },
  
  fileDropZone: {
    borderWidth: '2px',
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#fafafa',
    minHeight: '150px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  uploadPlaceholder: {
    textAlign: 'center'
  },
  
  uploadIcon: {
    fontSize: '48px',
    marginBottom: '12px'
  },
  
  uploadHint: {
    fontSize: '12px',
    color: '#6c757d',
    margin: '4px 0 0 0'
  },
  
  previewContainer: {
    position: 'relative',
    display: 'inline-block'
  },
  
  previewImage: {
    maxWidth: '200px',
    maxHeight: '200px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  
  removeButton: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  submitButton: {
    padding: '16px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginTop: '16px'
  },
  
  submitButtonDisabled: {
    backgroundColor: '#6c757d',
    cursor: 'not-allowed'
  },
  
  successMessage: {
    padding: '12px 16px',
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
    borderRadius: '8px',
    marginBottom: '24px',
    textAlign: 'center'
  },
  
  errorMessage: {
    padding: '12px 16px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
    borderRadius: '8px',
    marginBottom: '24px',
    textAlign: 'center'
  }
};

// Add responsive styles
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(max-width: 768px)');
  
  const handleMobileStyles = (e) => {
    if (e.matches) {
      // Mobile styles
      Object.assign(styles.container, {
        padding: '16px'
      });
      
      Object.assign(styles.formCard, {
        padding: '24px'
      });
      
      Object.assign(styles.title, {
        fontSize: '24px'
      });
    }
  };
  
  mediaQuery.addListener(handleMobileStyles);
  handleMobileStyles(mediaQuery);
}