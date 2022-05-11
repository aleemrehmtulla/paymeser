import captureWebsite from "capture-website";
import { supabase } from "../../utils/supabaseClient";
import { decode } from "base64-arraybuffer";
export default async function handler(req, res) {
  // get the route (/api/{sertag})
  const { serTag } = req.query;
  let say = "";

  // screenshot
  const screenshotBuffer = await captureWebsite.buffer(
    `https://paymeser.vercel.app/${serTag}`,
    {
      delay: 1,
    }
  );

  const { data, error } = await supabase.storage
    .from("ogs")
    .download(`${serTag}.png`);
  if (!error) {
    const { data, error } = await supabase.storage
      .from("ogs")
      .remove([`${serTag}.png`]);
    say = "removed";
    const { darta, errror } = await supabase.storage
      .from("ogs")
      .upload(`${serTag}.png`, decode(screenshotBuffer.toString("base64")), {
        contentType: "image/png",
      });
  }
  if (error) {
    const { darta, errror } = await supabase.storage
      .from("ogs")
      .upload(`${serTag}.png`, decode(screenshotBuffer.toString("base64")), {
        contentType: "image/png",
      });
    say = "uploaded";
  }

  // get link
  const { publicURL, errsorr } = supabase.storage
    .from("ogs")
    .getPublicUrl(`${serTag}.png`);

  // return
  res.status(200).json(publicURL + " " + say);
}
