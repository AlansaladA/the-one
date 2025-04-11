import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"
import { nodePolyfills } from "vite-plugin-node-polyfills"
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
// https://vite.dev/config/

const htmlPlugin = (id: string) => {
  return [
    {
      name: "html-transform",
      transformIndexHtml(html: string) {
        return html.replace(
          /(<\/head>)/i, // 使用正则表达式匹配 </head>
          `
         </head>  <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', '${id}');
    </script>
            `
        )
      },
    },
  ]
}

export default defineConfig(({ mode}) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [
      react(),
      nodePolyfills(),
      tsconfigPaths(),
      htmlPlugin(env.VITE_GTAG_ID || ""),
    ],
    css: {
      postcss: {
        plugins: [
          tailwindcss(),
          autoprefixer(),
        ],
      },
    },
    server: {
      host: true, // 监听所有地址，包括局域网和公网
      port: 3000, // 指定端口号，可以根据需要修改
      // https: true,
    }
  }
})
