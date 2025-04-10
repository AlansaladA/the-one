import { Box, VStack, HStack, Text } from '@chakra-ui/react';

interface HeatMapProps {
  data: {
    time: number;
    price: number;
    volume: number;
    name: string;
  }[];
  currentValue: number;
}

const HeatMap = ({ data, currentValue=70 }: HeatMapProps) => {
  // 计算最近24小时的平均交易量

  const levels = [
    { label: 'MAX', color: '#4CAF50', threshold: 100 },
    { label: 'HIGH', color: '#8BC34A', threshold: 85 },
    { label: 'NORMAL', color: '#FFEB3B', threshold: 60 },
    { label: 'MEDIUM', color: '#FFC107', threshold: 45 },
    { label: 'LOW', color: '#FF9800', threshold: 30 },
    { label: 'NO', color: '#FF5722', threshold: 15 },
  ];

  return (
    <HStack gap={4} align="stretch"  height="100%">
      <Box position="relative" width="40%" height="100%" borderRadius={"full"} borderWidth={"1px"} borderColor={"#fff"}>
        {
          levels.map((level, index) => {
            return (
              <Box
                key={index}
                position="absolute"
                bottom={`${((5 - index) / 6) * 100}%`}
                width="100%"
                height={`${(1 / 6) * 100}%`}
                transition="all 0.5s"
                bg={level.color}
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
                borderTopRadius={index === 0 ? "full" : "none"}
                borderBottomRadius={index === 5 ? "full" : "none"}
              >
                <Text fontSize="8px">{level.label}</Text>
                <Box
                  position="absolute"
                  left="100%"
                  top="50%"
                  transform="translateY(-50%)"
                  width="20px"
                  height="1px"
                  bg="gray.400"
                >
                  <Box  p={1} borderRadius={"full"}>
                    <Text
                      position="absolute"
                      left="24px"
                      top="-8px"
                      fontSize="10px"
                      color="gray.600"
                      bg={currentValue <= level.threshold && 
                          (index === levels.length - 1 || currentValue > levels[index + 1].threshold) 
                          ? level.color 
                          : "white"}
                      px={1}
                      borderRadius="sm"
                      boxShadow="sm"
                      borderColor={"#fff"}
                      borderWidth={1}
                    >
                      {level.threshold}%
                    </Text>
                  </Box>
                </Box>
              </Box>
            )
          })
        }
      </Box>

    </HStack>
  );
};

export default HeatMap;