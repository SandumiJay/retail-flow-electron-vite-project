const ROLE_PERMISSIONS = {
    'user': {
      POS: true,
      Inventory: "view_only",
      ProductCategories: false,
      Suppliers: false,
      Reports: false,
    },
    'admin': {
      POS: true,
      Inventory: "editable",
      ProductCategories: true,
      Suppliers: "editable",
      Reports: false,
    },
    'super admin': {
      POS: true,
      Inventory: "editable",
      ProductCategories: true,
      Suppliers: "editable",
      Reports: "add_users",
    },
  };

export default ROLE_PERMISSIONS;
