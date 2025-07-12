import React from 'react'; 
import { Mail, Phone, Instagram, MessageSquare } from 'lucide-react'; 
import Link from 'next/link'; 

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-6 sm:p-10 border border-gray-200">
        
        {/* Header Section */}
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
            మమ్మల్ని సంప్రదించండి 
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            మేము సహాయం చేయడానికి ఇక్కడ ఉన్నాము! మీకు నచ్చిన పద్ధతి ద్వారా మమ్మల్ని సంప్రదించండి. 
            <br className="hidden sm:block"/>
          </p>
        </header>

        {/* Contact Channels Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <section className="md:col-span-2 bg-blue-50 p-6 sm:p-8 rounded-2xl border border-blue-200 shadow-md">
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-6 border-b pb-4 border-blue-200 text-center">
              Our Contact Channels
            </h2>
            
            <ul className="space-y-6 sm:space-y-8 max-w-md mx-auto"> 
              
              {/* WhatsApp */}
              <li className="flex items-center justify-center sm:justify-start text-gray-700 text-lg sm:text-xl p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]">
                <MessageSquare className="flex-shrink-0 w-7 h-7 text-green-600 mr-4" />
                <div>
                  <span className="font-semibold text-gray-800">WhatsApp</span>
                  <a
                    href="https://wa.me/918309179509" 
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
                  <span className="font-semibold text-gray-800">Phone</span>
                  <a href="tel:+918309179509" className="block text-blue-700 hover:underline font-medium">
                    +91 8309179509
                  </a>
                </div>
              </li>
              
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;