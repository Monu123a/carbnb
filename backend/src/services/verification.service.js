const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.uploadVerificationDocs = async (userId, data) => {
    const { aadhaarNumber, drivingLicenseNumber } = data;

    // Auto-verify as long as both fields are provided
    const shouldVerify = !!(aadhaarNumber && drivingLicenseNumber);

    return prisma.user.update({
        where: { id: Number(userId) },
        data: {
            aadhaarNumber: aadhaarNumber,
            drivingLicenseNumber: drivingLicenseNumber,

            isVerified: shouldVerify,
        },
        select: {
            id: true,
            name: true,
            isVerified: true,
            aadhaarNumber: true,
            drivingLicenseNumber: true,
        }
    });
};

exports.verifyUser = async (userId, isVerified) => {
    return prisma.user.update({
        where: { id: Number(userId) },
        data: { isVerified },
        select: {
            id: true,
            name: true,
            isVerified: true,
        }
    });
};

exports.getVerificationStatus = async (userId) => {
    return prisma.user.findUnique({
        where: { id: Number(userId) },
        select: {
            id: true,
            isVerified: true,
            aadhaarNumber: true,
            drivingLicenseNumber: true,
        }
    });
};
