const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.uploadVerificationDocs = async (userId, data) => {
    const { aadhaarNumber, drivingLicenseNumber } = data;

    // Validate Aadhaar: must be exactly 12 digits
    if (aadhaarNumber && !/^\d{12}$/.test(aadhaarNumber)) {
        throw new Error("Aadhaar number must be exactly 12 digits");
    }

    // Validate DL: must be non-empty
    if (drivingLicenseNumber && drivingLicenseNumber.trim().length < 5) {
        throw new Error("Please enter a valid Driving License number");
    }

    // Auto-verify if both documents are provided
    const shouldVerify = !!(aadhaarNumber && drivingLicenseNumber);

    return prisma.user.update({
        where: { id: Number(userId) },
        data: {
            aadhaarNumber: aadhaarNumber || undefined,
            drivingLicenseNumber: drivingLicenseNumber || undefined,

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
