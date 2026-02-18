import {
    getReportPemasukan, getReportPengeluaran, getReportPenjualan,
    getSalesDetail, getBestSeller, getProfitLoss,
    getAccountsPayable, getSummaryStats, downloadFinancialReport, downloadSalesReport
} from "../controllers/reportController.js";
import { getSupplierPurchases } from "../controllers/supplierController.js";

export default async function reportRoutes(fastify) {
    const typedFastify = fastify.withTypeProvider();

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
