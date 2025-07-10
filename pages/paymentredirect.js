// components/PaymentRedirect.js (or pages/paymentredirect.js)
import { useState } from 'react';
import PaymentForm from '@/pages/Paymentform'; // Ensure this path is correct

export default function PaymentRedirect() {
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null); // State to hold the selected group details

    const groupOptions = [
        { name: 'EOT GROUP', price: 50 },
        { name: 'GOT GROUP', price: 100 },
        { name: 'EOT & GOT GROUP', price: 150 },
        { name: 'CODE 8 & 10 GROUP', price: 100 },
        { name: 'CODE 146 & 148 GROUP', price: 100 },
    ];

    const handleSelectGroup = (group) => {
        setSelectedGroup(group);
    };

    const handleProceedToForm = () => {
        if (selectedGroup) {
            setShowPaymentForm(true);
        } else {
            alert('Please select a group to proceed.');
        }
    };

    const handleBackClick = () => {
        setShowPaymentForm(false);
        setSelectedGroup(null); // Clear selected group when going back
    };

    if (showPaymentForm) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                <div className="mb-6">
                    <button
                        onClick={handleBackClick}
                        className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 transition-all duration-200 text-base font-medium rounded-lg"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Group Selection
                    </button>
                </div>
                <PaymentForm selectedGroup={selectedGroup} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto my-8 p-6 sm:p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
                    Select Your Test Group
                </h1>
                <p className="text-lg text-gray-600 max-w-prose mx-auto">
                    Choose the test group you wish to purchase. Each group contains **3 tests** with **3 attempts** each, valid for **30 days**.
                </p>
                {selectedGroup && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 sm:p-4 rounded-xl inline-block mt-6 animate-fadeIn shadow-inner">
                        <p className="text-blue-800 font-bold text-xl sm:text-2xl flex items-center">
                            <svg className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                            Selected: <span className="font-extrabold ml-2">{selectedGroup.name}</span> - ₹{selectedGroup.price}
                        </p>
                    </div>
                )}
            </div>

            {/* Group Selection Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-10">
                {groupOptions.map((group) => (
                    <div
                        key={group.name}
                        onClick={() => handleSelectGroup(group)}
                        className={`
                            relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-102
                            ${selectedGroup && selectedGroup.name === group.name
                                ? 'border-blue-600 bg-blue-50 shadow-lg ring-4 ring-blue-200'
                                : 'border-gray-200 bg-white hover:border-blue-400 hover:shadow-md'
                            }
                        `}
                    >
                        {selectedGroup && selectedGroup.name === group.name && (
                            <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path></svg>
                            </div>
                        )}
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            {group.name}
                        </h2>
                        <p className="text-3xl font-extrabold text-blue-700">₹{group.price}</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Includes **3 tests**, **3 attempts** each, **30 days** validity.
                        </p>
                    </div>
                ))}
            </div>

            <hr className="my-8 border-gray-200" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment QR Code Section */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-5 text-center">
                        Scan to Pay
                    </h2>

                    {/* QR Code Image */}
                    <div className="bg-white p-4 rounded-lg shadow-xl mb-6 flex justify-center">
                        {/* Ensure your /public/scanner.jpg exists */}
                        <img
                            src="/scanner.jpg"
                            alt="Scan to Pay QR Code"
                            width={250}
                            height={250}
                            className="w-48 h-48 sm:w-60 sm:h-60 object-contain rounded-lg"
                        />
                    </div>
                    <p className="text-center text-md text-gray-600 mt-3 font-medium">
                        Scan this QR code with any UPI app to complete your payment.
                    </p>

                    {/* UPI ID */}
                    <div className="bg-blue-100 p-5 rounded-lg border border-blue-200 mt-6">
                        <h3 className="font-semibold text-blue-800 mb-3 text-lg">UPI ID:</h3>
                        <div className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-300 shadow-sm">
                            <span className="font-mono text-base sm:text-lg text-gray-700 select-all">8309179509@ptyes</span>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText('8309179509@ptyes');
                                    alert('UPI ID copied to clipboard!');
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm sm:text-base font-medium transition-colors ml-4 py-1 px-3 rounded-md bg-blue-50 hover:bg-blue-100"
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    {/* Payment Apps */}
                    <div className="mt-6">
                        <p className="text-sm text-gray-600 mb-3 font-medium">Supported Payment Apps:</p>
                        <div className="flex flex-wrap gap-3">
                            {['GPay', 'PhonePe', 'Paytm', 'BHIM', 'Amazon Pay', 'WhatsApp Pay'].map(app => (
                                <div key={app} className="bg-white p-2.5 rounded-md shadow-sm border border-gray-200 transform hover:scale-105 transition-transform">
                                    <span className="text-xs font-semibold text-gray-700">{app}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Instructions Section */}
                <div className="space-y-6">
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-lg">
                        <h3 className="font-bold text-blue-800 mb-4 text-2xl">Payment Instructions:</h3>
                        <ul className="text-base text-blue-700 space-y-3">
                            <li className="flex items-start">
                                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0 font-bold">1</span>
                                <span>**Select your desired group** from the options above.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0 font-bold">2</span>
                                <span>Make payment of **₹{selectedGroup ? selectedGroup.price : 'your selected amount'}** using the provided QR code or UPI ID.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0 font-bold">3</span>
                                <span>**Take a screenshot** of the successful payment confirmation, ensuring the **UTR/Transaction ID** is visible.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0 font-bold">4</span>
                                <span>Click "**Proceed to Payment Verification**" below to fill out the form.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5 flex-shrink-0 font-bold">5</span>
                                <span>Your selected group will be **activated promptly** upon successful verification.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Proceed Button */}
            <div className="mt-10 text-center">
                <button
                    onClick={handleProceedToForm}
                    className={`
                        inline-flex items-center justify-center px-10 py-4 rounded-xl font-bold text-lg sm:text-xl
                        bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg
                        hover:from-blue-700 hover:to-blue-900 transform hover:scale-105 transition-all duration-300
                        focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2
                        ${!selectedGroup ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    disabled={!selectedGroup}
                >
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Proceed to Payment Verification
                </button>

                <div className="text-sm text-gray-500 mt-5">
                    <p>🔒 Your payment information is secure and protected with **SSL encryption**.</p>
                </div>
            </div>
        </div>
    );
}