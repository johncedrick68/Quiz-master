const rules: [RegExp, string][] = [
  [/no u[- ]?turn|bawal.*u[- ]?turn/i, "/images/No U-turn.webp"],
  [
    /slippery road|madulas.*kalsada/i,
    "/images/Philippines-Warning-Sign-Warning-for-a-slippery-road-surface.webp",
  ],
  [/road works|ginagawang kalsada/i, "/images/lto/signs/road-works.svg"],
  [
    /dangerous left double bend|double.*curve.*left|dobleng.*kurbada.*kaliwa/i,
    "/images/Philippines-Warning-Sign-Warning-for-a-double-curve--first-left-then-right.webp",
  ],
  [
    /dangerous.*curve.*left|delikado.*kurbada.*kaliwa/i,
    "/images/Philippines-Warning-Sign-Warning-for-a-sharp-curve-to-the-left.webp",
  ],
  [
    /curve ahead|kurbada.*unahan/i,
    "/images/Philippines-Warning-Sign-Warning-for-curves.webp",
  ],
  [/yield|give way|magbigay.?daan/i, "/images/giveway_sign.webp"],
  [
    /school zone|pook paaralan|tawiran ng paaralan/i,
    "/images/children_crossing.webp",
  ],
  [/no entry|bawal pumasok.*sasakyan/i, "/images/no_entry.webp"],
  [/no right turn|bawal.*kanan/i, "/images/No right turn.webp"],
  [
    /no motor vehicles|no entry for all types of vehicles/i,
    "/images/no_entry.webp",
  ],
  [/do not overtake|no overtaking/i, "/images/No overtaking.webp"],
  [
    /road narrows|makitid.*daan/i,
    "/images/Philippines-Warning-Sign-Warning-for-a-road-narrowing.webp",
  ],
  [
    /downhill course|steep descent/i,
    "/images/Philippines-Warning-Sign-Warning-for-a-steep-descent.webp",
  ],
  [
    /dangerous right curve/i,
    "/images/Philippines-Warning-Sign-Warning-for-a-sharp-curve-to-the-right.webp",
  ],
  [
    /approach to intersection(?!.*merging)/i,
    "/images/lto/signs/intersection.svg",
  ],
  [/pass either side/i, "/images/lto/signs/pass-either-side.svg"],
  [
    /railroad crossing|riles ng tren|reles ng tren/i,
    "/images/Philippines-Warning-Sign-Warning-for-a-railroad-crossing-without-barriers.webp",
  ],
  [
    /end of.*speed limit|katapusan.*speed limit|katapusan.*itinakdang bilis/i,
    "/images/end of speed limit.webp",
  ],
  [/one way|iisang direksyon/i, "/images/one_way_traffic.webp"],
  [
    /two-way|two way|magkasalungat.*arrow/i,
    "/images/lto/signs/two-way-traffic.svg",
  ],
  [
    /merging traffic|sasanib.*trapiko/i,
    "/images/lto/signs/merging-traffic.svg",
  ],
  [
    /rough road|baku-bakong kalsada|bako-bakong kalsada/i,
    "/images/lto/signs/rough-road.svg",
  ],
  [/\briver\b|\bilog\b/i, "/images/lto/signs/river.svg"],
  [/no horn|bawal bumusina/i, "/images/lto/signs/no-horn.svg"],
  [
    /intersection warning|babala ng sanganda/i,
    "/images/lto/signs/intersection.svg",
  ],
  [/pwd|wheelchair|taong may kapansanan/i, "/images/wheelchair crossing.webp"],
  [
    /haligi ng tulay|black and yellow|itim at dilaw/i,
    "/images/lto/signs/bridge-hazard-marker.svg",
  ],
  [
    /animal crossing|tawiran ng hayop/i,
    "/images/lto/signs/animal-crossing.svg",
  ],
  [
    /flashing yellow|kumikislap na dilaw/i,
    "/images/lto/questions/flashing-yellow-traffic-light.svg",
  ],
  [
    /flashing red|kumikislap.*pula|umiindap.*pula/i,
    "/images/lto/questions/red-traffic-light.svg",
  ],
];

export function inferSignImage(
  question: string,
  answer: string,
): string | undefined {
  const asksAboutVisibleSign =
    /(\b(this|these)\b.*\b(sign|signal|traffic light|picture|image)\b|\b(sign|signal|traffic light|picture|image)\b.*\b(this|these)\b|ano.*\b(senyas|ilaw|larawan)\b.*\bito\b|\b(senyas|ilaw|larawan)\b.*\bito\b|alin .*nakalarawan|saan.*senyas|ano ang inilalarawan|which (traffic )?sign)/i.test(
      question,
    );
  if (!asksAboutVisibleSign) return undefined;
  // A correct answer may mention treating a failed signal "as a stop sign".
  // Only attach the STOP image when the prompt itself is actually about that sign.
  if (/\bstop sign\b|senyas na stop|senyas.*paghinto/i.test(question))
    return "/images/Stop_sign.webp";
  const searchable = `${question} ${answer}`;
  return rules.find(([pattern]) => pattern.test(searchable))?.[1];
}
