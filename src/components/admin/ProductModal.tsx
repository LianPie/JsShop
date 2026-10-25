"use client";

import { useState, useEffect, FormEvent, useCallback } from "react";

export interface Product {
  id: number;
  name: string;
  price: number;
  boughtCount: number;
  image: string;
  dateCreated: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productToEdit: Product | null;
}

export default function ProductModal({
  isOpen,
  onClose,
  onSuccess,
  productToEdit,
}: ProductModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper to set file and manage object URL memory cleanly
  const applySelectedFile = useCallback((file: File) => {
    setImageFile(file);
    setPreviewUrl((prev) => {
      if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setPrice(productToEdit.price.toString());
      setPreviewUrl(productToEdit.image || "");
      setImageFile(null);
    } else {
      setName("");
      setPrice("");
      setPreviewUrl("");
      setImageFile(null);
    }
    setError("");
  }, [productToEdit, isOpen]);

  // 1. Listen for Ctrl+V / Cmd+V anywhere while the modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            // Ensure the pasted blob has a clean extension for your backend
            const ext = file.type.split("/")[1] || "png";
            const namedFile = new File([file], `pasted-${Date.now()}.${ext}`, {
              type: file.type,
            });
            applySelectedFile(namedFile);
          }
          break;
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isOpen, applySelectedFile]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      applySelectedFile(file);
    }
  };

  // 2. Optional button handler for clicking "Paste from Clipboard"
  const handleClipboardButton = async () => {
    setError("");
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((type) => type.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const ext = imageType.split("/")[1] || "png";
          const file = new File([blob], `clipboard-${Date.now()}.${ext}`, {
            type: imageType,
          });
          applySelectedFile(file);
          return;
        }
      }
      setError("No image found in your clipboard.");
    } catch {
      setError("Clipboard access denied. Try pressing Ctrl+V instead!");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const url = productToEdit
        ? `/api/products/${productToEdit.id}`
        : "/api/products";
      const method = productToEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            {productToEdit ? "Edit Product" : "Create Product"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="0.00"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Product Image
              </label>
              <button
                type="button"
                onClick={handleClipboardButton}
                className="text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                📋 Paste from clipboard
              </button>
            </div>

            <div className="mt-1 rounded-lg border-2 border-dashed border-gray-300 p-4 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-600 file:mr-4 file:rounded file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-2 text-xs text-gray-400">
                Or press <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-600">Ctrl+V</kbd> anywhere in this modal to paste an image
              </p>
            </div>

            {previewUrl && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-24 w-24 rounded border object-cover"
                />
                {imageFile && (
                  <span className="text-xs text-gray-500">
                    {imageFile.name} ({Math.round(imageFile.size / 1024)} KB)
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : productToEdit
                ? "Save Changes"
                : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}