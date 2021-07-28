const express = require("express");
const fs = require("fs");
const https = require("https");
const app = express();
app.use(express.json());
app.use(express.static("public"));

// Load stuff used by Just Dance in general
const AliasDB = require("./cosmos-database/v1/cosmos-aliasdb.json");
const ItemDB = require("./cosmos-database/v1/cosmos-itemdb.json");
const AvatarDB = require("./cosmos-database/v1/cosmos-avatardb.json");
const LocaleID = require("./cosmos-database/v1/cosmos-localeid.json");

// Carousel
const PCPartyCar = require("./cosmos-database/v1/carousel/pc-cmos-partycar.json");
const EXPartyCar = require("./cosmos-database/v1/carousel/ex-cmos-partycar.json");

// Playlists (for Just Dance 2019)
const PlaylistDB = require("./cosmos-database/v1/cosmos-playlistdb.json");
const PlaylistCar = require("./cosmos-database/v1/carousel/con-cmos-playlistcar.json");

// Quest Mode
const QuestDB = require("./cosmos-database/v1/cosmos-questdb.json");
const QuestCar = require("./cosmos-database/v1/carousel/all-cmos-questcar.json");

// Add support for PC, Nintendo Switch, PlayStation 4, Xbox One and Wii U
const PCSongDB = require("./cosmos-database/v1/songdb/pc-cmos-songdb.json");
const NXSongDB = require("./cosmos-database/v1/songdb/nx-cmos-songdb.json");
const ORBISSongDB = require("./cosmos-database/v1/songdb/orbis-cmos-songdb.json");
const CAFESongDB = require("./cosmos-database/v1/songdb/cafe-cmos-songdb.json");
const DURANGOSongDB = require("./cosmos-database/v1/songdb/durango-cmos-songdb.json");
const PCPackages = require("./cosmos-database/v1/packages/pc-cmos-packages.json");
const NXPackages = require("./cosmos-database/v1/packages/nx-cmos-packages.json");
const ORBISPackages = require("./cosmos-database/v1/packages/orbis-cmos-packages.json");
const CAFEPackages = require("./cosmos-database/v1/packages/cafe-cmos-packages.json");
const DURANGOPackages = require("./cosmos-database/v1/packages/durango-cmos-packages.json");

// V1, V2 and V3
const v1 = require("./cosmos-server/v1/configuration.json");
const v2 = require("./cosmos-server/v2/entities.json");
const v3 = require("./cosmos-server/v3/users/1b5f3c8c-4072-4d13-af9e-f47d7a6e8021.json");

/// Other functions
// Pages
const HomeTiles = require("./cosmos-functions/v1/pages/home/tiles.json");
const CarouselPackages = require("./cosmos-functions/v1/pages/carousel/packages.json");
const UpsellVideos = require("./cosmos-functions/v1/pages/upsell-videos.json");

// Others
const DM = require("./cosmos-functions/v1/blocks.json");
const COM = require("./cosmos-functions/v1/com-videos-fullscreen.json");
const Ping = require("./cosmos-functions/v1/ping.json");
const SubsUpdate = require("./cosmos-functions/v1/subscription.json");
const SKUConstants = require("./cosmos-functions/v1/sku-constants.json");


// Variables
var CMOSToken = "xbl3.0 x=13133567362984495105;eyJlbmMiOiJBMTI4Q0JDK0hTMjU2IiwiYWxnIjoiUlNBLU9BRVAiLCJjdHkiOiJKV1QiLCJ6aXAiOiJERUYiLCJ4NXQiOiJIczVfRXFrQTdJdzJpU2lrRmRSanpGd2ZRUFkifQ.fmXcORdK6gbAsrujCA0lKjFSNz47YyFMHP-Upc7grDNg78qoxtH18hR4Wg8NrTekd8sITb73ii26_KO9jIUsIVskCItoibFgPiAwbqLuFoOtjkC8JarqofE-BSG401kuZEbVGShG8Ss1_tn8ZLmxCk-B1rkMvHXMN6orq3RiU1aPF-PVBNTpr4e9SMPHhoEpWaH9jAf6uuuHP5Nm1NapEQqTLcIsUg5nHHGbhl5nw9o5jUYZ8ewyvKaUWGly1AK3a1vEXEJ5LS6vkvPDKnCl36e4PVdXnPIF2v6dKaSDqnL8LTJsRbKPoj9Fr_t27bU_yT6OTFGAmXJikiFNhbZIUw.5O5iVv_CQE1kr16UdY-HYA.geHia7lHZBiq-hKtGLVntua9fNYfz-CSYDBkSTuzbUV6e3kN9r_uKJoDzZhamf1R5hgKm7Tl9MYlFVN-PcG9C5ieZRq08jCivqTFm42xb86OrNcQl4TkzJIcvCCcLOJzfZTwd-3dt9DktpQCjvb2X2fI_AjbFuxfjBZiT090cI8eB9zMg5JoPk5aMd8F0ENIKA_1RNMGOX2hX5g11_iyIYcVA4mudt9q7OYf3kMIljmVx-sUTf5pA8npyiv79cvOSejJccWp8d4-nGF6y4wddTNahpae7bKcJ6XCJ09MtnGaqnrY917iJq6NBmXD6wYFQUPQoVJZ4vimU1FywCJSl7PMugbDFRAwhrjAwg_U6KcxH27YnrhsrXBA9TEswhvntF2av0q6ycpFbZsBelejTavbu_HY6tpfu9x80j-fUjHy5Wu2e6r3JDaYXbd1gt-xkeRF3MiGp3KnW1c_WvX4fJexKyafXp6ANpRr2rNl5GipLc9PlqwMEjv3ghCZ4Dd0D0pVzBPcsbbx919sBjJSOoI3wK8GXghCMwy_SMLcC47hwQry08jYE1rXi5igU_EQLtx1zyr7RzTvmmvWvRBrdPMFz2sXVVYsS3UOMHbXwJRnDZOV5kD-3Rn6EpkDTxu_ZAR4vk4TP818407Dbt5Q3x4DkTzCz-6p_wVICOyOY2yHO6cpPp4ErBtg-iCqcoG-uzDr4BK3bRn362QbwyWvBX0TOJEwZ2Xh7myw1jACnl3QoR8gvpqymLorAUYBdLvkJsGb4Jj1DEIZe9AAbF6fUysr4bIBpF-eQovTE4vqjMy17sPzmXWFXWo5PKcC0DdcM4UMryMSPGEAIStl5pOmTfVMPEuDSX4cBlzXB6Omd5JUUwmTHBtf3Rb-fgQAgxU8THdw-a5_yVB7Xr_7HpKPWhI3FFphxAWCsyVS2u-wemhHJ_oqwavG_xIcmUyZZc6PgVFgTvtc4u_c66eevkP4sYmQPQ2LwcLMMihECUHKl3d2BiENl7crjIfI68Tex2o1sN0e5Ye6tDIGXFQzYbGDOpv_ArglgYZyciigmJoT5bJ6DziE274ZNMW1id2PStHYiZVcUbLOybzCECtVTBYXVB_VpeR1_Xb47IimVEcSDIao892Z5OzzBEQTxFjdKy6n1vdI0--tgCne8Zu_Geeahcq9nyp8uRlUsHXOaVIGHCLFrrKq4GxuAIoLbdrCUn6GqTQlHrmAA4qpu1gYI5EPQYZOkJ5KApIqfvUhwprdoEViZNvCLADU1fffYoxeYEBijhvJWc1gWAhOEqenaEu0O4JoEuFQtXt9klitUBrZQL9FRXAqBHqfGpsWNj_oUXMcyb7MGRxGyOrfBhLh_SbOMlzOnOPQUsIqXSvIURIPFgZpU0LWGrj1BPYVG_qdM26hb89ybGIV_2aqox8SQrv-cd5ggeLgl1WdDF8PkbpIYlwxLmyPhUNzeKqbMQRL7BGxhXMqHEJHbYE5fdY3QW5WB7cwesUss1Z6n4N5h8AUCXhiKB7N_Mld5lWQBxMVJAabzqIMDM0om7z1N_UYHEoZfA._TNAcCKpZVg2r5kjemyPxwF1yCKCOQxQRj_5y6i-0Rk"

// Just Dance Cosmos's core
var cosmos = {
    core: {
        requestcheck: function (request) {
            // PC, Switch, Switch, Switch, WiiU, WiiU, WiiU
            if (request.useragent.source == "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static" ||
                request.useragent.source == "UbiServices_SDK_HTTP_Client_4.2.21_NNX64" ||
                request.useragent.source == "UbiServices_SDK_HTTP_Client_2017.Final.4_SWITCH64" ||
                request.useragent.source == "UbiServices_SDK_2017.Final.28_SWITCH64" ||
                request.useragent.source == "UbiServices_SDK_HTTP_Client_2017.Final.4_WIIU" ||
                request.useragent.source == "UbiServices_SDK_2017.Final.28_WIIU" ||
                request.useragent.source == "UbiServices_SDK_HTTP_Client_4.2.9_WIIU" ||
                request.useragent.source == "UbiServices_SDK_HTTP_Client_3.2.1.148217_WIIU" ||
                request.useragent.source.includes("PS4") == true) {
                    return true
            }
            else
            {
                if (request.header("X-SkuId") == "jdex-cmos-pc" ||
                    request.header("X-SkuId") == "jdex-cmos-nx"||
                    request.header("X-SkuId") == "jdex-cmos-cafe" ||
                    request.header("X-SkuId") == "jd2017-cmos-pc" ||
                    request.header("X-SkuId") == "jd2018-ps4-scea" ||
                    request.header("X-SkuId") == "jd2017-nx-all" ||
                    request.header("X-SkuId") == "jd2018-nx-all" ||
                    request.header("X-SkuId") == "jd2019-nx-all" ||
                    request.header("X-SkuId") == "jd2016-wiiu-noa" ||
                    request.header("X-SkuId") == "jd2017-wiiu-noa" ||
                    request.header("X-SkuId") == "jd2018-wiiu-noa" ||
                    request.header("X-SkuId") == "jd2019-wiiu-noa" ||
                    request.url == "/songdb/v2/songs")
                {
                    return true;
                } 
                else
                {
                    return 403;
                }
            }
        }
    }
}

// Makes security checks
app.use((req, res, next) => {
    if (cosmos.core.requestcheck(req) == true) {
        return next();
    } else {
        return res.send(cosmos.core.requestcheck(req));
    }
})

// Playlists
app.get("/playlistdb/v1/playlists", function (request, response) {
    response.send(PlaylistDB);
});
app.post("/carousel/v2/pages/jd2019-playlists", (request, response) => {
    response.send(PlaylistCar);
});

// SKU Packages
app.get("/packages/:version/sku-packages", function (request, response) {
    if (cosmos.core.requestcheck(request) == true) {
        if (request.useragent.source == "UbiServices_SDK_2017.Final.28_SWITCH64" ||
            request.header("X-SkuId") == "jd2018-nx-all" ||
	        request.header("X-SkuId") == "jd2019-nx-all" ||
            request.header("X-SkuId") == "jd2017-nx-all") {
            response.send(NXPackages);
        } else {
            if (request.useragent.source == "UbiServices_SDK_HTTP_Client_2017.Final.4_WIIU" ||
                request.useragent.source == "UbiServices_SDK_2017.Final.28_WIIU" ||
                request.useragent.source == "UbiServices_SDK_HTTP_Client_4.2.9_WIIU") {
                response.send(CAFEPackages);
            }
            if (request.useragent.source == "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static" &&
                request.header("X-SkuId") == "jd2017-cmos-pc") {
                response.send(PCPackages)
            }
            if (request.useragent.source.includes("PS4") == true) {
                response.send(ORBISPackages);
            }
        }
    } else {
        response.sendStatus(cosmos.core.requestcheck(request));
    }
});

// SongDBs
app.get("/songdb/:version/songs", function (request, response) {
    if (request.useragent.source == "UbiServices_SDK_2017.Final.28_SWITCH64" ||
        request.header("X-SkuId") == "jd2018-nx-all" ||
        request.header("X-SkuId") == "jd2019-nx-all" ||
        request.header("X-SkuId") == "jd2017-nx-all") {
        response.send(NXSongDB);
    }
    if (request.useragent.source ==
        "UbiServices_SDK_HTTP_Client_2017.Final.4_WIIU" ||
        request.useragent.source == "UbiServices_SDK_2017.Final.28_WIIU" ||
        request.useragent.source == "UbiServices_SDK_HTTP_Client_4.2.9_WIIU") {
        response.send(CAFESongDB);
    }
    if (request.useragent.source.includes("PS4") == true) {
        response.send(ORBISSongDB);
    }
    if (request.useragent.source == "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static" ||
        request.header("X-SkuId") == "jd2017-cmos-pc") {
        if (request.header("X-SkuId") == "jdex-cmos-pc") {
            songdb = JSON.parse(JSON.stringify(PCSongDB));
            for (var song in songdb) {
                // skip loop if the property is from prototype
                var obj = songdb[song];
                obj.assets["banner_bkgImageUrl"] = obj.assets["map_bkgImageUrl"];
            }
            return response.send(songdb);
        }
        else {
            return response.send(PCSongDB);
        }
    }
});

// LocaleIDs
app.get("/songdb/v1/localisation", function(request, response) {
    response.send(LocaleID);
});

// Quests
app.get("/questdb/v1/quests", function(request, response) {
    response.send(QuestDB);
});
app.get("/session-quest/v1/", function (request, response) {
    response.send('{ "__class": "SessionQuestService::QuestData", "newReleases": [] }');
});
app.post("/carousel/v2/pages/quests", function (request, response) {
    response.send(QuestCar);
});

// Aliases
app.get("/aliasdb/v1/aliases", function (request, response) {
    response.send(AliasDB);
});

// Home Tiles
app.post("/home/v1/tiles", function (request, response) {
    response.send(HomeTiles);
});

// No HUDs (optimized)
app.get('/content-authorization/v1/maps/:map', function(request, response) {
    if (cosmos.core.requestcheck(request) == true) {
        if (request.params.map) {
            var path = "./cosmos-database/v1/content-authorization/"
            if (fs.existsSync(path + request.params.map + ".json")) {
                fs.readFile(path + request.params.map + ".json", function(err, data) {
                    if (err) throw err;
                    if (data) {
                        var strdata = JSON.parse(data),
                            pardata = JSON.stringify(strdata);
                        response.send(pardata)
                    }
                })
            }
            else {
                response.send("Forbidden")
            }
        }
    }
  });

// Favorites
app.put("/profile/v2/favorites/maps/:map", function (req, res) {
    var auth = req.header("Authorization");
    var json = JSON.stringify(req.body);
    const httpsopts = {
      hostname: "prod.just-dance.com",
      port: 443,
      path: "/profile/v2/favorites/maps/" + req.params.map,
      method: "PUT",
      headers: {
        "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
        Accept: "*/*",
        Authorization: auth,
        "Content-Type": "application/json",
        "X-SkuId": "jd2017-pc-ww"
      }
    };
    redirect(httpsopts, json, function(redResponse) {
      res.send(redResponse);
      console.log(redResponse);
    });
  });
  
  app.delete("/profile/v2/favorites/maps/:map", (req, res) => {
    var auth = req.header("Authorization");
    var json = JSON.stringify(req.body);
    const httpsopts = {
      hostname: "prod.just-dance.com",
      port: 443,
      path: "/profile/v2/favorites/maps/" + req.params.map,
      method: "DELETE",
      headers: {
        "User-Agent": "UbiServices_SDK_HTTP_Client_4.2.9_PC32_ansi_static",
        Accept: "*/*",
        "Accept-Language": "en-us,en",
        Authorization: auth,
        "Content-Type": "application/json",
        "X-SkuId": "jd2017-pc-ww"
      }
    };
    redirect(httpsopts, json, function(redResponse) {
      res.send(redResponse);
      console.log(redResponse);
    });
});

//Add statistics to the server
function addStats(codename) {
    fs.readFile("./cosmos-stats/played-songs/alltime.json", "utf-8", function(err, data) {
      if (err) throw err;
      var arrayOfObjects = JSON.parse(data);
      arrayOfObjects[codename] = arrayOfObjects[codename] + 1;
      fs.writeFile("./cosmos-stats/played-songs/alltime.json", JSON.stringify(arrayOfObjects), "utf-8", function(err) {
          if (err) throw err;
          console.log("All-time stats of " + codename + " changed");
        }
      );
    });
    fs.readFile("./cosmos-stats/played-songs/total.json", "utf-8", function(err, data) {
      if (err) throw err;
      var arrayOfObjects = JSON.parse(data);
      arrayOfObjects["total"] = arrayOfObjects["total"] + 1;
      fs.writeFile("./cosmos-stats/played-songs/total.json", JSON.stringify(arrayOfObjects), "utf-8", function(err) {
          if (err) throw err;
          console.log("Total stats of " + codename + " changed");
        }
      );
    });
  }
  