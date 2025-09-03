// Products.jsx
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
//import {  Slider,  Select,  SelectContent,  SelectItem,  SelectTrigger,  SelectValue,  Button,  Card,  CardContent,  CardTitle,CardDescription,  Badge,Sheet,  SheetContent,  SheetHeader,  SheetTitle,  SheetTrigger,  SheetClose,  Skeleton,  Alert,  AlertDescription,  AlertTitle,  Label,  ToggleGroup,  ToggleGroupItem} from '../components/ui'; // Adjust path based on your structure
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
/* ---------- Custom Icons ---------- */
const Icon = ({ name, className = "w-5 h-5" }) => {
  const paths = {
    sort: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l6 6 6-6M4 12h16" />
    ),
    filter: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    ),
    close: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    ),
    chevronDown: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    ),
    star: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    )
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
    >
      {paths[name]}
    </svg>
  );
};

/* ---------- Component ---------- */
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

  const isRTL = i18n.language === 'ar';
const baseurl = import.meta.env.VITE_BACKEND_ENDPOINT
  /* ------------ fetch ------------ */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${baseurl}/api/products`);
        setProds(data);
        setFilteredProducts(data);

        // Calculate max price for range slider
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
            image:
              'https://images.unsplash.com/photo-1558645830-e2a3f5df8a4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
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
            image:
              'https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            rating: 4.5,
          },
          {
            id: 3,
            name: t('products.fallback.ginger.name'),
            price: 22.99,
            weight: '450g',
            onPromo: true,
            description: t('products.fallback.ginger.description'),
            ingredients: [
              t('products.fallback.ginger.ingredient1'),
              t('products.fallback.ginger.ingredient2'),
              t('products.fallback.ginger.ingredient3'),
            ],
            image:
              'https://images.unsplash.com/photo-1558645830-e2a3f5df8a4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            rating: 4.2,
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
        // Keep original order
        break;
    }

    setFilteredProducts(filtered);
  }, [sortBy, products, priceRange, minRating]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  /* ------------ handlers ------------ */
  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const handlePriceChange = (value) => {
    setPriceRange(value);
  };

  const handleRatingChange = (value) => {
    setMinRating(value);
  };

  const sortOptions = [
    { key: 'default', label: t('products.sort_default'), icon: 'sort' },
    { key: 'price-low', label: t('products.sort_price_low') },
    { key: 'price-high', label: t('products.sort_price_high') },
    { key: 'rating', label: t('products.sort_rating'), icon: 'star' },
  ];

  /* ------------ render ------------ */
  if (loading)
    return (
      <div className="min-h-screen flex flex-col bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 mt-24">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <Skeleton className="h-10 w-full" />
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
      <div className="min-h-screen flex flex-col bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-24">
          <Alert variant="destructive">
            <AlertTitle>{t('common.error')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 mt-24">
        {/* page header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('products.title')}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">{t('products.description')}</p>
        </div>

        {/* Filter and sort header */}
        <div className="flex  flex-col md:flex-row justify-between items-center mb-8 gap-4 ">
          <div className="text-sm text-gray-600">
            {t('products.showing')} <span className="font-semibold text-blue-600">{filteredProducts.length}</span>{' '}
            {t('products.of')} <span className="font-semibold text-blue-600">{products.length}</span>{' '}
            {t('products.products')}
          </div>

          <div className="flex items-center gap-4 ">
            {/* Sort dropdown */}
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('products.sort_default')} />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(({ key, label }) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter Sheet */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen} >
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-blue-400">
                  <Icon name="filter" />
                  <span>{t('products.filters')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side={isRTL ? 'right' : 'left'} className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>{t('products.filters')}</SheetTitle>
                </SheetHeader>

                <div className="grid gap-6 py-6 bg-bluee-400">
                  {/* Price range filter */}
                  <div className="space-y-4">
                    <Label htmlFor="price-range">{t('products.price_range')}</Label>
                    <Slider
                      id="price-range"
                      value={priceRange}
                      onValueChange={handlePriceChange}
                      max={maxPrice}
                      step={1}
                      className="my-6"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {t('common.currency', { value: priceRange[0] })}
                      </span>
                      <span className="text-sm text-gray-600">
                        {t('common.currency', { value: priceRange[1] })}
                      </span>
                    </div>
                  </div>

                  {/* Rating filter */}
                  <div className="space-y-4 ">
                    <Label>{t('products.minimum_rating')}</Label>
                    <ToggleGroup
                      type="single"
                      value={minRating.toString()}
                      onValueChange={(value) => handleRatingChange(Number(value))}
                      className="flex flex-wrap gap-2"
                    >
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <ToggleGroupItem key={rating} value={rating.toString()} className="flex items-center gap-1">
                          <span className="text-amber-400">★</span> {rating}+
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPriceRange([0, maxPrice]);
                      setMinRating(0);
                    }}
                    className="flex-1"
                  >
                    {t('products.reset_filters')}
                  </Button>
                  <SheetClose asChild>
                    <Button className="flex-1">{t('products.apply_filters')}</Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Products grid */}
        <div className="mb-12">
          {filteredProducts.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <div className="text-6xl mb-4">🛍️</div>
                <CardTitle className="text-xl mb-2">{t('products.no_products')}</CardTitle>
                <CardDescription>{t('products.check_back')}</CardDescription>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredProducts.map((p) => (
                <Card
                  key={p.id}
                  className="group overflow-hidden transition-all duration-300 hover:shadow-lg"
                >
                  <div className="relative overflow-hidden">
                    <div
                      className="h-48 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{
                        backgroundImage: `url(${p.image?.startsWith('http') ? p.image : `http://localhost:8000/${p.image}`})`,
                      }}
                    />
                    {p.onPromo && (
                      <Badge className="absolute top-3 right-3 bg-blue-500">
                        Sale
                      </Badge>
                    )}
                    {p.rating && (
                      <Badge className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm text-amber-600">
                        ★ {p.rating}
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-sm line-clamp-1">
                        {p.product_name || p.name}
                      </CardTitle>
                      <span className="text-base font-bold text-blue-600 whitespace-nowrap">
                        {t('common.currency', { value: p.price })}
                      </span>
                    </div>

                    <CardDescription className="text-xs mb-3 line-clamp-2">
                      {p.description}
                    </CardDescription>

                    {Array.isArray(p.ingredients) && p.ingredients.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {p.ingredients.slice(0, 2).map((ing, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {ing}
                            </Badge>
                          ))}
                          {p.ingredients.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{p.ingredients.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{p.weight}</span>
                      <Button asChild size="sm">
                        <Link to={`/product/Deetails/${p.id}`}>
                          {t('products.see_details')}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;