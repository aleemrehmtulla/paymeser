import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

import {
  Box,
  Text,
  Center,
  Button,
  VStack,
  Spacer,
  HStack,
  SimpleGrid,
  Heading,
  Input,
  Link,
  Image,
  Avatar,
  Spinner,
} from "@chakra-ui/react";
import * as Icons from "react-icons/fa";

function Edit() {
  const [userData, setUserData] = useState(null);
  const [serTag, setSerTag] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [pfpLoading, setPfpLoading] = useState(false);
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  const getUser = async () => {
    const user = supabase.auth.user();

    if (user) {
      handleGetUser(user);
      console.log(user);
    } else {
      setTimeout(() => {
        getUser();
      }, 50);
    }
    setTimeout(() => {
      setNotLoggedIn(true);
    }, 1000);
  };

  const handleGetUser = async (user) => {
    if (typeof window !== "undefined") {
      const { data, error } = await supabase
        .from("paymeser")
        .select("userData")
        .eq("id", user.id);
      setUserData(data[0]?.userData);
      setSerTag(data[0]?.userData?.serTag);
    }
  };
  const handleUpdateUser = async () => {
    setSaveLoading(true);
    const users = await supabase.auth.user();

    const { data, error } = await supabase
      .from("paymeser")
      .update({ userData: userData })
      .eq("id", users.id);
    const { dataa, errorr } = await supabase
      .from("paymeser")
      .update({ serTag: serTag })
      .eq("id", users.id);
    setSaveLoading(false);
  };

  const uploadImage = async (e) => {
    e.preventDefault();
    setPfpLoading(true);
    const avatarFile = e.target.files[0];
    const namee = `${serTag}-${Date.now()}`;
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(namee, avatarFile, {
        cacheControl: "3600",
        upsert: false,
      });
    if (data) {
      const { publicURL, error } = supabase.storage
        .from("avatars")
        .getPublicUrl(namee);

      updatePfp(publicURL);
    } else {
    }
  };

  const updateDisplayName = async (e) => {
    const object = {
      ...userData,
      displayName: e.target.value,
    };
    setUserData(object);
  };
  const updateDescription = async (e) => {
    const object = {
      ...userData,
      description: e.target.value,
    };
    setUserData(object);
  };
  const updateAddress = async (e) => {
    const object = {
      ...userData,
      address: e.target.value,
    };
    setUserData(object);
  };
  const updatePfp = async (imageLink) => {
    const object = {
      ...userData,
      pfp: imageLink,
    };
    setUserData(object);
    setPfpLoading(false);
  };
  const updateSerTag = async (serTag) => {
    const object = {
      ...userData,
      serTag: serTag,
    };
    setUserData(object);
  };

  useEffect(() => {
    updateSerTag(serTag);
  }, [serTag]);

  useEffect(() => {
    getUser();
  }, []);

  if (pfpLoading) {
    return (
      <VStack pt={80} spacing={8} h="100vh">
        <Text>Uploading PFP..</Text>
        <Spinner size="xl" />
      </VStack>
    );
  }

  if (notLoggedIn) {
    return (
      <VStack pt={40} h="100vh">
        <Image
          alt=""
          src="https://i.giphy.com/media/3o72F8t9TDi2xVnxOE/giphy.webp"
        />
        <Heading align="center" px={2} w={{ md: "40rem" }}>
          Aw Shucks! Dosen&apos;t seem as though you&apos;re logged in :(
        </Heading>
        <Text align="center">
          {" "}
          Click{" "}
          <Link href="http://paymeser.vercel.app" color="blue.700">
            here
          </Link>{" "}
          to login
        </Text>
      </VStack>
    );
  }
  return (
    <Box>
      <Box display={{ base: "block", md: "none" }} py={2} w="full" bg="black">
        <Text textAlign="center" textColor="white">
          Severly Under Optimized For Mobile!
        </Text>
      </Box>
      <Center h="100vh">
        <Box display="flex" h={{ base: "fit", md: "1/2" }} align="center">
          <Box
            mt={{ base: "-12", md: 0 }}
            align="center"
            shadow={{ base: "none", md: "lg" }}
            border={{ base: 0, md: "1px" }}
            rounded="lg"
            px={4}
            borderColor={{ base: "", md: "gray.300" }}
            p={8}
            textColor="black"
          >
            <HStack pt={20}>
              <VStack>
                <Avatar size="lg" src={userData?.pfp} />
                <Center>
                  <label className="custom-file-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => uploadImage(e)}
                    />
                    Upload
                  </label>
                </Center>
              </VStack>
              <VStack spacing={4}>
                <Input
                  placeholder="Display Name"
                  value={userData?.displayName}
                  onChange={(e) => updateDisplayName(e)}
                />
                <Input
                  placeholder="Description"
                  value={userData?.description}
                  onChange={(e) => updateDescription(e)}
                />
              </VStack>
            </HStack>

            <Input
              mt={8}
              borderColor="gray.300"
              placeholder="ETH Addrss (no ENS 🙁)"
              value={userData?.address}
              onChange={(e) => updateAddress(e)}
            />

            <Button
              isLoading={saveLoading}
              mt={6}
              w="full"
              onClick={handleUpdateUser}
            >
              Save
            </Button>
            <Box
              display={{ base: "flex", md: "none" }}
              onClick={() =>
                window.open(`https://paymeser.vercel.app/${userData?.serTag}`)
              }
            >
              <Text textColor="blue.500" pt={8}>
                paymeser.vercel.app/{userData?.serTag}
              </Text>
            </Box>
          </Box>

          <Box w={{ base: 0, md: 20 }} />

          <Box display={{ base: "none", md: "flex" }} align="center">
            <Preview
              name={userData?.displayName}
              description={userData?.description}
              serTag={serTag}
              pfp={userData?.pfp}
              setSerTag={setSerTag}
            />
          </Box>
        </Box>
      </Center>
    </Box>
  );
}

export default Edit;

function Preview(props) {
  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "<"];

  const router = useRouter();

  const [displayValue, setDisplayValue] = useState("0");
  const [ethPrice, setEthPrice] = useState("0");
  const [currency, setCurrency] = useState("ETH");
  const [currencyIcon, setCurrencyIcon] = useState("FaEthereum");

  const numberChangeHandler = (number) => {
    // do nothing for decimal point if there already is one
    if (number === "." && displayValue.includes(".")) {
      return;
    }
    // ensure it's never empty. if you delete the last digit, it will be set to 0
    if (displayValue.length === 1 && number === "<") {
      setDisplayValue("0");
      return;
    }
    // if number is >,  delete
    if (number === "<") {
      setDisplayValue(displayValue.slice(0, -1));
      return;
    }
    // replace if its the first character, unless decimal point
    if (number !== "." && displayValue === "0") {
      setDisplayValue(number);
      return;
    }
    // max to 2 decimal points for USD
    if (
      currency === "USD" &&
      displayValue.includes(".") &&
      displayValue.substring(displayValue.indexOf(".") + 1).length >= 2
    ) {
      return;
    }

    setDisplayValue(displayValue + number);
  };
  const currencySelectionHandler = () => {
    if (currency === "ETH") {
      setCurrency("USD");
      setCurrencyIcon("FaDollarSign");
    }
    if (currency === "USD") {
      setCurrency("ETH");
      setCurrencyIcon("FaEthereum");
    }
  };
  const currencyChangeHandler = () => {
    if (currency === "ETH" && displayValue !== "0") {
      const ethValue = displayValue / ethPrice;
      const roundedEthValue = ethValue.toFixed(5);
      setDisplayValue(roundedEthValue.toString());
    }
    if (currency === "USD" && displayValue !== "0") {
      const usdValue = displayValue * ethPrice;
      const roundedUsd = usdValue.toFixed(2);
      setDisplayValue(roundedUsd.toString());
    }
  };
  const getEthPriceHandler = async () => {
    const res = await fetch("https://api.simplegwei.com/currentgas", {
      method: "POST",
      headers: {
        authorization: "hi",
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    setEthPrice(data.eth);
  };

  useEffect(() => {
    currencyChangeHandler();
  }, [currency]);

  useEffect(() => {
    getEthPriceHandler();
  }, []);

  return (
    <Box
      shadow="lg"
      border="1px"
      rounded="lg"
      borderColor="gray.200"
      pb={12}
      textColor="black"
    >
      <HStack roundedTop="lg" h={12} bg="gray.200" w="full">
        {/* <Link target="_blank" href={`https://paymeser.com/${props.serTag}`} pl={4}>
          paymeser.com/{props.serTag}
        </Link> */}
        <HStack pl={4} spacing={0}>
          <Box
            pr={2}
            cursor="pointer"
            onClick={() =>
              window.open(`http://paymeser.vercel.app/${props.serTag}`)
            }
          >
            <CustomIcon name="FaExternalLinkAlt" />
          </Box>

          <Text>paymeser.com/</Text>
          <Input
            p={0}
            h="fit"
            w="full"
            focusBorderColor="0"
            onChange={(e) => props.setSerTag(e.target.value)}
            size="md"
            border="0"
            value={`${props.serTag}`}
            placeholder="your-tag"
          />
        </HStack>
      </HStack>
      <VStack pt={8}>
        <VStack>
          <Avatar size="xl" rounded="full" src={props.pfp} alt="logo" />
          <Text textColor="black">{props.name}</Text>
          <Text pb={2} textAlign="center" textColor="gray.700">
            {props.description}
          </Text>
        </VStack>

        <HStack rounded="md" spacing={0} h={8} bg="gray.100">
          <HStack pl={2} textAlign="center" textColor="black">
            <CustomIcon size="xs" name={currencyIcon} />
            <Text isTruncated textAlign="center">
              {displayValue}
            </Text>
          </HStack>
          <Spacer />
          <Box
            as="button"
            px={2}
            h="full"
            rounded="md"
            textColor="black"
            _hover={{ bg: "#ebedf0" }}
            onClick={() => currencySelectionHandler()}
          >
            {currency}
          </Box>
        </HStack>

        <SimpleGrid rounded="md" p={4} spacing={2} mb={4} columns={3}>
          {numbers.map((number) => (
            <Button
              onClick={() => numberChangeHandler(number)}
              size="lg"
              textColor="black"
              key={number}
              bg="gray.100"
              _hover={{ bg: "gray.300" }}
            >
              {number}
            </Button>
          ))}
        </SimpleGrid>

        <Button bg="gray.100" textColor="black">
          Send Money!
        </Button>
      </VStack>
    </Box>
  );
}

const CustomIcon = ({ name }) => {
  const IconComponent = Icons[name];

  if (!IconComponent) {
    // Return a default one
    return;
  }

  return <IconComponent size="1rem" />;
};
