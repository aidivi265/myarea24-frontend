import React, { useState } from 'react';
import {
  MerchantProductItem,
  MerchantServiceItem,
  MerchantBusinessInfo,
} from '../types';
import {
  Package,
  Wrench,
  Search,
  Filter,
  Plus,
  Eye,
  MessageSquare,
  MoreVertical,
  CheckCircle2,
  Clock,
  PauseCircle,
  Archive,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface MerchantProductsDashboardProps {
  business: MerchantBusinessInfo;
  products: MerchantProductItem[];
  services: MerchantServiceItem[];
  onToggleProductStatus: (id: string) => void;
  onToggleServiceStatus: (id: string) => void;
  onOpenAddProductModal: () => void;
  onOpenAddServiceModal: () => void;
}

export function MerchantProductsDashboard({
  business,
  products,
  services,
  onToggleProductStatus,
  onToggleServiceStatus,
  onOpenAddProductModal,
  onOpenAddServiceModal,
}: MerchantProductsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'services' | 'categories'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.category.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const filteredServices = services.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.category.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalProductsCount = products.length;
  const totalServicesCount = services.length;
  const activeListings = products.filter((p) => p.status === 'Active').length + services.filter((s) => s.status === 'Active').length;
  const inReviewCount = products.filter((p) => p.status === 'In Review').length + services.filter((s) => s.status === 'In Review').length;
  const pausedCount = products.filter((p) => p.status === 'Paused').length + services.filter((s) => s.status === 'Paused').length;

  return (
    <div className="space-y-6">
      {/* =========================================================================
          HERO BANNER
         ========================================================================= */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#1E124A] via-[#2A1860] to-[#3B1F8C] p-6 sm:p-8 text-white overflow-hidden shadow-xl border border-indigo-900/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Products & Services
            </h1>
            <p className="text-sm text-purple-200/90 leading-relaxed">
              Showcase what you offer, attract nearby customers and keep your listings up to date.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4 shrink-0 shadow-lg">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/30">
              <img
                src={business.coverImage}
                alt={business.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{business.name}</p>
              <div className="flex items-center gap-3 text-xs text-purple-200 mt-1">
                <span>
                  <strong className="text-white font-extrabold">{products.length}</strong> Products
                </span>
                <span>•</span>
                <span>
                  <strong className="text-white font-extrabold">{services.length}</strong> Services
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          FILTER BAR & TABS
         ========================================================================= */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Left Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Listings' },
            { id: 'products', label: `Products (${products.length})` },
            { id: 'services', label: `Services (${services.length})` },
            { id: 'categories', label: 'Categories' },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Search & Add Actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search products or services..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-purple-600"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              const nextStatus = statusFilter === 'all' ? 'active' : statusFilter === 'active' ? 'in review' : 'all';
              setStatusFilter(nextStatus);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter: {statusFilter.toUpperCase()}</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New</span>
            </button>
            {dropdownOpen && (
              <div
                onClick={() => setDropdownOpen(false)}
                className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-20"
              >
                <button
                  type="button"
                  onClick={onOpenAddProductModal}
                  className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition flex items-center gap-2"
                >
                  <Package className="w-4 h-4 text-purple-600" />
                  <span>Add Product</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenAddServiceModal}
                  className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition flex items-center gap-2"
                >
                  <Wrench className="w-4 h-4 text-indigo-600" />
                  <span>Add Service</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          METRIC STATUS PILLS ROW
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Total Products</span>
            <Package className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{totalProductsCount}</p>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
            Active in catalog
          </span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Total Services</span>
            <Wrench className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900">{totalServicesCount}</p>
          <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-0.5">
            Registered offerings
          </span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Active Listings</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-extrabold text-emerald-700">{activeListings}</p>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
            Live for neighborhood
          </span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">In Review</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-amber-600">{inReviewCount}</p>
          <span className="text-[10px] text-slate-400">Approval pending</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Paused</span>
            <PauseCircle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="text-xl font-extrabold text-rose-600">{pausedCount}</p>
          <span className="text-[10px] text-slate-400">Temporarily hidden</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500">Archived</span>
            <Archive className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-xl font-extrabold text-slate-500">0</p>
          <span className="text-[10px] text-slate-400">No archived items</span>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: PRODUCTS GRID
         ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'products') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-600" />
                Products
              </h3>
              <p className="text-xs text-slate-500">
                Manage your food, beverages and other products
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className="text-xs font-bold text-purple-600 hover:text-purple-700"
            >
              View All &gt;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-sm transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-28 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                        prod.status === 'Active'
                          ? 'bg-emerald-500 text-white'
                          : prod.status === 'In Review'
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {prod.status}
                    </span>
                  </div>

                  <div className="p-3">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {prod.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => alert(`Options for ${prod.name}`)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-2">{prod.category}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900">
                        ₹{prod.price}
                      </span>
                      {/* Interactive Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => onToggleProductStatus(prod.id)}
                        className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                          prod.status === 'Active' ? 'bg-purple-600' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                            prod.status === 'Active' ? 'left-4' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-slate-400" />
                    {prod.views >= 1000 ? `${(prod.views / 1000).toFixed(1)}K` : prod.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-slate-400" />
                    {prod.enquiries} Enquiries
                  </span>
                </div>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-8 px-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 text-center">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">Your Storefront Catalog is Ready</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                  Welcome to {business.name}! No products added yet. Click "+ Add New Product" below to list inventory and broadcast items to nearby residents.
                </p>
                <button
                  type="button"
                  onClick={onOpenAddProductModal}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-sm inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Product</span>
                </button>
              </div>
            )}

            {/* + Add New Product Dashed Card */}
            <div
              onClick={onOpenAddProductModal}
              className="rounded-2xl border-2 border-dashed border-purple-200 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50 p-4 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[200px]"
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
                <Plus className="w-5 h-5" />
              </div>
              <h5 className="text-xs font-bold text-purple-900">Add New Product</h5>
              <p className="text-[10px] text-purple-600 mt-1">
                Add food, beverages, groceries or goods to your listing
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: SERVICES GRID
         ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'services') && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-indigo-600" />
                Services
              </h3>
              <p className="text-xs text-slate-500">
                List the services you offer, such as event hosting, catering or custom orders
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('services')}
              className="text-xs font-bold text-purple-600 hover:text-purple-700"
            >
              View All &gt;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {filteredServices.map((srv) => (
              <div
                key={srv.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-sm transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-28 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={srv.image}
                      alt={srv.name}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                        srv.status === 'Active'
                          ? 'bg-emerald-500 text-white'
                          : srv.status === 'In Review'
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {srv.status}
                    </span>
                  </div>

                  <div className="p-3">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {srv.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => alert(`Options for ${srv.name}`)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-2">{srv.category}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-slate-900 truncate">
                        {srv.priceText}
                      </span>
                      {/* Interactive Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => onToggleServiceStatus(srv.id)}
                        className={`w-8 h-4.5 rounded-full transition-colors relative cursor-pointer ${
                          srv.status === 'Active' ? 'bg-indigo-600' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                            srv.status === 'Active' ? 'left-4' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-slate-400" />
                    {srv.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-slate-400" />
                    {srv.enquiries} Enquiries
                  </span>
                </div>
              </div>
            ))}

            {/* + Add New Service Dashed Card */}
            <div
              onClick={onOpenAddServiceModal}
              className="rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/40 hover:bg-indigo-50 p-4 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[200px]"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2">
                <Plus className="w-5 h-5" />
              </div>
              <h5 className="text-xs font-bold text-indigo-900">Add New Service</h5>
              <p className="text-[10px] text-indigo-600 mt-1">
                Add a service you offer to nearby customers
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
