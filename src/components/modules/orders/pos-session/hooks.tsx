import { useFormik } from "formik";
import { posSessionSchema, PosSessionFormValues, closeSessionSchema, CloseSessionFormValues } from "./schema";
import { validateWithZod } from "@/utils/formik-zod";
import { toast } from "sonner";

export const usePosSessionForm = (onSubmit: (values: PosSessionFormValues) => void) => {
  const formik = useFormik<PosSessionFormValues>({
    initialValues: {
      branch_id: "",
      opening_balance: 0,
      note: "",
    },
    validate: validateWithZod(posSessionSchema),
    onSubmit: async (values) => {
      try {
        await onSubmit(values);
        formik.resetForm();
      } catch (error) {
        toast.error("Gagal memproses sesi POS");
      }
    },
  });

  return formik;
};

export const useCloseSessionForm = (onSubmit: (values: CloseSessionFormValues) => void) => {
  const formik = useFormik<CloseSessionFormValues>({
    initialValues: {
      closing_balance: 0,
      note: "",
    },
    validate: validateWithZod(closeSessionSchema),
    onSubmit: async (values) => {
      try {
        await onSubmit(values);
        formik.resetForm();
      } catch (error) {
        toast.error("Gagal menutup sesi POS");
      }
    },
  });

  return formik;
};
