const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAllCars = async () => {
  return prisma.car.findMany({
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isVerified: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

exports.getCar = async (id) => {
  const car = await prisma.car.findUnique({
    where: { id: Number(id) },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isVerified: true,
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return car;
};

exports.searchCars = async (filters) => {
  const where = {};

  if (filters.location) {
    where.location = { contains: filters.location };
  }
  if (filters.brand) {
    where.brand = { contains: filters.brand };
  }
  if (filters.model) {
    where.model = { contains: filters.model };
  }
  if (filters.fuelType) {
    where.fuelType = filters.fuelType;
  }
  if (filters.transmission) {
    where.transmission = filters.transmission;
  }
  if (filters.seats) {
    where.seats = { gte: parseInt(filters.seats) }; // Filter by minimum seats
  }
  if (filters.minPrice !== undefined && filters.minPrice !== '') {
    where.pricePerDay = { ...where.pricePerDay, gte: parseFloat(filters.minPrice) };
  }
  if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
    where.pricePerDay = { ...where.pricePerDay, lte: parseFloat(filters.maxPrice) };
  }

  // Availability Check
  if (filters.startDate && filters.endDate) {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);

    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      where.bookings = {
        none: {
          status: 'CONFIRMED', // Only check against confirmed bookings
          OR: [
            {
              // Case 1: Booking starts during the requested period
              startDate: { gte: start, lte: end }
            },
            {
              // Case 2: Booking ends during the requested period
              endDate: { gte: start, lte: end }
            },
            {
              // Case 3: Booking covers the entire requested period
              startDate: { lte: start },
              endDate: { gte: end }
            }
          ]
        }
      };
    }
  }

  let orderBy = { createdAt: 'desc' }; // Default sort
  if (filters.sortBy) {
    if (filters.sortBy === 'priceAsc') {
      orderBy = { pricePerDay: 'asc' };
    } else if (filters.sortBy === 'priceDesc') {
      orderBy = { pricePerDay: 'desc' };
    }
    // Rating sort needs to be handled in application layer or different query as it is computed
  }

  const cars = await prisma.car.findMany({
    where,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: filters.sortBy !== 'rating' ? orderBy : { averageRating: 'desc' },
  });

  return cars;
};

exports.createCar = async (carData) => {
  return prisma.car.create({
    data: carData,
  });
};

exports.getCarsNearby = async ({ lat, lng, radiusInKm = 10 }) => {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const radius = parseFloat(radiusInKm);

  // Haversine formula to find cars within radius
  const nearbyCarsRaw = await prisma.$queryRaw`
    SELECT 
      c.id,
      (
        6371 * acos(
          cos(radians(${latitude})) * cos(radians(c.latitude)) *
          cos(radians(c.longitude) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(c.latitude))
        )
      ) AS distance
    FROM "Car" c
    WHERE c.latitude IS NOT NULL AND c.longitude IS NOT NULL
    AND (
        6371 * acos(
          cos(radians(${latitude})) * cos(radians(c.latitude)) *
          cos(radians(c.longitude) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(c.latitude))
        )
      ) < ${radius}
    ORDER BY distance ASC;
  `;

  if (nearbyCarsRaw.length === 0) return [];

  const carIds = nearbyCarsRaw.map(c => c.id);
  const cars = await prisma.car.findMany({
    where: { id: { in: carIds } },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  // Re-attach distance and sort
  return nearbyCarsRaw.map(raw => {
    const car = cars.find(c => c.id === raw.id);
    return { ...car, distance: raw.distance };
  });
};

exports.updateCar = async (id, carData) => {
  return prisma.car.update({
    where: { id: Number(id) },
    data: carData,
  });
};

exports.deleteCar = async (id) => {
  const carId = Number(id);

  // Use a transaction to delete all associated records
  return prisma.$transaction(async (tx) => {
    // 1. Delete associated Favorites
    await tx.favorite.deleteMany({
      where: { carId }
    });

    // 2. Delete associated Reviews
    await tx.review.deleteMany({
      where: { carId }
    });

    // 3. Delete associated Bookings
    await tx.booking.deleteMany({
      where: { carId }
    });

    // 4. Finally delete the Car
    return tx.car.delete({
      where: { id: carId }
    });
  });
};
