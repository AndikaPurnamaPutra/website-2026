// About page (Figma "About" 1734:317; docs/implementation/19-about.md).

// Principles (Figma 1734:383 and "Principles - 1…6" 1678:615 – 1678:660):
// [title, lines]. Texts 03–06 are still copies of 01 in Figma (user
// decision) until the real ones exist.
const execution = ["Execution Over Overhead", ["We replace long discovery phases and heavy layers with high-velocity weekly sprints.", "We focus entirely on shipping production-ready work."]]
export const principles = [
  execution,
  ["Frictionless Infrastructure", ["We work inside your ecosystem using Figma, Webflow, and ClickUp. Every file, layer, and component is organized, clean, and immediately ready for your development team."]],
  execution, execution, execution, execution
];

// Gallery (Figma 1734:399): five photos placed freely, [file, [x, y, width,
// height] in Figma pixels, alt].
export const photos = [
  ["gallery-1.webp", [0, 0, 1130, 636], "The team together in a field below a mountain"],
  ["gallery-2.webp", [900, 715.63, 460, 589], "Two team members walking along a garden path"],
  ["gallery-3.webp", [0, 988, 805, 411], "Two designers working side by side at a computer"],
  ["gallery-4.webp", [0, 1479, 345, 325], "A desk with screens and collectible figures"],
  ["gallery-5.webp", [440, 1650, 920, 478], "The team working together on their laptops"]
];

// Team (Figma 1734:409). Names and roles as in Figma.
export const team = [
  ["Abi Sa'iidil Mubarok Makhzum", "Video & Motion"],
  ["Adianto Dwi Utomo", "Lead Developer"],
  ["Aji Wahyu Izza Novany", "Mid. Developer"],
  ["Andika Bagas Pratama", "Mid. UIX Designer"],
  ["Andika Purnama Putra", "Mid. Developer"],
  ["Anggiat Manuel", "Senior UIX Designer"],
  ["Anindya Hastari", "Jr. Graphic Designer"],
  ["Brian Kusuma", "Mid. Developer"],
  ["Carryl Amalia Putri", "Mid. Illustrator"],
  ["Dhefry Andirezha", "Lead Illustrator"],
  ["Dhimas Luqman Hakim", "Project Manager"],
  ["Dominica Atma Swasti", "Project Manager"],
  ["Esti Kurniawati", "Mid. Illustrator"],
  ["Fadhila Rizky Husaini", "Lead UIX Designer"],
  ["Fajrin Arrahman Bilqisti", "Lead Graphic Designer"],
  ["Iz Fatimah Asy Syarifah", "Lead Project Manager"],
  ["Kevin Merico Setiawan", "Mid. UIX Designer"],
  ["Mirna Kusumawati", "Mid. UIX Designer"],
  ["Mohammad Ariq Maulana Ibrahim", "Mid. UIX Designer"],
  ["Muhammad Faiz Abdillah", "Jr. UIX Designer"],
  ["Muhammad Irfan Afianto", "Lead UIX Designer"],
  ["Muhammad Izza Recka Putra", "Mid. UIX Designer"],
  ["Muhammad Khoer Alhabsyi", "Jr. UIX Desiger"],
  ["Muhammad Ridwan Imam Fajar", "Senior UIX Designer"],
  ["Nur Vatoni", "Mid. Brand Designer"],
  ["Putri Monirizki", "Mid. Illustrator"],
  ["Rifqi Dhia Rahmatullah", "Mid. Illustrator"],
  ["Rizva Bahrum Isnandi", "3D Animator Designer"],
  ["Royhan Muhammad Khawarizmi", "Senior UIX Designer"],
  ["Sigit Setyo Nugroho", "Lead 3D Motion Designer"],
  ["Tosan Ahmad Garditama", "Senior UIX Designer"],
  ["Umar Aji Pratama", "Lead UIX Designer"]
];
