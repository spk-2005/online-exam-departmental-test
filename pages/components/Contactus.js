import React from 'react'; // No useState needed if no form
import { Mail, Phone, Instagram, MessageSquare } from 'lucide-react'; // MessageSquare for WhatsApp
import Link from 'next/link'; // Added Link for optional FAQ

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-6 sm:p-10 border border-gray-200">
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            Connect With Us
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            We're here to help! Reach out through your preferred method.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Direct Contact Details - Now centered if only one column on small screens */}
          <section className="md:col-span-2 bg-blue-50 p-6 sm:p-8 rounded-2xl border border-blue-200 shadow-md">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-6 border-b pb-4 border-blue-200 text-center">
              Our Contact Channels
            </h2>
            <ul className="space-y-6 sm:space-y-8 max-w-md mx-auto"> {/* Centered list for better appearance */}
              {/* WhatsApp */}
              <li className="flex items-center justify-center sm:justify-start text-gray-700 text-lg sm:text-xl p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]">
                <MessageSquare className="flex-shrink-0 w-7 h-7 text-green-600 mr-4" />
                <div>
                  <span className="font-semibold text-gray-800">WhatsApp:</span>
                  <a
                    href="https://wa.me/918309179509" // Your WhatsApp number
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-700 hover:underline font-medium"
                  >
                    +91 8309179509
                  </a>
                </div>
              </li>

              {/* Phone */}
              <li className="flex items-center justify-center sm:justify-start text-gray-700 text-lg sm:text-xl p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]">
                <Phone className="flex-shrink-0 w-7 h-7 text-indigo-600 mr-4" />
                <div>
                  <span className="font-semibold text-gray-800">Phone:</span>
                  <a href="tel:+918309179509" className="block text-blue-700 hover:underline font-medium">
                    +91 8309179509
                  </a>
                </div>
              </li>

              {/* Email */}
              <li className="flex items-center justify-center sm:justify-start text-gray-700 text-lg sm:text-xl p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]">
                <Mail className="flex-shrink-0 w-7 h-7 text-red-600 mr-4" />
                <div>
                  <span className="font-semibold text-gray-800">Email:</span>
                  <a href="mailto:prasannasimha5002@gmail.com" className="block text-blue-700 hover:underline font-medium">
                    prasannasimha5002@gmail.com
                  </a>
                </div>
              </li>

              {/* Instagram */}
              <li className="flex items-center justify-center sm:justify-start text-gray-700 text-lg sm:text-xl p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]">
                <Instagram className="flex-shrink-0 w-7 h-7 text-pink-600 mr-4" />
                <div>
                  <span className="font-semibold text-gray-800">Instagram:</span>
                  <a
                    href="https://www.instagram.com/prasanna_kumar_simmhadri_2005/?utm_source=ig_web_button_share_sheet" // REMEMBER TO REPLACE THIS WITH YOUR ACTUAL INSTAGRAM HANDLE
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-700 hover:underline font-medium"
                  >
                    @
prasanna_kumar_simmhadri_2005
                  </a>
                </div>
              </li>
            </ul>
          </section>
        </div>

        {/* Optional: Add a small, clear message or FAQ link */}
        <div className="mt-10 text-center text-gray-600 text-sm sm:text-base">
          <p>We aim to respond to all inquiries within 24-48 business hours.</p>
          <p className="mt-2">For common questions, please check our <Link href="/faq" className="text-blue-600 hover:underline font-medium">FAQ page</Link>.</p>
        </div>

      </div>
    </div>
  );
};

export default ContactUs;