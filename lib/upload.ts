import { UTApi } from "uploadthing/server";

const ut = new UTApi();

export async function uploadBase64ToUploadthing(
  base64Data: string,
  fileName: string,
): Promise<string> {
  try {
    const base64Raw = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Raw, "base64");
    const file = new File([buffer], fileName, { type: "image/jpeg" });
    const response = await ut.uploadFiles([file]);
    if (response && response[0] && response[0].data) {
      return response[0].data.url;
    }
    return "";
  } catch (error) {
    console.error("Error uploading to UploadThing:", error);
    return "";
  }
}
