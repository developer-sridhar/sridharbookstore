const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');  // Make sure to add this line
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.uri || "mongodb+srv://sridhar:sridhar@cluster0.lfgrjoe.mongodb.net/bookInventory?retryWrites=true&w=majority&appName=Cluster0";
// const client = new MongoClient(uri);

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true,
    tlsAllowInvalidCertificates: true
});


async function run() {
    try {
        await client.connect();

        // Endpoint for user login
        app.post('/login', async (req, res) => {
            try {
                const { email, password } = req.body;
                const usersCollection = client.db("bookInventory").collection("users");
                const user = await usersCollection.findOne({ email, password });

                if (user) {
                    if (user.isAdmin) {
                        res.json({ success: true, isAdmin: true, user });
                    } else {
                        res.json({ success: true, isAdmin: false, user });
                    }
                } else {
                    res.status(401).json({ success: false, message: "Invalid email or password" });
                }
            } catch (error) {
                console.error("Error during login:", error);
                res.status(500).json({ success: false, message: "Internal server error" });
            }
        });

        // Serve static assets in production
        if (process.env.NODE_ENV === "production") {
            app.use(express.static(path.join(__dirname, "frontend/build")));

            app.get("*", (req, res) => {
                res.sendFile(path.join(__dirname, "frontend/build/index.html"));
            });
        }

        // Fetch a user by ID
        app.get("/user/:id", async(req, res) => {
            try {
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) };
                const usersCollection = client.db("bookInventory").collection("users");
                const user = await usersCollection.findOne(filter);
                res.send(user);
            } catch (error) {
                console.error("Error fetching user:", error);
                res.status(500).json({ error: "Error fetching user" });
            }
        });

        // Update a user data
        app.patch("/user/:id", async(req, res) => {
            try {
                const id = req.params.id;
                const updateUserData = req.body;
                const filter = { _id: new ObjectId(id) };
                const usersCollection = client.db("bookInventory").collection("users");

                const updateDoc = {
                    $set: {
                        ...updateUserData
                    }
                };

                const result = await usersCollection.updateOne(filter, updateDoc);
                res.send(result);
            } catch (error) {
                console.error("Error updating user:", error);
                res.status(500).json({ error: "Error updating user" });
            }
        });

        // Delete a user
        app.delete("/user/:id", async(req, res) => {
            try {
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) };
                const usersCollection = client.db("bookInventory").collection("users");
                const result = await usersCollection.deleteOne(filter);
                res.send(result);
            } catch (error) {
                console.error("Error deleting user:", error);
                res.status(500).json({ error: "Error deleting user" });
            }
        });

        // Create a collection of documents for books
        const bookCollections = client.db("bookInventory").collection("books");

        // Insert a book to the database
        app.post("/upload-book", async(req, res) => {
            const data = req.body;
            const result = await bookCollections.insertOne(data);
            res.send(result);
        });

        // Update a book data
        app.patch("/book/:id", async(req, res) => {
            const id = req.params.id;
            const updateBookData = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upset: true };

            const updateDoc = {
                $set: {
                    ...updateBookData
                }
            };

            const result = await bookCollections.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        // Delete a book data
        app.delete("/book/:id", async(req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await bookCollections.deleteOne(filter);
            res.send(result);
        });

        // Find by category
        app.get("/all-books", async(req, res) => {
            let query = {};
            if (req.query?.category) {
                query = { category: req.query.category };
            }
            const result = await bookCollections.find(query).toArray();
            res.send(result);
        });

        // To Get Single Book Data
        app.get("/book/:id", async(req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await bookCollections.findOne(filter);
            res.send(result);
        });

        // Total book count on dashboard
        app.get("/total-books", async (req, res) => {
            try {
                const count = await bookCollections.countDocuments();
                res.json({ totalBooks: count });
            } catch (error) {
                console.error("Error fetching total books count:", error);
                res.status(500).json({ error: "Error fetching total books count" });
            }
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Successfully Connected to MongoDB!");
    } finally {
        // Ensure that the client will close when you finish/error
        //await client.close();
    }
}

run().catch(console.dir);

app.listen(port, () => {
    console.log(`Server Running on port ${port}`);
});
