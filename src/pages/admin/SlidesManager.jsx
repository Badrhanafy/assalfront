// src/pages/admin/SlidesManager.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const SlidesManager = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null,
    cta_text: 'Learn More',
    link: '',
    is_active: 1,
    order: 0
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  // Create axios instance with default config
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_ENDPOINT,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  const fetchSlides = async () => {
    try {
      const response = await axiosInstance.get('/api/slides');
      setSlides(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching slides:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (key === 'image' && formData[key]) {
        formDataToSend.append('image', formData[key]);
      } else if (formData[key] !== null) {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      if (editingSlide) {
        await axiosInstance.put(`/api/slides/${editingSlide.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axiosInstance.post('/api/slides', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      resetForm();
      fetchSlides();
    } catch (error) {
      console.error('Error saving slide:', error);
    }
  };

  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      description: slide.description,
      image: null,
      cta_text: slide.cta_text,
      link: slide.link || '',
      is_active: slide.is_active,
      order: slide.order
    });
    
    // Set image preview for existing slide
    if (slide.image) {
      setImagePreview(`${import.meta.env.VITE_BACKEND_ENDPOINT}/${slide.image}`);
    }
    
    setShowFormModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this slide?')) {
      try {
        await axiosInstance.delete(`/api/slides/${id}`);
        fetchSlides();
      } catch (error) {
        console.error('Error deleting slide:', error);
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
      setFormData({ ...formData, [name]: checked ? 1 : 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: null,
      cta_text: 'Learn More',
      link: '',
      is_active: 1,
      order: 0
    });
    setEditingSlide(null);
    setShowFormModal(false);
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Slides</h1>
        <button
          onClick={() => setShowFormModal(true)}
          className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition-colors"
        >
          Add New Slide
        </button>
      </div>

      {/* Modal Form */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Blur Background */}
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"></div>
          
          {/* Modal Container */}
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            {/* Modal Panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {editingSlide ? 'Edit Slide' : 'Add New Slide'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                          <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">CTA Text</label>
                          <input
                            type="text"
                            name="cta_text"
                            value={formData.cta_text}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          rows="3"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                          <input
                            type="url"
                            name="link"
                            value={formData.link}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="https://example.com"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                          <input
                            type="number"
                            name="order"
                            value={formData.order}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                        
                        {imagePreview && (
                          <div className="mb-3">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="h-32 w-full object-cover rounded-md border"
                            />
                          </div>
                        )}
                        
                        <input
                          type="file"
                          name="image"
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          accept="image/*"
                          required={!editingSlide}
                        />
                        {editingSlide && formData.image === null && (
                          <p className="text-sm text-gray-500 mt-1">Current image will be kept if no new file is selected.</p>
                        )}
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Active</span>
                      </div>
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
                  {editingSlide ? 'Update Slide' : 'Add Slide'}
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

      {/* Slides Grid */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Existing Slides</h2>
        
        {slides.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No slides found.</p>
            <button
              onClick={() => setShowFormModal(true)}
              className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600"
            >
              Create Your First Slide
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slides.map(slide => (
              <div key={slide.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div 
                  className="h-40 bg-cover bg-center mb-3 rounded" 
                  style={{ backgroundImage: `url(http://localhost:8000/storage/${slide.image})` }}
                ></div>
                <h3 className="font-semibold mb-1 text-gray-900">{slide.title}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{slide.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className={`px-2 py-1 text-xs rounded ${slide.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {slide.is_active ? 'Active' : 'Inactive'} 
                  </span>
                  <span className="text-xs text-gray-500">Order: {slide.order}</span>
                </div>
                {slide.cta_text && (
                  <div className="mb-3">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      CTA: {slide.cta_text}
                    </span>
                  </div>
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(slide)}
                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SlidesManager;