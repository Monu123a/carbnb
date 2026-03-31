const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.addReview = async (userId, data) => {
  const { carId, bookingId, rating, comment } = data;

  // Verify booking exists, is completed, belongs to user, and hasn't been reviewed
  const booking = await prisma.booking.findFirst({
    where: {
      id: Number(bookingId),
      userId,
      carId: Number(carId),
      status: "COMPLETED",
    },
    include: {
      review: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found, not completed, or doesn't belong to you");
  }

  if (booking.review) {
    throw new Error("This booking has already been reviewed");
  }

  return prisma.$transaction(async (tx) => {
    // Create the review
    const review = await tx.review.create({
      data: {
        userId,
        carId: Number(carId),
        bookingId: Number(bookingId),
        rating,
        comment,
      },
    });

    // Update the car's pre-calculated fields
    const car = await tx.car.findUnique({
      where: { id: Number(carId) },
      select: { averageRating: true, reviewCount: true },
    });

    const newReviewCount = car.reviewCount + 1;
    const newAverageRating =
      ((car.averageRating * car.reviewCount) + rating) / newReviewCount;

    await tx.car.update({
      where: { id: Number(carId) },
      data: {
        reviewCount: newReviewCount,
        averageRating: Math.round(newAverageRating * 10) / 10,
      },
    });

    return review;
  });
};

exports.getReviews = (carId) => {
  return prisma.review.findMany({
    where: { carId: Number(carId) },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          // phone intentionally excluded from public reviews
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

exports.getReviewById = (id) => {
  return prisma.review.findUnique({
    where: { id: Number(id) },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          // phone intentionally excluded from public review detail
        },
      },
      car: true,
    },
  });
};

exports.updateReview = async (id, userId, data) => {
  // Verify review belongs to user
  const review = await prisma.review.findFirst({
    where: { id: Number(id), userId },
  });

  if (!review) {
    return null;
  }

  const updateData = {};
  if (data.rating !== undefined) updateData.rating = data.rating;
  if (data.comment !== undefined) updateData.comment = data.comment;

  return prisma.review.update({
    where: { id: Number(id) },
    data: updateData,
  });
};

exports.deleteReview = async (id, userId) => {
  // Verify review belongs to user
  const review = await prisma.review.findFirst({
    where: { id: Number(id), userId },
  });

  if (!review) {
    return null;
  }

  return prisma.review.delete({
    where: { id: Number(id) },
  });
};

exports.getUserReviews = (userId) => {
  return prisma.review.findMany({
    where: { userId },
    include: {
      car: {
        select: {
          id: true,
          brand: true,
          model: true,
          image: true,
          owner: {
            select: {
              name: true,
              image: true,
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

exports.checkReviewEligibility = async (userId, bookingId) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: Number(bookingId),
      userId,
      status: "COMPLETED",
    },
    include: {
      review: true,
    },
  });

  if (!booking) return false;

  // Check if review already exists for this booking
  if (booking.review) return false;

  return true;
};
