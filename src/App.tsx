import "./App.css";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Dashboard from "./pages/Inventory/Dashboard";
import Login from "./pages/auth/login";
import "@mantine/core/styles.css";
import { createTheme, MantineProvider } from "@mantine/core";
import Layout from "./components/Layout";
import Inventory from "./pages/Inventory/Inventory";
import Customers from "./pages/customers/Customers";
import Products from "./pages/Inventory/Products";
import ProductCategories from "./pages/Inventory/ProductCategories";
import Users from "./pages/settings/Users";
import Suppliers from "./pages/Inventory/Suppliers";
import PurchaseOrders from "./pages/Inventory/PurchaseOrders";
import POS1 from "./pages/pos/pos1";
import CodeFormatss from "./pages/settings/CodeFormats";
import { Notifications } from "@mantine/notifications";
import Company from "./pages/settings/Company";
import Sales from "./pages/sales/Sales";

const theme = createTheme({
  /** Put your mantine theme override here */
});
function App() {
  const user = { name: "John Doe", role: "Admin" };
  const welcomeMessage = "Please enter your credentials";

  return (
    <MantineProvider theme={theme}> 
       
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route
                path="/"
                element={<Login welcomeMessage={welcomeMessage} />}
              />
              <Route path="/dashboard" element={<Dashboard user={user} />} />
              <Route path="/purchaseorders" element={<PurchaseOrders />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/products" element={<Products />} />
              <Route
                path="/productscategories"
                element={<ProductCategories />}
              />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/users" element={<Users />} />
              <Route path="/company" element={<Company />} />
              <Route path="/pos" element={<POS1 />} />
              <Route path="codeformats" element={<CodeFormatss />} />
            </Routes>
          </Layout>
        </BrowserRouter>
    
    </MantineProvider>
  );
}

export default App;
