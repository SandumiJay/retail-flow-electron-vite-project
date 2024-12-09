import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs"; // Updated to use bcryptjs
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { console } from "inspector";
dotenv.config(); // Load environment variables from a .env file

const app = express();
const port = 3001;

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1QAZ2wsx@", // Ensure you set a strong password for production
  database: "retailflow",
  decimalNumbers: true,
});

app.use(cors());
app.use(bodyParser.json());

const db = pool;
// Example route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const createNewUser = async (username, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword]
    );
    return result.insertId;
  } catch (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

app.get("/api/create-user", async (req, res) => {
  console.log("req.body:", req.body);
  try {
    const { username, password } = { username: "admin", password: "admin123" };
    const userId = await createNewUser(username, password);
    res.json({ message: "User created successfully", id: userId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || "default_secret", // Use environment variable
      {
        expiresIn: "1h",
      }
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/create-product-category", async (req, res) => {
  const { category } = req.body;
  try {
    console.log("req.body:", req.body);
    console.log("category:", category);
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const [result] = await pool.query(
      "INSERT INTO productcategories (Category	, Status) VALUES (?, ?)",
      [category, 1] // Assuming status is 1 (active) by default
    );
    res.status(201).json({
      message: "Category created successfully",
      category: {
        id: result.insertId, // MySQL returns the inserted row ID
        category,
        status: 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/get-product-categories", async (req, res) => {
  try {
    // Query the database for all unique product categories
    const [categories] = await pool.query(
      "SELECT DISTINCT id,Category,Status FROM productcategories group by id,Category,Status"
    );
    console.log(categories);
    // Check if categories are found
    if (categories.length === 0) {
      return res.status(404).json({ message: "No categories found" });
    }

    // Return the list of categories in the response
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    // Improved error logging with specific message
    console.error("Database query error while retrieving categories:", error);

    // Return a more informative error message
    res.status(500).json({
      success: false,
      message: "Failed to retrieve product categories. Please try again later.",
    });
  }
});

app.put("/api/update-product-category", async (req, res) => {
  const { id, category } = req.body;
  try {
    console.log("req.body:", req.body);
    console.log("category:", category);
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    await pool.query("UPDATE productcategories SET Category = ? WHERE id = ?", [
      category,
      id,
    ]);
    res.status(200).json({
      message: "Category updated successfully",
      category: {
        id,
        category,
        status: 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
// Setup multer for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the folder to save the uploaded files
    const uploadDir = path.join(__dirname, "uploads");

    // Ensure the upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename for the uploaded file
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

app.post(
  "/api/upload-product-image",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
      }`;
      res.status(200).json({ url: fileUrl });
    } catch (error) {
      res.status(500).json({ message: "Error uploading file", error });
    }
  }
);
app.delete("/api/delete-product-category", async (req, res) => {
  try {
    const { id } = req.query;
    await pool.query("DELETE FROM productcategories WHERE id = ?", [id]);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.log(error);
  }
});
// Endpoint to add product (with an already provided image URL)
app.post("/api/add-product", async (req, res) => {
  try {
    // Extract product data from req.body
    const { name, category, quantity, cost, price, image } = req.body;

    // Input validation
    if (!name) {
      return res.status(400).json({ message: "Product name is required" });
    }
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }
    if (quantity === undefined || quantity === null) {
      return res.status(400).json({ message: "Quantity is required" });
    }
    if (isNaN(quantity) || quantity < 0) {
      return res.status(400).json({ message: "Quantity must be a non-negative number" });
    }
    if (cost === undefined || cost === null) {
      return res.status(400).json({ message: "Cost is required" });
    }
    if (price === undefined || price === null) {
      return res.status(400).json({ message: "Price is required" });
    }
    if (isNaN(price) || price < 0) {
      return res.status(400).json({ message: "Price must be a non-negative number" });
    }

    // Generate SKU and insert product data into the database
    const sku = await generateEntryCode(1);
    const [result] = await pool.query(
      "INSERT INTO products (sku, productName, category, intQty,cost, price, image) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [sku, name, category, quantity,cost, price, image]
    );

    // Return success response with inserted product details
    res.status(201).json({
      message: "Product added successfully",
      product: {
        id: result.insertId,
        sku,
        name,
        category,
        quantity,
        cost,
        price,
        image,
      },
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error adding product:", error);
    // Handle any errors
    res.status(500).json({ message: "Error adding product", error: error.message });
  }
});


app.get("/api/get-users", upload.single("image"), async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");

    // Return the list of users in the response
    res.status(200).json({
      users: rows,
    });
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/get-products", async (req, res) => {
  try {
    // Query the database for all product categories
    const [rows] = await pool.query(
      `SELECT 
      id,
      sku,
      productName,
      category,
      CAST(intQty AS SIGNED) AS intQty,
      CAST(cost AS DOUBLE) AS cost,
      CAST(price AS DOUBLE) AS price,
      image,
      status
       FROM products  `
    );
    console.log(rows);
    // Return the list of categories in the response
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error retrieving categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// app.delete("/api/delete-product", async (req, res) => {
//   try {
//     const { product } = req.body; // Ensure product is sent in the body
//     console.log("Product to delete:", product); // Log the product to delete

//     // Your deletion logic goes here
//     await pool.query("DELETE FROM products WHERE id = ?", [product.id]);
//     res.status(200).json(product.id )
//     res.status(200).json({ message: product.id + " Product deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting product:", error);
//     res.status(500).json({ message:  error});
//   }
// });

app.delete("/api/delete-product", async (req, res) => {
  try {
    const { id } = req.body;  // Get the product ID from the request body
    console.log("Deleting product with ID:", id);

    // Perform the deletion
    await pool.query("DELETE FROM products WHERE id = ?", [id]);
    await pool.query("commit");

    res.status(200).json({ message: "Product deleted successfully", id });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



app.put("/api/update-product", async (req, res) => {
  const { sku, name, category, quantity, price, cost, image } = req.body;

  // Validate that required fields are present
  const missingFields = [];

  // Check for missing required fields
  if (!sku) missingFields.push("sku");
  if (!name) missingFields.push("name");
  if (!category) missingFields.push("category");
  if (!quantity) missingFields.push("quantity");
  if (!price) missingFields.push("price");
  if (!cost) missingFields.push("cost");

  // If there are missing fields, return a detailed error message
  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  try {
    // Update the product in the database
    const updateQuery = `
      UPDATE products
      SET productName = ?, category = ?, intQty = ?, price = ?, cost = ?, image = ?
      WHERE sku = ?
    `;

    // Assuming you're using MySQL or a similar relational database
    const result = await db.query(updateQuery, [
      name,
      category,
      quantity,
      price,
      cost,
      image || null, // Use the new image or keep the old one
      sku,
    ]);

    // If no rows were affected, the SKU was not found
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.status(200).json({ message: "Product updated successfully." });
  } catch (error) {
    console.error("Error updating product:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating the product." });
  }
});

app.put("/api/update-supplier", async (req, res) => {
  try {
    const { code, name, email, phone, address, city, country } = req.body;
    const updateQuery = `update suppliers set name = ?, email = ?, phone = ?, address = ?, city = ?, country = ? where code = ?`;
    const result = await pool.query(updateQuery, [
      name,
      email,
      phone,
      address,
      city,
      country,
      code,
    ]);
    res.status(200).json({ message: "Supplier updated successfully." });
  } catch (error) {
    console.log(error);
  }
});
app.post("/api/delete-supplier", async (req, res) => {
  try {
    const { supplier } = req.body;
    console.log("cd");
    console.log(supplier);
    console.log(req.body);

    await pool.query("DELETE FROM suppliers WHERE code = ?", [supplier.code]);
    res.status(200).json({ message: "Supplier deleted successfully." });
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/delete-purchase-order", async (req, res) => {
  try {
    const { poCode } = req.body;  // Get purchase order code from URL parameters
    console.log(poCode)

    if (!poCode) {
      return res.status(400).json({ message: "Missing purchase order code (poCode)" });
    }

    // Logging details for debugging
    console.log("Received purchase order code to delete: ", poCode);

    // Delete from related tables
    console.log("DELETE FROM purchaseorderdetails WHERE poCode = ", poCode);
    await pool.query("DELETE FROM purchaseorderdetails WHERE poCode = ?", [poCode]);
    await pool.query("DELETE FROM purchaseorder WHERE purchaseOrderCode = ?", [poCode]);

    res.status(200).json({ message: "Purchase order and details deleted successfully." });

  } catch (error) {
    console.error("Error deleting purchase order:", error);
    res.status(500).json({ message: "Error deleting purchase order" });
  }
});

app.post("/api/add-supplier", async (req, res) => {
  const { code, name, email, phone, address, city, country } = req.body;
  const missingFields = [];

  // Check each field and push missing fields to the array
  if (!code) missingFields.push("code");
  if (!name) missingFields.push("name");
  if (!email) missingFields.push("email");
  if (!phone) missingFields.push("phone");
  if (!address) missingFields.push("address");
  if (!city) missingFields.push("city");
  if (!country) missingFields.push("country");

  // If there are missing fields, return a detailed error message
  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  // Generate Entry Code
  let EntryCode;
  try {
    EntryCode = await generateEntryCode(2);  // Assuming this function exists
  } catch (error) {
    return res.status(500).json({ message: "Error generating entry code" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO suppliers (code, name, email, phone, address, city, country) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [EntryCode, name, email, phone, address, city, country]
    );

    // Return success response
    return res.status(200).json({
      message: "Supplier added successfully",
      supplierId: result.insertId,
    });
  } catch (error) {
    console.error("Error adding supplier:", error);
    return res.status(500).json({
      message: "Error adding supplier",
      error: error.message,  // You can omit the detailed error message in production for security reasons
    });
  }
});

app.get("/api/get-suppliers", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM suppliers");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error retrieving suppliers:", error);
  }
});

app.post("/api/add-customer", async (req, res) => {
  const { code, name, email, contact, address, city, country } = req.body;
  const missingFields = [];

  // Check each field and push missing fields to the array
  if (!code) missingFields.push("code");
  if (!name) missingFields.push("name");
  if (!email) missingFields.push("email");
  if (!contact) missingFields.push("contact");
  if (!address) missingFields.push("address");
  if (!city) missingFields.push("city");
  if (!country) missingFields.push("country");

  // If there are missing fields, return a detailed error message
  if (missingFields.length > 0) {
    return res.status(400).json({
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }
  try {
    const [result] = await pool.query(
      "INSERT INTO customers (code, name, email, contact, address, city, country) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [code, name, email, contact, address, city, country]
    );

    res.status(200).json({
      message: "Customer added successfully",
      customer: result.insertId,
    });
  } catch (error) {
    console.error("Error adding customer:", error);
  }
});

app.get("/api/get-customers", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM customers");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error retrieving customers:", error);
  }
});

app.post("/api/update-code-format", async (req, res) => {
  const { type, prefix, sample, length } = req.body;
  try {
    // await pool.query("UPDATE codeformats SET PreFix = ?,length=? WHERE Code = ?", [prefix, type]);
    await pool.query(
      "UPDATE codeformats SET PreFix = ?, length = ?, Sample = ? WHERE Code = ?",
      [prefix, length, sample, type]
    );
    res.status(200).json({ message: "Code format updated successfully." });
  } catch (error) {
    console.error("Error updating code format:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the code format." });
  }
});

app.get("/api/get-code-formats", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM codeformats");
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error retrieving code formats:", error);
  }
});

const generateEntryCode = async (codeType) => {
  const [rows] = await pool.query("SELECT * FROM codeformats WHERE Code = ?", [
    codeType,
  ]);

  const nextValue = rows[0].nextValue;
  const preFix = rows[0].PreFix;
  const Length = rows[0].length;
  const newValue = nextValue + 1;
  await pool.query("update codeformats SET nextValue=? where Code =? ", [
    newValue,
    codeType,
  ]);

  const codeSample = preFix + String(newValue).padStart(Length, "0");

  return codeSample;
};

app.post("/api/create-purchase-order", async (req, res) => {
  const { supplier, orderDetails, totalCost } = req.body;

  try {
    // Generate a unique code for the purchase order
    const EntryCode = await generateEntryCode(2);

    // Insert the purchase order details into the 'purchaseorder' table
    const [result] = await pool.query(
      "INSERT INTO purchaseorder (purchaseOrderCode, SupplierCode, SupplierName, TotalCost, postDate, docDate) VALUES (?, ?, ?, ?, ?, ?)",
      [
        EntryCode,
        supplier.code,
        supplier.name,
        totalCost,
        new Date(),
        new Date(),
      ]
    );
    console.log("orderDetails:", orderDetails)
    // Check if orderDetails exist to insert them into the appropriate table
    if (orderDetails && orderDetails.length > 0) {
      //const purchaseOrderId = result.insertId; // Get the ID of the newly created purchase order

      const orderItems = orderDetails.map((item) => [
        EntryCode,
        item.sku,
        item.productName,
        item.quantity,
        item.cost,
      ]);

      // Insert the order details into the 'purchaseorderdetails' table
      await pool.query(
        "INSERT INTO purchaseorderdetails (poCode, ProductCode, productName, qty, cost) VALUES ?",
        [orderItems]
      );
    }

    res.status(200).json({
      message: "Purchase order added successfully",
      purchaseOrderId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating purchase order:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the purchase order" });
  }
});

app.get("/api/get-purchase-orders", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM purchaseorder  ");
    res.status(200).json(rows);
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/get-purchase-orders-details", async (req, res) => {
  try {
    const poCode = req.query.poCode;

    if (!poCode) {
      return res.status(400).json({ error: "poCode is required" });
    }

    console.log("Executing query:", "SELECT * FROM retailflow.purchaseorderdetails where poCode= ?", [poCode]);

    const [rows] = await pool.query("SELECT * FROM retailflow.purchaseorderdetails WHERE poCode = ?", [poCode]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "No purchase order found for the given poCode" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/get-reciept-entry-code", async (req, res) => {
  try {
    const { codeType } = req.body;
    const [rows] = await pool.query(
      "SELECT * FROM codeformats WHERE Code = ?",
      [codeType]
    );

    const nextValue = rows[0].nextValue;
    const preFix = rows[0].PreFix;
    const Length = rows[0].length;
    const newValue = nextValue + 1;
    await pool.query("update codeformats SET nextValue=? where Code =? ", [
      newValue,
      codeType,
    ]);
    const newEntryCode = generateEntryCode(preFix, Length, newValue);
    res.status(200).json(newEntryCode);
  } catch (error) {
    console.error("Error retrieving code formats:", error);
  }
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});