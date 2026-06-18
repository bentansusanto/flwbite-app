import React, { useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import { useRoleHook } from "./hooks";

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleToEdit?: any;
}

export const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, roleToEdit }) => {
  const { formik, permissions, isLoadingPermissions } = useRoleHook({ onClose, roleToEdit });

  const groupedPermissions = useMemo(() => {
    return permissions.reduce((acc: Record<string, any[]>, p: any) => {
      const mod = p.module || "General";
      
      // Filter out platform-level modules that tenants shouldn't access
      const hiddenModules = ["tenants", "permissions", "plans", "subscriptions"];
      if (hiddenModules.includes(mod.toLowerCase())) return acc;

      if (!acc[mod]) acc[mod] = [];
      acc[mod].push(p);
      return acc;
    }, {});
  }, [permissions]);

  const handleTogglePermission = (id: string) => {
    const current = new Set(formik.values.permissions);
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    formik.setFieldValue("permissions", Array.from(current));
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={roleToEdit ? "Edit Role" : "Tambah Role Baru"} 
      className="max-w-2xl w-full"
    >
      <form onSubmit={formik.handleSubmit} className="flex flex-col max-h-[85vh] md:max-h-[85vh]">
        {/* Basic Info Section (Sticky Top) */}
        <div className="flex-shrink-0 flex flex-col gap-4 p-6 bg-white dark:bg-gray-900 rounded-t-2xl z-10 relative">
          <div>
            <Label htmlFor="name" required>Nama Role</Label>
            <InputField
              id="name"
              placeholder="Contoh: Manager"
              {...formik.getFieldProps("name")}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="mt-1.5 text-xs text-error-500 font-medium">{formik.errors.name as string}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <TextArea
              id="description"
              placeholder="Tuliskan deskripsi singkat mengenai tugas role ini"
              value={formik.values.description}
              onChange={(val) => formik.setFieldValue("description", val)}
              rows={2}
            />
            {formik.touched.description && formik.errors.description && (
              <p className="mt-1.5 text-xs text-error-500 font-medium">{formik.errors.description as string}</p>
            )}
          </div>
        </div>

        {/* Permissions Header (Sticky Top below Basic Info) */}
        <div className="flex-shrink-0 px-6 pt-4 pb-2 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-10 relative shadow-sm dark:shadow-none">
          <Label required className="text-base">Hak Akses (Permissions)</Label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pilih hak akses apa saja yang dapat dilakukan oleh role ini.
          </p>
        </div>

        {/* Permissions List Section (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-5 custom-scrollbar bg-gray-50/30 dark:bg-gray-900/10">
          {isLoadingPermissions ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(groupedPermissions).map(([moduleName, perms]: [string, any]) => (
                <div key={moduleName} className="p-5 rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900/60 shadow-xs">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 capitalize mb-3.5 tracking-tight">
                    {moduleName.replace(/_/g, " ")}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {perms.map((p: any) => {
                      const isChecked = formik.values.permissions.includes(p.id);
                      return (
                        <label 
                          key={p.id} 
                          className={`group flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            isChecked 
                              ? "border-brand-500 bg-brand-50/40 dark:border-brand-500/60 dark:bg-brand-500/10 shadow-sm shadow-brand-500/10" 
                              : "border-gray-100 bg-gray-50/50 hover:border-brand-200 hover:bg-brand-50/20 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-500/30"
                          }`}
                        >
                          <div className="flex mt-0.5 items-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePermission(p.id)}
                              className="w-4.5 h-4.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 focus:ring-offset-0 dark:border-gray-600 dark:bg-gray-800 dark:ring-offset-gray-900 transition-colors"
                            />
                          </div>
                          <div className="flex flex-col justify-center">
                            <span className={`text-sm font-semibold transition-colors ${isChecked ? "text-brand-900 dark:text-brand-100" : "text-gray-800 dark:text-gray-200"}`}>
                              {p.action}
                            </span>
                            {p.description && (
                              <span className={`text-xs mt-0.5 leading-relaxed transition-colors ${isChecked ? "text-brand-700/80 dark:text-brand-300/80" : "text-gray-500 dark:text-gray-400"}`}>
                                {p.description}
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          {formik.touched.permissions && formik.errors.permissions && (
            <p className="mt-2.5 text-xs text-error-500 font-medium">{formik.errors.permissions as string}</p>
          )}
        </div>

        {/* Footer Actions (Sticky Bottom) */}
        <div className="flex-shrink-0 flex justify-end gap-3 p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-10 relative rounded-b-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
          <Button variant="outline" type="button" onClick={onClose} className="w-full sm:w-auto">
            Batal
          </Button>
          <Button type="submit" disabled={formik.isSubmitting} className="w-full sm:w-auto min-w-[120px]">
            {formik.isSubmitting ? "Menyimpan..." : "Simpan Role"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
