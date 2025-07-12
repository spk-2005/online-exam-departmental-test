import { useEffect, useState } from 'react';

const IssueReportingForm = () => {
    const [formData, setFormData] = useState({
        username: '',
        message: ''
    });
    const [status, setStatus] = useState(null); // 'success', 'error', 'loading', null
    const [responseMessage, setResponseMessage] = useState('');
    const [isUsernameKnown, setIsUsernameKnown] = useState(false); // New state to track if username is in localStorage

    useEffect(() => {
        // Check localStorage for a stored username
        if (typeof window !== 'undefined' && window.localStorage) {
            const storedUsername = localStorage.getItem("username");
            if (storedUsername) {
                // If found, pre-fill formData and mark username as known
                setFormData(prev => ({ ...prev, username: storedUsername }));
                setIsUsernameKnown(true);
            }
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setStatus('loading');
        setResponseMessage('');

        try {
            // Send a POST request to the API route
            const response = await fetch('/api/issues', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                // Telugu/English success message
                setResponseMessage(data.message || 'సమస్య విజయవంతంగా నివేదించబడింది! (Issue reported successfully!)');
                setFormData({ username: isUsernameKnown ? formData.username : '', message: '' }); // Reset message, keep username if known
            } else {
                setStatus('error');
                // Telugu/English error message
                setResponseMessage(data.message || 'సమస్యను నివేదించడంలో వైఫల్యం. (Failed to report issue.)');
            }

        } catch (error) {
            console.error("Error reporting issue:", error);
            setStatus('error');
            setResponseMessage('అనుకోని లోపం సంభవించింది. దయచేసి మీ నెట్‌వర్క్ కనెక్షన్‌ను తనిఖీ చేయండి. (An unexpected error occurred. Please check your network connection.)');
        }
    };

    return (
        <div className="max-w-xl mx-auto p-8 bg-white shadow-lg rounded-xl my-10">
            {/* Telugu/English heading */}
            <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">సమస్యను నివేదించండి (Report an Issue)</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Conditional Username Input */}
                {isUsernameKnown ? (
                    // Display username if found in localStorage (read-only)
                    <div>
                        <label className="block text-sm font-medium text-gray-700">వాడుకరి పేరు (Username)</label>
                        <div className="mt-1 block w-full px-4 py-2 text-gray-900 bg-gray-100 rounded-md shadow-sm select-none">
                            {formData.username}
                        </div>
                        
                    </div>
                ) : (
                    // Ask for username if not found in localStorage
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700"> పేరు (Your Full Name) (Required)</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., John Doe"
                        />
                    </div>
                )}

                {/* Message Input (Textarea) */}
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">సమస్య (Message) (Required)</label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows="6"
                        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-y"
                        placeholder="Describe the issue in detail..."
                    ></textarea>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                    disabled={status === 'loading'}
                >
                    {status === 'loading' ? 'సమర్పించబడుతోంది... (Submitting...)' : 'సమస్యను సమర్పించండి (Submit Issue)'}
                </button>
            </form>

            {/* Status Messages */}
            {responseMessage && (
                <div className={`mt-6 p-4 rounded-md text-sm ${
                    status === 'success' ? 'bg-green-100 text-green-800' : 
                    status === 'error' ? 'bg-red-100 text-red-800' : ''
                }`}>
                    {responseMessage}
                </div>
            )}
        </div>
    );
};

export default IssueReportingForm;