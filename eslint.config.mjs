import nextConfig from "eslint-config-next";

export default [
  ...(Array.isArray(nextConfig) ? nextConfig : [nextConfig]),
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];
