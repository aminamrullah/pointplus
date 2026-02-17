import { z } from "zod";

export const productSchema = z.object({
  nama: z.string().min(1),
  kategori: z.coerce.string(),
  harga: z.number().or(z.string().transform((v) => parseFloat(v))),
  modal: z.number().or(z.string().transform((v) => parseFloat(v))),
  stok: z.number().or(z.string().transform((v) => parseInt(v))),
  satuan: z.coerce.string(),
  foto: z.string().optional().nullable(),
  barcode: z.string().optional().or(z.literal("")),
  store_barcode: z.string().optional().or(z.literal("")),
  kode_produk: z.string().optional().nullable(),
  diskon: z
    .number()
    .or(z.string().transform((v) => parseFloat(v)))
    .optional(),
  total_modal: z
    .number()
    .or(z.string().transform((v) => parseFloat(v)))
    .optional(),
  status: z.number().default(1),
});

export const updateCalculatorSchema = z.object({
  harga: z.number().optional(),
  diskon: z.number().optional(),
  modal: z.number().optional(),
  margin: z.number().optional(),
  harga_reg: z.number().optional(),
  harga_post: z.number().optional(),
  nett_margin: z.number().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type UpdateCalculatorInput = z.infer<typeof updateCalculatorSchema>;
