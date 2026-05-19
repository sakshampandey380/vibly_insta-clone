const imageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const videoMimeTypes = ["video/mp4", "video/webm", "video/quicktime"];
const audioMimeTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/x-wav"];
const verificationMimeTypes = [...imageMimeTypes, "application/pdf"];

export const uploadRules = {
  postMaxBytes: 20 * 1024 * 1024,
  reelMaxBytes: 20 * 1024 * 1024,
  reelMaxDurationSeconds: 180,
  avatarMaxBytes: 8 * 1024 * 1024,
  bannerMaxBytes: 12 * 1024 * 1024,
  notificationAudioMaxBytes: 6 * 1024 * 1024,
  verificationMaxBytes: 10 * 1024 * 1024
};

export function formatBytes(bytes?: number) {
  if (!bytes) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
}

export function formatDuration(seconds?: number) {
  if (!seconds && seconds !== 0) {
    return "";
  }

  const totalSeconds = Math.max(0, Math.round(seconds));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function validateImageFile(file: File, maxBytes = uploadRules.avatarMaxBytes) {
  if (!imageMimeTypes.includes(file.type)) {
    throw new Error("Invalid file type. Allowed formats: jpg, jpeg, png, webp.");
  }
  if (file.size > maxBytes) {
    throw new Error("File too large.");
  }
}

export function validateVideoFile(file: File, maxBytes = uploadRules.postMaxBytes) {
  if (!videoMimeTypes.includes(file.type)) {
    throw new Error("Invalid file type. Allowed formats: mp4, webm, mov.");
  }
  if (file.size > maxBytes) {
    throw new Error("File too large.");
  }
}

export function validateAudioFile(file: File) {
  if (!audioMimeTypes.includes(file.type)) {
    throw new Error("Invalid file type. Allowed formats: mp3, wav, ogg.");
  }
  if (file.size > uploadRules.notificationAudioMaxBytes) {
    throw new Error("File too large.");
  }
}

export function validateVerificationFile(file: File) {
  if (!verificationMimeTypes.includes(file.type)) {
    throw new Error("Invalid file type. Allowed formats: jpg, jpeg, png, pdf.");
  }
  if (file.size > uploadRules.verificationMaxBytes) {
    throw new Error("File too large.");
  }
}

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });
}

export function readVideoDuration(file: File) {
  return new Promise<number>((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
    };

    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      cleanup();
      resolve(duration);
    };
    video.onerror = () => {
      cleanup();
      reject(new Error("Unable to read video metadata."));
    };

    video.src = objectUrl;
  });
}

export async function buildVideoThumbnail(file: File) {
  const duration = await readVideoDuration(file);

  return new Promise<{ duration: number; thumbnailUrl: string }>((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const captureTimes = [0.2, 0.45, 0.65]
      .map((fraction) => Math.max(0.2, Math.min(duration * fraction, Math.max(duration - 0.2, 0.2))));
    let captureIndex = 0;

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
    };

    const captureFrame = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 720;
      canvas.height = video.videoHeight || 1280;
      const context = canvas.getContext("2d");

      if (!context) {
        cleanup();
        reject(new Error("Unable to generate video thumbnail."));
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.88);

      cleanup();
      resolve({ duration, thumbnailUrl });
    };

    video.onloadedmetadata = () => {
      video.currentTime = captureTimes[captureIndex] ?? 0.2;
    };

    video.onseeked = () => {
      captureFrame();
    };

    video.onerror = () => {
      if (captureIndex < captureTimes.length - 1) {
        captureIndex += 1;
        video.currentTime = captureTimes[captureIndex];
        return;
      }

      cleanup();
      reject(new Error("Unable to generate video thumbnail."));
    };

    video.src = objectUrl;
  });
}
