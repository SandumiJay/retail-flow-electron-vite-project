import {
  AppShell,
  Avatar,
  Box,
  Burger,
  Button,
  Image,
  Menu,
  rem,
  Text,
} from "@mantine/core";
import React, { Children } from "react";
import Sidebar from "./sidebar";
import { useLocation,useNavigate } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import logo2 from "../assets/logo2.jpg";
import {
  IconArrowsLeftRight,
  IconMessageCircle,
  IconPhoto,
  IconSearch,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react";
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const showSidebar = location.pathname !== "/"; // Show sidebar only if not on the login page
  const [opened, { toggle }] = useDisclosure();
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const handleSignOut = () => {
    // Clear authentication tokens or user data
    localStorage.clear(); // Example: clear tokens or user data stored in localStorage
    sessionStorage.clear();

    // Optionally, call a logout API endpoint if needed
    // await api.logout();

    // Redirect to the login page
    navigate("/");
  };

  return (
    <>
      {showSidebar ? (
        <AppShell
          header={{ height: 60 }}
          navbar={{
            width: 250,
            breakpoint: "sm",
            collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
          }}
          padding="md"
        >
          <AppShell.Header
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingLeft: "25px",
              paddingRight: "25px",
            }}
          >
            {" "}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "5px 10px",
              }}
            >
              <Image src={logo2} alt="logo" h={50} w="auto" fit="contain" />
            </div>
            <div style={{ padding: "10px" }}>
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <Button color="none">
                    <Avatar radius="xl" />
                  </Button>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Application</Menu.Label>
                  <Menu.Item
                    leftSection={
                      <IconSettings
                        style={{ width: rem(14), height: rem(14) }}
                      />
                    }
                  >
                    Settings
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <IconMessageCircle
                        style={{ width: rem(14), height: rem(14) }}
                      />
                    }
                  >
                    Profile
                  </Menu.Item>
                  {/* <Menu.Item
                    leftSection={
                      <IconPhoto style={{ width: rem(14), height: rem(14) }} />
                    }
                  >
                    Gallery
                  </Menu.Item>
                  <Menu.Item
                    leftSection={
                      <IconSearch style={{ width: rem(14), height: rem(14) }} />
                    }
                    rightSection={
                      <Text size="xs" c="dimmed">
                        ⌘K
                      </Text>
                    }
                  >
                    Search
                  </Menu.Item> */}

                  <Menu.Divider />

                  {/* <Menu.Label>Danger zone</Menu.Label>
                  <Menu.Item
                    leftSection={
                      <IconArrowsLeftRight
                        style={{ width: rem(14), height: rem(14) }}
                      />
                    }
                  >
                    Transfer my data
                  </Menu.Item> */}
                  <Menu.Item
                    color="red"
                    leftSection={
                      <IconTrash style={{ width: rem(14), height: rem(14) }} />
                    }
                    onClick={handleSignOut} 
                  >
                    Sign Out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>
          </AppShell.Header>

          <AppShell.Navbar>{showSidebar && <Sidebar />}</AppShell.Navbar>

          <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
      ) : (
        <Box>{children}</Box>
      )}
    </>
  );
};

export default Layout;
