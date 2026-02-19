/**
 * File Path: /app/admin/components/(sub-components)/ComponentItemsListUnified.tsx
 * 
 * Purpose: List component for displaying component items
 * - Professional table layout
 * - Quick actions (view, edit, delete)
 * - Details modal
 * - Image preview
 * - Status badges
 */

'use client';

import { useState, useMemo } from 'react';
import { Eye, Trash2, Edit2, ImageIcon, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ComponentItem {
  _id: string;
  itemName: string;
  slug: string;
  brand?: { brandName: string };
  model: string;
  unitPrice: number;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  isNewArrival: boolean;
  mainImage: string;
  subImages: string[];
  filterValues: { label: string; value: string }[];
  specifications: { label: string; value: string }[];
  description: string;
}

interface ComponentItemsListUnifiedProps {
  items: ComponentItem[];
  isLoading?: boolean;
  onEdit: (item: ComponentItem) => void;
  onDelete: (itemId: string) => Promise<void>;
  searchQuery?: string;
}

export function ComponentItemsListUnified({
  items,
  isLoading,
  onEdit,
  onDelete,
  searchQuery = '',
}: ComponentItemsListUnifiedProps) {
  const [selectedItem, setSelectedItem] = useState<ComponentItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.itemName.toLowerCase().includes(query) ||
        item.slug.toLowerCase().includes(query) ||
        item.model.toLowerCase().includes(query) ||
        item.brand?.brandName.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  // Handle delete
  const handleDelete = async (itemId: string) => {
    setDeleting(itemId);
    try {
      await onDelete(itemId);
      setDeleteConfirm(null);
      toast.success('Item deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete item');
    } finally {
      setDeleting(null);
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'InStock':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'OutOfStock':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'PreOrder':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getAvailabilityLabel = (status: string) => {
    switch (status) {
      case 'InStock':
        return 'In Stock';
      case 'OutOfStock':
        return 'Out of Stock';
      case 'PreOrder':
        return 'Pre-Order';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No items found</p>
        <p className="text-sm text-gray-500">Create your first item to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Brand & Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Availability
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition">
                  {/* Item with Image */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                        {item.mainImage ? (
                          <img
                            src={item.mainImage}
                            alt={item.itemName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{item.itemName}</p>
                        <p className="text-xs text-gray-500">{item.slug}</p>
                        {item.isNewArrival && (
                          <span className="inline-block mt-1 text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200">
                            New Arrival
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Brand & Model */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm text-gray-900">{item.brand?.brandName || '—'}</p>
                      <p className="text-xs text-gray-500">{item.model}</p>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">LKR {item.unitPrice.toLocaleString()}</p>
                  </td>

                  {/* Availability */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getAvailabilityColor(item.availability)}`}>
                      {getAvailabilityLabel(item.availability)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 hover:text-gray-900"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 hover:text-gray-900"
                        title="Edit item"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(item._id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition text-red-600 hover:text-red-700"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{selectedItem.itemName}</h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Images */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Images</h3>
                <div className="space-y-3">
                  {selectedItem.mainImage && (
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Main Image</p>
                      <img
                        src={selectedItem.mainImage}
                        alt="Main"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                  {selectedItem.subImages.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Additional Images ({selectedItem.subImages.length})</p>
                      <div className="grid grid-cols-4 gap-3">
                        {selectedItem.subImages.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Sub ${idx}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Slug</p>
                  <p className="text-sm font-medium text-gray-900">{selectedItem.slug}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Brand</p>
                  <p className="text-sm font-medium text-gray-900">{selectedItem.brand?.brandName || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Model</p>
                  <p className="text-sm font-medium text-gray-900">{selectedItem.model}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Price</p>
                  <p className="text-sm font-medium text-gray-900">LKR {selectedItem.unitPrice.toLocaleString()}</p>
                </div>
              </div>

              {/* Availability */}
              <div>
                <p className="text-xs text-gray-600 mb-2">Availability</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getAvailabilityColor(selectedItem.availability)}`}>
                  {getAvailabilityLabel(selectedItem.availability)}
                </span>
              </div>

              {/* Filter Values */}
              {selectedItem.filterValues.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 mb-2">Specifications</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedItem.filterValues.map((filter, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-600">{filter.label}</p>
                        <p className="text-sm font-medium text-gray-900">{filter.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <p className="text-xs text-gray-600 mb-2">Description</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedItem.description}</p>
              </div>

              {/* Additional Specs */}
              {selectedItem.specifications && selectedItem.specifications.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 mb-2">Additional Specifications</p>
                  <div className="space-y-2">
                    {selectedItem.specifications.map((spec, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">{spec.label}</span>
                        <span className="font-medium text-gray-900">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={() => {
                  onEdit(selectedItem);
                  setSelectedItem(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" /> Edit Item
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">Delete Item?</h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              This action cannot be undone. All associated images will be deleted from cloud storage.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting === deleteConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting === deleteConfirm && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}