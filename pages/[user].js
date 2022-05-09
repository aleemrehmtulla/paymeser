import {
  Box,
  Flex,
  Text,
  Center,
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
  Link,
  Heading,
  ModalCloseButton,
  SimpleGrid,
  useDisclosure,
  ButtonGroup,
  IconButton,
  AddIcon,
  Avatar,
} from "@chakra-ui/react";
import { ethers } from "ethers";

import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/ethereum-provider";

import { supabase } from "../utils/supabaseClient";
import { useState, useEffect } from "react";
import * as Icons from "react-icons/fa";
import { useRouter } from "next/router";

function Component() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "<"];
  const router = useRouter();
  const [notFound, setNotFound] = useState(false);

  const serTag = router.query.user;

  const [user, setUserData] = useState({});
  const getUser = async () => {
    if (serTag) {
      const { data, error } = await supabase
        .from("paymeser")
        .select("userData")
        .eq("serTag", serTag);
      if (error || data.length === 0) {
        setNotFound(true);
      }
      console.log(data, error);
      const done = await data[0]?.userData;
      console.log(done);
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
      console.log("here");
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
        console.log(transactionHash);
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
    currencyChangeHandler();
  }, [currency]);

  useEffect(() => {
    getGasHandler();
  }, []);

  if (notFound) {
    return (
      <VStack pt={40} h="100vh">
        <Image
          alt=""
          src="https://i.giphy.com/media/3o72F8t9TDi2xVnxOE/giphy.webp"
        />
        <Heading align="center" w={{ md: "40rem" }}>
          Damn homie! This user doesn&apos;t exist :/
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
    <Box bg="white" h="100vh" textColor="white">
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
      <VStack pt={20}>
        <VStack spacing={0}>
          <Box boxSize={40}>
            <Avatar size="full" rounded="full" src={user?.pfp} alt="logo" />
          </Box>
          <Text pt={2} fontSize="xl" textColor="black">
            {user?.displayName}
          </Text>
          <Text
            fontSize="md"
            w={60}
            textAlign="center"
            pb={2}
            textColor="gray.900"
          >
            {user?.description}
          </Text>
        </VStack>

        <HStack rounded="md" spacing={0} w={48} h={8} bg="gray.100">
          <HStack w={36} pl={2} textAlign="center" textColor="black">
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

        <Button bg="gray.100" textColor="black" onClick={sendMoneyHandler}>
          Send Money!
        </Button>
      </VStack>
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

  return <IconComponent size="1rem" />;
};
