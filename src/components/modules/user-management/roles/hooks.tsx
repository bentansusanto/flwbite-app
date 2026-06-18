import { useFormik } from "formik";
import { roleSchema, RoleInput } from "./schema";
import { toast } from "sonner";
import { useGetPermissionsQuery, useCreateRoleMutation, useUpdateRoleMutation } from "@/store/api/userManagementApi";
import { useMemo } from "react";

export const useRoleHook = ({ onClose, roleToEdit }: { onClose: () => void, roleToEdit?: any }) => {
  const { data: permissionsData, isLoading: isLoadingPermissions } = useGetPermissionsQuery(undefined);
  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  
  const permissions = useMemo(() => permissionsData?.data ?? [], [permissionsData]);

  const formik = useFormik<RoleInput>({
    initialValues: {
      name: roleToEdit?.name || "",
      description: roleToEdit?.description || "",
      permissions: roleToEdit?.permissions?.map((p: any) => p.permission?.id || p.id) || [],
    },
    enableReinitialize: true,
    validate: (values) => {
      const result = roleSchema.safeParse(values);
      if (!result.success) {
        const errors: any = {};
        result.error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            errors[issue.path[0]] = issue.message;
          }
        });
        return errors;
      }
    },
    onSubmit: async (values) => {
      try {
        if (roleToEdit) {
          await updateRole({ id: roleToEdit.id, data: values }).unwrap();
          toast.success("Berhasil memperbarui role!");
        } else {
          await createRole(values).unwrap();
          toast.success("Berhasil membuat role baru!");
        }
        formik.resetForm();
        onClose();
      } catch (err: any) {
        console.error("Failed to save role:", err);
        toast.error(err?.data?.message || "Terjadi kesalahan saat menyimpan role");
      }
    },
  });

  return {
    formik,
    permissions,
    isLoadingPermissions,
  };
};
