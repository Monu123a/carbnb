const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const toggleFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { carId } = req.body;

        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                userId_carId: {
                    userId,
                    carId: parseInt(carId),
                },
            },
        });

        if (existingFavorite) {
            await prisma.favorite.delete({
                where: { id: existingFavorite.id },
            });
            res.json({ message: "Removed from favorites", isFavorite: false });
        } else {
            await prisma.favorite.create({
                data: {
                    userId,
                    carId: parseInt(carId),
                },
            });
            res.json({ message: "Added to favorites", isFavorite: true });
        }
    } catch (error) {
        console.error("Toggle favorite error:", error);
        res.status(500).json({ error: "Failed to toggle favorite" });
    }
};

const getFavorites = async (req, res) => {
    try {
        const userId = req.user.id;
        const favorites = await prisma.favorite.findMany({
            where: { userId },
            include: {
                car: true,
            },
        });

        // Transform to return list of cars
        const favoritedCars = favorites.map(fav => ({
            ...fav.car,
            favoritedAt: fav.createdAt
        }));

        res.json(favoritedCars);
    } catch (error) {
        console.error("Get favorites error:", error);
        res.status(500).json({ error: "Failed to get favorites" });
    }
};

const checkFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { carId } = req.params;

        const favorite = await prisma.favorite.findUnique({
            where: {
                userId_carId: {
                    userId,
                    carId: parseInt(carId),
                },
            },
        });

        res.json({ isFavorite: !!favorite });
    } catch (error) {
        console.error("Check favorite error:", error);
        res.status(500).json({ error: "Failed to check favorite status" });
    }
};

module.exports = {
    toggleFavorite,
    getFavorites,
    checkFavorite,
};
