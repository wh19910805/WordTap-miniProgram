/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // 主色调：鲜艳靛蓝
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1", // 主色
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        // 强调色：活力青柠绿
        accent: {
          50: "#f7fee7",
          100: "#ecfccb",
          200: "#d9f99d",
          300: "#bef264",
          400: "#a3e635",
          500: "#84cc16", // 强调色
          600: "#65a30d",
          700: "#4d7c0f",
          800: "#3f6212",
          900: "#365314",
        },
        // 背景色
        background: {
          DEFAULT: "#f8fafc",
        },
        // 表面色
        surface: {
          DEFAULT: "#ffffff",
        },
        // 边框色
        border: {
          DEFAULT: "#e2e8f0",
        },
        // 悬停色
        hover: {
          DEFAULT: "#f1f5f9",
        },
        // 状态色：错误
        error: {
          DEFAULT: "#f43f5e",
        },
        // 状态色：成功
        success: {
          DEFAULT: "#10b981",
        },
        // 状态色：警告
        warning: {
          DEFAULT: "#f59e0b",
        },
        // Gen Z 辅助色（保留兼容性）
        "genz-pink": {
          DEFAULT: "#ec4899",
        },
        "genz-cyan": {
          DEFAULT: "#06b6d4",
        },
        "genz-purple": {
          DEFAULT: "#8b5cf6",
        },
        "genz-orange": {
          DEFAULT: "#f97316",
        },
        // 中性色：明亮的灰度
        gray: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52555b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
        },
      },
      // 移除所有自定义阴影
      boxShadow: {},
      // 保留有用的动画
      animation: {
        "fade-in": "fadeIn 0.3s ease-in",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "bounce-subtle": "bounceSubtle 0.6s ease-in-out",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      // 统一圆角为12px
      borderRadius: {
        // 覆盖默认圆角，统一为12px
        sm: "0.75rem",
        DEFAULT: "0.75rem",
        md: "0.75rem",
        lg: "0.75rem",
        xl: "0.75rem",
        "2xl": "0.75rem",
        "3xl": "0.75rem",
      },
      // 移除模糊效果
      backdropBlur: {},
    },
  },
  plugins: [],
};
