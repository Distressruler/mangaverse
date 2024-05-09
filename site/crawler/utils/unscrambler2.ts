export {}
// import sharp from "sharp";
// import jimp from "jimp";
// import { RGBA } from "@jimp/core/types"

// const imageURL =
//   // "https://e724ecaf8b45369f080fe3276308b90d.cdnext.stream.ne.jp/books_file//browser//0001327595//BT000132759501801801900207_001//251.jpg?__token=Ssfzc2XhL/T1oKeX/Is9QNPKdUib/F3FnzJNFxEh+bGh+tDIsiQJLworuIIYIC0uDqyyobdmVtNwbvYw";
//   "https://cdn.discordapp.com/attachments/945143826895503430/1142704877517164575/251.jpg";

// // sharp("base.jpg")
// //   .toColorspace("b-w") // Convert to grayscale
// //   .convolve({
// //     width: 3,
// //     height: 3,
// //     kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1], // Example Laplacian filter
// //   })
// //   .toFile("edge_detected_piece.jpg", (err, info) => {
// //     if (err) {
// //       console.error("Error processing image:", err);
// //     } else {
// //       console.log("Edge-detected image saved:", info);
// //     }
// //   });

// export type UnPromise<T> = T extends Promise<infer U> ? U : T;

// export async function unscramble() {
//   // Define cropping parameters
//   const startX = 0; // Starting X coordinate of the crop area
//   const startY = 0; // Starting Y coordinate of the crop area
//   const width = 96; // Width of the cropped area
//   const height = 128; // Height of the cropped area
//   const maxWidth = 1115;
//   const maxHeight = 1600;
//   const sections: {
//     img: UnPromise<ReturnType<typeof jimp.read>>;
//     dna: Record<string, Record<string, RGBA>>;
//     diffs: Record<string, { top: number; bottom: number; right: number; left: number }>;
//   }[] = [];
//   const widthCount = Math.floor(maxWidth / width);
//   const heightCount = Math.floor(maxHeight / height);
//   const boxCount = Math.floor(maxWidth / width) * Math.floor(maxHeight / height);
//   console.log("width count", widthCount);

//   console.log(`[UNSCRAMBLER] Fetching image`, imageURL);
//   const buffer = Buffer.from(await fetch(imageURL).then((res) => res.arrayBuffer()));
//   console.log(`[UNSCRAMBLER] Fetched image`, imageURL);

//   const base = await jimp.read(buffer);
//   base.brightness(1);
//   await base.writeAsync("base2.jpg");

//   for (let i = 0; i < boxCount; i++) {
//     // console.log("[UNSCRAMBLER] Cropping", i, "box.");
//     // Perform cropping using sharp
//     const jimg = (await jimp.read(buffer)).crop(
//       (startX + Math.floor(i % widthCount)) * width,
//       (startY + Math.floor(i / widthCount)) * height,
//       width,
//       height
//     );

//     const jimg2 = await jimp.read(
//       await sharp(buffer)
//         .extract({ height, width, left: (startX + Math.floor(i % widthCount)) * width, top: (startY + Math.floor(i / widthCount)) * height })
//         .toColorspace("b-w") // Convert to grayscale
//         .convolve({
//           width: 3,
//           height: 3,
//           kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1], // Example Laplacian filter
//         })
//         .toBuffer()
//     );
//     // .toFile("edge_detected_piece.jpg", (err, info) => {
//     //   if (err) {
//     //     console.error("Error processing image:", err);
//     //   } else {
//     //     console.log("Edge-detected image saved:", info);
//     //   }
//     // });

//     // console.log("[UNSCRAMBLER] Cropped", i, "box.");

//     // Make DNA markers for each image
//     const dna: Record<string, Record<string, RGBA>> = {
//       top: {},
//       right: {},
//       left: {},
//       bottom: {},
//     };

//     for (let h = 0; h <= height; h++) {
//       for (let w = 0; w <= width; w++) {
//         // Useless markers ignore
//         if (w !== 0 && w !== width && h !== 0 && h !== height) {
//         } else {
//           const rgb = jimp.intToRGBA(jimg2.getPixelColor(w, h));

//           if (w === 0) {
//             dna.left[`w-${w}-h-${h}`] = rgb;
//           }
//           if (w === width) {
//             dna.right[`w-${w}-h-${h}`] = rgb;
//           }
//           if (h === 0) {
//             dna.top[`w-${w}-h-${h}`] = rgb;
//           }
//           if (h === height) {
//             dna.bottom[`w-${w}-h-${h}`] = rgb;
//           }
//         }
//       }
//     }
//     // console.log("[UNSCRAMBLER] Created DNA markers for box #", i);
//     sections.push({ img: jimg2, dna, diffs: {} });
//   }
//   console.log("[UNSCRAMBLER] Created DNA markers for box #");

//   // Time to start comparing sides
//   console.log("[UNSCRAMBLER] Begin comparing DNA Markers to determine sides.");
//   // console.log('sides', sections[0].dna)

//   const unorganized: { main: number; other: number; type: "top" | "bottom" | "right" | "left"; diff: number }[] = [];

//   console.log("[UNSCRAMBLER] Comparing DNA markers.");
//   for (const [index, section] of sections.entries()) {
//     // console.log("[UNSCRAMBLER] Comparing DNA markers for box #", index, "of", sections.length, "boxes", boxCount);

//     for (const [idx, sect] of sections.entries()) {
//       if (index === idx) continue;

//       let ldiff = 0;
//       for (const key of Object.keys(section.dna.left)) {
//         const value = section.dna.left[key];
//         // if (value.a < 0.4 || (value.b > 200 && value.g > 200 && value.r > 200)) ldiff += 3;
//         // else {
//         const uniqueKey = Number(key.substring(key.lastIndexOf("-") + 1));
//         const alldifs = [jimp.colorDiff(section.dna.left[key], sect.dna.right[`w-${width}-h-${uniqueKey}`])];
//         if (uniqueKey > 0) {
//           alldifs.push(jimp.colorDiff(section.dna.left[key], sect.dna.right[`w-${width}-h-${uniqueKey - 1}`]));
//         }
//         if (uniqueKey < height) {
//           alldifs.push(jimp.colorDiff(section.dna.left[key], sect.dna.right[`w-${width}-h-${uniqueKey + 1}`]));
//         }

//         ldiff += alldifs.reduce((a, b) => (b < a ? b : a), 3);
//         // }
//       }

//       let rdiff = 0;
//       for (const key of Object.keys(section.dna.right)) {
//         const value = section.dna.right[key];
//         // if (value.a < 0.4 || (value.b > 200 && value.g > 200 && value.r > 200)) rdiff += 3;
//         // else {
//         const uniqueKey = Number(key.substring(key.lastIndexOf("-") + 1));
//         const alldifs = [jimp.colorDiff(section.dna.right[key], sect.dna.left[`w-0-h-${uniqueKey}`])];
//         if (uniqueKey > 0) {
//           alldifs.push(jimp.colorDiff(section.dna.right[key], sect.dna.left[`w-0-h-${uniqueKey - 1}`]));
//         }
//         if (uniqueKey < height) {
//           alldifs.push(jimp.colorDiff(section.dna.right[key], sect.dna.left[`w-0-h-${uniqueKey + 1}`]));
//         }

//         rdiff += alldifs.reduce((a, b) => (b < a ? b : a), 3);
//         // }
//       }

//       let tdiff = 0;
//       for (const key of Object.keys(section.dna.top)) {
//         const value = section.dna.top[key];
//         // if (value.a < 0.4 || (value.b > 200 && value.g > 200 && value.r > 200)) tdiff += 3;
//         // else {
//         const uniqueKey = Number(key.substring(2, key.indexOf("-h-")));
//         const alldifs = [jimp.colorDiff(section.dna.top[key], sect.dna.bottom[`w-${uniqueKey}-h-${height}`])];
//         if (uniqueKey > 0) {
//           alldifs.push(jimp.colorDiff(section.dna.top[key], sect.dna.bottom[`w-${uniqueKey - 1}-h-${height}`]));
//         }
//         if (uniqueKey < width) {
//           alldifs.push(jimp.colorDiff(section.dna.top[key], sect.dna.bottom[`w-${uniqueKey + 1}-h-${height}`]));
//         }

//         tdiff += alldifs.reduce((a, b) => (b < a ? b : a), 3);
//         // }
//       }

//       let bdiff = 0;
//       for (const key of Object.keys(section.dna.bottom)) {
//         const value = section.dna.bottom[key];
//         // if (value.a < 0.4 || (value.b > 200 && value.g > 200 && value.r > 200)) bdiff += 3;
//         // else {
//         const uniqueKey = Number(key.substring(2, key.indexOf("-h-")));
//         const alldifs = [jimp.colorDiff(section.dna.bottom[key], sect.dna.top[`w-${uniqueKey}-h-0`])];
//         if (uniqueKey > 0) {
//           alldifs.push(jimp.colorDiff(section.dna.bottom[key], sect.dna.top[`w-${uniqueKey - 1}-h-0`]));
//         }
//         if (uniqueKey < width) {
//           alldifs.push(jimp.colorDiff(section.dna.bottom[key], sect.dna.top[`w-${uniqueKey + 1}-h-0`]));
//         }

//         bdiff += alldifs.reduce((a, b) => (b < a ? b : a), 3);
//         // }
//       }

//       section.diffs[idx.toString()] = { top: tdiff, right: rdiff, bottom: bdiff, left: ldiff };
//       unorganized.push(
//         { main: index, other: idx, type: "top", diff: tdiff },
//         { main: index, other: idx, type: "right", diff: rdiff },
//         { main: index, other: idx, type: "bottom", diff: bdiff },
//         { main: index, other: idx, type: "left", diff: ldiff }
//       );
//     }

//     // const organized = section.diffs.sort((a, b) => a[1] - b[1])
//     // console.log(organized)
//     // const minimal = organized
//     // .filter(org => org[1] <= organized[0][1])
//     // console.log(minimal)

//     // todo: do all of them
//     // const test = (await jimp.read(buffer))

//     // for (const [mindex, minim] of minimal.entries()) {
//     //     test.composite(sections[minim[0]].img, 0, mindex * height);
//     //     test.composite(section.img, width, mindex * height);
//     //     if (mindex > 10) break;
//     // }
//     // console.log(section.img, sections[minimal[0][0]])

//     // test.composite(section.img, 0, 0)
//     // test.composite(sections[minimal[0][0]].img, width, 0);
//     // test.write("output.jpg");
//     // return;
//     // if (index > 5) return;
//   }
//   console.log("[UNSCRAMBLER] Compared DNA markers.");

//   // Organize sections in order of most closest first
//   // console.log('unorganized', )
//   const organized = unorganized.sort((a, b) => a.diff - b.diff);
//   // console.log('organized', organized);

//   // const test = (await jimp.read(buffer))
//   let counter = 0;

//   const bestMatches = new Map<
//     number,
//     Array<{
//       main: number;
//       other: number;
//       type: "top" | "bottom" | "right" | "left";
//       diff: number;
//     }>
//   >();

//   while (organized.length) {
//     const section = organized[counter];

//     const mainMatched = bestMatches.get(section.main);
//     const otherMatched = bestMatches.get(section.other);
//     if (mainMatched) {
//       const exists = mainMatched.find((side) => side.type === section.type);
//       counter++;

//       if (exists) continue;

//       mainMatched.push(section);
//     } else {
//       bestMatches.set(section.main, [section]);
//     }

//     if (otherMatched) {
//       const exists = otherMatched.find(
//         (side) => section.type === (side.type === "right" ? "left" : side.type === "left" ? "right" : side.type === "top" ? "bottom" : "top")
//       );
//       counter++;

//       if (exists) continue;

//       otherMatched.push(section);
//     } else {
//       bestMatches.set(section.other, [section]);
//     }

//     const limg = (await jimp.read(buffer)).crop(
//       maxWidth / 2,
//       maxHeight / 2,
//       ["left", "right"].includes(section.type) ? width * 2 : width,
//       ["top", "bottom"].includes(section.type) ? height * 2 : height
//     );

//     switch (section.type) {
//       case "left":
//         limg.composite(sections[section.main].img, width, 0);
//         limg.composite(sections[section.other].img, 0, 0);
//         break;
//       case "right":
//         limg.composite(sections[section.main].img, 0, 0);
//         limg.composite(sections[section.other].img, width, 0);
//         break;
//       case "top":
//         limg.composite(sections[section.main].img, 0, height);
//         limg.composite(sections[section.other].img, 0, 0);
//         break;
//       case "bottom":
//         limg.composite(sections[section.main].img, 0, 0);
//         limg.composite(sections[section.other].img, 0, height);
//         break;
//     }
//     // test.composite(sections[section.main].img, 0, counter * height);

//     limg.write(`output-${counter}.jpg`);

//     counter++;
//     if (counter > 10) {
//       return;
//     }
//   }
//   // for (const [index, section] of sections.entries()) {
//   //     for (const key of Object.keys(section.diffs)) {
//   //         organized.push({
//   //             main: index.toString(),
//   //             other: key,
//   //             diff: section.diffs[key].bottom,
//   //         })
//   //     }
//   // }
// }

// unscramble();
