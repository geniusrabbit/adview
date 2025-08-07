/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Настройка для локальной разработки
  transpilePackages: ['@adview/react', '@adview/core'],
  // Отключаем strict mode для упрощения отладки
  reactStrictMode: false,
}

module.exports = nextConfig
