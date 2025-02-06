import { defineRecipe } from "@chakra-ui/react"

const recipe = defineRecipe({
  base: {
    backgroundColor: "gray.900",
    _focusVisible: {
      outline: "none !important",
    },
  },
  variants: {
    variant: {
      flushed: {
        _focusVisible: {
          shadow: "none",
          borderColor: "#7676E0",
          color: "inherit",
        },
        _placeholder:{
          color: "#8181E5",
          fontSize: { base: "md", md: "2xl" },
        },
        borderWidth:"1px",
        borderColor:"#7676E0"
      },
    },
  },
})

export default recipe
