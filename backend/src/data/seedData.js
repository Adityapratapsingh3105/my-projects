export const initialMembers = [
  {
    id: "mem_1",
    name: "Rahul Sharma",
    avatar: "👨‍💻",
    upiId: "rahul@oksbi",
    email: "rahul.sharma@hostel.edu",
    phone: "+91 98765 43210"
  },
  {
    id: "mem_2",
    name: "Priya Patel",
    avatar: "👩‍🔬",
    upiId: "priya@okicici",
    email: "priya.patel@hostel.edu",
    phone: "+91 98765 43211"
  },
  {
    id: "mem_3",
    name: "Amit Verma",
    avatar: "🎸",
    upiId: "amit@paytm",
    email: "amit.verma@hostel.edu",
    phone: "+91 98765 43212"
  },
  {
    id: "mem_4",
    name: "Sneha Roy",
    avatar: "🎨",
    upiId: "sneha@okaxis",
    email: "sneha.roy@hostel.edu",
    phone: "+91 98765 43213"
  },
  {
    id: "mem_5",
    name: "Vikram Singh",
    avatar: "⚡",
    upiId: "vikram@okhdfcbank",
    email: "vikram.singh@hostel.edu",
    phone: "+91 98765 43214"
  }
];

export const initialGroups = [
  {
    id: "grp_1",
    name: "Room 304 Canteen & Daily",
    type: "Hostel Room",
    description: "Daily room expenses, midnight snacks, canteen orders, and supplies for Room 304 boys.",
    icon: "🏠",
    currency: "INR",
    memberIds: ["mem_1", "mem_3", "mem_5"],
    createdAt: "2026-11-01T10:00:00.000Z"
  },
  {
    id: "grp_2",
    name: "Goa Weekend Trip",
    type: "Trip",
    description: "Epic post-midsem Goa beach trip: villa rental, scooties, cafes, and water sports.",
    icon: "🏖️",
    currency: "INR",
    memberIds: ["mem_1", "mem_2", "mem_3", "mem_4", "mem_5"],
    createdAt: "2026-11-10T14:30:00.000Z"
  },
  {
    id: "grp_3",
    name: "Flat Groceries & Snacks",
    type: "Flat / Apartment",
    description: "Monthly groceries, fruits, milk, coffee, and pantry essentials.",
    icon: "🛒",
    currency: "INR",
    memberIds: ["mem_1", "mem_2", "mem_4"],
    createdAt: "2026-11-12T09:15:00.000Z"
  }
];

export const initialExpenses = [
  {
    id: "exp_1",
    groupId: "grp_1",
    title: "Late Night Maggi & Cold Coffee",
    amount: 360,
    category: "Food",
    date: "2026-11-18",
    paidBy: "mem_1", // Rahul
    participants: ["mem_1", "mem_3", "mem_5"],
    splitType: "equal",
    splits: {
      "mem_1": 120,
      "mem_3": 120,
      "mem_5": 120
    },
    items: [
      { name: "Cheese Butter Maggi (x3)", quantity: 3, price: 60, totalPrice: 180 },
      { name: "Cold Coffee with Ice Cream (x3)", quantity: 3, price: 60, totalPrice: 180 }
    ],
    notes: "Hostel night canteen session during exam prep",
    createdAt: "2026-11-18T22:45:00.000Z"
  },
  {
    id: "exp_2",
    groupId: "grp_1",
    title: "Zomato Biryani & Kebabs Feast",
    amount: 1450,
    category: "Food",
    date: "2026-11-17",
    paidBy: "mem_3", // Amit
    participants: ["mem_1", "mem_3", "mem_5"],
    splitType: "itemwise",
    splits: {
      "mem_1": 510,
      "mem_3": 490,
      "mem_5": 450
    },
    items: [
      { name: "Hyderabadi Chicken Biryani", quantity: 1, price: 380, totalPrice: 380, assignedTo: ["mem_1"] },
      { name: "Paneer Tikka Biryani", quantity: 1, price: 350, totalPrice: 350, assignedTo: ["mem_3"] },
      { name: "Mutton Galouti Kebabs", quantity: 1, price: 360, totalPrice: 360, assignedTo: ["mem_5"] },
      { name: "Garlic Butter Naan (x4)", quantity: 4, price: 40, totalPrice: 160, assignedTo: ["mem_1", "mem_3", "mem_5"] },
      { name: "Taxes & Delivery Fee", quantity: 1, price: 200, totalPrice: 200, assignedTo: ["mem_1", "mem_3", "mem_5"] }
    ],
    notes: "Celebrated Amit landing his summer internship!",
    createdAt: "2026-11-17T20:15:00.000Z"
  },
  {
    id: "exp_3",
    groupId: "grp_2",
    title: "North Goa Beachside Villa Booking",
    amount: 12500,
    category: "Rent",
    date: "2026-11-12",
    paidBy: "mem_2", // Priya
    participants: ["mem_1", "mem_2", "mem_3", "mem_4", "mem_5"],
    splitType: "equal",
    splits: {
      "mem_1": 2500,
      "mem_2": 2500,
      "mem_3": 2500,
      "mem_4": 2500,
      "mem_5": 2500
    },
    items: [
      { name: "2-Night Private Pool Villa Booking", quantity: 1, price: 12500, totalPrice: 12500 }
    ],
    notes: "Anjuna Beach 3BHK villa with private pool",
    createdAt: "2026-11-12T15:00:00.000Z"
  },
  {
    id: "exp_4",
    groupId: "grp_2",
    title: "Scooty Rentals (3 Days)",
    amount: 2400,
    category: "Travel",
    date: "2026-11-13",
    paidBy: "mem_5", // Vikram
    participants: ["mem_1", "mem_3", "mem_5"],
    splitType: "percentage",
    splits: {
      "mem_5": 960,  // 40% (kept one scooty solo)
      "mem_1": 720,  // 30%
      "mem_3": 720   // 30%
    },
    items: [
      { name: "Activa 6G Scooter Rental (x2)", quantity: 2, price: 1200, totalPrice: 2400 }
    ],
    notes: "Fuel and helmet included",
    createdAt: "2026-11-13T11:20:00.000Z"
  },
  {
    id: "exp_5",
    groupId: "grp_3",
    title: "Nature Basket Groceries & Cleaning Kit",
    amount: 1850,
    category: "Groceries",
    date: "2026-11-16",
    paidBy: "mem_4", // Sneha
    participants: ["mem_1", "mem_2", "mem_4"],
    splitType: "unequal",
    splits: {
      "mem_4": 750,  // Sneha bought extra cosmetics
      "mem_2": 600,
      "mem_1": 500
    },
    items: [
      { name: "Oats, Milk & Cornflakes", quantity: 1, price: 420, totalPrice: 420 },
      { name: "Surf Excel & Colin Cleaner", quantity: 1, price: 380, totalPrice: 380 },
      { name: "Fruits (Bananas, Apples)", quantity: 1, price: 300, totalPrice: 300 },
      { name: "Personal Care & Skincare Items", quantity: 1, price: 750, totalPrice: 750 }
    ],
    notes: "Monthly pantry and cleaning restocking",
    createdAt: "2026-11-16T17:30:00.000Z"
  },
  {
    id: "exp_6",
    groupId: "grp_1",
    title: "High-Speed Wi-Fi Router Recharge (300 Mbps)",
    amount: 999,
    category: "Utilities",
    date: "2026-11-19",
    paidBy: "mem_1", // Rahul
    participants: ["mem_1", "mem_3", "mem_5"],
    splitType: "equal",
    splits: {
      "mem_1": 333,
      "mem_3": 333,
      "mem_5": 333
    },
    items: [
      { name: "Airtel Xstream Fiber Unlimited 300 Mbps", quantity: 1, price: 999, totalPrice: 999 }
    ],
    notes: "Monthly room internet pack",
    createdAt: "2026-11-19T09:00:00.000Z"
  }
];

export const initialSettlements = [
  {
    id: "stl_1",
    groupId: "grp_1",
    fromMemberId: "mem_5",
    toMemberId: "mem_1",
    amount: 250,
    status: "settled",
    upiLink: "upi://pay?pa=rahul@oksbi&pn=Rahul%20Sharma&am=250.00&cu=INR&tn=SplitMate%20Settlement",
    settledAt: "2026-11-15T18:00:00.000Z"
  }
];
