import { EmptyState } from "@/components/ui/empty-state";
import { MdNoEncryptionGmailerrorred } from "react-icons/md";
import { Center, Text } from "@chakra-ui/react"
import { Button } from "@/components/ui/button"
import { useNavigate, useRouteError } from "react-router";

export default function Page() {
  const error = useRouteError()
  const navigate = useNavigate()


  return <Center h={'full'}>
    <EmptyState icon={<MdNoEncryptionGmailerrorred />}
      title="ERROR"
    >
      <Center flexDirection={'column'}>
        <Text>{`${error}` || 'There is something wrong with the page'}</Text>
        <Button mt={4} onClick={() => navigate('/')}>Back to home</Button>
      </Center>
    </EmptyState>
  </Center >
}