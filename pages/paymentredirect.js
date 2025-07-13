// components/PaymentRedirect.js (or pages/paymentredirect.js)
import { useState } from 'react';
import PaymentForm from '@/pages/Paymentform'; // Ensure this path is correct

export default function PaymentRedirect() {
    const [showPaymentForm, setShowPaymentForm] = useState(false);

    const handleProceedToForm = () => {
        setShowPaymentForm(true);
    };

    const handleBackClick = () => {
        setShowPaymentForm(false);
    };

    // Function to handle downloading the QR code
    const handleDownloadQR = () => {
        // Assuming the QR code image is located at '/scanner.jpg' in the public directory
        const imageUrl = '/scanner.jpg'; 
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'MrDeveloper_UPI_QR_Code.jpg'; // Name the downloaded file
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (showPaymentForm) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
                <div className="w-full max-w-4xl mb-6">
                    <button
                        onClick={handleBackClick}
                        className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 transition-all duration-200 text-base font-medium rounded-lg"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Payment Info
                    </button>
                </div>
                <PaymentForm />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto my-8 p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                    Complete Your Payment
                </h1>
                <p className="text-lg text-gray-600 max-w-prose mx-auto mb-6">
                    దయచేసి మీరు ఎంచుకున్న గ్రూప్‌కి సరిపోయే ఖచ్చితమైన మొత్తం చెల్లించండి.
                </p>
                
                {/* Note about payment process */}
                <div className="bg-yellow-50 p-4 rounded-xl border-l-4 border-yellow-500 text-gray-800 text-base mb-10 shadow-sm">
                    <p className="font-bold text-lg mb-2 text-yellow-800">
                        ముందుగా పేమెంట్ పూర్తి చేయండి:
                    </p>
                    <p className="font-medium">
                        ముందుగా కింద ఉన్న స్కానర్ కానీ లేదా UPI ID ఉపయోగించి పేమెంట్ పూర్తి చేయండి. ఆ తర్వాత పేమెంట్ వెరిఫికేషన్ ఫారం ఫిల్ చేయండి.
                    </p>
                    <p className="text-sm mt-2 text-gray-600 italic">
                        (First, complete the payment using the scanner or UPI ID below, and then fill out the payment verification form.)
                    </p>
                </div>

                {/* Price Information - Small Size Appearance */}
                <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-sm text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">గ్రూప్ ధర సమాచారం:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-700 max-w-2xl mx-auto">
                        <p className="font-semibold py-1.5 px-3 bg-white rounded-md shadow-xs border border-gray-100 flex items-center justify-between">EOT GROUP: <span className="font-bold text-blue-700">₹50</span></p>
                        <p className="font-semibold py-1.5 px-3 bg-white rounded-md shadow-xs border border-gray-100 flex items-center justify-between">GOT GROUP: <span className="font-bold text-blue-700">₹100</span></p>
                        <p className="font-semibold py-1.5 px-3 bg-white rounded-md shadow-xs border border-gray-100 flex items-center justify-between">EOT & GOT GROUP: <span className="font-bold text-blue-700">₹150</span></p>
                        <p className="font-semibold py-1.5 px-3 bg-white rounded-md shadow-xs border border-gray-100 flex items-center justify-between">CODE 8 & 10 GROUP: <span className="font-bold text-blue-700">₹100</span></p>
                        <p className="font-semibold py-1.5 px-3 bg-white rounded-md shadow-xs border border-gray-100 flex items-center justify-between">CODE 146 & 148 GROUP: <span className="font-bold text-blue-700">₹100</span></p>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                        Please ensure you make the **exact payment** for your chosen group to avoid delays in activation.
                    </p>
                </div>
            </div>

            <hr className="my-12 border-gray-200" />

            {/* Main content grid: QR code and UPI ID section */}
            <div className="grid grid-cols-1 justify-items-center">
                {/* Payment QR Code Section */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-lg flex flex-col w-full max-w-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-5 text-center">
                        Scan to Pay
                    </h2>

                    {/* QR Code Image */}
                    <div className="bg-white p-4 rounded-lg shadow-xl mb-6 flex flex-col items-center flex-shrink-0">
                        {/* Ensure your /public/scanner.jpg exists */}
                        <img
                            src="/scanner.jpg"
                            alt="Scan to Pay QR Code"
                            width={250}
                            height={250}
                            className="w-48 h-48 sm:w-60 sm:h-60 object-contain rounded-lg"
                        />

                        {/* Download Button for the QR Code */}
                        <button
                            onClick={handleDownloadQR}
                            className="mt-4 px-6 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition duration-300 flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download QR Code
                        </button>
                    </div>
                    
                    <p className="text-center text-md text-gray-600 mt-3 font-medium">
                        Scan this QR code with any UPI app to complete your payment.
                    </p>

                    {/* UPI ID */}
                    <div className="bg-blue-100 p-5 rounded-lg border border-blue-200 mt-6 flex-grow">
                        <h3 className="font-semibold text-blue-800 mb-3 text-lg">UPI ID:</h3>
                        <div className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-300 shadow-sm">
                            <span className="font-mono text-base sm:text-lg text-gray-700 select-all break-all">8309179509@ptyes</span>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText('8309179509@ptyes');
                                    alert('UPI ID copied to clipboard!');
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm sm:text-base font-medium transition-colors ml-4 py-1 px-3 rounded-md bg-blue-50 hover:bg-blue-100 whitespace-nowrap"
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    {/* Payment Apps */}
                    <div className="mt-6">
                        <p className="text-sm text-gray-600 mb-3 font-medium">Supported Payment Apps:</p>
                        <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                            {['GPay', 'PhonePe', 'Paytm', 'BHIM', 'Amazon Pay', 'WhatsApp Pay'].map(app => (
                                <div key={app} className="bg-white p-2.5 rounded-md shadow-sm border border-gray-200 transform hover:scale-105 transition-transform">
                                    <span className="text-xs font-semibold text-gray-700">{app}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* PROCEED TO PAYMENT VERIFICATION BUTTON */}
            <div className="mt-16 text-center">
                <button
                    onClick={handleProceedToForm}
                    className="inline-flex items-center justify-center px-10 py-4 rounded-xl font-bold text-lg sm:text-xl
                        bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg
                        hover:from-blue-700 hover:to-blue-900 transform hover:scale-105 transition-all duration-300
                        focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2"
                >
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    మీ పేమెంట్‌ని నిర్ధారించడానికి ఇక్కడ క్లిక్ చేయండి
                </button>
            </div>
            
            <div className="text-sm text-gray-500 mt-6 text-center">
            </div>
        </div>
    );
}