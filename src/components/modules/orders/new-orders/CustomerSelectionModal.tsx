"use client";
import React, { useState, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { Search, UserPlus, Phone, Mail, ChevronRight, Plus } from "lucide-react";
import InputField from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { toast } from "sonner";
import { useGetCustomersQuery, useCreateCustomerMutation } from "@/store/api/customerApi";
import { z } from "zod";

const customerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  phone: z.string().optional(),
});


interface CustomerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (customer: any) => void;
}

export const CustomerSelectionModal = ({
  isOpen,
  onClose,
  onSelect,
}: CustomerSelectionModalProps) => {
  const [search, setSearch] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });
  
  // API Hooks
  const { data: customersData, isLoading } = useGetCustomersQuery({ search }, { skip: !isOpen });
  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();

  const customers = customersData?.data || [];

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = customerSchema.safeParse(newCustomer);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Validasi gagal");
      return;
    }

    try {
      const res = await createCustomer(newCustomer).unwrap();
      toast.success("Customer baru berhasil ditambahkan!");
      onSelect(res.data);
      onClose();
      setIsAddingNew(false);
      setNewCustomer({ name: "", phone: "" });
    } catch (err: any) {
      toast.error(err?.data?.message || "Gagal mendaftarkan pelanggan");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      className="max-w-xl w-[95%] mx-auto"
    >
      {!isAddingNew ? (
        <div className="flex flex-col h-[600px]">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pilih Pelanggan</h3>
                <p className="text-sm text-gray-500">Cari atau tambahkan pelanggan baru untuk pesanan ini.</p>
              </div>
              <Button 
                onClick={() => setIsAddingNew(true)}
                variant="outline"
                size="sm"
                className="rounded-xl border-brand-100 dark:border-brand-900/30 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10"
                startIcon={<Plus size={16} />}
              >
                Baru
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari Nama atau Nomor Telepon..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 dark:text-white dark:placeholder-gray-500 border-none rounded-2xl focus:ring-2 focus:ring-brand-600 transition-all text-sm"
              />
            </div>
          </div>

          {/* Customer List */}
          <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
            <div className="space-y-3">
              {isLoading ? (
                <div className="py-20 text-center">
                   <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                   <p className="text-gray-500 text-sm mt-4">Memuat pelanggan...</p>
                </div>
              ) : customers.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-300">
                    <UserPlus size={32} />
                  </div>
                  <p className="text-gray-500 text-sm">Tidak ada pelanggan ditemukan.</p>
                  <Button variant="outline" onClick={() => setIsAddingNew(true)} className="text-brand-600 text-xs border-transparent hover:bg-transparent">
                    Tambah "{search}" sebagai pelanggan baru?
                  </Button>
                </div>
              ) : (
                customers.map((customer: any) => (
                  <button
                    key={customer.id}
                    onClick={() => {
                      onSelect(customer);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-brand-600 dark:hover:border-brand-500/50 hover:bg-brand-50/30 dark:hover:bg-brand-500/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-full flex items-center justify-center font-bold text-lg">
                        {customer.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors">
                          {customer.name}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-[10px] text-gray-500">
                            <Phone size={10} /> {customer.phone || "-"}
                          </span>
                          {customer.email && (
                            <span className="flex items-center gap-1 text-[10px] text-gray-500">
                              <Mail size={10} /> {customer.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{customer.points || 0} PTS</p>
                        <p className="text-[10px] text-gray-400">Loyalitas</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-600 transition-colors" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <Button variant="outline" onClick={onClose} className="w-full text-gray-400 border-none hover:bg-gray-50 dark:hover:bg-gray-800/50">
              Batal
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-6">
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => setIsAddingNew(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pelanggan Baru</h3>
              <p className="text-sm text-gray-500">Daftarkan pelanggan baru ke dalam sistem.</p>
            </div>
          </div>

          <form onSubmit={handleCreateCustomer} className="space-y-5">
            <div>
              <Label required>Nama Lengkap</Label>
              <InputField 
                placeholder="e.g. John Doe" 
                value={newCustomer.name}
                onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <Label>Nomor Telepon (Opsional)</Label>
                <InputField 
                  placeholder="08123456789" 
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddingNew(false)}>
                Kembali
              </Button>
              <Button type="submit" loading={isCreating} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20">
                Simpan & Pilih
              </Button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};
