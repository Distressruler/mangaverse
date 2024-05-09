export async function sendNewChapterAlertToDiscord(name: string, chapter: number, image: string) {
  const cleanName = name
    .split("-")
    .map((word) => `${word[0].toUpperCase()}${word.substring(1)}`)
    .join(" ");
    
  await fetch(
    // "https://discord.com/api/v10/webhooks/1095591323769253968/p8TPiJzxKR_IirxQhS_Q1Tf4DMsKFDywXPzpamGWuWo4Y5qbIfUoaCk-m7TDS9snNa8c",
    "https://discord.com/api/webhooks/1117590063463800903/yYel8mH_JJFDJpFGFZonza_8P-VzZy2G2UxY1E8Xqons7RMyvOeWOOhnorByAAgYS-IW",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `custom message here`,
        description: "**New Chapter Released!**",
        components: [
          {
            type: 1,
            components: [
              {
                // Button
                type: 2,
                label: `Read Chapter #${chapter.toLocaleString()}`,
                // link style
                style: 5,
                // emoji: { name: "🆕" },
                url: `https://enryu.vercel.app/mangas/${name}/chapter/${chapter}`,
              },
              ...[
                chapter > 1
                  ? {
                    // Button
                    type: 2,
                    label: "Read Previous",
                    // link style
                    style: 5,
                    // emoji: { name: "⬅️" },
                    url: `https://enryu.vercel.app/mangas/${name}/chapter/${chapter - 1}`,
                  }
                  : {},
              ],
              {
                // Button
                type: 2,
                label: "Read Chapter #1",
                // link style
                style: 5,
                // emoji: { name: "⏮️" },
                url: `https://enryu.vercel.app/mangas/${name}/chapter/1`,
              },
            ],
          },
        ],
        embeds: [
          {
            title: `${cleanName} Chapter #${chapter.toLocaleString()}`,
            url: `https://enryu.vercel.app/mangas/${name}/chapter/${chapter}`,
            // Random color
            color: Math.floor(Math.random() * (0xffffff + 1)),
            image: {
              url: image,
            },
            // fields: [
            //   ...[
            //     chapter > 1
            //       ? {
            //           name: "Previous Chapters",
            //           value: `[Read Chapter #${(chapter - 1).toLocaleString()}](https://enryu.vercel.app/mangas/${name}/chapter/${chapter - 1})`,
            //           inline: true,
            //         }
            //       : {},
            //   ],
            // ],
          },
        ],
      }),
    }
    // config.chapterAlertWebhookId,
    // "1095566993794531438",
    // config.chapterAlertWebhookToken,
    // "O7qPerBL5BzvuIt8KkNAWQEoz1irlaSJ6BmDoGRdjmvx5CLMAv0HWvftGrDf-_r7EifB",
  ).catch(console.log);
}

export function chooseRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function cleanChapterNumber(possible: string): number {
  let chapter: string | number = possible;
  if (possible.startsWith('chapter-')) chapter = chapter.substring(chapter.indexOf("-") + 1);
  chapter = chapter.replaceAll("_", ".");
  chapter = chapter.replace("-", ".");
  // remove any non number characters
  chapter = chapter.replace(/[^0-9.]/g, "")
  if (chapter.includes("..")) chapter = chapter.substring(0, chapter.indexOf(".."))
  
  const number = Number(chapter);

  if (isNaN(number)) console.log("[ERROR] Failed to convert to a number:", possible, chapter);
  return number;
}


