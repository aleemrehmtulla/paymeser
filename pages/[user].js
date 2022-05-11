import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import Head from "next/head";

import { ethers } from "ethers";
import { web3 } from "../utils/web3Utils";

import {
  Box,
  Text,
  Button,
  Image,
  VStack,
  Spacer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Stack,
  HStack,
  ModalBody,
  Icon,
  Input,
  Center,
  Link,
  Heading,
  ModalCloseButton,
  SimpleGrid,
  useDisclosure,
  Avatar,
} from "@chakra-ui/react";
import * as Icons from "react-icons/fa";

function Component() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "<"];
  const router = useRouter();
  const [notFound, setNotFound] = useState(false);
  const [ens, setENS] = useState(false);
  const [user, setUserData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const serTag = router.query.user;

  const getUser = async () => {
    if (serTag) {
      if (serTag.includes(".eth")) {
        const tagENS = await web3.eth.ens.getOwner(serTag);
        if (tagENS === "0x0000000000000000000000000000000000000000") {
          setErrorMessage("Damn homie! The ENS returned as a null address.");
        }
        setENS(tagENS);
        setUserData({
          address: tagENS,
          displayName: serTag,
          description:
            "No account! You can still send, and create a tx to their ENS :)",
        });
        return;
      }
      if (serTag.includes("0x")) {
        if (!ethers.utils.isAddress(serTag)) {
          setErrorMessage("Damn homie! The address is invalid");
          return;
        }
        setENS(serTag);
        setUserData({
          address: serTag,
          displayName: `${serTag.substring(0, 5)}...${serTag.substring(5, 9)}`,
          description:
            "No account! You can still send, and create a tx to their address :)",
        });

        return;
      }
      const { data, error } = await supabase
        .from("paymeser")
        .select("userData")
        .eq("serTag", serTag);
      if (error || data.length === 0) {
        setNotFound(true);
        setErrorMessage("Damn homie! The user does not exist.");
      }
      const done = await data[0]?.userData;
      setUserData(done);
    }
  };
  useEffect(() => {
    getUser();
  }, [router]);

  const [displayValue, setDisplayValue] = useState("0");
  const [ethPrice, setEthPrice] = useState("0");
  const [currency, setCurrency] = useState("ETH");
  const [currencyIcon, setCurrencyIcon] = useState("FaEthereum");
  const [currentProivder, setCurrentProvider] = useState("0");
  const [title, setTitle] = useState("paymeser");

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
    console.log(displayValue);
    console.log(ethPrice);
    console.log(currency);
    if (currency === "ETH") {
      currencyChangeHandler("ETH");
      setCurrency("USD");
      setCurrencyIcon("FaDollarSign");
    }
    if (currency === "USD") {
      currencyChangeHandler("USD");
      setCurrency("ETH");
      setCurrencyIcon("FaEthereum");
    }
  };
  const currencyChangeHandler = (v) => {
    if (v === "ETH" && displayValue !== "0") {
      const ethValue = displayValue * ethPrice;
      const roundedEthValue = ethValue.toFixed(2);
      setDisplayValue(roundedEthValue.toString());
    }
    if (v === "USD" && displayValue !== "0") {
      const usdValue = displayValue / ethPrice;
      const roundedUsd = usdValue.toFixed(4);
      setDisplayValue(roundedUsd.toString());
    }
  };
  const getGasHandler = async () => {
    const res = await fetch("https://api.simplegwei.com/currentgas", {
      method: "POST",
      headers: {
        authorization: "hi",
        "Content-Type": "application/json",
      },
    }).catch(function () {
      console.log("errored");
    });
    const data = await res.json();
    setEthPrice(data.eth);
  };

  async function sendMetamask(amount, recipient) {
    const formattedAmount = ethers.utils.parseEther(amount);

    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    console.log(accounts);
    if (accounts[0]) {
      try {
        const transactionHash = await ethereum.request({
          method: "eth_sendTransaction",
          params: [
            {
              to: user.address,
              from: accounts[0],
              value: formattedAmount._hex,
              // And so on...
            },
          ],
        });
        // Handle the result
      } catch (error) {
        console.error(error);
      }
    }
  }
  async function sendMobile(amount, recipient) {
    onClose();
    const provider = new WalletConnectProvider({
      infuraId: "2d8110a2cee347a0b1056ce46d7387b1", // Required
    });
    const web3 = new Web3(provider);
    const formattedAmount = ethers.utils.parseEther(amount);

    await provider.enable();
    console.log(user.address);
    await web3.eth.sendTransaction({
      from: provider.accounts[0],
      to: user.address,
      value: formattedAmount._hex,
    });
  }
  const sendMoneyHandler = async (typee) => {
    const type = await typee;
    if (
      type !== "metamask" &&
      type !== "walletconnect" &&
      currentProivder === "0"
    ) {
      onOpen();

      return;
    }

    {
      onClose();

      if (currency === "ETH") {
        const amount = displayValue;
        const recipient = user.address;
        if (type === "walletconnect" || currentProivder === "walletconnect") {
          console.log("walletconnect");
          await sendMobile(amount, recipient);
          return;
        }
        if (type === "metamask" || currentProivder === "metamask") {
          await sendMetamask(amount, recipient);
          return;
        }
      }
      if (currency === "USD") {
        const ethValue = displayValue / ethPrice;
        const amount = ethValue.toFixed(5);
        const recipient = user.address;

        if (type === "walletconnect" || currentProivder === "walletconnect") {
          console.log("mobile");
          await sendMobile(amount, recipient);
          return;
        }
        if (type === "metamask " || currentProivder === "metamask") {
          await sendMetamask(amount, recipient);
          return;
        }
      }
    }
  };

  const startMM = async () => {
    const typee = "metamask";
    setCurrentProvider("metamask");
    await sendMoneyHandler(typee);
  };
  const startWC = async () => {
    const typee = "walletconnect";
    setCurrentProvider("walletconnect");
    await sendMoneyHandler(typee);
  };

  useEffect(() => {
    getGasHandler();
  }, []);
  useEffect(() => {
    if (router.query.USD) {
      setCurrency("USD");
      setCurrencyIcon("FaDollarSign");
      setDisplayValue(router.query.USD);
    }
    if (router.query.ETH) {
      setCurrency("ETH");
      setCurrencyIcon("FaEthereum");
      setDisplayValue(router.query.ETH);
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      if (user.serTag !== undefined) {
        setTitle(`${user.serTag} | paymeser`);
        getImage();
        return;
      }
      if (user.displayName !== undefined) {
        setTitle(`${user.displayName} | paymeser`);
        getImage();
        return;
      }
    }
  }, [user]);

  const getImage = async () => {
    const image = await fetch("http://paymeser.vercel.app/api/aleem");
    const imageData = await image.json();
    console.log(imageData);
    setPreviewImage(imageData);
  };
  const [previewImage, setPreviewImage] = useState(null);

  if ((notFound && !ens) || errorMessage !== "") {
    return (
      <VStack pt={40} h="100vh">
        <Image
          alt=""
          src="https://i.giphy.com/media/3o72F8t9TDi2xVnxOE/giphy.webp"
        />
        <Heading align="center" w={{ md: "40rem" }}>
          {errorMessage}
        </Heading>
        <Text align="center">
          {" "}
          Click{" "}
          <Link href={process.env.NEXT_PUBLIC_SITE_URL} color="blue.700">
            here
          </Link>{" "}
          to login
        </Text>
      </VStack>
    );
  }

  return (
    <Box bg="white" h="100vh" textColor="white">
      <Head>
        <title>{title}</title>
        <meta property="og:image" content={previewImage} />
        <meta property="og:title" content={`${serTag} | paymeser`} />
        <meta
          property="og:description"
          content="paymeser is an easy way to receive ETH from friends. just send them your SerLink, and they can input an amount + create tx, w/o memorizing your address"
        />
      </Head>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Connect Your Wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack pb={20} pt={10}>
              <Button
                onClick={() => {
                  startMM();
                }}
              >
                🦊 Metamask
              </Button>
              <Button
                onClick={() => {
                  startWC();
                }}
              >
                📲 Wallet Connect
              </Button>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
      <HStack>
        <VStack
          display={{ base: "none", md: "flex" }}
          pt={40}
          px={8}
          w="80%"
          bg="black"
          h="100vh"
        >
          <Box boxSize={40}>
            <Avatar size="full" rounded="full" src={user?.pfp} alt="logo" />
          </Box>
          <Heading>{user?.displayName}</Heading>
          <Text
            fontSize="lg"
            w={60}
            textAlign="center"
            pb={2}
            textColor="white"
          >
            {user?.description}
          </Text>
          <VStack align="left" textColor="black">
            <Text fontSize="lg" pb={2} textColor="white">
              This SerTag has verified :
            </Text>

            <Button align="right" isDisabled px={30} bg="white">
              Github (coming soon)
            </Button>
            <Button disabled px={32} bg="white">
              Twitter (coming soon)
            </Button>
            <Button disabled px={32} bg="white">
              ETH Address (coming soon)
            </Button>
          </VStack>
        </VStack>
        <VStack h="100vh" w="full" align="center">
          <Center h="full">
            <Box>
              <VStack
                mt="-20"
                display={{ base: "flex", md: "none" }}
                pb={2}
                spacing={0}
              >
                <Box boxSize={40}>
                  <Avatar
                    size="full"
                    rounded="full"
                    src={user?.pfp}
                    alt="logo"
                  />
                </Box>
                <Heading pt={2} fontSize="lg" textColor="black">
                  {user?.displayName}
                </Heading>
                <Text
                  fontSize="md"
                  w={60}
                  textAlign="center"
                  pb={2}
                  textColor="black"
                >
                  {user?.description}
                </Text>
              </VStack>
              <Box bg="blue"></Box>

              <HStack rounded="md" border="1px" w="fit" borderColor="gray.300">
                <Box pl={"2"}>
                  <CustomIcon size="xs" name={currencyIcon} />
                </Box>
                <Input
                  p={0}
                  textColor="black"
                  border={0}
                  _focus={{ border: 0 }}
                  value={displayValue}
                  onChange={(e) => setDisplayValue(e.target.value)}
                />
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

              <VStack spacing={0}>
                <SimpleGrid rounded="md" p={4} spacing={2} mb={4} columns={3}>
                  {numbers.map((number) => (
                    <Button
                      onClick={() => numberChangeHandler(number)}
                      size="lg"
                      py={4}
                      textColor="black"
                      key={number}
                      bg="gray.100"
                      _hover={{ bg: "gray.300" }}
                    >
                      {number}
                    </Button>
                  ))}
                </SimpleGrid>
                <Button
                  bg="gray.100"
                  textColor="black"
                  onClick={sendMoneyHandler}
                >
                  Send Money!
                </Button>
              </VStack>
            </Box>
          </Center>
        </VStack>
      </HStack>
    </Box>
  );
}
export default Component;

const CustomIcon = ({ name }) => {
  const IconComponent = Icons[name];

  if (!IconComponent) {
    // Return a default one
    return;
  }

  return <IconComponent color="black" size="1rem" />;
};
