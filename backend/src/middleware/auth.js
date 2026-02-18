export const authenticate = async (request, reply) => {
    try {
        await request.jwtVerify();
    } catch (err) {
        return reply.status(401).send({
            success: false,
            status: "error",
            message: "Sesi telah berakhir atau token tidak valid. Silakan login kembali.",
        });
    }
};
