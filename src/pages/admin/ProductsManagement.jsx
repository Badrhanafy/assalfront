// src/pages/admin/ProductsManagement.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    price: '',
    weight: '',
    ingredients: [],
    image: null,
    on_promo: false,
    category_id: '',
    stock_quantity: 0
  });
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    
    const formDataToSend = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (key === 'image' && formData[key]) {
        formDataToSend.append('image', formData[key]);
      } else if (key === 'on_promo') {
        formDataToSend.append(key, formData[key] ? 1 : 0);
      } else if (key === 'ingredients') {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else if (formData[key] !== null) {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      if (editingProduct) {
        await axiosInstance.put(`/products/${editingProduct.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axiosInstance.post('/products', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        setValidationErrors(error.response.data.errors);
        setError('Please fix the validation errors below.');
      } else {
        setError('Failed to save product. Please try again.');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    
    let ingredientsArray = [];
    if (product.ingredients) {
      if (typeof product.ingredients === 'string') {
        try {
          ingredientsArray = JSON.parse(product.ingredients);
        } catch (e) {
          ingredientsArray = product.ingredients.split(',').map(i => i.trim());
        }
      } else if (Array.isArray(product.ingredients)) {
        ingredientsArray = product.ingredients;
      }
    }
    
    setFormData({
      product_name: product.product_name || product.name || '',
      description: product.description || '',
      price: product.price || '',
      weight: product.weight || '',
      ingredients: ingredientsArray,
      image: null,
      on_promo: product.on_promo || false,
      category_id: product.category_id || '',
      stock_quantity: product.stock_quantity || 0
    });
    
    // Set image preview if available
    if (product.image) {
      setImagePreview(`http://localhost:8000/${product.image}`);
    }
    
    setShowForm(true);
    setValidationErrors({});
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axiosInstance.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Failed to delete product. Please try again.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      
      // Create preview
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null
      });
    }
  };

  const addIngredient = () => {
    if (currentIngredient.trim() !== '') {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, currentIngredient.trim()]
      });
      setCurrentIngredient('');
    }
  };

  const removeIngredient = (index) => {
    const newIngredients = [...formData.ingredients];
    newIngredients.splice(index, 1);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleIngredientKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  const resetForm = () => {
    setFormData({
      product_name: '',
      description: '',
      price: '',
      weight: '',
      ingredients: [],
      image: null,
      on_promo: false,
      category_id: '',
      stock_quantity: 0
    });
    setCurrentIngredient('');
    setEditingProduct(null);
    setShowForm(false);
    setError('');
    setValidationErrors({});
    setImagePreview(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
        <button 
          className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition-colors"
          onClick={() => setShowForm(true)}
        >
          Add New Product
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Modal Overlay */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Blur Background */}
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"></div>
          
          {/* Modal Container */}
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            {/* Modal Panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                          <input
                            type="text"
                            name="product_name"
                            value={formData.product_name}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md ${
                              validationErrors.product_name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                          />
                          {validationErrors.product_name && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.product_name[0]}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                          <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md ${
                              validationErrors.price ? 'border-red-500' : 'border-gray-300'
                            }`}
                            step="0.01"
                            required
                          />
                          {validationErrors.price && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.price[0]}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md ${
                            validationErrors.description ? 'border-red-500' : 'border-gray-300'
                          }`}
                          rows="3"
                          required
                        />
                        {validationErrors.description && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.description[0]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients</label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={currentIngredient}
                            onChange={(e) => setCurrentIngredient(e.target.value)}
                            onKeyPress={handleIngredientKeyPress}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Add an ingredient"
                          />
                          <button
                            type="button"
                            onClick={addIngredient}
                            className="bg-amber-500 text-white px-3 py-2 rounded-md hover:bg-amber-600"
                          >
                            Add
                          </button>
                        </div>
                        
                        {formData.ingredients.length > 0 && (
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm text-gray-600 mb-2">Ingredients added:</p>
                            <div className="flex flex-wrap gap-2">
                              {formData.ingredients.map((ingredient, index) => (
                                <span 
                                  key={index} 
                                  className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full flex items-center"
                                >
                                  {ingredient}
                                  <button
                                    type="button"
                                    onClick={() => removeIngredient(index)}
                                    className="ml-1 text-amber-600 hover:text-amber-800"
                                  >
                                    &times;
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {validationErrors.ingredients && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.ingredients[0]}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Weight (grams)</label>
                          <input
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md ${
                              validationErrors.weight ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                          />
                          {validationErrors.weight && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.weight[0]}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                          <input
                            type="number"
                            name="stock_quantity"
                            value={formData.stock_quantity}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md ${
                              validationErrors.stock_quantity ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                          />
                          {validationErrors.stock_quantity && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.stock_quantity[0]}</p>
                          )}
                        </div>
                      </div>

                      {categories.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                          <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md ${
                              validationErrors.category_id ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                          >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                          {validationErrors.category_id && (
                            <p className="text-red-500 text-xs mt-1">{validationErrors.category_id[0]}</p>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                        
                        {imagePreview && (
                          <div className="mb-3">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="h-32 w-32 object-cover rounded-md border"
                            />
                          </div>
                        )}
                        
                        <input
                          type="file"
                          name="image"
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md ${
                              validationErrors.image ? 'border-red-500' : 'border-gray-300'
                            }`}
                          accept="image/*"
                          required={!editingProduct}
                        />
                        {validationErrors.image && (
                          <p className="text-red-500 text-xs mt-1">{validationErrors.image[0]}</p>
                        )}
                        {editingProduct && formData.image === null && (
                          <p className="text-sm text-gray-500 mt-1">Current image will be kept if no new file is selected.</p>
                        )}
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="on_promo"
                          checked={formData.on_promo}
                          onChange={handleInputChange}
                          className="mr-2"
                          id="on_promo"
                        />
                        <label htmlFor="on_promo" className="text-sm font-medium text-gray-700">
                          On Promotion
                        </label>
                      </div>
                      {validationErrors.on_promo && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.on_promo[0]}</p>
                      )}
                    </form>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-amber-500 text-base font-medium text-white hover:bg-amber-600 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                
                <button
                  type="button"
                  onClick={resetForm}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">No products found.</p>
          <button 
            className="mt-4 bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600"
            onClick={() => setShowForm(true)}
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(product => (
            <div key={product.id} className="bg-white shadow rounded-lg overflow-hidden transition-transform hover:scale-105">
              <img 
                src={`http://localhost:8000/${product.image}`} 
                alt={product.product_name || product.name} 
                className="h-48 w-full object-cover" 
              />
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900">{product.product_name || product.name}</h3>
                <p className="text-amber-600 font-bold">${product.price}</p>
                <p className="text-gray-500">{product.weight}g</p>
                <p className="text-gray-500 text-sm mt-2 line-clamp-2">{product.description}</p>
                
                {product.ingredients && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Ingredients:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(() => {
                        let ingredients = [];
                        if (typeof product.ingredients === 'string') {
                          try {
                            ingredients = JSON.parse(product.ingredients);
                          } catch (e) {
                            ingredients = product.ingredients.split(',').map(i => i.trim());
                          }
                        } else if (Array.isArray(product.ingredients)) {
                          ingredients = product.ingredients;
                        }
                        
                        return ingredients.slice(0, 3).map((ingredient, index) => (
                          <span key={index} className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                            {ingredient}
                          </span>
                        ));
                      })()}
                      {(() => {
                        let ingredientCount = 0;
                        if (typeof product.ingredients === 'string') {
                          try {
                            ingredientCount = JSON.parse(product.ingredients).length;
                          } catch (e) {
                            ingredientCount = product.ingredients.split(',').length;
                          }
                        } else if (Array.isArray(product.ingredients)) {
                          ingredientCount = product.ingredients.length;
                        }
                        
                        return ingredientCount > 3 ? (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                            +{ingredientCount - 3} more
                          </span>
                        ) : null;
                      })()}
                    </div>
                  </div>
                )}
                
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.on_promo && (
                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      On Promotion
                    </span>
                  )}
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Stock: {product.stock}
                  </span>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button 
                    className="text-amber-600 hover:text-amber-700 text-sm"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-700 text-sm"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;