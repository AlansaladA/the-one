import { Suspense, } from "react";
import { useLoaderData, } from "react-router";
import { TickerData } from "@/utils/types";
import { Heading, Spinner, Flex, Container } from "@chakra-ui/react";
import TokenEChart from "@/components/TokenEChart/index";

export default function Ticker() {
  const data = useLoaderData<TickerData>();

  return (
    <Container maxW="container.lg" py={8}>
      <Heading size="2xl" mb={8} textAlign="left">
        ${data.ticker.toUpperCase()}
      </Heading>

      <Suspense
        fallback={
          <Flex align="center" justify="center" h="600px">
            <Spinner />
          </Flex>
        }
      >
        <TokenEChart initialData={data} />
      </Suspense>
    </Container>
  );
}