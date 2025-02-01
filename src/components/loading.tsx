import React from "react";
import { Spinner, Flex, Text, Center } from "@chakra-ui/react";

interface LoadingIndicatorProps {
  message?: string; // 可选的加载提示消息
}

const Loading: React.FC<LoadingIndicatorProps> = ({
  message = "Loading...",
}) => {

  return (
    <Center justifyContent="center" py={4} h="full" w="full">
      <Spinner size="md" color="#8181E5" mr={2} />
      <Text color={"#fff"} fontSize={"lg"}>{message}</Text>
    </Center>
  );
};

export default Loading;