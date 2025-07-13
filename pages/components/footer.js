import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 lg:gap-20">

          {/* About Section */}
          <div className="footer-section">
            <h3 className="text-xl font-semibold text-white mb-4">About Mr Developer</h3>
            <p className="text-sm leading-relaxed">
              The Platform is owned by **Mr Developer**, a company incorporated under the Companies Act, 1956, with its registered office at Hariprasad Nagar, Chirala, Chirala, India.
            </p>
          </div>

          {/* Legal & Policies Links */}
          <div className="footer-section">
            <h3 className="text-xl font-semibold text-white mb-4">Legal & Policies</h3>
            <ul className="space-y-3">
              <li>
                <a href="/components/termsandconditions" className="text-gray-400 hover:text-white transition duration-300 text-sm">
                  Terms and Conditions of Use
                </a>
              </li>
              <li>
                <a href="/components/privacypolicy" className="text-gray-400 hover:text-white transition duration-300 text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/components/refundpolicy" className="text-gray-400 hover:text-white transition duration-300 text-sm">
                  Refund and Cancellation Policy
                </a>
              </li>
              <li>
                <a href="/components/returnpolicy" className="text-gray-400 hover:text-white transition duration-300 text-sm">
                  Return and Exchange Policy
                </a>
              </li>
              <li>
                <a href="/components/shippingconditions" className="text-gray-400 hover:text-white transition duration-300 text-sm">
                  Shipping Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Us Section */}
          <div className="footer-section">
            <h3 className="text-xl font-semibold text-white mb-4">Contact Us</h3>
            <p className="text-sm leading-relaxed">
              All concerns or communications relating to these Terms must be communicated to us using the contact information provided on this website.
            </p>
          </div>
        </div>

        {/* Footer Bottom (Copyright) */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Mr Developer. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}