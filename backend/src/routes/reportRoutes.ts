import { FastifyInstance } from "fastify";
import {
    getReportPemasukan, getReportPengeluaran, getReportPenjualan,
    getSalesDetail, getBestSeller, getProfitLoss,
    getAccountsPayable, getSummaryStats, downloadFinancialReport, downloadSalesReport
} from "../controllers/reportController";
import { getSupplierPurchases } from "../controllers/supplierController";
import { ZodTypeProvider } from "fastify-type-provider-zod";

export default async function reportRoutes(fastify: FastifyInstance) {
    const typedFastify = fastify.withTypeProvider<ZodTypeProvider>();

    typedFastify.get("/pemasukan", getReportPemasukan);
    typedFastify.get("/pengeluaran", getReportPengeluaran);
    typedFastify.get("/penjualan", getReportPenjualan);
    typedFastify.get("/sales-detail", getSalesDetail);
    typedFastify.get("/best-seller", getBestSeller);
    typedFastify.get("/profit-loss", getProfitLoss);
    typedFastify.get("/accounts-payable", getAccountsPayable);
    typedFastify.get("/supplier-purchases", getSupplierPurchases);
    typedFastify.get("/summary-stats", getSummaryStats);
    typedFastify.get("/export-financial", downloadFinancialReport);
    typedFastify.get("/export-sales", downloadSalesReport);
}
