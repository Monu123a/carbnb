const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.uploadTripPhotos = async (bookingId, userId, type, photos) => {
    // Validate booking ownership
    const booking = await prisma.booking.findFirst({
        where: {
            id: Number(bookingId),
            OR: [
                { userId: Number(userId) },
                { car: { ownerId: Number(userId) } }
            ]
        }
    });

    if (!booking) {
        throw new Error("Booking not found or unauthorized");
    }

    const photosJson = JSON.stringify(photos);
    const updateData = {};

    if (type === 'pre') {
        updateData.preTripPhotos = photosJson;
    } else if (type === 'post') {
        updateData.postTripPhotos = photosJson;
    } else {
        throw new Error("Invalid photo type. Must be 'pre' or 'post'");
    }

    return prisma.booking.update({
        where: { id: Number(bookingId) },
        data: updateData
    });
};

exports.getTripPhotos = async (bookingId, userId) => {
    const booking = await prisma.booking.findFirst({
        where: {
            id: Number(bookingId),
            OR: [
                { userId: Number(userId) },
                { car: { ownerId: Number(userId) } }
            ]
        },
        select: {
            preTripPhotos: true,
            postTripPhotos: true
        }
    });

    if (!booking) {
        throw new Error("Booking not found or unauthorized");
    }

    return {
        preTripPhotos: booking.preTripPhotos ? JSON.parse(booking.preTripPhotos) : [],
        postTripPhotos: booking.postTripPhotos ? JSON.parse(booking.postTripPhotos) : []
    };
};
