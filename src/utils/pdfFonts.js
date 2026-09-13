import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import amiriRegularUrl from "../assets/fonts/Amiri-Regular.ttf?url";
import amiriBoldUrl from "../assets/fonts/Amiri-Bold.ttf?url";

export const PDF_FONT = "Amiri";

const ROBOTO_FONTS = {
  Roboto: {
    normal: "Roboto-Regular.ttf",
    bold: "Roboto-Medium.ttf",
    italics: "Roboto-Italic.ttf",
    bolditalics: "Roboto-MediumItalic.ttf",
  },
};

const AMIRI_FONTS = {
  Amiri: {
    normal: "Amiri-Regular.ttf",
    bold: "Amiri-Bold.ttf",
    italics: "Amiri-Regular.ttf",
    bolditalics: "Amiri-Bold.ttf",
  },
};

function extractVfs(mod) {
  const candidates = [
    mod?.pdfMake?.vfs,
    mod?.default?.pdfMake?.vfs,
    mod?.vfs,
    mod?.default?.vfs,
    mod?.default,
    mod,
  ];
  for (const candidate of candidates) {
    if (
      candidate &&
      typeof candidate === "object" &&
      !Array.isArray(candidate) &&
      (candidate["Roboto-Regular.ttf"] || candidate["Roboto-Medium.ttf"])
    ) {
      return candidate;
    }
  }
  return {};
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function fontFileToBase64(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`تعذر تحميل ملف الخط: ${url}`);
  }
  return arrayBufferToBase64(await response.arrayBuffer());
}

const defaultVfs = extractVfs(pdfFonts);
let cachedVfs = null;
let fontsReady = null;

export function ensurePdfFonts() {
  if (!fontsReady) {
    fontsReady = (async () => {
      const [regular, bold] = await Promise.all([
        fontFileToBase64(amiriRegularUrl),
        fontFileToBase64(amiriBoldUrl),
      ]);
      cachedVfs = {
        ...defaultVfs,
        "Amiri-Regular.ttf": regular,
        "Amiri-Bold.ttf": bold,
      };
      pdfMake.addVirtualFileSystem(cachedVfs);
      pdfMake.setFonts({ ...ROBOTO_FONTS, ...AMIRI_FONTS });
      return cachedVfs;
    })();
  }
  return fontsReady;
}

export function getPdfVfs() {
  return cachedVfs;
}

export function getPdfFontMap() {
  return { ...ROBOTO_FONTS, ...AMIRI_FONTS };
}

export default pdfMake;
