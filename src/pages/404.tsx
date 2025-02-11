import { EmptyState } from "@/components/ui/empty-state";
import { TbError404 } from "react-icons/tb";
import { Center, Group } from "@chakra-ui/react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router";
export default function Page() {
  const navigate = useNavigate()
  return <Center h={'full'}>
    <EmptyState icon={<TbError404 />}
      title="NOT FOUND" >
      <Group>
        <Button onClick={() => navigate('/')}>Back to home</Button>
      </Group>
    </EmptyState>
  </Center>
}