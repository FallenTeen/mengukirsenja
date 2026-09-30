import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    /**
     * `cover_image_url` is plain text. It may hold a repo-relative placeholder
     * path today and an absolute Supabase Storage URL once real photography is
     * uploaded from the admin panel in Phase 3.
     */
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
};

export default nextConfig;
