import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

import {
  Box,
  Text,
  Center,
  Button,
  Image,
  VStack,
  HStack,
  Flex,
  Heading,
  Input,
} from "@chakra-ui/react";

import * as Icons from "react-icons/fa";

export default function Home() {
  const [serTag, setSerTag] = useState("");
  const [serTagError, setSerTagError] = useState(false);
  const [serTagLength, setSerTagLength] = useState(false);
  const [serTagErrorMessage, setSerTagErrorMessage] = useState(false);

  const checkSerTag = async (e) => {
    // first set state, regardless of whether it's valid or not
    const LoweredSerTag = e.target.value.toLowerCase();
    setSerTag(LoweredSerTag);

    if (LoweredSerTag.includes(".")) {
      setSerTagError(true);
      setSerTagErrorMessage("SerTag cannot contain a '.' character");
      return;
    }

    // if the sertag is empty, don't bother querying, just set the error to true
    if (LoweredSerTag.length < 1) {
      setSerTagErrorMessage("SerTag cannot be empty");
      setSerTagError(true);

      return;
    }

    // start db query to see if it exists already
    const { data, error } = await supabase
      .from("paymeser")
      .select("userData")
      .eq("serTag", LoweredSerTag);

    // if it exists, set the error to true
    if (data.length > 0 || error) {
      setSerTagErrorMessage("SerTag already exists");
      setSerTagError(true);
      return;
    }
    // if no errors, keep at false
    setSerTagError(false);
    setSerTagErrorMessage("");
  };

  const signUpWithGoogle = async () => {
    // double triple check that local storage is the same as state
    localStorage.setItem("serTag", serTag);
    const serTagLocal = localStorage.getItem("serTag");

    // if the serTag is empty, dont allow sign in
    if (!serTagLocal || serTag.length < 1) {
      setSerTagLength(true);
      setSerTagError(true);
      return;
    }

    // signin
    await supabase.auth.signIn(
      {
        provider: "google",
      },
      {
        redirectTo: `http://paymeser.vercel.app/create?tag=${serTagLocal}&`,
      }
    );
  };
  const signInWithGoogle = async () => {
    await supabase.auth.signIn(
      {
        provider: "google",
      },
      {
        redirectTo: `http://paymeser.vercel.app/edit`,
      }
    );
  };

  // whenever state changes, save to local
  useEffect(() => {
    localStorage.setItem("serTag", serTag);
  }, [serTag]);

  return (
    <Box>
      <Center display={{ base: "block", md: "flex" }} h="100vh" px={8}>
        <VStack pt={{ base: 12, md: 0 }} align="center">
          <Heading fontSize={{ base: "2xl", md: "6xl" }}>
            Ser, Ser. Pay Me!
          </Heading>
          <Text
            pb={1}
            fontSize={{ base: "md", md: "lg" }}
            w={{ base: "20rem", md: "30rem" }}
            px={2}
            align="center"
          >
            paymeser is an easy way to receive ETH from friends. just send them
            your SerLink, and they can input an amount + create tx, w/o
            memorizing your address
          </Text>
          <Box spacing={0}>
            <VStack h="14" pb={2} align="start" spacing={0}>
              <HStack
                pl={2}
                py={2}
                rounded="md"
                bg="gray.100"
                spacing={0}
                border={serTagError ? "1px" : "1px solid red.300"}
                borderColor={serTagError ? "red.300" : "red.300"}
              >
                <Text fontSize={{ base: "md", md: "md" }} fontWeight="semibold">
                  paymeser.com/
                </Text>
                <Input
                  padding={0}
                  pl={1}
                  fontSize={{ base: "md", md: "md" }}
                  placeholder="sertag"
                  h="fit"
                  spacing={0}
                  border={0}
                  _focus={0}
                  onChange={(e) => checkSerTag(e)}
                />
              </HStack>

              <Text
                visibility={serTagError ? "" : "hidden"}
                textColor="red.300"
                fontSize="sm"
              >
                {serTagErrorMessage}
              </Text>
            </VStack>

            <Button
              mt={{ base: 2, md: 4 }}
              disabled={serTagError ? true : false}
              _hover={{ bg: "blue.500" }}
              bg="#025dff"
              textColor="white"
              py={0}
              h={{ base: "10", md: "10" }}
              w="full"
              onClick={signUpWithGoogle}
            >
              Sign Up With Google
            </Button>
            <Text
              fontWeight="bold"
              fontSize="lg"
              mt={{ base: 2, md: 3 }}
              align="center"
            >
              OR
            </Text>
            <Button
              mt={{ base: 2, md: 3 }}
              _hover={{ bg: "green.500" }}
              bg="green.400"
              textColor="white"
              py={0}
              h={{ base: "10", md: "10" }}
              w="full"
              onClick={signInWithGoogle}
            >
              Sign In With Google
            </Button>
          </Box>
        </VStack>
        <Box align="center" px={{ base: 2, sm: 4, md: 8 }}>
          <Image src="/img/phone.png" alt="" />
        </Box>
      </Center>
      <Flex
        display={{ base: "none", md: "flex" }}
        mt="-16"
        pr={4}
        justify="right"
      >
        <Box
          cursor="pointer"
          onClick={() =>
            window.open("https://github.com/aleemrehmtulla/paymeser")
          }
        >
          <CustomIcon name="FaGithub" />
        </Box>
        <Box w={3} />
        <Box
          cursor="pointer"
          onClick={() => window.open("https://twitter.com/aleemrehmtulla")}
        >
          <CustomIcon name="FaTwitter" />
        </Box>
      </Flex>
    </Box>
  );
}

const CustomIcon = ({ name }) => {
  const IconComponent = Icons[name];

  if (!IconComponent) {
    // Return null if the icon wasn't passed
    return;
  }

  return <IconComponent size="3rem" />;
};
