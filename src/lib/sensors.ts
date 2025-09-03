// export const SENSORS = [
//   {
//     name: "IMAX 65mm (15-perf)",
//     width: 70.41,
//     height: 56.62,
//     aspect: "1.24:1",
//     desc: "IMAX 15-perf horizontal 65mm capture area (camera negative)",
//   },
//   {
//     name: "65mm (5-perf)",
//     width: 52.15,
//     height: 23.07,
//     aspect: "2.26:1",
//     desc: "Traditional 65mm 5-perf capture area (camera negative)",
//   },
//   {
//     name: "VistaVision (35mm 8-perf)",
//     width: 37.72,
//     height: 24.92,
//     aspect: "1.51:1",
//     desc: "35mm film run horizontally; classic Vistavision capture",
//   },
//   {
//     name: "35mm 4-perf (Academy)",
//     width: 24.9,
//     height: 18.7,
//     aspect: "1.33:1",
//     desc: "Standard 35mm 4-perf camera capture area",
//   },
//   {
//     name: "35mm 3-perf",
//     width: 24.9,
//     height: 13.9,
//     aspect: "1.79:1",
//     desc: "3-perf variant for native widescreen efficiency",
//   },
//   {
//     name: "35mm 2-perf (Techniscope)",
//     width: 24.9,
//     height: 9.35,
//     aspect: "2.66:1",
//     desc: "2-perf widescreen capture; very economical on stock",
//   },
//   {
//     name: "Super 16",
//     width: 12.42,
//     height: 7.44,
//     aspect: "1.67:1",
//     desc: "Wider image area than regular 16mm",
//   },
//   {
//     name: "Super 8 (regular gate)",
//     width: 5.79,
//     height: 4.01,
//     aspect: "1.44:1",
//     desc: "Classic home-movie format",
//   },
//   {
//     name: "Super 8 (extended gate)",
//     width: 6.3,
//     height: 4.2,
//     aspect: "1.50:1",
//     desc: "Extended gate Super 8 capture",
//   },

//   // ARRI
//   {
//     name: "ARRI ALEXA 65 (Open Gate)",
//     width: 54.12,
//     height: 25.58,
//     aspect: "2.12:1",
//     desc: "Large-format ALEV III 65mm digital sensor (Open Gate)",
//   },
//   {
//     name: "ARRI ALEXA LF / Mini LF (Open Gate)",
//     width: 36.7,
//     height: 25.54,
//     aspect: "1.44:1",
//     desc: "ARRI LF large-format sensor active area (Open Gate)",
//   },
//   {
//     name: "ARRI ALEXA 35 (Open Gate 3:2)",
//     width: 28.0,
//     height: 19.2,
//     aspect: "1.46:1",
//     desc: "Super 35 ALEV 4 sensor active area in 3:2 Open Gate",
//   },

//   // RED
//   {
//     name: "RED V-RAPTOR 8K VV",
//     width: 40.96,
//     height: 21.6,
//     aspect: "1.90:1",
//     desc: "RED 8K full-frame/VV sensor active area",
//   },
//   {
//     name: "RED MONSTRO 8K VV",
//     width: 40.96,
//     height: 21.6,
//     aspect: "1.90:1",
//     desc: "MONSTRO full-frame/VV sensor active area",
//   },
//   {
//     name: "RED KOMODO 6K (S35)",
//     width: 27.03,
//     height: 14.26,
//     aspect: "1.90:1",
//     desc: "KOMODO Super 35 global-shutter sensor",
//   },

//   // Sony
//   {
//     name: "Sony VENICE 2 (8.6K FF, Open Gate)",
//     width: 36.0,
//     height: 24.0,
//     aspect: "3:2",
//     desc: "CineAlta full-frame sensor (Open Gate, representative FF dims)",
//   },

//   // Canon
//   {
//     name: "Canon EOS C500 Mark II (FF DCI area)",
//     width: 38.1,
//     height: 20.1,
//     aspect: "1.90:1",
//     desc: "Cinema EOS full-frame DCI active image area",
//   },
//   {
//     name: "Canon EOS C300 (Super 35)",
//     width: 24.6,
//     height: 13.8,
//     aspect: "1.78:1",
//     desc: "Canon Super 35 active image area",
//   },

//   // Blackmagic Design
//   {
//     name: "Blackmagic URSA Mini Pro 12K (S35)",
//     width: 27.03,
//     height: 14.25,
//     aspect: "1.90:1",
//     desc: "Blackmagic 12K Super 35 sensor active area",
//   },
//   {
//     name: "Blackmagic Pocket Cinema Camera 6K (S35)",
//     width: 23.1,
//     height: 12.99,
//     aspect: "1.78:1",
//     desc: "Pocket 6K Super 35 sensor active area",
//   },

//   // Panasonic
//   {
//     name: "Panasonic VariCam 35 (S35)",
//     width: 35.9,
//     height: 18.7,
//     aspect: "1.92:1",
//     desc: "Panasonic S35 cinema sensor",
//   },

//   // Common still/video formats
//   {
//     name: "Full Frame (35mm still)",
//     width: 36.0,
//     height: 24.0,
//     aspect: "3:2",
//     desc: "35mm stills equivalent; widely used in cinema FF cameras",
//   },
//   {
//     name: "APS-C (typical)",
//     width: 23.6,
//     height: 15.7,
//     aspect: "3:2",
//     desc: "Typical APS-C active area (varies slightly by maker)",
//   },
//   {
//     name: "Micro Four Thirds",
//     width: 17.3,
//     height: 13.0,
//     aspect: "4:3",
//     desc: "MFT active imaging area",
//   },
//   {
//     name: 'Type 1" (1-inch)',
//     width: 13.2,
//     height: 8.8,
//     aspect: "3:2",
//     desc: "Common compact/video sensor size (naming is legacy)",
//   },
// ];

export const SENSORS = [
  // Large format film
  {
    name: "IMAX 65mm (15-perf)",
    width: 70.41,
    height: 56.62,
    aspect: "1.24:1",
    desc: "IMAX 15-perf horizontal 65mm capture area (camera negative)",
  },
  {
    name: "65mm (5-perf)",
    width: 52.15,
    height: 23.07,
    aspect: "2.26:1",
    desc: "Traditional 65mm 5-perf capture area (camera negative)",
  },
  {
    name: "VistaVision (35mm 8-perf)",
    width: 37.72,
    height: 24.92,
    aspect: "1.51:1",
    desc: "35mm film run horizontally; classic VistaVision capture",
  },

  // 35mm film
  {
    name: "35mm 4-perf (Academy)",
    width: 24.9,
    height: 18.7,
    aspect: "1.33:1",
    desc: "Standard 35mm 4-perf camera capture area",
  },
  {
    name: "35mm 3-perf",
    width: 24.9,
    height: 13.9,
    aspect: "1.79:1",
    desc: "3-perf variant for native widescreen efficiency",
  },
  {
    name: "35mm 2-perf (Techniscope)",
    width: 24.9,
    height: 9.35,
    aspect: "2.66:1",
    desc: "2-perf widescreen capture; very economical on stock",
  },

  // Small gauge film
  {
    name: "Super 16",
    width: 12.42,
    height: 7.44,
    aspect: "1.67:1",
    desc: "Wider image area than regular 16mm",
  },
  {
    name: "Super 8 (regular gate)",
    width: 5.79,
    height: 4.01,
    aspect: "1.44:1",
    desc: "Classic home-movie format",
  },
  {
    name: "Super 8 (extended gate)",
    width: 6.3,
    height: 4.2,
    aspect: "1.50:1",
    desc: "Extended gate Super 8 capture",
  },

  // Common digital sensor standards
  {
    name: "Full Frame (35mm still)",
    width: 36.0,
    height: 24.0,
    aspect: "3:2",
    desc: "35mm stills equivalent; widely used in cinema FF cameras",
  },
  {
    name: "APS-C (typical)",
    width: 23.6,
    height: 15.7,
    aspect: "3:2",
    desc: "Typical APS-C active area (varies slightly by maker)",
  },
  {
    name: "Micro Four Thirds",
    width: 17.3,
    height: 13.0,
    aspect: "4:3",
    desc: "MFT active imaging area",
  },
  {
    name: 'Type 1" (1-inch)',
    width: 13.2,
    height: 8.8,
    aspect: "3:2",
    desc: "Common compact/video sensor size (naming is legacy)",
  },
];
