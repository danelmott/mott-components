'use client';
import { Style, Avatar } from "@dicebear/core";
import definition from '@dicebear/styles/critters.json' with { type: 'json' };

export default function Avatars({name}) {
    const style = new Style(definition);
const avatar = new Avatar(style, {
  "backgroundColor": [
      "b6e3f4",
      "c0aede",
      "d1d4f9",
      "ffd5dc",
      "ffdfbf",
      "d9f2d9",
      "0369a1",
      "4338ca",
      "a21caf",
      "be123c",
      "047857"
    ],
  "mouthProbability": 90,
  "eyesVariant": [
       "angry",
       "bigPupils",
       "close",
       "closedLine",
       "dots",
       "happy",
       "inward",
       "mono",
       "monoSleepy",
       "round",
       "sideeye",
       "sleepy",
       "squint",
       "threeRow",
       "trio",
       "uneven",
       "wide",
       "wink"
  ],
  "mouthVariant": [
      "blep",
      "catMouth",
      "dot",
      "grin",
      "laugh",
      "line",
      "ooh",
      "open",
      "smile",
      "smirk",
      "teeth",
      "tinySmile",
      "tongue",
      "tooth"
  ],
  "topProbability": 80,
  "backgroundColorAngle": -324,
  "backgroundColorFillStops": 5,
  "seed": `"${name}"`,
   "animationVariant": {
      "medium": 1
    },
    "animationProbability": 100,

});

   const svg = avatar.toString();
}