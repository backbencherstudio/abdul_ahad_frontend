// server base url
export const URL =
  process.env.NEXT_PUBLIC_API_ENDPOINT || "http://127.0.0.1:4000";
// app config
export const AppConfig = () => ({
  app: {
    // server endpoint
    url: URL,
    name: "Simplymot.co.uk",
    slogan: "Simplymot.co.uk",
    meta: {
      description: "Simplymot.co.uk",
      keywords: "Simplymot.co.uk",
    },

    // api endpoint
    apiUrl: `${URL}/api`,
  },
});
