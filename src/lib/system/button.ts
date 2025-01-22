import { defineRecipe } from "@chakra-ui/react"
import { withoutHover } from "./utils"

const recipe = defineRecipe({
  base: {
    borderRadius: 0,
    _focusVisible: {
      outline: "none",
    },
  },
  variants: {
    variant: {
      solid: withoutHover({
        backgroundColor: "primary",
        color: "#fff",
        borderColor: "primary",
        _expanded: {
          backgroundColor: "primary",
        },
      }),
      outline: {
        backgroundColor: "#000",
        borderColor: "primary",
        color: "primary",
        _hover: {
          backgroundColor: "gray.800",
        },
      },
      subtile: {
        bg: "gray.400",
        color: "#fff",
      },
      disable: {
        bg: "disable",
        color: "gray.500",
      },
      shadow: {
        boxShadow:
          "-4px -4px 0px 0px rgba(0, 0,0, 0.50) inset, 4px 4px 0px 0px rgba(255, 255, 255, 0.60) inset",
        border: "none",
        fontWeight: "bold",
        textTransform: "uppercase",
      },
    },
  },
})

export default recipe
