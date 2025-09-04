// === Catalogue d'exemple (à personnaliser) ===
const catalogData = [
  {
    id: "directhls_f1",
    type: "movie",
    name: "F1 (Le Film)",
    poster: "https://fr.web.img3.acsta.net/r_1920_1080/img/b1/78/b178318cb7be01b706863ca6c40a5d89.jpg",
    description: "Sonny Hayes était le prodige de la F1 des années 90 jusqu’à son terrible accident. Trente ans plus tard, devenu un pilote indépendant, il est contacté par Ruben Cervantes, patron d’une écurie en faillite qui le convainc de revenir pour sauver l’équipe et prouver qu’il est toujours le meilleur. Aux côtés de Joshua Pearce, diamant brut prêt à devenir le numéro 1, Sonny réalise vite qu'en F1, son coéquipier est aussi son plus grand rival, que le danger est partout et qu'il risque de tout perdre.",
    stream: "https://pulse.topstrime.online/movie/911430/xjycgu/master.m3u8"
  },
  {
    id: "directhls_angel",
    type: "movie",
    name: "Angel One (demo HLS)",
    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Film_reel_icon.svg/512px-Film_reel_icon.svg.png",
    description: "Vidéo de démo HLS (usage test).",
    stream: "https://storage.googleapis.com/shaka-demo-assets/angel-one-hls/hls.m3u8"
  }
];

// Helpers
function sendJSON(res, obj, status = 200) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.statusCode = status;
  res.end(JSON.stringify(obj));
}

function stripJson(s) {
  return s.replace(/\.json$/, "");
}

// Router principal

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    return res.end();
  }


  
  const url = new URL(req.url, "http://localhost"); // base fictive pour parser
  // Sur Vercel, nos fonctions vivent sous /api/* → on retire ce préfixe
  const path = url.pathname.replace(/^\/api/, "");
  const parts = path.split("/").filter(Boolean); // ex: ["catalog","movie","direct_hls.json"]

  if (!parts.length) return sendJSON(res, { err: "No route" }, 404);

  const [resource] = parts;

  // /catalog/:type/:id.json
  if (resource === "catalog") {
    const type = parts[1];            // "movie"
    const catalogId = stripJson(parts[2] || ""); // "direct_hls"
    if (type !== "movie" || catalogId !== "direct_hls")
      return sendJSON(res, { metas: [] });

    const metas = catalogData.map(({ id, name, poster, type, description }) => ({
      id,
      type: type || "movie",
      name,
      poster,
      description
    }));

    return sendJSON(res, { metas });
  }

  // /meta/:type/:id.json
  if (resource === "meta") {
    const id = stripJson(parts[2] || "");
    const item = catalogData.find(x => x.id === id);
    if (!item) return sendJSON(res, { err: "Not found" }, 404);

    const meta = {
      id: item.id,
      type: item.type || "movie",
      name: item.name,
      poster: item.poster,
      description: item.description
    };

    return sendJSON(res, { meta });
  }

  // /stream/:type/:id.json
  if (resource === "stream") {
    const id = stripJson(parts[2] || "");
    const item = catalogData.find(x => x.id === id);
    if (!item) return sendJSON(res, { streams: [] });

    const streams = [
      {
        title: "Direct HLS",
        url: item.stream
        // Optionnel: behaviorHints, subtitles, etc.
      }
    ];

    return sendJSON(res, { streams });
  }

  return sendJSON(res, { err: "Unknown route" }, 404);
};
