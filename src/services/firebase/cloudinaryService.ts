export const uploadToCloudinary = async (
  file: {
    uri: string;
    type?: string;
    fileName?: string;
  }
): Promise<string> => {
  try {
     const cloudName = 'dfqawghek';       // from Cloudinary console
    const uploadPreset = 'testProject_Preset'; // unsigned preset
    // fallback to detect from extension if type is missing
    console.log(file, "Processing file for upload")
    let mimeType = file.type;
    if (!mimeType) {
      if (file.fileName?.endsWith(".png")) mimeType = "image/png";
      else if (file.fileName?.endsWith(".jpg") || file.fileName?.endsWith(".jpeg")) mimeType = "image/jpeg";
      else if (file.fileName?.endsWith(".mp4")) mimeType = "video/mp4";
      else if (file.fileName?.endsWith(".m4a")) mimeType = "audio/x-m4a";
      else if (file.fileName?.endsWith(".mp3")) mimeType = "audio/mp3";
      else if (file.fileName?.endsWith(".wav")) mimeType = "audio/wav";
      else if (file.uri?.includes(".m4a")) mimeType = "audio/x-m4a";
      else if (file.uri?.includes(".mp3")) mimeType = "audio/mp3";
      else if (file.uri?.includes(".wav")) mimeType = "audio/wav";
      else if (file.type === "audio") mimeType = "audio/x-m4a"; // default audio
      else mimeType = "image/jpeg"; // default
    }

    console.log(file, "Detected mime type:", mimeType)
    const formData: any = new FormData();
    formData.append("file", {
      uri: file.uri,
      type: mimeType,
      name: file.fileName || `upload.${mimeType.split("/")[1]}`,
    });

    
    formData.append("upload_preset", uploadPreset);

    const resourceType = mimeType.startsWith("video") ? "video" : 
                        mimeType.startsWith("audio") ? "video" : // Cloudinary treats audio as video resource
                        "image";
    console.log(resourceType)

    console.log(formData, "formData")

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Upload failed");
    }

    console.log("✅ Cloudinary Upload Success:", data.secure_url);
    return data.secure_url;
  } catch (err) {
    console.error("❌ Cloudinary Upload Error:", err);
    throw err;
  }
};

export const uploadMultipleToCloudinary = async (
  files: {
    uri: string;
    type?: string;
    fileName?: string;
  }[]
): Promise<string[]> => {
  try {
    // Run uploads in parallel
    const uploadPromises = files.map(file => uploadToCloudinary(file));

    // Wait until all uploads finish
    const urls = await Promise.all(uploadPromises);

    console.log("✅ All Cloudinary Uploads Success:", urls);
    return urls;
  } catch (err) {
    console.error("❌ Cloudinary Multiple Upload Error:", err);
    throw err;
  }
};

