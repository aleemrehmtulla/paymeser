import captureWebsite from "capture-website";
import { supabase } from "../../utils/supabaseClient";
import { decode } from "base64-arraybuffer";
export default async function handler(req, res) {
  // get the route (/api/{sertag})
  const { serTag } = req.query;

  // screenshot
  const screenshotBuffer = await captureWebsite.buffer(
    `https://paymeser.vercel.app/${serTag}`,
    {
      delay: 1,
    }
  );

  // upload
  const { data, error } = await supabase.storage
    .from("ogs")
    .upload(
      `${serTag}-${Date.now()}.png`,
      decode(screenshotBuffer.toString("base64")),
      {
        contentType: "image/png",
      }
    );
  // get link
  const { publicURL, errorr } = supabase.storage
    .from("ogs")
    .getPublicUrl(`${serTag}-${Date.now()}.png`);

  // return
  res.status(200).json(publicURL);
}
