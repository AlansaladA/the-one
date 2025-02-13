import { EmptyState } from "@/components/ui/empty-state";
import { MdNoEncryptionGmailerrorred } from "react-icons/md";
import { Center, Group, Text } from "@chakra-ui/react"
import { Button } from "@/components/ui/button"
import { useNavigate, useRouteError } from "react-router";

export default function Page() {
  const error = useRouteError()
  const navigate = useNavigate()


  return <Center h={'full'}>
    <EmptyState icon={<MdNoEncryptionGmailerrorred />}
      title="ERROR"
    >
      <Group>
        <Text>状态码: {(error as any).status}</Text>
        <Text>错误信息: {(error as any).statusText}</Text>
        <Button onClick={() => navigate('/')}>返回首页</Button>
      </Group>
    </EmptyState>
  </Center >
}