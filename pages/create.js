import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

import {
  Box,
  Center,
  Spinner,
  VStack,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Link,
} from "@chakra-ui/react";

export default function Home() {
  const router = useRouter();
  const [status, setStatus] = useState(null);

  const getUser = async () => {
    const user = supabase.auth.user();
    if (user) {
      makeUser(user);
    } else {
      setTimeout(() => {
        getUser();
      }, 200);
    }
  };

  async function makeUser(user) {
    if (router.query.tag) {
      const { data, error } = await supabase
        .from("paymeser")
        .select("userData")
        .eq("serTag", router.query.tag);

      if (data.length === 0 || error) {
        const { data, error } = await supabase
          .from("paymeser")
          .update({ serTag: router.query.tag })
          .eq("id", user.id);

        const { dataa, errorr } = await supabase
          .from("paymeser")
          .update({
            userData: {
              name: "",
              serTag: router.query.tag,
            },
          })
          .eq("id", user.id);

        router.push("/edit");

        return;
      }
      if (data[0]?.userData) {
        setStatus("exists");
      }
    }
  }

  useEffect(() => {
    if (router.query.tag) {
      getUser();
    }
  }, [router.query.tag]);
  useEffect(() => {
    if (status === "success") {
      router.push("/edit");
    }
  }, [status]);

  if (status == "exists") {
    return (
      <Center w="100vw " h="100vh">
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="100vh"
        >
          <AlertIcon boxSize="40px" />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            User Already Exists
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            Please cick{" "}
            <Link color="blue" href={process.env.NEXT_PUBLIC_SITE_URL}>
              here
            </Link>{" "}
            to try again
          </AlertDescription>
        </Alert>
      </Center>
    );
  } else {
    return (
      <Box h="100vh">
        <Center w="100vw " h="100vh">
          <VStack spacing={8}>
            <Spinner />
            <Text>creating user: {router.query.tag}</Text>
          </VStack>
        </Center>
      </Box>
    );
  }
}
