// import { ColorSchemeScript } from "@mantine/core";
import { Button, Container, Flex, Image, Input } from "@mantine/core";
import React, { useState } from "react";
import Logo from "../../assets/logo.jpg";
import axios from "axios";
// import Loginbanner from "../../assets/loginbanner.jpg";
interface LoginProps {
  welcomeMessage: string;
}
const Login: React.FC<LoginProps> = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
        const response = await axios.post("http://localhost:3001/api/login", {
          username,
          password,
        });
  
        if (response.status === 200) {
          // Handle successful login
          console.log("Login successful:", response.data);
          // You can save the token to local storage or context
          localStorage.setItem('token', response.data.token);
          // Redirect or update state based on login success
          window.location.href = '/dashboard'; 
        } else {
          // Handle errors
          setError(response.data.message || "Login failed");
        }
      } catch (error: any) {
        console.error("An error occurred:", error);
        setError(error.response?.data?.message || "An error occurred during login");
      }
  }

//   const createnewuser = async () => {
//     try {
//       const response = await axios.get("http://localhost:3001/api/create-user" );
//       if (response.status === 200) {
//         console.log("User created successfully:", response.data);
//       } else {
//         console.log("Failed to create user:", response.data);
//       } 
//     } catch (error: any) {  
//       console.error("An error occurred:", error);
//     }
//   }
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Container>
        <Flex>
          {/* <Container w={400}>
          
            <div></div>
          </Container> */}
          <Container w={400}>
            <div>
              <Image src={Logo} alt="logo" width={200} height={200} />
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Input placeholder="User Name" value={username} onChange={e => setUsername(e.target.value)} />

                  <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}/>

                  <Button radius="md" color="grape" type="submit">
                    Login
                  </Button>
                </form>
              </div>
              {/* <Button onClick={createnewuser}>Create User</Button> */}
            </div>
          </Container>
        </Flex>
      </Container>
    </div>
  );
};

export default Login;
