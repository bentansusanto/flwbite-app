import { useState } from "react";
import { useFormik } from "formik";
import { salesReportFilterSchema, SalesReportFilterValues } from "./schema";
import { validateWithZod } from "@/utils/formik-zod";

export const useSalesReport = () => {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("weekly");

  const formik = useFormik<SalesReportFilterValues>({
    initialValues: {
      start_date: "",
      end_date: "",
      branch_id: "",
      status: "",
      search: "",
      page: 1,
      limit: 5,
      period: "weekly",
    },
    validate: validateWithZod(salesReportFilterSchema),
    onSubmit: (values) => {
      setPeriod(values.period as any);
    },
  });

  const handlePeriodChange = (newPeriod: "daily" | "weekly" | "monthly" | "yearly") => {
    setPeriod(newPeriod);
    formik.setFieldValue("period", newPeriod);
    formik.handleSubmit();
  };

  return {
    formik,
    period,
    handlePeriodChange,
  };
};
