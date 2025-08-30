import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-yellow-700 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-serif font-bold mb-4 text-primary-300">Herbal Honey</h3>
            <p className="text-secondary-300">
              Pure, natural herbal honey with healing properties, sourced from sustainable beekeeping practices.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary-200">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-secondary-300 hover:text-primary-300 transition-colors">Home</Link></li>
              <li><Link to="/products" className="text-secondary-300 hover:text-primary-300 transition-colors">Products</Link></li>
              <li><Link to="/about" className="text-secondary-300 hover:text-primary-300 transition-colors">About Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary-200">Contact Us</h4>
            <address className="not-italic text-secondary-300">
              <p>123 Honey Lane</p>
              <p>Beekeeper, BK 12345</p>
              <p className="mt-2">info@herbalhoney.com</p>
              <p>(123) 456-7890</p>
            </address>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary-200">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-secondary-300 hover:text-primary-300 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-secondary-300 hover:text-primary-300 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm5.63 7.87c.008.125.008.25.008.375 0 3.878-2.953 8.349-8.349 8.349a8.3 8.3 0 0 1-4.489-1.313c.225.026.453.034.682.034a5.9 5.9 0 0 0 3.643-1.253 2.94 2.94 0 0 1-2.742-2.039c.181.034.365.06.555.06.269 0 .531-.035.777-.1a2.936 2.936 0 0 1-2.354-2.879v-.034c.395.22.847.354 1.329.369a2.93 2.93 0 0 1-1.307-2.441c0-.537.144-1.039.395-1.471a8.326 8.326 0 0 0 6.042 3.062 3.33 3.33 0 0 1-.075-.672 2.94 2.94 0 0 1 2.939-2.939c.845 0 1.608.356 2.145.93a5.79 5.79 0 0 0 1.865-.712 2.93 2.93 0 0 1-1.29 1.62 5.9 5.9 0 0 0 1.686-.453 6.3 6.3 0 0 1-1.468 1.52z"/>
                </svg>
              </a>
              <a href="#" className="text-secondary-300 hover:text-primary-300 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 0 1 1.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 0 0-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0 1 12 3.475zm-3.633.803a53.896 53.896 0 0 1 3.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 0 1 4.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 0 1-2.19-5.705zM12 20.547a8.482 8.482 0 0 1-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 0 1 1.823 6.475 8.4 8.4 0 0 1-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 0 1-3.655 5.715z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-secondary-800 mt-8 pt-8 text-center text-secondary-400">
          <p>&copy; {new Date().getFullYear()} Herbal Honey. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;