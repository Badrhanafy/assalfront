import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import CartSidebar from './CartSidebar';
import animationdata from '../assets/beelooking.json';
import Lottie from 'lottie-react';

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [productsLoaded, setProductsLoaded] = useState(false);

  const headerRef = useRef();
  const searchRef = useRef();
  const languageRef = useRef();

  // Language configuration
  const languages = [
    { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/us.png', dir: 'ltr' },
    { code: 'fr', name: 'Français', flag: 'https://flagcdn.com/w40/fr.png', dir: 'ltr' },
    { code: 'ar', name: 'العربية', flag: 'https://flagcdn.com/w40/ma.png', dir: 'rtl' },
  ];

  // Get current language
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Fetch all products on component mount
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/products');
        setAllProducts(response.data);
        setProductsLoaded(true);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProductsLoaded(true);
      }
    };

    fetchAllProducts();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setIsLanguageOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Initial auth/cart setup
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error(err);
      }
    }
    updateCartCount();
  }, []);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = 
      isSidebarOpen || isSearchOpen || isCartOpen || isMenuOpen ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [isSidebarOpen, isSearchOpen, isCartOpen, isMenuOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isSearchOpen]);

  // Update cart count
  const updateCartCount = () => {
    const cart = localStorage.getItem('cart');
    if (cart) {
      try {
        const cartItems = JSON.parse(cart);
        setCartItemsCount(cartItems.reduce((count, item) => count + item.quantity, 0));
      } catch (err) {
        console.error(err);
      }
    } else {
      setCartItemsCount(0);
    }
  };

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => updateCartCount();
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    if (!productsLoaded) return;

    const query = searchQuery.toLowerCase().trim();
    
    // Simple filtering based on product name
    const filteredProducts = allProducts.filter(product => 
      product && product.product_name && product.product_name.toLowerCase().includes(query)
    );
    
    setSearchResults(filteredProducts);
  }, [searchQuery, allProducts, productsLoaded]);

  // Change language
  const changeLanguage = (lng) => {
    const language = languages.find(lang => lang.code === lng);
    i18n.changeLanguage(lng);
    setIsLanguageOpen(false);
    document.documentElement.dir = language.dir;
    document.documentElement.lang = lng;
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsSidebarOpen(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  // Check if current route is active
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* HEADER */}
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out
          ${scrolled ? 'bg-yellow-600/90 text-white shadow-lg h-16 backdrop-blur-sm' : 'bg-white/95 shadow-sm h-20 backdrop-blur-sm'}
          ${i18n.language === 'ar' ? 'font-arabic' : 'font-sans'}`}
      >
        <div className="container mx-auto px-4 h-full flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-serif font-bold text-amber-700 transition-colors hover:text-amber-800"
          >
            {t('header.title')}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {['/', '/products', '/about'].map((path, index) => (
              <Link
                key={index}
                to={path}
                className={`transition-colors px-3 py-2 rounded-lg font-medium ${
                  isActiveRoute(path) 
                    ? 'text-amber-700 bg-amber-50' 
                    : 'text-gray-700 hover:text-amber-600 hover:bg-amber-50/50'
                }`}
              >
                {t(`header.${path === '/' ? 'home' : path.slice(1)}`)}
              </Link>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Search Button */}
            <button
              className="p-2 text-gray-600 hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50"
              onClick={() => setIsSearchOpen(true)}
              aria-label={t('header.search')}
            >
              <SearchIcon />
            </button>

            {/* Language Selector */}
            <div className="relative" ref={languageRef}>
              <button
                className="flex items-center p-2 text-gray-600 hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50"
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                aria-label={t('header.change_language')}
              >
                <img
                  src={currentLanguage.flag}
                  alt={currentLanguage.name}
                  className="w-5 h-4 rounded-sm"
                />
                <ChevronIcon isOpen={isLanguageOpen} />
              </button>

              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl p-2 z-50 border border-gray-100">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className={`flex items-center w-full px-3 py-2.5 text-sm rounded-lg transition-colors ${
                        i18n.language === lang.code
                          ? 'bg-amber-100 text-amber-700'
                          : 'text-gray-700 hover:bg-amber-50'
                      }`}
                      onClick={() => changeLanguage(lang.code)}
                    >
                      <img
                        src={lang.flag}
                        alt={lang.name}
                        className="w-5 h-4 rounded-sm mr-3"
                      />
                      <span className="font-medium">{lang.name}</span>
                      {i18n.language === lang.code && (
                        <CheckIcon className="ml-auto w-4 h-4 text-amber-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Account */}
            {user ? (
              <button
                className="p-2 text-gray-600 hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50"
                onClick={() => setIsSidebarOpen(true)}
                aria-label={t('header.user_menu')}
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-medium border-2 border-amber-200">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </button>
            ) : (
              <Link
                to="/login"
                className="p-2 text-gray-600 hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50"
                aria-label={t('header.login')}
              >
                <UserIcon />
              </Link>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-gray-600 hover:text-amber-600 relative transition-colors rounded-lg hover:bg-amber-50"
              aria-label={t('header.shopping_cart')}
            >
              <CartIcon />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium border-2 border-white">
                  {cartItemsCount > 99 ? '99+' : cartItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={t('header.menu')}
            >
              {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <nav className="px-4 py-3 space-y-1">
              {['/', '/products', '/about'].map((path, index) => (
                <Link
                  key={index}
                  to={path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActiveRoute(path)
                      ? 'bg-amber-50 text-amber-700'
                      : 'text-gray-700 hover:bg-amber-50/50 hover:text-amber-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {index === 0 && <HomeIcon className="w-5 h-5 mr-3" />}
                  {index === 1 && <ProductsIcon className="w-5 h-5 mr-3" />}
                  {index === 2 && <AboutIcon className="w-5 h-5 mr-3" />}
                  {t(`header.${path === '/' ? 'home' : path.slice(1)}`)}
                </Link>
              ))}

              <div className="border-t border-gray-200 my-2" />

              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserIcon className="w-5 h-5 mr-3" />
                    {t('header.profile')}
                  </Link>
                  <Link
                    to="/orders"
                    className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <OrderIcon className="w-5 h-5 mr-3" />
                    {t('header.my_orders')}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors text-left"
                  >
                    <LogoutIcon className="w-5 h-5 mr-3" />
                    {t('header.logout')}
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LoginIcon className="w-5 h-5 mr-3" />
                  {t('header.login')}
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* CART SIDEBAR */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* USER SIDEBAR */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-700 font-bold text-lg border-2 border-amber-200">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-4">
              <p className="font-semibold text-gray-800">{user?.name || t('header.user')}</p>
              <p className="text-sm text-gray-500">{user?.email || ''}</p>
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-gray-400 hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          <SidebarLink to="/profile" onClick={() => setIsSidebarOpen(false)}>
            <UserIcon />
            {t('header.profile')}
          </SidebarLink>

          <SidebarLink to="/cart" onClick={() => setIsSidebarOpen(false)}>
            <CartIcon />
            {t('header.shopping_cart')}
            {cartItemsCount > 0 && (
              <span className="ml-auto bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {cartItemsCount}
              </span>
            )}
          </SidebarLink>

          <SidebarLink to="/orders" onClick={() => setIsSidebarOpen(false)}>
            <OrderIcon />
            {t('header.my_orders')}
          </SidebarLink>

         

          <div className="border-t border-gray-100 my-3" />

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-colors"
          >
            <LogoutIcon />
            {t('header.logout')}
          </button>
        </nav>
      </aside>

      {/* SEARCH OVERLAY */}
      <div
        className={`fixed inset-0 z-50 flex items-start justify-center transition-all duration-300 ease-out
          ${isSearchOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => {
            setIsSearchOpen(false);
            setSearchResults([]);
          }}
        />

        <div
          ref={searchRef}
          className={`relative w-full max-w-2xl mx-4 mt-20 transition-transform duration-300 ease-out
            ${isSearchOpen ? 'scale-100' : 'scale-95'}`}
        >
          <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-2xl p-3 flex items-center">
            <SearchIcon className="w-5 h-5 text-gray-400 mx-3" />
            <input
              ref={searchRef}
              type="text"
              placeholder={t('header.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full px-2 py-3 text-lg border-none rounded-lg focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="p-2 text-amber-600 hover:text-amber-700 transition-colors ml-2"
            >
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </form>

          {/* SEARCH RESULTS */}
          {searchQuery && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white rounded-b-xl shadow-lg mt-1 max-h-96 overflow-y-auto z-50">
              <div className="p-2">
                <p className="text-xs text-gray-500 px-3 py-2">
                  {t('header.search_results')} "{searchQuery}"
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {searchResults.slice(0, 6).map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/Deetails/${product.id}`}
                      className="flex items-center p-2 hover:bg-amber-50 rounded-lg transition-all duration-200 group"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                        setIsSearchOpen(false);
                      }}
                    >
                      <div className="relative w-12 h-12 overflow-hidden rounded-md flex-shrink-0">
                        <img
                          src={`http://localhost:8000/${product.image}` || '/placeholder-product.jpg'}
                          alt={product.product_name || 'Product'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-800 group-hover:text-amber-700 transition-colors">
                          {product.product_name || 'Unnamed Product'}
                        </p>
                        <p className="text-xs text-amber-600 font-medium">
                          ${product.price || '0.00'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                {searchResults.length > 6 && (
                  <Link
                    to={`/products?search=${encodeURIComponent(searchQuery.trim())}`}
                    className="block text-center p-3 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors mt-2"
                    onClick={() => {
                      setSearchResults([]);
                      setIsSearchOpen(false);
                    }}
                  >
                    {t('header.view_all_results')} ({searchResults.length})
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* NO RESULTS */}
          {searchQuery && searchResults.length === 0 && productsLoaded && (
            <div className="absolute top-full left-0 right-0 bg-white rounded-b-xl shadow-lg mt-1 z-50">
              <div className="p-6 text-center">
                <div className="w-32 h-32 mx-auto">
                  <Lottie
                    animationData={animationdata}
                    loop={true}
                    autoplay={true}
                  />
                </div>
                <p className="mt-2 text-gray-700 font-medium">{t('header.no_products_found')}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {t('header.try_different_keywords')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* OVERLAY */}
      {(isSidebarOpen || isCartOpen || isSearchOpen || isMenuOpen) && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => {
            setIsSidebarOpen(false);
            setIsCartOpen(false);
            setIsSearchOpen(false);
            setIsMenuOpen(false);
            setSearchResults([]);
          }}
        />
      )}
    </>
  );
};

// Reusable Components
const SidebarLink = ({ to, onClick, children }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-colors"
  >
    {children}
  </Link>
);

// Icons (keep all your existing icon components)

export default Header;
const SearchIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ChevronIcon = ({ isOpen, className = "w-4 h-4 ml-1" }) => (
  <svg className={`${className} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const CheckIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const UserIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CartIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const OrderIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const LogoutIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const MenuIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

const CloseIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const HomeIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ProductsIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const AboutIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const HeartIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const LoginIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
);

const ArrowRightIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

