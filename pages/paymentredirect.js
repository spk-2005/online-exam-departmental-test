import { useState } from 'react';
import PaymentForm from '@/pages/Paymentform'; // Ensure this path is correct based on your project structure
import Image from 'next/image'; 
export default function PaymentRedirect() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(1); // Default to the first group's ID

  const handlePaymentClick = () => {
    setShowPaymentForm(true);
  };

  const handleBackClick = () => {
    setShowPaymentForm(false);
  };

  // Updated groups with new names and removed 'subjects'
  const groups = [
    { id: 1, name: 'EOT 141', description: 'Tests' },
    { id: 2, name: 'GOT88', description: 'Tests ' },
    { id: 3, name: 'GOT 97', description: 'Tests ' },
    { id: 4, name: 'CODE 08', description: 'Tests' },
    { id: 5, name: 'CODE 10', description: 'Tests ' },
    { id: 6, name: 'CODE 146', description: 'Tests' },
    { id: 7, name: 'CODE 148', description: 'Tests ' }
  ];

  if (showPaymentForm) {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={handleBackClick}
            className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Payment Options
          </button>
        </div>
        {/* Pass the selectedGroup to PaymentForm */}
        <PaymentForm selectedGroup={selectedGroup} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-8 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Complete Your Payment
        </h1>
        <p className="text-gray-600 mb-4">
          Secure payment processing for test groups. Each group contains 3 tests with 3 attempts each.
        </p>
        <div className="bg-green-100 p-3 rounded-lg inline-block">
          <p className="text-green-800 font-semibold">₹100 per group</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment QR Code Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Scan to Pay
          </h2>

          {/* QR Code Image */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <Image
              src="WhatsApp Image 2025-07-08 at 17.24.22_0382ee55.jpg" // IMPORTANT: Update this path to your actual QR code image
              alt="Scan to Pay QR Code"
              className="w-48 h-48 mx-auto object-contain rounded-lg"
            />
            <p className="text-center text-sm text-gray-600 mt-2">
              Scan this QR code with any UPI app
            </p>
          </div>

          {/* UPI ID */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">UPI ID:</h3>
            <div className="flex items-center justify-between bg-white p-3 rounded border">
              <span className="font-mono text-sm">8309179509@ptyes</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('8309179509@ptyes');
                  alert('UPI ID copied to clipboard!'); // Optional: provide user feedback
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Payment Apps */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Supported Payment Apps:</p>
            <div className="flex space-x-3">
              <div className="bg-white p-2 rounded shadow-sm">
                <span className="text-xs font-medium">GPay</span>
              </div>
              <div className="bg-white p-2 rounded shadow-sm">
                <span className="text-xs font-medium">PhonePe</span>
              </div>
              <div className="bg-white p-2 rounded shadow-sm">
                <span className="text-xs font-medium">Paytm</span>
              </div>
              <div className="bg-white p-2 rounded shadow-sm">
                <span className="text-xs font-medium">BHIM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions and Group Selection */}
        <div className="space-y-6">
          {/* Group Selection */}
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-800 mb-3">Select Test Group:</h3>
            <div className="space-y-2">
              {groups.map((group) => (
                <label key={group.id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="group"
                    value={group.id}
                    checked={selectedGroup === group.id}
                    onChange={(e) => setSelectedGroup(parseInt(e.target.value))}
                    className="w-4 h-4 text-purple-600"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-purple-800">{group.name}</span>
                    <p className="text-sm text-purple-600">
                      {group.description} {/* Display description for context */}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3">Payment Instructions:</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                <span>Make payment of ₹100 for the selected group</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                <span>Each group contains 3 tests with 3 attempts each</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                <span>Take a screenshot of the payment confirmation</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
                <span>Fill in the verification form with your details</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">5</span>
                <span>Submit the form to confirm your payment</span>
              </li>
            </ul>
          </div>

          {/* Additional Info */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">Additional Information:</h3>
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
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
        >
          <span className="flex items-center justify-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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