import mongoose from 'mongoose';
import { formatResponse, validateProducts } from '../utils/utils.js';
import ProductService from '../services/productsServices.js';


class ProductsController {
    constructor() {
        this.productService = new ProductService();
    }

    getProducts = async (req, res) => {
        try {
            const queryParams = {
                page: req.query.page || 1,
                limit: req.query.limit || 10,
                category: req.query.category,
                available: req.query.available,
                sortByPrice: req.query.sortByPrice,
            };

            const result = await this.productService.getProducts(queryParams);

            const response = formatResponse(result);

            if (req.originalUrl.includes('/api/')) {
                res.status(200).json(response);
            } else {
                return result;
            }
        } catch (error) {
            console.error('Error reading products from MongoDB:', error.message);
            throw error;
        }
    };

    getProductById = async (req, res) => {
        try {
            const productId = req.params.pid;

            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({ error: 'Product ID not valid' });
            }

            const product = await this.productService.getProductById(productId);
            if (product) {
                return res.status(200).json(product);
            } else {
                return res.status(404).json({ message: 'Product not found' });
            }
        } catch (error) {
            console.error('Error getting the product by ID from MongoDB:', error.message);

            return res.status(500).json({ error: 'Server error', message: error.message });
        }
    };

    deleteProduct = async (req, res) => {
        try {
            const productId = req.params.pid;
            const result = await this.productService.deleteProduct(productId);

            if (result === "Product removed correctly") {
                const updatedProductList = await this.productService.getProducts();
                req.app.get('io').emit('productos', updatedProductList.payload);
                res.status(200).json({ message: "Product removed correctly" });
            } else if (!result) {
                res.status(404).json({ message: "Product not found" });
            } else {
                res.status(500).json({ error: "Server error!" });
            }
        } catch (error) {
            res.status(500).json({ error: "Server error!" });
        }
    };

    addProduct = async (req, res) => {
        try {
            const productsData = Array.isArray(req.body) ? req.body : [req.body];

            const validationResult = validateProducts(productsData);

            if (validationResult.error) {
                return res.status(400).json({ error: validationResult.error });
            }

            const results = await Promise.all(productsData.map(async (productData) => {
                return await this.productService.addProduct(productData);
            }));

            const responseCodes = {
                "Product with that code already exist. Not added": 400,
                "Product added successfully.": 201,
                "Error adding product.": 500,
            };

            const reStatus = results.some((result) => responseCodes[result] === 201) ? 201 : 500;

            if (reStatus === 201) {
                const updatedProductList = await this.productService.getProducts();
                req.app.get('io').emit('productos', updatedProductList.payload);
            }

            return res.status(reStatus).json({ messages: results });

        } catch (error) {
            console.error(`Error in the product adding path: ${error.message}`);
            res.status(500).json({ error: "Server error!" });
        }
    };

    updateProduct = async (req, res) => {
        try {
            const productId = req.params.pid;
            const updates = req.body;

            const result = await this.productService.updateProduct(productId, updates);

            if (result.status === 200) {
                const updatedProductList = await this.productService.getProducts();
                req.app.get('io').emit('productos', updatedProductList);
            }

            res.status(result.status).json(result);
        } catch (error) {
            console.error(`Error in the product updating path: ${error.message}`);
            res.status(500).json({ error: "Server error!" });
        }
    };
}

export default new ProductsController();