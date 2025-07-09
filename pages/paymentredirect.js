// components/PaymentRedirect.js (or pages/paymentredirect.js, depending on your structure)
import { useState } from 'react';
import PaymentForm from '@/pages/Paymentform';
import Image from 'next/image';

export default function PaymentRedirect() {
    const [showPaymentForm, setShowPaymentForm] = useState(false);

    const handlePaymentClick = () => {
        setShowPaymentForm(true);
    };

    const handleBackClick = () => {
        setShowPaymentForm(false);
    };

    if (showPaymentForm) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
                <div className="mb-6">
                    <button
                        onClick={handleBackClick}
                        className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors duration-200 text-base font-medium rounded-lg"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Payment Options
                    </button>
                </div>
                <PaymentForm /> {/* No selectedGroup prop needed here anymore */}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto mt-4 sm:mt-8 p-4 sm:p-6 lg:p-8 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                    Complete Your Payment
                </h1>
                <p className="text-base text-gray-600 mb-4 max-w-prose mx-auto">
                    Secure payment processing for test groups. Each group contains 3 tests with 3 attempts each, valid for 30 days.
                </p>
                <div className="bg-green-100 p-2 sm:p-3 rounded-lg inline-block">
                    <p className="text-green-800 font-semibold text-lg sm:text-xl">₹100 per group</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Payment QR Code Section */}
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                        Scan to Pay
                    </h2>

                    {/* QR Code Image */}
                    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md mb-4 flex justify-center">
                        {/* Ensure your /public/scanner.jpg exists */}
                        <Image
                            src="/scanner.jpg"
                            alt="Scan to Pay QR Code"
                            width={200}
                            height={200}
                            className="w-40 h-40 sm:w-48 sm:h-48 object-contain rounded-lg"
                        />
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-2">
                        Scan this QR code with any UPI app
                    </p>

                    {/* UPI ID */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-5">
                        <h3 className="font-semibold text-blue-800 mb-2 text-base">UPI ID:</h3>
                        <div className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-300">
                            <span className="font-mono text-sm sm:text-base text-gray-700">8309179509@ptyes</span>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText('8309179509@ptyes');
                                    alert('UPI ID copied to clipboard!');
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm sm:text-base font-medium transition-colors"
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    {/* Payment Apps */}
                    <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Supported Payment Apps:</p>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                                <div key={app} className="bg-white p-2 rounded shadow-sm border border-gray-200">
                                    <span className="text-xs font-medium text-gray-700">{app}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Instructions and Additional Info (Group Selection removed) */}
                <div className="space-y-6">
                    {/* Payment Instructions */}
                    <div className="bg-blue-50 p-5 rounded-lg border border-blue-200 shadow-sm">
                        <h3 className="font-semibold text-blue-800 mb-3 text-lg">Payment Instructions:</h3>
                        <ul className="text-sm text-blue-700 space-y-2">
                            <li className="flex items-start">
                                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">1</span>
                                <span>Make payment of ₹100 for your desired group</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">2</span>
                                <span>Each group contains 3 tests with 3 attempts each</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">3</span>
                                <span>Take a screenshot of the payment confirmation</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">4</span>
                                <span>Fill in the verification form with your details</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">5</span>
                                <span>Submit the form to confirm your payment</span>
                            </li>
                        </ul>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-yellow-50 p-5 rounded-lg border border-yellow-200 shadow-sm">
                        <h3 className="font-semibold text-yellow-800 mb-2 text-lg">Additional Information:</h3>
                        <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• Already registered users can purchase additional groups</li>
                            <li>• Each purchase is valid for 30 days from activation</li>
                            <li>• You can track your progress in the dashboard</li>
                            <li>• Contact support for any payment issues</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Proceed Button */}
            <div className="mt-8 text-center">
                <button
                    onClick={handlePaymentClick}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 sm:py-4 sm:px-8 rounded-lg font-semibold text-base sm:text-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Proceed to Payment Verification
                    </span>
                </button>

                <div className="text-xs text-gray-500 mt-4">
                    <p>🔒 Your payment information is secure and protected</p>
                </div>
            </div>
        </div>
    );
}