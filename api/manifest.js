module.exports = (req, res) => {
  const manifest = {
    id: "org.directhls",
    version: "1.0.0",
    name: "Direct HLS (Perso)",
    description: "Addon Stremio simple pour lire vos liens HLS/m3u8 légaux",
    catalogs: [
      {
        type: "movie",
        id: "direct_hls",
        name: "Direct HLS Movies"
      }
    ],
    resources: ["catalog", "meta", "stream"],
    types: ["movie"],
    idPrefixes: ["directhls_"]
  };

  res.setHeader("Content-Type", "application/json");
  res.statusCode = 200;
  res.end(JSON.stringify(manifest));
};
