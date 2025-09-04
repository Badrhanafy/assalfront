// Products.jsx
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from "../components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardTitle, CardDescription } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "../components/ui/sheet"
import { Skeleton } from "../components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Label } from "../components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "../components/ui/toggle-group"
import { X, Filter, Star, ChevronDown, SortAsc, Sparkles } from 'lucide-react';

// Background pattern component
const HoneycombPattern = () => (
  <div className="absolute inset-0 opacity-5">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <pattern id="honeycomb" x="0" y="0" width="100" height="86" patternUnits="userSpaceOnUse">
        <path d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z" fill="none" stroke="currentColor" strokeWidth="2" />
      </pattern>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#honeycomb)" />
    </svg>
  </div>
);

// Custom Icons
const Icon = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    sort: <SortAsc className={className} />,
    filter: <Filter className={className} />,
    close: <X className={className} />,
    chevronDown: <ChevronDown className={className} />,
    star: <Star className={className} />,
    sparkles: <Sparkles className={className} />
  };

  return icons[name] || null;
};

const Products = () => {
  const { t, i18n } = useTranslation();
  const [products, setProds] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  const isRTL = i18n.language === 'ar';
  const baseurl = import.meta.env.VITE_BACKEND_ENDPOINT;

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) count++;
    if (minRating > 0) count++;
    setActiveFilters(count);
  }, [priceRange, minRating, maxPrice]);

  /* ------------ fetch ------------ */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${baseurl}/api/products`);
        setProds(data);
        setFilteredProducts(data);

        if (data.length > 0) {
          const calculatedMaxPrice = Math.max(...data.map(p => p.price));
          setMaxPrice(Math.ceil(calculatedMaxPrice));
          setPriceRange([0, Math.ceil(calculatedMaxPrice)]);
        }
      } catch (err) {
        setError(t('products.fetch_error'));
        const fallback = [
          {
            id: 1,
            name: t('products.fallback.manuka.name'),
            price: 24.99,
            weight: '500g',
            onPromo: true,
            description: t('products.fallback.manuka.description'),
            ingredients: [t('products.fallback.manuka.ingredient1'), t('products.fallback.manuka.ingredient2')],
            image: 'https://images.unsplash.com/photo-1558645830-e2a3f5df8a4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            rating: 4.8,
          },
          {
            id: 2,
            name: t('products.fallback.lavender.name'),
            price: 19.99,
            weight: '400g',
            onPromo: false,
            description: t('products.fallback.lavender.description'),
            ingredients: [t('products.fallback.lavender.ingredient1'), t('products.fallback.lavender.ingredient2')],
            image: 'https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            rating: 4.5,
          },
        ];
        setProds(fallback);
        setFilteredProducts(fallback);
        setMaxPrice(30);
        setPriceRange([0, 30]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [t]);

  /* ------------ filtering and sorting ------------ */
  const applyFilters = useCallback(() => {
    let filtered = [...products];

    // Apply price filter
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Apply rating filter
    if (minRating > 0) {
      filtered = filtered.filter(p => p.rating >= minRating);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [sortBy, products, priceRange, minRating]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleSortChange = (value) => setSortBy(value);
  const handlePriceChange = (value) => setPriceRange(value);
  const handleRatingChange = (value) => setMinRating(value);

  const resetFilters = () => {
    setPriceRange([0, maxPrice]);
    setMinRating(0);
    setSortBy('default');
  };

  const sortOptions = [
    { key: 'default', label: t('products.sort_default'), icon: 'sort' },
    { key: 'price-low', label: t('products.sort_price_low') },
    { key: 'price-high', label: t('products.sort_price_high') },
    { key: 'rating', label: t('products.sort_rating'), icon: 'star' },
  ];

  if (loading)
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 to-orange-50" dir={isRTL ? 'rtl' : 'ltr'}>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 mt-24">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <Skeleton className="h-48 w-full bg-gradient-to-br from-amber-100 to-orange-100" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2 bg-amber-200" />
                  <Skeleton className="h-4 w-1/2 mb-3 bg-amber-200" />
                  <Skeleton className="h-4 w-full mb-2 bg-amber-200" />
                  <Skeleton className="h-4 w-2/3 mb-4 bg-amber-200" />
                  <Skeleton className="h-10 w-full bg-amber-300" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 to-orange-50" dir={isRTL ? 'rtl' : 'ltr'}>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-24">
          <Alert variant="destructive" className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <AlertTitle>{t('common.error')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 mt-24">
        {/* Page header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            {t('products.title')}
          </h1>
          <p className="text-amber-700 max-w-2xl mx-auto text-lg">{t('products.description')}</p>
        </motion.div>

        {/* Filter and sort header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-100"
        >
          <div className="text-sm text-amber-700">
            {t('products.showing')} <span className="font-semibold text-amber-600">{filteredProducts.length}</span>{' '}
            {t('products.of')} <span className="font-semibold text-amber-600">{products.length}</span>{' '}
            {t('products.products')}
          </div>

          <div className="flex items-center gap-4">
            {/* Sort dropdown */}
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px] bg-amber-50 border-amber-200 text-amber-800">
                <SelectValue placeholder={t('products.sort_default')} />
              </SelectTrigger>
              <SelectContent className="bg-amber-50 border-amber-200">
                {sortOptions.map(({ key, label }) => (
                  <SelectItem key={key} value={key} className="text-amber-800 hover:bg-amber-100">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter Button with badge */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 border-0 shadow-lg relative">
                  <Filter className="w-4 h-4" />
                  <span>{t('products.filters')}</span>
                  {activeFilters > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {activeFilters}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent 
                side={isRTL ? 'right' : 'left'} 
                className="w-full sm:max-w-md bg-gradient-to-b from-amber-100 to-orange-100 border-0"
              >
                <div className="relative h-full">
                  {/* Beautiful background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-200/20 via-orange-200/10 to-yellow-200/20">
                    <HoneycombPattern />
                  </div>
                  
                  <SheetHeader className="relative z-10">
                    <SheetTitle className="text-amber-900 flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      {t('products.filters')}
                    </SheetTitle>
                  </SheetHeader>

                  <div className="grid gap-6 py-6 relative z-10">
                    {/* Price range filter */}
                    <div className="space-y-4 bg-white/80 p-4 rounded-xl backdrop-blur-sm border border-amber-200">
                      <Label htmlFor="price-range" className="text-amber-800 font-semibold">
                        {t('products.price_range')}
                      </Label>
                      <Slider
                        id="price-range"
                        value={priceRange}
                        onValueChange={handlePriceChange}
                        max={maxPrice}
                        step={1}
                        className="my-6"
                      />
                      <div className="flex justify-between items-center text-amber-700">
                        <span className="text-sm">
                          {t('common.currency', { value: priceRange[0] })}
                        </span>
                        <span className="text-sm">
                          {t('common.currency', { value: priceRange[1] })}
                        </span>
                      </div>
                    </div>

                    {/* Rating filter */}
                    <div className="space-y-4 bg-white/80 p-4 rounded-xl backdrop-blur-sm border border-amber-200">
                      <Label className="text-amber-800 font-semibold">{t('products.minimum_rating')}</Label>
                      <ToggleGroup
                        type="single"
                        value={minRating.toString()}
                        onValueChange={(value) => handleRatingChange(Number(value))}
                        className="flex flex-wrap gap-2"
                      >
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <ToggleGroupItem 
                            key={rating} 
                            value={rating.toString()} 
                            className="flex items-center gap-1 bg-amber-100 data-[state=on]:bg-amber-500 data-[state=on]:text-white text-amber-800 border-amber-200"
                          >
                            <Star className="w-3 h-3 fill-current" />
                            <span>{rating}+</span>
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    </div>
                  </div>

                  <div className="flex gap-4 relative z-10">
                    <Button
                      variant="outline"
                      onClick={resetFilters}
                      className="flex-1 bg-white/80 text-amber-700 border-amber-300 hover:bg-amber-50"
                    >
                      {t('products.reset_filters')}
                    </Button>
                    <SheetClose asChild>
                      <Button className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                        {t('products.apply_filters')}
                      </Button>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </motion.div>

        {/* Products grid */}
        <div className="mb-12">
          {filteredProducts.length === 0 ? (
            <Card className="text-center py-16 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent>
                <div className="text-6xl mb-4">🍯</div>
                <CardTitle className="text-xl mb-2 text-amber-800">{t('products.no_products')}</CardTitle>
                <CardDescription className="text-amber-600">{t('products.check_back')}</CardDescription>
                <Button 
                  onClick={resetFilters}
                  className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                >
                  {t('products.reset_filters')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {filteredProducts.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                      <div className="relative overflow-hidden">
                        <div
                          className="h-48 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                          style={{
                            backgroundImage: `url(${p.image?.startsWith('http') ? p.image : `http://localhost:8000/${p.image}`})`,
                          }}
                        />
                        {p.onPromo && (
                          <Badge className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 border-0">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Sale
                          </Badge>
                        )}
                        {p.rating && (
                          <Badge className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-amber-600 border-amber-200">
                            <Star className="w-3 h-3 fill-current mr-1" />
                            {p.rating}
                          </Badge>
                        )}
                      </div>

                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <CardTitle className="text-lg font-semibold text-amber-900 line-clamp-1">
                            {p.product_name || p.name}
                          </CardTitle>
                          <span className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                            {t('common.currency', { value: p.price })}
                          </span>
                        </div>

                        <CardDescription className="text-sm text-amber-700 mb-4 line-clamp-2">
                          {p.description}
                        </CardDescription>

                        {Array.isArray(p.ingredients) && p.ingredients.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1">
                              {p.ingredients.slice(0, 2).map((ing, i) => (
                                <Badge key={i} variant="secondary" className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                                  {ing}
                                </Badge>
                              ))}
                              {p.ingredients.length > 2 && (
                                <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">
                                  +{p.ingredients.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <span className="text-xs text-amber-600">{p.weight}</span>
                          <Button asChild size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600">
                            <Link to={`/product/Deetails/${p.id}`}>
                              {t('products.see_details')}
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;