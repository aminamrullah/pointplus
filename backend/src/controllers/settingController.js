import { db } from "../db/index.js";
import { setting, metodePembayaran, reward, biayaLain, diskon, storePp } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const processImageField = (imageInput, folder = "setting") => {
    if (!imageInput) return null;

    // Base64 handling
    if (imageInput.startsWith("data:image")) {
        const matches = imageInput.match(/^data:image\/([\w+.-]+);base64,(.+)$/);
        if (matches) {
            const extension = matches[1] === "jpeg" ? "jpg" : matches[1].replace('+xml', '');
            const buffer = Buffer.from(matches[2], "base64");
            const fileName = `${uuidv4()}.${extension}`;
            const uploadDir = path.join(__dirname, "../../uploads", folder);

            try {
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                fs.writeFileSync(path.join(uploadDir, fileName), buffer);
                return fileName;
            } catch (error) {
                console.error(`[processImageField] Error saving image to ${folder}:`, error);
                return null;
            }
        } else {
            console.error(`[processImageField] Invalid base64 image format`);
            return null;
        }
    }

    // Existing URL handling
    if (imageInput.startsWith("http")) {
        const parts = imageInput.split("/");
        return parts[parts.length - 1];
    }

    // If it's just a filename
    if (!imageInput.includes("/")) {
        return imageInput;
    }

    return null;
};

export const getSetting = async (request, reply) => {
    try {
        const user = request.user;
        const [data] = await db.select().from(setting).where(eq(setting.idToko, user.id_toko)).limit(1);

        if (data && data.foto) {
            data.foto = `${(process.env.APP_BASE_URL || "").replace(/\/$/, "")}/uploads/setting/${data.foto}`;
        }

        return reply.send({ status: "success", data });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const saveSetting = async (request, reply) => {
    try {
        const data = request.body;
        const user = request.user;
        const [existing] = await db.select().from(setting).where(eq(setting.idToko, user.id_toko)).limit(1);

        // Handle photo saving
        if (data.foto) {
            const processedFoto = processImageField(data.foto, "setting");
            if (processedFoto) {
                data.foto = processedFoto;
            }
        }

        if (existing) {
            await db.update(setting).set({ ...data, updatedAt: new Date() }).where(and(eq(setting.id, existing.id), eq(setting.idToko, user.id_toko)));
        } else {
            await db.insert(setting).values({ ...data, idToko: user.id_toko, createdAt: new Date(), updatedAt: new Date() });
        }
        return reply.send({ status: "success", message: "Setting berhasil disimpan" });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menyimpan setting" });
    }
};

// Metode Pembayaran
export const getPembayaran = async (request, reply) => {
    try {
        const user = request.user;
        const data = await db.select().from(metodePembayaran).where(and(eq(metodePembayaran.deleted, false), eq(metodePembayaran.idToko, user.id_toko)));

        const formattedData = data.map((item) => ({
            ...item,
            nama_metode: item.namaMetode,
            gambar: item.gambar && item.gambar.includes('http') ? item.gambar : (item.gambar ? `${(process.env.APP_BASE_URL || "").replace(/\/$/, "")}/uploads/payment/${item.gambar}` : null)
        }));

        return reply.send({ status: "success", data: formattedData });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const createPembayaran = async (request, reply) => {
    try {
        const data = request.body;
        const user = request.user;

        // Handle photo saving
        if (data.gambar) {
            const processedGambar = processImageField(data.gambar, "payment");
            if (processedGambar) {
                data.gambar = processedGambar;
            }
        }

        const payload = {
            ...data,
            namaMetode: data.nama_metode || data.namaMetode,
            idToko: user.id_toko,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.insert(metodePembayaran).values(payload);
        return reply.send({ status: "success", message: "Metode pembayaran berhasil disimpan" });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menyimpan metode pembayaran" });
    }
};

export const updatePembayaran = async (request, reply) => {
    try {
        const { id } = request.params;
        const data = request.body;
        const user = request.user;

        // Handle photo saving
        if (data.gambar) {
            const processedGambar = processImageField(data.gambar, "payment");
            if (processedGambar) {
                data.gambar = processedGambar;
            }
        }

        const payload = {
            ...data,
            namaMetode: data.nama_metode || data.namaMetode,
            updatedAt: new Date(),
        };

        if (payload.nama_metode) delete payload.nama_metode;

        await db.update(metodePembayaran).set(payload).where(and(eq(metodePembayaran.id, parseInt(id)), eq(metodePembayaran.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Metode pembayaran berhasil diperbarui" });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal memperbarui metode pembayaran" });
    }
};

export const deletePembayaran = async (request, reply) => {
    try {
        const { id } = request.params;
        const user = request.user;
        await db.update(metodePembayaran).set({ deleted: true, updatedAt: new Date() }).where(and(eq(metodePembayaran.id, parseInt(id)), eq(metodePembayaran.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Metode pembayaran berhasil dihapus" });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menghapus metode pembayaran" });
    }
};

export const updatePembayaranStatus = async (request, reply) => {
    try {
        const { id, isAvailable } = request.body;
        const user = request.user;
        await db.update(metodePembayaran).set({ status: !!isAvailable, updatedAt: new Date() }).where(and(eq(metodePembayaran.id, parseInt(id)), eq(metodePembayaran.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Status metode pembayaran berhasil diperbarui" });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal memperbarui status" });
    }
};

// Reward
export const getReward = async (request, reply) => {
    try {
        const user = request.user;
        const data = await db.select().from(reward).where(eq(reward.idToko, user.id_toko));
        return reply.send({ status: "success", data });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const saveReward = async (request, reply) => {
    try {
        const { id, jumlah } = request.body;
        const user = request.user;
        if (id) {
            await db.update(reward).set({ jumlah, updatedAt: new Date() }).where(and(eq(reward.id, parseInt(id)), eq(reward.idToko, user.id_toko)));
        } else {
            await db.insert(reward).values({ jumlah, idToko: user.id_toko, createdAt: new Date(), updatedAt: new Date() });
        }
        return reply.send({ status: "success", message: "Reward berhasil disimpan" });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menyimpan reward" });
    }
};

// Biaya
export const getBiaya = async (request, reply) => {
    try {
        const user = request.user;
        const data = await db.select().from(biayaLain).where(eq(biayaLain.idToko, user.id_toko));
        return reply.send({ status: "success", data });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};


export const saveBiaya = async (request, reply) => {
    try {
        const data = request.body;
        const user = request.user;
        const { ppn_jumlah, biaya_jumlah } = data;

        // Process PPN
        if (ppn_jumlah !== undefined) {
            const [existingPpn] = await db
                .select()
                .from(biayaLain)
                .where(and(eq(biayaLain.type, "ppn"), eq(biayaLain.idToko, user.id_toko)))
                .limit(1);

            if (existingPpn) {
                await db
                    .update(biayaLain)
                    .set({ value: ppn_jumlah, updatedAt: new Date() })
                    .where(eq(biayaLain.id, existingPpn.id));
            } else {
                await db.insert(biayaLain).values({
                    type: "ppn",
                    value: ppn_jumlah,
                    idToko: user.id_toko,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
        }

        // Process Biaya Layanan
        if (biaya_jumlah !== undefined) {
            const [existingBiaya] = await db
                .select()
                .from(biayaLain)
                .where(and(eq(biayaLain.type, "biaya_layanan"), eq(biayaLain.idToko, user.id_toko)))
                .limit(1);

            if (existingBiaya) {
                await db
                    .update(biayaLain)
                    .set({ value: biaya_jumlah, updatedAt: new Date() })
                    .where(eq(biayaLain.id, existingBiaya.id));
            } else {
                await db.insert(biayaLain).values({
                    type: "biaya_layanan",
                    value: biaya_jumlah,
                    idToko: user.id_toko,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
        }

        // Clean up duplicates
        const allBiaya = await db.select().from(biayaLain).where(eq(biayaLain.idToko, user.id_toko));
        const ppnEntries = allBiaya.filter(b => b.type === "ppn");
        const serviceEntries = allBiaya.filter(b => b.type === "biaya_layanan");

        if (ppnEntries.length > 1) {
            ppnEntries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            const [, ...remove] = ppnEntries;
            for (const item of remove) {
                await db.delete(biayaLain).where(eq(biayaLain.id, item.id));
            }
        }

        if (serviceEntries.length > 1) {
            serviceEntries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            const [, ...remove] = serviceEntries;
            for (const item of remove) {
                await db.delete(biayaLain).where(eq(biayaLain.id, item.id));
            }
        }

        return reply.send({ status: "success", message: "Biaya berhasil disimpan" });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menyimpan biaya" });
    }
};


// Diskon
export const getDiskon = async (request, reply) => {
    try {
        const user = request.user;
        const data = await db.select().from(diskon).where(eq(diskon.idToko, user.id_toko));
        return reply.send({ status: "success", data });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};

export const createDiskon = async (request, reply) => {
    try {
        const data = request.body;
        const user = request.user;
        await db.insert(diskon).values({ ...data, idToko: user.id_toko, createdAt: new Date(), updatedAt: new Date() });
        return reply.send({ status: "success", message: "Diskon berhasil disimpan" });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menyimpan diskon" });
    }
};

export const updateDiskon = async (request, reply) => {
    try {
        const { id } = request.params;
        const data = request.body;
        const user = request.user;
        await db.update(diskon).set({ ...data, updatedAt: new Date() }).where(and(eq(diskon.id, parseInt(id)), eq(diskon.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Diskon berhasil diperbarui" });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal memperbarui diskon" });
    }
};

export const deleteDiskon = async (request, reply) => {
    try {
        const { id } = request.params;
        const user = request.user;
        await db.delete(diskon).where(and(eq(diskon.id, parseInt(id)), eq(diskon.idToko, user.id_toko)));
        return reply.send({ status: "success", message: "Diskon berhasil dihapus" });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Gagal menghapus diskon" });
    }
};

// Store Info (toko_pp)
export const getStoreInfo = async (request, reply) => {
    try {
        const [data] = await db.select().from(storePp).limit(1);
        return reply.send({ status: "success", data });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ status: "error", message: "Internal server error" });
    }
};
