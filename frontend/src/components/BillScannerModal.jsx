import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../services/api.js';
import { 
  X, 
  Sparkles, 
  UploadCloud, 
  Receipt, 
  Trash2, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Camera,
  Image as ImageIcon
} from 'lucide-react';

export default function BillScannerModal() {
  const { 
    isBillScannerOpen, 
    setIsBillScannerOpen, 
    openAddExpense, 
    showToast 
  } = useApp();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Editable fields after extraction
  const [merchantName, setMerchantName] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Food');
  const [items, setItems] = useState([]);
  const [tax, setTax] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [notes, setNotes] = useState('');

  if (!isBillScannerOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setScanResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setScanResult(null);
    }
  };

  // Run AI scan on uploaded bill
  const handleScan = async () => {
    if (!selectedFile) {
      showToast('Please select or drag a bill image first', 'error');
      return;
    }

    try {
      setIsScanning(true);
      const formData = new FormData();
      formData.append('receipt', selectedFile);

      const res = await api.scanBill(formData);
      if (res.success && res.data) {
        setScanResult(res.data);
        setMerchantName(res.data.merchantName || 'Scanned Store');
        setDate(res.data.date || new Date().toISOString().split('T')[0]);
        setCategory(res.data.category || 'Food');
        setItems(res.data.items || []);
        setTax(res.data.tax || 0);
        setTotalAmount(res.data.totalAmount || 0);
        setNotes(res.data.notes || '');
        showToast(res.data.message || 'Bill scanned successfully!');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsScanning(false);
    }
  };

  // Edit extracted line items
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    if (field === 'price' || field === 'quantity') {
      const q = Number(field === 'quantity' ? value : updated[index].quantity) || 0;
      const p = Number(field === 'price' ? value : updated[index].price) || 0;
      updated[index].totalPrice = Math.round(q * p * 100) / 100;
    }
    setItems(updated);

    // Recalculate total amount
    const itemsSum = updated.reduce((s, it) => s + (Number(it.totalPrice) || 0), 0);
    setTotalAmount(Math.round((itemsSum + Number(tax || 0)) * 100) / 100);
  };

  const handleAddItem = () => {
    setItems([...items, { name: '', quantity: 1, price: 0, totalPrice: 0 }]);
  };

  const handleRemoveItem = (idx) => {
    const updated = items.filter((_, i) => i !== idx);
    setItems(updated);
    const itemsSum = updated.reduce((s, it) => s + (Number(it.totalPrice) || 0), 0);
    setTotalAmount(Math.round((itemsSum + Number(tax || 0)) * 100) / 100);
  };

  const handleProceedToSplit = () => {
    if (!merchantName.trim()) {
      showToast('Please enter a merchant name', 'error');
      return;
    }
    if (Number(totalAmount) <= 0) {
      showToast('Total amount must be greater than 0', 'error');
      return;
    }

    // Pass extracted & edited data to AddExpenseModal
    openAddExpense({
      title: `${merchantName} Bill`,
      merchantName,
      amount: totalAmount,
      category,
      date,
      items,
      notes: notes || `Extracted with Gemini 3.8 Flash from ${merchantName}`
    });

    setIsBillScannerOpen(false);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    setIsBillScannerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-8 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0a0f1d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">AI Bill & Receipt Scanner</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400">Extract merchant, line items, and prices automatically</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Step 1: Upload or capture */}
          {!scanResult && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-3xl p-8 text-center bg-slate-900/50 hover:bg-slate-900/80 transition-all cursor-pointer relative group"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {previewUrl ? (
                  <div className="space-y-3">
                    <img 
                      src={previewUrl} 
                      alt="Bill Preview" 
                      className="max-h-60 mx-auto rounded-xl object-contain border border-slate-700 shadow-md"
                    />
                    <p className="text-xs text-slate-400 font-mono">
                      {selectedFile?.name} ({(selectedFile?.size / 1024).toFixed(1)} KB)
                    </p>
                    <p className="text-xs text-emerald-400 font-semibold">
                      Click or drop another image to replace
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        Drag & drop receipt photo, or <span className="text-emerald-400 underline">browse</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Supports PNG, JPG, WEBP receipt photos (Max 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Scan Trigger Button */}
              {selectedFile && (
                <button
                  type="button"
                  onClick={handleScan}
                  disabled={isScanning}
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 animate-spin" />
                  {isScanning ? 'Extracting with Gemini 3.8 Flash...' : 'Extract Bill with Gemini AI'}
                </button>
              )}
            </div>
          )}

          {/* Step 2: Verification and Editing Modal */}
          {scanResult && (
            <div className="space-y-5 animate-fade-in">
              
              {/* Notice */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <p className="font-semibold text-emerald-400">
                    Extracted via {scanResult.source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Smart Bill OCR'}
                  </p>
                  <p className="text-slate-400 mt-0.5">
                    Review and edit the extracted merchant, items, and prices below. You have 100% control before saving.
                  </p>
                </div>
              </div>

              {/* Merchant & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Merchant / Store Name
                  </label>
                  <input
                    type="text"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Extracted Line Items ({items.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <input
                        type="text"
                        value={it.name}
                        placeholder="Item name"
                        onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-emerald-500 outline-none"
                      />
                      <input
                        type="number"
                        value={it.quantity}
                        placeholder="Qty"
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-14 px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs text-center focus:border-emerald-500 outline-none"
                      />
                      <div className="relative w-24">
                        <span className="absolute left-2 top-1.5 text-slate-500 text-xs">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          value={it.price}
                          placeholder="Price"
                          onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                          className="w-full pl-5 pr-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs text-right focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtotal, Tax, Total */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Taxes / Service Charge (₹):</span>
                  <input
                    type="number"
                    step="0.01"
                    value={tax}
                    onChange={(e) => {
                      const newTax = Number(e.target.value) || 0;
                      setTax(newTax);
                      const itemsSum = items.reduce((s, it) => s + (Number(it.totalPrice) || 0), 0);
                      setTotalAmount(Math.round((itemsSum + newTax) * 100) / 100);
                    }}
                    className="w-24 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-slate-200 text-right text-xs focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-sm font-bold">
                  <span className="text-white">Calculated Total:</span>
                  <span className="text-emerald-400 font-mono text-base">₹{Number(totalAmount).toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setScanResult(null)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  ← Scan different image
                </button>
                <button
                  type="button"
                  onClick={handleProceedToSplit}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Proceed to Split <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
