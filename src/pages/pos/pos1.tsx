import {
  Button,
  Autocomplete,
  Card,
  Container,
  Grid,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useEffect, useState,useRef } from "react";
import { DateInput } from "@mantine/dates";
import axios, { AxiosResponse } from "axios";
import API_ENPOINTS from "../../API";
import '@mantine/dates/styles.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import emailjs from 'emailjs-com';
import * as htmlToImage from 'html-to-image';
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';
 



interface Product {
  id: number;
  name: string;
  price: number;
  quantity?: number;
  discount?: number;
  sku?: string;
}

interface Customer {
  code: string;
  name: string;
  email: string;
  contact: string;
  address: string;
  city: string;
  country: string;
  status: number;
}

const POS1: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsDataSet, setProductsDataSet] = useState<any>([]);
  const [productAutocompleteList, setProductAutocompleteList] = useState<any>([]);
  const [invoiceItemsList, setInvoiceItemsList] = useState<any>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [value, setValue] = useState<Date | null>(null);
  const [postDate, setPostDate] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [productName, setProductName] = useState<string>("");
  const [sku, setSKU] = useState<string>("");
  const [maxDiscount, setMaxDiscount] = useState<number>(0);
  const [customerDataSet, setcustomerDataSet] = useState<any>([]);
  const [customerName, setcustomerName] = useState<any>([]);
  const [contactNumber, setcontactNumber] = useState<any>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string>(""); 
  const [maxQty, setMaxQty] = useState<number>(0);
  const modalRef = useRef<HTMLDivElement>(null);

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: "80%",
      maxHeight: "90vh",
      overflowY: "auto",
      border: "2px solid #0044cc",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
  };


  const handleAddToCart = () => {
    if (selectedProduct) {
      setCart((prev) => [...prev, { ...selectedProduct, quantity, discount }]);
      setQuantity(0);
      setSelectedProduct(null);
      setProductName("");
      setSKU("");
      setDiscount(0);
    } else {
      alert("Please select a product.");
    }
  };

  const handleRemoveFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheckout = () => {
    setCheckoutModalOpen(true);
  };

  const handleConfirmCheckout = async () => {
    let response: AxiosResponse<any, any>;
    try {
      console.log(cart);
      const updatePayload = cart.map((item) => ({
        sku: item.sku,
        quantity: item.quantity,
      }));
  
      console.log(updatePayload);
      response = await axios.put(API_ENPOINTS.UPDATE_INVENTORY, { products: updatePayload });
  
      alert("Checkout confirmed. Inventory updated successfully.");
      setCart([]);
      setCheckoutModalOpen(false);
      setcontactNumber("");
      setcustomerName("");
    } catch (error) {
      console.error("Error response:", error.response.data.message);
      alert("Failed to update inventory. Please try again." +  error.response.data.message);
    }
  };

  const handleProductSelect = (sku: string) => {
    const product = productsDataSet.find((p) => p.sku === sku);
    if (product) {
      setSelectedProduct(product);
      setProductName(product.productName);
      setSKU(product.sku);
    }
  };
  const handleCustomerSelect = (contact: string) => {
    const customer = customerDataSet.find((p) => p.contact === contact);
    if (customer) {
      setSelectedCustomer(customer);
      setcustomerName(customer.name);
      setcontactNumber(customer.contact);
    }
  };

  const handleDiscountChange = (val: number | undefined) => {
    const product = productsDataSet.find((p) => p.sku === sku);
    if (product) {
      setMaxDiscount(product.maxDiscount);
      if (val !== undefined) {
        if (val > maxDiscount) {
          alert(`Discount cannot exceed ${maxDiscount}%`);
          setDiscount(maxDiscount);
        } else {
          setDiscount(val);
        }
      } else {
        setDiscount(0);
      }
    }
  };

  const handleQtyChange = (val: number | undefined) => {
    const product = productsDataSet.find((p) => p.sku === sku);
    if (product) {
      setMaxQty(product.intQty);
      if (val !== undefined) {
        if (val > maxQty) {
          alert(`Quantity cannot exceed ${maxQty}`);
          setQuantity(0);
        } else {
          setQuantity(val);
        }
      } else {
        setQuantity(0);
      }
    }
  };

  const calculateDiscountedPrice = (price: number, discount: number): number => {
    return price - (price * (discount / 100));
  };

  const cartTotal = cart
    .reduce((acc, item) => acc + calculateDiscountedPrice(item.price, item.discount || 0) * (item.quantity || 1), 0)
    .toFixed(2);

    const loadProducts = async () => {
      try {
        const response = await axios.get(API_ENPOINTS.GET_PRODUCTS);
        const products = response.data;
        console.log(products)
    
        // Filter products with quantity > 0
        const availableProducts = products.filter((product: any) => product.intQty > 0);
        console.log(availableProducts)
    
        // Map the filtered products to their SKUs
        const SKU = availableProducts.map((element: any) => element.sku);
    
        // Update state
        setProductsDataSet(products);
        setProductAutocompleteList(SKU);
      } catch (error) {
        console.log(error);
      }
    };

  const loadCustomer = async () => {
    try {
      const response = await axios.get(API_ENPOINTS.GET_CUSTOMERS);
      const customer = response.data;
      setcustomerDataSet(customer);
    } catch (error) {
      console.log(error);
    }
  };
  // const generatePDF = async () => {
  //   if (!modalRef.current) {
  //     alert("Modal content not available for rendering.");
  //     return;
  //   }
  //   try {
  //     const dataUrl = await htmlToImage.toPng(modalRef.current);
  //     const pdf = new jsPDF("p", "mm", "a4");
  //     const imgProps = pdf.getImageProperties(dataUrl);
  //     const margin = 10; // Set desired margin in mm
  //     const pdfWidth = pdf.internal.pageSize.getWidth() - margin * 2; // Adjust width for margins
  //     const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  //     const timestamp = new Date().toISOString().replace(/[:.-]/g, "_");
  
  //     pdf.addImage(dataUrl, "PNG", margin, margin, pdfWidth, pdfHeight);
  //     pdf.save("checkout_summary_"+timestamp+".pdf");
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //     alert("Failed to save as PDF.");
  //   }
  // };

  const saveCheckoutAsPNG = async () => {
    if (!modalRef.current) {
      alert("Modal content not available for rendering.");
      return;
    }
    try {
      const dataUrl = await htmlToImage.toPng(modalRef.current);
      const link = document.createElement("a");
      link.download = "checkout_summary.png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error capturing modal as PNG:", error);
      alert("Failed to save as PNG.");
    }
  };


  const sendEmail = (event: React.FormEvent) => {
    event.preventDefault();

    const templateParams = {
      to_name: customerName,
      from_name: "Your Business Name",
      message: `Thank you for your order! Here is your order summary: Total: $${cartTotal}`,
      email: customerEmail,
    };

    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams, 'YOUR_USER_ID')
      .then((response) => {
        console.log('Email sent successfully!', response.status, response.text);
        alert("Email sent successfully!");
      }, (error) => {
        console.log('Failed to send email:', error);
        alert("Failed to send email.");
      });
  };

  

  const generatePDF = async () => {
    if (!modalRef.current) return alert("No content to render.");
    try {
      const dataUrl = await htmlToImage.toPng(modalRef.current);
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(dataUrl);
      const width = pdf.internal.pageSize.getWidth();
      const height = (imgProps.height * width) / imgProps.width;
      pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
      pdf.save(`Invoice_${Date.now()}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const renderInvoiceTemplate = () => {
    const rows = cart.map(
      (item) =>
        `<tr>
          <td>${item.quantity}</td>
          <td>${item.productName}</td>
          <td>${item.discount}%</td>
          <td>${item.price.toFixed(2)}</td>
          <td>${calculateDiscountedPrice(item.price, item.discount || 0).toFixed(2)}</td>
        </tr>`
    );

    return `
     <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
        }
        .invoice-container {
            width: 80%;
            margin: 20px auto;
            background-color: white;
            border: 2px solid #0044cc;
            padding: 20px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            color: #0044cc;
            font-size: 20px;
            font-weight: bold;
        }
        .contact-info {
            text-align: center;
            font-size: 12px;
            color: #000;
        }
        .details {
            margin-top: 20px;
        }
        .details table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }
        .details th, .details td {
            text-align: left;
            border: 1px solid #ddd;
            padding: 8px;
        }
        .details th {
            background-color: #0044cc;
            color: white;
        }
        .totals {
            margin-top: 20px;
            text-align: right;
            font-size: 14px;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #000;
        }
        .signature {
            margin-top: 20px;
            text-align: left;
        }
    </style>
      <div class="invoice-container">
        <div class="header">ANURADHA TRANSPORT SERVICES</div>
        <div class="contact-info">
            <p>No. 219, Nawana, Mirigama</p>
            <p>Tel: 077 898 929 | 0770 584 959 | 0772 898 929</p>
        </div>
        <div class="details">
            <table>
                <tr>
                    <td><b>Invoice No:</b> INV-${new Date().getTime()}</td>
                    <td><b>Date:</b> ${postDate ? postDate.toDateString() : "N/A"}</td>
                    <td><b>Due On:</b> ${dueDate ? dueDate.toDateString() : "N/A"}</td>
                </tr>
                <tr>
                    <td colspan="3"><b>Customer:</b> ${customerName} - ${contactNumber}</td>
                </tr>
                <tr>
                    <td colspan="3"><b>Address:</b> ${selectedCustomer?.address || "N/A"}</td>
                </tr>
            </table>
        </div>
        <div class="details">
            <table>
                <tr>
                    <th>Qty</th>
                    <th>Description</th>
                    <th>Discount</th>
                    <th>Unit Price</th>
                    <th>Amount (Rs.)</th>
                </tr>
                ${rows.join("")}
            </table>
        </div>
        <div class="totals">
            <p><b>Gross Total:</b> Rs. ${cartTotal}</p>
            <p><b>Discount:</b> Rs. ${discount}</p>
            <p><b>Net Total:</b> Rs. ${cartTotal}</p>
        </div>
        <div class="footer">
            <p>PLEASE DRAW THE CHEQUE IN FAVOUR OF ANURADHA TRANSPORT SERVICES</p>
        </div>
        <div class="signature">
            <p>Checked by: ____________________________</p>
            <p>Customer: ____________________________</p>
        </div>
    </div>
    `;



  };


  useEffect(() => {
    loadProducts();
    loadCustomer();
  }, []);

  return (
    <Container fluid>
      
      <Grid>

      <Grid.Col span={12}>
          <Card padding="lg" shadow="sm">
            <Grid>
              <Grid.Col span={6}>
                <Text size="lg" weight={500}>Customer Name</Text>
                <TextInput value={customerName} placeholder="Customer Name" readOnly/>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="lg" weight={500}>Contact Number</Text>
                <Autocomplete
                  data={customerDataSet.map((customer: Customer) => customer.contact)}
                  value={contactNumber}
                  onChange={(val) => {
                    setcontactNumber(val);
                    handleCustomerSelect(val);
                  }}
                  placeholder="Contact Number"
                />              </Grid.Col>
            </Grid>
          </Card>
        </Grid.Col>
        <Grid.Col span={12}>
          <Card padding="lg" shadow="sm">
            <Grid>
              <Grid.Col span={6}>
                <Text size="lg" weight={500}>Post Date</Text>
                <DateInput value={postDate} onChange={setPostDate} placeholder="Select date" />
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="lg" weight={500}>Due Date</Text>
                <DateInput value={dueDate} onChange={setDueDate} placeholder="Select date" />
              </Grid.Col>
            </Grid>
          </Card>
        </Grid.Col>

        <Grid.Col span={8}>
          <Card padding="lg" shadow="sm">
            <Stack spacing="sm">
              <Grid>
                <Group>
                  <Grid.Col span={3}>
                    <Text size="lg" weight={500}>SKU:</Text>
                    <Autocomplete
                      data={productAutocompleteList}
                      value={sku}
                      onChange={(val) => {
                        setSKU(val);
                        handleProductSelect(val);
                      }}
                      placeholder="Select SKU"
                    />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Text size="lg" weight={500}>Product Name:</Text>
                    <TextInput value={productName} readOnly />
                  </Grid.Col>
                  <Grid.Col span={2}>
                      <Text size="lg" weight={500}>Qty:</Text>
                      <NumberInput 
                        value={quantity} 
                        onChange={(val) => {
                          handleQtyChange(val);
                          setQuantity(val);
                          
                        }} 
                        min={0} 
                        max={maxQty}
                       />
                    </Grid.Col>
                  <Grid.Col span={2}>
                    <Text size="lg" weight={500}>Discount:</Text>
                    <NumberInput
                      value={discount}
                      onChange={handleDiscountChange}
                      min={0}
                      max={maxDiscount}
                    />
                  </Grid.Col>
                </Group>
              </Grid>
              <Button color="green" onClick={handleAddToCart}>Add to Cart</Button>
            </Stack>

            <Table mt="md">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Discount</th>
                  <th>Price</th>
                  <th>Discounted Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => (
                  <tr key={index}>
                    <td>{item.sku}</td>
                    <td>{item.productName}</td>
                    <td>{item.quantity}</td>
                    <td>{item.discount}%</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>${(calculateDiscountedPrice(item.price, item.discount || 0) * (item.quantity || 0)).toFixed(2)}</td>
                    <td>
                      <Button
                        variant="light"
                        color="red"
                        onClick={() => handleRemoveFromCart(index)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Grid.Col>

        <Grid.Col span={4}>
          <Card padding="lg" shadow="sm">
            <Text size="lg" weight={500}>Cart Summary</Text>
            {cart.length === 0 && <Text>No items in cart</Text>}
            <Stack spacing="xs">
              <Group position="apart">
                <Text weight={500}>Total:</Text>
                <Text weight={500}>${cartTotal}</Text>
              </Group>
            </Stack>
            <Select
              label="Payment Method"
              value={paymentMethod}
              onChange={setPaymentMethod}
              data={[
                { value: "cash", label: "Cash" },
                { value: "card", label: "Card" },
                { value: "online", label: "Online" },
              ]}
              mt="md"
            />
            <Button onClick={handleCheckout} fullWidth mt="md">
              Checkout
            </Button>
          </Card>
        </Grid.Col>
      </Grid>

      {/* <Modal
        opened={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        title="RetailFlow"  size="lg"
      >
        
        <Stack spacing="xs">
        <div ref={modalRef}>
          <h3>Cart Summary</h3>
          <Grid>
  <Grid.Col span={6}>
    <Text>
      <strong>Post Date:</strong> {postDate ? postDate.toDateString() : "Not selected"}
    </Text>
  </Grid.Col>
  <Grid.Col span={6} style={{ textAlign: 'left' }}>
    <Text>
      <strong>Due Date:</strong> {dueDate ? dueDate.toDateString() : "Not selected"}
    </Text>
  </Grid.Col>
  <Grid.Col span={6}>
    <Text>
      <strong>Customer:</strong> {customerName}
    </Text>
  </Grid.Col>
  <Grid.Col span={4} style={{ textAlign: 'left' }}>
    <Text>
      <strong>Contact:</strong> {contactNumber}
    </Text>
  </Grid.Col>
</Grid>
          <Table mt="sm">
            <Table.Thead striped highlightOnHover>
              <Table.Tr>
                <Table.Th>Item</Table.Th>
                <Table.Th>Quantity</Table.Th>
                <Table.Th>Unit Price (Rs.)</Table.Th>
                <Table.Th>Discount</Table.Th>
                <Table.Th>Total (Rs.)</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {cart.map((item, index) => (
                <Table.Tr key={index}>
                  <Table.Td>{item.productName}</Table.Td>
                  <Table.Td>{item.quantity}</Table.Td>
                  <Table.Td>{item.price.toFixed(2)}</Table.Td>
                  <Table.Td>{item.discount}%</Table.Td>
                  <Table.Td>{(calculateDiscountedPrice(item.price, item.discount || 0) * (item.quantity || 1)).toFixed(2)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          <Table>
  <tbody>
    <tr>
      <td><strong>Subtotal:</strong></td>
      <td style={{ textAlign: 'right' }}>Rs. {cartTotal}</td>
    </tr>
    <tr>
      <td><strong>Discount:</strong></td>
      <td style={{ textAlign: 'right' }}>Rs. {discount}</td>
    </tr>
    <tr>
      <td><strong>Net Total:</strong></td>
      <td style={{ textAlign: 'right' }}>Rs. {cartTotal}</td>
    </tr>
    <tr>
      <td><strong>Payment Method:</strong></td>
      <td style={{ textAlign: 'right' }}>{paymentMethod}</td>
    </tr>
  </tbody>
</Table>

          <Text mt="sm"><strong>Payment Instructions:</strong> Please draw the cheque in favor of Anuradha Transport Services.</Text>
      <br></br>  
</div>
          <Button color="green" fullWidth mt="md" onClick={handleConfirmCheckout}>
            Confirm Checkout
          </Button>
          <Button mt="md" fullWidth color="blue" onClick={generatePDF}>Print PDF</Button>
          <Button mt="md" fullWidth color="teal" onClick={sendEmail}>Send Email</Button>
     
        </Stack>
      </Modal> */}

<Modal opened={checkoutModalOpen} onClose={() => setCheckoutModalOpen(false)} size="lg" style={customStyles}>
        <div ref={modalRef} dangerouslySetInnerHTML={{ __html: renderInvoiceTemplate() }} />
        <br></br>  
        <Button onClick={generatePDF}>Export as PDF</Button>
      </Modal>
    </Container>
  );
};

export default POS1;  
