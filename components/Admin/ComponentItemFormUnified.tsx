/**
 * File Path: /app/admin/components/(sub-components)/ComponentItemFormUnified.tsx
 * 
 * Purpose: Form component for creating and editing component items
 * - Integrated within the unified components page
 * - Handles dynamic filter fields based on selected component
 * - Manages image uploads (main + sub-images)
 * - Real-time slug validation
 * - Custom specifications management
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { X, Plus, Loader2, Eye, EyeOff } from 'lucide-react';

interface FilterField {
  label: string;
  value: string;
}

interface Specification {
  label: string;
  value: string;
}

interface ComponentItemFormUnifiedProps {
  componentId: string;
  componentName: string;
  filterLabels: string[];
  brands: any[];
  existingItem?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function ComponentItemFormUnified({
  componentId,
  componentName,
  filterLabels,
  brands,
  existingItem,
  onSubmit,
  onCancel,
}: ComponentItemFormUnifiedProps) {
  // Form state
  const [itemName, setItemName] = useState(existingItem?.itemName || '');
  const [slug, setSlug] = useState(existingItem?.slug || '');
  const [slugValidation, setSlugValidation] = useState<{ valid: boolean; message: string } | null>(null);
  const [slugCheckLoading, setSlugCheckLoading] = useState(false);
  const [brand, setBrand] = useState(existingItem?.brand?._id || '');
  const [model, setModel] = useState(existingItem?.model || '');
  const [unitPrice, setUnitPrice] = useState(existingItem?.unitPrice || '');
  const [availability, setAvailability] = useState(existingItem?.availability || 'InStock');
  const [description, setDescription] = useState(existingItem?.description || '');
  const [isNewArrival, setIsNewArrival] = useState(existingItem?.isNewArrival || false);

  // Filter values
  const [filterValues, setFilterValues] = useState<FilterField[]>(
    existingItem?.filterValues || filterLabels.map((label) => ({ label, value: '' }))
  );

  // Specifications
  const [specifications, setSpecifications] = useState<Specification[]>(
    existingItem?.specifications || []
  );

  // Image state
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState(existingItem?.mainImage || '');
  const [subImages, setSubImages] = useState<File[]>([]);
  const [subImagePreviews, setSubImagePreviews] = useState<string[]>(existingItem?.subImages || []);
  const [showImagePreviews, setShowImagePreviews] = useState(false);

  // Loading and validation state
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate slug from item name
  const generateSlug = useCallback((name: string) => {
    const newSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setSlug(newSlug);
    setSlugValidation(null);
  }, []);

  // Handle item name change
  const handleItemNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setItemName(newName);
    if (!existingItem) generateSlug(newName);
  };

  // Debounced slug validation
  useEffect(() => {
    if (!slug) return;

    const timer = setTimeout(async () => {
      setSlugCheckLoading(true);
      try {
        const response = await fetch('/api/admin/check-slug', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug,
            excludeId: existingItem?._id,
            type: 'component-item',
          }),
        });

        const data = await response.json();
        if (data.available) {
          setSlugValidation({ valid: true, message: 'Slug available ✓' });
        } else {
          setSlugValidation({ valid: false, message: 'Slug already taken' });
        }
      } catch (error) {
        setSlugValidation({ valid: false, message: 'Validation error' });
      } finally {
        setSlugCheckLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slug, existingItem?._id]);

  // Handle main image selection
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setMainImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle sub-image selection
  const handleSubImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSubImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSubImagePreviews((prev) => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove sub-image
  const removeSubImage = (index: number) => {
    setSubImages((prev) => prev.filter((_, i) => i !== index));
    setSubImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle filter value change
  const handleFilterChange = (index: number, value: string) => {
    setFilterValues((prev) => {
      const updated = [...prev];
      updated[index].value = value;
      return updated;
    });
  };

  // Add specification
  const addSpecification = () => {
    setSpecifications((prev) => [...prev, { label: '', value: '' }]);
  };

  // Update specification
  const updateSpecification = (index: number, field: 'label' | 'value', value: string) => {
    setSpecifications((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Remove specification
  const removeSpecification = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!itemName.trim()) newErrors.itemName = 'Item name is required';
    if (!slug.trim()) newErrors.slug = 'Slug is required';
    if (slugValidation && !slugValidation.valid) newErrors.slug = 'Slug is invalid';
    if (!model.trim()) newErrors.model = 'Model is required';
    if (!unitPrice) newErrors.unitPrice = 'Price is required';
    if (isNaN(Number(unitPrice))) newErrors.unitPrice = 'Price must be a valid number';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (description.length < 10) newErrors.description = 'Description must be at least 10 characters';

    // Check filter values
    filterValues.forEach((filter, index) => {
      if (!filter.value.trim()) {
        newErrors[`filter_${index}`] = `${filter.label} is required`;
      }
    });

    // Check main image
    if (!existingItem && !mainImage && !mainImagePreview) {
      newErrors.mainImage = 'Main image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      // Basic fields
      formData.append('itemName', itemName);
      formData.append('slug', slug);
      formData.append('component', componentId);
      formData.append('brand', brand || '');
      formData.append('model', model);
      formData.append('unitPrice', unitPrice.toString());
      formData.append('availability', availability);
      formData.append('description', description);
      formData.append('isNewArrival', isNewArrival.toString());

      // Filter values
      formData.append('filterValues', JSON.stringify(filterValues));

      // Specifications
      formData.append('specifications', JSON.stringify(specifications));

      // Images
      if (mainImage) {
        formData.append('mainImage', mainImage);
      }

      subImages.forEach((file) => {
        formData.append('subImages', file);
      });

      await onSubmit(formData);
      toast.success(`Item ${existingItem ? 'updated' : 'created'} successfully!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {existingItem ? 'Edit Item' : 'Add New Item'}
        </h3>
        <p className="text-sm text-gray-600">Component: <span className="font-medium">{componentName}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Item Name and Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
            <input
              type="text"
              value={itemName}
              onChange={handleItemNameChange}
              placeholder="e.g., Samsung 970 EVO Plus 512GB"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none ${
                errors.itemName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.itemName && <p className="text-xs text-red-500 mt-1">{errors.itemName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
            <div className="relative">
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none ${
                  errors.slug ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {slugCheckLoading && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-gray-400" />}
              {slugValidation && !slugCheckLoading && (
                <span className={`absolute right-3 top-2.5 text-xs font-medium ${slugValidation.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {slugValidation.valid ? '✓' : '✗'}
                </span>
              )}
            </div>
            {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug}</p>}
            {slugValidation && <p className={`text-xs mt-1 ${slugValidation.valid ? 'text-green-600' : 'text-red-600'}`}>{slugValidation.message}</p>}
          </div>
        </div>

        {/* Dynamic Filter Fields */}
        {filterLabels.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Component Specifications *</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filterValues.map((filter, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{filter.label} *</label>
                  <input
                    type="text"
                    value={filter.value}
                    onChange={(e) => handleFilterChange(index, e.target.value)}
                    placeholder={`Enter ${filter.label.toLowerCase()}`}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none ${
                      errors[`filter_${index}`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors[`filter_${index}`] && (
                    <p className="text-xs text-red-500 mt-1">{errors[`filter_${index}`]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brand, Model, Price */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            >
              <option value="">Select a brand</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.brandName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g., 970EVO+512"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none ${
                errors.model ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (LKR) *</label>
            <input
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="0"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none ${
                errors.unitPrice ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.unitPrice && <p className="text-xs text-red-500 mt-1">{errors.unitPrice}</p>}
          </div>
        </div>

        {/* Availability and New Arrival */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Availability *</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            >
              <option value="InStock">In Stock</option>
              <option value="OutOfStock">Out of Stock</option>
              <option value="PreOrder">Pre-Order</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-700">Mark as New Arrival</span>
            </label>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description * <span className="text-xs text-gray-500">({description.length}/2000)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter detailed description..."
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
        </div>

        {/* Images */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Images *</h4>
          
          {/* Main Image */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Main Image *</label>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageChange}
                      className="hidden"
                    />
                    <p className="text-sm text-gray-600">Click to upload main image</p>
                  </div>
                </label>
              </div>
              {(mainImagePreview || mainImage) && (
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={mainImagePreview}
                    alt="Main preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            {errors.mainImage && <p className="text-xs text-red-500 mt-1">{errors.mainImage}</p>}
          </div>

          {/* Sub Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images (optional)</label>
            <label className="cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSubImagesChange}
                  className="hidden"
                />
                <p className="text-sm text-gray-600">Click to upload additional images</p>
              </div>
            </label>

            {subImagePreviews.length > 0 && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowImagePreviews(!showImagePreviews)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2"
                >
                  {showImagePreviews ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showImagePreviews ? 'Hide' : 'Show'} Previews
                </button>

                {showImagePreviews && (
                  <div className="grid grid-cols-4 gap-3">
                    {subImagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Sub ${index}`}
                          className="w-full h-20 rounded-lg object-cover border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeSubImage(index)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  {subImagePreviews.length} image{subImagePreviews.length !== 1 ? 's' : ''} added
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Specifications */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Additional Specifications</h4>
            <button
              type="button"
              onClick={addSpecification}
              className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>

          {specifications.length > 0 && (
            <div className="space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={spec.label}
                    onChange={(e) => updateSpecification(index, 'label', e.target.value)}
                    placeholder="Label (e.g., Color)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                    placeholder="Value (e.g., Black)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="text-red-600 hover:text-red-700 p-2 rounded hover:bg-red-50 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {existingItem ? 'Update Item' : 'Create Item'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}