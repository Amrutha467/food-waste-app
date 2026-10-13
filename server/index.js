const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());



const foodPath = path.join(__dirname, "../data/food.json");
const userPath = path.join(__dirname, "../data/users.json");



if (!fs.existsSync(foodPath)) {
  fs.writeFileSync(foodPath, "[]");
}

if (!fs.existsSync(userPath)) {
  fs.writeFileSync(userPath, "[]");
}


const load = (p) => {
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return [];
  }
};



const save = (p, data) => {
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
};



app.get("/", (req, res) => {
  res.send("🚀 Food Waste Server Running");
});


app.post("/register", (req, res) => {

  const users = load(userPath);

  const already = users.find(
    u => u.username === req.body.username
  );

  if (already) {

    return res.json({
      success: false,
      message: "User already exists"
    });

  }

  users.push({
    username: req.body.username,
    password: req.body.password,
    phone: req.body.phone,
    role: req.body.role
  });

  save(userPath, users);

  res.json({
    success: true
  });

});



app.post("/login", (req, res) => {

  const users = load(userPath);

  // ADMIN LOGIN
  if (
    req.body.username === "admin" &&
    req.body.password === "1234"
  ) {

    return res.json({
      success: true,
      role: "admin"
    });

  }

  // NORMAL LOGIN
  const user = users.find(
    u =>
      u.username === req.body.username &&
      u.password === req.body.password
  );

  if (user) {

    res.json({
      success: true,
      role: user.role
    });

  } else {

    res.json({
      success: false
    });

  }

});



app.post("/add-food", (req, res) => {

  const foods = load(foodPath);

  foods.push({

    type: req.body.type,
    quantity: req.body.quantity,
    location: req.body.location,
    category: req.body.category,

    status: "Pending",

    time: new Date().toLocaleString(),

    // 🚚 DELIVERY DETAILS
    partnerName: "",
    partnerPhone: "",
    vehicle: "",
    eta: "",
    otp: ""

  });

  save(foodPath, foods);

  res.json({
    success: true
  });

});



app.get("/foods", (req, res) => {

  const foods = load(foodPath);

  res.json(foods);

});



app.delete("/delete-food/:i", (req, res) => {

  const foods = load(foodPath);

  foods.splice(req.params.i, 1);

  save(foodPath, foods);

  res.json({
    success: true
  });

});




app.put("/update-status/:i", (req, res) => {

  const foods = load(foodPath);

  const i = req.params.i;

  if (!foods[i]) {

    return res.json({
      success: false
    });

  }

  // 🚚 RANDOM DELIVERY PARTNER
  const partners = [

    {
      name: "Arun Kumar",
      phone: "9876543210",
      vehicle: "TN07AB2451"
    },

    {
      name: "Vijay",
      phone: "9123456780",
      vehicle: "TN10XY9087"
    },

    {
      name: "Rahul",
      phone: "9988776655",
      vehicle: "TN22KL4567"
    },

    {
      name: "Karthik",
      phone: "9001122334",
      vehicle: "TN14OP2222"
    }

  ];

  const partner =
    partners[Math.floor(Math.random() * partners.length)];

  // RANDOM ETA
  const eta =
    Math.floor(Math.random() * 15) + 5;

  // RANDOM OTP
  const otp =
    Math.floor(1000 + Math.random() * 9000);

  // UPDATE FOOD
  foods[i].status = "Picked";

  foods[i].partnerName = partner.name;
  foods[i].partnerPhone = partner.phone;
  foods[i].vehicle = partner.vehicle;
  foods[i].eta = eta;
  foods[i].otp = otp;

  save(foodPath, foods);

  res.json({

    success: true,

    partnerName: partner.name,
    partnerPhone: partner.phone,
    vehicle: partner.vehicle,
    eta: eta,
    otp: otp

  });

});

// ============================
// ✏️ EDIT FOOD
// ============================

app.put("/edit-food/:i", (req, res) => {

  const foods = load(foodPath);

  foods[req.params.i] = {

    ...foods[req.params.i],
    ...req.body

  };

  save(foodPath, foods);

  res.json({
    success: true
  });

});

// ============================
// 📊 DASHBOARD ANALYTICS
// ============================

app.get("/dashboard-data", (req, res) => {

  const foods = load(foodPath);

  const total = foods.length;

  const pending =
    foods.filter(
      f => f.status === "Pending"
    ).length;

  const picked =
    foods.filter(
      f => f.status === "Picked"
    ).length;

  const veg =
    foods.filter(
      f => f.category === "Veg"
    ).length;

  const nonVeg =
    foods.filter(
      f => f.category === "Non-Veg"
    ).length;

  const bakery =
    foods.filter(
      f => f.category === "Bakery"
    ).length;

  const packed =
    foods.filter(
      f => f.category === "Packed Food"
    ).length;

  const beverages =
    foods.filter(
      f => f.category === "Beverages"
    ).length;

  res.json({

    total,
    pending,
    picked,

    veg,
    nonVeg,
    bakery,
    packed,
    beverages,

    foods

  });

});

// ============================
// 🚚 DELIVERY TRACKING
// ============================

app.get("/tracking/:i", (req, res) => {

  const foods = load(foodPath);

  const food = foods[req.params.i];

  if (!food) {

    return res.json({
      success: false
    });

  }

  res.json({

    success: true,

    partnerName: food.partnerName,
    partnerPhone: food.partnerPhone,
    vehicle: food.vehicle,
    eta: food.eta,
    otp: food.otp

  });

});


app.listen(5000, () => {

  console.log(
    "🚀 Server running at http://localhost:5000"
  );

});