const carService = require("../services/car.service");

exports.getCars = async (req, res) => {
  try {
    // If query parameters exist (excluding empty ones), treat as search
    const hasFilters = Object.values(req.query).some(val => val && val.trim() !== '');

    if (hasFilters) {
      return exports.searchCars(req, res);
    }

    const cars = await carService.getAllCars();
    res.json(cars);
  } catch (error) {
    console.error("Error getting cars:", error);
    res.status(500).json({ error: "Failed to fetch cars", message: error.message });
  }
};

exports.getCarById = async (req, res) => {
  try {
    const car = await carService.getCar(req.params.id);
    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }
    res.json(car);
  } catch (error) {
    console.error("Error getting car:", error);
    res.status(500).json({ error: "Failed to fetch car", message: error.message });
  }
};

exports.searchCars = async (req, res) => {
  try {
    const filters = req.query;
    const cars = await carService.searchCars(filters);
    res.json(cars);
  } catch (error) {
    console.error("Error searching cars:", error);
    res.status(500).json({ error: "Failed to search cars", message: error.message });
  }
};

exports.createCar = async (req, res) => {
  try {
    const { brand, model, engine, fuelType, color, pricePerDay, location, transmission, seats, image } = req.body;
    const ownerId = req.user.id; 

    if (!brand || !model || !fuelType || !pricePerDay || !location) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const carData = {
      brand,
      model,
      engine,
      fuelType,
      color,
      pricePerDay: parseFloat(pricePerDay),
      location,
      transmission: transmission || 'Manual',
      seats: seats ? parseInt(seats) : 5,   
      image,
      ownerId,
      latitude: req.body.latitude ? parseFloat(req.body.latitude) : null,
      longitude: req.body.longitude ? parseFloat(req.body.longitude) : null,
    };

    const newCar = await carService.createCar(carData);
    res.status(201).json(newCar);
  } catch (error) {
    console.error("Error creating car:", error);
    res.status(500).json({ error: "Failed to create car", message: error.message });
  }
};

exports.updateCar = async (req, res) => {
  try {
    const carId = req.params.id;
    const ownerId = req.user.id;


    const existingCar = await carService.getCar(carId);
    if (!existingCar) return res.status(404).json({ error: "Car not found" });
    if (existingCar.ownerId !== ownerId) return res.status(403).json({ error: "Unauthorized" });

    const updatedCar = await carService.updateCar(carId, req.body);
    res.json(updatedCar);
  } catch (error) {
    console.error("Error updating car:", error);
    res.status(500).json({ error: "Failed to update car", message: error.message });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    const carId = req.params.id;
    const ownerId = req.user.id;


    const existingCar = await carService.getCar(carId);
    if (!existingCar) return res.status(404).json({ error: "Car not found" });
    if (existingCar.ownerId !== ownerId) return res.status(403).json({ error: "Unauthorized" });

    await carService.deleteCar(carId);
    res.json({ message: "Car deleted successfully" });
  } catch (error) {
    console.error("Error deleting car:", error);
    res.status(500).json({ error: "Failed to delete car", message: error.message });
  }
};

exports.getNearbyCars = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    const cars = await carService.getCarsNearby({ lat, lng, radiusInKm: radius });
    res.json(cars);
  } catch (error) {
    console.error("Error fetching nearby cars:", error);
    res.status(500).json({ error: "Failed to fetch nearby cars", message: error.message });
  }
};
