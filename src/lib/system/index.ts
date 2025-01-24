import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"
import buttonRecipe from "./button" 
// import dialogRecipe from "./dialog"
// import nativeSelectRecipe from "./nativeSelect"
// import inputRecipe from "./input"
// import textAreaRecipe from "./textArea"
// import colors from "./color"
// import layerStyles from "./layerStyles"
const customConfig = defineConfig({
  cssVarsPrefix: "bp",

  theme: {
    tokens: {
      // colors,
      cursor: {
        menuitem: { value: "pointer" },
      },
    },
    slotRecipes: {
      // dialog: dialogRecipe,
      // nativeSelect: nativeSelectRecipe,
    },
    recipes: {
      // button: buttonRecipe,
      // input: inputRecipe,
      // textarea: textAreaRecipe, 
    },
    // layerStyles,
    // textStyles: {
    //   base: {

    //   },
    //   fontSize: ["12px", "14px", "14px", "16px"],
    // },
  },
  globalCss: {
    "*": {
      padding: 0,
      margin: 0,
      boxSizing: "border-box",
      fontFamily: "SF Pro",
      outline: "none",
      fontStyle:"initial"
    },
    "#root": {
      height: "100vh",
      width: "100vw",
      overflow: "auto",
      backgroundColor: "#000",
      color: "#fff",
      fontSize: 14,
    },
  },
})

export const system = createSystem(defaultConfig, customConfig)
